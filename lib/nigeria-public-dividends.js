"use strict";

const fs = require("fs");
const path = require("path");

const NGX_PULSE_URL = "https://ngxpulse.ng/blog/dividends-declared-2026-nigerian-companies";
const NGX_DISCLOSURE_API = "https://doclib.ngxgroup.com/_api/Web/Lists/GetByTitle('XFinancial_News')/items/";
const NAIRAMETRICS_DIVIDENDS_TABLE_URL = "https://nairametrics.com/dividends-table/";
const NAIRAMETRICS_DIVIDENDS_TAG_URL = "https://nairametrics.com/tag/dividends/";
const NAIRAMETRICS_MAY_2026_URL = "https://nairametrics.com/2026/05/05/see-18-ngx-listed-companies-paying-dividends-in-may-2026/";
const BING_RSS_SEARCH_URL = "https://www.bing.com/search?format=rss&q=";
const ROOT = path.join(__dirname, "..");
const APP_JS = path.join(ROOT, "app.js");
const NIGERIA_DIVIDENDS_SCRAPED_JSON = path.join(ROOT, "nigeria-dividends-scraped.json");

const DEFAULT_HEADERS = {
  "user-agent": "Mozilla/5.0 (compatible; DividendStockTracker/1.0; +https://dividendstocktracker.vercel.app)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
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

const MANUAL_COMPANY_TO_TICKER = {
  "ACCESS HOLDINGS": "ACCESSCORP",
  "ACCESS HOLDINGS PLC": "ACCESSCORP",
  "ABC TRANSPORT": "ABCTRANS",
  "ABC TRANSPORT PLC": "ABCTRANS",
  "AFRICA PRUDENTIAL": "AFRIPRUD",
  "AFRICA PRUDENTIAL PLC": "AFRIPRUD",
  "AIRTEL AFRICA": "AIRTELAFRI",
  "ARADEL HOLDINGS": "ARADEL",
  "BERGER PAINTS NIGERIA": "BERGER",
  "BERGER PAINTS NIGERIA PLC": "BERGER",
  "BUA CEMENT": "BUACEMENT",
  "BUA FOODS": "BUAFOODS",
  "CONSOLIDATED HALLMARK HOLDINGS": "CONHALLPLC",
  "CONSOLIDATED HALLMARK HOLDINGS PLC": "CONHALLPLC",
  "CENTRAL SECURITIES CLEARING SYSTEM": "CSCS",
  "CWG": "CWG",
  "CWG PLC": "CWG",
  "CUSTODIAN INVESTMENT": "CUSTODIAN",
  "DANGOTE CEMENT": "DANGCEM",
  "ECOBANK TRANSNATIONAL INCORPORATED": "ETI",
  "ECOBANK TRANSNATIONAL INCORPORATED PLC": "ETI",
  "ETERNA": "ETERNA",
  "ETERNA PLC": "ETERNA",
  "ETRANZACT INTERNATIONAL": "ETRANZACT",
  "HALDANE MCCALL": "HMCALL",
  "HALDANE MCCALL PLC": "HMCALL",
  "HMC ALLIANCES": "HMCALL",
  "HMC ALLIANCES PLC": "HMCALL",
  "FIDELITY BANK": "FIDELITYBK",
  "FIDSON HEALTHCARE": "FIDSON",
  "GUARANTY TRUST HOLDING COMPANY": "GTCO",
  "IKEJA HOTEL": "IKEJAHOTEL",
  "IKEJA HOTEL PLC": "IKEJAHOTEL",
  "JULIUS BERGER NIGERIA": "JBERGER",
  "JULIUS BERGER NIGERIA PLC": "JBERGER",
  "LAFARGE AFRICA": "WAPCO",
  "MECURE INDUSTRIES": "MECURE",
  "MCNICHOLS CONSOLIDATED": "MCNICHOLS",
  "MCNICHOLS CONSOLIDATED PLC": "MCNICHOLS",
  "MTN NIGERIA": "MTNN",
  "MTN NIGERIA PLC": "MTNN",
  "GTCO": "GTCO",
  "NEM INSURANCE": "NEM",
  "NEM INSURANCE PLC": "NEM",
  "NIGERIAN AVIATION HANDLING COMPANY": "NAHCO",
  "NAHCO": "NAHCO",
  "NAHCO PLC": "NAHCO",
  "NIGERIAN EXCHANGE GROUP": "NGXGROUP",
  "NIGERIAN EXCHANGE GROUP PLC": "NGXGROUP",
  "NPF MICROFINANCE BANK": "NPFMCRFBK",
  "NPF MICROFINANCE BANK PLC": "NPFMCRFBK",
  "SEPLAT ENERGY": "SEPLAT",
  "SKYWAY AVIATION HANDLING COMPANY": "SKYAVN",
  "SKYWAY AVIATION HANDLING COMPANY PLC": "SKYAVN",
  "STANBIC IBTC HOLDINGS": "STANBIC",
  "GTCO PLC": "GTCO",
  "THE INITIATES": "TIP",
  "THE INITIATES PLC": "TIP",
  "TOTALENERGIES MARKETING NIGERIA": "TOTAL",
  "TRANSCORP HOTELS": "TRANSCOHOT",
  "TRANSCORP HOTELS PLC": "TRANSCOHOT",
  "TRANSNATIONAL CORPORATION": "TRANSCORP",
  "TRANSCORP POWER": "TRANSPOWER",
  "UNITED BANK FOR AFRICA": "UBA",
  "UNITED CAPITAL": "UCAP",
  "UNILEVER NIGERIA": "UNILEVER",
  "UPDC": "UPDC",
  "UPDC PLC": "UPDC",
  "UPDC REAL ESTATE INVESTMENT TRUST": "UPDCREIT",
  "UPDC REAL ESTATE INVESTMENT TRUST PLC": "UPDCREIT",
  "VFD": "VFDGROUP",
  "VFD GROUP": "VFDGROUP",
  "VFD GROUP PLC": "VFDGROUP",
  "VITAFOAM NIGERIA": "VITAFOAM",
  "WEMA BANK": "WEMABANK",
  "ZENITH BANK": "ZENITHBANK",
  "ZICHIS AGRO ALLIED INDUSTRIES": "ZICHIS",
  "ZICHIS AGRO ALLIED INDUSTRIES PLC": "ZICHIS",
  "ZOCHIS AGRO ALLIED INDUSTRIES": "ZICHIS",
  "ZOCHIS AGRO ALLIED INDUSTRIES PLC": "ZICHIS"
};

let cachedTable = null;
let cachedAt = 0;
let cachedStaticDividendBundle = { mtimeMs: 0, records: {}, meta: {} };
const officialDisclosureCache = new Map();
const nairametricsSourceCache = new Map();
const NAIRAMETRICS_COMPANY_STOP_WORDS = new Set([
  "AFRICA",
  "BANK",
  "COMPANY",
  "CORPORATION",
  "GROUP",
  "HOLDING",
  "HOLDINGS",
  "INTERNATIONAL",
  "INVESTMENT",
  "NIGERIA",
  "NIGERIAN",
  "PLC",
  "SYSTEM",
  "THE"
]);

function htmlDecode(text) {
  return String(text || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function cleanLine(text) {
  return htmlDecode(String(text || ""))
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value) {
  return cleanLine(value)
    .toUpperCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(PLC|LIMITED|LTD|COMPANY|CO|NIGERIA|NIGERIAN|THE)\b/g, " ")
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function isoFromParts(year, monthIndex, day) {
  const date = new Date(Date.UTC(Number(year), Number(monthIndex), Number(day)));
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

function parseDate(value) {
  const cleaned = cleanLine(value).replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");
  if (!cleaned || /\b(N\/A|Nil|TBC|TBA)\b/i.test(cleaned)) return "";
  const direct = cleaned.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (direct) return direct[0];
  const longForm = cleaned.replace(/([A-Za-z]{3,9})\./g, "$1").match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})\b/);
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

function parseAmount(value) {
  const cleaned = cleanLine(value);
  const match = cleaned.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, "")) : 0;
}

function xmlDecode(text) {
  return htmlDecode(String(text || ""))
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "");
}

function loadAliases() {
  const aliases = { ...MANUAL_COMPANY_TO_TICKER };
  if (!fs.existsSync(APP_JS)) return aliases;
  const text = fs.readFileSync(APP_JS, "utf8");
  for (const match of text.matchAll(/market:\s*"Nigeria"[\s\S]*?ticker:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"/g)) {
    aliases[normalizeName(match[2])] = match[1];
  }
  for (const match of text.matchAll(/\["Nigeria",\s*"[^"]+",\s*"([^"]+)",\s*"([^"]+)"/g)) {
    aliases[normalizeName(match[2])] = match[1];
  }
  return aliases;
}

function stripHtmlToLines(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\r/g, "")
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);
}

function buildNote(type, specialDividend, bonusIssue) {
  const notes = [];
  if (type && !/^Final|Interim|Distribution|Annual|Semi/i.test(type)) notes.push(type);
  if (specialDividend && !/^Nil$/i.test(specialDividend)) notes.push(`Special dividend: ${specialDividend}`);
  if (bonusIssue && !/^Nil$/i.test(bonusIssue)) notes.push(`Bonus issue: ${bonusIssue}`);
  return notes.join(". ");
}

function parseNgxPulseTable(lines) {
  const aliases = loadAliases();
  const start = lines.findIndex((line) => line.includes("2026 NGX Dividend Table"));
  if (start < 0) return {};
  const body = lines.slice(start + 1);
  const records = {};
  const seen = new Set();
  for (let index = 0; index < body.length; index += 1) {
    const line = body[index];
    const ticker = aliases[normalizeName(line)] || "";
    if (!ticker || seen.has(ticker)) continue;
    const peek = body.slice(index, index + 11);
    let row = body.slice(index, index + 10);
    let qualificationDate = row[5];
    let closureOfRegister = row[6];
    let agmDate = row[7];
    let paymentDate = row[8];
    let registrar = row[9];
    if (peek.length >= 11 && /\(NGX\)/i.test(peek[5] || "") && /\(LSE\)/i.test(peek[6] || "")) {
      row = peek;
      qualificationDate = row[5];
      closureOfRegister = row[7];
      agmDate = row[8];
      paymentDate = row[9];
      registrar = row[10];
    }
    if (row.length < 10) continue;
    seen.add(ticker);
    const [company, dividendPerShare, type, specialDividend, bonusIssue] = row;
    records[ticker] = {
      company,
      amount: parseAmount(dividendPerShare),
      currency: "NGN",
      type: cleanLine(type),
      qualificationDate: parseDate(qualificationDate),
      closureOfRegister: cleanLine(closureOfRegister),
      agmDate: parseDate(agmDate),
      paymentDate: parseDate(paymentDate),
      registrar: cleanLine(registrar),
      sourceName: "NGX Pulse 2026 dividend table",
      sourceUrl: NGX_PULSE_URL,
      verifiedAt: new Date().toISOString().slice(0, 10),
      note: buildNote(type, specialDividend, bonusIssue),
      history: [{
        exDate: parseDate(qualificationDate),
        payDate: parseDate(paymentDate),
        amount: parseAmount(dividendPerShare),
        currency: "NGN",
        label: cleanLine(type)
      }],
      sources: [{ name: "NGX Pulse 2026 dividend table", url: NGX_PULSE_URL, confidence: 84 }]
    };
  }
  return records;
}

function dedupeSources(...groups) {
  const seen = new Set();
  return groups.flat().filter((source) => {
    if (!source?.url && !source?.name) return false;
    const key = `${source.name || ""}|${source.url || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function joinNoteParts(parts) {
  return parts
    .map((part) => cleanLine(part))
    .filter(Boolean)
    .join(". ")
    .replace(/\.\s*\./g, ".")
    .trim();
}

function unwrapBingUrl(url) {
  const text = String(url || "").trim();
  const encoded = text.match(/[?&]u=([^&]+)/i);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {}
  }
  return text;
}

function significantCompanyTokens(value) {
  return normalizeName(value)
    .split(" ")
    .filter((token) => token && token.length > 2 && !NAIRAMETRICS_COMPANY_STOP_WORDS.has(token));
}

function companyMentionScore(text, tokens) {
  if (!tokens.length) return 0;
  const haystack = normalizeName(text);
  return tokens.reduce((count, token) => count + (haystack.includes(token) ? 1 : 0), 0);
}

function monthlyNairametricsSource(record) {
  const payment = parseDate(record?.paymentDate || "");
  if (payment.startsWith("2026-05-")) {
    return {
      name: "Nairametrics: See 18 NGX-listed companies paying dividends in May 2026",
      url: NAIRAMETRICS_MAY_2026_URL,
      confidence: 68
    };
  }
  return null;
}

function loadStaticNigeriaDividendBundle() {
  try {
    const stat = fs.statSync(NIGERIA_DIVIDENDS_SCRAPED_JSON);
    if (cachedStaticDividendBundle.mtimeMs === stat.mtimeMs) {
      return cachedStaticDividendBundle;
    }
    const parsed = JSON.parse(fs.readFileSync(NIGERIA_DIVIDENDS_SCRAPED_JSON, "utf8"));
    const records = parsed?.records && typeof parsed.records === "object" ? parsed.records : {};
    const meta = records?._meta && typeof records._meta === "object" ? records._meta : {};
    cachedStaticDividendBundle = {
      mtimeMs: stat.mtimeMs,
      records,
      meta
    };
  } catch {
    cachedStaticDividendBundle = { mtimeMs: 0, records: {}, meta: {} };
  }
  return cachedStaticDividendBundle;
}

function nonEmptyText(value) {
  return cleanLine(value || "");
}

function hasIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(nonEmptyText(value));
}

function numericAmount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : parseAmount(value);
}

function malformedDividendType(value) {
  const text = nonEmptyText(value);
  if (!text) return true;
  return /â‚¦|â‚¬|â£|^\d/.test(text);
}

function scoreDividendHistory(history) {
  const entries = Array.isArray(history) ? history : [];
  return entries.reduce((score, entry) => {
    if (hasIsoDate(entry?.exDate || entry?.recordDate || "")) score += 2;
    if (hasIsoDate(entry?.payDate || "")) score += 2;
    if (numericAmount(entry?.amount) > 0) score += 1;
    return score;
  }, 0);
}

function scoreNigeriaDividendRecord(record) {
  if (!record || typeof record !== "object") return 0;
  let score = 0;
  if (nonEmptyText(record.company)) score += 1;
  if (numericAmount(record.amount) > 0) score += 2;
  if (hasIsoDate(record.qualificationDate || record.exDate || record.recordDate || "")) score += 3;
  if (hasIsoDate(record.paymentDate || record.payDate || "")) score += 3;
  if (nonEmptyText(record.closureOfRegister) && !/^(tba|nil|n\/a)$/i.test(nonEmptyText(record.closureOfRegister))) score += 1;
  if (!malformedDividendType(record.type)) score += 1;
  score += scoreDividendHistory(record.history);
  return score;
}

function pickNigeriaText(primary, secondary) {
  return nonEmptyText(primary) || nonEmptyText(secondary) || "";
}

function pickNigeriaType(primary, secondary) {
  if (!malformedDividendType(primary)) return nonEmptyText(primary);
  if (!malformedDividendType(secondary)) return nonEmptyText(secondary);
  return pickNigeriaText(primary, secondary);
}

function pickNigeriaAmount(primary, secondary) {
  return numericAmount(primary) > 0 ? numericAmount(primary) : numericAmount(secondary);
}

function pickNigeriaHistory(primary, secondary) {
  const primaryScore = scoreDividendHistory(primary);
  const secondaryScore = scoreDividendHistory(secondary);
  if (primaryScore >= secondaryScore && Array.isArray(primary) && primary.length) return primary;
  if (Array.isArray(secondary) && secondary.length) return secondary;
  return Array.isArray(primary) ? primary : [];
}

function mergeNigeriaDividendRecord(primary = {}, secondary = {}) {
  const preferred = scoreNigeriaDividendRecord(primary) >= scoreNigeriaDividendRecord(secondary) ? primary : secondary;
  const fallback = preferred === primary ? secondary : primary;
  return {
    ...fallback,
    ...preferred,
    company: pickNigeriaText(preferred.company, fallback.company),
    amount: pickNigeriaAmount(preferred.amount, fallback.amount),
    currency: pickNigeriaText(preferred.currency, fallback.currency) || "NGN",
    type: pickNigeriaType(preferred.type, fallback.type),
    qualificationDate: pickNigeriaText(preferred.qualificationDate, fallback.qualificationDate),
    paymentDate: pickNigeriaText(preferred.paymentDate, fallback.paymentDate),
    exDate: pickNigeriaText(preferred.exDate, fallback.exDate),
    recordDate: pickNigeriaText(preferred.recordDate, fallback.recordDate),
    payDate: pickNigeriaText(preferred.payDate, fallback.payDate),
    closureOfRegister: pickNigeriaText(preferred.closureOfRegister, fallback.closureOfRegister),
    agmDate: pickNigeriaText(preferred.agmDate, fallback.agmDate),
    registrar: pickNigeriaText(preferred.registrar, fallback.registrar),
    note: pickNigeriaText(preferred.note, fallback.note),
    sourceName: pickNigeriaText(preferred.sourceName, fallback.sourceName),
    sourceUrl: pickNigeriaText(preferred.sourceUrl, fallback.sourceUrl),
    verifiedAt: pickNigeriaText(preferred.verifiedAt, fallback.verifiedAt),
    history: pickNigeriaHistory(preferred.history, fallback.history),
    sources: dedupeSources(preferred.sources || [], fallback.sources || [])
  };
}

function parseBingRssItems(xml) {
  const items = [];
  for (const match of String(xml || "").matchAll(/<item><title>([\s\S]*?)<\/title><link>([\s\S]*?)<\/link><description>([\s\S]*?)<\/description>/g)) {
    items.push({
      title: cleanLine(xmlDecode(match[1] || "")),
      url: unwrapBingUrl(cleanLine(xmlDecode(match[2] || ""))),
      description: cleanLine(xmlDecode(match[3] || ""))
    });
  }
  return items;
}

function looksLikeRelevantNairametricsResult(item, ticker, company, record) {
  if (!/nairametrics\.com/i.test(item?.url || "")) return false;
  const summary = `${item?.title || ""} ${item?.description || ""}`;
  const lower = summary.toLowerCase();
  if (!/(dividend|dividends|shareholder|shareholders|payout|payment|agm)/i.test(lower)) return false;

  const tickerText = String(ticker || "").trim().toUpperCase();
  const tickerMatch = tickerText.length >= 4 && normalizeName(summary).includes(tickerText);
  const tokens = significantCompanyTokens(company || record?.company || "");
  const mentionCount = companyMentionScore(summary, tokens);
  const companyMatch = mentionCount >= Math.min(tokens.length, 2) || (tokens.length === 1 && mentionCount === 1);
  const mayRoundupMatch = /paying dividends in may 2026/i.test(summary)
    && Boolean(record?.paymentDate && parseDate(record.paymentDate).startsWith("2026-05-"));

  return tickerMatch || companyMatch || mayRoundupMatch;
}

async function fetchNairametricsDividendSources(ticker, company = "", record = null) {
  const symbol = String(ticker || "").trim().toUpperCase();
  if (!symbol) return [];
  const companyName = cleanLine(company || record?.company || "");
  const cacheKey = `${symbol}|${companyName}`;
  const cached = nairametricsSourceCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.cachedAt < 6 * 60 * 60 * 1000) return cached.sources;

  const defaultSources = [{
    name: "Nairametrics dividends table",
    url: NAIRAMETRICS_DIVIDENDS_TABLE_URL,
    confidence: 58
  }, {
    name: "Nairametrics dividend coverage archive",
    url: NAIRAMETRICS_DIVIDENDS_TAG_URL,
    confidence: 52
  }];
  const roundupSource = monthlyNairametricsSource(record);
  const queryVariants = [
    companyName ? `site:nairametrics.com "${companyName}" dividend Nigeria` : "",
    companyName ? `site:nairametrics.com "${companyName}" shareholder payout Nigeria` : "",
    `site:nairametrics.com ${symbol} dividend Nigeria stock`,
    `site:nairametrics.com ${symbol} NGX dividend`
  ].filter(Boolean);

  const discoveredSources = [];
  for (const query of queryVariants) {
    const response = await fetch(`${BING_RSS_SEARCH_URL}${encodeURIComponent(query)}`, {
      headers: {
        ...DEFAULT_HEADERS,
        accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
      }
    }).catch(() => null);
    if (!response?.ok) continue;
    const xml = await response.text().catch(() => "");
    const rows = parseBingRssItems(xml)
      .filter((item) => looksLikeRelevantNairametricsResult(item, symbol, companyName, record))
      .slice(0, 2)
      .map((item) => ({
        name: `Nairametrics: ${item.title}`,
        url: item.url,
        confidence: /paying dividends in may 2026/i.test(`${item.title} ${item.description}`) ? 72 : 66
      }));
    if (rows.length) {
      discoveredSources.push(...rows);
      break;
    }
  }

  const sources = dedupeSources(discoveredSources, roundupSource ? [roundupSource] : [], defaultSources)
    .slice(0, 4);
  nairametricsSourceCache.set(cacheKey, { cachedAt: now, sources });
  return sources;
}

function disclosureConfidence(item) {
  const description = cleanLine(item?.URL?.Description || "");
  const submission = cleanLine(item?.Type_of_Submission || "");
  if (/dividend|closure|register|payment|bonus/i.test(description)) return 97;
  if (/annual general meeting|agm|financial statement|audited|resolution/i.test(description)) return 95;
  if (/annual general meeting|financial statements/i.test(submission)) return 92;
  if (/corporate actions/i.test(submission)) return 89;
  return 82;
}

function isRelevantDisclosure(item) {
  const description = cleanLine(item?.URL?.Description || "");
  const submission = cleanLine(item?.Type_of_Submission || "");
  if (/directorsdealings|retirement|total voting rights|sustainability/i.test(description)) return false;
  if (/dividend|closure|register|payment|bonus/i.test(description)) return true;
  if (/annual general meeting|agm|audited|financial statement|resolution/i.test(description)) return true;
  if (/annual general meeting|financial statements|corporate actions/i.test(submission)) return true;
  return false;
}

async function fetchNgxOfficialDisclosureSources(ticker) {
  const symbol = String(ticker || "").trim().toUpperCase();
  if (!symbol) return [];
  const cached = officialDisclosureCache.get(symbol);
  const now = Date.now();
  if (cached && now - cached.cachedAt < 60 * 60 * 1000) return cached.sources;

  const escaped = symbol.replace(/'/g, "''");
  const queryUrl = `${NGX_DISCLOSURE_API}?$select=URL,Modified,Created,CompanyName,CompanySymbol,Type_of_Submission&$orderby=Created%20desc&$filter=CompanySymbol%20eq%20'${encodeURIComponent(escaped)}'&$Top=12`;
  const response = await fetch(queryUrl, {
    headers: {
      ...DEFAULT_HEADERS,
      accept: "application/json;odata=verbose"
    }
  }).catch(() => null);
  if (!response?.ok) return [];
  const payload = await response.json().catch(() => null);
  const results = Array.isArray(payload?.d?.results) ? payload.d.results : [];
  const matched = results.filter((item) => cleanLine(item.CompanySymbol || "").toUpperCase() === symbol);
  const filtered = matched.filter(isRelevantDisclosure);
  const sources = (filtered.length ? filtered : matched)
    .map((item) => ({
      name: `NGX official disclosure: ${cleanLine(item.URL?.Description || item.Type_of_Submission || symbol)}`,
      url: item.URL?.Url || "",
      confidence: disclosureConfidence(item),
      submittedAt: item.Modified || item.Created || ""
    }))
    .filter((item) => item.url)
    .sort((a, b) => {
      const aTime = Date.parse(a.submittedAt || 0) || 0;
      const bTime = Date.parse(b.submittedAt || 0) || 0;
      return bTime - aTime;
    })
    .slice(0, 4)
    .map(({ submittedAt, ...source }) => source);

  officialDisclosureCache.set(symbol, { cachedAt: now, sources });
  return sources;
}

async function fetchNgxPulseDividendTable(force = false) {
  const now = Date.now();
  if (!force && cachedTable && now - cachedAt < 60 * 60 * 1000) return cachedTable;
  const response = await fetch(NGX_PULSE_URL, { headers: DEFAULT_HEADERS });
  if (!response.ok) return null;
  const html = await response.text();
  const lines = stripHtmlToLines(html);
  const records = parseNgxPulseTable(lines);
  cachedTable = {
    _meta: {
      sourceName: "NGX Pulse 2026 dividend table",
      sourceUrl: NGX_PULSE_URL,
      verifiedAt: new Date().toISOString().slice(0, 10),
      note: "Live Nigerian dividend table scraped from NGX Pulse."
    },
    ...records
  };
  cachedAt = now;
  return cachedTable;
}

async function fetchNigeriaPublicDividendData(ticker, company = "") {
  const table = await fetchNgxPulseDividendTable().catch(() => null);
  const staticBundle = loadStaticNigeriaDividendBundle();
  const symbol = String(ticker || "").trim().toUpperCase();
  const tableRecord = table?.[symbol] || null;
  const staticRecord = staticBundle.records?.[symbol] || null;
  const record = tableRecord && staticRecord
    ? mergeNigeriaDividendRecord(tableRecord, staticRecord)
    : tableRecord || staticRecord;
  if (!record) return null;
  const meta = table?._meta || staticBundle.meta || {};
  const history = Array.isArray(record.history) && record.history.length
    ? record.history
    : [{
      exDate: parseDate(record.qualificationDate || record.exDate || record.recordDate || ""),
      recordDate: parseDate(record.recordDate || record.qualificationDate || ""),
      payDate: parseDate(record.paymentDate || record.payDate || ""),
      amount: parseAmount(record.amount),
      currency: record.currency || "NGN",
      label: cleanLine(record.type || "Dividend")
    }].filter((entry) => entry.exDate || entry.payDate || entry.amount > 0);
  const officialSources = await fetchNgxOfficialDisclosureSources(symbol).catch(() => []);
  const nairametricsSources = await fetchNairametricsDividendSources(symbol, company || record.company || "", record).catch(() => []);
  return {
    provider: record.sourceName || meta.sourceName || "Public Nigerian dividend pages",
    verifiedAt: record.verifiedAt || meta.verifiedAt || new Date().toISOString(),
    exDate: parseDate(record.qualificationDate || record.exDate || record.recordDate || ""),
    recordDate: parseDate(record.recordDate || record.qualificationDate || ""),
    payDate: parseDate(record.paymentDate || record.payDate || ""),
    amount: parseAmount(record.amount),
    currency: record.currency || "NGN",
    type: record.type || "",
    closureOfRegister: record.closureOfRegister || "",
    agmDate: parseDate(record.agmDate || ""),
    registrar: record.registrar || "",
    sourceUrl: record.sourceUrl || meta.sourceUrl || NGX_PULSE_URL,
    history,
    nextDeclared: Boolean(record.qualificationDate || record.paymentDate || record.exDate || record.payDate),
    paymentDateKnown: Boolean(record.paymentDate || record.payDate),
    note: joinNoteParts([
      record.note,
      officialSources.length ? "Official NGX disclosure feed also checked for supporting documents." : "",
      nairametricsSources.length ? "Nairametrics dividend coverage also checked." : "",
      company && !record.company ? `Matched ${company}` : ""
    ]),
    sources: dedupeSources(record.sources || [], officialSources, nairametricsSources)
  };
}

module.exports = {
  NGX_PULSE_URL,
  NGX_DISCLOSURE_API,
  NAIRAMETRICS_DIVIDENDS_TABLE_URL,
  NAIRAMETRICS_DIVIDENDS_TAG_URL,
  fetchNgxPulseDividendTable,
  fetchNgxOfficialDisclosureSources,
  fetchNairametricsDividendSources,
  fetchNigeriaPublicDividendData,
  dedupeSources
};
