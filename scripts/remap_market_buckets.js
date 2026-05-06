"use strict";

const fs = require("fs");
const path = require("path");
const { inferPlatformMarket } = require("../market-classifier");

const ROOT = path.join(__dirname, "..");
const MARKET_DIVIDENDS_JS = path.join(ROOT, "market-dividends.js");
const MARKET_DIVIDENDS_SCRAPED_JS = path.join(ROOT, "market-dividends-scraped.js");
const MARKET_DIVIDENDS_SCRAPED_JSON = path.join(ROOT, "market-dividends-scraped.json");

function evaluateWindowObject(filePath, variableName) {
  const code = fs.readFileSync(filePath, "utf8");
  const windowObject = {};
  return Function("window", `${code}\nreturn window.${variableName} || {};`)(windowObject) || {};
}

function scoreRecord(record = {}) {
  const historyScore = Array.isArray(record.history) ? record.history.length : 0;
  const dateScore = ["qualificationDate", "recordDate", "paymentDate", "exDate", "payDate"].reduce((sum, key) => sum + (record[key] ? 1 : 0), 0);
  const amountScore = Number(record.amount) > 0 ? 1 : 0;
  return historyScore * 10 + dateScore * 3 + amountScore;
}

function remapRecords(records = {}) {
  const remapped = {};
  let moved = 0;
  for (const [key, record] of Object.entries(records)) {
    if (!record) continue;
    const [, ticker = ""] = String(key).split(":");
    const market = inferPlatformMarket(ticker, record.company || ticker, record);
    const nextKey = `${market}:${ticker}`;
    if (nextKey !== key) moved += 1;
    const current = remapped[nextKey];
    if (!current || scoreRecord(record) > scoreRecord(current)) {
      remapped[nextKey] = { ...record };
    }
  }
  return { remapped, moved };
}

function serializeJs(variableName, value) {
  return `window.${variableName} = ${JSON.stringify(value, null, 2)};\n`;
}

function appendNote(note = "") {
  const suffix = " Market buckets reclassified with the tightened cross-listed stock classifier.";
  return String(note || "").includes(suffix.trim()) ? String(note || "") : `${String(note || "").trim()}${suffix}`;
}

function main() {
  const marketDividendDates = evaluateWindowObject(MARKET_DIVIDENDS_JS, "MARKET_DIVIDEND_DATES");
  const { _meta: dividendDatesMeta = {}, ...dividendDateRecords } = marketDividendDates;
  const remappedDates = remapRecords(dividendDateRecords);
  fs.writeFileSync(MARKET_DIVIDENDS_JS, serializeJs("MARKET_DIVIDEND_DATES", {
    _meta: {
      ...dividendDatesMeta,
      note: appendNote(dividendDatesMeta.note),
      reclassifiedAt: new Date().toISOString()
    },
    ...remappedDates.remapped
  }), "utf8");

  const marketDividendScrapedJson = JSON.parse(fs.readFileSync(MARKET_DIVIDENDS_SCRAPED_JSON, "utf8").replace(/^\uFEFF/, ""));
  const remappedScraped = remapRecords(marketDividendScrapedJson.records || {});
  const refreshedJson = {
    ...marketDividendScrapedJson,
    meta: {
      ...(marketDividendScrapedJson.meta || {}),
      note: appendNote(marketDividendScrapedJson.meta?.note),
      reclassifiedAt: new Date().toISOString()
    },
    audit: {
      ...(marketDividendScrapedJson.audit || {}),
      reclassifiedAt: new Date().toISOString(),
      movedKeys: remappedScraped.moved
    },
    records: remappedScraped.remapped
  };
  fs.writeFileSync(MARKET_DIVIDENDS_SCRAPED_JSON, JSON.stringify(refreshedJson, null, 2), "utf8");
  fs.writeFileSync(MARKET_DIVIDENDS_SCRAPED_JS, serializeJs("MARKET_DIVIDEND_UPDATES", {
    _meta: refreshedJson.meta,
    ...refreshedJson.records
  }), "utf8");

  console.log(JSON.stringify({
    remappedDividendDateKeys: remappedDates.moved,
    remappedScrapedKeys: remappedScraped.moved
  }, null, 2));
}

main();
