const db = require("../db");
const authHook = require("../auth");
const { v4: uuidv4 } = require("uuid");

const insertKey = db.prepare(
  "INSERT INTO api_keys (key, discord_user_id, username, is_admin) VALUES (?, ?, ?, ?)"
);

const getKeyByUser = db.prepare(
  "SELECT key, discord_user_id, username, is_admin, created_at FROM api_keys WHERE discord_user_id = ?"
);

const getAllKeys = db.prepare(
  "SELECT key, discord_user_id, username, is_admin, created_at FROM api_keys ORDER BY created_at DESC"
);

const deleteKeyStmt = db.prepare("DELETE FROM api_keys WHERE key = ? AND is_admin = 0");

const updateKeyUsername = db.prepare(
  "UPDATE api_keys SET username = ? WHERE key = ? AND is_admin = 0"
);

const updateKeyFull = db.prepare(
  "UPDATE api_keys SET username = ?, discord_user_id = ? WHERE key = ? AND is_admin = 0"
);

async function keysRoutes(fastify) {
  fastify.addHook("onRequest", authHook);

  // Admin-only: create new API key
  fastify.post("/api/keys", async (request, reply) => {
    if (!request.isAdmin) {
      return reply.code(403).send({ error: "Admin privileges required" });
    }

    const { discord_user_id, username } = request.body || {};

    if (!discord_user_id || typeof discord_user_id !== "string" || discord_user_id.trim().length === 0) {
      return reply.code(400).send({ error: "discord_user_id is required" });
    }
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return reply.code(400).send({ error: "username is required" });
    }

    const existing = getKeyByUser.get(discord_user_id.trim());
    if (existing) {
      return { key: existing.key, username: existing.username, created_at: existing.created_at, existing: true };
    }

    const key = uuidv4();
    insertKey.run(key, discord_user_id.trim(), username.trim(), 0);

    reply.code(201);
    return { key, username: username.trim(), existing: false };
  });

  // Admin-only: list all keys
  fastify.get("/api/keys", async (request, reply) => {
    if (!request.isAdmin) {
      return reply.code(403).send({ error: "Admin privileges required" });
    }
    return { keys: getAllKeys.all() };
  });

  // Admin-only: delete key
  fastify.delete("/api/keys/:key", async (request, reply) => {
    if (!request.isAdmin) {
      return reply.code(403).send({ error: "Admin privileges required" });
    }
    const result = deleteKeyStmt.run(request.params.key);
    if (result.changes === 0) {
      return reply.code(404).send({ error: "Key not found or is admin key" });
    }
    return { ok: true };
  });

  // Admin-only: update key (username and/or discord_user_id)
  fastify.patch("/api/keys/:key", async (request, reply) => {
    if (!request.isAdmin) {
      return reply.code(403).send({ error: "Admin privileges required" });
    }
    const { username, discord_user_id } = request.body || {};
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return reply.code(400).send({ error: "username is required" });
    }
    let result;
    if (discord_user_id && typeof discord_user_id === "string" && discord_user_id.trim().length > 0) {
      result = updateKeyFull.run(username.trim(), discord_user_id.trim(), request.params.key);
    } else {
      result = updateKeyUsername.run(username.trim(), request.params.key);
    }
    if (result.changes === 0) {
      return reply.code(404).send({ error: "Key not found or is admin key" });
    }
    return { ok: true };
  });
}

module.exports = keysRoutes;
