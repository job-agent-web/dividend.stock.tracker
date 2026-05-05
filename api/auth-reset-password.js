const {
  findUserByEmail,
  supabaseConfigured,
  updateUserByEmail
} = require("./_shared-user-store");

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
    const passwordHash = String(body.passwordHash || "").trim();
    const user = await findUserByEmail(email);
    if (!user) {
      json(response, 404, { ok: false, message: "No account was found with that email address." });
      return;
    }
    if (user.isLocked) {
      json(response, 403, { ok: false, message: "This account is unavailable. Contact support for help." });
      return;
    }
    if (!passwordHash || passwordHash.length < 20) {
      json(response, 400, { ok: false, message: "A valid password hash is required." });
      return;
    }
    await updateUserByEmail(email, {
      passwordHash,
      lastPasswordResetAt: new Date().toISOString()
    });
    json(response, 200, { ok: true, message: "Password reset. You can now sign in with the new password." });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not reset password." });
  }
};
