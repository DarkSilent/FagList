const db = require("../db");
const authHook = require("../auth");

async function searchRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/users/search", async (request, reply) => {
    const q = (request.query.q || "").trim();

    if (q.length < 2) {
      return reply.code(400).send({ error: "Search query must be at least 2 characters" });
    }

    const pattern = `%${q}%`;

    // Find matching discord_ids from both current usernames and history
    const matchedUsers = db.prepare(`
      SELECT DISTINCT u.discord_id, u.username
      FROM users u
      WHERE u.username LIKE ?
      UNION
      SELECT DISTINCT u.discord_id, u.username
      FROM username_history h
      JOIN users u ON u.discord_id = h.discord_id
      WHERE h.username LIKE ?
      ORDER BY username COLLATE NOCASE ASC
      LIMIT 25
    `).all(pattern, pattern);

    // Fetch full history for each matched user
    const getHistory = db.prepare(
      "SELECT username, changed_at FROM username_history WHERE discord_id = ? ORDER BY changed_at DESC"
    );

    const results = matchedUsers.map((u) => ({
      discord_id: u.discord_id,
      username: u.username,
      history: getHistory.all(u.discord_id),
    }));

    return { results };
  });

  fastify.get("/api/users/:discordId/history", async (request) => {
    const { discordId } = request.params;
    const rows = db.prepare(
      "SELECT username, changed_at FROM username_history WHERE discord_id = ? ORDER BY changed_at DESC"
    ).all(discordId);
    return { history: rows };
  });
}

module.exports = searchRoutes;
