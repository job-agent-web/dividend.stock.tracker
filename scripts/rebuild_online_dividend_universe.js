"use strict";

const fs = require("fs");
const path = require("path");
const { fetchPublicDividendPageData } = require("../lib/stockanalysis-dividends");
const { fetchYahooChart } = require("../api/market-data");
const { inferPlatformMarket } = require("../market-classifier");

const ROOT = path.join(__dirname, "..");
const ONLINE_JSON = path.join(ROOT, "online-dividend-universe.json");
const ONLINE_JS = path.join(ROOT, "online-dividend-universe.js");
const MARKET_DIVIDENDS_JSON = path.join(ROOT, "market-dividends-scraped.json");
const VERIFIED_RSI_JSON = path.join(ROOT, "verified-rsi-cache.json");

const MARKET_EXPECTED_CURRENCY = {
  US: "USD",
  UK: "GBp",
  Canada: "CAD",
  Europe: "EUR",
  Asia: "JPY"
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeValuationLabel(value = "") {
  const label = String(value || "").trim().toLowerCase();
  if (!label) return "";
  if (/(cheap|undervalued|attractive)/i.test(label)) return "Cheap";
  if (/(expensive|overvalued|rich)/i.test(label)) return "Expensive";
  return "Fair";
}

function inferValuationLabelFromMetrics({
  dividendYield = 0,
  payoutRatio = 65,
  safety = 60,
  growthYears = 0,
  marketCap = 0,
  currentValuation = ""
}) {
  const seeded = normalizeValuationLabel(currentValuation);
  let score = 50;
  const yieldValue = Number(dividendYield) || 0;
  const payoutValue = Number(payoutRatio) || 0;
  const safetyValue = Number(safety) || 0;
  const growthValue = Number(growthYears) || 0;
  const sizeValue = Number(marketCap) || 0;

  if (yieldValue >= 7) score += 18;
  else if (yieldValue >= 5) score += 12;
  else if (yieldValue >= 3) score += 6;
  else if (yieldValue > 0 && yieldValue < 1.5) score -= 12;

  if (payoutValue > 0 && payoutValue <= 60) score += 8;
  else if (payoutValue <= 80) score += 3;
  else if (payoutValue > 95) score -= 14;

  if (safetyValue >= 75) score += 7;
  else if (safetyValue >= 60) score += 3;
  else if (safetyValue < 50) score -= 8;

  if (growthValue >= 8) score += 5;
  else if (growthValue <= 0) score -= 3;

  if (sizeValue >= 250000000000) score -= 4;
  else if (sizeValue >= 100000000000) score -= 2;
  else if (sizeValue > 0 && sizeValue <= 5000000000) score += 2;

  if (seeded === "Cheap") score += 5;
  else if (seeded === "Expensive") score -= 5;

  if (score >= 62) return "Cheap";
  if (score <= 40) return "Expensive";
  return "Fair";
}

function valuationScoreFromLabel(value = "") {
  const label = normalizeValuationLabel(value);
  if (label === "Cheap") return 88;
  if (label === "Expensive") return 28;
  return 62;
}

function buyScoreFromMetrics({
  growthYears = 0,
  payoutRatio = 65,
  safety = 60,
  dividendYield = 2.5,
  marketCap = 0,
  valuation = ""
}) {
  const payoutHealth = payoutRatio <= 0 ? 45 : payoutRatio <= 35 ? 88 : payoutRatio <= 60 ? 100 : payoutRatio <= 75 ? 78 : payoutRatio <= 90 ? 42 : 15;
  const growthScore = clamp((growthYears / 25) * 100, 0, 100);
  const yieldScore = dividendYield <= 0 ? 0 : dividendYield <= 2 ? 45 : dividendYield <= 6 ? 80 : dividendYield <= 10 ? 68 : 35;
  const sizeScore = marketCap >= 100000000000 ? 92 : marketCap >= 10000000000 ? 78 : marketCap >= 2000000000 ? 62 : 48;
  const safeScore = clamp((safety * 0.75) + (sizeScore * 0.25), 0, 100);
  const valuationScore = valuationScoreFromLabel(
    valuation || inferValuationLabelFromMetrics({ dividendYield, payoutRatio, safety, growthYears, marketCap })
  );
  return Math.round((growthScore * 0.22) + (payoutHealth * 0.28) + (safeScore * 0.26) + (yieldScore * 0.12) + (valuationScore * 0.12));
}

function readJson(filePath, fallback) {
  try {
    const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function eventTime(entry = {}) {
  const dateText = entry.payDate || entry.recordDate || entry.exDate || entry.date || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateText))) return 0;
  const time = Date.parse(`${dateText}T00:00:00Z`);
  return Number.isFinite(time) ? time : 0;
}

function fallbackPaymentsPerYear(market) {
  if (market === "US" || market === "Canada") return 4;
  if (market === "UK" || market === "Europe" || market === "Asia") return 2;
  return 1;
}

function median(values = []) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function inferPaymentsPerYear(history = [], market) {
  const uniqueTimes = [...new Set(history.map((entry) => entry.eventTime).filter(Boolean))].sort((a, b) => b - a);
  const gaps = [];
  for (let index = 0; index < uniqueTimes.length - 1 && gaps.length < 5; index += 1) {
    const gapDays = Math.round((uniqueTimes[index] - uniqueTimes[index + 1]) / (24 * 60 * 60 * 1000));
    if (gapDays > 0) gaps.push(gapDays);
  }
  const typicalGap = median(gaps);
  if (typicalGap > 0) {
    if (typicalGap <= 45) return 12;
    if (typicalGap <= 120) return 4;
    if (typicalGap <= 220) return 2;
    return 1;
  }
  if (history.length >= 10) return 12;
  if (history.length >= 3) return 4;
  if (history.length >= 2) return 2;
  return fallbackPaymentsPerYear(market);
}

function normalizedHistory(record = {}) {
  return Array.isArray(record.history)
    ? record.history
      .map((entry) => ({
        exDate: String(entry.exDate || ""),
        recordDate: String(entry.recordDate || ""),
        payDate: String(entry.payDate || ""),
        currency: String(entry.currency || record.currency || ""),
        amount: Number(entry.amount) || 0,
        eventTime: eventTime(entry)
      }))
      .filter((entry) => entry.amount > 0 && entry.eventTime > 0)
      .sort((a, b) => b.eventTime - a.eventTime)
    : [];
}

function hasProviderPayoutRatio(record = {}) {
  const value = Number(record?.payoutRatio);
  return Number.isFinite(value) && value > 0;
}

function mergeProviderRecord(scrapedRecord = null, liveRecord = null) {
  if (!scrapedRecord && !liveRecord) return null;
  return {
    ...(scrapedRecord || {}),
    ...(liveRecord || {}),
    history: Array.isArray(liveRecord?.history) && liveRecord.history.length
      ? liveRecord.history
      : (Array.isArray(scrapedRecord?.history) ? scrapedRecord.history : []),
    sourceUrl: liveRecord?.sourceUrl || scrapedRecord?.sourceUrl || "",
    verifiedAt: liveRecord?.verifiedAt || scrapedRecord?.verifiedAt || "",
    provider: liveRecord?.provider || scrapedRecord?.provider || scrapedRecord?.sourceName || "",
    sourceName: liveRecord?.sourceName || scrapedRecord?.sourceName || liveRecord?.provider || ""
  };
}

function freshAnnualDividend(record = {}, market) {
  const history = normalizedHistory(record);
  if (!history.length) {
    const amount = Number(record.amount) || 0;
    if (amount <= 0) return 0;
    return Number((amount * fallbackPaymentsPerYear(market)).toFixed(4));
  }
  const paymentsPerYear = inferPaymentsPerYear(history, market);
  const sample = history.slice(0, paymentsPerYear);
  if (!sample.length) return 0;
  if (sample.length >= paymentsPerYear) {
    return Number(sample.reduce((sum, entry) => sum + entry.amount, 0).toFixed(4));
  }
  const averageAmount = sample.reduce((sum, entry) => sum + entry.amount, 0) / sample.length;
  return Number((averageAmount * paymentsPerYear).toFixed(4));
}

function expectedCurrencyForMarket(market) {
  return MARKET_EXPECTED_CURRENCY[market] || "";
}

function latestPriceFromCache(record = {}) {
  const history = Array.isArray(record.dailyHistory) ? record.dailyHistory : [];
  const labels = Array.isArray(record.dailyLabels) ? record.dailyLabels : [];
  const latestPrice = Number(history[history.length - 1]);
  if (!Number.isFinite(latestPrice) || latestPrice <= 0) return null;
  return {
    price: latestPrice,
    priceDate: String(labels[labels.length - 1] || ""),
    priceSource: record.provider || "Verified RSI cache"
  };
}

function resolvedYield({ market, oldYield, annualDividend, latestPrice, providerCurrency }) {
  const baseYield = Number(oldYield) || 0;
  if (!(annualDividend > 0) || !(latestPrice > 0)) return baseYield;
  const expectedCurrency = expectedCurrencyForMarket(market);
  const currencyMatches = !providerCurrency || !expectedCurrency || providerCurrency === expectedCurrency;
  const freshYield = Number(((annualDividend / latestPrice) * 100).toFixed(4));
  if (!currencyMatches) return baseYield || freshYield;
  if (!(freshYield > 0) || freshYield > 50) return baseYield;
  if (baseYield > 0) {
    const ratio = freshYield / baseYield;
    if (!Number.isFinite(ratio) || ratio > 4 || ratio < 0.25) {
      return baseYield;
    }
  }
  return freshYield;
}

function safetyFromSeed(payoutRatio, growthYears) {
  return Math.round(clamp(
    100 - Math.max(0, Number(payoutRatio || 0) - 45) * 0.75 + Math.min(Number(growthYears || 0), 25) * 0.8,
    20,
    95
  ));
}

function scoreSignal(score, payoutRatio) {
  if (score >= 72 && payoutRatio <= 85) return "Buy";
  if (score < 45 || payoutRatio > 110) return "Sell";
  return "Hold";
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.max(1, limit) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function serializeJs(rows) {
  return `window.ONLINE_DIVIDEND_UNIVERSE = ${JSON.stringify(rows)};\n`;
}

async function main() {
  const rows = readJson(ONLINE_JSON, []);
  const marketDividends = readJson(MARKET_DIVIDENDS_JSON, { records: {} });
  const verifiedRsi = readJson(VERIFIED_RSI_JSON, { data: {} });
  const args = process.argv.slice(2);
  const concurrency = Math.max(1, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] || 4));

  const prepared = rows.map((row) => {
    const symbol = String(row.symbol || "").trim().toUpperCase();
    const company = String(row.company || symbol).trim();
    const market = inferPlatformMarket(symbol, company, row);
    const key = `${market}:${symbol}`;
    return {
      ...row,
      symbol,
      company,
      market,
      key,
      scrapedRecord: marketDividends.records?.[key] || null,
      priceRecord: verifiedRsi.data?.[key] || null
    };
  });

  const providerDividendTargets = prepared.filter((row) => {
    const scrapedHistory = normalizedHistory(row.scrapedRecord || {});
    const scrapedHasAmount = Number(row.scrapedRecord?.amount) > 0;
    const importedHasProviderPayout = String(row.payoutSource || "").trim() || String(row.payoutVerifiedAt || "").trim();
    return !scrapedHistory.length || !scrapedHasAmount || !hasProviderPayoutRatio(row.scrapedRecord) || !importedHasProviderPayout;
  });
  const unresolvedPrices = prepared.filter((row) => !latestPriceFromCache(row.priceRecord || {}));

  const dividendProviderRecords = new Map();
  await runWithConcurrency(providerDividendTargets, concurrency, async (row) => {
    const liveRecord = await fetchPublicDividendPageData(row.symbol, row.market, row.company).catch(() => null);
    if (liveRecord?.history?.length || Number(liveRecord?.amount) > 0 || hasProviderPayoutRatio(liveRecord)) {
      dividendProviderRecords.set(row.key, liveRecord);
    }
  });

  const priceFallbacks = new Map();
  await runWithConcurrency(unresolvedPrices, concurrency, async (row) => {
    const quote = await fetchYahooChart(row.symbol, row.market, "d", row.company).catch(() => null);
    if (Number.isFinite(Number(quote?.price)) && Number(quote.price) > 0) {
      priceFallbacks.set(row.key, {
        price: Number(quote.price),
        priceDate: String(quote.date || ""),
        priceSource: quote.provider || "Yahoo delayed quote"
      });
    }
  });

  const refreshedAt = new Date().toISOString();
  const stats = {
    totalRows: prepared.length,
    providerAnnualDividendRows: 0,
    providerPayoutRows: 0,
    livePriceYieldRows: 0,
    preservedSeedYieldRows: 0,
    missingProviderAnnualDividendRows: 0,
    priceFallbackRows: 0
  };

  const refreshedRows = prepared.map((row) => {
    const providerRecord = mergeProviderRecord(row.scrapedRecord, dividendProviderRecords.get(row.key));
    const annualDividend = freshAnnualDividend(providerRecord || {}, row.market);
    const latestPriceRecord = latestPriceFromCache(row.priceRecord || {}) || priceFallbacks.get(row.key) || null;
    const providerCurrency = String(providerRecord?.currency || normalizedHistory(providerRecord || {})[0]?.currency || "");
    const oldYield = Number(row.yield) || 0;
    const newYield = annualDividend > 0
      ? resolvedYield({
          market: row.market,
          oldYield,
          annualDividend,
          latestPrice: Number(latestPriceRecord?.price) || 0,
          providerCurrency
        })
      : oldYield;
    const providerPayout = Number(providerRecord?.payoutRatio);
    const payout = Number.isFinite(providerPayout) && providerPayout > 0
      ? Number(providerPayout.toFixed(2))
      : (Number.isFinite(Number(row.payout)) ? Number(row.payout) : null);
    const providerGrowthYears = Number(providerRecord?.dividendGrowthYears);
    const growthYears = Number.isFinite(providerGrowthYears) && providerGrowthYears >= 0
      ? providerGrowthYears
      : (Number(row.years) || 0);
    const safety = safetyFromSeed(payout, growthYears);
    const valuation = normalizeValuationLabel(row.valuation) || inferValuationLabelFromMetrics({
      dividendYield: newYield,
      payoutRatio: payout ?? 0,
      safety,
      growthYears,
      marketCap: Number(row.marketCap) || 0,
      currentValuation: row.valuation
    });
    const qualityScore = buyScoreFromMetrics({
      growthYears,
      payoutRatio: payout ?? 0,
      safety,
      dividendYield: newYield,
      marketCap: Number(row.marketCap) || 0,
      valuation
    });

    if (annualDividend > 0) stats.providerAnnualDividendRows += 1;
    else stats.missingProviderAnnualDividendRows += 1;
    if (Number.isFinite(providerPayout) && providerPayout > 0) stats.providerPayoutRows += 1;
    if (latestPriceRecord?.priceSource?.includes("Yahoo delayed quote")) stats.priceFallbackRows += 1;
    if (annualDividend > 0 && latestPriceRecord?.price && Number(newYield) !== oldYield) stats.livePriceYieldRows += 1;
    if (annualDividend > 0 && Number(newYield) === oldYield) stats.preservedSeedYieldRows += 1;

    return {
      symbol: row.symbol,
      company: row.company,
      market: row.market,
      yield: Number((newYield || oldYield || 0).toFixed(4)),
      annualDividend: annualDividend > 0 ? annualDividend : Number(row.annualDividend) || 0,
      years: growthYears,
      payout,
      marketCap: Number(row.marketCap) || 0,
      sector: row.sector || "Dividend Stocks",
      valuation,
      qualityScore,
      signal: scoreSignal(qualityScore, payout ?? 0),
      safety,
      payoutSource: Number.isFinite(providerPayout) && providerPayout > 0 ? (providerRecord?.payoutProvider || providerRecord?.provider || providerRecord?.sourceName || "Public dividend source") : "",
      payoutVerifiedAt: Number.isFinite(providerPayout) && providerPayout > 0 ? (providerRecord?.verifiedAt || "") : "",
      dividendSource: providerRecord?.sourceName || "",
      dividendSourceUrl: providerRecord?.sourceUrl || "",
      dividendVerifiedAt: providerRecord?.verifiedAt || "",
      dividendCurrency: providerCurrency || "",
      priceSource: latestPriceRecord?.priceSource || "",
      priceDate: latestPriceRecord?.priceDate || "",
      refreshedAt
    };
  });

  fs.writeFileSync(ONLINE_JSON, JSON.stringify(refreshedRows), "utf8");
  fs.writeFileSync(ONLINE_JS, serializeJs(refreshedRows), "utf8");

  console.log(JSON.stringify({
    refreshedAt,
    ...stats
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
