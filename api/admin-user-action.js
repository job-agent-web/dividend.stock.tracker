const { requireAdminSession } = require("./_admin-session");
const {
  createUser,
  findUserByEmail,
  findUserByIdentity,
  normalize,
  publicUser,
  supabaseConfigured,
  updateUserByEmail
} = require("./_shared-user-store");

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

const planOptions = {
  trial: { label: "Free week", days: 7 },
  month: { label: "1 month", days: 30 },
  sixMonths: { label: "6 months", days: 183 },
  year: { label: "1 year", days: 365 },
  lifetime: { label: "Lifetime", days: Infinity },
  custom: { label: "Custom days", days: 30 }
};

async function createAdminUser(payload) {
  const username = String(payload.username || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const passwordHash = String(payload.passwordHash || "").trim();
  const countries = Array.isArray(payload.countries) ? payload.countries.filter(Boolean) : [];
  if (!username || username.length < 2) throw new Error("Choose a username with at least 2 characters.");
  if (!email) throw new Error("Enter a valid email address.");
  if (!passwordHash || passwordHash.length < 20) throw new Error("A valid password hash is required.");
  if (!countries.length) throw new Error("Choose at least one country for this user.");
  const byEmail = await findUserByEmail(email);
  if (byEmail) throw new Error("This email address is already registered.");
  const byUsername = await findUserByIdentity(username);
  if (byUsername && normalize(byUsername.username) === normalize(username)) {
    throw new Error("This username is already registered.");
  }
  const now = new Date();
  return createUser({
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
    createdByAdminAt: now.toISOString(),
    planType: "Free trial",
    accessDaysGranted: freeTrialDays,
    accessStartedAt: now.toISOString(),
    paidUntil: addDays(now, freeTrialDays).toISOString(),
    paymentConfirmed: false,
    otpVerified: false,
    otpHash: "",
    signInCount: 0
  });
}

async function grantAccess(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const planKey = String(payload.planKey || "month");
  const plan = planOptions[planKey] || planOptions.month;
  const parsedDays = Number(payload.customDays);
  const adjustedDayCount = Number.isFinite(parsedDays) ? Math.max(0, parsedDays) : Math.max(0, Number(plan.days || 30));
  const grantedDays = planKey === "lifetime" ? Infinity : adjustedDayCount;
  const now = new Date();
  return updateUserByEmail(email, {
    isLocked: false,
    lockedAt: "",
    lockedByAdminAt: "",
    lockReason: "",
    planType: planKey === "lifetime" ? "Lifetime" : plan.label,
    accessDaysGranted: grantedDays === Infinity ? 999999 : grantedDays,
    accessStartedAt: now.toISOString(),
    paidUntil: grantedDays === Infinity ? "9999-12-31T23:59:59.000Z" : addDays(now, grantedDays).toISOString(),
    paymentConfirmed: planKey !== "trial",
    paymentConfirmedAt: now.toISOString()
  });
}

async function setLockState(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const shouldLock = Boolean(payload.shouldLock);
  const now = new Date().toISOString();
  return updateUserByEmail(email, {
    isLocked: shouldLock,
    lockedAt: shouldLock ? now : "",
    lockedByAdminAt: shouldLock ? now : "",
    unlockedAt: shouldLock ? "" : now,
    lockReason: shouldLock ? "Account unavailable" : ""
  });
}

async function setPassword(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const passwordHash = String(payload.passwordHash || "").trim();
  if (!passwordHash || passwordHash.length < 20) throw new Error("A valid password hash is required.");
  const now = new Date().toISOString();
  return updateUserByEmail(email, {
    passwordHash,
    passwordChangedByAdminAt: now,
    lastPasswordResetAt: now
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  if (!requireAdminSession(request)) {
    json(response, 401, { ok: false, message: "Admin session required." });
    return;
  }

  if (!supabaseConfigured()) {
    json(response, 500, { ok: false, message: "Shared account store is not configured yet." });
    return;
  }

  try {
    const body = await readBody(request);
    const action = String(body.action || "").trim();
    let user = null;
    if (action === "createUser") user = await createAdminUser(body);
    else if (action === "grantAccess") user = await grantAccess(body);
    else if (action === "setLockState") user = await setLockState(body);
    else if (action === "setPassword") user = await setPassword(body);
    else {
      json(response, 400, { ok: false, message: "Unknown admin action." });
      return;
    }

    json(response, 200, { ok: true, user: publicUser(user) });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not complete admin action." });
  }
};
