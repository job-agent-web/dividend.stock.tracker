const {
  findUserByEmail,
  publicUser,
  refreshSession,
  sessionIsValid,
  supabaseConfigured
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
    const email = String(body.email || "").trim().toLowerCase();
    const sessionToken = String(body.sessionToken || "").trim();
    const user = await findUserByEmail(email);
    if (!user || !sessionIsValid(user, sessionToken)) {
      json(response, 401, { ok: false, message: "Your sign-in session has expired. Please sign in again." });
      return;
    }
    const refreshedUser = await refreshSession(user, sessionToken);
    json(response, 200, { ok: true, user: publicUser(refreshedUser || user) });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not load account session." });
  }
};
