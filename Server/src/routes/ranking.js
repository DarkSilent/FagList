const db = require("../db");
const authHook = require("../auth");

const getRanking = db.prepare(`
  SELECT
    r.target_discord_id as discord_id,
    COALESCE(u.username, r.target_discord_id) as username,
    ROUND(AVG(r.rating), 2) as avg_rating,
    COUNT(r.id) as total_rounds,
    (SELECT COUNT(*) FROM notes n WHERE n.target_discord_id = r.target_discord_id) as total_notes
  FROM rounds r
  LEFT JOIN users u ON u.discord_id = r.target_discord_id
  GROUP BY r.target_discord_id
  ORDER BY avg_rating DESC, total_rounds DESC
`);

async function rankingRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/ranking", async () => {
    const rows = getRanking.all();
    return { ranking: rows };
  });
}

module.exports = rankingRoutes;
