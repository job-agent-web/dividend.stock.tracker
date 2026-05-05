const { issueHostedOtp, isValidEmail } = require("../lib/_otp-service");
const {
  createUser,
  findUserByEmail,
  findUserByIdentity,
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
      json(response, 409, { ok: false, message: "This email address is already registered. Use a different email." });
      return;
    }
    const byUsername = await findUserByIdentity(username);
    if (byUsername && normalize(byUsername.username) === normalize(username)) {
      json(response, 409, { ok: false, message: "This username is already registered. Choose a different username." });
      return;
    }

    const otp = await issueHostedOtp({ email, username });
    if (!otp.ok) {
      json(response, 503, {
        ok: false,
        message: otp.reason || otp.message || "OTP could not be sent right now."
      });
      return;
    }

    const now = new Date();
    const createdUser = await createUser({
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
      otpHash: otp.otpHash,
      otpIssuedAt: otp.otpIssuedAt,
      otpExpiresAt: otp.otpExpiresAt,
      otpDelivery: otp.otpDelivery,
      signInCount: 0
    });

    json(response, 200, {
      ok: true,
      message: "Sign up created. Verify your email with the OTP before signing in.",
      user: publicUser(createdUser)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not create account." });
  }
};
