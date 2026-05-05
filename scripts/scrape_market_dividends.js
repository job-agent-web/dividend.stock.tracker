"use strict";

const fs = require("fs");
const path = require("path");
const { fetchPublicDividendPageData, publicDividendSourceUrl } = require("../lib/stockanalysis-dividends");

const ROOT = path.join(__dirname, "..");
const APP_JS = path.join(ROOT, "app.js");
const ONLINE_JS = path.join(ROOT, "online-dividend-universe.js");
const OUTPUT_JS = path.join(ROOT, "market-dividends-scraped.js");
const OUTPUT_JSON = path.join(ROOT, "market-dividends-scraped.json");

function evaluateWindowArray(filename, variableName) {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) return [];
  const code = fs.readFileSync(filePath, "utf8");
  const windowObject = {};
  try {
    return Function("window", `${code}\nreturn window.${variableName} || [];`)(windowObject) || [];
  } catch {
    return [];
  }
}

function inferPlatformMarket(ticker, company) {
  const symbol = String(ticker || "").toUpperCase();
  const name = String(company || "").toLowerCase();
  const canada = new Set(["RY", "TD", "BNS", "BMO", "CM", "ENB", "CNQ", "TRP", "BCE", "TU", "MFC", "SLF", "FTS", "CNI", "CP", "SHOP", "WCN", "GIB", "NTR"]);
  const europe = new Set(["NVS", "SAP", "SAN", "UBS", "TTE", "UL", "SHEL", "RIO", "BHP", "AZN", "GSK", "NVO", "ASML", "LIN", "BP", "HSBC", "BTI", "DEO"]);
  const asia = new Set(["TM", "MUFG", "HDB", "TSM", "NTES", "SONY", "NIO", "BABA", "JD", "CHT", "KB", "SMFG", "TAK", "INFY"]);
  if (canada.has(symbol) || name.includes("canadian") || name.includes("toronto-dominion") || name.includes("royal bank of canada")) return "Canada";
  if (europe.has(symbol) || name.includes("plc") || name.includes("s.a.") || name.includes("ag") || name.includes("se")) return "Europe";
  if (asia.has(symbol) || name.includes("toyota") || name.includes("taiwan") || name.includes("mitsubishi") || name.includes("hdfc")) return "Asia";
  return "US";
}

function loadUniverse() {
  const text = fs.readFileSync(APP_JS, "utf8");
  const rows = new Map();

  for (const match of text.matchAll(/market:\s*"([^"]+)"[\s\S]*?ticker:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"/g)) {
    const market = match[1];
    const ticker = match[2];
    const company = match[3];
    if (market === "Nigeria") continue;
    rows.set(`${market}:${ticker}`, { market, ticker, company });
  }

  for (const match of text.matchAll(/\["([^"]+)",\s*"[^"]+",\s*"([^"]+)",\s*"([^"]+)"/g)) {
    const market = match[1];
    const ticker = match[2];
    const company = match[3];
    if (market === "Nigeria") continue;
    rows.set(`${market}:${ticker}`, { market, ticker, company });
  }

  const onlineRows = evaluateWindowArray("online-dividend-universe.js", "ONLINE_DIVIDEND_UNIVERSE");
  for (const row of onlineRows) {
    const ticker = String(row.symbol || "").trim().toUpperCase();
    if (!ticker) continue;
    const market = inferPlatformMarket(ticker, row.company);
    if (market === "Nigeria") continue;
    rows.set(`${market}:${ticker}`, { market, ticker, company: row.company || ticker });
  }

  return [...rows.values()];
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

function serializeJs(records, meta) {
  return [
    "window.MARKET_DIVIDEND_UPDATES = ",
    JSON.stringify({ _meta: meta, ...records }, null, 2),
    ";\n"
  ].join("");
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 0);
  const concurrency = Math.max(1, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] || 4));
  const universe = loadUniverse()
    .filter((row) => publicDividendSourceUrl(row.ticker, row.market))
    .sort((a, b) => `${a.market}:${a.ticker}`.localeCompare(`${b.market}:${b.ticker}`));
  const targets = limitArg > 0 ? universe.slice(0, limitArg) : universe;

  const audit = {
    generatedAt: new Date().toISOString(),
    sourceName: "Public dividend pages",
    note: "Public dividend pages scraped for real qualification, record, and payment dates where the page listed them.",
    totalTargets: targets.length,
    successes: 0,
    failures: []
  };

  const scrapedRecords = {};
  await runWithConcurrency(targets, concurrency, async (row, index) => {
    if (index > 0) await sleep(120);
    try {
      const data = await fetchPublicDividendPageData(row.ticker, row.market, row.company);
      if (data) {
        audit.successes += 1;
        scrapedRecords[`${row.market}:${row.ticker}`] = {
          company: row.company,
          sourceName: data.provider,
          sourceUrl: data.sourceUrl,
          verifiedAt: data.verifiedAt,
          qualificationDate: data.exDate,
          recordDate: data.recordDate,
          paymentDate: data.payDate,
          amount: data.amount,
          currency: data.currency,
          history: data.history,
          note: data.note
        };
      } else {
        audit.failures.push({ key: `${row.market}:${row.ticker}`, reason: "No scrapeable dividend table was found." });
      }
    } catch (error) {
      audit.failures.push({ key: `${row.market}:${row.ticker}`, reason: error.message || "Request failed." });
    }
  });

  const meta = {
    sourceName: "Public dividend pages",
    sourceUrl: "https://stockanalysis.com/",
    verifiedAt: new Date().toISOString().slice(0, 10),
    note: `Scraped public dividend pages for ${audit.successes} stocks using StockAnalysis and supported fallback pages where needed.`
  };

  fs.writeFileSync(OUTPUT_JS, serializeJs(scrapedRecords, meta), "utf8");
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ meta, audit, records: scrapedRecords }, null, 2), "utf8");
  console.log(`Wrote ${Object.keys(scrapedRecords).length} market dividend updates to ${path.basename(OUTPUT_JS)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
