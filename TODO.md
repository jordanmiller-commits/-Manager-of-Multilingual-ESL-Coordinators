# ESL Manager Suite — Project TODO

Last updated: 2026-02-26 (updated after major expansion build)

---

## 🔒 Security Hardening

> Discussed 2026-02-26. Items ranked by impact. See conversation history for full details.

- [ ] **[CRITICAL] Add shared API secret to Code.gs** — Any user with the Script URL can currently read all coordinator data via `?action=readAll`. Add a `SHARED_SECRET` constant to `Code.gs` and validate it on every `doGet`/`doPost` request. Store the secret alongside the URL in `esl_gas_sync`.
- [ ] **[CRITICAL] Verify Google Drive folder permissions** — Confirm folder `1FvxiBn6-SmLa2RKXWXdE7DMufwm0tOVo` is shared only with the script owner (not broadly). Coordinators need no direct Drive access.
- [ ] **[HIGH] GitHub PAT stored in plaintext** — `esl_gist_sync` stores the Gist PAT in localStorage. Add a "Clear PAT" button to Data Backup Hub. Warn users to use a fine-grained PAT scoped to Gist only.
- [ ] **[HIGH] GAS input validation** — Sanitize `coordinatorId` (alphanumeric only, block `../` path traversal). Reject payloads over 5MB.
- [ ] **[MEDIUM] Content Security Policy** — Add `<meta http-equiv="Content-Security-Policy">` to all HTML files to block XSS injection vectors.
- [ ] **[MEDIUM] GAS audit logging** — Log every write operation (timestamp, coordinatorId, action, payload size) to a Google Sheet for visibility into unexpected activity.
- [ ] **[MEDIUM] GitHub secrets scanning** — Enable under Settings → Code security → Secret scanning. Ensure no Script URLs, PATs, or folder IDs are ever committed.
- [ ] **[LOW] Encrypt sensitive localStorage keys** — Use `SubtleCrypto` AES-GCM to encrypt coaching notes and student-adjacent data at rest. Requires user passphrase.
- [ ] **[LOW] GAS rate limiting** — Use `CacheService` to throttle requests per coordinatorId (e.g., max 30 req/min). Prevents accidental or intentional data flooding.

---

## 🐛 Known Issues / Polish

- [x] Planning Template calendar export: warns which round numbers had no date rather than silently using today
- [x] Team Overview "Send Reminders" — tooltip + help text added explaining COORDINATOR_EMAIL_MAP requirement
- [x] Onboarding Step 3: coordinator ID now strips spaces and lowercases automatically with toast feedback
- [x] service-worker.js: bumped to v4 with all new HTML files in ASSETS
- [x] `Coordinator_Workload.html` — built

---

## 🚀 High-Value Expansions

- [x] **Coordinator Workload Dashboard** (`Coordinator_Workload.html`) — campus assignment panel, per-coordinator stats, workload balance chart, recent activity pills
- [x] **TELPAS Tracker** (`TELPAS_Tracker.html`) — CSV import, composite + domain levels, growth tracking table, language decline alert, proficiency distribution chart, FERPA banner
- [x] **Student Roster** (`Student_Roster.html`) — FERPA-safe localStorage only, CRUD, proficiency/program/grade filters, CSV import/export, doughnut chart
- [x] **PD Tracker** (`PD_Tracker.html`) — 8 categories (ELPS, Sheltered Instruction, Coaching, Data Literacy, Newcomer/SIFE, Bilingual, Family Engagement, EdTech), session log, hour targets, two Chart.js views, CSV export
- [x] **Meeting Notes** (`Meeting_Notes.html`) — 4 meeting templates, split-pane editor + archive, agenda + action items, search, auto-save, export to Coaching Tracker
- [x] **Parent Communication Log** (`Parent_Communication_Log.html`) — configurable contact types + languages, searchable log, stats, paginated table, CSV export
- [x] **Compliance Checklist** (`Compliance_Checklist.html`) — custom items by category, per-campus per-semester tracking, notes + completed-by fields, campus summary cards, cross-campus report
- [x] **Goal-Setting & Growth Planning** (`Goal_Setting.html`) — shared manager+coordinator goals, action step checklists, mid/end-semester check-ins (1-4 rating), walkthrough fidelity + coaching cycle connections

---

## 🔧 Infrastructure / Developer Experience

- [x] `CHANGELOG.md` — created with full version history (v1.0.0 → v3.0.0)
- [ ] Modern JS migration (ES5 → const/let/arrow functions) — **deferred by choice**, keeping ES5 for stability
- [x] Test data generator — `Academic_Monitoring_Leader_Facing/test-data-generator.js`; run `generateTestData()` in browser console; generates 15 walkthroughs, 8 coaching cycles, 5 audits, 8-teacher roster
- [x] GitHub Actions secret scan — `.github/workflows/secret-scan.yml`; checks for GAS URLs, GitHub PATs, Drive folder IDs on every push/PR
- [x] GAS deployment guide — `google_apps_script/README.md`; covers initial deploy, redeployment, all endpoints, troubleshooting

---

## 🔒 Security Hardening (still pending — next priority)

- [ ] **[CRITICAL] Add shared API secret to Code.gs** — validate on every doGet/doPost
- [ ] **[CRITICAL] Verify Google Drive folder permissions** — folder should be owner-only
- [ ] **[HIGH] GitHub PAT stored in plaintext** — add "Clear PAT" button to Data Backup Hub; warn about fine-grained PAT scope
- [ ] **[HIGH] GAS input validation** — sanitize coordinatorId, reject payloads >5MB
- [ ] **[MEDIUM] Content Security Policy** — add CSP meta tags to all HTML files
- [ ] **[MEDIUM] GAS audit logging** — log writes to a Google Sheet
- [ ] **[MEDIUM] GitHub secrets scanning** — enable in repo Settings → Code security (separate from the Actions workflow)
- [ ] **[LOW] Encrypt sensitive localStorage keys** — SubtleCrypto AES-GCM
- [ ] **[LOW] GAS rate limiting** — CacheService throttle per coordinatorId

---

## ✅ Completed

- [x] Unified Home Page (`index.html`) with global search, stats, alerts, activity feed
- [x] Teacher 360 Profile with `?teacher=` deep-link support
- [x] Cross-tool navigation (teacher links, URL params, breadcrumbs)
- [x] Coaching handoff pipeline (Planning Template → Coaching Tracker via localStorage)
- [x] Walkthrough → Audit pipeline (handoff key with campus/observer pre-fill)
- [x] Google Drive Sync via GAS web app (`Code.gs`)
- [x] GitHub Gist cloud sync in Data Backup Hub
- [x] Import validation (`IMPORT_VALIDATORS`) in Data Backup Hub
- [x] PWA support (manifest + service worker, v3)
- [x] Dark mode across all tools
- [x] Mobile responsive (44px touch targets, 768px/600px breakpoints)
- [x] Calendar export (ICS) from Planning Template (`exportCalendar()`)
- [x] Team Overview dashboard (`Team_Overview.html`)
- [x] Onboarding guide (`Onboarding.html`) with `?gasUrl=` param
- [x] Email reminder system in Code.gs (`sendReminderEmails`, `weeklyReminderJob`)
- [x] Weekly Monday 7AM trigger (`createWeeklyTrigger()`) — deployed 2026-02-26
- [x] Coordinator email map populated (jmiller, kpatterson, pokolo, vpalencia)
- [x] SPED Time Tracker Excel workbook (`Data_Analysis/SPED_Time_Tracker/`)
- [x] ELPS Knowledge Base Agent with PDF.js + optional Anthropic API
- [x] Calendar export warning when no date found in Date/Time cell (Planning Template)
- [x] Team Overview Send Reminders — tooltip + help text for COORDINATOR_EMAIL_MAP
- [x] Onboarding coordinator ID — strips spaces + lowercases automatically
- [x] service-worker.js bumped to v4 with all new HTML files cached
- [x] Coordinator Workload Dashboard (`Coordinator_Workload.html`)
- [x] PD Tracker (`PD_Tracker.html`) — 8 categories, Chart.js, hour targets, CSV export
- [x] Meeting Notes (`Meeting_Notes.html`) — 4 templates, archive, action items → Coaching Tracker
- [x] Parent Communication Log (`Parent_Communication_Log.html`) — configurable types/languages
- [x] Compliance Checklist (`Compliance_Checklist.html`) — custom items, per-campus report
- [x] Goal-Setting & Growth Planning (`Goal_Setting.html`) — shared goals, check-ins, evidence
- [x] Student Roster (`Student_Roster.html`) — FERPA-safe, CSV import/export, doughnut chart
- [x] TELPAS Tracker (`TELPAS_Tracker.html`) — CSV import, growth tracking, decline alerts
- [x] CHANGELOG.md — full version history v1.0.0 → v3.0.0
- [x] GitHub Actions secret scan (`.github/workflows/secret-scan.yml`)
- [x] GAS deployment guide (`google_apps_script/README.md`)
- [x] Test data generator (`Academic_Monitoring_Leader_Facing/test-data-generator.js`)
