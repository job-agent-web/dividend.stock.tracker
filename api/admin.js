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
const { sendBroadcastEmail, isValidEmail } = require("../lib/_otp-service");
const { bestGlobalStockOfDay } = require("../lib/_stock-universe");

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

function londonClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour || 0),
    minute: Number(values.minute || 0)
  };
}

function requestOrigin(request) {
  const explicit = String(process.env.APP_URL || "").trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const forwardedProto = String(request.headers["x-forwarded-proto"] || "").trim();
  const forwardedHost = String(request.headers["x-forwarded-host"] || "").trim();
  if (forwardedProto && forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  const host = String(request.headers.host || "").trim();
  if (host) return `https://${host}`;
  const vercelUrl = String(process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "").trim();
  return vercelUrl ? `https://${vercelUrl}` : "";
}

function stockSigninUrl(request, stockKey) {
  const origin = requestOrigin(request);
  const query = new URLSearchParams();
  if (stockKey) query.set("stock", stockKey);
  query.set("from", "stock-of-day");
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return `${origin || ""}/signin.html${suffix}`;
}

function stockOfDayEmailMarkup(request, pick) {
  const stock = pick.stock;
  const linkUrl = stockSigninUrl(request, pick.key);
  const subject = `Stock of the day: ${stock.ticker} - ${stock.name}`;
  const html = `
    <div style="margin:0;padding:24px;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0">
      <div style="max-width:620px;margin:0 auto;background:#08101f;border-radius:20px;padding:28px;border:1px solid #1e293b">
        <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0;text-transform:uppercase;color:#7dd3fc">Dividend Stock Tracker</p>
        <h1 style="margin:0 0 10px;font-size:30px;line-height:1.15;color:#ffffff">Stock of the day</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#cbd5e1">Best daily buy candidate for ${pick.dateLabel}.</p>
        <div style="border:1px solid rgba(59,130,246,0.24);border-radius:18px;padding:20px;background:linear-gradient(135deg, rgba(37,99,235,0.14), rgba(20,184,166,0.12))">
          <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#ffffff">${stock.ticker} - ${stock.name}</p>
          <p style="margin:0 0 10px;font-size:15px;color:#dbeafe">${stock.market} · ${stock.signal} · Score ${pick.score}/100</p>
          <p style="margin:0 0 10px;font-size:15px;color:#e2e8f0">Price: ${stock.currency} ${stock.price} · Yield: ${stock.dividendYield}% · Payout ratio: ${stock.payoutRatio}%</p>
          <p style="margin:0;font-size:15px;line-height:1.55;color:#e2e8f0">${pick.reason}</p>
        </div>
        <div style="margin-top:22px">
          <a href="${linkUrl}" style="display:inline-block;border-radius:999px;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:800">Open stock details</a>
        </div>
        <p style="margin:18px 0 0;font-size:13px;line-height:1.55;color:#94a3b8">This daily research update is sent to every registered member, including accounts with expired access. Expired accounts will be asked to pay before they can open the platform.</p>
      </div>
    </div>
  `;
  const text = [
    "Dividend Stock Tracker",
    `Stock of the day for ${pick.dateLabel}`,
    `${stock.ticker} - ${stock.name}`,
    `${stock.market} | ${stock.signal} | Score ${pick.score}/100`,
    `Price: ${stock.currency} ${stock.price} | Yield: ${stock.dividendYield}% | Payout ratio: ${stock.payoutRatio}%`,
    pick.reason,
    `Open: ${linkUrl}`
  ].join("\n");
  return { subject, html, text };
}

function cronAuthorized(request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) {
    return /vercel-cron/i.test(String(request.headers["user-agent"] || ""));
  }
  const authHeader = String(request.headers.authorization || request.headers.Authorization || "").trim();
  return authHeader === `Bearer ${secret}`;
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

function handleStockOfDay(request, response) {
  const pick = bestGlobalStockOfDay();
  if (!pick) {
    json(response, 404, { ok: false, message: "No stock of the day is available right now." });
    return;
  }
  json(response, 200, {
    ok: true,
    dateKey: londonClock().dateKey,
    key: pick.key,
    score: pick.score,
    reason: pick.reason,
    dateLabel: pick.dateLabel,
    linkUrl: stockSigninUrl(request, pick.key),
    stock: pick.stock
  });
}

async function handleDailyStockEmail(request, response) {
  const session = requireAdminSession(request);
  const internalCron = cronAuthorized(request);
  if (!session && !internalCron) {
    json(response, 401, { ok: false, message: "This route is reserved for cron delivery or an authenticated admin session." });
    return;
  }
  if (!supabaseConfigured()) {
    json(response, 500, { ok: false, message: "Shared account store is not configured yet." });
    return;
  }

  const pick = bestGlobalStockOfDay();
  if (!pick) {
    json(response, 404, { ok: false, message: "No stock of the day is available right now." });
    return;
  }

  const force = String(request.query?.force || "").trim() === "1";
  const london = londonClock();
  if (!force && london.hour !== 9) {
    json(response, 200, {
      ok: true,
      skipped: true,
      reason: "Waiting for 9AM Europe/London.",
      currentHour: london.hour,
      dateKey: london.dateKey
    });
    return;
  }

  const users = await listUsers();
  const recipients = users.filter((user) =>
    isValidEmail(user?.email)
    && user.lastDailyStockEmailDate !== london.dateKey
  );

  if (!recipients.length) {
    json(response, 200, {
      ok: true,
      sent: false,
      skipped: true,
      dateKey: london.dateKey,
      recipients: 0,
      message: "Every registered member has already received today's stock email."
    });
    return;
  }

  const emailPayload = stockOfDayEmailMarkup(request, pick);
  const delivery = await sendBroadcastEmail({
    recipients: recipients.map((user) => user.email),
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text
  });

  if (!delivery.sent) {
    json(response, 502, {
      ok: false,
      message: delivery.reason || "Daily stock email could not be sent.",
      provider: delivery.provider || ""
    });
    return;
  }

  await Promise.allSettled(recipients.map((user) =>
    updateUserByEmail(user.email, {
      lastDailyStockEmailDate: london.dateKey,
      lastDailyStockEmailSentAt: new Date().toISOString(),
      lastDailyStockKey: pick.key
    })
  ));

  json(response, 200, {
    ok: true,
    sent: true,
    dateKey: london.dateKey,
    provider: delivery.provider,
    recipientCount: recipients.length,
    stockKey: pick.key
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
    if (action === "stock-of-day") {
      if (request.method !== "GET") {
        json(response, 405, { ok: false, message: "Method not allowed." });
        return;
      }
      handleStockOfDay(request, response);
      return;
    }
    if (action === "daily-stock-email") {
      if (!["GET", "POST"].includes(request.method)) {
        json(response, 405, { ok: false, message: "Method not allowed." });
        return;
      }
      await handleDailyStockEmail(request, response);
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
