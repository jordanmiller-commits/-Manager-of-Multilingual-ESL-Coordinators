# ESL Manager Suite — Project TODO

Last updated: 2026-02-26

---

## 🔒 Security Hardening — NEXT PRIORITY

> All items below are pending. Start with the two Critical items. See conversation history for full implementation details.

- [ ] **[CRITICAL] Add shared API secret to Code.gs** — Anyone with the Script URL can read all coordinator data via `?action=readAll`. Add a `SHARED_SECRET` constant, validate it on every `doGet`/`doPost`. Store alongside the URL in `esl_gas_sync`.
- [ ] **[CRITICAL] Verify Google Drive folder permissions** — Confirm folder `1FvxiBn6-SmLa2RKXWXdE7DMufwm0tOVo` is shared only with the script owner. No coordinator needs direct folder access.
- [ ] **[HIGH] GitHub PAT stored in plaintext** — `esl_gist_sync` stores the Gist PAT in localStorage. Add a "Clear PAT" button to Data Backup Hub. Warn users to use a fine-grained PAT scoped to `gist` only.
- [ ] **[HIGH] GAS input validation** — Sanitize `coordinatorId` (alphanumeric only, block `../`). Reject payloads over 5MB.
- [ ] **[MEDIUM] Content Security Policy** — Add `<meta http-equiv="Content-Security-Policy">` to all HTML files.
- [ ] **[MEDIUM] GAS audit logging** — Log every write operation (timestamp, coordinatorId, action, payload size) to a Google Sheet.
- [ ] **[MEDIUM] Enable GitHub secret scanning** — Repo Settings → Code security → Secret scanning (separate from the Actions workflow already on disk).
- [ ] **[LOW] Encrypt sensitive localStorage keys** — SubtleCrypto AES-GCM for coaching notes and student-adjacent data.
- [ ] **[LOW] GAS rate limiting** — CacheService throttle per coordinatorId (~30 req/min).

---

## 🔧 One Remaining Infrastructure Step

- [ ] **Push GitHub Actions secret scan workflow** — File exists at `.github/workflows/secret-scan.yml` but was blocked from pushing (requires `workflow` PAT scope). Two options:
  - **Option A**: GitHub → Settings → Developer Settings → PAT → edit → check `workflow` → save → `git add .github/workflows/secret-scan.yml && git commit -m "Add secret scan workflow" && git push origin master`
  - **Option B**: GitHub web UI → repo → Add file → paste path `.github/workflows/secret-scan.yml` → paste contents from local file → commit

---

## ✅ Completed

**Core Suite (v1.0.0)**
- [x] Classroom Environment Audit (58-item, 13 sections, 0–3 scale, max 174)
- [x] Audit Dashboard (4 chart views + entries table with teacher profile links)
- [x] Walkthrough Planning Template (planning grid, obs log, coaching tracker, quick-code bar, look-for bank, ICS calendar export)
- [x] Walkthrough Dashboard (5 views + generated PDF report)
- [x] Coaching Cycle Tracker (5-stage pipeline, import from walkthroughs, ICS export, `?teacher=` param)
- [x] ESL Coordinator Scope & Sequence Tracker (2026–27, 4 coordinators)
- [x] Teacher 360 Profile (`?teacher=` deep-link, cross-tool aggregate)
- [x] Unified Home Page (global search, stats, alerts, activity feed)
- [x] Data Backup Hub (export/import all localStorage, GitHub Gist sync, Drive sync, import validation)
- [x] PWA support (manifest.json + service-worker.js)
- [x] Dark mode across all tools (`esl_app_theme`)
- [x] Mobile responsive (44px touch targets, 768px/600px breakpoints)

**Cross-Tool Integration (v2.0.0)**
- [x] Teacher deep-link navigation (all tools → Teacher 360 Profile)
- [x] `?teacher=NAME` URL param in Teacher 360, Walkthrough Dashboard, Coaching Tracker
- [x] Breadcrumb nav when arriving via URL param
- [x] Coaching handoff pipeline (Planning Template → Coaching Tracker via `coaching_cycle_handoff`)
- [x] Walkthrough → Audit pipeline (`walkthrough_audit_handoff`)
- [x] Google Drive Sync via GAS web app (`Code.gs`)
- [x] SPED Time Tracker (`Data_Analysis/SPED_Time_Tracker/`)
- [x] ELPS Knowledge Base Agent (PDF.js + optional Anthropic Claude API)

**Team Features & Expansion (v3.0.0 / v4.0.0)**
- [x] Team Overview dashboard (`Team_Overview.html`) — Drive-sync aggregate, coordinator cards, pipeline badges, Chart.js
- [x] Onboarding guide (`Onboarding.html`) — 5-step wizard, `?gasUrl=` param, progress bar
- [x] Calendar export (ICS) from Planning Template with missing-date warning
- [x] Email reminder system in Code.gs — weekly Monday 7AM trigger deployed 2026-02-26
- [x] Coordinator email map: jmiller, kpatterson, pokolo, vpalencia
- [x] Coordinator Workload Dashboard (`Coordinator_Workload.html`)
- [x] PD Tracker (`PD_Tracker.html`) — 8 categories, Chart.js, hour targets, CSV export
- [x] Meeting Notes (`Meeting_Notes.html`) — 4 templates, archive, action items → Coaching Tracker
- [x] Parent Communication Log (`Parent_Communication_Log.html`) — configurable types/languages
- [x] Compliance Checklist (`Compliance_Checklist.html`) — custom items, per-campus/semester, report
- [x] Goal-Setting & Growth Planning (`Goal_Setting.html`) — shared goals, check-ins, evidence
- [x] Student Roster (`Student_Roster.html`) — FERPA-safe, CSV import/export, doughnut chart
- [x] TELPAS Tracker (`TELPAS_Tracker.html`) — CSV import, growth tracking, decline alerts
- [x] CHANGELOG.md (v1.0.0 → v3.0.0)
- [x] GAS deployment guide (`google_apps_script/README.md`)
- [x] Test data generator (`Academic_Monitoring_Leader_Facing/test-data-generator.js`)
- [x] service-worker.js bumped to v4
