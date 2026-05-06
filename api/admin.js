const {
  clearSessionCookie,
  createSessionCookie,
  getAcceptedAdminPasskeys,
  matchesAnyAdminPasskey,
  normalizePasskey,
  requireAdminSession
} = require("../lib/_admin-session");
const {
  createUser,
  deleteUserByEmail,
  findUserByEmail,
  findUserByIdentity,
  listUsers,
  normalize,
  publicUser,
  supabaseConfigured,
  updateUserByEmail
} = require("../lib/_shared-user-store");

const freeTrialDays = 7;

const planOptions = {
  trial: { label: "Free week", days: 7 },
  month: { label: "1 month", days: 30 },
  sixMonths: { label: "6 months", days: 183 },
  year: { label: "1 year", days: 365 },
  lifetime: { label: "Lifetime", days: Infinity },
  custom: { label: "Custom days", days: 30 }
};

function json(response, statusCode, payload, extraHeaders = {}) {
  Object.entries({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extraHeaders
  }).forEach(([key, value]) => response.setHeader(key, value));
  response.status(statusCode).send(JSON.stringify(payload));
}

async function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function getAction(request, body = {}) {
  const fromBody = String(body.endpoint || "").trim();
  if (fromBody) return fromBody.toLowerCase();
  if (request.query?.action) return String(request.query.action).trim().toLowerCase();
  try {
    const url = new URL(request.url, "http://localhost");
    return String(url.searchParams.get("action") || "").trim().toLowerCase();
  } catch {
    return "";
  }
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function ensureAdminSession(request, response) {
  const session = requireAdminSession(request);
  if (!session) {
    json(response, 401, { ok: false, message: "Admin session required." });
    return null;
  }
  return session;
}

async function handleLogin(body, response) {
  const acceptedPasskeys = getAcceptedAdminPasskeys();
  if (!acceptedPasskeys.length) {
    json(response, 500, {
      ok: false,
      message: "Admin passkey is not configured on this deployment."
    });
    return;
  }
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
    "set-cookie": createSessionCookie()
  });
}

function handleSession(request, response) {
  const session = requireAdminSession(request);
  json(response, 200, {
    ok: Boolean(session),
    expiresAt: session?.exp ? new Date(session.exp * 1000).toISOString() : ""
  });
}

function handleLogout(response) {
  json(response, 200, {
    ok: true,
    message: "Admin session cleared."
  }, {
    "set-cookie": clearSessionCookie()
  });
}

async function handleUsers(request, response) {
  if (!ensureAdminSession(request, response)) return;
  if (!supabaseConfigured()) {
    json(response, 500, { ok: false, message: "Shared account store is not configured yet." });
    return;
  }
  const users = await listUsers();
  json(response, 200, {
    ok: true,
    users: users.map(publicUser)
  });
}

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

async function deleteUser(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) throw new Error("Choose a user to delete.");
  const deletedUser = await deleteUserByEmail(email);
  if (!deletedUser) throw new Error("This user could not be found.");
  return deletedUser;
}

async function handleUserAction(request, response, body) {
  if (!ensureAdminSession(request, response)) return;
  if (!supabaseConfigured()) {
    json(response, 500, { ok: false, message: "Shared account store is not configured yet." });
    return;
  }
  const type = String(body.type || body.operation || "").trim();
  let user = null;
  if (type === "createUser") user = await createAdminUser(body);
  else if (type === "grantAccess") user = await grantAccess(body);
  else if (type === "setLockState") user = await setLockState(body);
  else if (type === "setPassword") user = await setPassword(body);
  else if (type === "deleteUser") user = await deleteUser(body);
  else {
    json(response, 400, { ok: false, message: "Unknown admin action." });
    return;
  }
  json(response, 200, { ok: true, user: publicUser(user) });
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    json(response, 204, "");
    return;
  }

  let body = {};
  if (request.method === "POST") {
    try {
      body = await readBody(request);
    } catch {
      body = {};
    }
  }

  const action = getAction(request, body);

  try {
    if (action === "login") {
      if (request.method !== "POST") {
        json(response, 405, { ok: false, message: "Method not allowed." });
        return;
      }
      await handleLogin(body, response);
      return;
    }
    if (action === "session") {
      if (request.method !== "GET") {
        json(response, 405, { ok: false, message: "Method not allowed." });
        return;
      }
      handleSession(request, response);
      return;
    }
    if (action === "logout") {
      if (!["GET", "POST"].includes(request.method)) {
        json(response, 405, { ok: false, message: "Method not allowed." });
        return;
      }
      handleLogout(response);
      return;
    }
    if (action === "users") {
      if (request.method !== "GET") {
        json(response, 405, { ok: false, message: "Method not allowed." });
        return;
      }
      await handleUsers(request, response);
      return;
    }
    if (action === "user-action") {
      if (request.method !== "POST") {
        json(response, 405, { ok: false, message: "Method not allowed." });
        return;
      }
      await handleUserAction(request, response, body);
      return;
    }
    json(response, 400, { ok: false, message: "Unknown admin endpoint action." });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not complete admin request." });
  }
};
