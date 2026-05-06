"use strict";

const DEFAULT_HEADERS = {
  "user-agent": "Mozilla/5.0 (compatible; DividendStockTracker/1.0; +https://dividendstocktracker.vercel.app)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

const STOCK_ANALYSIS_URLS = {
  "US:CMA": [
    "https://stockanalysis.com/stocks/cma/history/"
  ],
  "Nigeria:ETRANZACT": [
    "https://stockanalysis.com/quote/ngx/ETRANZACT/history/"
  ],
  "UK:PHNX": [
    "https://stockanalysis.com/quote/lon/PHNX/history/"
  ],
  "Zimbabwe:BAT": [
    "https://stockanalysis.com/quote/zmse/BAT/"
  ],
  "Zimbabwe:CBZ": [
    "https://stockanalysis.com/quote/zmse/CBZ/"
  ],
  "Zimbabwe:DLTA": [
    "https://stockanalysis.com/quote/zmse/DLTA/"
  ],
  "Zimbabwe:ECO": [
    "https://stockanalysis.com/quote/zmse/ECO/"
  ]
};

const NASD_SYMBOLS = {
  "Nigeria:CSCS": "SDCSCSPLC"
};

function sourceKey(ticker, market) {
  return `${market}:${ticker}`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: DEFAULT_HEADERS
    });
    if (!response.ok) return "";
    return response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

function extractBalanced(source, startIndex, openChar, closeChar) {
  if (startIndex < 0 || source[startIndex] !== openChar) return "";
  let depth = 0;
  let quote = "";
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
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
    if (char === openChar) {
      depth += 1;
      continue;
    }
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startIndex, index + 1);
      }
    }
  }
  return "";
}

function toIsoDate(raw) {
  if (!raw && raw !== 0) return "";
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return "";
  const millis = String(Math.trunc(Math.abs(numeric))).length >= 13 ? numeric : numeric * 1000;
  const date = new Date(millis);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

function dedupeAndSortHistory(rows = []) {
  const seen = new Map();
  rows.forEach((row) => {
    const date = String(row?.date || "");
    const close = Number(row?.close);
    if (!date || !Number.isFinite(close) || close <= 0) return;
    seen.set(date, { date, close });
  });
  return [...seen.values()].sort((left, right) => left.date.localeCompare(right.date));
}

function parseStockAnalysisHistoryArray(arrayText) {
  if (!arrayText) return [];
  const rows = [];
  for (const match of arrayText.matchAll(/\{[^{}]*\}/g)) {
    const objectText = match[0];
    const closeMatch = objectText.match(/\bc:([+-]?\d+(?:\.\d+)?)/);
    const isoMatch = objectText.match(/\bt:"(\d{4}-\d{2}-\d{2})"/);
    const unixMatch = objectText.match(/\bt:(\d{10,13})\b/);
    const close = closeMatch ? Number(closeMatch[1]) : NaN;
    const date = isoMatch?.[1] || toIsoDate(unixMatch?.[1] || "");
    if (!date || !Number.isFinite(close) || close <= 0) continue;
    rows.push({ date, close });
  }
  return dedupeAndSortHistory(rows);
}

function parseStockAnalysisHistoryHtml(html) {
  if (!html) return [];
  const candidates = [];
  let searchIndex = 0;
  while (searchIndex < html.length) {
    const markerIndex = html.indexOf("data:[", searchIndex);
    if (markerIndex < 0) break;
    const arrayStart = html.indexOf("[", markerIndex);
    const arrayText = extractBalanced(html, arrayStart, "[", "]");
    if (!arrayText) {
      searchIndex = markerIndex + 5;
      continue;
    }
    candidates.push(parseStockAnalysisHistoryArray(arrayText));
    searchIndex = arrayStart + arrayText.length;
  }
  return candidates.sort((left, right) => right.length - left.length)[0] || [];
}

function parseStockAnalysisDirectRsi(html) {
  if (!html) return NaN;
  const match = html.match(/\brsi:"?([0-9]+(?:\.[0-9]+)?)"/i);
  return match ? Number(match[1]) : NaN;
}

async function fetchStockAnalysisHistory(ticker, market) {
  const urls = STOCK_ANALYSIS_URLS[sourceKey(ticker, market)] || [];
  for (const url of urls) {
    const html = await fetchText(url);
    const history = parseStockAnalysisHistoryHtml(html);
    if (history.length >= 15) {
      return {
        history,
        provider: "StockAnalysis public price history",
        sourceLabel: "StockAnalysis",
        sourceUrl: url
      };
    }
    const rsiValue = parseStockAnalysisDirectRsi(html);
    if (Number.isFinite(rsiValue)) {
      return {
        history: [],
        rsiValue,
        provider: "StockAnalysis public RSI",
        sourceLabel: "StockAnalysis",
        sourceUrl: url
      };
    }
  }
  return null;
}

function parseNasdSeries(text) {
  if (!text) return [];
  const start = text.indexOf("[[");
  const end = text.lastIndexOf("]]");
  if (start < 0 || end < 0 || end <= start) return [];
  try {
    const payload = JSON.parse(text.slice(start, end + 2));
    const rows = Array.isArray(payload)
      ? payload.map((row) => ({
        date: toIsoDate(row?.[0]),
        close: Number(row?.[1])
      }))
      : [];
    return dedupeAndSortHistory(rows);
  } catch {
    return [];
  }
}

async function fetchNasdHistory(ticker, market) {
  const symbol = NASD_SYMBOLS[sourceKey(ticker, market)];
  if (!symbol) return null;
  const url = `https://dataex.nasdotcng.com/rest?symbol=${encodeURIComponent(symbol)}`;
  const text = await fetchText(url);
  const history = parseNasdSeries(text);
  if (history.length < 15) return null;
  return {
    history,
    provider: "NASD historical price feed",
    sourceLabel: "NASD",
    sourceUrl: url
  };
}

async function fetchVerifiedRsiFallbackHistory(ticker, market) {
  const nasd = await fetchNasdHistory(ticker, market);
  if (nasd?.history?.length >= 15) return nasd;
  const stockAnalysis = await fetchStockAnalysisHistory(ticker, market);
  if (stockAnalysis?.history?.length >= 15 || Number.isFinite(Number(stockAnalysis?.rsiValue))) return stockAnalysis;
  return null;
}

module.exports = {
  fetchVerifiedRsiFallbackHistory,
  parseNasdSeries,
  parseStockAnalysisDirectRsi,
  parseStockAnalysisHistoryArray,
  parseStockAnalysisHistoryHtml
};
