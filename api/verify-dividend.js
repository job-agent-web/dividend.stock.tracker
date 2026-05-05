const fs = require("fs");
const path = require("path");
const marketData = require("./market-data.js");

function readWindowDataset(filename, variableName) {
  const filePath = path.join(__dirname, "..", filename);
  if (!fs.existsSync(filePath)) return {};
  const code = fs.readFileSync(filePath, "utf8");
  const windowObject = {};
  try {
    Function("window", `${code}\nreturn window.${variableName} || {};`)(windowObject);
    return windowObject[variableName] || {};
  } catch {
    return {};
  }
}

function mergeDividendSources(baseSource = {}, updateSource = {}) {
  const combined = {};
  Object.entries(baseSource || {}).forEach(([ticker, record]) => {
    if (ticker.startsWith("_") || !record) return;
    combined[ticker] = { ...record };
  });
  Object.entries(updateSource || {}).forEach(([ticker, record]) => {
    if (ticker.startsWith("_") || !record) return;
    combined[ticker] = {
      ...(combined[ticker] || {}),
      ...record,
      history: record.history || combined[ticker]?.history,
      sources: record.sources || combined[ticker]?.sources
    };
  });
  return {
    _meta: {
      ...(baseSource?._meta || {}),
      ...(updateSource?._meta || {}),
      note: [baseSource?._meta?.note, updateSource?._meta?.note].filter(Boolean).join(" ")
    },
    ...combined
  };
}

function isoTime(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function hasFutureDate(dividend) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return [dividend?.exDate, dividend?.recordDate, dividend?.payDate]
    .filter(Boolean)
    .some((value) => isoTime(`${value}T00:00:00Z`) >= today.getTime());
}

function evidenceFromRecord(record, fallbackName, fallbackUrl) {
  const rows = Array.isArray(record?.sources) && record.sources.length
    ? record.sources
    : [{
      name: record?.sourceName || fallbackName,
      url: record?.sourceUrl || fallbackUrl,
      confidence: record?.confidence || 0
    }];
  return rows
    .filter((row) => row?.name || row?.url)
    .map((row) => ({
      name: row.name || fallbackName,
      url: row.url || fallbackUrl,
      confidence: Number(row.confidence) || 0
    }));
}

function staticRecordToDividend(record, meta, market) {
  if (!record || typeof record !== "object") return null;
  const exDate = record.qualificationDate || record.exDate || "";
  const payDate = record.paymentDate || record.payDate || "";
  const recordDate = record.recordDate || (market === "Nigeria" ? exDate : "") || "";
  const history = Array.isArray(record.history) ? record.history : [];
  const evidence = evidenceFromRecord(record, meta.sourceName || "Public dividend file", meta.sourceUrl || "");

  return {
    provider: record.sourceName || meta.sourceName || "Public dividend file",
    verifiedAt: record.verifiedAt || meta.verifiedAt || new Date().toISOString(),
    exDate,
    recordDate,
    payDate,
    amount: record.amount,
    currency: record.currency || (market === "Nigeria" ? "NGN" : ""),
    type: record.type,
    closureOfRegister: record.closureOfRegister,
    agmDate: record.agmDate,
    registrar: record.registrar,
    sourceUrl: record.sourceUrl || meta.sourceUrl || evidence[0]?.url || "",
    history,
    nextDeclared: Boolean(exDate || payDate),
    paymentDateKnown: Boolean(payDate),
    note: record.note || meta.note || "",
    evidence
  };
}

function loadStaticDividend(ticker, market) {
  if (market === "Nigeria") {
    const base = readWindowDataset("nigeria-dividends.js", "NIGERIA_DIVIDEND_DATES");
    const updates = readWindowDataset("nigeria-dividends-scraped.js", "NIGERIA_DIVIDEND_UPDATES");
    const merged = mergeDividendSources(base, updates);
    return staticRecordToDividend(merged[ticker], merged._meta || {}, market);
  }

  const marketRecords = readWindowDataset("market-dividends.js", "MARKET_DIVIDEND_DATES");
  const marketUpdates = readWindowDataset("market-dividends-scraped.js", "MARKET_DIVIDEND_UPDATES");
  const merged = mergeDividendSources(marketRecords, marketUpdates);
  const record = merged[`${market}:${ticker}`];
  return staticRecordToDividend(record, merged._meta || {}, market);
}

function mergeEvidence(...groups) {
  const seen = new Set();
  return groups.flat().filter((row) => {
    if (!row) return false;
    const key = `${row.name || ""}|${row.url || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function providerEvidence(dividend) {
  if (!dividend) return [];
  return mergeEvidence([{
    name: dividend.provider || "Dividend data provider",
    url: dividend.sourceUrl || "Configured market-data provider endpoint",
    confidence: dividend.paymentDateKnown === false ? 70 : 86
  }], Array.isArray(dividend.sources) ? dividend.sources : []);
}

function chooseDividend(staticDividend, providerDividend) {
  if (!staticDividend && !providerDividend) return null;
  if (!staticDividend) return providerDividend;
  if (!providerDividend) return staticDividend;

  const providerHasFuture = hasFutureDate(providerDividend);
  const staticHasFuture = hasFutureDate(staticDividend);
  const chosen = providerHasFuture && !staticHasFuture
    ? { ...staticDividend, ...providerDividend }
    : { ...providerDividend, ...staticDividend };

  if (providerDividend.history?.length && !staticDividend.history?.length) {
    chosen.history = providerDividend.history;
  }
  chosen.evidence = mergeEvidence(staticDividend.evidence || [], providerEvidence(providerDividend));
  chosen.note = [staticDividend.note, providerDividend.note].filter(Boolean).join(" ");
  return chosen;
}

function parseAiJson(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function getEnvValue(names) {
  for (const name of names) {
    const value = String(process.env[name] || "").trim();
    if (value) return value;
  }
  return "";
}

function getHuggingFaceToken() {
  return getEnvValue([
    "HF_TOKEN",
    "HF_API_TOKEN",
    "HUGGINGFACE_API_KEY",
    "HUGGING_FACE_API_KEY",
    "HUGGINGFACE_TOKEN",
    "HUGGING_FACE_TOKEN"
  ]);
}

function hasConfiguredAiProvider() {
  return Boolean(
    getEnvValue(["GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "GOOGLE_API_KEY", "GEMINI_KEY"])
    || getHuggingFaceToken()
    || (String(process.env.CF_ACCOUNT_ID || "").trim() && String(process.env.CF_API_TOKEN || "").trim())
  );
}

function providerTimeoutMs() {
  const configured = Number(process.env.AI_PROVIDER_TIMEOUT_MS || 8500);
  if (!Number.isFinite(configured) || configured <= 0) return 8500;
  return Math.max(2500, Math.min(configured, 12000));
}

async function fetchWithTimeout(url, init) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timer = null;
  if (controller) {
    init = { ...(init || {}), signal: controller.signal };
    timer = setTimeout(() => {
      try {
        controller.abort();
      } catch {}
    }, providerTimeoutMs());
  }
  try {
    return await fetch(url, init);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function buildAiProviderOrder() {
  const raw = String(process.env.AI_PROVIDER_ORDER || "gemini,gptoss,cloudflare,huggingface").trim().toLowerCase();
  const baseOrder = raw.split(",").map((item) => item.trim()).filter(Boolean);
  const cycles = Math.max(1, Number(process.env.AI_PROVIDER_CYCLES || 3) || 3);
  const out = [];
  for (let i = 0; i < cycles; i += 1) out.push(...baseOrder);
  return out;
}

function extractGeminiText(parsed) {
  return (parsed?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => typeof part?.text === "string" ? part.text : "")
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function extractChatText(parsed) {
  if (!parsed) return "";
  if (typeof parsed.generated_text === "string") return parsed.generated_text;
  if (typeof parsed.result?.response === "string") return parsed.result.response;
  if (typeof parsed.result?.text === "string") return parsed.result.text;
  return String(parsed.choices?.[0]?.message?.content || "").trim();
}

async function callGeminiChecker({ prompt, systemInstruction }) {
  const apiKey = getEnvValue(["GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "GOOGLE_API_KEY", "GEMINI_KEY"]);
  const model = String(process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").trim();
  if (!apiKey) return { ok: false, message: "Gemini is not configured." };

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          topP: 0.9,
          maxOutputTokens: 700
        }
      })
    }
  );
  const parsed = parseAiJson(await response.text());
  if (!response.ok) {
    return { ok: false, message: parsed?.error?.message || `Gemini ${response.status}` };
  }
  const text = extractGeminiText(parsed);
  return text ? { ok: true, provider: "gemini", model, text } : { ok: false, message: "Gemini returned no usable text." };
}

async function callCloudflareChecker({ prompt, systemInstruction }) {
  const accountId = String(process.env.CF_ACCOUNT_ID || "").trim();
  const token = String(process.env.CF_API_TOKEN || "").trim();
  const model = String(process.env.CF_WORKERS_AI_MODEL || "@cf/meta/llama-3.1-8b-instruct").trim();
  if (!accountId || !token) return { ok: false, message: "Cloudflare Workers AI is not configured." };

  const response = await fetchWithTimeout(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${encodeURIComponent(model)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        max_tokens: 700,
        temperature: 0.1
      })
    }
  );
  const parsed = parseAiJson(await response.text());
  if (!response.ok) {
    return { ok: false, message: parsed?.errors?.[0]?.message || `Cloudflare ${response.status}` };
  }
  const text = extractChatText(parsed);
  return text ? { ok: true, provider: "cloudflare", model, text } : { ok: false, message: "Cloudflare returned no usable text." };
}

async function callHuggingFaceChecker({ prompt, systemInstruction }, provider) {
  const token = getHuggingFaceToken();
  const model = provider === "gptoss" || provider === "gpt-oss"
    ? String(process.env.GPT_OSS_MODEL || "openai/gpt-oss-120b:fastest").trim()
    : String(process.env.HF_CHAT_MODEL || "meta-llama/Llama-3.1-8B-Instruct").trim();
  if (!token) return { ok: false, message: "Hugging Face is not configured." };

  const response = await fetchWithTimeout("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 700
    })
  });
  const parsed = parseAiJson(await response.text());
  if (!response.ok) {
    return { ok: false, message: parsed?.error?.message || parsed?.message || `Hugging Face ${response.status}` };
  }
  const text = extractChatText(parsed);
  const providerName = provider === "gpt-oss" ? "gptoss" : provider;
  return text ? { ok: true, provider: providerName, model, text } : { ok: false, message: "Hugging Face returned no usable text." };
}

async function callAiCheckerProvider(provider, options) {
  if (provider === "gemini") return callGeminiChecker(options);
  if (provider === "cloudflare") return callCloudflareChecker(options);
  if (provider === "gptoss" || provider === "gpt-oss" || provider === "huggingface") {
    return callHuggingFaceChecker(options, provider);
  }
  return { ok: false, message: `AI provider ${provider} is not supported.` };
}

function mergeAiDividend(baseDividend, aiDividend) {
  const merged = { ...baseDividend };
  Object.entries(aiDividend || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length) merged[key] = value;
      return;
    }
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      merged[key] = value;
    }
  });
  return merged;
}

async function runRotatingAiChecker(options) {
  const failures = [];
  const providerOptions = {
    prompt: options.prompt,
    systemInstruction: options.systemInstruction
  };

  for (const provider of buildAiProviderOrder()) {
    let result;
    try {
      result = await callAiCheckerProvider(provider, providerOptions);
    } catch (error) {
      result = { ok: false, message: error?.name === "AbortError" ? "Provider request timed out." : error?.message || "Provider request failed." };
    }

    if (!result.ok) {
      failures.push({ provider, message: result.message || "Provider did not respond." });
      continue;
    }

    const parsed = parseAiJson(result.text);
    if (parsed && Object.prototype.hasOwnProperty.call(parsed, "accepted")) {
      return { ...result, parsed, failures };
    }

    failures.push({ provider, message: "Provider responded, but not with the required dividend JSON." });
  }

  return {
    ok: false,
    failures,
    message: failures.length ? failures[failures.length - 1].message : "No configured AI provider responded."
  };
}

async function runAiChecker({ ticker, market, name, dividend, evidence }) {
  if (!hasConfiguredAiProvider() || !dividend) {
    return { dividend, aiChecked: false, aiNote: "AI checker not configured; using evidence-backed provider/static data." };
  }

  const systemInstruction = [
    "You are a dividend-date checker/parser.",
    "You are not the source of truth.",
    "Use only the supplied exchange, company, registrar, or data-provider evidence.",
    "Return JSON only."
  ].join("\n");
  const prompt = [
    "You are a dividend-date checker/parser.",
    "You are not the source of truth.",
    "Use only the supplied exchange, company, registrar, or data-provider evidence.",
    "Do not invent qualification dates, record dates, payment dates, amounts, registrars, history, or URLs.",
    "Use exDate for the qualification date and payDate for the payment date.",
    "If evidence is incomplete, keep missing fields blank and explain in note.",
    "Return strict JSON only.",
    'Use this exact schema: {"accepted":true,"confidence":0,"dividend":{"exDate":"","recordDate":"","payDate":"","amount":"","currency":"","type":"","closureOfRegister":"","agmDate":"","registrar":"","sourceUrl":"","history":[]},"note":""}.',
    "",
    JSON.stringify({ ticker, market, name, dividend, evidence }, null, 2)
  ].join("\n");

  const result = await runRotatingAiChecker({ prompt, systemInstruction });
  if (!result.ok) {
    return {
      dividend,
      aiChecked: false,
      aiFailures: result.failures || [],
      aiNote: `AI checker unavailable after rotating providers; kept evidence-backed data. ${result.message || ""}`.trim()
    };
  }

  const parsed = result.parsed;
  if (!parsed?.accepted || typeof parsed.dividend !== "object") {
    return {
      dividend,
      aiChecked: true,
      aiProvider: result.provider,
      aiModel: result.model,
      aiFailures: result.failures || [],
      aiNote: parsed?.note || "AI checker did not accept a change; kept evidence-backed data."
    };
  }

  return {
    dividend: mergeAiDividend(dividend, parsed.dividend),
    aiChecked: true,
    aiProvider: result.provider,
    aiModel: result.model,
    aiFailures: result.failures || [],
    aiConfidence: Number(parsed.confidence) || 0,
    aiNote: parsed.note || `AI checker confirmed the evidence-backed dividend fields with ${result.provider}.`
  };
}

module.exports = async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "no-store");

  const ticker = String(request.query.ticker || "").trim().toUpperCase();
  const market = String(request.query.market || "").trim();
  const name = String(request.query.name || "").trim();
  if (!ticker || !market) {
    response.status(400).json({ error: "ticker and market are required" });
    return;
  }

  const staticDividend = loadStaticDividend(ticker, market);
  const providerDividend = await marketData.fetchDividendData(ticker, market).catch(() => null);
  const evidence = mergeEvidence(staticDividend?.evidence || [], providerEvidence(providerDividend));
  const selected = chooseDividend(staticDividend, providerDividend);
  const aiResult = await runAiChecker({ ticker, market, name, dividend: selected, evidence });
  const dividend = aiResult.dividend;

  response.status(200).json({
    ticker,
    market,
    verifiedAt: new Date().toISOString(),
    status: dividend ? "verified" : "no_verified_data",
    dividend: dividend ? {
      ...dividend,
      provider: dividend.provider || "Verified dividend evidence",
      verifiedAt: new Date().toISOString(),
      evidence,
      aiChecked: aiResult.aiChecked,
      aiProvider: aiResult.aiProvider,
      aiModel: aiResult.aiModel,
      aiConfidence: aiResult.aiConfidence,
      note: [dividend.note, aiResult.aiNote].filter(Boolean).join(" ")
    } : null,
    evidence,
    aiChecked: aiResult.aiChecked,
    aiProvider: aiResult.aiProvider,
    aiModel: aiResult.aiModel,
    aiFailures: aiResult.aiFailures,
    message: dividend
      ? "Dividend data checked against source/provider evidence."
      : "No verified dividend evidence was available for this stock."
  });
};
