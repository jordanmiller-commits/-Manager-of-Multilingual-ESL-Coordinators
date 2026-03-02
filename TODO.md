# MLP Coordinator Hub — Project TODO

Last updated: 2026-03-02

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
