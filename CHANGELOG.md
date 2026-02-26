# Changelog

All notable changes to the ESL Coordinator Management Suite are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [3.0.0] — 2026-02-26

### Added

- **Team Overview dashboard** (`Team_Overview.html`) — manager-facing aggregate view that reads all coordinator data via Google Drive Sync; coordinator cards display last-sync timestamp with freshness color coding (green/yellow/red); Chart.js walkthrough activity chart aggregated across all coordinators; coaching pipeline badges summarized across the team; Send Reminders button triggers the GAS email reminder endpoint
- **Onboarding Guide** (`Onboarding.html`) — 5-step setup wizard with progress bar guiding new coordinators through Drive Sync configuration; supports `?gasUrl=` URL param so managers can pre-distribute a link with the script URL already filled in; coordinator ID and display name form in Step 3; completed steps persisted in `esl_onboarding_complete` localStorage key
- **Calendar Export (ICS)** — toolbar button in Academic Monitoring Planning Template generates an RFC 5545-compliant `.ics` file with one `VEVENT` per walkthrough round; time parsed from the Date/Time cell with an 8AM default when no time is present; warns if the date cell is empty before downloading
- **Email Reminder System** — `sendReminderEmails()`, `createWeeklyTrigger()`, and `weeklyReminderJob()` functions added to `Code.gs`; Monday 7AM time-based trigger installed via `createWeeklyTrigger()` (run once manually); `COORDINATOR_EMAIL_MAP` constant holds four coordinator entries; `OVERDUE_DAYS` and `STALLED_DAYS` thresholds control flagging logic; reminder emails include direct deep-links to the Coaching Cycle Tracker
- Service worker bumped to cache version `v3`

### Changed

- `index.html`: Setup Guide link added to the header toolbar; Team Overview tool card added to the tool launcher grid (10 tools total)
- `Code.gs`: `sendReminders` POST action added to `doPost()` dispatcher; `COORDINATOR_EMAIL_MAP`, `OVERDUE_DAYS`, `STALLED_DAYS`, and `APP_URL` constants added at top of file

---

## [2.0.0] — 2026-02-26

### Added

- **Cross-tool deep-link navigation** — teacher names render as `<a class="teacher-link">` elements wherever they appear in tables across all tools; all links resolve to `Teacher_360_Profile.html?teacher=NAME`
- **`?teacher=NAME` URL parameter** — supported by Teacher 360 Profile (auto-selects teacher in dropdown), Walkthrough Dashboard (auto-switches to Teacher Trends view and applies filter), and Coaching Cycle Tracker (auto-filters board and shows breadcrumb)
- **Breadcrumb navigation** — shown in Teacher 360 Profile, Walkthrough Dashboard, and Coaching Cycle Tracker when the page is loaded via a `?teacher=` URL parameter; links back to the referring tool or the Home page
- **Coaching handoff pipeline** — Planning Template coaching rows include a button that calls `startCycleFromAction(idx)`; writes a `coaching_cycle_handoff` object to localStorage and opens Coaching Cycle Tracker; on load, `checkHandoff()` consumes the key and pre-fills the new cycle modal
- **Walkthrough → Audit pipeline** — after saving a walkthrough to history, the planner offers to open the audit tool with context pre-loaded via the `walkthrough_audit_handoff` localStorage key; consumed and removed by the audit tool on load
- **Audit Entries table in Score Trends view** — Audit Dashboard Score Trends view renders a detail table below the chart showing Date, Teacher (as a profile deep-link), Campus, Score %, and Level pill
- **Google Drive Sync** — Data Backup Hub "Drive Sync" section connects to `google_apps_script/Code.gs` GAS web app; stores each coordinator's full localStorage state as a JSON file in a shared Drive folder; settings persisted in `esl_gas_sync` localStorage key
- **Google Apps Script backend** (`google_apps_script/Code.gs`) — GAS web app with GET (status, read, readAll, list, readKey) and POST (sync, syncKey, delete) endpoints; per-coordinator JSON files named `{coordinatorId}_data.json` in the configured Drive folder
- **GitHub Gist cloud sync** — Data Backup Hub supports push/pull of all localStorage data to a private GitHub Gist; settings persisted in `esl_gist_sync` localStorage key; requires a GitHub Personal Access Token with `gist` scope
- **Import validation** (`IMPORT_VALIDATORS`) — Data Backup Hub validates data structure for each localStorage key before writing; invalid or malformed entries are skipped and reported to the user
- **SPED Time Tracker** (`Data_Analysis/SPED_Time_Tracker/`) — standalone Python utility (`build_tracker.py`) that generates `SPED_Time_Tracker.xlsx` via openpyxl; 9 sheets covering 5 service types; reads student names from `Social Skills Times.xlsx`
- **ELPS Knowledge Base Agent** (`ELPS_Agent/ELPS_Agent.html`) — PDF full-text search tool using PDF.js CDN; inverted index stored in `elps_agent_index`; ELPS code detection in queries; optional Anthropic Claude API integration for RAG-style Q&A; settings in `elps_agent_settings`, history in `elps_agent_history`
- **Dark mode** — `body.dark-mode` CSS class applied across all tools; preference persisted in the `esl_app_theme` localStorage key (`"dark"` / `"light"`); toggle button in every tool's header
- **Mobile responsive design** — minimum 44px touch targets on all buttons and inputs at 600px and below; 768px layout breakpoints added across all tools
- **Toast notifications** — `showToast(msg)` utility function and `.toast#toast` element present in every tool
- Service worker bumped to cache version `v2`

---

## [1.0.0] — 2026-02-25

### Added

- **ESL Classroom Audit** (`ESL_Classroom_Audit/ESL_Classroom_Audit.html`) — 58-item classroom environment checklist across 13 sections (7 permanent, 6 rotating); 0–3 rating scale per item; max score 174; saves to `esl_audit_data` and `esl_audit_history`
- **Audit Dashboard** (`ESL_Classroom_Audit/Audit_Dashboard.html`) — Chart.js dashboard with 4 views: Score Trends (line chart + entries table), Section Breakdown (horizontal bar), Campus Comparison (grouped bar), Principles Compliance (stacked bar); date range, campus, and teacher filters
- **Walkthrough Planning Template** (`Academic_Monitoring_Leader_Facing/Academic_Monitoring_Planning_Template.html`) — interactive planning grid (6 row categories × N rounds), observation log with autocomplete, coaching follow-up tracker, session mini-dashboard, quick-code floating bar for mobile, look-for suggestion bank modal (7 categories including ELPS-aligned look-fors); saves to `walkthrough_plan_data_v2` and `walkthrough_history`
- **Walkthrough Dashboard** (`Academic_Monitoring_Leader_Facing/Walkthrough_Dashboard.html`) — Chart.js dashboard with 5 views: Code Distribution (doughnut), Teacher-Level Trends (bar/line), Focus Area Comparison (stacked bar), Coaching Pipeline (doughnut + lists), Campus-Level Trends (line/bar); printable report generation
- **Coaching Cycle Tracker** (`Academic_Monitoring_Leader_Facing/Coaching_Cycle_Tracker.html`) — 5-stage pipeline (Observation → Feedback → Action Step → Follow-Up → Growth); cycle board with expandable stage editors; import from walkthrough history; calendar export (ICS); saves to `coaching_cycles_data`
- **ESL Coordinator Scope & Sequence Tracker** (`ESL_Programming_Plans/ESL_Coordinator_Scope_Sequence.html`) — tracks 4 ESL coordinators across the 2026–2027 school year (Jul 2026 – Jun 2027); Interactive Tracker and Spreadsheet Reference views; saves to `esl_scope_data`
- **Teacher 360 Profile** (`Teacher_360_Profile.html`) — read-only aggregate view per teacher pulling from all localStorage data sources; summary stats, walkthrough fidelity trend chart (Chart.js), audit history, coaching pipeline visual, coaching actions table, merged chronological timeline; supports `?teacher=NAME` URL parameter
- **Unified Home Page** (`index.html`) — tool launcher grid with live status badges for all tools; global search across all localStorage data (teachers, campuses, observations, coaching actions); stats bar (audits, walkthroughs, roster size, coaching cycles); alerts for overdue actions and stalled cycles; recent activity feed merged from audit and walkthrough history
- **Data Backup Hub** (`Data_Backup_Hub.html`) — centralized export/import for all localStorage keys; single-file JSON backup download; file picker and paste import with per-key size preview and overwrite warnings; selective per-key export/import; danger-zone clear buttons with confirmation
- **PWA support** — root `manifest.json` (app name: "ESL Manager Suite") and `service-worker.js` (cache-first strategy, pre-caches all HTML files and Chart.js CDN); `<link rel="manifest">` and service worker registration present in every HTML file
- **Print support** — `@media print` CSS in every tool hides toolbars and formats content for paper output
