const db = require("../db");
const authHook = require("../auth");

const getAllNotes = db.prepare(`
  SELECT n.id, n.target_discord_id,
         COALESCE(NULLIF(u.username, ''), n.target_discord_id) AS target_username,
         n.author_discord_id,
         COALESCE(NULLIF(ua.username, ''), NULLIF(a.username, ''), n.author_discord_id) AS author_username,
         n.content, n.updated_at
  FROM notes n
  LEFT JOIN users u ON u.discord_id = n.target_discord_id
  LEFT JOIN users ua ON ua.discord_id = n.author_discord_id
  LEFT JOIN api_keys a ON a.discord_user_id = n.author_discord_id
  ORDER BY LOWER(COALESCE(NULLIF(u.username, ''), n.target_discord_id)), n.updated_at DESC
`);

async function allNotesRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/notes/all", async () => {
    const rows = getAllNotes.all();
    return { notes: rows };
  });
}

module.exports = allNotesRoutes;
