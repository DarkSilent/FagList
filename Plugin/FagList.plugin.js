/**
 * @name FagList
 * @author DarkSilent
 * @version 1.4.0
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
    /* ── Theme custom properties (mirrors PermissionsViewer --pv-* pattern) ── */
    .faglist-overlay {
      --fl-bg-backdrop: rgba(0, 0, 0, 0.85);
      --fl-bg-modal: #313338;
      --fl-bg-panel: #2b2d31;
      --fl-bg-input: #1e1f22;
      --fl-bg-input-focus: #1a1b1e;
      --fl-bg-hover: #35373c;
      --fl-bg-active: #404249;
      --fl-border: #1e1f22;
      --fl-text-primary: #f2f3f5;
      --fl-text-body: #dbdee1;
      --fl-text-muted: #949ba4;
      --fl-status-gold: #faa61a;
    }
    .faglist-overlay * { box-sizing: border-box; }

    .faglist-panel-icon-btn { background: transparent; border: none; color: var(--interactive-normal); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; padding: 0; }
    .faglist-panel-icon-btn:hover { color: var(--interactive-hover); }

    .faglist-modal-root {
      color: var(--fl-text-body, var(--text-normal));
      padding: 16px 20px;
      width: 100%;
      box-sizing: border-box;
      max-height: 85vh;
    }
    .faglist-scroll-list {
      max-height: 65vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--fl-border) transparent;
    }

    /* ── Tabs ── */
    .faglist-tabs {
      display: flex;
      gap: 2px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--fl-border, var(--background-modifier-accent));
      padding-bottom: 0;
    }
    .faglist-tab {
      padding: 8px 16px;
      border-radius: 4px 4px 0 0;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      background: transparent;
      color: var(--fl-text-muted, var(--text-muted));
      border: none;
      transition: background 0.15s, color 0.15s;
    }
    .faglist-tab:hover {
      background: var(--fl-bg-hover, var(--background-modifier-hover));
      color: var(--fl-text-primary, var(--text-normal));
    }
    .faglist-tab.active {
      background: var(--fl-bg-active, var(--background-modifier-selected));
      color: var(--fl-text-primary, var(--text-normal));
      box-shadow: inset 0 -2px 0 var(--brand-500, #5865f2);
    }

    /* ── Section title with gradient line ── */
    .faglist-section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--fl-text-muted, var(--header-secondary));
      margin: 16px 0 12px;
    }
    .faglist-section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, #3f4147, transparent);
    }

    /* ── Average rating ── */
    .faglist-avg {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding: 12px 14px;
      border-radius: 4px;
      background: var(--fl-bg-panel, var(--background-secondary));
    }
    .faglist-avg-label {
      font-weight: 700;
      font-size: 16px;
      color: var(--fl-text-primary);
    }
    .faglist-avg-value {
      font-size: 14px;
      color: var(--fl-text-muted, var(--text-muted));
    }

    /* ── Stars ── */
    .faglist-stars {
      display: inline-flex;
      gap: 2px;
    }
    .faglist-star {
      cursor: pointer;
      font-size: 22px;
      color: var(--fl-text-muted, var(--text-muted));
      transition: color 0.1s;
      background: none;
      border: none;
      padding: 0;
      line-height: 1;
    }
    .faglist-star.filled {
      color: var(--fl-status-gold, #faa61a);
    }
    .faglist-star.readonly {
      cursor: default;
    }

    /* ── Cards ── */
    .faglist-note-card, .faglist-round-card {
      background: var(--fl-bg-panel, var(--background-secondary));
      border-radius: 4px;
      padding: 12px 14px;
      margin-bottom: 2px;
      transition: background 0.1s;
    }
    .faglist-note-card:hover, .faglist-round-card:hover {
      background: var(--fl-bg-hover, var(--background-modifier-hover));
    }
    .faglist-note-author, .faglist-round-author {
      font-size: 12px;
      font-weight: 600;
      color: var(--fl-text-muted, var(--text-muted));
      margin-bottom: 6px;
    }
    .faglist-note-content {
      font-size: 14px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.4;
      color: var(--fl-text-primary, var(--text-normal));
    }
    .faglist-round-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .faglist-round-game {
      font-weight: 500;
      font-size: 14px;
      color: var(--fl-text-primary);
    }
    .faglist-round-info {
      font-size: 12px;
      color: var(--fl-text-muted, var(--text-muted));
      margin-top: 4px;
      line-height: 1.4;
    }
    .faglist-round-date {
      font-size: 12px;
      color: var(--fl-text-muted, var(--text-muted));
    }

    /* ── Form elements ── */
    .faglist-textarea {
      width: 100%;
      box-sizing: border-box;
      min-height: 80px;
      background: var(--fl-bg-input, var(--background-tertiary));
      border: none;
      border-radius: 4px;
      color: var(--fl-text-body, var(--text-normal));
      padding: 9px 12px;
      font-size: 14px;
      resize: vertical;
      font-family: inherit;
      line-height: 1.4;
      outline: none;
    }
    .faglist-textarea:focus {
      background: var(--fl-bg-input-focus, var(--background-secondary));
    }
    .faglist-textarea::placeholder { color: var(--fl-text-muted, var(--text-muted)); }
    .faglist-input {
      width: 100%;
      box-sizing: border-box;
      background: var(--fl-bg-input, var(--background-tertiary));
      border: none;
      border-radius: 4px;
      color: var(--fl-text-body, var(--text-normal));
      padding: 9px 12px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
    }
    .faglist-input:focus {
      background: var(--fl-bg-input-focus, var(--background-secondary));
    }
    .faglist-input::placeholder { color: var(--fl-text-muted, var(--text-muted)); }

    /* ── Buttons ── */
    .faglist-btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.15s, opacity 0.15s;
    }
    .faglist-btn-primary {
      background: var(--brand-500, #5865f2);
      color: #fff;
    }
    .faglist-btn-primary:hover {
      background: var(--brand-560, #4752c4);
    }
    .faglist-btn-danger {
      background: var(--button-danger-background, #da373c);
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

    /* ── State messages ── */
    .faglist-empty {
      color: var(--fl-text-muted, var(--text-muted));
      font-size: 13px;
      padding: 12px 0;
    }
    .faglist-error {
      color: var(--text-danger, #f23f43);
      font-size: 13px;
      padding: 6px 0;
    }
    .faglist-loading {
      color: var(--fl-text-muted, var(--text-muted));
      font-size: 13px;
      padding: 12px 0;
    }

    /* ── Settings panel ── */
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

    /* ── Popout badge ── */
    .faglist-popout-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin: 4px 12px;
      background: var(--fl-bg-panel, var(--background-secondary));
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .faglist-popout-badge:hover {
      background: var(--fl-bg-hover, var(--background-modifier-hover));
    }
    .faglist-popout-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--fl-text-muted, var(--header-secondary));
    }

    /* ── Delete ── */
    .faglist-delete-btn {
      background: none;
      border: none;
      color: var(--fl-text-muted, var(--text-muted));
      cursor: pointer;
      font-size: 16px;
      padding: 2px 6px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .faglist-delete-btn:hover {
      color: var(--text-danger, #f23f43);
      background: var(--fl-bg-hover, var(--background-modifier-hover));
    }

    /* ── Ranking table ── */
    .faglist-ranking-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 2px;
    }
    .faglist-ranking-table th {
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--fl-text-muted, var(--header-secondary));
      padding: 8px 12px;
    }
    .faglist-ranking-table td {
      background: var(--fl-bg-panel, var(--background-secondary));
      padding: 10px 12px;
      font-size: 14px;
      color: var(--fl-text-body);
    }
    .faglist-ranking-table tbody tr:hover td {
      background: var(--fl-bg-hover);
    }
    .faglist-ranking-table tr td:first-child {
      border-radius: 4px 0 0 4px;
    }
    .faglist-ranking-table tr td:last-child {
      border-radius: 0 4px 4px 0;
    }
    .faglist-rank-num {
      font-weight: 700;
      font-size: 16px;
      color: var(--fl-text-muted, var(--text-muted));
      min-width: 32px;
      text-align: center;
    }
    .faglist-rank-gold { color: var(--fl-status-gold, #faa61a); }
    .faglist-rank-silver { color: #b0b0b0; }
    .faglist-rank-bronze { color: #cd7f32; }
    .faglist-rank-name {
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      color: var(--fl-text-primary);
    }
    .faglist-rank-name:hover {
      text-decoration: underline;
      color: var(--brand-500, #5865f2);
    }
    .faglist-note-date {
      font-size: 11px;
      color: var(--fl-text-muted, var(--text-muted));
      margin-top: 4px;
    }

    /* ── Admin settings ── */
    .faglist-admin-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--fl-border, var(--background-modifier-accent));
    }
    .faglist-admin-section h3 {
      font-size: 12px;
      font-weight: 700;
      color: var(--fl-text-primary, var(--header-primary));
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .faglist-admin-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 2px;
      margin-bottom: 12px;
    }
    .faglist-admin-table th {
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--fl-text-muted, var(--header-secondary));
      padding: 4px 8px;
    }
    .faglist-admin-table td {
      background: var(--fl-bg-panel, var(--background-secondary));
      padding: 8px;
      font-size: 13px;
      color: var(--fl-text-body, var(--text-normal));
    }
    .faglist-admin-table tbody tr:hover td {
      background: var(--fl-bg-hover);
    }
    .faglist-admin-table tr td:first-child {
      border-radius: 4px 0 0 4px;
    }
    .faglist-admin-table tr td:last-child {
      border-radius: 0 4px 4px 0;
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

    /* ── All Notes / Channel views ── */
    .faglist-notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 12px;
      align-items: start;
    }
    .faglist-notes-grid-card {
      background: var(--fl-bg-panel, var(--background-secondary));
      border-radius: 4px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .faglist-notes-grid-header {
      font-weight: 600;
      font-size: 14px;
      color: var(--fl-text-primary, var(--header-primary));
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--fl-border, var(--background-modifier-accent));
      padding-bottom: 8px;
      cursor: pointer;
    }
    .faglist-notes-grid-header:hover {
      color: var(--brand-500, #5865f2);
    }
    .faglist-user-group {
      margin-bottom: 2px;
    }
    .faglist-user-group-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: var(--fl-bg-panel, var(--background-secondary));
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.1s;
      user-select: none;
    }
    .faglist-user-group-header:hover {
      background: var(--fl-bg-hover, var(--background-modifier-hover));
    }
    .faglist-expand-icon {
      font-size: 10px;
      color: var(--fl-text-muted, var(--text-muted));
      transition: transform 0.2s;
      display: inline-block;
    }
    .faglist-expand-icon.open {
      transform: rotate(90deg);
    }
    .faglist-group-name {
      font-weight: 500;
      font-size: 14px;
      flex: 1;
      color: var(--fl-text-body);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .faglist-group-name:hover {
      color: var(--fl-text-primary);
    }
    .faglist-group-count {
      font-size: 12px;
      color: var(--fl-text-muted, var(--text-muted));
      background: color-mix(in srgb, var(--fl-text-muted) 12%, transparent);
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: 500;
    }
    .faglist-group-notes {
      padding: 4px 0 4px 20px;
    }
    .faglist-channel-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: var(--fl-bg-panel, var(--background-secondary));
      border-radius: 4px;
      margin-bottom: 14px;
    }
    .faglist-channel-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--fl-text-primary);
    }
    .faglist-channel-count {
      font-size: 13px;
      color: var(--fl-text-muted, var(--text-muted));
    }

    /* ── Fullscreen Panel (Settings-like) ── */
    .faglist-backdrop-overlay {
      position: fixed;
      inset: 0;
      background: var(--fl-bg-backdrop, rgba(0, 0, 0, 0.85));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 1000;
      animation: faglist-fade-in 0.2s ease;
    }
    .faglist-overlay {
      display: flex;
      flex-direction: column;
      width: min(1350px, 100%);
      height: 60vh;
      background: var(--fl-bg-modal, #313338);
      color: var(--fl-text-body, #dbdee1);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
      animation: faglist-scale-in 0.2s ease;
    }
    @keyframes faglist-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes faglist-scale-in {
      from { transform: scale(0.95); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }

    /* ── Header bar (PV-style) ── */
    .faglist-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--fl-bg-panel, #2b2d31);
      border-bottom: 1px solid var(--fl-border, #1e1f22);
      flex-shrink: 0;
    }
    .faglist-header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .faglist-header-title h2 {
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
      color: var(--fl-text-primary, #f2f3f5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }
    .faglist-header-title p {
      margin: 2px 0 0 0;
      font-size: 13px;
      color: var(--fl-text-muted, #949ba4);
    }
    .faglist-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--fl-text-muted, #949ba4);
      cursor: pointer;
      flex-shrink: 0;
      transition: color 0.1s, background 0.1s;
    }
    .faglist-close-btn:hover {
      color: var(--fl-text-body, #dbdee1);
      background: var(--fl-bg-hover, #3f4147);
    }
    .faglist-close-btn svg {
      display: block;
    }

    /* ── Body row (sidebar + content) ── */
    .faglist-body-row {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ── Sidebar ── */
    .faglist-sidebar {
      display: flex;
      flex-direction: column;
      width: 240px;
      min-width: 240px;
      background: var(--fl-bg-panel, #2b2d31);
      border-right: 1px solid var(--fl-border, #1e1f22);
      overflow-y: auto;
      padding: 8px;
      scrollbar-width: thin;
      scrollbar-color: var(--fl-border) transparent;
    }
    .faglist-sidebar-title {
      color: var(--fl-text-muted);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 8px 4px;
      margin-top: 16px;
    }
    .faglist-sidebar-title:first-child {
      margin-top: 0;
    }
    .faglist-sidebar-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      margin-bottom: 2px;
      padding: 8px 10px;
      border: none;
      border-radius: 4px;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: var(--fl-text-body, #dbdee1);
      background: transparent;
      transition: color 0.1s, background 0.1s;
    }
    .faglist-sidebar-item:hover {
      color: var(--fl-text-primary, #f2f3f5);
      background: var(--fl-bg-hover, #35373c);
    }
    .faglist-sidebar-item.active {
      color: var(--fl-text-primary, #f2f3f5);
      background: var(--fl-bg-active, #404249);
    }
    .faglist-sidebar-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    .faglist-sidebar-sep {
      height: 1px;
      background: var(--fl-border, #1e1f22);
      margin: 8px 8px;
    }

    /* ── Content area ── */
    .faglist-content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .faglist-content-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: var(--fl-bg-panel);
      border-bottom: 1px solid var(--fl-border);
      gap: 16px;
      flex-shrink: 0;
    }
    .faglist-content-header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--fl-text-primary, #f2f3f5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .faglist-content-header-search {
      flex-shrink: 0;
      position: relative;
    }
    .faglist-content-header-search input {
      width: 220px;
      box-sizing: border-box;
      padding: 9px 32px 9px 36px;
      border-radius: 4px;
      border: none;
      background: var(--fl-bg-input, #1e1f22);
      color: var(--fl-text-body, #dbdee1);
      font-size: 14px;
      font-weight: 400;
      outline: none;
    }
    .faglist-content-header-search input::placeholder {
      color: var(--fl-text-muted, #949ba4);
    }
    .faglist-content-header-search input:focus {
      background: var(--fl-bg-input-focus, #1a1b1e);
    }
    .faglist-content-header-search .faglist-search-clear {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
    }
    .faglist-content-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      scrollbar-width: thin;
      scrollbar-color: var(--fl-border) transparent;
    }
    .faglist-content-body .faglist-scroll-list,
    .faglist-content-body .faglist-modal-root {
      max-height: none;
      overflow-y: visible;
    }

    /* ── Back button ── */
    .faglist-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      margin-bottom: 12px;
      border-radius: 4px;
      border: none;
      background: var(--fl-bg-panel, var(--background-secondary));
      color: var(--fl-text-muted);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.1s, color 0.1s;
    }
    .faglist-back-btn:hover {
      background: var(--fl-bg-hover);
      color: var(--fl-text-primary);
    }

    /* ── Sidebar search ── */
    .faglist-search-wrap {
      position: relative;
      padding: 0 0 8px;
    }
    .faglist-search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 9px 32px 9px 12px;
      border-radius: 4px;
      border: none;
      background: var(--fl-bg-input, #1e1f22);
      color: var(--fl-text-body, #dbdee1);
      font-size: 14px;
      font-weight: 400;
      outline: none;
    }
    .faglist-search-input::placeholder {
      color: var(--fl-text-muted, #949ba4);
    }
    .faglist-search-input:focus {
      background: var(--fl-bg-input-focus, #1a1b1e);
    }
    .faglist-search-clear {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      border-radius: 4px;
      border: none;
      background: transparent;
      color: var(--fl-text-muted, #949ba4);
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .faglist-search-clear:hover {
      color: var(--fl-text-body);
      background: var(--fl-bg-hover);
    }

    /* ── Search results ── */
    .faglist-search-results {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .faglist-search-result-card {
      background: var(--fl-bg-panel, var(--background-secondary));
      border-radius: 4px;
      padding: 12px 14px;
      cursor: pointer;
      transition: background 0.1s;
    }
    .faglist-search-result-card:hover {
      background: var(--fl-bg-hover, var(--background-modifier-hover));
    }
    .faglist-search-result-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--fl-text-primary, var(--header-primary));
      margin-bottom: 4px;
    }
    .faglist-search-history {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 6px;
    }
    .faglist-search-history-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 3px;
      background: color-mix(in srgb, var(--fl-text-muted) 12%, transparent);
      color: var(--fl-text-muted, var(--text-muted));
      font-size: 12px;
    }
    .faglist-search-highlight {
      color: var(--brand-500, #5865f2);
      font-weight: 600;
    }
    .faglist-search-empty {
      text-align: center;
      color: var(--fl-text-muted, var(--text-muted));
      padding: 40px 0;
    }

    /* ── Update related ── */
    .faglist-update-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 4px 10px;
      margin: 0;
      background: var(--info-warning-background, #faa61a22);
      border-bottom: 1px solid var(--info-warning-foreground, #faa61a44);
      color: var(--fl-text-body, var(--text-normal));
      font-size: 12px;
    }
    .faglist-update-banner-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--fl-text-muted);
    }
    .faglist-update-banner .faglist-update-btn {
      padding: 2px 10px;
      font-size: 11px;
      border-radius: 4px;
    }
    .faglist-sidebar-bottom {
      margin-top: auto;
      padding-top: 8px;
    }
    .faglist-sidebar-update-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: var(--fl-text-body, #dbdee1);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      transition: background 0.1s, color 0.1s;
    }
    .faglist-sidebar-update-btn:hover {
      background: var(--fl-bg-hover);
      color: var(--fl-text-primary);
    }
    .faglist-sidebar-update-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .faglist-sidebar-update-btn.has-update {
      color: var(--fl-status-gold, #faa61a);
    }
    .faglist-update-btn {
      padding: 6px 14px;
      border-radius: 4px;
      border: none;
      background: var(--brand-500, #5865f2);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .faglist-update-btn:hover {
      background: var(--brand-560, #4752c4);
    }
    .faglist-update-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .faglist-update-check-btn {
      padding: 6px 14px;
      border-radius: 4px;
      border: none;
      background: var(--fl-bg-panel, var(--background-secondary));
      color: var(--fl-text-body, var(--text-normal));
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .faglist-update-check-btn:hover {
      background: var(--fl-bg-hover, var(--background-modifier-hover));
    }
    .faglist-update-check-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .faglist-update-status {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 4px;
      background: var(--fl-bg-panel, var(--background-secondary));
      font-size: 13px;
      color: var(--fl-text-body, var(--text-normal));
      margin-top: 8px;
    }
    .faglist-update-status.available {
      background: color-mix(in srgb, var(--fl-status-gold) 12%, transparent);
      border: 1px solid var(--fl-status-gold, #faa61a);
    }
    .faglist-update-status.uptodate {
      background: color-mix(in srgb, #23a55a 12%, transparent);
      border: 1px solid #23a55a;
    }

    /* ── User summary header ── */
    .faglist-user-summary {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 14px;
      margin-bottom: 16px;
      border-radius: 4px;
      background: var(--fl-bg-panel, var(--background-secondary));
    }
    .faglist-user-summary-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--fl-text-muted, var(--text-muted));
      font-weight: 500;
    }
    .faglist-user-summary-stat strong {
      font-weight: 700;
      color: var(--fl-text-primary, var(--text-normal));
    }
    .faglist-user-summary .faglist-stars {
      margin-left: auto;
    }
    .faglist-btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: var(--fl-bg-panel, var(--background-secondary));
      color: var(--fl-text-body, var(--text-normal));
      font-size: 18px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .faglist-btn-icon:hover {
      background: var(--fl-bg-hover, var(--background-modifier-hover));
      color: var(--fl-text-primary);
    }

    /* ── Scrollbar (webkit fallback) ── */
    .faglist-sidebar::-webkit-scrollbar,
    .faglist-content-body::-webkit-scrollbar,
    .faglist-scroll-list::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .faglist-sidebar::-webkit-scrollbar-track,
    .faglist-content-body::-webkit-scrollbar-track,
    .faglist-scroll-list::-webkit-scrollbar-track {
      background: transparent;
      border: 2px solid transparent;
      border-radius: 4px;
    }
    .faglist-sidebar::-webkit-scrollbar-thumb,
    .faglist-content-body::-webkit-scrollbar-thumb,
    .faglist-scroll-list::-webkit-scrollbar-thumb {
      background-color: rgba(32,34,37,.6);
      border: 2px solid transparent;
      border-radius: 4px;
      background-clip: padding-box;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .faglist-overlay {
        width: 100%;
        height: 95vh;
        border-radius: 0;
      }
      .faglist-body-row {
        flex-direction: column;
      }
      .faglist-sidebar {
        width: 100%;
        min-width: 100%;
        max-height: 200px;
        border-right: none;
        border-bottom: 1px solid var(--fl-border, #1e1f22);
        flex-direction: row;
        flex-wrap: wrap;
        gap: 4px;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 8px;
      }
      .faglist-sidebar-title {
        display: none;
      }
      .faglist-sidebar-item {
        flex-shrink: 0;
        width: auto;
      }
      .faglist-sidebar-sep {
        display: none;
      }
      .faglist-sidebar-bottom {
        margin-top: 0;
      }
      .faglist-content-body {
        padding: 12px;
      }
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
    renameKey: (key, username, discord_user_id, is_admin) =>
      apiFetch(`/api/keys/${key}`, {
        method: "PATCH",
        body: JSON.stringify({ username, discord_user_id, is_admin }),
      }),

    getAllNotes: () => apiFetch("/api/notes/all"),
    getRecentNotes: (limit = 50) => apiFetch(`/api/notes/recent?limit=${limit}`),
    batchUsers: (ids) =>
      apiFetch("/api/users/batch", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
    searchUsers: (query) =>
      apiFetch(`/api/users/search?q=${encodeURIComponent(query)}`),
    syncUsers: (users) =>
      apiFetch("/api/users/sync", {
        method: "POST",
        body: JSON.stringify({ users }),
      }),
  };

  /* ── Update System ───────────────────────────────────────── */
  let updateAvailable = false;

  function computeLocalHash() {
    try {
      const fs = require("fs");
      const crypto = require("crypto");
      const content = fs.readFileSync(__filename, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
      return crypto.createHash("sha256").update(content).digest("hex");
    } catch {
      return null;
    }
  }

  async function fetchRemoteHash() {
    const data = await apiFetch("/api/plugin/hash");
    return data.hash;
  }

  async function checkForUpdate() {
    try {
      const localHash = computeLocalHash();
      if (!localHash) return false;
      const remoteHash = await fetchRemoteHash();
      updateAvailable = localHash !== remoteHash;
      return updateAvailable;
    } catch {
      return false;
    }
  }

  async function performUpdate() {
    const res = await BdApi.Net.fetch(`${getApiBase()}/api/plugin/download`, {
      headers: { "x-api-key": getApiKey() },
    });
    if (!res.ok) throw new Error(`Download fehlgeschlagen: HTTP ${res.status}`);
    const content = await res.text();
    const fs = require("fs");
    fs.writeFileSync(__filename, content, "utf8");
    updateAvailable = false;
    BdApi.UI.showToast("FagList Update installiert! Plugin wird neu geladen…", { type: "success" });
    setTimeout(() => {
      BdApi.Plugins.reload(config.info.name);
    }, 800);
  }

  /* ── Username sync helper ───────────────────────────────── */
  function syncUsernames(ids) {
    try {
      const UserStore = BdApi.Webpack.getStore("UserStore");
      if (!UserStore) return;
      const toSync = [];
      for (const id of ids) {
        const user = UserStore.getUser(id);
        if (user) {
          const name = user.globalName || user.username;
          if (name && name !== id) toSync.push({ discord_id: id, username: name });
        }
      }
      if (toSync.length > 0) api.syncUsers(toSync).catch(() => {});
    } catch (_) {}
  }

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
  function NotesTab({ targetId, targetName, onChanged }) {
    const [notes, setNotes] = useState([]);
    const [myNote, setMyNote] = useState("");
    const [myNoteDate, setMyNoteDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
      api.getMe().then((me) => setCurrentUserId(me?.discord_user_id ?? null)).catch(() => {});
    }, []);

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
        setMyNote("");
        setMyNoteDate(null);
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
        if (onChanged) onChanged();
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
        if (onChanged) onChanged();
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
        React.createElement("button", { className: "faglist-btn-icon", onClick: importDiscordNote, title: "Discord-Notiz \u00fcbernehmen" }, "\uD83D\uDCCB")
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
  function RoundsTab({ targetId, targetName, onChanged }) {
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
        if (onChanged) onChanged();
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
            onClick: () => openAddRoundDialog(targetId, targetName, () => { load(); if (onChanged) onChanged(); }),
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

        const ids = data.ranking.map(r => r.discord_id);
        if (ids.length > 0) syncUsernames(ids);
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

  /* ── Modal Component (User — still used inside panel) ──── */
  function FagListModal({ targetId, targetName, onSummary }) {
    const [tab, setTab] = useState("notes");
    const [summary, setSummary] = useState({ noteCount: 0, roundCount: 0, avgRating: null });

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const [notesData, roundsData] = await Promise.all([
            api.getNotes(targetId),
            api.getRounds(targetId),
          ]);
          if (!cancelled) {
            const s = {
              noteCount: notesData.notes?.length ?? 0,
              roundCount: roundsData.totalRounds ?? roundsData.rounds?.length ?? 0,
              avgRating: roundsData.avgRating ?? null,
            };
            setSummary(s);
            if (onSummary) onSummary(s);
          }
        } catch (_) {}
      })();
      return () => { cancelled = true; };
    }, [targetId]);

    const refreshSummary = useCallback(async () => {
      try {
        const [notesData, roundsData] = await Promise.all([
          api.getNotes(targetId),
          api.getRounds(targetId),
        ]);
        const s = {
          noteCount: notesData.notes?.length ?? 0,
          roundCount: roundsData.totalRounds ?? roundsData.rounds?.length ?? 0,
          avgRating: roundsData.avgRating ?? null,
        };
        setSummary(s);
        if (onSummary) onSummary(s);
      } catch (_) {}
    }, [targetId, onSummary]);

    return React.createElement(
      "div",
      null,
      // Tabs
      React.createElement(
        "div",
        { className: "faglist-tabs" },
        React.createElement(
          "button",
          { className: `faglist-tab${tab === "notes" ? " active" : ""}`, onClick: () => setTab("notes") },
          `\uD83D\uDDD2\uFE0F Notizen (${summary.noteCount})`
        ),
        React.createElement(
          "button",
          { className: `faglist-tab${tab === "rounds" ? " active" : ""}`, onClick: () => setTab("rounds") },
          `\uD83C\uDFAE Runden (${summary.roundCount})`
        )
      ),
      tab === "notes"
        ? React.createElement(NotesTab, { targetId, targetName, onChanged: refreshSummary })
        : React.createElement(RoundsTab, { targetId, targetName, onChanged: refreshSummary })
    );
  }

  /* ── Search Page Component ──────────────────────────────── */
  function SearchPage({ initialQuery, onSelectUser }) {
    const [localQuery, setLocalQuery] = useState(initialQuery || "");

    useEffect(() => {
      if (initialQuery) setLocalQuery(initialQuery);
    }, [initialQuery]);

    return React.createElement(
      "div",
      null,
      localQuery.trim().length >= 2
        ? React.createElement(SearchResults, { query: localQuery, onSelectUser })
        : React.createElement("div", { className: "faglist-empty" }, "Gib mindestens 2 Zeichen ein, um zu suchen.")
    );
  }

  /* ── Search Results Component ─────────────────────────────── */
  function SearchResults({ query, onSelectUser }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (!query || query.trim().length < 2) {
        setResults([]);
        return;
      }
      let cancelled = false;
      const timer = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await api.searchUsers(query.trim());
          if (!cancelled) setResults(data.results || []);
        } catch (e) {
          if (!cancelled) setError(e.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }, 300);
      return () => { cancelled = true; clearTimeout(timer); };
    }, [query]);

    function highlightMatch(text, q) {
      if (!q) return text;
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return text;
      return React.createElement(
        React.Fragment,
        null,
        text.slice(0, idx),
        React.createElement("span", { className: "faglist-search-highlight" }, text.slice(idx, idx + q.length)),
        text.slice(idx + q.length)
      );
    }

    function formatDate(iso) {
      if (!iso) return "";
      const d = new Date(iso + "Z");
      return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    if (loading) return React.createElement("div", { className: "faglist-empty" }, "Suche\u2026");
    if (error) return React.createElement("div", { className: "faglist-error" }, error);
    if (query && query.trim().length >= 2 && results.length === 0) {
      return React.createElement("div", { className: "faglist-search-empty" }, "Keine Ergebnisse f\u00fcr \u201E" + query + "\u201C");
    }

    return React.createElement(
      "div",
      { className: "faglist-search-results" },
      results.map((r) =>
        React.createElement(
          "div",
          {
            key: r.discord_id,
            className: "faglist-search-result-card",
            onClick: () => onSelectUser(r.discord_id, r.username),
          },
          React.createElement("div", { className: "faglist-search-result-name" }, highlightMatch(r.username, query)),
          r.history && r.history.length > 0 && React.createElement(
            "div",
            { className: "faglist-search-history" },
            r.history.map((h, i) =>
              React.createElement(
                "span",
                { key: i, className: "faglist-search-history-tag" },
                highlightMatch(h.username, query),
                " \u00B7 ",
                formatDate(h.changed_at)
              )
            )
          )
        )
      )
    );
  }

  /* \u2500\u2500 Fullscreen Panel Component \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  function FagListPanel({ initialPage, initialUser, initialChannelId, onClose }) {
    const [page, setPage] = useState(initialPage || "ranking");
    const [selectedUser, setSelectedUser] = useState(initialUser || null);
    const [channelId, setChannelId] = useState(initialChannelId || null);
    const [currentVoiceUsers, setCurrentVoiceUsers] = useState([]);
    const [activeChannels, setActiveChannels] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [previousPage, setPreviousPage] = useState("ranking");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
      api.getMe().then(me => setIsAdmin(!!me.is_admin)).catch(() => {});
    }, []);

    useEffect(() => {
      const SelectedChannelStore = BdApi.Webpack.getStore("SelectedChannelStore");
      const VoiceStateStore = BdApi.Webpack.getStore("VoiceStateStore");
      const UserStore = BdApi.Webpack.getStore("UserStore");
      const ChannelStore = BdApi.Webpack.getStore("ChannelStore");
      const SelectedGuildStore = BdApi.Webpack.getStore("SelectedGuildStore");

      const currentId = channelId || SelectedChannelStore?.getVoiceChannelId?.();
      const currentGuildId = SelectedGuildStore?.getGuildId?.();

      if (currentId && VoiceStateStore && UserStore) {
        const states = VoiceStateStore.getVoiceStatesForChannel(currentId) || {};
        const uIds = Object.keys(states);
        const uArr = uIds.map(uid => {
          const u = UserStore.getUser(uid);
          return { id: uid, name: u ? (u.globalName || u.username) : uid };
        }).sort((a,b) => a.name.localeCompare(b.name, undefined, {sensitivity: "base"}));
        setCurrentVoiceUsers(uArr);
      } else {
        setCurrentVoiceUsers([]);
      }

      if (currentGuildId && VoiceStateStore && ChannelStore) {
        let allStates = {};
        if (typeof VoiceStateStore.getVoiceStates === "function") {
          allStates = VoiceStateStore.getVoiceStates(currentGuildId) || {};
        } else if (typeof VoiceStateStore.getVoiceStatesForGuild === "function") {
          allStates = VoiceStateStore.getVoiceStatesForGuild(currentGuildId) || {};
        }
        const cIds = new Set(Object.values(allStates).map(s => s.channelId).filter(Boolean));
        const cArr = Array.from(cIds).map(cid => {
          const c = ChannelStore.getChannel(cid);
          return { id: cid, name: c ? c.name : "Voice Channel" };
        }).sort((a,b) => a.name.localeCompare(b.name, undefined, {sensitivity: "base"}));
        setActiveChannels(cArr);
      }
    }, [channelId]);

    const openUserPage = useCallback((id, name) => {
      setPreviousPage(page);
      setSelectedUser({ id, name });
      setPage("user");
      syncUsernames([id]);
    }, [page]);

    const goBack = useCallback(() => {
      setSelectedUser(null);
      setPage(previousPage);
    }, [previousPage]);

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const [hasUpdate, setHasUpdate] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [checking, setChecking] = useState(false);

    const handleUpdate = useCallback(async () => {
      setUpdating(true);
      try {
        await performUpdate();
        setHasUpdate(false);
      } catch (e) {
        BdApi.UI.showToast(`Update fehlgeschlagen: ${e.message}`, { type: "error" });
      } finally {
        setUpdating(false);
      }
    }, []);

    const navItems = [
      { id: "ranking", icon: "\uD83C\uDFC6", label: "Ranking" },
      { id: "recent", icon: "\uD83D\uDD59", label: "Letzte \u00C4nderungen" },
      { id: "allnotes", icon: "\uD83D\uDC65", label: "Alle Benutzer" },
      { id: "search", icon: "\uD83D\uDD0D", label: "Suche" },
      { id: "channel", icon: "\uD83D\uDD0A", label: "Voice Channel" },
    ];

    const [searchPageQuery, setSearchPageQuery] = useState("");
    const [userSummary, setUserSummary] = useState({ noteCount: 0, roundCount: 0, avgRating: null });

    let contentTitle = "";
    let contentBody = null;
    let contentHeaderExtra = null;

    switch (page) {
      case "admin":
        contentTitle = "Admin Panel";
        contentBody = React.createElement(AdminTab);
        break;
      case "ranking":
        contentTitle = "Ranking";
        contentBody = React.createElement(OverviewTab, { openUserModal: openUserPage });
        break;
      case "recent":
        contentTitle = "Letzte \u00C4nderungen";
        contentBody = React.createElement(RecentChangesTab, { openUserModal: openUserPage });
        break;
      case "allnotes":
        contentTitle = "Alle Benutzer";
        contentBody = React.createElement(AllNotesTab, { openUserModal: openUserPage });
        break;
      case "search":
        contentTitle = "Suche";
        contentHeaderExtra = React.createElement(
          "div",
          { className: "faglist-content-header-search" },
          React.createElement("input", {
            type: "text",
            placeholder: "Benutzer suchen\u2026",
            value: searchPageQuery,
            onChange: (e) => setSearchPageQuery(e.target.value),
            autoFocus: true,
          }),
          searchPageQuery && React.createElement(
            "button",
            { className: "faglist-search-clear", onClick: () => setSearchPageQuery("") },
            "\u2715"
          )
        );
        contentBody = React.createElement(SearchPage, { initialQuery: searchPageQuery, onSelectUser: (id, name) => { openUserPage(id, name); } });
        break;
      case "channel":
        contentTitle = "Voice Channel";
        contentBody = React.createElement(ChannelTab, { openUserModal: openUserPage, channelId });
        break;
      case "user":
        contentTitle = selectedUser?.name || "Nutzer";
        contentHeaderExtra = React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "12px" } },
          userSummary.avgRating != null
            ? React.createElement(
                React.Fragment,
                null,
                React.createElement(Stars, { value: Math.round(userSummary.avgRating), readonly: true, size: 18 }),
                React.createElement("span", { style: { fontSize: "13px", color: "var(--fl-text-muted)" } }, userSummary.avgRating.toFixed(2))
              )
            : null,
          React.createElement(
            "button",
            { className: "faglist-back-btn", onClick: goBack, style: { margin: 0 } },
            "\u2190 Zur\u00fcck"
          )
        );
        contentBody = React.createElement(FagListModal, {
          targetId: selectedUser?.id,
          targetName: selectedUser?.name,
          onSummary: setUserSummary,
        });
        break;
    }

    return React.createElement(
      "div",
      { className: "faglist-backdrop-overlay", onClick: onClose },
      React.createElement(
        "div",
        {
          className: "faglist-overlay",
          onClick: (e) => e.stopPropagation()
        },

        // Header bar
      React.createElement(
        "div",
        { className: "faglist-header-bar" },
        React.createElement(
          "div",
          { className: "faglist-header-title" },
          React.createElement("h2", null, "FagList")
        ),
        React.createElement(
          "button",
          { className: "faglist-close-btn", onClick: onClose, "aria-label": "Close" },
          React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24" },
            React.createElement("path", { fill: "currentColor", d: "M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" })
          )
        )
      ),

      // Body row
      React.createElement(
        "div",
        { className: "faglist-body-row" },

      // Sidebar
      React.createElement(
        "div",
        { className: "faglist-sidebar" },
        React.createElement(
          "div",
          { className: "faglist-search-wrap" },
          React.createElement("input", {
            className: "faglist-search-input",
            type: "text",
            placeholder: "Benutzer suchen\u2026",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && searchQuery.trim().length >= 1) {
                setSearchPageQuery(searchQuery.trim());
                setPage("search");
                setSelectedUser(null);
                setSearchQuery("");
              }
            },
          }),
          searchQuery && React.createElement(
            "button",
            { className: "faglist-search-clear", onClick: () => setSearchQuery("") },
            "\u2715"
          )
        ),
        navItems.map((item) =>
          React.createElement(
            "button",
            {
              key: item.id,
              className: `faglist-sidebar-item${page === item.id ? " active" : ""}`,
              onClick: () => { setPage(item.id); setSelectedUser(null); },
            },
            React.createElement("span", { className: "faglist-sidebar-icon" }, item.icon),
            item.label
          )
        ),
        currentVoiceUsers.length > 0 && React.createElement(
          "div",
          null,
          React.createElement("div", { className: "faglist-sidebar-sep" }),
          React.createElement("div", { className: "faglist-sidebar-title" }, "Aktueller Raum"),
          currentVoiceUsers.map(u => 
            React.createElement(
              "button",
              { 
                key: u.id, 
                className: `faglist-sidebar-item${page === "user" && selectedUser?.id === u.id ? " active" : ""}`,
                onClick: () => { openUserPage(u.id, u.name); }
              },
              React.createElement("span", { className: "faglist-sidebar-icon" }, "\uD83D\uDC64"),
              u.name
            )
          )
        ),
        activeChannels.length > 0 && React.createElement(
          "div",
          null,
          React.createElement("div", { className: "faglist-sidebar-sep" }),
          React.createElement("div", { className: "faglist-sidebar-title" }, "Andere Räume"),
          activeChannels.map(c => 
            React.createElement(
              "button",
              { 
                key: c.id, 
                className: `faglist-sidebar-item${page === "channel" && channelId === c.id ? " active" : ""}`,
                onClick: () => { setChannelId(c.id); setPage("channel"); setSelectedUser(null); }
              },
              React.createElement("span", { className: "faglist-sidebar-icon" }, "\uD83D\uDD0A"),
              c.name
            )
          )
        ),
        React.createElement(
          "div",
          { className: "faglist-sidebar-bottom" },
          isAdmin && React.createElement(
            "button",
            {
              className: `faglist-sidebar-item${page === "admin" ? " active" : ""}`,
              onClick: () => { setPage("admin"); setSelectedUser(null); },
            },
            React.createElement("span", { className: "faglist-sidebar-icon" }, "\u2699\uFE0F"),
            "Admin"
          ),
          React.createElement(
            "button",
            {
              className: `faglist-sidebar-update-btn${hasUpdate ? " has-update" : ""}`,
              disabled: checking || updating,
              onClick: async () => {
                if (hasUpdate) {
                  setUpdating(true);
                  try {
                    await performUpdate();
                    setHasUpdate(false);
                  } catch (e) {
                    BdApi.UI.showToast(`Update fehlgeschlagen: ${e.message}`, { type: "error" });
                  } finally {
                    setUpdating(false);
                  }
                } else {
                  setChecking(true);
                  const result = await checkForUpdate();
                  setHasUpdate(result);
                  setChecking(false);
                  if (!result) BdApi.UI.showToast("Kein Update verf\u00fcgbar.", { type: "info" });
                }
              },
            },
            React.createElement("span", { className: "faglist-sidebar-icon" }, checking ? "\u23F3" : (updating ? "\u23F3" : (hasUpdate ? "\u26A0\uFE0F" : "\uD83D\uDD04"))),
            checking ? "Pr\u00fcfe\u2026" : (updating ? "Wird aktualisiert\u2026" : (hasUpdate ? "Jetzt updaten" : "Nach Updates suchen"))
          )
        )
      ),

      // Content
      React.createElement(
        "div",
        { className: "faglist-content-area" },
        React.createElement("div", { className: "faglist-content-header" },
          React.createElement("span", { className: "faglist-content-header-title" }, contentTitle),
          contentHeaderExtra
        ),
        React.createElement(
          "div",
          { className: "faglist-content-body" },
          contentBody
        )
      )
      ) // close body-row
      ) // close overlay
    );
  }

  /* ── Recent Changes Tab ──────────────────────────────────── */
  function RecentChangesTab({ openUserModal }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getRecentNotes(50);
        setNotes(data.notes);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return React.createElement("div", { className: "faglist-loading" }, "Laden...");

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

    return React.createElement(
      "div",
      null,
      error && React.createElement("div", { className: "faglist-error" }, error),
      React.createElement("div", { className: "faglist-section-title" }, `Letzte \u00C4nderungen (${notes.length})`),
      notes.length === 0
        ? React.createElement("div", { className: "faglist-empty" }, "Keine \u00C4nderungen vorhanden.")
        : React.createElement(
            "div",
            { className: "faglist-scroll-list" },
            notes.map((n) =>
              React.createElement(
                "div",
                { key: n.id, className: "faglist-note-card" },
                React.createElement(
                  "div",
                  { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" } },
                  React.createElement(
                    "span",
                    {
                      className: "faglist-rank-name",
                      onClick: () => openUserModal(n.target_discord_id, n.target_username),
                      style: { fontWeight: "600", cursor: "pointer" }
                    },
                    resolveUsername(n.target_discord_id) !== n.target_discord_id ? resolveUsername(n.target_discord_id) : n.target_username
                  ),
                  n.updated_at && React.createElement("span", { className: "faglist-note-date", style: { margin: 0 } }, fmtDate(n.updated_at))
                ),
                React.createElement("div", { className: "faglist-note-content" }, n.content),
                React.createElement("div", { className: "faglist-note-author", style: { marginTop: "6px", fontSize: "11px" } }, `von ${displayName(n.author_discord_id, n.author_username)}`)
              )
            )
          )
    );
  }

  /* ── All Notes Modal ─────────────────────────────────────── */
  function AllNotesTab({ openUserModal }) {
    const [notes, setNotes] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const [notesData, rankData] = await Promise.all([api.getAllNotes(), api.getRanking()]);
        setNotes(notesData.notes);
        setRanking(rankData.ranking);
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

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

    const Stars = ({ value }) => {
      return React.createElement(
        "div",
        { className: "faglist-stars" },
        [1, 2, 3, 4, 5].map((star) =>
          React.createElement(
            "span",
            { key: star, style: { color: star <= value ? "#f1c40f" : "#4f545c", fontSize: "16px" } },
            "\u2605"
          )
        )
      );
    };

    return React.createElement(
      "div",
      null,
      error && React.createElement("div", { className: "faglist-error" }, error),
      React.createElement("div", { className: "faglist-section-title" }, `Alle Benutzer (${sorted.length})`),
      sorted.length === 0
        ? React.createElement("div", { className: "faglist-empty" }, "Keine Benutzer vorhanden.")
        : React.createElement(
            "div",
            { className: "faglist-notes-grid" },
            sorted.map(([discordId, group]) => {
              const rankUser = ranking.find(r => r.discord_id === discordId);
              const rating = rankUser?.avg_rating || 0;
              const rounds = rankUser?.total_rounds || 0;

              return React.createElement(
                "div",
                { key: discordId, className: "faglist-notes-grid-card" },
                React.createElement(
                  "div",
                  {
                    className: "faglist-notes-grid-header",
                    onClick: () => openUserModal(discordId, group.name)
                  },
                  React.createElement(
                    "span",
                    null,
                    resolveUsername(discordId) !== discordId ? resolveUsername(discordId) : group.name
                  ),
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", gap: "8px" } },
                    React.createElement(Stars, { value: Math.round(rating) }),
                    React.createElement("span", { className: "faglist-group-count", style: { marginLeft: 4 } }, `${rounds} Runden`),
                    React.createElement("span", { className: "faglist-group-count" }, `${group.notes.length} Notiz${group.notes.length !== 1 ? "en" : ""}`)
                  )
                ),
                group.notes.map((n) =>
                  React.createElement(
                    "div",
                    { key: n.id, className: "faglist-note-card", style: { margin: 0, padding: "8px", background: "var(--background-primary)", borderRadius: "6px" } },
                    React.createElement("div", { className: "faglist-note-author" }, displayName(n.author_discord_id, n.author_username)),
                    React.createElement("div", { className: "faglist-note-content" }, n.content),
                    n.updated_at && React.createElement("div", { className: "faglist-note-date" }, `Zuletzt bearbeitet: ${fmtDate(n.updated_at)}`)
                  )
                )
              );
            })
          )
    );
  }

  /* ── Channel Tab ─────────────────────────────────────────── */
  function ChannelTab({ openUserModal, channelId: propChannelId }) {
    const [users, setUsers] = useState([]);
    const [channelName, setChannelName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noChannel, setNoChannel] = useState(false);
    const [expanded, setExpanded] = useState({});

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

        const [data, notesData] = await Promise.all([
          api.batchUsers(ids),
          api.getAllNotes()
        ]);
        
        const serverMap = {};
        for (const u of data.users) serverMap[u.discord_id] = u;

        const allNotes = notesData.notes || [];

        const result = ids.map((id) => {
          const srv = serverMap[id];
          const userNotes = allNotes.filter(n => n.target_discord_id === id);
          return {
            discord_id: id,
            name: resolveUsername(id) !== id ? resolveUsername(id) : (srv?.username || id),
            avg_rating: srv?.avg_rating ?? null,
            total_rounds: srv?.total_rounds ?? 0,
            total_notes: Math.max(srv?.total_notes ?? 0, userNotes.length),
            notes: userNotes
          };
        });

        result.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        setUsers(result);

        syncUsernames(ids);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, [propChannelId]);

    useEffect(() => { load(); }, [load]);

    const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

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
            "div",
            { className: "faglist-scroll-list" },
            users.map((u) =>
              React.createElement(
                "div",
                { key: u.discord_id, className: "faglist-user-group" },
                React.createElement(
                  "div",
                  { className: "faglist-user-group-header", onClick: () => toggle(u.discord_id) },
                  React.createElement("span", { className: `faglist-expand-icon${expanded[u.discord_id] ? " open" : ""}` }, "\u25B6"),
                  React.createElement(
                    "span",
                    {
                      className: "faglist-group-name",
                      onClick: (e) => { e.stopPropagation(); openUserModal(u.discord_id, u.name); },
                    },
                    u.name
                  ),
                  u.avg_rating != null && React.createElement(
                    "span",
                    { style: { display: "flex", alignItems: "center", gap: "4px", marginLeft: "10px" } },
                    React.createElement(Stars, { value: Math.round(u.avg_rating), readonly: true, size: 14 }),
                    React.createElement("span", { style: { fontSize: "12px", color: "var(--text-muted)" } }, u.avg_rating.toFixed(2))
                  ),
                  React.createElement("span", { className: "faglist-group-count" }, `${u.total_notes} Notiz${u.total_notes !== 1 ? "en" : ""}`)
                ),
                expanded[u.discord_id] && u.notes && u.notes.length > 0
                  ? React.createElement(
                      "div",
                      { className: "faglist-group-notes" },
                      u.notes.map((n) =>
                        React.createElement(
                          "div",
                          { key: n.id, className: "faglist-note-card" },
                          React.createElement("div", { className: "faglist-note-author" }, displayName(n.author_discord_id, n.author_username)),
                          React.createElement("div", { className: "faglist-note-content" }, n.content),
                          n.updated_at && React.createElement("div", { className: "faglist-note-date" }, `Zuletzt bearbeitet: ${fmtDate(n.updated_at)}`)
                        )
                      )
                    )
                  : expanded[u.discord_id] ? React.createElement("div", { className: "faglist-empty", style: { padding: "4px 0 12px 24px" } }, "Keine Notizen vorhanden.") : null
              )
            )
          )
    );
  }

  /* ── Main Plugin Class ──────────────────────────────────── */
  return class FagList {
    start() {

      this.panelObserver = new MutationObserver(() => this.injectUserPanelButton());
      this.panelObserver.observe(document.body, { childList: true, subtree: true });
      this.injectUserPanelButton();

      BdApi.DOM.addStyle(config.info.name, css);

      this.contextMenuUnpatch = BdApi.ContextMenu.patch("user-context", (tree, props) => {
          const user = props.user;
          if (!user) return;

          tree.props.children.push(
            BdApi.ContextMenu.buildItem({ type: "separator" }),
            BdApi.ContextMenu.buildItem({
              label: "FagList",
              id: "faglist-show",
              action: () => this.openModal(user.id, user.globalName || user.username || user.id),
            })
          );
        });

      this.channelMenuUnpatch = BdApi.ContextMenu.patch("channel-context", (tree, props) => {
          const channel = props.channel;
          if (!channel) return;
          const isVoice = channel.type === 2 || channel.type === 13;

          if (isVoice) {
            tree.props.children.push(
              BdApi.ContextMenu.buildItem({ type: "separator" }),
              BdApi.ContextMenu.buildItem({
                label: "FagList",
                id: "faglist-channel",
                action: () => this.openChannelModal(channel.id),
              })
            );
          }
        });

      this.patchPopout();
    }

    
      stop() {
        if (this.panelObserver) this.panelObserver.disconnect();
        const btn = document.getElementById("faglist-user-panel-btn");
        if (btn) btn.remove();

      BdApi.DOM.removeStyle(config.info.name);
      BdApi.Patcher.unpatchAll(config.info.name);
      if (this.contextMenuUnpatch) this.contextMenuUnpatch();
      if (this.channelMenuUnpatch) this.channelMenuUnpatch();
      this.closePanel();
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

    
      injectUserPanelButton() {
        requestAnimationFrame(() => {
          const panels = document.querySelector('section[class*="panels_"]');
          if (!panels) return;
          // Discord typically has 3 buttons (mic, headset, settings). We find the container that holds them.
          const buttonContainers = panels.querySelectorAll('div[class*="flex_"]');
          // Usually the one with buttons is the last or only flex container, but we can look for the settings button 
          const settingsBtn = panels.querySelector('button[aria-label="Benutzereinstellungen"], button[aria-label="User Settings"]');
          if (!settingsBtn) return;
          
          const container = settingsBtn.parentElement;
          if (!container || document.getElementById("faglist-user-panel-btn")) return;
          
          const btn = document.createElement("button");
          btn.id = "faglist-user-panel-btn";
          btn.className = "faglist-panel-icon-btn";
          btn.title = "FagList Alle Benutzer";
          btn.innerHTML = `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 1 1 14 0H5Z"/></svg>`;
          btn.onclick = () => {
            this.openAllNotesModal();
          };
          
          container.insertBefore(btn, container.firstChild);
        });
      }

      openPanel(page, opts = {}) {
      if (this._panelContainer) this.closePanel();
      const container = document.createElement("div");
      container.id = "faglist-panel-root";
      const appMount = document.getElementById("app-mount") || document.body;
      appMount.appendChild(container);
      this._panelContainer = container;

      const close = () => this.closePanel();
      this._panelRoot = BdApi.ReactDOM.createRoot(container);
      this._panelRoot.render(
        React.createElement(FagListPanel, {
          initialPage: page,
          initialUser: opts.user || null,
          initialChannelId: opts.channelId || null,
          onClose: close,
        })
      );
    }

    closePanel() {
      if (this._panelRoot) {
        this._panelRoot.unmount();
        this._panelRoot = null;
      }
      if (this._panelContainer) {
        this._panelContainer.remove();
        this._panelContainer = null;
      }
    }

    openModal(userId, userName) {
      this.openPanel("user", { user: { id: userId, name: userName } });
    }

    openRankingModal() {
      this.openPanel("ranking");
    }

    openAllNotesModal() {
      this.openPanel("allnotes");
    }

    openChannelModal(channelId) {
      this.openPanel("channel", { channelId });
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

      // ── Update Section ──
      const updateSep = document.createElement("hr");
      updateSep.style.cssText = "border:none;border-top:1px solid var(--background-modifier-accent);margin:16px 0";
      panel.appendChild(updateSep);

      const updateTitle = document.createElement("span");
      updateTitle.style.cssText = "font-weight:600;color:var(--header-primary);display:block;margin-bottom:8px";
      updateTitle.textContent = "Update";
      panel.appendChild(updateTitle);

      const updateStatus = document.createElement("div");
      updateStatus.className = "faglist-update-status" + (updateAvailable ? " available" : " uptodate");
      updateStatus.textContent = updateAvailable ? "\u26A0\uFE0F Ein Update ist verf\u00fcgbar!" : "\u2705 Plugin ist aktuell.";
      panel.appendChild(updateStatus);

      const updateBtnWrap = document.createElement("div");
      updateBtnWrap.style.cssText = "display:flex;gap:8px;margin-top:10px";

      const checkBtn = document.createElement("button");
      checkBtn.className = "faglist-update-check-btn";
      checkBtn.textContent = "\uD83D\uDD0D Auf Updates pr\u00fcfen";
      checkBtn.addEventListener("click", async () => {
        checkBtn.disabled = true;
        checkBtn.textContent = "Pr\u00fcfe\u2026";
        const hasUpdate = await checkForUpdate();
        updateStatus.className = "faglist-update-status" + (hasUpdate ? " available" : " uptodate");
        updateStatus.textContent = hasUpdate ? "\u26A0\uFE0F Ein Update ist verf\u00fcgbar!" : "\u2705 Plugin ist aktuell.";
        doUpdateBtn.style.display = hasUpdate ? "" : "none";
        checkBtn.textContent = "\uD83D\uDD0D Auf Updates pr\u00fcfen";
        checkBtn.disabled = false;
      });
      updateBtnWrap.appendChild(checkBtn);

      const doUpdateBtn = document.createElement("button");
      doUpdateBtn.className = "faglist-update-btn";
      doUpdateBtn.textContent = "\uD83D\uDD04 Jetzt updaten";
      doUpdateBtn.style.display = updateAvailable ? "" : "none";
      doUpdateBtn.addEventListener("click", async () => {
        doUpdateBtn.disabled = true;
        doUpdateBtn.textContent = "Wird aktualisiert\u2026";
        try {
          await performUpdate();
          updateStatus.className = "faglist-update-status uptodate";
          updateStatus.textContent = "\u2705 Update installiert! Plugin wird neu geladen\u2026";
          doUpdateBtn.style.display = "none";
        } catch (e) {
          BdApi.UI.showToast(`Update fehlgeschlagen: ${e.message}`, { type: "error" });
          doUpdateBtn.textContent = "\uD83D\uDD04 Jetzt updaten";
          doUpdateBtn.disabled = false;
        }
      });
      updateBtnWrap.appendChild(doUpdateBtn);
      panel.appendChild(updateBtnWrap);

      return panel;
    }

  }

  /* ── Admin Tab ──────────────────────────────────────────────────────── */
  function KeyRow({ k, onReload }) {
    const [name, setName] = useState(k.username);
    const [discordId, setDiscordId] = useState(k.discord_user_id);
    const [isAdmin, setIsAdmin] = useState(!!k.is_admin);

    const handleSave = async () => {
      try {
        await api.renameKey(k.key, name.trim(), discordId.trim() || undefined, isAdmin);
        BdApi.UI.showToast("Key aktualisiert!", { type: "success" });
        onReload();
      } catch (e) {
        BdApi.UI.showToast(e.message, { type: "error" });
      }
    };

    const handleDelete = async () => {
      try {
        await api.deleteKey(k.key);
        BdApi.UI.showToast("Key gelöscht", { type: "success" });
        onReload();
      } catch (e) {
        BdApi.UI.showToast(e.message, { type: "error" });
      }
    };

    return React.createElement(
      "tr",
      null,
      React.createElement("td", null, React.createElement("input", { className: "faglist-input", value: name, onChange: e => setName(e.target.value), style: { padding: "4px 8px", fontSize: "13px", width: "auto" } })),
      React.createElement("td", null, React.createElement("input", { className: "faglist-input", value: discordId, onChange: e => setDiscordId(e.target.value), style: { padding: "4px 8px", fontSize: "13px", width: "auto", fontFamily: "monospace" } })),
      React.createElement("td", { className: "faglist-key-text" }, k.key),
      React.createElement("td", null, React.createElement("input", { type: "checkbox", checked: isAdmin, onChange: e => setIsAdmin(e.target.checked), style: { width: "16px", height: "16px", cursor: "pointer" } })),
      React.createElement("td", null, 
        React.createElement("button", { className: "faglist-btn faglist-btn-primary", onClick: handleSave, style: { padding: "2px 8px", fontSize: "11px", marginRight: "6px" } }, "Speichern"),
        React.createElement("button", { className: "faglist-delete-btn", onClick: handleDelete, title: "Löschen" }, "✕")
      )
    );
  }

  function UserRow({ u, onReload }) {
    const [name, setName] = useState(u.username);
    const [discordId, setDiscordId] = useState(u.discord_id);

    const handleSave = async () => {
      try {
        await api.updateUser(u.discord_id, name.trim(), discordId.trim() || undefined);
        BdApi.UI.showToast("Nutzer aktualisiert!", { type: "success" });
        onReload();
      } catch (e) {
        BdApi.UI.showToast(e.message, { type: "error" });
      }
    };

    return React.createElement(
      "tr",
      null,
      React.createElement("td", null, React.createElement("input", { className: "faglist-input", value: discordId, onChange: e => setDiscordId(e.target.value), style: { padding: "4px 8px", fontSize: "13px", width: "auto", fontFamily: "monospace" } })),
      React.createElement("td", null, React.createElement("input", { className: "faglist-input", value: name, onChange: e => setName(e.target.value), style: { padding: "4px 8px", fontSize: "13px", width: "auto" } })),
      React.createElement("td", null, 
        React.createElement("button", { className: "faglist-btn faglist-btn-primary", onClick: handleSave, style: { padding: "4px 10px", fontSize: "12px" } }, "Speichern")
      )
    );
  }

  function AdminTab() {
      const [adminTab, setAdminTab] = useState('keys');
      const [keys, setKeys] = useState([]);
      const [users, setUsers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      const [keyDiscordId, setKeyDiscordId] = useState('');
      const [keyUsername, setKeyUsername] = useState('');

      const [userDiscordId, setUserDiscordId] = useState('');
      const [userUsername, setUserUsername] = useState('');

      const loadData = useCallback(async () => {
        try {
          setLoading(true);
          setError(null);
          const [kData, uData] = await Promise.all([api.getKeys(), api.getUsers()]);
          setKeys(kData.keys || kData.api_keys || []);
          setUsers(uData.users || []);
        } catch (e) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }, []);

      useEffect(() => { loadData(); }, [loadData]);

      const handleCreateKey = async () => {
        if (!keyDiscordId.trim() || !keyUsername.trim()) return;
        try {
          await api.createKey(keyDiscordId.trim(), keyUsername.trim());
          setKeyDiscordId('');
          setKeyUsername('');
          loadData();
        } catch (e) {
          BdApi.UI.showToast(e.message, { type: 'error' });
        }
      };

      const handleCreateUser = async () => {
        if (!userDiscordId.trim() || !userUsername.trim()) return;
        try {
          await apiFetch('/api/users', { method: 'POST', body: JSON.stringify({ discord_id: userDiscordId.trim(), username: userUsername.trim() }) });
          setUserDiscordId('');
          setUserUsername('');
          loadData();
        } catch (e) {
          BdApi.UI.showToast(e.message, { type: 'error' });
        }
      };

      if (loading) return React.createElement('div', { className: 'faglist-loading' }, 'Laden...');

      return React.createElement(
        'div',
        null,
        error && React.createElement('div', { className: 'faglist-error' }, error),
        React.createElement(
          'div',
          { className: 'faglist-tabs' },
          React.createElement(
            'button',
            { className: `faglist-tab${adminTab === 'keys' ? ' active' : ''}`, onClick: () => setAdminTab('keys') },
            '\uD83D\uDDDD\uFE0F API Keys'
          ),
          React.createElement(
            'button',
            { className: `faglist-tab${adminTab === 'users' ? ' active' : ''}`, onClick: () => setAdminTab('users') },
            '\uD83D\uDC65 Benutzer'
          )
        ),
        adminTab === 'keys' ? React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { style: { background: 'var(--background-secondary)', padding: '12px', borderRadius: '6px', marginBottom: '16px' } },
            React.createElement('div', { className: 'faglist-section-title', style: { marginTop: 0 } }, 'Neuen API Key erstellen'),
            React.createElement(
              'div',
              { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              React.createElement('input', { className: 'faglist-input', placeholder: 'Discord ID...', value: keyDiscordId, onChange: e => setKeyDiscordId(e.target.value) }),
              React.createElement('input', { className: 'faglist-input', placeholder: 'Name...', value: keyUsername, onChange: e => setKeyUsername(e.target.value) }),
              React.createElement('button', { className: 'faglist-btn faglist-btn-primary', onClick: handleCreateKey }, 'Erstellen')
            )
          ),
          React.createElement('div', { className: 'faglist-section-title' }, `Vorhandene Keys (${keys.length})`),
          React.createElement(
            'table',
            { className: 'faglist-admin-table' },
            React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', null, 'Name'), React.createElement('th', null, 'Discord ID'), React.createElement('th', null, 'Key'), React.createElement('th', null, 'Admin'), React.createElement('th', null, 'Aktionen'))),
            React.createElement('tbody', null, keys.map(k => React.createElement(KeyRow, { key: k.key, k, onReload: loadData })))
          )
        ) : React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { style: { background: 'var(--background-secondary)', padding: '12px', borderRadius: '6px', marginBottom: '16px' } },
            React.createElement('div', { className: 'faglist-section-title', style: { marginTop: 0 } }, 'Nutzer (Manuell hinterlegen)'),
            React.createElement(
              'div',
              { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              React.createElement('input', { className: 'faglist-input', placeholder: 'Discord ID...', value: userDiscordId, onChange: e => setUserDiscordId(e.target.value) }),
              React.createElement('input', { className: 'faglist-input', placeholder: 'Name...', value: userUsername, onChange: e => setUserUsername(e.target.value) }),
              React.createElement('button', { className: 'faglist-btn faglist-btn-primary', onClick: handleCreateUser }, 'Anlegen / Update')
            )
          ),
          React.createElement('div', { className: 'faglist-section-title' }, `Hinterlegte Nutzer (${users.length})`),
          React.createElement(
            'table',
            { className: 'faglist-admin-table' },
            React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', null, 'Name'), React.createElement('th', null, 'Discord ID'), React.createElement('th', null, 'Erstellt'), React.createElement('th', null, 'Aktionen'))),
            React.createElement('tbody', null, users.map(u => React.createElement(UserRow, { key: u.discord_id, u, onReload: loadData })))
          )
        )
      );
    }

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
