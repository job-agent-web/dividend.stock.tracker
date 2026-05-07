const crypto = require("crypto");

const freeTrialDays = 7;
const defaultSessionHours = Number(process.env.SESSION_HOURS || 1);

function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function baseUrl() {
  return String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
}

function usersTable() {
  return String(process.env.SUPABASE_USERS_TABLE || "dividend_users").trim();
}

function buildUrl(pathname, params) {
  const url = new URL(`${baseUrl()}${pathname}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function supabaseRequest(pathname, options = {}) {
  if (!supabaseConfigured()) {
    throw new Error("Shared user store is not configured.");
  }

  const response = await fetch(buildUrl(pathname, options.params), {
    method: options.method || "GET",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text().catch(() => "");
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error_description || data?.hint || text || "Supabase request failed.";
    throw new Error(message);
  }
  return data;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function ensureAccessFields(user) {
  const createdAt = user.createdAt || new Date().toISOString();
  const hasAccessDate = Boolean(user.paidUntil || user.accessUntil);
  const next = {
    ...user,
    createdAt,
    planType: user.planType || "Free trial",
    accessDaysGranted: Number(user.accessDaysGranted || freeTrialDays),
    accessStartedAt: user.accessStartedAt || createdAt,
    paymentConfirmed: Boolean(user.paymentConfirmed)
  };
  next.paidUntil = hasAccessDate
    ? user.paidUntil || user.accessUntil
    : addDays(new Date(createdAt), freeTrialDays).toISOString();
  return next;
}

function publicUser(user = {}) {
  const next = { ...ensureAccessFields(user) };
  delete next.passwordHash;
  delete next.otpHash;
  delete next.signInChallengeHash;
  delete next.sessionTokenHash;
  return next;
}

function sessionTokenHash(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function rowToUser(row) {
  if (!row) return null;
  const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
  const fallbackLastSignedInAt = payload.lastSignedInAt || row.session_token_issued_at || "";
  const fallbackLastSeenAt = payload.lastSeenAt || payload.lastActivityAt || row.updated_at || "";
  const fallbackSignInCount = Number.isFinite(Number(payload.signInCount))
    ? Number(payload.signInCount)
    : (fallbackLastSignedInAt ? 1 : 0);
  return ensureAccessFields({
    ...payload,
    id: row.id || payload.id,
    email: row.email || payload.email || "",
    username: row.username || payload.username || "",
    passwordHash: row.password_hash || payload.passwordHash || "",
    sessionTokenHash: row.session_token_hash || payload.sessionTokenHash || "",
    sessionTokenIssuedAt: row.session_token_issued_at || payload.sessionTokenIssuedAt || "",
    sessionTokenExpiresAt: row.session_token_expires_at || payload.sessionTokenExpiresAt || "",
    lastSignedInAt: fallbackLastSignedInAt,
    lastSeenAt: fallbackLastSeenAt,
    signInCount: fallbackSignInCount,
    createdAt: payload.createdAt || row.created_at || "",
    updatedAt: row.updated_at || payload.updatedAt || ""
  });
}

function userToRow(user) {
  const next = ensureAccessFields(user);
  const payload = { ...next };
  delete payload.passwordHash;
  delete payload.sessionTokenHash;
  delete payload.email;
  delete payload.username;
  return {
    email: String(next.email || "").trim().toLowerCase(),
    username: normalize(next.username),
    password_hash: next.passwordHash || "",
    session_token_hash: next.sessionTokenHash || "",
    session_token_issued_at: next.sessionTokenIssuedAt || null,
    session_token_expires_at: next.sessionTokenExpiresAt || null,
    payload,
    updated_at: new Date().toISOString()
  };
}

async function listUsers() {
  const rows = await supabaseRequest(`/rest/v1/${usersTable()}`, {
    params: {
      select: "*",
      order: "created_at.desc"
    }
  });
  return Array.isArray(rows) ? rows.map(rowToUser) : [];
}

async function findUserByIdentity(identity) {
  const key = normalize(identity);
  if (!key) return null;
  const rows = await supabaseRequest(`/rest/v1/${usersTable()}`, {
    params: {
      select: "*",
      or: `(email.eq.${key},username.eq.${key})`,
      limit: "1"
    }
  });
  return Array.isArray(rows) && rows.length ? rowToUser(rows[0]) : null;
}

async function findUserByEmail(email) {
  const key = normalize(email);
  if (!key) return null;
  const rows = await supabaseRequest(`/rest/v1/${usersTable()}`, {
    params: {
      select: "*",
      email: `eq.${key}`,
      limit: "1"
    }
  });
  return Array.isArray(rows) && rows.length ? rowToUser(rows[0]) : null;
}

async function findUserByUsername(username) {
  const key = normalize(username);
  if (!key) return null;
  const rows = await supabaseRequest(`/rest/v1/${usersTable()}`, {
    params: {
      select: "*",
      username: `eq.${key}`,
      limit: "1"
    }
  });
  return Array.isArray(rows) && rows.length ? rowToUser(rows[0]) : null;
}

async function createUser(user) {
  const row = userToRow(user);
  row.created_at = user.createdAt || new Date().toISOString();
  const rows = await supabaseRequest(`/rest/v1/${usersTable()}`, {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: row
  });
  return Array.isArray(rows) && rows.length ? rowToUser(rows[0]) : null;
}

async function replaceUser(user) {
  const row = userToRow(user);
  const rows = await supabaseRequest(`/rest/v1/${usersTable()}`, {
    method: "POST",
    params: {
      on_conflict: "email"
    },
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: row
  });
  return Array.isArray(rows) && rows.length ? rowToUser(rows[0]) : null;
}

async function updateUserByEmail(email, updates) {
  const existing = await findUserByEmail(email);
  if (!existing) return null;
  const merged = ensureAccessFields({
    ...existing,
    ...updates,
    email: existing.email,
    username: updates.username || existing.username,
    passwordHash: updates.passwordHash || existing.passwordHash,
    updatedAt: new Date().toISOString()
  });
  return replaceUser(merged);
}

async function deleteUserByEmail(email) {
  const existing = await findUserByEmail(email);
  if (!existing) return null;
  await supabaseRequest(`/rest/v1/${usersTable()}`, {
    method: "DELETE",
    params: {
      email: `eq.${normalize(email)}`
    },
    headers: {
      Prefer: "return=minimal"
    }
  });
  return existing;
}

async function issueSession(user, hours = defaultSessionHours) {
  const token = generateSessionToken();
  const updated = await updateUserByEmail(user.email, {
    sessionTokenHash: sessionTokenHash(token),
    sessionTokenIssuedAt: new Date().toISOString(),
    sessionTokenExpiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
    lastSignedInAt: user.lastSignedInAt,
    lastSeenAt: user.lastSeenAt,
    lastActivityAt: user.lastActivityAt,
    signInCount: user.signInCount
  });
  return {
    user: updated,
    sessionToken: token
  };
}

async function refreshSession(user, token, hours = defaultSessionHours) {
  if (!sessionIsValid(user, token)) return null;
  const updated = await updateUserByEmail(user.email, {
    sessionTokenIssuedAt: new Date().toISOString(),
    sessionTokenExpiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
  });
  return updated;
}

function sessionIsValid(user, token) {
  if (!user?.sessionTokenHash || !token) return false;
  const expiresAt = new Date(user.sessionTokenExpiresAt || "");
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) return false;
  return sessionTokenHash(token) === user.sessionTokenHash;
}

module.exports = {
  createUser,
  deleteUserByEmail,
  ensureAccessFields,
  findUserByEmail,
  findUserByIdentity,
  findUserByUsername,
  issueSession,
  listUsers,
  normalize,
  publicUser,
  refreshSession,
  replaceUser,
  sessionIsValid,
  supabaseConfigured,
  updateUserByEmail
};
