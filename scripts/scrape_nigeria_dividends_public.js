"use strict";

const fs = require("fs");
const path = require("path");
const {
  fetchNgxPulseDividendTable,
  fetchNgxOfficialDisclosureSources,
  dedupeSources
} = require("../lib/nigeria-public-dividends");

const ROOT = path.join(__dirname, "..");
const OUTPUT_JS = path.join(ROOT, "nigeria-dividends-scraped.js");
const OUTPUT_JSON = path.join(ROOT, "nigeria-dividends-scraped.json");

function readWindowDataset(filename, variableName) {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) return {};
  const code = fs.readFileSync(filePath, "utf8");
  const windowObject = {};
  try {
    return Function("window", `${code}\nreturn window.${variableName} || {};`)(windowObject) || {};
  } catch {
    return {};
  }
}

function mergeRecords(base = {}, update = {}) {
  const merged = {};
  for (const [key, value] of Object.entries(base || {})) {
    if (key.startsWith("_") || !value) continue;
    merged[key] = { ...value };
  }
  for (const [key, value] of Object.entries(update || {})) {
    if (key.startsWith("_") || !value) continue;
    merged[key] = {
      ...(merged[key] || {}),
      ...value,
      history: value.history || merged[key]?.history || [],
      sources: value.sources || merged[key]?.sources || []
    };
  }
  return merged;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function main() {
  const pulse = await fetchNgxPulseDividendTable(true);
  if (!pulse) throw new Error("Could not fetch NGX Pulse dividend table.");

  const base = readWindowDataset("nigeria-dividends.js", "NIGERIA_DIVIDEND_DATES");
  const existing = readWindowDataset("nigeria-dividends-scraped.js", "NIGERIA_DIVIDEND_UPDATES");
  const merged = mergeRecords(base, mergeRecords(existing, pulse));
  const tickers = Object.keys(merged).filter((key) => !key.startsWith("_")).sort();

  await runWithConcurrency(tickers, 4, async (ticker, index) => {
    if (index > 0) await sleep(120);
    const officialSources = await fetchNgxOfficialDisclosureSources(ticker).catch(() => []);
    merged[ticker] = {
      ...merged[ticker],
      sources: dedupeSources(merged[ticker]?.sources || [], officialSources)
    };
  });

  const meta = {
    ...(base._meta || {}),
    ...(existing._meta || {}),
    ...(pulse._meta || {}),
    sourceName: "Public Nigerian dividend pages",
    sourceUrl: pulse._meta?.sourceUrl || "",
    verifiedAt: new Date().toISOString().slice(0, 10),
    note: `Scraped live Nigerian dividend pages for ${tickers.length} tracked rows and attached official NGX disclosure links where available.`
  };

  const jsPayload = { _meta: meta, ...merged };
  fs.writeFileSync(OUTPUT_JS, `window.NIGERIA_DIVIDEND_UPDATES = ${JSON.stringify(jsPayload, null, 2)};\n`, "utf8");
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({
    generatedAt: new Date().toISOString(),
    records: jsPayload,
    audit: {
      sourceName: "Public Nigerian dividend pages",
      sourceUrl: pulse._meta?.sourceUrl || "",
      successes: tickers.length
    }
  }, null, 2), "utf8");

  console.log(`Wrote ${tickers.length} Nigerian dividend updates to ${path.basename(OUTPUT_JS)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
