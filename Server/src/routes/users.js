const db = require("../db");
const authHook = require("../auth");

const getAllUsers = db.prepare(
  "SELECT discord_id, username, updated_at FROM users ORDER BY username COLLATE NOCASE ASC"
);

const getUser = db.prepare("SELECT discord_id, username FROM users WHERE discord_id = ?");

const upsertUser = db.prepare(`
  INSERT INTO users (discord_id, username, updated_at)
  VALUES (?, ?, datetime('now'))
  ON CONFLICT(discord_id)
  DO UPDATE SET username = excluded.username, updated_at = datetime('now')
`);

const updateUserDiscordId = db.prepare("UPDATE users SET discord_id = ?, username = ?, updated_at = datetime('now') WHERE discord_id = ?");
const updateNotesTarget = db.prepare("UPDATE notes SET target_discord_id = ? WHERE target_discord_id = ?");
const updateNotesAuthor = db.prepare("UPDATE notes SET author_discord_id = ? WHERE author_discord_id = ?");
const updateRoundsTarget = db.prepare("UPDATE rounds SET target_discord_id = ? WHERE target_discord_id = ?");
const updateRoundsAuthor = db.prepare("UPDATE rounds SET author_discord_id = ? WHERE author_discord_id = ?");

async function usersRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/users", async (request, reply) => {
    if (!request.isAdmin) {
      return reply.code(403).send({ error: "Admin privileges required" });
    }
    return { users: getAllUsers.all() };
  });

  fastify.post("/api/users", async (request, reply) => {
    if (!request.isAdmin) {
      return reply.code(403).send({ error: "Admin privileges required" });
    }

    const { discord_id, username } = request.body || {};

    if (!discord_id || typeof discord_id !== "string" || discord_id.trim().length === 0) {
      return reply.code(400).send({ error: "discord_id is required" });
    }
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return reply.code(400).send({ error: "username is required" });
    }

    upsertUser.run(discord_id.trim(), username.trim());
    return { ok: true };
  });

  fastify.patch("/api/users/:discordId", async (request, reply) => {
    if (!request.isAdmin) {
      return reply.code(403).send({ error: "Admin privileges required" });
    }

    const { discordId } = request.params;
    const { username, discord_id: newDiscordId } = request.body || {};

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return reply.code(400).send({ error: "username is required" });
    }

    const existing = getUser.get(discordId);
    if (!existing) {
      return reply.code(404).send({ error: "User not found" });
    }

    const trimmedName = username.trim();
    const trimmedNewId = newDiscordId ? newDiscordId.trim() : null;

    if (trimmedNewId && trimmedNewId !== discordId) {
      if (!/^\d{17,20}$/.test(trimmedNewId)) {
        return reply.code(400).send({ error: "Invalid Discord ID format" });
      }
      const conflict = getUser.get(trimmedNewId);
      if (conflict) {
        return reply.code(409).send({ error: "A user with this Discord ID already exists" });
      }
      const migrate = db.transaction(() => {
        updateNotesTarget.run(trimmedNewId, discordId);
        updateNotesAuthor.run(trimmedNewId, discordId);
        updateRoundsTarget.run(trimmedNewId, discordId);
        updateRoundsAuthor.run(trimmedNewId, discordId);
        updateUserDiscordId.run(trimmedNewId, trimmedName, discordId);
      });
      migrate();
    } else {
      upsertUser.run(discordId, trimmedName);
    }

    return { ok: true };
  });
}

module.exports = usersRoutes;
