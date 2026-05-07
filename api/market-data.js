const fs = require("fs");
const path = require("path");
const { fetchPublicDividendPageData } = require("../lib/stockanalysis-dividends");
const { fetchNigeriaPublicDividendData } = require("../lib/nigeria-public-dividends");
const { fetchVerifiedRsiFallbackHistory } = require("../lib/verified-rsi-sources");
const { loadStockUniverse } = require("../lib/_stock-universe");

const verifiedRsiCachePath = path.join(__dirname, "..", "verified-rsi-cache.json");
let verifiedRsiCacheState = { mtimeMs: 0, data: {} };

const quoteSuffix = {
  US: "us",
  UK: "uk",
  Canada: "ca",
  Europe: "de",
  Asia: "jp"
};

const yahooSymbolOverrides = {
  "Europe:NVS": "NOVN.SW",
  "Europe:SAP": "SAP.DE",
  "Europe:TTE": "TTE.PA",
  "Europe:SAN": "SAN.MC",
  "Europe:UBS": "UBSG.SW",
  "Europe:ASML": "ASML.AS",
  "Europe:UL": "UL",
  "Europe:RIO": "RIO.L",
  "UK:BUNZL": "BNZL.L",
  "UK:BDEV": "BTRW.L",
  "Canada:CNI": "CNR.TO",
  "Canada:GIB": "GIB-A.TO",
  "Asia:TM": "7203.T",
  "Asia:MUFG": "8306.T",
  "Asia:TSM": "TSM",
  "Asia:HDB": "HDB",
  "Asia:INFY": "INFY",
  "Asia:SONY": "6758.T",
  "Asia:JD": "JD",
  "Asia:BABA": "BABA",
  "Asia:CHT": "CHT",
  "Asia:TAK": "TAK",
  "Asia:KB": "KB",
  "Asia:SMFG": "SMFG"
};

let stockNameLookup = null;
const ngxPulseQuoteCache = new Map();

const CORPORATE_NAME_STOP_WORDS = new Set([
  "adr",
  "ag",
  "and",
  "bank",
  "co",
  "company",
  "corp",
  "corporation",
  "cv",
  "de",
  "group",
  "holdings",
  "inc",
  "incorporated",
  "limited",
  "ltd",
  "n",
  "nv",
  "p",
  "pcl",
  "plc",
  "s",
  "sa",
  "sab",
  "se",
  "services",
  "the"
]);

function loadVerifiedRsiCache() {
  try {
    const stat = fs.statSync(verifiedRsiCachePath);
    if (verifiedRsiCacheState.mtimeMs === stat.mtimeMs && verifiedRsiCacheState.data) {
      return verifiedRsiCacheState.data;
    }
    const parsed = JSON.parse(fs.readFileSync(verifiedRsiCachePath, "utf8"));
    verifiedRsiCacheState = {
      mtimeMs: stat.mtimeMs,
      data: parsed?.data && typeof parsed.data === "object" ? parsed.data : parsed || {}
    };
  } catch {
    verifiedRsiCacheState = { mtimeMs: 0, data: {} };
  }
  return verifiedRsiCacheState.data;
}

function verifiedRsiCacheEntry(ticker, market) {
  return loadVerifiedRsiCache()[`${market}:${ticker}`] || null;
}

function loadStockNameLookup() {
  if (stockNameLookup) return stockNameLookup;
  try {
    const { stocks } = loadStockUniverse();
    stockNameLookup = new Map(
      [...new Map(stocks.map((stock) => [`${stock.market}:${stock.ticker}`, stock])).values()]
        .map((stock) => [`${stock.market}:${stock.ticker}`, String(stock.name || "").trim()])
    );
  } catch {
    stockNameLookup = new Map();
  }
  return stockNameLookup;
}

function stockCompanyName(ticker, market) {
  return loadStockNameLookup().get(`${market}:${ticker}`) || "";
}

function latestPriceFromHistory(history = [], provider = "") {
  const rows = Array.isArray(history) ? history.filter((row) => Number.isFinite(Number(row?.close)) && Number(row.close) > 0) : [];
  if (!rows.length) return null;
  const latest = rows[rows.length - 1];
  return {
    price: Number(latest.close),
    date: String(latest.date || ""),
    time: "",
    provider
  };
}

function stooqSymbol(ticker, market) {
  const clean = String(ticker || "").replace(/\./g, "").toLowerCase();
  const suffix = quoteSuffix[market];
  return clean && suffix ? `${clean}.${suffix}` : "";
}

function parseCsvLine(line) {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

function yahooSymbol(ticker, market) {
  const override = yahooSymbolOverrides[`${market}:${ticker}`];
  if (override) return override;
  const clean = String(ticker || "").replace(/\s+/g, "-");
  if (market === "US") return clean;
  if (market === "UK") return `${clean.replace(".", "-")}.L`;
  if (market === "Canada") return `${clean.replace(".", "-")}.TO`;
  if (market === "Europe") return `${clean.replace(".", "-")}.DE`;
  if (market === "Asia") return `${clean.replace(".", "-")}.T`;
  return "";
}

function uniqueSymbols(...symbols) {
  return [...new Set(symbols.map((symbol) => String(symbol || "").trim()).filter(Boolean))];
}

function yahooSymbolCandidates(ticker, market) {
  const clean = String(ticker || "").trim().replace(/\s+/g, "-");
  const normalized = clean.replace(/\./g, "-");
  return uniqueSymbols(
    yahooSymbolOverrides[`${market}:${ticker}`],
    yahooSymbol(ticker, market),
    market === "Canada" ? `${normalized}.TO` : "",
    market === "UK" ? `${normalized}.L` : "",
    market === "Europe" ? `${normalized}.DE` : "",
    market === "Asia" ? `${normalized}.T` : "",
    clean
  );
}

function normalizeCompanyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token && !CORPORATE_NAME_STOP_WORDS.has(token));
}

function namesLikelyMatch(expectedName, actualName) {
  if (!expectedName || !actualName) return true;
  const expectedTokens = normalizeCompanyName(expectedName);
  const actualTokens = normalizeCompanyName(actualName);
  if (!expectedTokens.length || !actualTokens.length) return true;
  const expectedJoined = expectedTokens.join(" ");
  const actualJoined = actualTokens.join(" ");
  const expectedCompact = expectedJoined.replace(/\s+/g, "");
  const actualCompact = actualJoined.replace(/\s+/g, "");
  const actualAcronym = actualTokens.map((token) => token[0] || "").join("");
  const expectedAcronym = expectedTokens.map((token) => token[0] || "").join("");
  if (
    expectedJoined === actualJoined
    || expectedJoined.includes(actualJoined)
    || actualJoined.includes(expectedJoined)
    || expectedCompact === actualCompact
    || expectedCompact.includes(actualCompact)
    || actualCompact.includes(expectedCompact)
    || expectedCompact === actualAcronym
    || actualCompact === expectedAcronym
  ) {
    return true;
  }
  const actualSet = new Set(actualTokens);
  const overlap = expectedTokens.filter((token) => actualSet.has(token)).length;
  return overlap / Math.min(expectedTokens.length, actualTokens.length) >= 0.5;
}

function yahooRange(interval) {
  if (interval === "d") return { range: "1mo", interval: "1d" };
  if (interval === "w") return { range: "6mo", interval: "1wk" };
  return { range: "1y", interval: "1mo" };
}

function currentIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeQuoteDate(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function quoteSortKey(quote = {}) {
  const date = normalizeQuoteDate(quote.date);
  const time = String(quote.time || "").trim().slice(0, 5);
  return `${date}T${time || "00:00"}`;
}

function isQuoteStaleForToday(quote = {}) {
  const date = normalizeQuoteDate(quote.date);
  return Boolean(date) && date < currentIsoDate();
}

function chooseFresherQuote(primary, candidate) {
  if (!candidate) return primary || null;
  if (!primary) return candidate;
  const primaryKey = quoteSortKey(primary);
  const candidateKey = quoteSortKey(candidate);
  if (candidateKey > primaryKey) return candidate;
  if (candidateKey === primaryKey) {
    const primaryProvider = String(primary.provider || "").toLowerCase();
    const candidateProvider = String(candidate.provider || "").toLowerCase();
    if (primaryProvider.includes("stooq") && candidateProvider.includes("yahoo")) {
      return candidate;
    }
  }
  return primary;
}

function yahooLiveSnapshot(meta = {}) {
  const snapshots = [
    {
      price: Number(meta.postMarketPrice),
      timestamp: Number(meta.postMarketTime),
      label: "Yahoo post-market quote"
    },
    {
      price: Number(meta.preMarketPrice),
      timestamp: Number(meta.preMarketTime),
      label: "Yahoo pre-market quote"
    },
    {
      price: Number(meta.regularMarketPrice),
      timestamp: Number(meta.regularMarketTime),
      label: "Yahoo delayed quote"
    }
  ].filter((entry) => Number.isFinite(entry.price) && entry.price > 0 && Number.isFinite(entry.timestamp) && entry.timestamp > 0)
    .sort((a, b) => b.timestamp - a.timestamp);
  return snapshots[0] || null;
}

function calculateRsi(values, period = 14) {
  const prices = Array.isArray(values) ? values.map(Number).filter((value) => Number.isFinite(value) && value > 0) : [];
  if (prices.length < period + 1) return null;
  const changes = prices.slice(1).map((price, index) => price - prices[index]).slice(-period);
  const gains = changes.map((change) => Math.max(change, 0));
  const losses = changes.map((change) => Math.max(-change, 0));
  const averageGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
  const averageLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
  if (averageGain === 0 && averageLoss === 0) return 50;
  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - (100 / (1 + relativeStrength));
}

function verifiedRsiFromHistory(history = [], provider = "") {
  const closes = Array.isArray(history)
    ? history.map((row) => Number(row?.close)).filter((value) => Number.isFinite(value) && value > 0)
    : [];
  if (closes.length < 15) return null;
  const rsi = calculateRsi(closes, 14);
  if (!Number.isFinite(rsi)) return null;
  const value = Math.round(rsi);
  return {
    value,
    label: value >= 70 ? "Overbought" : value <= 30 ? "Oversold" : "Neutral",
    status: "Verified",
    provider: provider || "Live daily history",
    closesCount: closes.length,
    verifiedAt: new Date().toISOString()
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function liquidityLabelForScore(score) {
  return score >= 61 ? "High" : score >= 31 ? "Moderate" : "Low";
}

function liquidityNoteForScore(score) {
  if (score >= 61) return "Usually easier to buy and sell with tighter spreads on major platforms.";
  if (score >= 31) return "Tradable, but check spreads, order size, settlement timing, and platform availability.";
  return "Can be harder to trade quickly; use limit orders and check local broker liquidity before buying.";
}

function averageMetric(values = []) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value) && value >= 0);
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function baseLiquidityScoreForMarket(market) {
  const marketBase = {
    US: 48,
    UK: 42,
    Canada: 39,
    Europe: 36,
    Asia: 33,
    Nigeria: 24,
    Zimbabwe: 18
  };
  return marketBase[market] || 32;
}

function computeLiquidityPayload(ticker, market, quote = null, historyRows = []) {
  const rows = Array.isArray(historyRows)
    ? historyRows.filter((row) => Number.isFinite(Number(row?.close)) && Number(row.close) > 0)
    : [];
  const volumeRows = rows.filter((row) => Number.isFinite(Number(row?.volume)) && Number(row.volume) > 0);
  const avgVolume = averageMetric(volumeRows.map((row) => row.volume));
  const avgNotional = averageMetric(volumeRows.map((row) => Number(row.volume) * Number(row.close)));
  const quoteVolume = Number(quote?.volume);
  const livePrice = Number.isFinite(Number(quote?.price)) && Number(quote.price) > 0 ? Number(quote.price) : 0;
  const latestNotional = Number.isFinite(quoteVolume) && quoteVolume > 0 && livePrice > 0
    ? quoteVolume * livePrice
    : 0;
  const effectiveVolume = avgVolume > 0 ? avgVolume : (Number.isFinite(quoteVolume) && quoteVolume > 0 ? quoteVolume : 0);
  const effectiveNotional = avgNotional > 0 ? avgNotional : latestNotional;
  if (!(effectiveVolume > 0 || effectiveNotional > 0)) return null;

  let score = baseLiquidityScoreForMarket(market);
  if (effectiveNotional >= 1000000000) score += 38;
  else if (effectiveNotional >= 250000000) score += 33;
  else if (effectiveNotional >= 100000000) score += 28;
  else if (effectiveNotional >= 25000000) score += 21;
  else if (effectiveNotional >= 5000000) score += 14;
  else if (effectiveNotional >= 1000000) score += 9;
  else if (effectiveNotional >= 250000) score += 5;
  else if (effectiveNotional >= 50000) score += 1;
  else score -= 6;

  if (effectiveVolume >= 10000000) score += 8;
  else if (effectiveVolume >= 1000000) score += 5;
  else if (effectiveVolume >= 250000) score += 2;
  else if (effectiveVolume < 10000) score -= 4;

  if (volumeRows.length >= 20) score += 4;
  else if (volumeRows.length >= 5) score += 2;
  else if (Number.isFinite(quoteVolume) && quoteVolume > 0) score -= 1;
  else score -= 4;

  const roundedScore = clamp(Math.round(score), 15, 98);
  return {
    score: roundedScore,
    label: liquidityLabelForScore(roundedScore),
    note: liquidityNoteForScore(roundedScore),
    source: volumeRows.length >= 5
      ? "Live trading volume and turnover"
      : Number.isFinite(quoteVolume) && quoteVolume > 0
        ? "Current trading volume"
        : "Market liquidity proxy",
    avgDailyVolume: Math.round(effectiveVolume),
    avgDailyValue: Number(effectiveNotional.toFixed(2)),
    updatedAt: new Date().toISOString(),
    status: "Live"
  };
}

function dividendCurrencyForMarket(market) {
  if (market === "UK") return "GBp";
  if (market === "Canada") return "CAD";
  if (market === "Europe") return "EUR";
  if (market === "Asia") return "JPY";
  if (market === "US") return "USD";
  return "";
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "dividend-tracker/1.0" }
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; DividendStockTracker/1.0; +https://dividendstocktracker.vercel.app)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    if (!response.ok) return "";
    return response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

function extractAssignedJson(html, variableName) {
  const marker = `window.${variableName}`;
  const start = String(html || "").indexOf(marker);
  if (start < 0) return null;
  const equalsIndex = html.indexOf("=", start);
  const objectStart = html.indexOf("{", equalsIndex);
  if (equalsIndex < 0 || objectStart < 0) return null;
  let depth = 0;
  let quote = "";
  for (let index = objectStart; index < html.length; index += 1) {
    const char = html[index];
    if (quote) {
      if (char === "\\") {
        index += 1;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") {
      depth += 1;
      continue;
    }
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(objectStart, index + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function ngxPulseTradeDate(value) {
  const date = new Date(value || "");
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

function normalizeNgxDividendRows(dividends) {
  const rows = Array.isArray(dividends) ? dividends : dividends ? [dividends] : [];
  return rows.map((row) => ({
    exDate: cleanDate(row.ex_dividend_date || row.exDate || row.date || ""),
    recordDate: cleanDate(row.record_date || row.recordDate || ""),
    payDate: cleanDate(row.pay_date || row.payDate || ""),
    amount: cleanAmount(row.dividend_per_share || row.amount || 0),
    currency: String(row.currency || "NGN").trim().toUpperCase() || "NGN"
  })).filter((row) => row.exDate || row.recordDate || row.payDate || row.amount > 0);
}

function annualDividendFromNgxRows(rows = []) {
  if (!Array.isArray(rows) || !rows.length) return 0;
  const latestTime = Math.max(...rows.map((row) => Date.parse(`${row.exDate || row.recordDate || row.payDate || "1970-01-01"}T00:00:00Z`) || 0));
  if (!latestTime) return 0;
  const oneYearMs = 370 * 24 * 60 * 60 * 1000;
  const total = rows
    .filter((row) => {
      const eventTime = Date.parse(`${row.exDate || row.recordDate || row.payDate || "1970-01-01"}T00:00:00Z`) || 0;
      return eventTime > 0 && (latestTime - eventTime) <= oneYearMs;
    })
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return Number(total.toFixed(4));
}

async function fetchNgxPulseNigeriaQuote(ticker, companyName = "") {
  const symbol = String(ticker || "").trim().toUpperCase();
  if (!symbol) return null;
  const cached = ngxPulseQuoteCache.get(symbol);
  const now = Date.now();
  if (cached && now - cached.cachedAt < 60 * 1000) {
    return cached.payload;
  }

  const html = await fetchText(`https://ngxpulse.ng/stocks/${encodeURIComponent(symbol)}`);
  if (!html) return null;
  const stock = extractAssignedJson(html, "__SSR_STOCK__");
  if (!stock || String(stock.symbol || "").trim().toUpperCase() !== symbol) return null;
  const fundamentals = extractAssignedJson(html, "__SSR_FUNDAMENTALS__");
  const dividends = extractAssignedJson(html, "__SSR_DIVIDENDS__");
  const dividendRows = normalizeNgxDividendRows(dividends);
  const annualDividend = annualDividendFromNgxRows(dividendRows);
  const livePrice = Number(stock.current_price);
  const eps = Number(fundamentals?.eps);
  const payoutRatio = annualDividend > 0 && Number.isFinite(eps) && eps > 0
    ? Number(((annualDividend / eps) * 100).toFixed(2))
    : 0;
  const computedYield = annualDividend > 0 && Number.isFinite(livePrice) && livePrice > 0
    ? Number(((annualDividend / livePrice) * 100).toFixed(2))
    : 0;
  const payload = Number.isFinite(livePrice) && livePrice > 0 ? {
    price: livePrice,
    date: ngxPulseTradeDate(stock.trade_date),
    time: "",
    provider: "NGX Pulse live quote",
    volume: Number(stock.volume) > 0 ? Number(stock.volume) : 0,
    marketCap: Number(stock.market_cap) > 0 ? Number(stock.market_cap) : 0,
    sector: String(stock.sector || "").trim(),
    annualDividend: annualDividend > 0 ? annualDividend : 0,
    dividendYield: Number.isFinite(Number(fundamentals?.dividend_yield)) && Number(fundamentals.dividend_yield) > 0
      ? Number(fundamentals.dividend_yield)
      : computedYield,
    payoutRatio,
    eps: Number.isFinite(eps) && eps > 0 ? eps : 0,
    peRatio: Number.isFinite(Number(fundamentals?.pe_ratio)) && Number(fundamentals.pe_ratio) > 0 ? Number(fundamentals.pe_ratio) : 0,
    pbRatio: Number.isFinite(Number(fundamentals?.pb_ratio)) && Number(fundamentals.pb_ratio) > 0 ? Number(fundamentals.pb_ratio) : 0,
    roe: Number.isFinite(Number(fundamentals?.roe)) ? Number(fundamentals.roe) : NaN,
    profitMargin: Number.isFinite(Number(fundamentals?.profit_margin)) ? Number(fundamentals.profit_margin) : NaN,
    debtEquity: Number.isFinite(Number(fundamentals?.debt_equity)) ? Number(fundamentals.debt_equity) : NaN,
    businessDescription: String(stock.description || companyName || "").trim()
  } : null;

  ngxPulseQuoteCache.set(symbol, { cachedAt: now, payload });
  return payload;
}

async function fetchQuote(symbol) {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlcv&h&e=csv`;
  const response = await fetch(url, { headers: { "user-agent": "dividend-tracker/1.0" } });
  if (!response.ok) return null;
  const rows = (await response.text()).trim().split(/\r?\n/);
  if (rows.length < 2) return null;
  const values = parseCsvLine(rows[1]);
  const close = Number(values[6]);
  if (!Number.isFinite(close) || close <= 0) return null;
  const volume = Number(values[7]);
  return {
    price: close,
    date: values[1],
    time: values[2],
    provider: "Stooq delayed quote",
    volume: Number.isFinite(volume) && volume > 0 ? volume : 0
  };
}

async function fetchHistory(symbol, interval = "d") {
  const safeInterval = ["d", "w", "m"].includes(interval) ? interval : "d";
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=${safeInterval}`;
  const response = await fetch(url, { headers: { "user-agent": "dividend-tracker/1.0" } });
  if (!response.ok) return [];
  const rows = (await response.text()).trim().split(/\r?\n/).slice(1);
  return rows.map((line) => {
    const [date, open, high, low, close, volume] = parseCsvLine(line);
    const parsedVolume = Number(volume);
    return {
      date,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number.isFinite(parsedVolume) && parsedVolume > 0 ? parsedVolume : 0
    };
  }).filter((row) => Number.isFinite(row.close) && row.close > 0).slice(-120);
}

async function fetchYahooChart(ticker, market, interval = "d", companyName = "") {
  const range = yahooRange(interval);
  const expectedName = companyName || stockCompanyName(ticker, market);
  for (const symbol of yahooSymbolCandidates(ticker, market)) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range.range}&interval=${range.interval}`;
    const response = await fetch(url, { headers: { "user-agent": "dividend-tracker/1.0" } });
    if (!response.ok) continue;
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const sourceName = result?.meta?.longName || result?.meta?.shortName || "";
    if (!namesLikelyMatch(expectedName, sourceName)) continue;
    const liveSnapshot = yahooLiveSnapshot(result?.meta || {});
    if (!liveSnapshot) continue;
    const price = liveSnapshot.price;
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const volumes = result.indicators?.quote?.[0]?.volume || [];
    const history = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: Number(closes[index]),
      volume: Number.isFinite(Number(volumes[index])) && Number(volumes[index]) > 0 ? Number(volumes[index]) : 0
    })).filter((row) => Number.isFinite(row.close) && row.close > 0).slice(-120);
    const latestVolume = Number(result?.meta?.regularMarketVolume)
      || [...history].reverse().find((row) => Number.isFinite(Number(row.volume)) && Number(row.volume) > 0)?.volume
      || 0;
    return {
      price,
      date: liveSnapshot.timestamp
        ? new Date(liveSnapshot.timestamp * 1000).toISOString().slice(0, 10)
        : "",
      time: liveSnapshot.timestamp
        ? new Date(liveSnapshot.timestamp * 1000).toISOString().slice(11, 16)
        : "",
      provider: liveSnapshot.label,
      volume: Number.isFinite(Number(latestVolume)) && Number(latestVolume) > 0 ? Number(latestVolume) : 0,
      history
    };
  }
  return null;
}

async function fetchYahooDailyHistory(ticker, market, companyName = "") {
  const expectedName = companyName || stockCompanyName(ticker, market);
  for (const symbol of yahooSymbolCandidates(ticker, market)) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`;
    const response = await fetch(url, { headers: { "user-agent": "dividend-tracker/1.0" } });
    if (!response.ok) continue;
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const sourceName = result?.meta?.longName || result?.meta?.shortName || "";
    if (!namesLikelyMatch(expectedName, sourceName)) continue;
    const timestamps = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];
    const volumes = result?.indicators?.quote?.[0]?.volume || [];
    const rows = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: Number(closes[index]),
      volume: Number.isFinite(Number(volumes[index])) && Number(volumes[index]) > 0 ? Number(volumes[index]) : 0
    })).filter((row) => Number.isFinite(row.close) && row.close > 0).slice(-90);
    if (rows.length >= 15) return rows;
  }
  return [];
}

function cleanDate(value) {
  if (!value || value === "0000-00-00") return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

function cleanAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function dividendRowsFromProvider(rows, provider) {
  if (!Array.isArray(rows)) return null;
  const normalizedRows = rows.map((row) => {
    const exDate = cleanDate(row.exDividendDate || row.ex_dividend_date || row.ex_date || row.exDate || row.date);
    const recordDate = cleanDate(row.recordDate || row.record_date);
    const payDate = cleanDate(row.paymentDate || row.payDate || row.pay_date || row.payment_date || row.payable_date);
    const declarationDate = cleanDate(row.declarationDate || row.declaredDate || row.declaration_date);
    const amount = cleanAmount(row.dividend || row.adjDividend || row.amount || row.cash_amount || row.cashAmount || row.cashAmountPerShare);
    return { exDate, recordDate, payDate, declarationDate, amount };
  }).filter((row) => row.exDate || row.payDate || row.amount > 0)
    .sort((a, b) => {
      const aDate = new Date(a.exDate || a.payDate || 0).getTime();
      const bDate = new Date(b.exDate || b.payDate || 0).getTime();
      return bDate - aDate;
    });

  if (!normalizedRows.length) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const nextDeclared = normalizedRows
    .slice()
    .sort((a, b) => new Date(a.exDate || a.payDate) - new Date(b.exDate || b.payDate))
    .find((row) => row.exDate && new Date(`${row.exDate}T00:00:00Z`) >= today);
  const latest = normalizedRows[0];

  return {
    provider,
    verifiedAt: new Date().toISOString(),
    exDate: nextDeclared?.exDate || "",
    recordDate: nextDeclared?.recordDate || "",
    payDate: nextDeclared?.payDate || "",
    declarationDate: nextDeclared?.declarationDate || "",
    amount: nextDeclared?.amount || latest.amount || 0,
    history: normalizedRows.slice(0, 12),
    nextDeclared: Boolean(nextDeclared),
    note: nextDeclared
      ? "Upcoming declared dividend date verified from provider data."
      : "Recent dividend payout history verified; next qualification/payment date was not declared by the provider."
  };
}

async function fetchFmpDividends(symbol) {
  const key = process.env.FMP_API_KEY || process.env.FINANCIAL_MODELING_PREP_API_KEY;
  if (!key) return null;
  const url = `https://financialmodelingprep.com/stable/dividends?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
  const data = await fetchJson(url);
  return dividendRowsFromProvider(data, "Financial Modeling Prep");
}

async function fetchAlphaVantageDividends(symbol) {
  const key = process.env.ALPHAVANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return null;
  const url = `https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
  const data = await fetchJson(url);
  return dividendRowsFromProvider(data?.data || data?.dividends, "Alpha Vantage");
}

async function fetchPolygonDividends(symbol) {
  const key = process.env.POLYGON_API_KEY || process.env.MASSIVE_API_KEY;
  if (!key) return null;
  const url = `https://api.polygon.io/v3/reference/dividends?ticker=${encodeURIComponent(symbol)}&order=desc&limit=20&apiKey=${encodeURIComponent(key)}`;
  const data = await fetchJson(url);
  return dividendRowsFromProvider(data?.results, "Polygon");
}

async function fetchTwelveDataDividends(symbol) {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) return null;
  const nextUrl = `https://api.twelvedata.com/dividends?symbol=${encodeURIComponent(symbol)}&range=next&apikey=${encodeURIComponent(key)}`;
  const fullUrl = `https://api.twelvedata.com/dividends?symbol=${encodeURIComponent(symbol)}&range=full&apikey=${encodeURIComponent(key)}`;
  const [nextData, fullData] = await Promise.all([
    fetchJson(nextUrl),
    fetchJson(fullUrl)
  ]);
  const rows = [
    ...(Array.isArray(nextData?.dividends) ? nextData.dividends : []),
    ...(Array.isArray(fullData?.dividends) ? fullData.dividends : []),
    ...(Array.isArray(nextData?.data) ? nextData.data : []),
    ...(Array.isArray(fullData?.data) ? fullData.data : [])
  ];
  return dividendRowsFromProvider(rows, "Twelve Data");
}

async function fetchYahooDividendEvents(ticker, market) {
  const symbol = yahooSymbol(ticker, market);
  if (!symbol) return null;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=2y&interval=1mo&events=div`;
  const data = await fetchJson(url);
  const dividends = data?.chart?.result?.[0]?.events?.dividends || {};
  const rows = Object.values(dividends).map((row) => ({
    date: row.date ? new Date(row.date * 1000).toISOString().slice(0, 10) : "",
    amount: row.amount
  }));
  const normalized = dividendRowsFromProvider(rows, "Yahoo dividend events");
  if (!normalized) return null;
  return {
    ...normalized,
    exDate: normalized.nextDeclared ? normalized.exDate : "",
    recordDate: "",
    payDate: "",
    currency: dividendCurrencyForMarket(market),
    paymentDateKnown: false,
    partialDateData: Boolean(normalized.nextDeclared),
    note: normalized.nextDeclared
      ? "Upcoming qualification date checked from Yahoo event data; payment date still requires an exchange/company declaration or corporate-actions feed."
      : "Dividend history checked from Yahoo event data; upcoming payment dates still require an exchange/company declaration."
  };
}

async function fetchDividendData(ticker, market) {
  if (market === "Nigeria") {
    const nigeriaPublic = await fetchNigeriaPublicDividendData(ticker, stockCompanyName(ticker, market) || ticker).catch(() => null);
    const scrapedNigeria = await fetchPublicDividendPageData(ticker, market, stockCompanyName(ticker, market) || ticker).catch(() => null);
    if (nigeriaPublic && scrapedNigeria) {
      return {
        ...scrapedNigeria,
        ...nigeriaPublic,
        amount: Number(nigeriaPublic.amount) > 0 ? nigeriaPublic.amount : scrapedNigeria.amount,
        currency: nigeriaPublic.currency || scrapedNigeria.currency || "NGN",
        history: Array.isArray(scrapedNigeria.history) && scrapedNigeria.history.length
          ? scrapedNigeria.history
          : (Array.isArray(nigeriaPublic.history) ? nigeriaPublic.history : []),
        payoutRatio: Number.isFinite(Number(scrapedNigeria.payoutRatio)) && Number(scrapedNigeria.payoutRatio) > 0
          ? scrapedNigeria.payoutRatio
          : nigeriaPublic.payoutRatio,
        payoutProvider: scrapedNigeria.payoutProvider || scrapedNigeria.provider || nigeriaPublic.payoutProvider || "",
        dividendGrowthYears: Number.isFinite(Number(scrapedNigeria.dividendGrowthYears))
          ? scrapedNigeria.dividendGrowthYears
          : nigeriaPublic.dividendGrowthYears,
        dividendGrowthRate: Number.isFinite(Number(scrapedNigeria.dividendGrowthRate))
          ? scrapedNigeria.dividendGrowthRate
          : nigeriaPublic.dividendGrowthRate,
        annualDividend: Number(scrapedNigeria.annualDividend) > 0
          ? scrapedNigeria.annualDividend
          : nigeriaPublic.annualDividend,
        note: [nigeriaPublic.note, scrapedNigeria.note].filter(Boolean).join(" ").trim(),
        sourceUrl: nigeriaPublic.sourceUrl || scrapedNigeria.sourceUrl || "",
        provider: nigeriaPublic.provider || scrapedNigeria.provider || "Public Nigerian dividend pages",
        verifiedAt: nigeriaPublic.verifiedAt || scrapedNigeria.verifiedAt || new Date().toISOString()
      };
    }
    if (nigeriaPublic?.nextDeclared || nigeriaPublic?.history?.length) return nigeriaPublic;
    if (scrapedNigeria?.nextDeclared || scrapedNigeria?.history?.length || Number.isFinite(Number(scrapedNigeria?.payoutRatio))) return scrapedNigeria;
  }

  const scraped = await fetchPublicDividendPageData(ticker, market, stockCompanyName(ticker, market) || ticker).catch(() => null);
  if (scraped?.nextDeclared || scraped?.history?.length || Number.isFinite(Number(scraped?.payoutRatio))) return scraped;

  const symbols = uniqueSymbols(yahooSymbol(ticker, market), ticker);
  const providerFetchers = [
    fetchFmpDividends,
    fetchAlphaVantageDividends,
    fetchPolygonDividends,
    fetchTwelveDataDividends
  ];

  for (const fetcher of providerFetchers) {
    for (const symbol of symbols) {
      const data = await fetcher(symbol).catch(() => null);
      if (data?.nextDeclared || data?.history?.length) return data;
    }
  }

  return fetchYahooDividendEvents(ticker, market).catch(() => null);
}

function hasDividendProviderCredentials() {
  return Boolean(
    process.env.FMP_API_KEY ||
    process.env.FINANCIAL_MODELING_PREP_API_KEY ||
    process.env.ALPHAVANTAGE_API_KEY ||
    process.env.ALPHA_VANTAGE_API_KEY ||
    process.env.POLYGON_API_KEY ||
    process.env.MASSIVE_API_KEY ||
    process.env.TWELVE_DATA_API_KEY
  );
}

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=240");

  const symbolsParam = request.query.symbols || "";
  const interval = request.query.interval || "d";
  const includeDividends = request.query.dividends === "1" || request.query.verifyDividends === "1";
  const dividendsOnly = request.query.dividendsOnly === "1";
  const inputs = String(symbolsParam).split(",").map((item) => {
    const [ticker, market] = item.split(":");
    return { ticker, market };
  }).filter((item) => item.ticker && item.market).slice(0, 60);

  const quotes = {};
  const verifyDividends = hasDividendProviderCredentials();
  await Promise.allSettled(inputs.map(async ({ ticker, market }) => {
    const symbol = stooqSymbol(ticker, market);
    let quote = null;
    let history = [];
    let rsi = null;
    let liquidity = null;
    let verifiedFallback = null;
    if (!dividendsOnly && market === "Nigeria") {
      quote = await fetchNgxPulseNigeriaQuote(ticker, stockCompanyName(ticker, market) || ticker).catch(() => null);
    }
    if (!dividendsOnly && symbol) {
      const stooqQuote = await fetchQuote(symbol).catch(() => null);
      quote = chooseFresherQuote(quote, stooqQuote);
      history = await fetchHistory(symbol, interval).catch(() => []);
    }
    if (!dividendsOnly) {
      const yahooQuote = (!quote || isQuoteStaleForToday(quote))
        ? await fetchYahooChart(ticker, market, interval).catch(() => null)
        : null;
      quote = chooseFresherQuote(quote, yahooQuote);
      if (yahooQuote?.history?.length) {
        history = yahooQuote.history;
      }
    }
    if (!dividendsOnly) {
      let dailyHistory = interval === "d"
        ? history
        : await fetchYahooDailyHistory(ticker, market).catch(() => []);
      if (dailyHistory.length < 15) {
        verifiedFallback = await fetchVerifiedRsiFallbackHistory(ticker, market).catch(() => null);
        if (verifiedFallback?.history?.length >= 15) {
          dailyHistory = verifiedFallback.history;
          if ((!Array.isArray(history) || history.length < 15) && interval === "d") {
            history = verifiedFallback.history;
          }
          if (!quote) {
            const latest = verifiedFallback.history[verifiedFallback.history.length - 1];
            if (latest?.date && Number.isFinite(Number(latest.close))) {
              quote = {
                price: Number(latest.close),
                date: latest.date,
                time: "",
                provider: verifiedFallback.provider
              };
            }
          }
        }
      }
      if (Number.isFinite(Number(verifiedFallback?.rsiValue)) && dailyHistory.length < 15) {
        const numericValue = Math.round(Number(verifiedFallback.rsiValue));
        rsi = {
          value: numericValue,
          label: numericValue >= 70 ? "Overbought" : numericValue <= 30 ? "Oversold" : "Neutral",
          status: "Verified",
          provider: verifiedFallback.provider || "Verified RSI provider",
          closesCount: 0,
          verifiedAt: new Date().toISOString()
        };
      } else {
        const rsiProvider = verifiedFallback?.provider
          || (dailyHistory === history && history.length ? "Stooq/Yahoo daily history" : "Yahoo daily history");
        rsi = verifiedRsiFromHistory(dailyHistory, dailyHistory.length ? rsiProvider : "");
      }
      liquidity = computeLiquidityPayload(ticker, market, quote, dailyHistory.length ? dailyHistory : history);
    }
    const cachedRsi = !dividendsOnly ? verifiedRsiCacheEntry(ticker, market) : null;
    if (cachedRsi && (!rsi || !Number.isFinite(Number(rsi?.value)))) {
      rsi = {
        value: Number(cachedRsi.value),
        label: cachedRsi.label,
        status: cachedRsi.status || "Verified",
        provider: cachedRsi.provider || "Verified cached daily history",
        closesCount: Number(cachedRsi.closesCount) || Number(cachedRsi.dailyHistory?.length) || 0,
        verifiedAt: cachedRsi.verifiedAt || new Date().toISOString()
      };
    }
    if (
      cachedRsi
      && interval === "d"
      && (!Array.isArray(history) || history.length < 15)
      && Array.isArray(cachedRsi.dailyHistory)
      && Array.isArray(cachedRsi.dailyLabels)
      && cachedRsi.dailyHistory.length === cachedRsi.dailyLabels.length
      && cachedRsi.dailyHistory.length >= 15
    ) {
      history = cachedRsi.dailyLabels.map((date, index) => ({
        date,
        close: Number(cachedRsi.dailyHistory[index])
      })).filter((row) => Number.isFinite(row.close) && row.close > 0);
    }
    if (!dividendsOnly && !quote && Array.isArray(history) && history.length >= 1) {
      quote = latestPriceFromHistory(history, rsi?.provider || cachedRsi?.provider || "Verified cached daily history");
    }
    if (!liquidity) {
      liquidity = computeLiquidityPayload(ticker, market, quote, history);
    }
    const dividend = includeDividends ? await fetchDividendData(ticker, market).catch(() => null) : null;
    if (!quote && !dividend && !rsi && !liquidity && (!Array.isArray(history) || !history.length)) return;
    const payload = dividendsOnly
      ? { dividend }
      : { ...(quote || {}), history, dividend, rsi, liquidity };
    if (!payload.provider && rsi?.provider) {
      payload.provider = rsi.provider;
    }
    quotes[`${market}:${ticker}`] = payload;
  }));

  response.status(200).json({
    updatedAt: new Date().toISOString(),
    provider: dividendsOnly
      ? (includeDividends && verifyDividends
        ? "Live dividend sources plus configured dividend-data providers"
        : "Live dividend sources plus free Yahoo dividend-event history")
      : includeDividends && verifyDividends
        ? "Stooq/Yahoo delayed quotes plus configured dividend-data providers"
        : includeDividends
          ? "Stooq/Yahoo delayed quotes plus free Yahoo dividend-event history"
          : "Stooq/Yahoo delayed quotes",
    quotes
  });
}

module.exports = handler;
module.exports.fetchDividendData = fetchDividendData;
module.exports.fetchHistory = fetchHistory;
module.exports.fetchYahooChart = fetchYahooChart;
module.exports.fetchYahooDailyHistory = fetchYahooDailyHistory;
module.exports.verifiedRsiFromHistory = verifiedRsiFromHistory;
module.exports.yahooSymbol = yahooSymbol;
module.exports.dividendCurrencyForMarket = dividendCurrencyForMarket;
module.exports.namesLikelyMatch = namesLikelyMatch;
