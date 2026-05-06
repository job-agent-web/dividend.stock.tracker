const crypto = require("crypto");
const { issueHostedOtp } = require("../lib/_otp-service");
const {
  ensureAccessFields,
  findUserByIdentity,
  issueSession,
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

function challengeHash(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function createSigninChallenge() {
  return crypto.randomBytes(24).toString("hex");
}

function daysLeftForUser(user) {
  if (user.planType === "Lifetime") return Infinity;
  const until = new Date(user.paidUntil || user.accessUntil || "");
  if (!Number.isFinite(until.getTime())) return 0;
  return Math.max(0, Math.ceil((until - new Date()) / 86400000));
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
    const identity = String(body.identity || "").trim();
    const passwordHash = String(body.passwordHash || "").trim();
    const user = await findUserByIdentity(identity);

    if (!user || user.passwordHash !== passwordHash) {
      json(response, 401, { ok: false, message: "The username, email, or password is incorrect." });
      return;
    }

    const accessUser = ensureAccessFields(user);
    if (accessUser.isLocked) {
      json(response, 403, { ok: false, message: "This account is unavailable. Contact support for help." });
      return;
    }

    if (accessUser.otpVerified === false) {
      const waitSeconds = otpWaitSeconds(accessUser);
      if (waitSeconds > 0) {
        const challenge = createSigninChallenge();
        const updated = await updateUserByEmail(accessUser.email, {
          signInChallengeHash: challengeHash(challenge),
          signInChallengeIssuedAt: new Date().toISOString()
        });
        json(response, 200, {
          ok: true,
          magicLink: false,
          requiresOtp: true,
          challenge,
          waitSeconds,
          message: `An OTP was sent recently. Please check your inbox or wait ${waitSeconds} seconds before requesting another one.`,
          user: publicUser(updated || accessUser)
        });
        return;
      }
      const otp = await issueHostedOtp(accessUser);
      if (!otp.ok) {
        json(response, 503, { ok: false, message: otp.reason || otp.message || "OTP could not be sent right now." });
        return;
      }
      const challenge = createSigninChallenge();
      const updated = await updateUserByEmail(accessUser.email, {
        otpVerified: false,
        otpHash: otp.otpHash,
        otpIssuedAt: otp.otpIssuedAt,
        otpExpiresAt: otp.otpExpiresAt,
        otpDelivery: otp.otpDelivery,
        signInChallengeHash: challengeHash(challenge),
        signInChallengeIssuedAt: new Date().toISOString()
      });
      json(response, 200, {
        ok: true,
        magicLink: false,
        requiresOtp: true,
        challenge,
        message: "Your email is not verified. Enter the OTP sent to your email.",
        user: publicUser(updated)
      });
      return;
    }

    if (daysLeftForUser(accessUser) <= 0) {
      json(response, 403, {
        ok: false,
        expired: true,
        message: "Your access has expired. Please choose a plan below to regain access.",
        user: publicUser(accessUser)
      });
      return;
    }

    const { user: updated, sessionToken } = await issueSession({
      ...accessUser,
      lastSignedInAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      signInCount: Number(accessUser.signInCount || 0) + 1
    });

    json(response, 200, {
      ok: true,
      message: "Signed in. Opening your tracker...",
      sessionToken,
      user: publicUser(updated)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not sign in." });
  }
};
