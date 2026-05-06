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

function otpWaitSeconds(user) {
  const issuedAt = new Date(user?.otpIssuedAt || "");
  if (!Number.isFinite(issuedAt.getTime())) return 0;
  const resendSeconds = Number(process.env.OTP_RESEND_SECONDS || process.env.MAGIC_LINK_RESEND_SECONDS || 60);
  const remaining = Math.ceil((issuedAt.getTime() + resendSeconds * 1000 - Date.now()) / 1000);
  return Math.max(0, remaining);
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
    const waitSeconds = otpWaitSeconds(user);
    if (waitSeconds > 0) {
      json(response, 429, {
        ok: false,
        waitSeconds,
        message: `An OTP was sent recently. Please check your inbox or wait ${waitSeconds} seconds before requesting another one.`
      });
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
      magicLink: false,
      requiresOtp: true,
      message: "A new OTP has been sent. Enter it before it expires.",
      user: publicUser(updated)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not resend OTP." });
  }
};
