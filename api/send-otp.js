const { issueHostedOtp, isValidEmail } = require("../lib/_otp-service");

function json(response, status, payload) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.status(status).send(JSON.stringify(payload));
}

async function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

module.exports = async function handler(request, response) {
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

    const result = await issueHostedOtp({ email, username });
    if (!result.ok) {
      json(response, 503, {
        ok: false,
        message: result.message,
        reason: result.reason || result.message
      });
      return;
    }

    json(response, 200, {
      ok: true,
      otpHash: result.otpHash,
      otpIssuedAt: result.otpIssuedAt,
      otpExpiresAt: result.otpExpiresAt
    });
  } catch {
    json(response, 500, {
      ok: false,
      message: "Could not send OTP right now."
    });
  }
};
