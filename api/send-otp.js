const crypto = require("crypto");

const otpMinutesValid = 10;

function json(response, status, payload) {
  response.status(status).json(payload);
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || "").trim());
}

function senderDomain(sender) {
  const match = String(sender || "").match(/@([^>\s]+)/);
  return match ? match[1].toLowerCase() : "";
}

function chooseOtpSender() {
  const configured = String(
    process.env.OTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || ""
  ).trim();
  const fallback = "Dividend Stock Tracker <onboarding@resend.dev>";
  const blockedDomains = new Set([
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "aol.com"
  ]);

  if (!configured) return fallback;
  return blockedDomains.has(senderDomain(configured)) ? fallback : configured;
}

function extractProviderMessage(detail) {
  const text = String(detail || "").trim();
  if (!text) return "Email provider rejected request";
  try {
    const parsed = JSON.parse(text);
    return parsed?.message || parsed?.error?.message || text;
  } catch {
    return text;
  }
}

async function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

async function sendWithResend({ email, username, code }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "Missing RESEND_API_KEY" };

  const from = chooseOtpSender();
  const appName = process.env.APP_NAME || "Dividend Stock Tracker";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      reply_to: "dividendstocktracker@gmail.com",
      to: [email],
      subject: `${appName} verification code`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#10233f">
          <h2>${appName} verification</h2>
          <p>Hello ${username || "Investor"},</p>
          <p>Your one-time password is:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#2563eb">${code}</p>
          <p>This OTP expires in ${otpMinutesValid} minutes.</p>
          <p>If you did not request this code, you can ignore this email.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { sent: false, reason: extractProviderMessage(detail) };
  }
  return { sent: true };
}

module.exports = async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    json(response, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const username = String(body.username || "").trim();
    if (!isValidEmail(email)) {
      json(response, 400, { ok: false, message: "Enter a valid email address." });
      return;
    }

    const code = generateOtpCode();
    const emailResult = await sendWithResend({ email, username, code });
    if (!emailResult.sent) {
      json(response, 503, {
        ok: false,
        message: "Email OTP could not be sent from this deployment.",
        reason: emailResult.reason
      });
      return;
    }

    json(response, 200, {
      ok: true,
      otpHash: hashOtp(code),
      otpIssuedAt: new Date().toISOString(),
      otpExpiresAt: new Date(Date.now() + otpMinutesValid * 60000).toISOString()
    });
  } catch (error) {
    json(response, 500, {
      ok: false,
      message: "Could not send OTP right now."
    });
  }
};
