# ESL Manager Suite — Project TODO

Last updated: 2026-02-26

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

- [ ] Planning Template calendar export: if dateTime cell has no year (e.g. "Period 2, 9:15 AM"), the ICS falls back to today's date — consider prompting for a date if none is found
- [ ] Team Overview "Send Reminders" only passes coordinatorId/name, not email — emails must be in `COORDINATOR_EMAIL_MAP` in Code.gs; add a note in the UI explaining this
- [ ] Onboarding Step 3: no validation preventing spaces in Coordinator ID — add client-side check
- [ ] service-worker.js: bump to v4 whenever new HTML files are added to the repo
- [ ] `Coordinator_Workload.html` is linked in `index.html` tool grid but the file does not exist yet — build it or remove the card

---

## 🚀 High-Value Expansions

### Coordinator Workload Dashboard (`Coordinator_Workload.html`)
> Card already exists in index.html — file needs to be built.
- Per-coordinator breakdown: campuses covered, walkthroughs completed, teachers in coaching, audits completed
- Workload balance bar comparing all 4 coordinators side by side
- Campus coverage map (text-based, not geographic) showing which coordinator owns which campus

### TELPAS / Language Proficiency Tracker
- Import TELPAS composite scores per student (CSV upload)
- Track year-over-year growth by proficiency level (Beginning → Advanced High)
- Flag students showing language decline (tie into existing Language Decline Research in `Data_Analysis/`)
- Per-coordinator view showing their campuses' EB population progress

### Student Roster & EB Population Manager
- Lightweight student roster: name, campus, grade, proficiency level, program type (ESL/Bilingual)
- Filter by coordinator, campus, proficiency band
- Link individual students to relevant walkthroughs and audits
- FERPA note: keep data local (localStorage only), no Drive sync for student records without explicit consent workflow

### Professional Development Tracker
- Log PD sessions attended or facilitated per coordinator
- Track hours by category (ELPS, Sheltered Instruction, Coaching, Data Literacy)
- Generate PD summary report for end-of-year reviews
- Connect to Coaching Cycle Tracker (PD as a growth action)

### Meeting Notes & Agenda Builder
- Simple meeting template: date, attendees, agenda items, action items with owners + deadlines
- Archive of past meeting notes searchable by keyword or attendee
- Export to `.docx` or print-optimized PDF
- Link action items to Coaching Cycle Tracker

### Parent Communication Log
- Log parent contacts per teacher or campus: date, type (call/email/conference), language, outcome
- Tie into Newcomer Resources — track which families have received which materials
- Searchable by teacher, campus, or date range

### ESL Program Compliance Checklist
- Annual or semester checklist of ESL non-negotiables (based on existing `ESL Nonnegotiables (1).pdf`)
- Per-campus completion tracking
- Generate compliance summary report for district review

### Goal-Setting & Growth Planning Tool
- Manager sets campus or coordinator-level goals at start of semester
- Progress check-ins at mid-semester and end-of-semester
- Connect to walkthrough fidelity data and coaching cycle completion rates as evidence

---

## 🔧 Infrastructure / Developer Experience

- [ ] Add a `CHANGELOG.md` to track version history as the suite grows
- [ ] Consider migrating from `var`/ES5 to modern JS (`const`/`let`, arrow functions) once IE/legacy browser support is confirmed unnecessary — would significantly clean up the codebase
- [ ] Add test data generator scripts (similar to `ESL_Classroom_Audit/test-data-generator.js`) for walkthroughs and coaching cycles to make UI testing easier
- [ ] Set up GitHub Actions workflow to auto-check for accidentally committed secrets on every push
- [ ] Document the GAS deployment process (version, access level, CORS settings) in `google_apps_script/README.md` so a new manager can redeploy without tribal knowledge

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
