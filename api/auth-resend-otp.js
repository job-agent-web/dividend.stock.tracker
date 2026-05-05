const { issueHostedOtp } = require("../lib/_otp-service");
const {
  findUserByIdentity,
  publicUser,
  supabaseConfigured,
  updateUserByEmail
} = require("../lib/_shared-user-store");

function json(response, status, payload) {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
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
  if (request.method !== "POST") {
    json(response, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  if (!supabaseConfigured()) {
    json(response, 500, { ok: false, message: "Shared account store is not configured yet." });
    return;
  }

  try {
    const body = await readBody(request);
    const identity = String(body.identity || body.email || "").trim();
    const user = await findUserByIdentity(identity);
    if (!user) {
      json(response, 404, { ok: false, message: "Create or find your account before requesting another OTP." });
      return;
    }
    const otp = await issueHostedOtp(user);
    if (!otp.ok) {
      json(response, 503, { ok: false, message: otp.reason || otp.message || "OTP could not be sent right now." });
      return;
    }
    const updated = await updateUserByEmail(user.email, {
      otpVerified: false,
      otpHash: otp.otpHash,
      otpIssuedAt: otp.otpIssuedAt,
      otpExpiresAt: otp.otpExpiresAt,
      otpDelivery: otp.otpDelivery
    });
    json(response, 200, {
      ok: true,
      message: "A new OTP has been generated. Enter it before it expires.",
      user: publicUser(updated)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not resend OTP." });
  }
};
