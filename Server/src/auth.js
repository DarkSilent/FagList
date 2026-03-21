const db = require("./db");

const lookupKey = db.prepare(
  "SELECT discord_user_id, username, is_admin FROM api_keys WHERE key = ?"
);

async function authHook(request, reply) {
  const apiKey = request.headers["x-api-key"];
  if (!apiKey) {
    return reply.code(401).send({ error: "Missing x-api-key header" });
  }

  const row = lookupKey.get(apiKey);
  if (!row) {
    return reply.code(401).send({ error: "Invalid API key" });
  }

  request.discordUserId = row.discord_user_id;
  request.username = row.username;
  request.isAdmin = row.is_admin === 1;
}

module.exports = authHook;
