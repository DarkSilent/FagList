const db = require("../db");
const authHook = require("../auth");

const getRounds = db.prepare(`
  SELECT r.id, r.author_discord_id, COALESCE(u.username, a.username, r.author_discord_id) as author_username,
         r.game, r.info, r.played_at, r.rating, r.created_at
  FROM rounds r
  LEFT JOIN users u ON u.discord_id = r.author_discord_id
  LEFT JOIN api_keys a ON a.discord_user_id = r.author_discord_id
  WHERE r.target_discord_id = ?
  ORDER BY r.played_at DESC
`);

const getAvgRating = db.prepare(
  "SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM rounds WHERE target_discord_id = ?"
);

const insertRound = db.prepare(`
  INSERT INTO rounds (target_discord_id, author_discord_id, game, info, played_at, rating)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const deleteRound = db.prepare(
  "DELETE FROM rounds WHERE id = ? AND author_discord_id = ?"
);

const deleteRoundAdmin = db.prepare(
  "DELETE FROM rounds WHERE id = ?"
);

const getRoundById = db.prepare("SELECT * FROM rounds WHERE id = ?");

async function roundsRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/users/:discordId/rounds", async (request) => {
    const { discordId } = request.params;
    const rows = getRounds.all(discordId);
    const stats = getAvgRating.get(discordId);
    return {
      rounds: rows,
      avgRating: stats.avg_rating ? Math.round(stats.avg_rating * 100) / 100 : null,
      totalRounds: stats.total,
    };
  });

  fastify.post("/api/users/:discordId/rounds", async (request, reply) => {
    const { discordId } = request.params;
    const { game, info, played_at, rating, target_username } = request.body || {};

    if (rating === undefined || rating === null || typeof rating !== "number" || rating < 0 || rating > 5) {
      return reply.code(400).send({ error: "rating must be an integer between 0 and 5" });
    }

    if (target_username && typeof target_username === "string") {
      db.upsertUserWithHistory(discordId, target_username.trim());
    }

    const result = insertRound.run(
      discordId,
      request.discordUserId,
      (game || "").trim(),
      (info || "").trim(),
      played_at || new Date().toISOString(),
      Math.round(rating)
    );

    reply.code(201);
    return { ok: true, id: Number(result.lastInsertRowid) };
  });

  fastify.delete("/api/rounds/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = getRoundById.get(id);

    if (!existing) {
      return reply.code(404).send({ error: "Round not found" });
    }
    if (request.isAdmin) {
      deleteRoundAdmin.run(id);
      return { ok: true };
    }

    if (existing.author_discord_id !== request.discordUserId) {
      return reply.code(403).send({ error: "You can only delete your own rounds" });
    }

    deleteRound.run(id, request.discordUserId);
    return { ok: true };
  });
}

module.exports = roundsRoutes;
