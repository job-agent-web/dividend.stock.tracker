"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  fetchHistory,
  fetchYahooDailyHistory,
  verifiedRsiFromHistory
} = require("../api/market-data");
const { fetchVerifiedRsiFallbackHistory } = require("../lib/verified-rsi-sources");
const { loadStockUniverse } = require("../lib/_stock-universe");

const rootDir = path.join(__dirname, "..");
const jsonOutputPath = path.join(rootDir, "verified-rsi-cache.json");
const jsOutputPath = path.join(rootDir, "verified-rsi-cache.js");
const nigeriaBuilderPath = path.join(__dirname, "build_nigeria_verified_rsi.py");

const quoteSuffix = {
  US: "us",
  UK: "uk",
  Canada: "ca",
  Europe: "de",
  Asia: "jp",
  Zimbabwe: "zmse"
};

function stockKey(stock) {
  return `${stock.market}:${stock.ticker}`;
}

function uniqueStocksByKey(stocks) {
  return [...new Map(stocks.map((stock) => [stockKey(stock), { ...stock }])).values()];
}

function stooqSymbol(ticker, market) {
  const clean = String(ticker || "").replace(/\./g, "").toLowerCase();
  const suffix = quoteSuffix[market];
  return clean && suffix ? `${clean}.${suffix}` : "";
}

function historyToCacheEntry(stock, history, provider, extra = {}) {
  const trimmed = Array.isArray(history) ? history.filter((row) => Number.isFinite(Number(row?.close)) && row.close > 0).slice(-60) : [];
  const verified = verifiedRsiFromHistory(trimmed, provider);
  if (!verified || trimmed.length < 15) return null;
  return {
    ticker: stock.ticker,
    market: stock.market,
    name: stock.name,
    value: verified.value,
    label: verified.label,
    status: verified.status,
    provider: verified.provider,
    closesCount: trimmed.length,
    verifiedAt: verified.verifiedAt,
    dailyHistory: trimmed.map((row) => Number(row.close)),
    dailyLabels: trimmed.map((row) => String(row.date || "")),
    ...extra
  };
}

function directRsiCacheEntry(stock, value, provider, extra = {}) {
  const numericValue = Math.round(Number(value));
  if (!Number.isFinite(numericValue)) return null;
  return {
    ticker: stock.ticker,
    market: stock.market,
    name: stock.name,
    value: numericValue,
    label: numericValue >= 70 ? "Overbought" : numericValue <= 30 ? "Oversold" : "Neutral",
    status: "Verified",
    provider,
    closesCount: 0,
    verifiedAt: new Date().toISOString(),
    dailyHistory: [],
    dailyLabels: [],
    ...extra
  };
}

async function fetchMarketHistory(stock) {
  const yahooHistory = await fetchYahooDailyHistory(stock.ticker, stock.market, stock.name).catch(() => []);
  if (yahooHistory.length >= 15) {
    return historyToCacheEntry(stock, yahooHistory, "Yahoo daily history", {
      sourceLabel: "Yahoo Finance",
      sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(stock.ticker)}/history`
    });
  }

  const symbol = stooqSymbol(stock.ticker, stock.market);
  if (!symbol) {
    const fallbackOnly = await fetchVerifiedRsiFallbackHistory(stock.ticker, stock.market).catch(() => null);
    if (fallbackOnly?.history?.length >= 15) {
      return historyToCacheEntry(stock, fallbackOnly.history, fallbackOnly.provider, {
        sourceLabel: fallbackOnly.sourceLabel || fallbackOnly.provider,
        sourceUrl: fallbackOnly.sourceUrl || ""
      });
    }
    if (Number.isFinite(Number(fallbackOnly?.rsiValue))) {
      return directRsiCacheEntry(stock, fallbackOnly.rsiValue, fallbackOnly.provider, {
        sourceLabel: fallbackOnly.sourceLabel || fallbackOnly.provider,
        sourceUrl: fallbackOnly.sourceUrl || ""
      });
    }
    return null;
  }
  const stooqHistory = await fetchHistory(symbol, "d").catch(() => []);
  if (stooqHistory.length >= 15) {
    return historyToCacheEntry(stock, stooqHistory, "Stooq daily history", {
      sourceLabel: "Stooq"
    });
  }

  const fallback = await fetchVerifiedRsiFallbackHistory(stock.ticker, stock.market).catch(() => null);
  if (fallback?.history?.length >= 15) {
    return historyToCacheEntry(stock, fallback.history, fallback.provider, {
      sourceLabel: fallback.sourceLabel || fallback.provider,
      sourceUrl: fallback.sourceUrl || ""
    });
  }
  if (Number.isFinite(Number(fallback?.rsiValue))) {
    return directRsiCacheEntry(stock, fallback.rsiValue, fallback.provider, {
      sourceLabel: fallback.sourceLabel || fallback.provider,
      sourceUrl: fallback.sourceUrl || ""
    });
  }
  return null;
}

function runNigeriaBuilder(nigeriaStocks) {
  const result = spawnSync("python", [nigeriaBuilderPath], {
    cwd: rootDir,
    encoding: "utf8",
    input: JSON.stringify(nigeriaStocks)
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Nigeria RSI builder failed.");
  }
  return JSON.parse(result.stdout || "{}");
}

function buildNigeriaEntries(nigeriaStocks) {
  const data = runNigeriaBuilder(nigeriaStocks);
  const entries = {};
  Object.entries(data?.data || {}).forEach(([key, payload]) => {
    const stock = nigeriaStocks.find((item) => stockKey(item) === key);
    if (!stock) return;
    const history = (payload.dailyLabels || []).map((date, index) => ({
      date,
      close: Number(payload.dailyHistory?.[index])
    })).filter((row) => Number.isFinite(row.close) && row.close > 0);
    const entry = historyToCacheEntry(stock, history, "NGX official daily summary PDFs", {
      sourceLabel: "NGX daily summary",
      sourceUrls: payload.sourceUrls || []
    });
    if (entry) entries[key] = entry;
  });
  return {
    entries,
    meta: {
      checkedDays: data?.checkedDays || 0,
      tradingDaysFound: data?.tradingDaysFound || 0
    }
  };
}

async function buildVerifiedRsiCache() {
  const { stocks } = loadStockUniverse();
  const uniqueStocks = uniqueStocksByKey(stocks);
  const nonNigeriaStocks = uniqueStocks.filter((stock) => stock.market !== "Nigeria");
  const nigeriaStocks = uniqueStocks.filter((stock) => stock.market === "Nigeria");

  const data = {};
  const coverage = {};

  for (let index = 0; index < nonNigeriaStocks.length; index += 12) {
    const batch = nonNigeriaStocks.slice(index, index + 12);
    const settled = await Promise.allSettled(batch.map((stock) => fetchMarketHistory(stock)));
    settled.forEach((result, batchIndex) => {
      const stock = batch[batchIndex];
      if (result.status !== "fulfilled" || !result.value) return;
      data[stockKey(stock)] = result.value;
      coverage[stock.market] = (coverage[stock.market] || 0) + 1;
    });
  }

  const nigeria = buildNigeriaEntries(nigeriaStocks);
  Object.assign(data, nigeria.entries);
  coverage.Nigeria = Object.keys(nigeria.entries).length;

  const uncoveredNigeriaStocks = nigeriaStocks.filter((stock) => !data[stockKey(stock)]);
  for (let index = 0; index < uncoveredNigeriaStocks.length; index += 3) {
    const batch = uncoveredNigeriaStocks.slice(index, index + 3);
    const settled = await Promise.allSettled(batch.map((stock) => fetchMarketHistory(stock)));
    settled.forEach((result, batchIndex) => {
      const stock = batch[batchIndex];
      if (result.status !== "fulfilled" || !result.value) return;
      data[stockKey(stock)] = result.value;
      coverage[stock.market] = (coverage[stock.market] || 0) + 1;
    });
  }

  const missingStocks = uniqueStocks.filter((stock) => !data[stockKey(stock)]);

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      totalStocks: uniqueStocks.length,
      verifiedCount: Object.keys(data).length,
      unverifiedCount: missingStocks.length,
      coverageByMarket: coverage,
      missingMarkets: [...new Set(missingStocks.map((stock) => stock.market))],
      unverifiedKeys: missingStocks.map((stock) => stockKey(stock)),
      nigeriaSource: "NGX official daily summary PDFs",
      nigeriaTradingDaysFound: nigeria.meta.tradingDaysFound,
      nigeriaCheckedDays: nigeria.meta.checkedDays
    },
    data
  };

  fs.writeFileSync(jsonOutputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  fs.writeFileSync(jsOutputPath, `window.VERIFIED_RSI_CACHE = ${JSON.stringify(output, null, 2)};\n`, "utf8");

  return output;
}

if (require.main === module) {
  buildVerifiedRsiCache()
    .then((output) => {
      const summary = {
        generatedAt: output._meta.generatedAt,
        totalStocks: output._meta.totalStocks,
        verifiedCount: output._meta.verifiedCount,
        unverifiedCount: output._meta.unverifiedCount,
        coverageByMarket: output._meta.coverageByMarket
      };
      process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.stack || error.message}\n`);
      process.exit(1);
    });
}

module.exports = {
  buildVerifiedRsiCache
};
