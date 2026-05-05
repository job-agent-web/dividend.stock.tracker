const crypto = require("crypto");

const otpMinutesValid = 10;

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

function supabaseAuthKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function authRedirectUrl(origin) {
  const configured = String(
    process.env.SUPABASE_MAGIC_LINK_REDIRECT_URL ||
    process.env.AUTH_REDIRECT_URL ||
    process.env.APP_URL ||
    ""
  ).trim();
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const base = configured || origin || vercelUrl;
  if (!base) return "";
  if (/\.html(?:[?#].*)?$/i.test(base)) return base;
  return `${base.replace(/\/+$/, "")}/auth-callback.html`;
}

async function sendSupabaseMagicLink({ email, username, origin } = {}) {
  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const apiKey = supabaseAuthKey();
  if (!supabaseUrl || !apiKey) {
    return { sent: false, reason: "Supabase Auth is not configured for magic links." };
  }

  const redirectTo = authRedirectUrl(origin);
  const response = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      data: {
        username: username || "",
        app: process.env.APP_NAME || "Dividend Stock Tracker"
      },
      options: redirectTo ? { redirectTo } : undefined
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { sent: false, reason: extractProviderMessage(detail) };
  }
  return { sent: true, redirectTo };
}

async function getSupabaseUserFromAccessToken(accessToken) {
  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const apiKey = supabaseAuthKey();
  if (!supabaseUrl || !apiKey) {
    throw new Error("Supabase Auth is not configured for magic links.");
  }
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`
    }
  });
  const text = await response.text().catch(() => "");
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error_description || text || "Magic link could not be verified.");
  }
  return data;
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

async function issueHostedOtp(user = {}) {
  const email = String(user.email || "").trim().toLowerCase();
  const username = String(user.username || "").trim();
  if (!isValidEmail(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const code = generateOtpCode();
  const emailResult = await sendWithResend({ email, username, code });
  if (!emailResult.sent) {
    return {
      ok: false,
      message: "Email OTP could not be sent from this deployment.",
      reason: emailResult.reason
    };
  }

  return {
    ok: true,
    otpHash: hashOtp(code),
    otpIssuedAt: new Date().toISOString(),
    otpExpiresAt: new Date(Date.now() + otpMinutesValid * 60000).toISOString(),
    otpDelivery: "email"
  };
}

module.exports = {
  chooseOtpSender,
  getSupabaseUserFromAccessToken,
  hashOtp,
  isValidEmail,
  issueHostedOtp,
  otpMinutesValid,
  sendSupabaseMagicLink
};
