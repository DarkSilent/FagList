/**
 * @name FagList
 * @author DarkSilent
 * @version 1.1.0
 * @description Kollaborativ Notizen und Spielrunden-Bewertungen zu Discord-Nutzern hinterlegen.
 * @source https://github.com/DarkSilent/FagList
 */

module.exports = (() => {
  const config = {
    info: {
      name: "FagList",
      authors: [{ name: "DarkSilent" }],
      version: "1.1.0",
      description: "Kollaborativ Notizen und Spielrunden-Bewertungen zu Discord-Nutzern hinterlegen.",
    },
  };

  const API_URL_PROD = "https://fag.slnt.de";
  const API_URL_LOCAL = "http://localhost:3000";

  function getApiBase() {
    return BdApi.Data.load(config.info.name, "localMode") ? API_URL_LOCAL : API_URL_PROD;
  }

  /* ── CSS ─────────────────────────────────────────────────── */
  const css = `
    .faglist-modal-root {
      color: var(--text-normal);
      padding: 16px 20px;
      width: 100%;
      box-sizing: border-box;
      max-height: 85vh;
    }
    .faglist-scroll-list {
      max-height: 45vh;
      overflow-y: auto;
    }
    .faglist-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      border-bottom: 2px solid var(--background-modifier-accent);
      padding-bottom: 10px;
    }
    .faglist-tab {
      padding: 8px 20px;
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      font-weight: 600;
      font-size: 15px;
      background: transparent;
      color: var(--text-muted);
      border: none;
      transition: background 0.15s, color 0.15s;
    }
    .faglist-tab:hover {
      background: var(--background-modifier-hover);
      color: var(--text-normal);
    }
    .faglist-tab.active {
      background: var(--background-modifier-selected);
      color: var(--text-normal);
      border-bottom: 2px solid var(--brand-experiment);
      margin-bottom: -2px;
    }
    .faglist-section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--header-secondary);
      margin: 16px 0 8px;
      letter-spacing: 0.02em;
    }
    .faglist-avg {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: 10px;
      background: var(--background-secondary);
    }
    .faglist-avg-label {
      font-weight: 700;
      font-size: 16px;
    }
    .faglist-avg-value {
      font-size: 14px;
      color: var(--text-muted);
    }
    .faglist-stars {
      display: inline-flex;
      gap: 2px;
    }
    .faglist-star {
      cursor: pointer;
      font-size: 22px;
      color: var(--text-muted);
      transition: color 0.1s;
      background: none;
      border: none;
      padding: 0;
      line-height: 1;
    }
    .faglist-star.filled {
      color: #faa61a;
    }
    .faglist-star.readonly {
      cursor: default;
    }
    .faglist-note-card, .faglist-round-card {
      background: var(--background-secondary);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 10px;
    }
    .faglist-note-author, .faglist-round-author {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .faglist-note-content {
      font-size: 15px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.45;
    }
    .faglist-round-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .faglist-round-game {
      font-weight: 700;
      font-size: 15px;
    }
    .faglist-round-info {
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1.4;
    }
    .faglist-round-date {
      font-size: 12px;
      color: var(--text-muted);
    }
    .faglist-textarea {
      width: 100%;
      box-sizing: border-box;
      min-height: 80px;
      background: var(--background-tertiary);
      border: 1px solid var(--background-modifier-accent);
      border-radius: 8px;
      color: var(--text-normal);
      padding: 10px 12px;
      font-size: 15px;
      resize: vertical;
      font-family: inherit;
      line-height: 1.45;
    }
    .faglist-textarea:focus {
      outline: none;
      border-color: var(--brand-experiment);
    }
    .faglist-input {
      width: 100%;
      box-sizing: border-box;
      background: var(--background-tertiary);
      border: 1px solid var(--background-modifier-accent);
      border-radius: 8px;
      color: var(--text-normal);
      padding: 10px 12px;
      font-size: 15px;
      font-family: inherit;
    }
    .faglist-input:focus {
      outline: none;
      border-color: var(--brand-experiment);
    }
    .faglist-btn {
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.15s, opacity 0.15s;
    }
    .faglist-btn-primary {
      background: var(--brand-experiment);
      color: #fff;
    }
    .faglist-btn-primary:hover {
      background: var(--brand-experiment-560);
    }
    .faglist-btn-danger {
      background: var(--button-danger-background);
      color: #fff;
    }
    .faglist-btn-danger:hover {
      opacity: 0.85;
    }
    .faglist-btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .faglist-form-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .faglist-form-row > * {
      flex: 1;
    }
    .faglist-empty {
      color: var(--text-muted);
      font-style: italic;
      font-size: 14px;
      padding: 16px 0;
    }
    .faglist-error {
      color: var(--text-danger);
      font-size: 14px;
      padding: 6px 0;
    }
    .faglist-loading {
      color: var(--text-muted);
      font-size: 14px;
      padding: 16px 0;
    }
    .faglist-settings {
      padding: 16px;
    }
    .faglist-settings label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--header-primary);
    }
    .faglist-settings .faglist-hint {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 6px;
    }
    .faglist-popout-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin: 4px 12px;
      background: var(--background-secondary);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .faglist-popout-badge:hover {
      background: var(--background-modifier-hover);
    }
    .faglist-popout-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--header-secondary);
    }
    .faglist-delete-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 16px;
      padding: 2px 6px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .faglist-delete-btn:hover {
      color: var(--text-danger);
      background: var(--background-modifier-hover);
    }
    /* ── Ranking table ─────────────────────────── */
    .faglist-ranking-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 4px;
    }
    .faglist-ranking-table th {
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--header-secondary);
      padding: 8px 12px;
      letter-spacing: 0.02em;
    }
    .faglist-ranking-table td {
      background: var(--background-secondary);
      padding: 10px 12px;
      font-size: 14px;
    }
    .faglist-ranking-table tr td:first-child {
      border-radius: 8px 0 0 8px;
    }
    .faglist-ranking-table tr td:last-child {
      border-radius: 0 8px 8px 0;
    }
    .faglist-rank-num {
      font-weight: 700;
      font-size: 16px;
      color: var(--text-muted);
      min-width: 32px;
      text-align: center;
    }
    .faglist-rank-gold { color: #faa61a; }
    .faglist-rank-silver { color: #b0b0b0; }
    .faglist-rank-bronze { color: #cd7f32; }
    .faglist-rank-name {
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
    }
    .faglist-rank-name:hover {
      text-decoration: underline;
      color: var(--brand-experiment);
    }
    .faglist-note-date {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    /* ── Admin settings ─────────────────────────── */
    .faglist-admin-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--background-modifier-accent);
    }
    .faglist-admin-section h3 {
      font-size: 14px;
      font-weight: 700;
      color: var(--header-primary);
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .faglist-admin-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 4px;
      margin-bottom: 12px;
    }
    .faglist-admin-table th {
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--header-secondary);
      padding: 4px 8px;
    }
    .faglist-admin-table td {
      background: var(--background-secondary);
      padding: 8px;
      font-size: 13px;
      color: var(--text-normal);
    }
    .faglist-admin-table tr td:first-child {
      border-radius: 6px 0 0 6px;
    }
    .faglist-admin-table tr td:last-child {
      border-radius: 0 6px 6px 0;
    }
    .faglist-admin-table .faglist-input {
      padding: 4px 8px;
      font-size: 13px;
    }
    .faglist-admin-form {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 8px;
    }
    .faglist-admin-form .faglist-input {
      padding: 6px 10px;
      font-size: 13px;
      flex: 1;
    }
    .faglist-admin-form .faglist-btn {
      padding: 6px 14px;
      font-size: 13px;
      white-space: nowrap;
    }
    .faglist-key-text {
      font-family: monospace;
      font-size: 12px;
      user-select: all;
      word-break: break-all;
    }
    /* ── All Notes / Channel views ──────────────── */
    .faglist-user-group {
      margin-bottom: 6px;
    }
    .faglist-user-group-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: var(--background-secondary);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      user-select: none;
    }
    .faglist-user-group-header:hover {
      background: var(--background-modifier-hover);
    }
    .faglist-expand-icon {
      font-size: 12px;
      color: var(--text-muted);
      transition: transform 0.2s;
      display: inline-block;
    }
    .faglist-expand-icon.open {
      transform: rotate(90deg);
    }
    .faglist-group-name {
      font-weight: 600;
      font-size: 15px;
      flex: 1;
    }
    .faglist-group-name:hover {
      color: var(--brand-experiment);
      text-decoration: underline;
    }
    .faglist-group-count {
      font-size: 12px;
      color: var(--text-muted);
      background: var(--background-tertiary);
      padding: 2px 8px;
      border-radius: 10px;
    }
    .faglist-group-notes {
      padding: 6px 0 6px 24px;
    }
    .faglist-channel-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: var(--background-secondary);
      border-radius: 8px;
      margin-bottom: 14px;
    }
    .faglist-channel-name {
      font-weight: 700;
      font-size: 15px;
    }
    .faglist-channel-count {
      font-size: 13px;
      color: var(--text-muted);
    }
  `;

  /* ── API Client ─────────────────────────────────────────── */
  function getApiKey() {
    return BdApi.Data.load(config.info.name, "apiKey") || "";
  }

  function apiHeaders(hasBody) {
    const h = { "x-api-key": getApiKey() };
    if (hasBody) h["Content-Type"] = "application/json";
    return h;
  }

  async function apiFetch(path, options = {}) {
    const res = await BdApi.Net.fetch(`${getApiBase()}${path}`, {
      ...options,
      headers: { ...apiHeaders(!!options.body), ...(options.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  const api = {
    getNotes: (id) => apiFetch(`/api/users/${id}/notes`),
    saveNote: (id, content, target_username) =>
      apiFetch(`/api/users/${id}/notes`, {
        method: "PUT",
        body: JSON.stringify({ content, target_username }),
      }),
    deleteNote: (id) =>
      apiFetch(`/api/users/${id}/notes`, { method: "DELETE" }),

    getRounds: (id) => apiFetch(`/api/users/${id}/rounds`),
    addRound: (id, data) =>
      apiFetch(`/api/users/${id}/rounds`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    deleteRound: (roundId) =>
      apiFetch(`/api/rounds/${roundId}`, { method: "DELETE" }),

    getRanking: () => apiFetch("/api/ranking"),
    getMe: () => apiFetch("/api/me"),

    getUsers: () => apiFetch("/api/users"),
    addUser: (discord_id, username) =>
      apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ discord_id, username }),
      }),
    updateUser: (discordId, username, newDiscordId) =>
      apiFetch(`/api/users/${discordId}`, {
        method: "PATCH",
        body: JSON.stringify({ username, discord_id: newDiscordId }),
      }),

    getKeys: () => apiFetch("/api/keys"),
    createKey: (discord_user_id, username) =>
      apiFetch("/api/keys", {
        method: "POST",
        body: JSON.stringify({ discord_user_id, username }),
      }),
    deleteKey: (key) =>
      apiFetch(`/api/keys/${key}`, { method: "DELETE" }),
    renameKey: (key, username, discord_user_id) =>
      apiFetch(`/api/keys/${key}`, {
        method: "PATCH",
        body: JSON.stringify({ username, discord_user_id }),
      }),

    getAllNotes: () => apiFetch("/api/notes/all"),
    batchUsers: (ids) =>
      apiFetch("/api/users/batch", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  };

  /* ── React helpers ──────────────────────────────────────── */
  const React = BdApi.React;
  const { useState, useEffect, useCallback } = React;

  /* ── Username resolver ──────────────────────────────────── */
  function resolveUsername(discordId) {
    try {
      const UserStore = BdApi.Webpack.getStore("UserStore");
      const user = UserStore?.getUser?.(discordId);
      if (user) return user.globalName || user.username || discordId;
    } catch (_) {}
    return discordId;
  }

  function displayName(authorDiscordId, authorUsername) {
    if (authorUsername && authorUsername !== authorDiscordId) return authorUsername;
    return resolveUsername(authorDiscordId);
  }

  /* ── Stars Component ────────────────────────────────────── */
  function Stars({ value = 0, onChange, readonly = false, size }) {
    const [hover, setHover] = useState(0);
    const display = hover || value;
    const stars = [];
    const sizeStyle = size ? { fontSize: `${size}px` } : {};
    for (let i = 1; i <= 5; i++) {
      stars.push(
        React.createElement(
          "button",
          {
            key: i,
            className: `faglist-star${i <= display ? " filled" : ""}${readonly ? " readonly" : ""}`,
            style: sizeStyle,
            onClick: readonly ? undefined : () => onChange && onChange(i === value ? 0 : i),
            onMouseEnter: readonly ? undefined : () => setHover(i),
            onMouseLeave: readonly ? undefined : () => setHover(0),
            type: "button",
          },
          "\u2605"
        )
      );
    }
    return React.createElement("span", { className: "faglist-stars" }, ...stars);
  }

  /* ── Notes Tab ──────────────────────────────────────────── */
  function NotesTab({ targetId, targetName }) {
    const [notes, setNotes] = useState([]);
    const [myNote, setMyNote] = useState("");
    const [myNoteDate, setMyNoteDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const UserStore = BdApi.Webpack.getStore("UserStore");
    const currentUserId = UserStore?.getCurrentUser()?.id;

    const importDiscordNote = async () => {
      try {
        const storeNames = ["UserNoteStore", "NoteStore", "UserNotesStore"];
        let noteStore = null;
        for (const name of storeNames) {
          noteStore = BdApi.Webpack.getStore(name);
          if (noteStore) break;
        }
        if (!noteStore) {
          noteStore = BdApi.Webpack.getModule(m => m?.getNote && typeof m.getNote === "function");
        }
        if (!noteStore) {
          BdApi.UI.showToast("NoteStore nicht gefunden.", { type: "error" });
          return;
        }

        let note = noteStore.getNote(targetId);

        if (!note) {
          const NoteActions = BdApi.Webpack.getByKeys("updateNote") || BdApi.Webpack.getByKeys("fetchNote");
          if (NoteActions) {
            const fetchFn = NoteActions.fetchNote || NoteActions.getNote;
            if (typeof fetchFn === "function") {
              await fetchFn(targetId);
              note = noteStore.getNote(targetId);
            }
          }
        }

        if (note && typeof note === "object" && note.note) {
          note = note.note;
        }
        if (note && typeof note === "object") {
          note = note.body || note.content || note.text || JSON.stringify(note);
        }

        if (note && typeof note === "string" && note.trim()) {
          setMyNote((prev) => prev ? prev + "\n" + note : note);
          BdApi.UI.showToast("Discord-Notiz übernommen!", { type: "success" });
        } else {
          BdApi.UI.showToast("Keine Discord-Notiz für diesen Nutzer vorhanden.", { type: "warning" });
        }
      } catch (e) {
        BdApi.UI.showToast("Fehler beim Laden der Discord-Notiz.", { type: "error" });
      }
    };

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getNotes(targetId);
        setNotes(data.notes);
        const mine = data.notes.find((n) => n.author_discord_id === currentUserId);
        if (mine) {
          setMyNote(mine.content);
          setMyNoteDate(mine.updated_at);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, [targetId, currentUserId]);

    useEffect(() => { load(); }, [load]);

    const save = async () => {
      if (!myNote.trim()) return;
      try {
        setError(null);
        await api.saveNote(targetId, myNote.trim(), targetName);
        await load();
      } catch (e) {
        setError(e.message);
      }
    };

    const remove = async () => {
      try {
        setError(null);
        await api.deleteNote(targetId);
        setMyNote("");
        setMyNoteDate(null);
        await load();
      } catch (e) {
        setError(e.message);
      }
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

    if (loading) return React.createElement("div", { className: "faglist-loading" }, "Laden...");

    const otherNotes = notes.filter((n) => n.author_discord_id !== currentUserId);

    return React.createElement(
      "div",
      null,
      error && React.createElement("div", { className: "faglist-error" }, error),

      React.createElement("div", { className: "faglist-section-title" }, "Deine Notiz"),
      React.createElement("textarea", {
        className: "faglist-textarea",
        value: myNote,
        onChange: (e) => setMyNote(e.target.value),
        placeholder: "Notiz zu diesem Nutzer...",
        maxLength: 2000,
      }),
      React.createElement("div", { style: { fontSize: "11px", color: "var(--text-muted)", textAlign: "right", marginTop: "4px", marginBottom: "8px" } }, `${myNote.length} / 2000`),
      React.createElement(
        "div",
        { className: "faglist-btn-row" },
        React.createElement("button", { className: "faglist-btn faglist-btn-primary", onClick: save }, "Speichern"),
        React.createElement("button", { className: "faglist-btn faglist-btn-danger", onClick: remove }, "L\u00f6schen"),
        React.createElement("button", { className: "faglist-btn", onClick: importDiscordNote, style: { background: "var(--background-modifier-accent)", color: "var(--text-normal)" } }, "\uD83D\uDCCB Discord-Notiz \u00fcbernehmen")
      ),
      myNoteDate && React.createElement("div", { className: "faglist-note-date" }, `Zuletzt bearbeitet: ${fmtDate(myNoteDate)}`),

      React.createElement("div", { className: "faglist-section-title", style: { marginTop: "20px" } }, `Notizen anderer (${otherNotes.length})`),
      React.createElement(
        "div",
        { className: "faglist-scroll-list" },
        otherNotes.length === 0
          ? React.createElement("div", { className: "faglist-empty" }, "Keine Notizen von anderen Nutzern.")
          : otherNotes.map((n) =>
              React.createElement(
                "div",
                { key: n.id, className: "faglist-note-card" },
                React.createElement("div", { className: "faglist-note-author" }, displayName(n.author_discord_id, n.author_username)),
                React.createElement("div", { className: "faglist-note-content" }, n.content),
                n.updated_at && React.createElement("div", { className: "faglist-note-date" }, `Zuletzt bearbeitet: ${fmtDate(n.updated_at)}`)
              )
            )
      )
    );
  }

  /* ── Add Round Modal Content ─────────────────────────────── */
  function AddRoundForm({ targetId, targetName, onAdded }) {
    const [game, setGame] = useState("");
    const [info, setInfo] = useState("");
    const [rating, setRating] = useState(0);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const submit = useCallback(async () => {
      if (rating < 0 || rating > 5) {
        setError("Bitte Bewertung (0\u20135 Sterne) ausw\u00e4hlen.");
        return;
      }
      try {
        setSaving(true);
        setError(null);
        await api.addRound(targetId, { game, info, rating, target_username: targetName });
        if (onAdded) onAdded();
      } catch (e) {
        setError(e.message);
      } finally {
        setSaving(false);
      }
    }, [targetId, targetName, game, info, rating, onAdded]);

    useEffect(() => {
      AddRoundForm._submit = submit;
    }, [submit]);

    return React.createElement(
      "div",
      { className: "faglist-modal-root" },
      error && React.createElement("div", { className: "faglist-error" }, error),
      saving && React.createElement("div", { className: "faglist-loading" }, "Speichere..."),
      React.createElement("div", { className: "faglist-section-title" }, "Neue Runde eintragen"),
      React.createElement(
        "div",
        { className: "faglist-form-row", style: { flexDirection: "column", gap: "4px" } },
        React.createElement("input", {
          className: "faglist-input",
          value: game,
          onChange: (e) => setGame(e.target.value),
          placeholder: "Spiel",
          maxLength: 200,
        }),
        React.createElement("div", { style: { fontSize: "11px", color: "var(--text-muted)", textAlign: "right" } }, `${game.length} / 200`)
      ),
      React.createElement(
        "div",
        { className: "faglist-form-row", style: { flexDirection: "column", gap: "4px" } },
        React.createElement("input", {
          className: "faglist-input",
          value: info,
          onChange: (e) => setInfo(e.target.value),
          placeholder: "Info / Kommentar",
          maxLength: 500,
        }),
        React.createElement("div", { style: { fontSize: "11px", color: "var(--text-muted)", textAlign: "right" } }, `${info.length} / 500`)
      ),
      React.createElement(
        "div",
        { className: "faglist-form-row", style: { alignItems: "center" } },
        React.createElement("span", { style: { fontSize: "14px", marginRight: "8px", fontWeight: 600 } }, "Bewertung:"),
        React.createElement(Stars, { value: rating, onChange: setRating })
      )
    );
  }

  function openAddRoundDialog(targetId, targetName, onAdded) {
    BdApi.UI.showConfirmationModal(
      `Runde hinzuf\u00fcgen \u2014 ${targetName}`,
      React.createElement(AddRoundForm, { targetId, targetName, onAdded }),
      {
        confirmText: "Hinzuf\u00fcgen",
        cancelText: "Abbrechen",
        onConfirm: () => {
          if (AddRoundForm._submit) AddRoundForm._submit();
        },
      }
    );
  }

  /* ── Rounds Tab ─────────────────────────────────────────── */
  function RoundsTab({ targetId, targetName }) {
    const [rounds, setRounds] = useState([]);
    const [avgRating, setAvgRating] = useState(null);
    const [totalRounds, setTotalRounds] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [myDiscordId, setMyDiscordId] = useState(null);

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, me] = await Promise.all([
          api.getRounds(targetId),
          api.getMe().catch(() => ({ is_admin: false })),
        ]);
        setRounds(data.rounds);
        setAvgRating(data.avgRating);
        setTotalRounds(data.totalRounds);
        setIsAdmin(me.is_admin === true);
        setMyDiscordId(me.discord_user_id || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, [targetId]);

    useEffect(() => { load(); }, [load]);

    const removeRound = async (id) => {
      try {
        setError(null);
        await api.deleteRound(id);
        await load();
      } catch (e) {
        setError(e.message);
      }
    };

    if (loading) return React.createElement("div", { className: "faglist-loading" }, "Laden...");

    return React.createElement(
      "div",
      null,
      error && React.createElement("div", { className: "faglist-error" }, error),

      React.createElement(
        "div",
        { className: "faglist-avg" },
        React.createElement("span", { className: "faglist-avg-label" }, "Gesamt:"),
        avgRating != null
          ? React.createElement(Stars, { value: Math.round(avgRating), readonly: true, size: 24 })
          : null,
        React.createElement(
          "span",
          { className: "faglist-avg-value" },
          avgRating != null ? `${avgRating.toFixed(2)} / 5  (${totalRounds} Runden)` : "Keine Bewertungen"
        )
      ),

      React.createElement(
        "div",
        { className: "faglist-btn-row", style: { marginBottom: "12px" } },
        React.createElement(
          "button",
          {
            className: "faglist-btn faglist-btn-primary",
            onClick: () => openAddRoundDialog(targetId, targetName, load),
          },
          "+ Runde hinzuf\u00fcgen"
        )
      ),

      React.createElement("div", { className: "faglist-section-title" }, `Runden (${rounds.length})`),
      React.createElement(
        "div",
        { className: "faglist-scroll-list" },
        rounds.length === 0
          ? React.createElement("div", { className: "faglist-empty" }, "Noch keine Runden eingetragen.")
          : rounds.map((r) =>
              React.createElement(
                "div",
                { key: r.id, className: "faglist-round-card" },
              React.createElement(
                "div",
                { className: "faglist-round-header" },
                React.createElement("span", { className: "faglist-round-game" }, r.game || "Unbekannt"),
                React.createElement(
                  "span",
                  { style: { display: "flex", alignItems: "center", gap: "8px" } },
                  React.createElement(Stars, { value: r.rating, readonly: true }),
                  (r.author_discord_id === myDiscordId || isAdmin)
                    ? React.createElement(
                        "button",
                        { className: "faglist-delete-btn", onClick: () => removeRound(r.id), title: "L\u00f6schen" },
                        "\u2715"
                      )
                    : null
                )
              ),
              r.info && React.createElement("div", { className: "faglist-round-info" }, r.info),
              React.createElement(
                "div",
                { style: { display: "flex", justifyContent: "space-between", marginTop: "6px" } },
                React.createElement("span", { className: "faglist-round-date" }, `Gespielt: ${r.played_at ? new Date(r.played_at).toLocaleDateString("de-DE") : "?"}`),
                React.createElement("span", { className: "faglist-note-author" }, displayName(r.author_discord_id, r.author_username))
              )
            )
          )
      )
    );
  }

  /* ── Overview / Ranking Tab ─────────────────────────────── */
  function OverviewTab({ openUserModal }) {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getRanking();
        setRanking(data.ranking);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return React.createElement("div", { className: "faglist-loading" }, "Laden...");

    const rankClass = (i) => {
      if (i === 0) return "faglist-rank-num faglist-rank-gold";
      if (i === 1) return "faglist-rank-num faglist-rank-silver";
      if (i === 2) return "faglist-rank-num faglist-rank-bronze";
      return "faglist-rank-num";
    };

    return React.createElement(
      "div",
      null,
      error && React.createElement("div", { className: "faglist-error" }, error),

      React.createElement("div", { className: "faglist-section-title" }, `Ranking (${ranking.length} Nutzer)`),
      ranking.length === 0
        ? React.createElement("div", { className: "faglist-empty" }, "Noch keine bewerteten Nutzer.")
        : React.createElement(
            "table",
            { className: "faglist-ranking-table" },
            React.createElement(
              "thead",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement("th", null, "#"),
                React.createElement("th", null, "Nutzer"),
                React.createElement("th", null, "Bewertung"),
                React.createElement("th", null, "Runden"),
                React.createElement("th", null, "Notizen")
              )
            ),
            React.createElement(
              "tbody",
              null,
              ranking.map((r, i) => {
                const name = resolveUsername(r.discord_id) !== r.discord_id
                  ? resolveUsername(r.discord_id)
                  : r.username || r.discord_id;
                return React.createElement(
                  "tr",
                  { key: r.discord_id },
                  React.createElement("td", { className: rankClass(i) }, i + 1),
                  React.createElement(
                    "td",
                    null,
                    React.createElement(
                      "span",
                      {
                        className: "faglist-rank-name",
                        onClick: () => openUserModal(r.discord_id, name),
                      },
                      name
                    )
                  ),
                  React.createElement(
                    "td",
                    null,
                    React.createElement(
                      "span",
                      { style: { display: "flex", alignItems: "center", gap: "6px" } },
                      React.createElement(Stars, { value: Math.round(r.avg_rating), readonly: true, size: 16 }),
                      React.createElement("span", { style: { fontSize: "13px", color: "var(--text-muted)" } }, r.avg_rating?.toFixed(2))
                    )
                  ),
                  React.createElement("td", null, r.total_rounds),
                  React.createElement("td", null, r.total_notes)
                );
              })
            )
          )
    );
  }

  /* ── Modal Component (User) ──────────────────────────────── */
  function FagListModal({ targetId, targetName }) {
    const [tab, setTab] = useState("notes");

    return React.createElement(
      "div",
      { className: "faglist-modal-root" },
      React.createElement(
        "div",
        { className: "faglist-tabs" },
        React.createElement(
          "button",
          { className: `faglist-tab${tab === "notes" ? " active" : ""}`, onClick: () => setTab("notes") },
          "\uD83D\uDDD2\uFE0F Notizen"
        ),
        React.createElement(
          "button",
          { className: `faglist-tab${tab === "rounds" ? " active" : ""}`, onClick: () => setTab("rounds") },
          "\uD83C\uDFAE Runden"
        )
      ),
      tab === "notes"
        ? React.createElement(NotesTab, { targetId, targetName })
        : React.createElement(RoundsTab, { targetId, targetName })
    );
  }

  /* ── Modal Component (Ranking) ──────────────────────────── */
  function RankingModal({ openUserModal }) {
    return React.createElement(
      "div",
      { className: "faglist-modal-root" },
      React.createElement(OverviewTab, { openUserModal })
    );
  }

  /* ── All Notes Modal ─────────────────────────────────────── */
  function AllNotesTab({ openUserModal }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAllNotes();
        setNotes(data.notes);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return React.createElement("div", { className: "faglist-loading" }, "Laden...");

    const grouped = {};
    for (const n of notes) {
      const key = n.target_discord_id;
      if (!grouped[key]) grouped[key] = { name: n.target_username || resolveUsername(key), notes: [] };
      grouped[key].notes.push(n);
    }

    const sorted = Object.entries(grouped).sort((a, b) =>
      a[1].name.localeCompare(b[1].name, undefined, { sensitivity: "base" })
    );

    const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

    return React.createElement(
      "div",
      null,
      error && React.createElement("div", { className: "faglist-error" }, error),
      React.createElement("div", { className: "faglist-section-title" }, `Nutzer mit Notizen (${sorted.length})`),
      sorted.length === 0
        ? React.createElement("div", { className: "faglist-empty" }, "Keine Notizen vorhanden.")
        : React.createElement(
            "div",
            { className: "faglist-scroll-list" },
            sorted.map(([discordId, group]) =>
              React.createElement(
                "div",
                { key: discordId, className: "faglist-user-group" },
                React.createElement(
                  "div",
                  { className: "faglist-user-group-header", onClick: () => toggle(discordId) },
                  React.createElement("span", { className: `faglist-expand-icon${expanded[discordId] ? " open" : ""}` }, "\u25B6"),
                  React.createElement(
                    "span",
                    {
                      className: "faglist-group-name",
                      onClick: (e) => { e.stopPropagation(); openUserModal(discordId, group.name); },
                    },
                    resolveUsername(discordId) !== discordId ? resolveUsername(discordId) : group.name
                  ),
                  React.createElement("span", { className: "faglist-group-count" }, `${group.notes.length} Notiz${group.notes.length !== 1 ? "en" : ""}`)
                ),
                expanded[discordId]
                  ? React.createElement(
                      "div",
                      { className: "faglist-group-notes" },
                      group.notes.map((n) =>
                        React.createElement(
                          "div",
                          { key: n.id, className: "faglist-note-card" },
                          React.createElement("div", { className: "faglist-note-author" }, displayName(n.author_discord_id, n.author_username)),
                          React.createElement("div", { className: "faglist-note-content" }, n.content),
                          n.updated_at && React.createElement("div", { className: "faglist-note-date" }, `Zuletzt bearbeitet: ${fmtDate(n.updated_at)}`)
                        )
                      )
                    )
                  : null
              )
            )
          )
    );
  }

  function AllNotesModal({ openUserModal }) {
    return React.createElement(
      "div",
      { className: "faglist-modal-root" },
      React.createElement(AllNotesTab, { openUserModal })
    );
  }

  /* ── Channel Modal ──────────────────────────────────────── */
  function ChannelTab({ openUserModal, channelId: propChannelId }) {
    const [users, setUsers] = useState([]);
    const [channelName, setChannelName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noChannel, setNoChannel] = useState(false);

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        setNoChannel(false);

        const VoiceStateStore = BdApi.Webpack.getStore("VoiceStateStore");
        const ChannelStore = BdApi.Webpack.getStore("ChannelStore");

        let voiceChannelId = propChannelId;
        if (!voiceChannelId) {
          const SelectedChannelStore = BdApi.Webpack.getStore("SelectedChannelStore");
          voiceChannelId = SelectedChannelStore?.getVoiceChannelId?.();
        }
        if (!voiceChannelId) {
          setNoChannel(true);
          setLoading(false);
          return;
        }

        const channel = ChannelStore?.getChannel?.(voiceChannelId);
        setChannelName(channel?.name || "Voice Channel");

        const voiceStates = VoiceStateStore?.getVoiceStatesForChannel?.(voiceChannelId);
        if (!voiceStates || Object.keys(voiceStates).length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const ids = Object.values(voiceStates).map((s) => s.userId).filter(Boolean);
        if (ids.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const data = await api.batchUsers(ids);
        const serverMap = {};
        for (const u of data.users) serverMap[u.discord_id] = u;

        const result = ids.map((id) => {
          const srv = serverMap[id];
          return {
            discord_id: id,
            name: resolveUsername(id) !== id ? resolveUsername(id) : (srv?.username || id),
            avg_rating: srv?.avg_rating ?? null,
            total_rounds: srv?.total_rounds ?? 0,
            total_notes: srv?.total_notes ?? 0,
          };
        });

        result.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        setUsers(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, [propChannelId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return React.createElement("div", { className: "faglist-loading" }, "Laden...");
    if (noChannel) return React.createElement("div", { className: "faglist-empty" }, "Du bist in keinem Voice-Channel.");

    return React.createElement(
      "div",
      null,
      error && React.createElement("div", { className: "faglist-error" }, error),
      React.createElement(
        "div",
        { className: "faglist-channel-info" },
        React.createElement("span", null, "\uD83D\uDD0A"),
        React.createElement("span", { className: "faglist-channel-name" }, channelName),
        React.createElement("span", { className: "faglist-channel-count" }, `${users.length} Teilnehmer`)
      ),
      users.length === 0
        ? React.createElement("div", { className: "faglist-empty" }, "Keine Teilnehmer im Channel.")
        : React.createElement(
            "table",
            { className: "faglist-ranking-table" },
            React.createElement(
              "thead",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement("th", null, "Nutzer"),
                React.createElement("th", null, "Bewertung"),
                React.createElement("th", null, "Notizen")
              )
            ),
            React.createElement(
              "tbody",
              null,
              users.map((u) =>
                React.createElement(
                  "tr",
                  { key: u.discord_id },
                  React.createElement(
                    "td",
                    null,
                    React.createElement(
                      "span",
                      {
                        className: "faglist-rank-name",
                        onClick: () => openUserModal(u.discord_id, u.name),
                      },
                      u.name
                    )
                  ),
                  React.createElement(
                    "td",
                    null,
                    u.avg_rating != null
                      ? React.createElement(
                          "span",
                          { style: { display: "flex", alignItems: "center", gap: "6px" } },
                          React.createElement(Stars, { value: Math.round(u.avg_rating), readonly: true, size: 16 }),
                          React.createElement("span", { style: { fontSize: "13px", color: "var(--text-muted)" } }, u.avg_rating.toFixed(2))
                        )
                      : React.createElement("span", { style: { color: "var(--text-muted)", fontSize: "13px" } }, "\u2014")
                  ),
                  React.createElement("td", null, u.total_notes)
                )
              )
            )
          )
    );
  }

  function ChannelModal({ openUserModal, channelId }) {
    return React.createElement(
      "div",
      { className: "faglist-modal-root" },
      React.createElement(ChannelTab, { openUserModal, channelId })
    );
  }

  /* ── Main Plugin Class ──────────────────────────────────── */
  return class FagList {
    start() {
      BdApi.DOM.addStyle(config.info.name, css);

      this.contextMenuUnpatch = BdApi.ContextMenu.patch("user-context", (tree, props) => {
        const user = props.user;
        if (!user) return;

        tree.props.children.push(
          BdApi.ContextMenu.buildItem({ type: "separator" }),
          BdApi.ContextMenu.buildItem({
            label: "FagList anzeigen",
            id: "faglist-show",
            action: () => this.openModal(user.id, user.globalName || user.username || user.id),
          }),
          BdApi.ContextMenu.buildItem({
            label: "FagList Ranking",
            id: "faglist-ranking",
            action: () => this.openRankingModal(),
          }),
          BdApi.ContextMenu.buildItem({
            label: "FagList Alle Notizen",
            id: "faglist-allnotes",
            action: () => this.openAllNotesModal(),
          })
        );
      });

      this.channelMenuUnpatch = BdApi.ContextMenu.patch("channel-context", (tree, props) => {
        const channel = props.channel;
        if (!channel) return;
        const isVoice = channel.type === 2 || channel.type === 13;

        const items = [
          BdApi.ContextMenu.buildItem({ type: "separator" }),
          BdApi.ContextMenu.buildItem({
            label: "FagList Ranking",
            id: "faglist-ranking",
            action: () => this.openRankingModal(),
          }),
          BdApi.ContextMenu.buildItem({
            label: "FagList Alle Notizen",
            id: "faglist-allnotes",
            action: () => this.openAllNotesModal(),
          }),
        ];

        if (isVoice) {
          items.push(
            BdApi.ContextMenu.buildItem({
              label: "FagList Voice Channel",
              id: "faglist-channel",
              action: () => this.openChannelModal(channel.id),
            })
          );
        }

        tree.props.children.push(...items);
      });

      this.patchPopout();
    }

    stop() {
      BdApi.DOM.removeStyle(config.info.name);
      BdApi.Patcher.unpatchAll(config.info.name);
      if (this.contextMenuUnpatch) this.contextMenuUnpatch();
      if (this.channelMenuUnpatch) this.channelMenuUnpatch();
    }

    patchPopout() {
      const UserPopoutBody = BdApi.Webpack.getModule(
        (m) => m?.default?.toString?.()?.includes?.("showCopiableUsername") || m?.toString?.()?.includes?.("showCopiableUsername"),
        { searchExports: true }
      );

      if (!UserPopoutBody) {
        BdApi.Logger.warn(config.info.name, "UserPopoutBody module not found \u2014 popout badge disabled.");
        return;
      }

      BdApi.Patcher.after(config.info.name, UserPopoutBody, "default", (_, [props], ret) => {
        const user = props?.user;
        if (!user || !ret?.props?.children) return;

        const badge = React.createElement(PopoutBadge, {
          userId: user.id,
          userName: user.globalName || user.username || user.id,
          openModal: (id, name) => this.openModal(id, name),
        });

        if (Array.isArray(ret.props.children)) {
          ret.props.children.unshift(badge);
        }
      });
    }

    openModal(userId, userName) {
      BdApi.UI.showConfirmationModal(
        `FagList \u2014 ${userName}`,
        React.createElement(FagListModal, { targetId: userId, targetName: userName }),
        {
          confirmText: "Schlie\u00dfen",
          cancelText: null,
          onConfirm: () => {},
        }
      );
    }

    openRankingModal() {
      const openUserModal = (id, name) => {
        this.openModal(id, name);
      };
      BdApi.UI.showConfirmationModal(
        "FagList \u2014 Ranking",
        React.createElement(RankingModal, { openUserModal }),
        {
          confirmText: "Schlie\u00dfen",
          cancelText: null,
          onConfirm: () => {},
        }
      );
    }

    openAllNotesModal() {
      const openUserModal = (id, name) => {
        this.openModal(id, name);
      };
      BdApi.UI.showConfirmationModal(
        "FagList \u2014 Alle Notizen",
        React.createElement(AllNotesModal, { openUserModal }),
        {
          confirmText: "Schlie\u00dfen",
          cancelText: null,
          onConfirm: () => {},
        }
      );
    }

    openChannelModal(channelId) {
      const openUserModal = (id, name) => {
        this.openModal(id, name);
      };
      BdApi.UI.showConfirmationModal(
        "FagList \u2014 Voice Channel",
        React.createElement(ChannelModal, { openUserModal, channelId }),
        {
          confirmText: "Schlie\u00dfen",
          cancelText: null,
          onConfirm: () => {},
        }
      );
    }

    getSettingsPanel() {
      const panel = document.createElement("div");
      panel.className = "faglist-settings";

      const label = document.createElement("label");
      label.textContent = "API-Key";
      panel.appendChild(label);

      const input = document.createElement("input");
      input.className = "faglist-input";
      input.type = "password";
      input.value = getApiKey();
      input.placeholder = "API-Key vom Admin eingeben...";
      input.addEventListener("change", () => {
        BdApi.Data.save(config.info.name, "apiKey", input.value.trim());
        BdApi.UI.showToast("API-Key gespeichert!", { type: "success" });
      });
      panel.appendChild(input);

      const hint = document.createElement("div");
      hint.className = "faglist-hint";
      hint.textContent = "Den API-Key bekommst du vom Admin. Er authentifiziert dich beim FagList-Server.";
      panel.appendChild(hint);

      // ── Local Mode Toggle ──
      const sep = document.createElement("hr");
      sep.style.cssText = "border:none;border-top:1px solid var(--background-modifier-accent);margin:16px 0";
      panel.appendChild(sep);

      const localLabel = document.createElement("label");
      localLabel.style.cssText = "display:flex;align-items:center;gap:10px;cursor:pointer";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!BdApi.Data.load(config.info.name, "localMode");
      checkbox.style.cssText = "width:18px;height:18px;cursor:pointer";
      checkbox.addEventListener("change", () => {
        BdApi.Data.save(config.info.name, "localMode", checkbox.checked);
        serverInfo.textContent = `Server: ${getApiBase()}`;
        BdApi.UI.showToast(
          checkbox.checked ? "Local Mode aktiviert (localhost:3000)" : "Local Mode deaktiviert (Produktion)",
          { type: "info" }
        );
      });
      localLabel.appendChild(checkbox);

      const labelText = document.createElement("span");
      labelText.textContent = "Local Mode (Dev)";
      labelText.style.cssText = "font-weight:600;color:var(--header-primary)";
      localLabel.appendChild(labelText);
      panel.appendChild(localLabel);

      const localHint = document.createElement("div");
      localHint.className = "faglist-hint";
      localHint.textContent = "Verbindet mit localhost:3000 statt dem Produktionsserver. Nur f\u00fcr Entwicklung.";
      panel.appendChild(localHint);

      const serverInfo = document.createElement("div");
      serverInfo.className = "faglist-hint";
      serverInfo.style.marginTop = "6px";
      serverInfo.textContent = `Server: ${getApiBase()}`;
      panel.appendChild(serverInfo);

      // ── Admin sections (loaded async) ──
      const adminContainer = document.createElement("div");
      panel.appendChild(adminContainer);

      api.getMe().then((me) => {
        if (!me.is_admin) return;
        this._renderAdminKeysSection(adminContainer);
        this._renderAdminUsersSection(adminContainer);
      }).catch(() => {});

      return panel;
    }

    _renderAdminKeysSection(container) {
      const section = document.createElement("div");
      section.className = "faglist-admin-section";

      const title = document.createElement("h3");
      title.textContent = "\uD83D\uDD11 API Keys";
      section.appendChild(title);

      const tableWrap = document.createElement("div");
      section.appendChild(tableWrap);

      const form = document.createElement("div");
      form.className = "faglist-admin-form";

      const idInput = document.createElement("input");
      idInput.className = "faglist-input";
      idInput.placeholder = "Discord User ID";
      form.appendChild(idInput);

      const nameInput = document.createElement("input");
      nameInput.className = "faglist-input";
      nameInput.placeholder = "Username";
      form.appendChild(nameInput);

      const addBtn = document.createElement("button");
      addBtn.className = "faglist-btn faglist-btn-primary";
      addBtn.textContent = "Key erstellen";
      addBtn.addEventListener("click", async () => {
        const discordId = idInput.value.trim();
        const username = nameInput.value.trim();
        if (!discordId || !username) return;
        try {
          const res = await api.createKey(discordId, username);
          if (res.existing) {
            BdApi.UI.showToast("Key existiert bereits", { type: "info" });
          } else {
            BdApi.UI.showToast("Key erstellt!", { type: "success" });
          }
          idInput.value = "";
          nameInput.value = "";
          loadKeys();
        } catch (e) {
          BdApi.UI.showToast(e.message, { type: "error" });
        }
      });
      form.appendChild(addBtn);
      section.appendChild(form);

      container.appendChild(section);

      const loadKeys = async () => {
        try {
          const data = await api.getKeys();
          tableWrap.innerHTML = "";
          if (data.keys.length === 0) {
            tableWrap.textContent = "Keine Keys vorhanden.";
            return;
          }
          const table = document.createElement("table");
          table.className = "faglist-admin-table";

          const thead = document.createElement("thead");
          thead.innerHTML = "<tr><th>User</th><th>Discord ID</th><th>Key</th><th>Admin</th><th></th></tr>";
          table.appendChild(thead);


          const tbody = document.createElement("tbody");
          for (const k of data.keys) {
            const tr = document.createElement("tr");

            const tdUser = document.createElement("td");
            if (!k.is_admin) {
              const nameField = document.createElement("input");
              nameField.className = "faglist-input";
              nameField.value = k.username;
              nameField.style.cssText = "padding:4px 8px;font-size:13px;width:auto";
              tdUser.appendChild(nameField);

              const saveBtn = document.createElement("button");
              saveBtn.className = "faglist-btn faglist-btn-primary";
              saveBtn.textContent = "Speichern";
              saveBtn.style.cssText = "padding:2px 8px;font-size:11px;margin-left:6px";
              saveBtn.addEventListener("click", async () => {
                const newName = nameField.value.trim();
                const newId = idField ? idField.value.trim() : "";
                if (!newName) return;
                try {
                  await api.renameKey(k.key, newName, newId || undefined);
                  BdApi.UI.showToast("Key aktualisiert!", { type: "success" });
                  loadKeys();
                } catch (e) {
                  BdApi.UI.showToast(e.message, { type: "error" });
                }
              });
              tdUser.appendChild(saveBtn);
            } else {
              tdUser.textContent = k.username;
            }
            tr.appendChild(tdUser);

            const tdId = document.createElement("td");
            let idField = null;
            if (!k.is_admin) {
              idField = document.createElement("input");
              idField.className = "faglist-input";
              idField.value = k.discord_user_id;
              idField.style.cssText = "padding:4px 8px;font-size:13px;width:auto;font-family:monospace";
              tdId.appendChild(idField);
            } else {
              tdId.textContent = k.discord_user_id;
            }
            tr.appendChild(tdId);

            const tdKey = document.createElement("td");
            tdKey.className = "faglist-key-text";
            tdKey.textContent = k.key;
            tr.appendChild(tdKey);

            const tdAdmin = document.createElement("td");
            tdAdmin.textContent = k.is_admin ? "\u2705" : "";
            tr.appendChild(tdAdmin);

            const tdAction = document.createElement("td");
            if (!k.is_admin) {
              const delBtn = document.createElement("button");
              delBtn.className = "faglist-delete-btn";
              delBtn.textContent = "\u2715";
              delBtn.title = "Key l\u00f6schen";
              delBtn.addEventListener("click", async () => {
                try {
                  await api.deleteKey(k.key);
                  BdApi.UI.showToast("Key gel\u00f6scht", { type: "success" });
                  loadKeys();
                } catch (e) {
                  BdApi.UI.showToast(e.message, { type: "error" });
                }
              });
              tdAction.appendChild(delBtn);
            }
            tr.appendChild(tdAction);

            tbody.appendChild(tr);
          }
          table.appendChild(tbody);
          tableWrap.appendChild(table);
        } catch (e) {
          tableWrap.textContent = `Fehler: ${e.message}`;
        }
      };
      loadKeys();
    }

    _renderAdminUsersSection(container) {
      const section = document.createElement("div");
      section.className = "faglist-admin-section";

      const title = document.createElement("h3");
      title.textContent = "\uD83D\uDC64 Nutzer";
      section.appendChild(title);

      const tableWrap = document.createElement("div");
      section.appendChild(tableWrap);

      const form = document.createElement("div");
      form.className = "faglist-admin-form";

      const idInput = document.createElement("input");
      idInput.className = "faglist-input";
      idInput.placeholder = "Discord User ID";
      form.appendChild(idInput);

      const nameInput = document.createElement("input");
      nameInput.className = "faglist-input";
      nameInput.placeholder = "Username";
      form.appendChild(nameInput);

      const addBtn = document.createElement("button");
      addBtn.className = "faglist-btn faglist-btn-primary";
      addBtn.textContent = "Hinzuf\u00fcgen";
      addBtn.addEventListener("click", async () => {
        const discordId = idInput.value.trim();
        const username = nameInput.value.trim();
        if (!discordId || !username) return;
        try {
          await api.addUser(discordId, username);
          BdApi.UI.showToast("Nutzer hinzugef\u00fcgt!", { type: "success" });
          idInput.value = "";
          nameInput.value = "";
          loadUsers();
        } catch (e) {
          BdApi.UI.showToast(e.message, { type: "error" });
        }
      });
      form.appendChild(addBtn);
      section.appendChild(form);

      container.appendChild(section);

      const loadUsers = async () => {
        try {
          const data = await api.getUsers();
          tableWrap.innerHTML = "";
          if (data.users.length === 0) {
            tableWrap.textContent = "Keine Nutzer vorhanden.";
            return;
          }
          const table = document.createElement("table");
          table.className = "faglist-admin-table";

          const thead = document.createElement("thead");
          thead.innerHTML = "<tr><th>Discord ID</th><th>Username</th><th></th></tr>";
          table.appendChild(thead);

          const tbody = document.createElement("tbody");
          for (const u of data.users) {
            const tr = document.createElement("tr");

            const tdId = document.createElement("td");
            const idField = document.createElement("input");
            idField.className = "faglist-input";
            idField.value = u.discord_id;
            idField.style.cssText = "padding:4px 8px;font-size:13px;width:auto;font-family:monospace";
            tdId.appendChild(idField);
            tr.appendChild(tdId);

            const tdName = document.createElement("td");
            const nameField = document.createElement("input");
            nameField.className = "faglist-input";
            nameField.value = u.username;
            tdName.appendChild(nameField);
            tr.appendChild(tdName);

            const tdAction = document.createElement("td");
            const saveBtn = document.createElement("button");
            saveBtn.className = "faglist-btn faglist-btn-primary";
            saveBtn.textContent = "Speichern";
            saveBtn.style.cssText = "padding:4px 10px;font-size:12px";
            saveBtn.addEventListener("click", async () => {
              const newName = nameField.value.trim();
              const newId = idField.value.trim();
              if (!newName || !newId) return;
              try {
                await api.updateUser(u.discord_id, newName, newId);
                BdApi.UI.showToast("Nutzer aktualisiert!", { type: "success" });
                loadUsers();
              } catch (e) {
                BdApi.UI.showToast(e.message, { type: "error" });
              }
            });
            tdAction.appendChild(saveBtn);
            tr.appendChild(tdAction);

            tbody.appendChild(tr);
          }
          table.appendChild(tbody);
          tableWrap.appendChild(table);
        } catch (e) {
          tableWrap.textContent = `Fehler: ${e.message}`;
        }
      };
      loadUsers();
    }
  };

  /* ── Popout Badge Component ─────────────────────────────── */
  function PopoutBadge({ userId, userName, openModal }) {
    const [avg, setAvg] = useState(null);

    useEffect(() => {
      api.getRounds(userId).then((data) => {
        if (data.avgRating != null) setAvg(data.avgRating);
      }).catch(() => {});
    }, [userId]);

    return React.createElement(
      "div",
      {
        className: "faglist-popout-badge",
        onClick: () => openModal(userId, userName),
      },
      React.createElement("span", { className: "faglist-popout-label" }, "FagList"),
      avg != null
        ? React.createElement(Stars, { value: Math.round(avg), readonly: true })
        : React.createElement("span", { style: { fontSize: "12px", color: "var(--text-muted)" } }, "\u2014"),
      avg != null
        ? React.createElement("span", { style: { fontSize: "12px", color: "var(--text-muted)" } }, `${avg.toFixed(1)}`)
        : null
    );
  }
})();
