const authHook = require("../auth");

async function meRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/me", async (request) => {
    return {
      discord_user_id: request.discordUserId,
      username: request.username,
      is_admin: request.isAdmin,
    };
  });
}

module.exports = meRoutes;
