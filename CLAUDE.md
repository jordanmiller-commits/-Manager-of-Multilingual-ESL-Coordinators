# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Folder Structure

```
Manager_of_Multilingual_ESL_Coordinators/
├── index.html                              # Unified Home Page — tool launcher, search, activity hub
├── Team_Overview.html                      # Manager dashboard — aggregate all coordinator data via Drive Sync
├── Onboarding.html                         # 5-step setup wizard for new coordinators; ?gasUrl= param support
├── Teacher_360_Profile.html                # Aggregate teacher data across all tools (read-only)
├── Data_Backup_Hub.html                    # Centralized backup/restore + GitHub Gist + Google Drive sync
├── manifest.json                           # PWA manifest (app name: "ESL Manager Suite")
├── service-worker.js                       # PWA service worker v3 — offline caching for all tools
├── TODO.md                                 # Project to-do list (security, features, expansions)
├── ESL_Classroom_Audit/                    # ESL classroom environment audit
│   ├── ESL_Classroom_Audit.html
│   ├── Audit_Dashboard.html                # Chart.js audit trends dashboard
│   ├── manifest.json                       # Legacy audit-only PWA manifest
│   ├── service-worker.js                   # Legacy audit-only service worker
│   └── MLP Observation and Walkthrough Tool.docx
├── ESL_Programming_Plans/                  # ESL programming plans
│   ├── ESL_Coordinator_Scope_Sequence.html
│   └── Guiding_Documents/                  # Reference PDFs for ESL programming
│       ├── Addressing EB in the Classroom.pdf
│       ├── ESL Nonnegotiables (1).pdf
│       ├── ESL at Home Englishk-2.pdf
│       ├── Semester 1 YAG 25-26.pdf
│       ├── Semester 2 YAG 25-26.pdf
│       ├── Uplift ESL Program Model Design (1).pdf
│       └── breakout-englishelps.pdf
├── Academic_Monitoring_Leader_Facing/      # Leader walkthrough planning & dashboard
│   ├── Academic_Monitoring_Planning_Template.html
│   ├── Walkthrough_Dashboard.html
│   ├── Coaching_Cycle_Tracker.html
│   ├── Academic_Monitoring_Planning_Template.jpg
│   ├── Academic Monitoring Coaching Resources.jpg
│   └── Responding to Misconceptions In Realtime.jpg
├── Data_Analysis/                          # Data analysis & research
│   ├── build_research_doc.py
│   ├── Language Decline Research/
│   │   ├── EB_Language_Decline_Research_Compilation.docx
│   │   └── EB_Language_Decline_Research_Compilation.md
│   └── SPED_Time_Tracker/                  # SPED service time tracking utility
│       ├── build_tracker.py                # Generates SPED_Time_Tracker.xlsx via openpyxl
│       ├── SPED_Time_Tracker.xlsx          # Output workbook (9 sheets, 5 service types)
│       └── Social Skills Times.xlsx        # Input: student names
├── ELPS_Agent/                             # ELPS knowledge base Q&A tool
│   ├── ELPS_Agent.html
│   ├── CLAUDE.md                           # ELPS Agent architecture notes
│   ├── ELP 201 Teacher Toolkit Secondary.pdf
│   └── ELPS Summaries for Learning Objectives.pdf
├── google_apps_script/                     # Google Apps Script backend
│   └── Code.gs                             # GAS web app: Drive sync + email reminders + weekly trigger
├── Newcomer_Resources/                     # Newcomer ESL home resources
│   ├── ESL at Home English Weeks 5-8.pdf
│   └── ESL at Home English Weeks 9-12.pdf
├── Lesson_Planning/                        # Future lesson planning projects
└── CLAUDE.md
```

## Project Overview

A suite of single-file web applications for managing multilingual/ESL coordinators. All tools share the same conventions and localStorage-based data sharing. Hosted on GitHub Pages.

**Live URL**: `https://jordanmiller-commits.github.io/-Manager-of-Multilingual-ESL-Coordinators/`

**Coordinators** (as of 2026-02-26):
| ID | Name | Email |
|---|---|---|
| `jmiller` | J. Miller | jmiller@uplifteducation.org |
| `kpatterson` | K. Patterson | kpatterson@uplifteducation.org |
| `pokolo` | P. Okolo | Pokolo@uplifteducation.org |
| `vpalencia` | V. Palencia | vpalencia@uplifteducation.org |

## Development

Open any `.html` file directly in a browser. Changes take effect on reload. There are no build, lint, or test commands. No external dependencies except Chart.js CDN for dashboard files and PDF.js CDN for ELPS Agent.

## Key Conventions

- All JS uses `var` declarations and ES5-compatible syntax (no arrow functions, no `let`/`const`, no template literals).
- CSS is embedded in `<style>` in `<head>`. JS is in a single `<script>` block before `</body>`.
- Visual style: blue gradient header (`linear-gradient(135deg, #2c3e6e, #4a90d9)`), Segoe UI font, white cards with `border-radius:10px`, `#f0f2f7` background.
- Event handlers via inline `onclick` or closure-wrapped `addEventListener`.
- Persistence via browser `localStorage` with debounced auto-save.
- Dark mode: `body.dark-mode` class, persisted via `esl_app_theme` localStorage key, toggle button in every tool's header.
- PWA: Root `manifest.json` + `service-worker.js` (v3), registered from all HTML files.
- Print: `@media print` CSS in every tool hides toolbars and formats for paper.
- When bumping the service worker cache, increment `CACHE_NAME` (currently `"esl-suite-v3"`) and add any new HTML files to the `ASSETS` array.

## Cross-Tool Data Sharing

All tools share localStorage when served from the same origin (same directory on `file://` or same GitHub Pages domain).

| Key | Written By | Read By | Purpose |
|---|---|---|---|
| `esl_audit_data` | Audit | Audit, Backup Hub, Home | Current working audit |
| `esl_audit_history` | Audit | Audit, Audit Dashboard, Backup Hub, Home, Teacher 360 | Saved audit archive |
| `esl_audit_campuses` | Audit | Audit, Backup Hub | Campus name list |
| `walkthrough_plan_data_v2` | Planner | Planner, Backup Hub, Home | Current walkthrough session |
| `walkthrough_history` | Planner | Planner, Walk Dashboard, Coaching Tracker, Backup Hub, Home, Teacher 360 | Saved walkthrough archive |
| `esl_scope_data` | Scope & Seq | Scope & Seq, Backup Hub, Home | Coordinator tracking state |
| `shared_teacher_roster` | Planner (auto-harvest) | Planner, Coaching Tracker, Backup Hub, Teacher 360, Home | Teacher name autocomplete list |
| `coaching_cycles_data` | Coaching Tracker | Coaching Tracker, Backup Hub, Home, Teacher 360 | Coaching cycle state |
| `walkthrough_audit_handoff` | Planner (temp) | Audit (consumed on load) | Walkthrough → Audit pipeline context |
| `coaching_cycle_handoff` | Planner (temp) | Coaching Tracker (consumed on load) | Coaching action → new cycle pre-fill |
| `elps_agent_docs` | ELPS Agent | ELPS Agent, Backup Hub | ELPS document chunks |
| `elps_agent_index` | ELPS Agent | ELPS Agent | Inverted search index |
| `elps_agent_settings` | ELPS Agent | ELPS Agent | API key, model preference |
| `elps_agent_history` | ELPS Agent | ELPS Agent | Recent query history |
| `esl_app_theme` | All tools | All tools | Dark mode preference (`"dark"` / `"light"`) |
| `esl_gist_sync` | Backup Hub | Backup Hub | GitHub Gist PAT and Gist ID for cloud sync |
| `esl_gas_sync` | Backup Hub, Onboarding | Backup Hub, Team Overview, Onboarding | Drive sync URL, coordinator ID/name |
| `esl_onboarding_complete` | Onboarding | Onboarding | Checklist state `{step1:true, ...}` |

---

## Unified Home Page

`index.html` — Landing page that links all tools and shows cross-tool activity.

- **Global Search**: Search bar that searches across all localStorage data — teachers, campuses, observations, coaching actions
- **Stats bar**: Audits saved, walkthroughs, teachers in roster, coaching cycles
- **Tool grid**: Cards linking to each tool (11 total) with live status badges. Team Overview card shows Drive sync status.
- **Alerts**: Overdue coaching actions, stalled coaching cycles, high-score celebrations, onboarding nudges
- **Recent Activity**: Merged timeline from `esl_audit_history` and `walkthrough_history`, sorted by date
- **Header**: Data Backup Hub link + Setup Guide link + dark mode toggle

---

## Team Overview

`Team_Overview.html` — Manager dashboard aggregating all coordinator data via GAS `readAll` endpoint.

- **Settings card**: GAS Script URL input (reads/writes `esl_gas_sync`)
- **Stats row**: Total coordinators, total walkthroughs, active coaching cycles, last sync time
- **Coordinator cards**: One per coordinator with freshness color border (green <24h, yellow <7d, red >7d/never), walkthrough count, audit count, active cycle count
- **Aggregated Coaching Pipeline**: Badge row showing total cycles at each of 5 stages across all coordinators
- **Walkthrough Activity chart**: Chart.js bar chart — coordinator names on X, walkthrough count on Y
- **Send Reminders button**: POSTs `{action:"sendReminders", coordinators:[...]}` to GAS

---

## Onboarding Guide

`Onboarding.html` — 5-step setup wizard for new coordinators.

- **URL param**: `?gasUrl=URL` pre-fills Script URL — manager distributes the link with this baked in
- **Steps**: (1) Suite overview + URL display, (2) PWA install instructions, (3) Coordinator ID/name form → writes `esl_gas_sync`, (4) Drive sync instructions, (5) Calendar export instructions
- **Checklist**: Progress bar + per-step checkboxes persisted in `esl_onboarding_complete`
- **Coordinator setup form** (`saveCoordSetup()`): validates ID/name, writes `esl_gas_sync`, marks step 3 complete

---

## Cross-Tool Navigation

All tools participate in a shared deep-link system:

- **Teacher profile links**: Wherever teacher names appear in tables, they render as `<a class="teacher-link">` linking to `Teacher_360_Profile.html?teacher=NAME`
- **`?teacher=NAME` URL param**: Supported by Teacher 360 (auto-selects), Walkthrough Dashboard (auto-switches to Teacher Trends view + filters), Coaching Cycle Tracker (auto-filters + breadcrumb)
- **Coaching handoff pipeline**: Planning Template coaching rows have a 💬 button (`startCycleFromAction()`) that writes `coaching_cycle_handoff` to localStorage and opens Coaching Cycle Tracker. On load, `checkHandoff()` consumes the key and pre-fills the new cycle modal.
- **`teacherProfileLink(name)`**: Utility function present in all tools that renders a teacher name as a profile link. Path is relative (`../Teacher_360_Profile.html`) for tools in subdirectories.
- **Toast notifications**: `showToast(msg)` + `.toast#toast` element present in all tools.

---

## Classroom Environment Audit

`ESL_Classroom_Audit/ESL_Classroom_Audit.html` — 58-item checklist across 13 sections (7 permanent, 6 rotating) evaluating language-forward classrooms. Rating scale 0-3, max score 174.

### Walkthrough → Audit Pipeline

After saving a walkthrough to history, the planner offers to open the audit tool with context pre-loaded:
- Planner writes `walkthrough_audit_handoff` to localStorage (campus, observer, date, observations)
- Audit consumes and removes the handoff key on load, pre-filling metadata and observation reference notes in section s01

### Persistence

| Key | Purpose |
|---|---|
| `esl_audit_data` | Current audit state |
| `esl_audit_history` | Saved audit archive (each entry includes `scorePct`, `meta`, `ratings`, `notes`, `prChecks`) |
| `esl_audit_campuses` | Campus name list |

---

## Audit Dashboard

`ESL_Classroom_Audit/Audit_Dashboard.html` — Chart.js dashboard reading `esl_audit_history`.

### Views (4 total)

| View | Chart Type | Filters |
|---|---|---|
| Score Trends | Line + Entries Table | Date range, Campus, Teacher |
| Section Breakdown | Horizontal Bar | Date range, Campus |
| Campus Comparison | Grouped Bar | Date range |
| Principles Compliance | Stacked Bar | Date range, Campus |

The **Score Trends** view also renders an **Audit Entries table** below the chart (Date, Teacher → profile link, Campus, Score %, Level pill). Hidden for other views.

---

## ESL Coordinator Scope & Sequence Tool

`ESL_Programming_Plans/ESL_Coordinator_Scope_Sequence.html` — Tracks 4 ESL coordinators across the 2026-2027 school year (Jul 2026 – Jun 2027). Two views: Interactive Tracker and Spreadsheet Reference.

### Persistence

| Key | Purpose |
|---|---|
| `esl_scope_data` | Full state (checks, notes, coordinator config, quarter topics, view/filter state) |

---

## Classroom Walkthrough Planning Template

`Academic_Monitoring_Leader_Facing/Academic_Monitoring_Planning_Template.html` — Interactive walkthrough planning tool for campus leaders.

### Data Model

- **`ROUND_TYPES`** array (3): Procedural (blue), Conceptual (purple), Engagement (green).
- **`ROW_CONFIG`** array (6): Target Teachers, Date/Time, Look-For, Evidence Code, Gaps, Response.
- **`SUGGESTION_BANK`** array (7 categories): CFU, Discourse, Scaffolding, Engagement, Rigor, ESL, ELPS Alignment (Cross-Linguistic) — last category maps to specific ELPS standards (1A, 1C, 2C/2D, 2I, 3E/3F, 3G, 4F/4G, 5B/5F, 5G).

### Persistence

| Key | Purpose |
|---|---|
| `walkthrough_plan_data_v2` | Current session state |
| `walkthrough_history` | Saved walkthrough snapshots |
| `shared_teacher_roster` | Auto-harvested teacher names for autocomplete |

### UI Structure

1. **Planning Grid** (table): Rows = 6 planning categories, Columns = walkthrough rounds + optional example.
2. **Observation Log** (collapsible): Round, teacher (with autocomplete), code, notes, time.
3. **Coaching Follow-Up Tracker** (collapsible): Teacher (with autocomplete), observation, feedback, next step, deadline, status.
4. **Session Mini-Dashboard** (collapsible): Live code distribution bar + coaching pipeline badges.
5. **Post-Walkthrough Reflection** (collapsible): Patterns, actions, signature.
6. **Look-For Suggestion Bank** (modal): 7 categories including ELPS-aligned look-fors.
7. **History Modal**: Filterable saved walkthrough list with load/delete.
8. **Quick-Code Floating Bar**: Fixed bottom bar for fast mobile observation entry — round selector, teacher autocomplete, code buttons, notes, auto-timestamped. Toggle via toolbar button.

### Key Function Groups

- **Grid**: `renderGrid()`, `addRound()`, `removeLastRound()`, `removeRound()`, `toggleExample()`.
- **Observations**: `renderObservations()`, `addObservation()`, `removeObservation()`.
- **Coaching**: `renderCoaching()`, `addCoachingAction()`, `removeCoachingAction()`.
- **Metrics**: `computeMetrics()`, `renderMiniDash()` — hooked into observation/coaching renders.
- **History**: `saveToWalkthroughHistory()`, `getWalkthroughHistory()`, `renderHistoryList()`, `loadFromWalkthroughHistory()`, `deleteFromWalkthroughHistory()`.
- **Roster**: `getRoster()`, `saveRoster()`, `addToRoster()`, `harvestTeachers()`, `showAutocomplete()`, `pickAutocomplete()`.
- **Quick-Code**: `toggleQuickCode()`, `selectQCCode()`, `submitQuickCode()`, `updateQCRounds()`.
- **Pipeline**: `launchAuditFollowUp()` — writes `walkthrough_audit_handoff` and opens audit tool. `startCycleFromAction(idx)` — writes `coaching_cycle_handoff` and opens Coaching Cycle Tracker.
- **Calendar Export**: `exportCalendar()` — generates RFC 5545 `.ics` file with one VEVENT per round. Helpers: `icsEscape()`, `icsFold()`, `parseTimeFromText()`, `parseEndTimeFromText()`, `formatIcsDate()`. Time parsed from dateTime cell; defaults to 8AM if unparseable.
- **Print/Export**: `printFilled()`, `printBlank()`, `exportData()`, `confirmImport()`, `confirmReset()`.

---

## Walkthrough Data Dashboard

`Academic_Monitoring_Leader_Facing/Walkthrough_Dashboard.html` — Chart.js dashboard reading `walkthrough_history` (never writes).

### Views (5 total)

| View | Chart Type | Filters |
|---|---|---|
| Code Distribution | Doughnut | Date range, Campus, Focus Area |
| Teacher-Level Trends | Bar/Line | Teacher, Date range, Campus |
| Focus Area Comparison | Stacked Bar | Date range, Campus |
| Coaching Pipeline | Doughnut + lists | Date range, Campus |
| Campus-Level Trends | Line/Bar | Campus, Date range |

### Report Generation

"Generate Report" button produces a print-optimized overlay with:
- Summary stats (sessions, observations, avg fidelity, coaching actions)
- Code distribution table with percentage bars
- Coaching pipeline breakdown
- Session detail table (date, leader, campus, focus, observations, fidelity)
- Teacher fidelity summary sorted by fidelity %
- Print/Save PDF button using `window.print()`

---

## Coaching Cycle Tracker

`Academic_Monitoring_Leader_Facing/Coaching_Cycle_Tracker.html` — Tracks full coaching cycles through 5 stages: Observation → Feedback → Action Step → Follow-Up → Growth.

### Persistence

| Key | Purpose |
|---|---|
| `coaching_cycles_data` | `{version, savedAt, cycles, settings}` |

Each cycle: `{id, teacher, campus, createdAt, stages (5 objects with status/date/notes), sourceWalkthroughId}`

### Features

- **Import from Walkthroughs**: Scans `walkthrough_history` for coaching actions, imports as cycle starting points
- **Cycle Board**: Cards with 5-stage visual pipeline (color-coded dots + progress bar), expandable stage editors. Teacher name links to Teacher 360 Profile. "Dashboard" badge links to Walkthrough Dashboard filtered by that teacher.
- **Filter bar**: Teacher text search, campus dropdown, status (All/Active/Completed)
- **Stats row**: Active cycles, completed, avg days, teachers in coaching
- **Shared roster**: Reads `shared_teacher_roster` for teacher autocomplete
- **Calendar Export**: Downloads `.ics` file with coaching deadlines for Outlook/Google Calendar
- **Coaching handoff**: `checkHandoff()` on init reads `coaching_cycle_handoff` key written by Planning Template, pre-fills new cycle modal
- **URL param**: `?teacher=NAME` auto-filters the board and shows breadcrumb

---

## Data Backup Hub

`Data_Backup_Hub.html` — Centralized export/import for ALL localStorage data across all tools.

### Features

- **Status dashboard**: Card per key showing tool name, status (Has Data/Empty), item count, data size
- **Export All**: Downloads single JSON with all keys as `ESL_Tools_Backup_YYYY-MM-DD.json`
- **Import All**: File picker + paste, preview with per-key sizes and overwrite warnings
- **Selective export/import**: Per-key checkboxes
- **Clear individual keys**: Danger button with confirmation
- **GitHub Gist Cloud Sync**: Push/pull all data to a private GitHub Gist for cross-device sync. Requires a GitHub Personal Access Token with `gist` scope. Settings stored in `esl_gist_sync` localStorage key.
- **Google Drive Sync**: Push/pull per-coordinator data to Google Drive via the `google_apps_script/Code.gs` web app. Settings (Script URL, Coordinator ID, Display Name) stored in `esl_gas_sync` localStorage key.
- **Import validation**: `IMPORT_VALIDATORS` map validates data structure before writing to localStorage; invalid keys are skipped and reported.

Manages all keys listed in the Cross-Tool Data Sharing table above.

---

## Google Apps Script — Drive Sync Backend

`google_apps_script/Code.gs` — GAS web app deployed from script.google.com. Stores each coordinator's data as a JSON file in a shared Google Drive folder.

- **Folder**: hardcoded `FOLDER_ID = '1FvxiBn6-SmLa2RKXWXdE7DMufwm0tOVo'`
- **File naming**: `{coordinatorId}_data.json` per coordinator
- **Coordinator emails**: `COORDINATOR_EMAIL_MAP` — keyed by coordinatorId, values are email addresses
- **Reminder thresholds**: `OVERDUE_DAYS = 7`, `STALLED_DAYS = 14`
- **App URL**: `APP_URL` — used in reminder email body links
- **Endpoints (GET)**: `action=status`, `action=read&coordinatorId=X`, `action=readAll`, `action=list`, `action=readKey&coordinatorId=X&key=K`
- **Endpoints (POST body)**: `action=sync`, `action=syncKey`, `action=delete`, `action=sendReminders`
- **Email reminder functions**: `sendReminderEmails()`, `findOverdueCycles()`, `findStalledCycles()`, `buildReminderEmail()`, `currentStageLabel()`, `latestStageDate()`, `isCycleCompleteGAS()`
- **Trigger**: `createWeeklyTrigger()` installs Monday 7AM `weeklyReminderJob()` — run once manually from script editor
- **Frontend**: Integrated in Data Backup Hub (Drive Sync section) and Team Overview

---

## ELPS Knowledge Base Agent

`ELPS_Agent/ELPS_Agent.html` — PDF search + optional AI Q&A for ELPS documents using PDF.js CDN. Full-text search with inverted index, ELPS code detection, and optional Anthropic API integration for RAG-lite Q&A.

### Persistence

| Key | Purpose |
|---|---|
| `elps_agent_docs` | Document records with extracted text chunks |
| `elps_agent_index` | Inverted search index |
| `elps_agent_settings` | API key, model preference |
| `elps_agent_history` | Recent query history |

---

## PWA & Offline Support

Root-level `manifest.json` and `service-worker.js` (v3) enable install-to-home-screen and offline access.

- **App name**: ESL Manager Suite
- **Cache version**: `esl-suite-v3` — bump to v4 when adding new HTML files
- **Cache strategy**: Cache-first with network fallback. All HTML files and Chart.js CDN pre-cached on install.
- **Registration**: Every HTML file registers the root service worker via `navigator.serviceWorker.register()`.
- **Manifest link**: Every HTML file includes `<link rel="manifest">` pointing to root manifest.

---

## Dark Mode

All tools support dark mode via a shared system:

- **CSS class**: `body.dark-mode` with override styles per tool
- **Persistence**: `esl_app_theme` localStorage key (`"dark"` / `"light"`)
- **Toggle**: Button in every tool's header toolbar
- **ESL Classroom Audit**: Uses CSS custom properties (`body.dark`) with its own `esl_audit_dark_mode` key, but also syncs with `esl_app_theme`
- **ELPS Agent**: Uses CSS custom properties (`body.dark`) with its own dark mode system
