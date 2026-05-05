const crypto = require("crypto");

const sessionCookieName = "dividend_admin_session";

function json(response, statusCode, payload) {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.status(statusCode).send(JSON.stringify(payload));
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

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifySessionToken(token, secret) {
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

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    json(response, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  const sessionSecret = String(
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_DASHBOARD_SECRET || ""
  ).trim();
  const cookies = parseCookies(request.headers.cookie || "");
  const session = verifySessionToken(cookies[sessionCookieName], sessionSecret);

  json(response, 200, {
    ok: Boolean(session),
    expiresAt: session?.exp ? new Date(session.exp * 1000).toISOString() : ""
  });
};
