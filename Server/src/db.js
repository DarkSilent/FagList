const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, "faglist.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS api_keys (
    key             TEXT PRIMARY KEY,
    discord_user_id TEXT NOT NULL,
    username        TEXT NOT NULL DEFAULT '',
    is_admin        INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    username   TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    target_discord_id TEXT NOT NULL,
    author_discord_id TEXT NOT NULL,
    content           TEXT NOT NULL,
    updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(target_discord_id, author_discord_id)
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    target_discord_id TEXT NOT NULL,
    author_discord_id TEXT NOT NULL,
    game              TEXT NOT NULL DEFAULT '',
    info              TEXT NOT NULL DEFAULT '',
    played_at         TEXT NOT NULL DEFAULT (datetime('now')),
    rating            INTEGER NOT NULL CHECK(rating BETWEEN 0 AND 5),
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_notes_target ON notes(target_discord_id);
  CREATE INDEX IF NOT EXISTS idx_rounds_target ON rounds(target_discord_id);
`);

/* ── Migrate existing DBs ─────────────────────────────────── */
try { db.exec("ALTER TABLE api_keys ADD COLUMN username TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE api_keys ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0"); } catch (_) {}

// Migrate rating constraint from 1-5 to 0-5 on existing databases
try {
  const tableInfo = db.pragma("table_info(rounds)");
  if (tableInfo.length > 0) {
    // Check if old constraint exists by trying to insert rating=0
    const testStmt = db.prepare("INSERT INTO rounds (target_discord_id, author_discord_id, rating) VALUES ('__test__', '__test__', 0)");
    try {
      db.transaction(() => {
        testStmt.run();
        db.prepare("DELETE FROM rounds WHERE target_discord_id = '__test__'").run();
      })();
    } catch (_) {
      // Old constraint blocks 0 – rebuild table
      db.exec(`
        ALTER TABLE rounds RENAME TO rounds_old;
        CREATE TABLE rounds (
          id                INTEGER PRIMARY KEY AUTOINCREMENT,
          target_discord_id TEXT NOT NULL,
          author_discord_id TEXT NOT NULL,
          game              TEXT NOT NULL DEFAULT '',
          info              TEXT NOT NULL DEFAULT '',
          played_at         TEXT NOT NULL DEFAULT (datetime('now')),
          rating            INTEGER NOT NULL CHECK(rating BETWEEN 0 AND 5),
          created_at        TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT INTO rounds SELECT * FROM rounds_old;
        DROP TABLE rounds_old;
        CREATE INDEX IF NOT EXISTS idx_rounds_target ON rounds(target_discord_id);
      `);
    }
  }
} catch (_) {}

/* ── Seed admin key ───────────────────────────────────────── */
db.prepare(`
  INSERT OR IGNORE INTO api_keys (key, discord_user_id, username, is_admin)
  VALUES (?, ?, ?, 1)
`).run("1a5c19d4-d78a-4c8d-bd42-6c913db61661", "admin", "Admin");

module.exports = db;
