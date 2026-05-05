const { sendSupabaseMagicLink } = require("../lib/_otp-service");
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

function requestOrigin(request) {
  const origin = request.headers.origin || "";
  if (origin) return origin;
  const host = request.headers.host || "";
  return host ? `https://${host}` : "";
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
    const magicLink = await sendSupabaseMagicLink({
      email: user.email,
      username: user.username,
      origin: requestOrigin(request)
    });
    if (!magicLink.sent) {
      json(response, 503, { ok: false, message: magicLink.reason || "Magic link could not be sent right now." });
      return;
    }
    const updated = await updateUserByEmail(user.email, {
      otpVerified: false,
      otpHash: "",
      otpIssuedAt: new Date().toISOString(),
      otpExpiresAt: "",
      otpDelivery: "magic-link",
      magicLinkIssuedAt: new Date().toISOString(),
      magicLinkRedirectTo: magicLink.redirectTo || ""
    });
    json(response, 200, {
      ok: true,
      magicLink: true,
      message: "A new verification link has been sent. Open it from your email before it expires.",
      user: publicUser(updated)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not resend OTP." });
  }
};
