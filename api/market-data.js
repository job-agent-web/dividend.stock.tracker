const { fetchPublicDividendPageData } = require("../lib/stockanalysis-dividends");
const { fetchNigeriaPublicDividendData } = require("../lib/nigeria-public-dividends");

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
  "Asia:TM": "7203.T",
  "Asia:MUFG": "8306.T",
  "Asia:TSM": "TSM",
  "Asia:HDB": "HDB",
  "Asia:INFY": "INFY"
};

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

function yahooRange(interval) {
  if (interval === "d") return { range: "1mo", interval: "1d" };
  if (interval === "w") return { range: "6mo", interval: "1wk" };
  return { range: "1y", interval: "1mo" };
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

async function fetchQuote(symbol) {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlcv&h&e=csv`;
  const response = await fetch(url, { headers: { "user-agent": "dividend-tracker/1.0" } });
  if (!response.ok) return null;
  const rows = (await response.text()).trim().split(/\r?\n/);
  if (rows.length < 2) return null;
  const values = parseCsvLine(rows[1]);
  const close = Number(values[6]);
  if (!Number.isFinite(close) || close <= 0) return null;
  return {
    price: close,
    date: values[1],
    time: values[2],
    provider: "Stooq delayed quote"
  };
}

async function fetchHistory(symbol, interval = "d") {
  const safeInterval = ["d", "w", "m"].includes(interval) ? interval : "d";
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=${safeInterval}`;
  const response = await fetch(url, { headers: { "user-agent": "dividend-tracker/1.0" } });
  if (!response.ok) return [];
  const rows = (await response.text()).trim().split(/\r?\n/).slice(1);
  return rows.map((line) => {
    const [date, open, high, low, close] = parseCsvLine(line);
    return { date, open: Number(open), high: Number(high), low: Number(low), close: Number(close) };
  }).filter((row) => Number.isFinite(row.close) && row.close > 0).slice(-120);
}

async function fetchYahooChart(ticker, market, interval = "d") {
  const symbol = yahooSymbol(ticker, market);
  if (!symbol) return null;
  const range = yahooRange(interval);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range.range}&interval=${range.interval}`;
  const response = await fetch(url, { headers: { "user-agent": "dividend-tracker/1.0" } });
  if (!response.ok) return null;
  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const price = Number(result?.meta?.regularMarketPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const history = timestamps.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    close: Number(closes[index])
  })).filter((row) => Number.isFinite(row.close) && row.close > 0).slice(-120);
  return {
    price,
    date: result.meta?.regularMarketTime
      ? new Date(result.meta.regularMarketTime * 1000).toISOString().slice(0, 10)
      : "",
    time: result.meta?.regularMarketTime
      ? new Date(result.meta.regularMarketTime * 1000).toISOString().slice(11, 16)
      : "",
    provider: "Yahoo delayed quote",
    history
  };
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
    const nigeriaPublic = await fetchNigeriaPublicDividendData(ticker, ticker).catch(() => null);
    if (nigeriaPublic?.nextDeclared || nigeriaPublic?.history?.length) return nigeriaPublic;
  }

  const scraped = await fetchPublicDividendPageData(ticker, market, ticker).catch(() => null);
  if (scraped?.nextDeclared || scraped?.history?.length) return scraped;

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
    if (!dividendsOnly && symbol) {
      quote = await fetchQuote(symbol).catch(() => null);
      history = await fetchHistory(symbol, interval).catch(() => []);
    }
    if (!dividendsOnly && !quote) {
      quote = await fetchYahooChart(ticker, market, interval).catch(() => null);
      history = quote?.history || history;
    }
    const dividend = includeDividends ? await fetchDividendData(ticker, market).catch(() => null) : null;
    if (!quote && !dividend) return;
    quotes[`${market}:${ticker}`] = dividendsOnly
      ? { dividend }
      : { ...quote, history, dividend };
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
module.exports.fetchYahooChart = fetchYahooChart;
module.exports.yahooSymbol = yahooSymbol;
module.exports.dividendCurrencyForMarket = dividendCurrencyForMarket;
