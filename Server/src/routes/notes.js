const db = require("../db");
const authHook = require("../auth");

const getNotes = db.prepare(`
  SELECT n.id, n.author_discord_id, COALESCE(a.username, n.author_discord_id) as author_username,
         n.content, n.updated_at
  FROM notes n
  LEFT JOIN api_keys a ON a.discord_user_id = n.author_discord_id
  WHERE n.target_discord_id = ?
  ORDER BY n.updated_at DESC
`);

const upsertNote = db.prepare(`
  INSERT INTO notes (target_discord_id, author_discord_id, content, updated_at)
  VALUES (?, ?, ?, datetime('now'))
  ON CONFLICT(target_discord_id, author_discord_id)
  DO UPDATE SET content = excluded.content, updated_at = datetime('now')
`);

const deleteNote = db.prepare(
  "DELETE FROM notes WHERE target_discord_id = ? AND author_discord_id = ?"
);

const upsertUser = db.prepare(`
  INSERT INTO users (discord_id, username, updated_at)
  VALUES (?, ?, datetime('now'))
  ON CONFLICT(discord_id)
  DO UPDATE SET username = excluded.username, updated_at = datetime('now')
`);

async function notesRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/users/:discordId/notes", async (request) => {
    const { discordId } = request.params;
    const rows = getNotes.all(discordId);
    return { notes: rows };
  });

  fastify.put("/api/users/:discordId/notes", async (request, reply) => {
    const { discordId } = request.params;
    const { content, target_username } = request.body || {};

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return reply.code(400).send({ error: "content is required" });
    }

    if (target_username && typeof target_username === "string") {
      upsertUser.run(discordId, target_username.trim());
    }

    upsertNote.run(discordId, request.discordUserId, content.trim());
    return { ok: true };
  });

  fastify.delete("/api/users/:discordId/notes", async (request) => {
    const { discordId } = request.params;
    deleteNote.run(discordId, request.discordUserId);
    return { ok: true };
  });
}

module.exports = notesRoutes;
