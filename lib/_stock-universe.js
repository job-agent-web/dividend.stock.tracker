const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appJsPath = path.join(__dirname, "..", "app.js");
const classifierPath = path.join(__dirname, "..", "market-classifier.js");
const onlineUniversePath = path.join(__dirname, "..", "online-dividend-universe.js");
const domMarker = 'const categoryFilter = document.querySelector("#categoryFilter");';

let cachedUniverse = null;

function stockKey(stock) {
  return `${stock.market}:${stock.ticker}`;
}

function stockOfDayRank(stock, score) {
  const yieldScore = stock.dividendYield >= 2 && stock.dividendYield <= 8
    ? 10
    : stock.dividendYield > 8 && stock.dividendYield <= 10
      ? 3
      : 0;
  const payoutScore = stock.payoutRatio > 0 && stock.payoutRatio <= 70
    ? 10
    : stock.payoutRatio <= 90
      ? 4
      : -8;
  const safetyScore = Number(stock.safety || 0) / 10;
  const signalScore = stock.signal === "Buy" ? 18 : stock.signal === "Hold" ? 4 : -12;
  const sizeScore = Math.min(8, Math.log10(Math.max(Number(stock.marketCap || 0), 1)) / 2);
  return score + yieldScore + payoutScore + safetyScore + signalScore + sizeScore;
}

function stockOfDayReason(stock, score) {
  const parts = [];
  if (stock.signal === "Buy") parts.push("buy signal");
  if (score >= 70) parts.push("strong buy score");
  if (Number(stock.safety || 0) >= 70) parts.push("solid safety");
  if (stock.payoutRatio > 0 && stock.payoutRatio <= 70) parts.push("controlled payout");
  if (stock.dividendYield >= 2 && stock.dividendYield <= 8) parts.push("healthy yield");
  return parts.length
    ? `Best daily match for ${parts.slice(0, 3).join(", ")}.`
    : "Best available daily match across the tracked platform universe.";
}

function loadStockUniverse() {
  if (cachedUniverse) return cachedUniverse;

  const appSource = fs.readFileSync(appJsPath, "utf8");
  const classifierSource = fs.existsSync(classifierPath)
    ? fs.readFileSync(classifierPath, "utf8")
    : "";
  const onlineUniverseSource = fs.existsSync(onlineUniversePath)
    ? fs.readFileSync(onlineUniversePath, "utf8")
    : "";
  const splitIndex = appSource.indexOf(domMarker);
  if (splitIndex < 0) {
    throw new Error("Could not locate the stock universe section in app.js.");
  }

  const preDomSource = appSource.slice(0, splitIndex);
  const sandbox = {
    console,
    fetch: async () => ({ ok: false, json: async () => ({}), text: async () => "" }),
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    window: {
      location: { protocol: "https:", search: "", href: "" },
      matchMedia: () => ({ matches: false, addEventListener: () => {} }),
      navigator: {},
      innerWidth: 1280
    },
    navigator: { userAgent: "node" },
    document: {
      querySelector: () => null,
      querySelectorAll: () => [],
      body: { dataset: {}, classList: { add: () => {}, remove: () => {} } },
      referrer: ""
    },
    URL,
    URLSearchParams,
    Intl,
    Date,
    Math,
    Number,
    String,
    Array,
    Object,
    Set,
    Map,
    JSON,
    RegExp,
    Boolean,
    parseFloat,
    parseInt,
    isFinite,
    clearTimeout,
    setTimeout
  };
  sandbox.globalThis = sandbox;
  sandbox.window.window = sandbox.window;
  sandbox.window.globalThis = sandbox;

  if (classifierSource) {
    vm.runInNewContext(classifierSource, sandbox, { filename: "market-classifier.js" });
  }

  if (onlineUniverseSource) {
    vm.runInNewContext(onlineUniverseSource, sandbox, { filename: "online-dividend-universe.js" });
  }

  const captureSource = `${preDomSource}
globalThis.__dividendUniverse = {
  stocks,
  finalQualityScore
};`;

  vm.runInNewContext(captureSource, sandbox, { filename: "app.js" });

  if (!Array.isArray(sandbox.__dividendUniverse?.stocks) || typeof sandbox.__dividendUniverse?.finalQualityScore !== "function") {
    throw new Error("Could not evaluate the stock universe.");
  }

  cachedUniverse = {
    stocks: sandbox.__dividendUniverse.stocks.map((stock) => ({ ...stock })),
    finalQualityScore: sandbox.__dividendUniverse.finalQualityScore
  };
  return cachedUniverse;
}

function bestGlobalStockOfDay() {
  const { stocks, finalQualityScore } = loadStockUniverse();
  const buyCandidates = stocks.filter((stock) =>
    stock.signal === "Buy"
    && Number(stock.dividendYield || 0) > 0
    && Number(stock.payoutRatio || 0) > 0
  );
  const candidates = buyCandidates.length ? buyCandidates : stocks;
  const best = [...candidates].sort((a, b) => {
    const scoreA = finalQualityScore(a);
    const scoreB = finalQualityScore(b);
    const rankDiff = stockOfDayRank(b, scoreB) - stockOfDayRank(a, scoreA);
    if (rankDiff !== 0) return rankDiff;
    const scoreDiff = scoreB - scoreA;
    if (scoreDiff !== 0) return scoreDiff;
    return Number(b.marketCap || 0) - Number(a.marketCap || 0);
  })[0] || null;

  if (!best) return null;

  const score = finalQualityScore(best);
  const londonDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London"
  }).format(new Date());

  return {
    stock: { ...best },
    key: stockKey(best),
    score,
    reason: stockOfDayReason(best, score),
    dateLabel: londonDate
  };
}

module.exports = {
  bestGlobalStockOfDay,
  loadStockUniverse,
  stockKey,
  stockOfDayRank,
  stockOfDayReason
};
