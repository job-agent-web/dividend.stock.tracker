const crypto = require("crypto");

const sessionCookieName = "dividend_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 12;

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(cookieHeader = "") {
  return String(cookieHeader || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const index = item.indexOf("=");
      if (index === -1) return cookies;
      cookies[item.slice(0, index)] = decodeURIComponent(item.slice(index + 1));
      return cookies;
    }, {});
}

function signSession(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function normalizePasskey(value) {
  let text = String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith("`") && text.endsWith("`"))
  ) {
    text = text.slice(1, -1).trim();
  }

  return text;
}

function getAcceptedAdminPasskeys() {
  return [
    normalizePasskey(process.env.ADMIN_DASHBOARD_SECRET || ""),
    normalizePasskey(process.env.ADMIN_DASHBOARD_SECRET_ALT || "")
  ].filter(Boolean);
}

function getAdminSessionSecret() {
  const acceptedPasskeys = getAcceptedAdminPasskeys();
  const expectedPin = acceptedPasskeys[0] || "";
  return String(process.env.ADMIN_SESSION_SECRET || expectedPin).trim();
}

function matchesAnyAdminPasskey(submittedPin, passkeys = getAcceptedAdminPasskeys()) {
  return passkeys.some((passkey) => safeEqual(submittedPin, passkey));
}

function createSessionCookie(secret = getAdminSessionSecret()) {
  const now = Math.floor(Date.now() / 1000);
  const token = signSession({
    role: "admin",
    iat: now,
    exp: now + sessionMaxAgeSeconds
  }, secret);
  return [
    `${sessionCookieName}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${sessionMaxAgeSeconds}`
  ].join("; ");
}

function clearSessionCookie() {
  return [
    `${sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0"
  ].join("; ");
}

function verifySessionToken(token, secret = getAdminSessionSecret()) {
  const [encoded, signature] = String(token || "").split(".");
  if (!encoded || !signature || !secret) return null;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  if (!safeEqual(signature, expectedSignature)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload.role !== "admin" || Number(payload.exp || 0) <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAdminSession(request) {
  const cookies = parseCookies(request.headers.cookie || "");
  const session = verifySessionToken(cookies[sessionCookieName]);
  return session || null;
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  getAcceptedAdminPasskeys,
  getAdminSessionSecret,
  matchesAnyAdminPasskey,
  normalizePasskey,
  requireAdminSession,
  sessionCookieName,
  verifySessionToken
};
