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

function parseEmailAddress(value) {
  const text = String(value || "").trim();
  const match = text.match(/<([^>\s]+@[^>\s]+)>/);
  if (match) return match[1].trim();
  const direct = text.match(/[^\s<>]+@[^\s<>]+/);
  return direct ? direct[0].trim() : "";
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
    const message = parsed?.message || parsed?.msg || parsed?.error_description || parsed?.error?.message || text;
    if (parsed?.error_code === "over_email_send_rate_limit" || /only request this after/i.test(message)) {
      const seconds = String(message).match(/after\s+(\d+)\s+seconds?/i)?.[1];
      return seconds
        ? `A verification link was already requested. Please wait ${seconds} seconds, then try again.`
        : "A verification link was already requested recently. Please wait a little before trying again.";
    }
    return message;
  } catch {
    return text;
  }
}

function safeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainText(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

function brevoSenderEmail() {
  return parseEmailAddress(
    process.env.BREVO_SENDER_EMAIL ||
    process.env.BREVO_FROM_EMAIL ||
    process.env.SENDINBLUE_SENDER_EMAIL ||
    ""
  );
}

function brevoSenderName() {
  return String(process.env.BREVO_SENDER_NAME || process.env.APP_NAME || "Dividend Stock Tracker").trim();
}

function brevoReplyToEmail() {
  return parseEmailAddress(
    process.env.BREVO_REPLY_TO_EMAIL ||
    process.env.OTP_REPLY_TO_EMAIL ||
    "dividendstocktracker@gmail.com"
  );
}

async function sendWithBrevo({ email, username, code }) {
  const apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  if (!apiKey) return { sent: false, reason: "Missing BREVO_API_KEY" };

  const senderEmail = brevoSenderEmail();
  if (!senderEmail) {
    return { sent: false, reason: "Missing BREVO_SENDER_EMAIL" };
  }

  const appName = process.env.APP_NAME || "Dividend Stock Tracker";
  const replyToEmail = brevoReplyToEmail();
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: brevoSenderName(),
        email: senderEmail
      },
      to: [
        {
          email,
          name: username || email
        }
      ],
      replyTo: replyToEmail
        ? {
            email: replyToEmail,
            name: process.env.BREVO_REPLY_TO_NAME || appName
          }
        : undefined,
      subject: `Confirm your ${appName} signup`,
      htmlContent: `
        <div style="margin:0;padding:24px;background:#111827;font-family:Arial,sans-serif;color:#f8fafc">
          <div style="max-width:520px;margin:0 auto;background:#020617;border-radius:20px;padding:28px;border:1px solid #1f2937">
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#ffffff">Your login code</h1>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.5;color:#e5e7eb">Hello ${safeText(username || "Investor")},</p>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#e5e7eb">Use this one-time code to continue:</p>
            <p style="margin:0 0 22px;font-size:40px;letter-spacing:8px;font-weight:800;color:#ffffff">${safeText(code)}</p>
            <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#cbd5e1">This code expires in ${otpMinutesValid} minutes.</p>
            <p style="margin:0;font-size:14px;line-height:1.5;color:#cbd5e1">If you did not request this code, you can ignore this email.</p>
          </div>
        </div>
      `
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { sent: false, reason: extractProviderMessage(detail) };
  }
  return { sent: true, provider: "brevo" };
}

function uniqueRecipients(recipients = []) {
  return [...new Set(
    recipients
      .map((recipient) => parseEmailAddress(recipient))
      .filter((email) => isValidEmail(email))
      .map((email) => email.toLowerCase())
  )];
}

function recipientChunks(recipients, size = 90) {
  const chunks = [];
  for (let index = 0; index < recipients.length; index += size) {
    chunks.push(recipients.slice(index, index + size));
  }
  return chunks;
}

async function sendBroadcastEmail({ recipients = [], subject = "", html = "", text = "" } = {}) {
  const list = uniqueRecipients(recipients);
  if (!list.length) {
    return { sent: false, reason: "No valid recipients were provided." };
  }

  const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  if (brevoApiKey) {
    const senderEmail = brevoSenderEmail();
    if (!senderEmail) {
      return { sent: false, reason: "Missing BREVO_SENDER_EMAIL" };
    }
    const chunks = recipientChunks(list);
    let sentCount = 0;
    for (const chunk of chunks) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify({
          sender: {
            name: brevoSenderName(),
            email: senderEmail
          },
          to: [
            {
              email: senderEmail,
              name: brevoSenderName()
            }
          ],
          bcc: chunk.map((email) => ({ email })),
          replyTo: brevoReplyToEmail()
            ? {
                email: brevoReplyToEmail(),
                name: process.env.BREVO_REPLY_TO_NAME || process.env.APP_NAME || "Dividend Stock Tracker"
              }
            : undefined,
          subject,
          htmlContent: html,
          textContent: plainText(text || html)
        })
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        return { sent: false, reason: extractProviderMessage(detail), provider: "brevo", sentCount };
      }
      sentCount += chunk.length;
    }
    return { sent: true, provider: "brevo", sentCount };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const from = chooseOtpSender();
    const chunks = recipientChunks(list, 50);
    let sentCount = 0;
    for (const chunk of chunks) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          reply_to: "dividendstocktracker@gmail.com",
          to: [parseEmailAddress(from) || chunk[0]],
          bcc: chunk,
          subject,
          html,
          text: plainText(text || html)
        })
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        return { sent: false, reason: extractProviderMessage(detail), provider: "resend", sentCount };
      }
      sentCount += chunk.length;
    }
    return { sent: true, provider: "resend", sentCount };
  }

  return { sent: false, reason: "No email provider is configured for broadcast delivery." };
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
  let emailResult = await sendWithBrevo({ email, username, code });
  if (!emailResult.sent && !process.env.BREVO_API_KEY && !process.env.SENDINBLUE_API_KEY) {
    emailResult = await sendWithResend({ email, username, code });
  }
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
    otpDelivery: emailResult.provider || "email"
  };
}

module.exports = {
  chooseOtpSender,
  getSupabaseUserFromAccessToken,
  hashOtp,
  isValidEmail,
  issueHostedOtp,
  otpMinutesValid,
  sendBroadcastEmail,
  sendWithBrevo,
  sendSupabaseMagicLink
};
