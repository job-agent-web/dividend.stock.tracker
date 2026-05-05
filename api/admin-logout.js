const sessionCookieName = "dividend_admin_session";

module.exports = function handler(request, response) {
  if (request.method !== "POST" && request.method !== "GET") {
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.status(405).send(JSON.stringify({ ok: false, message: "Method not allowed." }));
    return;
  }

  response.setHeader("set-cookie", [
    `${sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0"
  ].join("; "));
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.status(200).send(JSON.stringify({ ok: true, message: "Admin session cleared." }));
};
