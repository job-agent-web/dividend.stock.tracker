(function (globalScope, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  globalScope.marketClassifier = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SUPPORTED_MARKETS = new Set(["US", "UK", "Canada", "Europe", "Asia", "Nigeria", "Zimbabwe"]);

  const CANADA_TICKERS = new Set([
    "RY", "TD", "BNS", "BMO", "CM", "ENB", "CNQ", "TRP", "BCE", "TU",
    "MFC", "SLF", "FTS", "CNI", "CP", "SHOP", "WCN", "GIB", "NTR",
    "AEM", "WFG", "BGSI"
  ]);

  const UK_TICKERS = new Set([
    "AZN", "GSK", "BP", "HSBC", "BTI", "DEO", "RIO", "SHEL", "BHP",
    "UL", "AMCR", "RELX", "NG", "DGE"
  ]);

  const EUROPE_TICKERS = new Set([
    "NVS", "SAP", "SAN", "UBS", "TTE", "NVO", "ASML", "LIN", "FER"
  ]);

  const ASIA_TICKERS = new Set([
    "TM", "MUFG", "HDB", "TSM", "NTES", "SONY", "NIO", "BABA", "JD",
    "CHT", "KB", "SMFG", "TAK", "INFY"
  ]);

  // A few cross-listed or ADR-style names keep appearing on generic
  // provider pages (for example stockanalysis.com/stocks/...) where the
  // source URL and dividend currency are not enough to place them
  // cleanly. These explicit overrides make the intended regional bucket
  // deterministic across the browser app and rebuild scripts.
  const MANUAL_TICKER_MARKET_OVERRIDES = new Map([
    ["UL", "UK"],
    ["AMCR", "UK"],
    ["AZN", "UK"],
    ["BP", "UK"],
    ["BTI", "UK"],
    ["DEO", "UK"],
    ["GSK", "UK"],
    ["HSBC", "UK"],
    ["RIO", "UK"],
    ["SHEL", "UK"],
    ["BHP", "UK"],
    ["RELX", "UK"],
    ["NVS", "Europe"],
    ["SAP", "Europe"],
    ["SAN", "Europe"],
    ["TTE", "Europe"],
    ["UBS", "Europe"],
    ["ASML", "Europe"],
    ["NVO", "Europe"],
    ["FER", "Europe"],
    ["AEM", "Canada"],
    ["GIB", "Canada"],
    ["WFG", "Canada"],
    ["BABA", "Asia"],
    ["JD", "Asia"],
    ["NIO", "Asia"],
    ["NTES", "Asia"],
    ["HDB", "Asia"],
    ["INFY", "Asia"],
    ["TSM", "Asia"],
    ["CHT", "Asia"],
    ["KB", "Asia"],
    ["TAK", "Asia"],
    ["TM", "Asia"],
    ["MUFG", "Asia"],
    ["SONY", "Asia"],
    ["SMFG", "Asia"]
  ]);

  const SOURCE_URL_MARKETS = [
    { pattern: /\/quote\/lon\//i, market: "UK" },
    { pattern: /\/quote\/tsx\//i, market: "Canada" },
    { pattern: /\/quote\/(fra|epa|bme|swx|ams|cph|sto|bit|etr|bru|vie|osl|lis)\//i, market: "Europe" },
    { pattern: /\/quote\/(tyo|hkg|bom|nse|tpe|tai|krx|sgx|idx)\//i, market: "Asia" },
    { pattern: /\/stock-markets\/ngse\//i, market: "Nigeria" },
    { pattern: /\/vfex\//i, market: "Zimbabwe" }
  ];

  const CURRENCY_MARKETS = new Map([
    ["GBP", "UK"],
    ["GBX", "UK"],
    ["GBPENCE", "UK"],
    ["GBP PENCE", "UK"],
    ["GBP PENCES", "UK"],
    ["GBP PENNY", "UK"],
    ["GBP PENNIES", "UK"],
    ["GBP.", "UK"],
    ["GB P", "UK"],
    ["GBPENCES", "UK"],
    ["GBPENCE/SHARE", "UK"],
    ["GBP/SHARE", "UK"],
    ["GBP SHARE", "UK"],
    ["GB PENCE", "UK"],
    ["GBPENCESHARE", "UK"],
    ["GBPENCE PER SHARE", "UK"],
    ["GBPENCE PER STOCK", "UK"],
    ["GBPENCEPER SHARE", "UK"],
    ["GBp", "UK"],
    ["CAD", "Canada"],
    ["EUR", "Europe"],
    ["CHF", "Europe"],
    ["JPY", "Asia"],
    ["HKD", "Asia"],
    ["CNY", "Asia"],
    ["CNH", "Asia"],
    ["TWD", "Asia"],
    ["INR", "Asia"],
    ["KRW", "Asia"],
    ["SGD", "Asia"],
    ["NGN", "Nigeria"],
    ["ZWL", "Zimbabwe"]
  ]);

  const UK_NAME_PATTERNS = [
    /\bp\.?\s*l\.?\s*c\.?\b/i,
    /\bpublic limited company\b/i,
    /\b(unilever|astrazeneca|british american tobacco|shell|bp|hsbc|diageo|gsk|glaxosmithkline)\b/i
  ];

  const EUROPE_NAME_PATTERNS = [
    /\bs\.?\s*e\.?\b/i,
    /\ba\.?\s*g\.?\b/i,
    /\bn\.?\s*v\.?\b/i,
    /\bs\.?\s*a\.?\b/i,
    /\ba\/s\b/i,
    /\bnovo nordisk\b/i,
    /\bubs group\b/i,
    /\bsociete\b/i
  ];

  const CANADA_NAME_PATTERNS = [
    /\broyal bank of canada\b/i,
    /\bcanadian imperial bank\b/i,
    /\bbank of montreal\b/i,
    /\bmanulife\b/i,
    /\bsun life\b/i,
    /\bboyd group\b/i,
    /\bagnico eagle\b/i,
    /\bwest fraser\b/i,
    /\btoronto dominion\b/i,
    /\bcanadian\b/i
  ];

  const ASIA_NAME_PATTERNS = [
    /\btaiwan semiconductor\b/i,
    /\btoyota\b/i,
    /\bmitsubishi\b/i,
    /\bsumitomo\b/i,
    /\bhdfc\b/i,
    /\balibaba\b/i,
    /\bjd\.?com\b/i,
    /\bnovo nordisk china\b/i,
    /\btakeda\b/i,
    /\bsony\b/i,
    /\btaiwan\b/i
  ];

  function normalizeMarketCandidate(value) {
    const text = String(value || "").trim();
    return SUPPORTED_MARKETS.has(text) ? text : "";
  }

  function marketFromSourceUrl(sourceUrl = "") {
    const text = String(sourceUrl || "");
    for (const entry of SOURCE_URL_MARKETS) {
      if (entry.pattern.test(text)) return entry.market;
    }
    return "";
  }

  function marketFromCurrency(currency = "") {
    const text = String(currency || "").trim();
    if (!text) return "";
    const direct = CURRENCY_MARKETS.get(text);
    if (direct) return direct;
    const collapsed = text.toUpperCase().replace(/[^A-Z]/g, "");
    return CURRENCY_MARKETS.get(collapsed) || "";
  }

  function matchesAny(text, patterns) {
    return patterns.some((pattern) => pattern.test(text));
  }

  function manualOverrideMarket(symbol, row = {}) {
    const direct = MANUAL_TICKER_MARKET_OVERRIDES.get(symbol);
    if (!direct) return "";
    const sourceUrl = String(row.dividendSourceUrl || row.sourceUrl || "");
    const explicitMarket = normalizeMarketCandidate(row.market || row.sourceMarket || row.marketHint);
    if (/stockanalysis\.com\/stocks\//i.test(sourceUrl)) return direct;
    if (!sourceUrl && !explicitMarket) return direct;
    if (explicitMarket && explicitMarket !== "US" && explicitMarket !== direct) return explicitMarket;
    return direct;
  }

  function inferPlatformMarket(ticker, company, row = {}) {
    const symbol = String(ticker || row.symbol || "").trim().toUpperCase();
    const name = String(company || row.company || "").trim();
    const explicitMarket = normalizeMarketCandidate(row.market || row.sourceMarket || row.marketHint);
    const sourceMarket = marketFromSourceUrl(row.dividendSourceUrl || row.sourceUrl || "");
    if (sourceMarket) return sourceMarket;

    const overrideMarket = manualOverrideMarket(symbol, row);
    if (overrideMarket) return overrideMarket;

    if (CANADA_TICKERS.has(symbol)) return "Canada";
    if (ASIA_TICKERS.has(symbol)) return "Asia";
    if (UK_TICKERS.has(symbol)) return "UK";
    if (EUROPE_TICKERS.has(symbol)) return "Europe";

    const currencyMarket = marketFromCurrency(row.dividendCurrency || row.currency || "");
    if (currencyMarket) return currencyMarket;

    if (matchesAny(name, CANADA_NAME_PATTERNS)) return "Canada";
    if (matchesAny(name, ASIA_NAME_PATTERNS)) return "Asia";
    if (matchesAny(name, UK_NAME_PATTERNS)) return "UK";
    if (matchesAny(name, EUROPE_NAME_PATTERNS)) return "Europe";

    if (explicitMarket && ["Canada", "UK", "Asia", "Nigeria", "Zimbabwe"].includes(explicitMarket)) {
      return explicitMarket;
    }
    if (explicitMarket === "Europe" && (sourceMarket || currencyMarket || EUROPE_TICKERS.has(symbol) || matchesAny(name, EUROPE_NAME_PATTERNS))) {
      return explicitMarket;
    }
    return "US";
  }

  return {
    inferPlatformMarket,
    normalizeMarketCandidate
  };
}));
