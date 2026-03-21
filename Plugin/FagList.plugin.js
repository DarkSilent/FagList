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
      padding: 20px 24px;
      min-width: 680px;
      max-width: 800px;
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
  `;

  /* ── API Client ─────────────────────────────────────────── */
  function getApiKey() {
    return BdApi.Data.load(config.info.name, "apiKey") || "";
  }

  function apiHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
    };
  }

  async function apiFetch(path, options = {}) {
    const res = await BdApi.Net.fetch(`${getApiBase()}${path}`, {
      ...options,
      headers: { ...apiHeaders(), ...(options.headers || {}) },
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
    renameUser: (discordId, username) =>
      apiFetch(`/api/users/${discordId}`, {
        method: "PATCH",
        body: JSON.stringify({ username }),
      }),

    getKeys: () => apiFetch("/api/keys"),
    createKey: (discord_user_id, username) =>
      apiFetch("/api/keys", {
        method: "POST",
        body: JSON.stringify({ discord_user_id, username }),
      }),
    deleteKey: (key) =>
      apiFetch(`/api/keys/${key}`, { method: "DELETE" }),
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
      React.createElement(
        "div",
        { className: "faglist-btn-row" },
        React.createElement("button", { className: "faglist-btn faglist-btn-primary", onClick: save }, "Speichern"),
        React.createElement("button", { className: "faglist-btn faglist-btn-danger", onClick: remove }, "L\u00f6schen")
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
      { className: "faglist-modal-root", style: { minWidth: "440px" } },
      error && React.createElement("div", { className: "faglist-error" }, error),
      saving && React.createElement("div", { className: "faglist-loading" }, "Speichere..."),
      React.createElement("div", { className: "faglist-section-title" }, "Neue Runde eintragen"),
      React.createElement(
        "div",
        { className: "faglist-form-row" },
        React.createElement("input", {
          className: "faglist-input",
          value: game,
          onChange: (e) => setGame(e.target.value),
          placeholder: "Spiel",
          maxLength: 200,
        })
      ),
      React.createElement(
        "div",
        { className: "faglist-form-row" },
        React.createElement("input", {
          className: "faglist-input",
          value: info,
          onChange: (e) => setInfo(e.target.value),
          placeholder: "Info / Kommentar",
          maxLength: 500,
        })
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

    const UserStore = BdApi.Webpack.getStore("UserStore");
    const currentUserId = UserStore?.getCurrentUser()?.id;

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
                  (r.author_discord_id === currentUserId || isAdmin)
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
          })
        );
      });

      this.patchPopout();
    }

    stop() {
      BdApi.DOM.removeStyle(config.info.name);
      BdApi.Patcher.unpatchAll(config.info.name);
      if (this.contextMenuUnpatch) this.contextMenuUnpatch();
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
            tdUser.textContent = k.username;
            tr.appendChild(tdUser);

            const tdId = document.createElement("td");
            tdId.textContent = k.discord_user_id;
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
            tdId.textContent = u.discord_id;
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
            saveBtn.textContent = "Umbenennen";
            saveBtn.style.cssText = "padding:4px 10px;font-size:12px";
            saveBtn.addEventListener("click", async () => {
              const newName = nameField.value.trim();
              if (!newName) return;
              try {
                await api.renameUser(u.discord_id, newName);
                BdApi.UI.showToast("Nutzer umbenannt!", { type: "success" });
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
