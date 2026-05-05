const { isValidEmail, sendSupabaseMagicLink } = require("../lib/_otp-service");
const {
  createUser,
  findUserByEmail,
  findUserByUsername,
  normalize,
  publicUser,
  supabaseConfigured
} = require("../lib/_shared-user-store");

const freeTrialDays = 7;

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

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function isDuplicateError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("duplicate") || message.includes("unique") || message.includes("already exists");
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
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const passwordHash = String(body.passwordHash || "").trim();
    const countries = Array.isArray(body.countries) ? body.countries.filter(Boolean) : [];

    if (!username || username.length < 2) {
      json(response, 400, { ok: false, message: "Choose a username with at least 2 characters." });
      return;
    }
    if (!isValidEmail(email)) {
      json(response, 400, { ok: false, message: "Enter a valid email address." });
      return;
    }
    if (!passwordHash || passwordHash.length < 20) {
      json(response, 400, { ok: false, message: "A valid password hash is required." });
      return;
    }
    if (!countries.length) {
      json(response, 400, { ok: false, message: "Choose at least one country for the profile." });
      return;
    }

    const byEmail = await findUserByEmail(email);
    if (byEmail) {
      json(response, 409, {
        ok: false,
        duplicateField: "email",
        requiresOtp: false,
        message: "This email address is already registered. Use a different email or sign in."
      });
      return;
    }
    const byUsername = await findUserByUsername(username);
    if (byUsername && normalize(byUsername.username) === normalize(username)) {
      json(response, 409, {
        ok: false,
        duplicateField: "username",
        requiresOtp: false,
        message: "This username is already registered. Choose a different username."
      });
      return;
    }

    const magicLink = await sendSupabaseMagicLink({
      email,
      username,
      origin: requestOrigin(request)
    });
    if (!magicLink.sent) {
      json(response, 503, {
        ok: false,
        message: magicLink.reason || "Magic link could not be sent right now."
      });
      return;
    }

    const now = new Date();
    let createdUser;
    try {
      createdUser = await createUser({
        username,
        email,
        passwordHash,
        countries,
        visibleMarkets: countries,
        watchlistKeys: [],
        portfolioHoldings: {},
        compareKeys: [],
        dashboardState: {},
        createdAt: now.toISOString(),
        planType: "Free trial",
        accessDaysGranted: freeTrialDays,
        accessStartedAt: now.toISOString(),
        paidUntil: addDays(now, freeTrialDays).toISOString(),
        paymentConfirmed: false,
        otpVerified: false,
        otpHash: "",
        otpIssuedAt: now.toISOString(),
        otpExpiresAt: "",
        otpDelivery: "magic-link",
        magicLinkIssuedAt: now.toISOString(),
        magicLinkRedirectTo: magicLink.redirectTo || "",
        signInCount: 0
      });
    } catch (error) {
      if (isDuplicateError(error)) {
        json(response, 409, {
          ok: false,
          duplicateField: "account",
          requiresOtp: false,
          message: "This email address or username is already registered. Sign in or use different details."
        });
        return;
      }
      throw error;
    }

    json(response, 200, {
      ok: true,
      magicLink: true,
      requiresOtp: false,
      message: "Sign up created. Check your email and click the verification link.",
      user: publicUser(createdUser)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not create account." });
  }
};
