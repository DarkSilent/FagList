const db = require("../db");
const authHook = require("../auth");

const getRecentNotes = db.prepare(`
  SELECT n.id, n.target_discord_id,
         COALESCE(NULLIF(u.username, ''), n.target_discord_id) AS target_username,
         n.author_discord_id,
         COALESCE(NULLIF(ua.username, ''), NULLIF(a.username, ''), n.author_discord_id) AS author_username,
         n.content, n.updated_at
  FROM notes n
  LEFT JOIN users u ON u.discord_id = n.target_discord_id
  LEFT JOIN users ua ON ua.discord_id = n.author_discord_id
  LEFT JOIN api_keys a ON a.discord_user_id = n.author_discord_id
  ORDER BY n.updated_at DESC
  LIMIT ?
`);

async function recentNotesRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/notes/recent", async (request) => {
    const limit = Math.min(Math.max(parseInt(request.query.limit, 10) || 50, 1), 200);
    const rows = getRecentNotes.all(limit);
    return { notes: rows };
  });
}

module.exports = recentNotesRoutes;
