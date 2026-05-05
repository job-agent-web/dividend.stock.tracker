const crypto = require("crypto");
const {
  ensureAccessFields,
  findUserByEmail,
  findUserByIdentity,
  issueSession,
  publicUser,
  supabaseConfigured,
  updateUserByEmail
} = require("../lib/_shared-user-store");
const { getSupabaseUserFromAccessToken, hashOtp } = require("../lib/_otp-service");

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

function daysLeftForUser(user) {
  if (user.planType === "Lifetime") return Infinity;
  const until = new Date(user.paidUntil || user.accessUntil || "");
  if (!Number.isFinite(until.getTime())) return 0;
  return Math.max(0, Math.ceil((until - new Date()) / 86400000));
}

function otpIsExpired(user) {
  const expiresAt = new Date(user?.otpExpiresAt || "");
  return !Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date();
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
    const code = String(body.code || "").trim();
    const mode = String(body.mode || "signup").trim().toLowerCase();
    const challenge = String(body.challenge || "").trim();

    if (mode === "magiclink") {
      const accessToken = String(body.accessToken || "").trim();
      if (!accessToken) {
        json(response, 400, { ok: false, message: "Magic link token is missing." });
        return;
      }
      const supabaseUser = await getSupabaseUserFromAccessToken(accessToken);
      const email = String(supabaseUser?.email || "").trim().toLowerCase();
      const user = await findUserByEmail(email);
      if (!user) {
        json(response, 404, { ok: false, message: "This email is verified, but no tracker account was found." });
        return;
      }
      const verified = await updateUserByEmail(user.email, {
        otpVerified: true,
        otpHash: "",
        otpVerifiedAt: new Date().toISOString(),
        signInChallengeHash: "",
        signInChallengeIssuedAt: ""
      });
      const accessUser = ensureAccessFields(verified);
      if (daysLeftForUser(accessUser) <= 0) {
        json(response, 403, {
          ok: false,
          expired: true,
          message: "Email verified, but your access has expired. Please choose a plan below.",
          user: publicUser(accessUser)
        });
        return;
      }
      const { user: signedIn, sessionToken } = await issueSession({
        ...accessUser,
        lastSignedInAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        signInCount: Number(accessUser.signInCount || 0) + 1
      });
      json(response, 200, {
        ok: true,
        magicLink: true,
        message: "Email verified. Opening your tracker...",
        sessionToken,
        user: publicUser(signedIn)
      });
      return;
    }

    const user = await findUserByIdentity(identity);

    if (!user) {
      json(response, 404, { ok: false, message: "Create or find your account before entering an OTP." });
      return;
    }
    if (otpIsExpired(user)) {
      json(response, 400, { ok: false, message: "This OTP has expired. Please resend a new OTP." });
      return;
    }
    if (!code || hashOtp(code) !== String(user.otpHash || "").toLowerCase()) {
      json(response, 400, { ok: false, message: "The OTP is incorrect. Please check the code and try again." });
      return;
    }

    if (mode === "signin") {
      const expectedChallenge = String(user.signInChallengeHash || "");
      if (!challenge || !expectedChallenge || challengeHash(challenge) !== expectedChallenge) {
        json(response, 401, { ok: false, message: "This sign-in challenge is no longer valid. Please sign in again." });
        return;
      }
    }

    const verified = await updateUserByEmail(user.email, {
      otpVerified: true,
      otpHash: "",
      otpVerifiedAt: new Date().toISOString(),
      signInChallengeHash: "",
      signInChallengeIssuedAt: ""
    });

    const accessUser = ensureAccessFields(verified);
    if (mode === "signin") {
      if (daysLeftForUser(accessUser) <= 0) {
        json(response, 403, {
          ok: false,
          expired: true,
          message: "Email verified, but your access has expired. Please choose a plan below.",
          user: publicUser(accessUser)
        });
        return;
      }
      const { user: signedIn, sessionToken } = await issueSession({
        ...accessUser,
        lastSignedInAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        signInCount: Number(accessUser.signInCount || 0) + 1
      });
      json(response, 200, {
        ok: true,
        message: "Email verified. Opening your tracker...",
        sessionToken,
        user: publicUser(signedIn)
      });
      return;
    }

    json(response, 200, {
      ok: true,
      message: "Email verified. Sign in to open your tracker.",
      user: publicUser(accessUser)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not verify OTP." });
  }
};
