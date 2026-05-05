"use strict";

const DEFAULT_HEADERS = {
  "user-agent": "Mozilla/5.0 (compatible; DividendStockTracker/1.0; +https://dividendstocktracker.vercel.app)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

const DIRECT_EXCHANGE_PREFIX = {
  UK: "lon",
  Canada: "tsx",
  Zimbabwe: "zmse"
};

const STOCK_ANALYSIS_URL_OVERRIDES = {
  "Europe:SAP": "https://stockanalysis.com/quote/fra/SAP/dividend/",
  "Europe:TTE": "https://stockanalysis.com/quote/epa/TTE/dividend/",
  "Europe:NVS": "https://stockanalysis.com/quote/swx/NOVN/dividend/",
  "Europe:UBS": "https://stockanalysis.com/quote/swx/UBSG/dividend/",
  "Europe:SAN": "https://stockanalysis.com/quote/bme/SAN/dividend/",
  "Europe:ASML": "https://stockanalysis.com/quote/ams/ASML/dividend/",
  "Europe:SHEL": "https://stockanalysis.com/quote/lon/SHEL/dividend/",
  "Europe:RIO": "https://stockanalysis.com/quote/lon/RIO/dividend/",
  "Europe:BHP": "https://stockanalysis.com/quote/lon/BHP/dividend/",
  "Europe:AZN": "https://stockanalysis.com/quote/lon/AZN/dividend/",
  "Europe:GSK": "https://stockanalysis.com/quote/lon/GSK/dividend/",
  "Europe:NVO": "https://stockanalysis.com/stocks/NVO/dividend/",
  "Europe:LIN": "https://stockanalysis.com/stocks/LIN/dividend/",
  "Europe:UL": "https://stockanalysis.com/stocks/UL/dividend/",
  "Europe:BP": "https://stockanalysis.com/quote/lon/BP/dividend/",
  "Europe:HSBC": "https://stockanalysis.com/stocks/HSBC/dividend/",
  "Europe:BTI": "https://stockanalysis.com/stocks/BTI/dividend/",
  "Europe:DEO": "https://stockanalysis.com/stocks/DEO/dividend/",
  "UK:BUNZL": "https://stockanalysis.com/quote/lon/BNZL/dividend/",
  "Canada:CNI": "https://stockanalysis.com/stocks/CNI/dividend/",
  "Canada:GIB": "https://stockanalysis.com/stocks/GIB/dividend/",
  "Asia:TM": "https://stockanalysis.com/quote/tyo/7203/dividend/",
  "Asia:MUFG": "https://stockanalysis.com/quote/tyo/8306/dividend/",
  "Asia:SMFG": "https://stockanalysis.com/quote/tyo/8316/dividend/",
  "Asia:TSM": "https://stockanalysis.com/stocks/TSM/dividend/",
  "Asia:HDB": "https://stockanalysis.com/stocks/HDB/dividend/",
  "Asia:INFY": "https://stockanalysis.com/stocks/INFY/dividend/",
  "Asia:SONY": "https://stockanalysis.com/stocks/SONY/dividend/",
  "Asia:NTES": "https://stockanalysis.com/stocks/NTES/dividend/",
  "Asia:BABA": "https://stockanalysis.com/stocks/BABA/dividend/",
  "Asia:JD": "https://stockanalysis.com/stocks/JD/dividend/",
  "Asia:NIO": "https://stockanalysis.com/stocks/NIO/dividend/",
  "Asia:TAK": "https://stockanalysis.com/stocks/TAK/dividend/",
  "Asia:KB": "https://stockanalysis.com/stocks/KB/dividend/",
  "Asia:CHT": "https://stockanalysis.com/stocks/CHT/dividend/"
};

const DIVIDEND_HISTORY_URL_OVERRIDES = {
  "Canada:CNI": ["https://dividendhistory.org/payout/CNI/"],
  "Canada:GIB": ["https://dividendhistory.org/payout/GIB/"],
  "Europe:NVO": ["https://dividendhistory.org/payout/NVO/"],
  "Europe:UBS": ["https://dividendhistory.org/payout/UBS/"]
};

const MARKET_DEFAULT_CURRENCY = {
  US: "USD",
  UK: "GBp",
  Canada: "CAD",
  Europe: "EUR",
  Asia: "JPY",
  Zimbabwe: "US cents"
};

const MONTH_INDEX = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11
};

function decodeEntities(text) {
  return String(text || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(text) {
  return decodeEntities(String(text || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function isoFromParts(year, monthIndex, day) {
  const date = new Date(Date.UTC(Number(year), Number(monthIndex), Number(day)));
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

function parseHumanDate(text) {
  const cleaned = stripTags(text)
    .replace(/(\d+)(st|nd|rd|th)\b/gi, "$1")
    .replace(/([A-Za-z]{3,9})\./g, "$1")
    .trim();
  if (!cleaned) return "";
  const iso = cleaned.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[0];
  const longForm = cleaned.match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})\b/);
  if (longForm) {
    const month = MONTH_INDEX[longForm[1].toLowerCase()];
    if (month !== undefined) return isoFromParts(longForm[3], month, longForm[2]);
  }
  const shortForm = cleaned.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (shortForm) {
    const year = shortForm[3].length === 2 ? `20${shortForm[3]}` : shortForm[3];
    return isoFromParts(year, Number(shortForm[1]) - 1, shortForm[2]);
  }
  return "";
}

function titleDateToIso(text) {
  return parseHumanDate(text);
}

function parseAmountAndCurrency(text, market) {
  const cleaned = stripTags(text);
  const numberMatch = cleaned.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/);
  const amount = numberMatch ? Number(numberMatch[0].replace(/,/g, "")) : 0;
  let currency = MARKET_DEFAULT_CURRENCY[market] || "";
  if (/USD|US cents/i.test(cleaned)) currency = /US cents/i.test(cleaned) ? "US cents" : "USD";
  else if (/CAD/i.test(cleaned)) currency = "CAD";
  else if (/GBP|GBp|p\b|£/i.test(cleaned)) currency = "GBp";
  else if (/EUR|€/i.test(cleaned)) currency = "EUR";
  else if (/CHF/i.test(cleaned)) currency = "CHF";
  else if (/JPY|¥/i.test(cleaned)) currency = "JPY";
  else if (/NGN|₦/i.test(cleaned)) currency = "NGN";
  return { amount, currency };
}

function normalizeHistoryRows(rows, market) {
  return rows
    .map((cells) => {
      if (!Array.isArray(cells) || cells.length < 2) return null;
      const exDate = titleDateToIso(cells[0]);
      const { amount, currency } = parseAmountAndCurrency(cells[1], market);
      const recordDate = titleDateToIso(cells[2] || "");
      const payDate = titleDateToIso(cells[3] || "");
      if (!exDate && !payDate && !amount) return null;
      return { exDate, recordDate, payDate, amount, currency };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = new Date(`${a.exDate || a.payDate || "1970-01-01"}T00:00:00Z`).getTime();
      const bTime = new Date(`${b.exDate || b.payDate || "1970-01-01"}T00:00:00Z`).getTime();
      return bTime - aTime;
    });
}

function extractTableRows(html) {
  const tableMatch = html.match(/Ex-Div(?:idend)?[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tableMatch) return [];
  const rows = [];
  for (const rowMatch of tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripTags(cell[1]));
    if (cells.length) rows.push(cells);
  }
  return rows;
}

function extractAnnualDividendMeta(html, market) {
  const annualMatch = html.match(/Annual Dividend[\s\S]*?<div[^>]*>([^<]+)<\/div>/i);
  if (!annualMatch) return { amount: 0, currency: MARKET_DEFAULT_CURRENCY[market] || "" };
  return parseAmountAndCurrency(annualMatch[1], market);
}

function nextUpcomingRow(rows) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return rows
    .slice()
    .sort((a, b) => new Date(`${a.exDate || a.payDate || "2100-01-01"}T00:00:00Z`) - new Date(`${b.exDate || b.payDate || "2100-01-01"}T00:00:00Z`))
    .find((row) => {
      const iso = row.exDate || row.payDate;
      if (!iso) return false;
      const time = new Date(`${iso}T00:00:00Z`).getTime();
      return Number.isFinite(time) && time >= today.getTime();
    }) || null;
}

function stockAnalysisUrl(ticker, market) {
  const symbol = String(ticker || "").trim().toUpperCase();
  const override = STOCK_ANALYSIS_URL_OVERRIDES[`${market}:${symbol}`];
  if (override) return override;
  if (market === "US") return `https://stockanalysis.com/stocks/${encodeURIComponent(symbol)}/dividend/`;
  const prefix = DIRECT_EXCHANGE_PREFIX[market];
  return prefix ? `https://stockanalysis.com/quote/${prefix}/${encodeURIComponent(symbol)}/dividend/` : "";
}

function parseStockAnalysisDividendHtml(html, { ticker, market, company, sourceUrl }) {
  const rows = normalizeHistoryRows(extractTableRows(html), market);
  if (!rows.length) return null;
  const annualMeta = extractAnnualDividendMeta(html, market);
  const upcoming = nextUpcomingRow(rows);
  const latest = rows[0];
  return {
    provider: "StockAnalysis public dividend page",
    verifiedAt: new Date().toISOString(),
    ticker,
    market,
    company,
    exDate: upcoming?.exDate || latest.exDate || "",
    recordDate: upcoming?.recordDate || latest.recordDate || "",
    payDate: upcoming?.payDate || latest.payDate || "",
    amount: upcoming?.amount || latest.amount || annualMeta.amount || 0,
    currency: upcoming?.currency || latest.currency || annualMeta.currency || MARKET_DEFAULT_CURRENCY[market] || "",
    history: rows.slice(0, 12),
    nextDeclared: Boolean(upcoming?.exDate || upcoming?.payDate),
    paymentDateKnown: Boolean((upcoming || latest).payDate),
    sourceUrl,
    note: upcoming
      ? "Upcoming qualification, record, and payment dates scraped from the public StockAnalysis dividend page."
      : "Recent dividend history scraped from the public StockAnalysis dividend page; no future declared cycle was listed on the page."
  };
}

async function fetchStockAnalysisDividendData(ticker, market, company) {
  const sourceUrl = stockAnalysisUrl(ticker, market);
  if (!sourceUrl) return null;
  const response = await fetch(sourceUrl, { headers: DEFAULT_HEADERS });
  if (!response.ok) return null;
  const html = await response.text();
  return parseStockAnalysisDividendHtml(html, { ticker, market, company, sourceUrl });
}

function dividendHistoryUrls(ticker, market) {
  const symbol = String(ticker || "").trim().toUpperCase();
  const override = DIVIDEND_HISTORY_URL_OVERRIDES[`${market}:${symbol}`];
  if (override?.length) return override;
  if (market === "US") return [`https://dividendhistory.org/payout/${encodeURIComponent(symbol)}/`];
  if (market === "Canada") {
    return [
      `https://dividendhistory.org/payout/tsx/${encodeURIComponent(symbol)}/`,
      `https://dividendhistory.org/payout/${encodeURIComponent(symbol)}/`
    ];
  }
  if (["Europe", "UK", "Asia"].includes(market)) {
    return [`https://dividendhistory.org/payout/${encodeURIComponent(symbol)}/`];
  }
  return [];
}

function parseDividendHistoryHtml(html, { ticker, market, company, sourceUrl }) {
  const tableMatch = html.match(/<table id="dividend-table">([\s\S]*?)<\/table>/i);
  if (!tableMatch) return null;
  const rows = [];
  for (const rowMatch of tableMatch[1].matchAll(/<tr([^>]*)>([\s\S]*?)<\/tr>/gi)) {
    const rowClass = rowMatch[1].match(/class="([^"]*)"/i)?.[1] || "";
    const cells = [...rowMatch[2].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripTags(cell[1]));
    if (cells.length < 3) continue;
    const { amount, currency } = parseAmountAndCurrency(cells[2], market);
    rows.push({
      exDate: titleDateToIso(cells[0]),
      recordDate: "",
      payDate: titleDateToIso(cells[1]),
      amount,
      currency,
      status: stripTags(cells[3] || ""),
      rowClass
    });
  }
  const normalized = rows
    .filter((row) => row.exDate || row.payDate || row.amount)
    .sort((a, b) => {
      const aTime = new Date(`${a.exDate || a.payDate || "1970-01-01"}T00:00:00Z`).getTime();
      const bTime = new Date(`${b.exDate || b.payDate || "1970-01-01"}T00:00:00Z`).getTime();
      return bTime - aTime;
    });
  if (!normalized.length) return null;
  const upcoming = nextUpcomingRow(normalized);
  const latest = normalized[0];
  const statusText = `${upcoming?.status || ""} ${upcoming?.rowClass || ""}`.trim();
  const isEstimated = /unconfirmed|estimated|expected/i.test(statusText);
  return {
    provider: "DividendHistory.org public payout page",
    verifiedAt: new Date().toISOString(),
    ticker,
    market,
    company,
    exDate: upcoming?.exDate || latest.exDate || "",
    recordDate: "",
    payDate: upcoming?.payDate || latest.payDate || "",
    amount: upcoming?.amount || latest.amount || 0,
    currency: upcoming?.currency || latest.currency || MARKET_DEFAULT_CURRENCY[market] || "",
    history: normalized.slice(0, 12).map((row) => ({
      exDate: row.exDate,
      recordDate: row.recordDate,
      payDate: row.payDate,
      amount: row.amount,
      currency: row.currency
    })),
    nextDeclared: Boolean(upcoming?.exDate || upcoming?.payDate),
    paymentDateKnown: Boolean((upcoming || latest).payDate),
    sourceUrl,
    note: upcoming
      ? isEstimated
        ? "Upcoming qualification and payment dates scraped from the public DividendHistory.org payout page; the source labels the cycle as estimated or unconfirmed."
        : "Upcoming qualification and payment dates scraped from the public DividendHistory.org payout page."
      : "Recent dividend history scraped from the public DividendHistory.org payout page; no future declared cycle was listed on the page."
  };
}

async function fetchDividendHistoryDividendData(ticker, market, company) {
  const sourceUrls = dividendHistoryUrls(ticker, market);
  for (const sourceUrl of sourceUrls) {
    const response = await fetch(sourceUrl, { headers: DEFAULT_HEADERS }).catch(() => null);
    if (!response?.ok) continue;
    const html = await response.text();
    const parsed = parseDividendHistoryHtml(html, { ticker, market, company, sourceUrl });
    if (parsed?.nextDeclared || parsed?.history?.length) return parsed;
  }
  return null;
}

function dividendInvestorUrl(ticker, market) {
  if (market !== "US") return "";
  const symbol = String(ticker || "").trim().toLowerCase();
  return symbol ? `https://www.dividendinvestor.com/dividend-history-detail/${encodeURIComponent(symbol)}/` : "";
}

function parseDividendInvestorHtml(html, { ticker, market, company, sourceUrl }) {
  const rows = [];
  for (const rowMatch of html.matchAll(/<tr class="detail">([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripTags(cell[1]));
    if (cells.length >= 6) {
      rows.push({
        exDate: titleDateToIso(cells[1]),
        recordDate: titleDateToIso(cells[2]),
        payDate: titleDateToIso(cells[3]),
        amount: Number((cells[5] || "0").replace(/[^0-9.\-]/g, "")) || 0,
        currency: "USD"
      });
    }
  }
  const normalized = normalizeHistoryRows(rows.map((row) => [row.exDate, row.amount, row.recordDate, row.payDate]), market);
  if (!normalized.length) return null;
  const upcoming = nextUpcomingRow(normalized);
  const latest = normalized[0];
  return {
    provider: "DividendInvestor public dividend page",
    verifiedAt: new Date().toISOString(),
    ticker,
    market,
    company,
    exDate: upcoming?.exDate || latest.exDate || "",
    recordDate: upcoming?.recordDate || latest.recordDate || "",
    payDate: upcoming?.payDate || latest.payDate || "",
    amount: upcoming?.amount || latest.amount || 0,
    currency: "USD",
    history: normalized.slice(0, 12),
    nextDeclared: Boolean(upcoming?.exDate || upcoming?.payDate),
    paymentDateKnown: Boolean((upcoming || latest).payDate),
    sourceUrl,
    note: upcoming
      ? "Upcoming qualification, record, and payment dates scraped from the public DividendInvestor page."
      : "Recent dividend history scraped from the public DividendInvestor page; no future declared cycle was listed on the page."
  };
}

async function fetchDividendInvestorDividendData(ticker, market, company) {
  const sourceUrl = dividendInvestorUrl(ticker, market);
  if (!sourceUrl) return null;
  const response = await fetch(sourceUrl, { headers: DEFAULT_HEADERS });
  if (!response.ok) return null;
  const html = await response.text();
  return parseDividendInvestorHtml(html, { ticker, market, company, sourceUrl });
}

function publicDividendSourceUrl(ticker, market) {
  return stockAnalysisUrl(ticker, market)
    || dividendHistoryUrls(ticker, market)[0]
    || dividendInvestorUrl(ticker, market)
    || "";
}

async function fetchPublicDividendPageData(ticker, market, company) {
  const stockAnalysis = await fetchStockAnalysisDividendData(ticker, market, company).catch(() => null);
  if (stockAnalysis?.nextDeclared || stockAnalysis?.history?.length) return stockAnalysis;
  const dividendHistory = await fetchDividendHistoryDividendData(ticker, market, company).catch(() => null);
  if (dividendHistory?.nextDeclared || dividendHistory?.history?.length) return dividendHistory;
  const dividendInvestor = await fetchDividendInvestorDividendData(ticker, market, company).catch(() => null);
  if (dividendInvestor?.nextDeclared || dividendInvestor?.history?.length) return dividendInvestor;
  return null;
}

module.exports = {
  stockAnalysisUrl,
  parseStockAnalysisDividendHtml,
  fetchStockAnalysisDividendData,
  dividendHistoryUrls,
  parseDividendHistoryHtml,
  fetchDividendHistoryDividendData,
  dividendInvestorUrl,
  fetchDividendInvestorDividendData,
  publicDividendSourceUrl,
  fetchPublicDividendPageData
};
