const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

const notesRoutes = require("./routes/notes");
const roundsRoutes = require("./routes/rounds");
const keysRoutes = require("./routes/keys");
const rankingRoutes = require("./routes/ranking");
const meRoutes = require("./routes/me");
const usersRoutes = require("./routes/users");

async function start() {
  await fastify.register(cors, { origin: true });

  await fastify.register(notesRoutes);
  await fastify.register(roundsRoutes);
  await fastify.register(keysRoutes);
  await fastify.register(rankingRoutes);
  await fastify.register(meRoutes);
  await fastify.register(usersRoutes);

  fastify.get("/health", async () => ({ status: "ok" }));

  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
