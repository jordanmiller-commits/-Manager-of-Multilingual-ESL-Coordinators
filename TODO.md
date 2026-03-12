# MLP Coordinator Hub — Project TODO

Last updated: 2026-03-10

---

## 🔒 Security Hardening — Remaining Items

- [x] **[CRITICAL] Add shared API secret to Code.gs** — Completed v5.0.0. `SHARED_SECRET` constant validates every GET/POST. Distributed via `?secret=` onboarding URL param.
- [x] **[CRITICAL] Verify Google Drive folder permissions** — Folder `1HpYZoIgwbr0iZL6pnntBZw648--us9BG` created and owned by script account. Verify via Drive → folder → Share that no extra accounts have access.
- [x] **[HIGH] GAS input validation** — `sanitizeCoordId()` added in v5.0.0; strips non-alphanumeric chars, enforces 50-char max on all incoming `coordinatorId` values.
- [ ] **[HIGH] GitHub PAT stored in plaintext** — `esl_gist_sync` stores the Gist PAT in localStorage. Add a "Clear PAT" button to Data Backup Hub. Warn users to use a fine-grained PAT scoped to `gist` only.
- [ ] **[MEDIUM] Content Security Policy** — Add `<meta http-equiv="Content-Security-Policy">` to all HTML files.
- [ ] **[MEDIUM] GAS audit logging** — Log every write operation (timestamp, coordinatorId, action, payload size) to a Google Sheet.
- [ ] **[MEDIUM] Enable GitHub secret scanning** — Repo Settings → Code security → Secret scanning (separate from the Actions workflow already on disk).
- [ ] **[LOW] Encrypt sensitive localStorage keys** — SubtleCrypto AES-GCM for coaching notes and student-adjacent data.
- [ ] **[LOW] GAS rate limiting** — CacheService throttle per coordinatorId (~30 req/min).

---

## 🔧 Infrastructure

- [ ] **Push GitHub Actions secret scan workflow** — File exists at `.github/workflows/secret-scan.yml` but was blocked from pushing (requires `workflow` PAT scope). Two options:
  - **Option A**: GitHub → Settings → Developer Settings → PAT → edit → check `workflow` → save → `git add .github/workflows/secret-scan.yml && git commit -m "Add secret scan workflow" && git push origin master`
  - **Option B**: GitHub web UI → repo → Add file → paste path `.github/workflows/secret-scan.yml` → paste contents from local file → commit

---

## 🚀 GAS — Next Steps After Coordinator Rollout

- [ ] **Redeploy Code.gs** — v5.0.0 adds `SHARED_SECRET` and `sanitizeCoordId()`. Must create a new deployment version in Apps Script editor (Deploy → Manage Deployments → Edit → New version → Deploy) for changes to take effect on the live endpoint.
- [ ] **Re-run your J. Miller onboarding link** — Your current `esl_gas_sync` was set before the secret was added. Re-open your personalized onboarding link (with `?secret=...`) to store the secret in your browser, or manually open DevTools → Application → Local Storage and add `"secret": "fe50135497f480b9dfa7e3f4cc79c6e6e5383236"` to the `esl_gas_sync` object.
- [ ] **Send coordinator onboarding links** — Updated links now include `&secret=fe50135497f480b9dfa7e3f4cc79c6e6e5383236` appended.

---

## 🔴 HIGH IMPACT — New Features

### 1. Reporting & Analytics Hub
Unified cross-tool reporting tool for end-of-semester/year summaries.
- [x] Build `Reports_Hub.html` (1,198 lines) — 4 report types with tabbed navigation
- [x] **Semester Overview**: 6 stat cards, activity timeline chart, coaching pipeline, PD hours by category, compliance status, goal progress
- [x] **Coordinator Comparison**: per-coordinator metric cards, grouped bar chart, walkthrough distribution doughnut, PD hours cross-table
- [x] **Campus Summary**: campus pill selector, campus metrics, audit score trend chart, teacher coverage table, action items
- [x] **Coaching Effectiveness**: pipeline funnel with conversion rates, cycle duration, stalled cycles table, coach load, coached vs non-coached comparison
- [x] Pull data from 7 localStorage keys: `walkthrough_history`, `esl_audit_history`, `coaching_cycles_data`, `pd_tracker_data`, `compliance_checklist_data`, `goal_setting_data`, `calibration_sessions`
- [x] Date range, coordinator, and campus filters with dynamic campus list
- [x] CSV export per report section
- [x] Print CSS with page breaks between sections
- [x] Add tool card to `index.html` (manager role), `service-worker.js` (cache v4)

### 2. Observation Calibration Tool
Scoring consistency tool for coordinator inter-rater reliability.
- [x] Build `Calibration_Tool.html` (992 lines) — root-level tool
- [x] Independent scoring mode: coordinator selector, score pills (0-3), blind rating
- [x] Item selection: all 13 audit sections with checkboxes, quick-select (Permanent/Rotating/Random 10)
- [x] Comparison/reveal view: agreement summary, item-by-item table with color-coded rows
- [x] Discussion Items section: items with spread >= 2 highlighted prominently
- [x] Coordinator average comparison with bar visualization
- [x] Track calibration sessions over time (localStorage key: `calibration_sessions`)
- [x] "Log as PD Session" button writes to `pd_tracker_data` in "Data Literacy/Assessment" category
- [x] History tab with expandable past sessions and CSV export
- [x] Add to `index.html` (manager,coordinator role), `service-worker.js` (cache v3)

### 3. Student Growth Dashboards
Link student outcomes (TELPAS) to teacher/coordinator/campus interventions.
- [ ] Build `Student_Growth.html` or extend `TELPAS_Tracker.html` with a "Growth Analysis" tab
- [ ] Join `telpas_tracker_data` records with `walkthrough_history` and `coaching_cycles_data` by teacher/campus
- [ ] Visualize: students whose teachers received more coaching cycles → did TELPAS scores improve?
- [ ] Campus-level growth summary: avg composite change, % declining, % advancing
- [ ] Coordinator-level growth: which coordinator's campuses show most growth?
- [ ] FERPA: keep all student data local only — no Drive sync
- [ ] Add to `index.html`, `service-worker.js`

### 4. Campus Snapshot / Report Card
One-page campus summary for principals.
- [x] Build `Campus_Report_Card.html` — `Principal_Checkpoint_Portal/Campus_Report_Card.html`
- [x] Sections: health score gauge, walkthrough activity + coverage, coaching pipeline, audit summary, coordinator activity, weekly action items
- [x] Campus configured via setup card (shares `principal_checkpoint_config`)
- [x] Printable layout — designed for principals to print and share
- [x] Color-coded status indicators (green/yellow/red) for each metric
- [x] Add to `index.html` with `data-roles="manager,campus-leader"`
- [x] Add to `service-worker.js` + bump CACHE_NAME to v2

---

## 🟡 MEDIUM IMPACT — Enhancements

### 5. Notification Center
Persistent cross-tool notification inbox.
- [ ] Add bell icon to shared header pattern across all tools
- [ ] Notification types: stale data warnings, stalled coaching cycles, approaching PD hour deadlines, compliance due dates, TELPAS decline alerts
- [ ] localStorage key: `notification_center_data`
- [ ] Badge count on bell icon
- [ ] Notification drawer/panel (slide-out or dropdown)
- [ ] Mark as read / dismiss / snooze functionality
- [ ] Each tool writes notifications on save when conditions are met

### 6. Data Visualization Upgrades
Enhance existing dashboards with new chart types.
- [ ] **Heatmap**: walkthrough coverage grid (weeks × teachers) — which teachers haven't been visited?
  - Add to `Walkthrough_Dashboard.html` as a 6th view
- [ ] **Radar charts**: audit section scores per campus — visual strengths/weaknesses
  - Add to `Audit_Dashboard.html` as a 5th view
- [ ] **Sparklines**: tiny trend charts on home page tool cards (replace static badge counts)
  - Update `index.html` `loadExtraMeta()` function
- [ ] **Gauge charts**: PD hour progress toward annual target
  - Add to `PD_Tracker.html`

### 7. Bulk CSV Import Across Tools
Extend CSV import from Student Roster pattern to other tools.
- [x] `PD_Tracker.html` — import PD session history from district spreadsheets (auto-resolves coordinator names to IDs)
- [x] `Parent_Communication_Log.html` — import parent contact records (header normalization handles spaces)
- [x] `TELPAS_Tracker.html` — already had import (duplicate detection by firstName+lastName+schoolYear+campus)
- [ ] `Compliance_Checklist.html` — import checklist item definitions
- [x] CSV parsing utility (parseCsv/parseCsvLine with quoted field support) added to each tool
- [x] Student Roster + TELPAS use merge/replace mode; PD + Parent Comm add all as new (no natural dedup key)

### 8. Templates & Cloning Library
Shareable template system for checklists, meeting agendas, compliance items.
- [ ] Template export: save current Compliance Checklist items / Meeting Notes template as shareable JSON
- [ ] Template import: load a template JSON to pre-populate a tool
- [ ] Semester rollover: "Clone from last semester" for Compliance Checklist, Goal Setting, Scope & Sequence
- [ ] Optional: share templates via Gist (extend existing Gist sync)

---

## 🟢 STRATEGIC — Longer Term

### 9. Coordinator Self-Assessment & 360 Feedback
Formalized growth reflection tool for coordinators.
- [ ] Build `Self_Assessment.html`
- [ ] Assessment domains aligned to PD categories (ELPS, sheltered instruction, coaching, data literacy, newcomer, bilingual, family engagement, edtech)
- [ ] 1–4 rubric per domain with descriptors
- [ ] Coordinator self-rates, manager rates independently
- [ ] Comparison view: self vs. manager ratings with gap analysis
- [ ] Link to Goal Setting — assessment informs next semester's goals
- [ ] Track assessments over time (semester-over-semester growth)
- [ ] localStorage key: `coordinator_self_assessments`

### 10. Multi-Year Data & Archiving
Year-over-year data management strategy.
- [ ] Archive function: snapshot current year's data with year tag
- [ ] Fresh start: clear current-year keys while preserving archive
- [ ] Archive viewer: read-only access to prior year data
- [ ] Drive sync: year-tagged folders in GAS (`2025-26/`, `2026-27/`)
- [ ] Multi-year trend charts in Reporting Hub
- [ ] Migration script for localStorage key versioning

### 11. Offline-First Sync Queue
Reliable sync for poor-connectivity environments.
- [ ] Sync queue in localStorage: pending operations saved when offline
- [ ] Service worker `sync` event listener for background sync
- [ ] Conflict resolution: last-write-wins with conflict log
- [ ] Visual indicator: "Pending sync" badge when queue is non-empty
- [ ] Retry logic with exponential backoff
- [ ] Update `Data_Backup_Hub.html` to show sync queue status

### 12. Parent-Facing Portal
Lightweight read-only portal for families.
- [ ] Build `Parent_Portal.html`
- [ ] Student lookup by name (no login — FERPA considerations for access control)
- [ ] Show: ESL program type, coordinator contact, upcoming events, resources
- [ ] Link to Newcomer_Resources PDFs
- [ ] Multi-language support (at minimum English/Spanish)
- [ ] Separate from main tool suite — different `data-roles` or standalone page
- [ ] FERPA review: determine what can be shown without authentication

---

## ⚡ QUICK WINS (< 1 session each)

- [ ] **Export to PDF button** — Add `window.print()` button to tools that have print CSS but no explicit button
- [ ] **Keyboard shortcuts** — `Ctrl+N` new entry, `Ctrl+S` force save, `/` focus search; add help overlay (`?` key)
- [ ] **Data health dashboard** — Section in Data Backup Hub showing localStorage usage per key, last-modified timestamps, 5MB limit warning
- [ ] **Duplicate detection** — Flag students with similar names across campuses in Student Roster and TELPAS Tracker
- [ ] **"Last saved" timestamp** — Visible footer in each tool showing when data was last written to localStorage

---

## ✅ Completed

**Core Suite (v1.0.0)**
- [x] Classroom Environment Audit (58-item, 13 sections, 0–3 scale, max 174)
- [x] Audit Dashboard (4 chart views + entries table with teacher profile links)
- [x] Walkthrough Planning Template (planning grid, obs log, coaching tracker, quick-code bar, look-for bank, ICS calendar export)
- [x] Walkthrough Dashboard (5 views + generated PDF report)
- [x] Coaching Cycle Tracker (5-stage pipeline, import from walkthroughs, ICS export, `?teacher=` param)
- [x] MLP Coordinator Scope & Sequence Tracker (2026–27, 4 coordinators)
- [x] Teacher 360 Profile (`?teacher=` deep-link, cross-tool aggregate)
- [x] Unified Home Page (global search, stats, alerts, activity feed, 3 role tabs)
- [x] Data Backup Hub (export/import all localStorage, GitHub Gist sync, Drive sync, import validation)
- [x] PWA support (manifest.json + service-worker.js)
- [x] Dark mode across all tools
- [x] Mobile responsive

**Cross-Tool Integration (v2.0.0)**
- [x] Teacher deep-link navigation + `?teacher=` URL param
- [x] Coaching handoff pipeline (Planning → Coaching Tracker)
- [x] Walkthrough → Audit pipeline
- [x] Google Drive Sync via GAS web app

**Team Features & Expansion (v3.0.0 / v4.0.0)**
- [x] Team Overview dashboard
- [x] Onboarding wizard (`?gasUrl=`, `?coordId=`, `?coordName=`, `?secret=` params)
- [x] Email reminder system (weekly Monday 7AM trigger)
- [x] Coordinator Workload, PD Tracker, Meeting Notes, Parent Comm Log, Compliance Checklist, Goal Setting, Student Roster, TELPAS Tracker
- [x] Principal Checkpoint Portal (campus-leader role view)
- [x] 3-role home page (Manager / MLP Coordinator / Campus Leader)

**Rebrand & Security (v5.0.0 — 2026-03-02)**
- [x] Full ESL → MLP rebrand across all 19 tools
- [x] API secret (`SHARED_SECRET`) in Code.gs
- [x] `sanitizeCoordId()` in Code.gs
- [x] Secret propagation to all GAS callers
- [x] Personalized onboarding URLs with `coordId`, `coordName`, `secret` params
- [x] Google Drive folder + GAS deployment live
