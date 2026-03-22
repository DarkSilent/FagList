const db = require("../db");
const authHook = require("../auth");

const getAllUsers = db.prepare(
  "SELECT discord_id, username, updated_at FROM users ORDER BY username COLLATE NOCASE ASC"
);

const getUser = db.prepare("SELECT discord_id, username FROM users WHERE discord_id = ?");

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

    db.upsertUserWithHistory(discord_id.trim(), username.trim());
    return { ok: true };
  });

  fastify.post("/api/users/batch", async (request, reply) => {
    const { ids } = request.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return reply.code(400).send({ error: "ids must be a non-empty array" });
    }
    if (ids.length > 100) {
      return reply.code(400).send({ error: "Maximum 100 IDs per request" });
    }
    if (!ids.every(id => typeof id === "string" && /^\d{1,20}$/.test(id))) {
      return reply.code(400).send({ error: "Each id must be a numeric string" });
    }

    const placeholders = ids.map(() => "?").join(",");
    const rows = db.prepare(`
      SELECT
        u.discord_id,
        u.username,
        COALESCE(r_agg.avg_rating, NULL) AS avg_rating,
        COALESCE(r_agg.total_rounds, 0) AS total_rounds,
        COALESCE(n_agg.total_notes, 0) AS total_notes
      FROM users u
      LEFT JOIN (
        SELECT target_discord_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS total_rounds
        FROM rounds GROUP BY target_discord_id
      ) r_agg ON r_agg.target_discord_id = u.discord_id
      LEFT JOIN (
        SELECT target_discord_id, COUNT(*) AS total_notes
        FROM notes GROUP BY target_discord_id
      ) n_agg ON n_agg.target_discord_id = u.discord_id
      WHERE u.discord_id IN (${placeholders})
      ORDER BY u.username COLLATE NOCASE ASC
    `).all(...ids);

    return { users: rows };
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
      db.upsertUserWithHistory(discordId, trimmedName);
    }

    return { ok: true };
  });
}

module.exports = usersRoutes;
