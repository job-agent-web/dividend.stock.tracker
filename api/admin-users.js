const { requireAdminSession } = require("./_admin-session");
const { listUsers, publicUser, supabaseConfigured } = require("./_shared-user-store");

function json(response, status, payload) {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.status(status).send(JSON.stringify(payload));
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
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
    const users = await listUsers();
    json(response, 200, {
      ok: true,
      users: users.map(publicUser)
    });
  } catch (error) {
    json(response, 500, { ok: false, message: error.message || "Could not load users." });
  }
};
