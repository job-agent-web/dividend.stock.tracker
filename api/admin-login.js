const crypto = require("crypto");

const sessionCookieName = "dividend_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 12;

function json(response, statusCode, payload, extraHeaders = {}) {
  Object.entries({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    ...extraHeaders
  }).forEach(([key, value]) => response.setHeader(key, value));
  response.status(statusCode).send(JSON.stringify(payload));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    if (request.body && typeof request.body === "object") {
      resolve(request.body);
      return;
    }
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4096) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    request.on("error", reject);
  });
}

function signSession(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function createSessionCookie(secret) {
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

function matchesAnyAdminPasskey(submittedPin, passkeys) {
  return passkeys.some((passkey) => safeEqual(submittedPin, passkey));
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    json(response, 204, "");
    return;
  }

  if (request.method !== "POST") {
    json(response, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  const acceptedPasskeys = getAcceptedAdminPasskeys();
  const expectedPin = acceptedPasskeys[0] || "";
  const sessionSecret = String(process.env.ADMIN_SESSION_SECRET || expectedPin).trim();

  if (!acceptedPasskeys.length) {
    json(response, 500, {
      ok: false,
      message: "Admin passkey is not configured on this deployment."
    });
    return;
  }

  try {
    const body = await readBody(request);
    const submittedPin = normalizePasskey(body.pin || body.adminPin || "");

    if (!submittedPin || !matchesAnyAdminPasskey(submittedPin, acceptedPasskeys)) {
      json(response, 401, {
        ok: false,
        message: "The admin passkey is incorrect. Check for extra quotes or spaces in the Vercel passkey value."
      });
      return;
    }

    json(response, 200, {
      ok: true,
      message: "Admin session started."
    }, {
      "set-cookie": createSessionCookie(sessionSecret)
    });
  } catch {
    json(response, 500, {
      ok: false,
      message: "Could not start admin session."
    });
  }
};
