const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const authHook = require("../auth");

const PLUGIN_PATH = path.join(__dirname, "../../plugin/FagList.plugin.js");

async function pluginRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  fastify.get("/api/plugin/hash", async (request, reply) => {
    try {
      const content = fs.readFileSync(PLUGIN_PATH, "utf8").replace(/\r\n/g, "\n");
      const hash = crypto.createHash("sha256").update(content).digest("hex");
      return { hash };
    } catch {
      return reply.code(404).send({ error: "Plugin file not found" });
    }
  });

  fastify.get("/api/plugin/download", async (request, reply) => {
    try {
      const content = fs.readFileSync(PLUGIN_PATH, "utf8");
      return reply.type("text/plain").send(content);
    } catch {
      return reply.code(404).send({ error: "Plugin file not found" });
    }
  });
}

module.exports = pluginRoutes;
