# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MLP Coordinator Hub** — a suite of 19+ single-file HTML web applications for managing multilingual/ESL coordinators at Uplift Education. Hosted on GitHub Pages as a PWA. No build step, no bundler, no framework.

**Live URL**: `https://jordanmiller-commits.github.io/-Manager-of-Multilingual-ESL-Coordinators/`

**Coordinators** (hardcoded in several tools):
| ID | Name | Email |
|---|---|---|
| `jmiller` | J. Miller | jmiller@uplifteducation.org |
| `kpatterson` | K. Patterson | kpatterson@uplifteducation.org |
| `pokolo` | P. Okolo | Pokolo@uplifteducation.org |
| `vpalencia` | V. Palencia | vpalencia@uplifteducation.org |

---

## Quick Reference: What to Do When...

### Adding a new HTML tool
1. Create the `.html` file following the conventions below (copy header/dark mode/toast pattern from an existing tool)
2. Add the file path to `ASSETS` array in root `service-worker.js`
3. Bump `CACHE_NAME` in `service-worker.js` (e.g., `mlp-suite-v1` → `mlp-suite-v2`)
4. Add a tool card in `index.html` with appropriate `data-roles` attribute
5. If it uses localStorage, add its key(s) to the Cross-Tool Data Sharing table below
6. If the data should sync to Drive, add the key to `SYNC_KEYS` in `google_apps_script/Code.gs`
7. Update `CHANGELOG.md`

### Modifying an existing tool
- Each tool is a **single self-contained HTML file** — CSS in `<style>` in `<head>`, all JS in one `<script>` before `</body>`
- Open the file in a browser to test — changes take effect on reload
- If you change localStorage key names or structure, check the Cross-Tool Data Sharing table for other tools that read/write that key
- After changes, bump `CACHE_NAME` in `service-worker.js` to force cache refresh for PWA users

### Modifying the Google Apps Script backend
- Edit `google_apps_script/Code.gs` locally
- Must manually redeploy in Apps Script editor: Deploy → Manage Deployments → Edit → New version → Deploy
- See `google_apps_script/README.md` for full deployment guide

### Adding a coordinator
- Update `COORDINATOR_EMAIL_MAP` in `Code.gs`
- Update coordinator dropdowns/lists in affected HTML tools (search for existing coordinator names)
- Generate onboarding link with `?gasUrl=...&coordId=...&coordName=...&secret=...`

---

## Strict Code Conventions

**These conventions are non-negotiable and apply to all HTML files:**

### JavaScript
- **ES5 only**: Use `var` — **never** `let`, `const`, or arrow functions (`=>`)
- **No template literals** — use string concatenation (`'Hello ' + name`)
- Event handlers via inline `onclick` or closure-wrapped `addEventListener`
- All JS in a **single `<script>` block** before `</body>`
- Exception: `ELPS_Agent.html` uses `<script type="module">` for PDF.js ESM imports; functions called from `onclick` must be assigned to `window.*`

### CSS
- All CSS in a **single `<style>` block** in `<head>`
- No external stylesheets (except CDN dependencies)

### HTML structure template
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Tool Name</title>
<link rel="manifest" href="./manifest.json"/>
<meta name="theme-color" content="#2c3e6e"/>
<style>
  /* All CSS here */
</style>
</head>
<body>
  <!-- All HTML here -->
  <div class="toast" id="toast"></div>
  <script>
    /* All JS here */
  </script>
</body>
</html>
```

For tools in subdirectories, use `href="../manifest.json"` and register `../service-worker.js`.

---

## Visual Design System

All tools share this design language — maintain consistency:

| Element | Value |
|---|---|
| Header gradient | `linear-gradient(135deg, #2c3e6e, #4a90d9)` |
| Font | `'Segoe UI', Arial, sans-serif` |
| Background | `#f0f2f7` |
| Card style | `background:#fff; border-radius:10px; box-shadow:0 1px 5px rgba(0,0,0,.07); padding:16px 20px` |
| Primary blue | `#4a90d9` / `#2c3e6e` (dark blue) |
| Header buttons | `.tool-btn` class — semi-transparent white on gradient |
| Content buttons | `.btn` / `.btn.primary` / `.btn.danger` classes |
| Table header bg | `#f8f9fb` |
| Coordinator colors | J. Miller=purple, K. Patterson=teal, P. Okolo=red, V. Palencia=blue |

---

## Required Utilities in Every Tool

Every HTML tool must include:

1. **`escHtml(str)`** — XSS-safe HTML escaping using `document.createTextNode`. Never use string concatenation for user data in HTML.
2. **`showToast(msg)`** + `<div class="toast" id="toast"></div>` — notification toasts
3. **Dark mode toggle** — button in header, reads/writes `esl_app_theme` localStorage key, applies `body.dark-mode` class
4. **PWA registration** — `navigator.serviceWorker.register('./service-worker.js')` (or `../service-worker.js` for subdirectory tools)
5. **Print CSS** — `@media print` rules to hide toolbars and format for paper
6. **Mobile responsive** — `min-height:44px` on interactive elements at `≤600px`; layout breakpoints at `768px`

---

## Persistence & Data Flow

### localStorage auto-save pattern
All tools use debounced auto-save (typically 800ms):
```javascript
var saveTimer;
function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveData, 800);
}
```

### Cross-Tool Data Sharing

Tools share data through localStorage keys. **Before renaming or restructuring any key, check every tool that reads it.**

| Key | Written By | Read By | Notes |
|---|---|---|---|
| `esl_audit_data` | Audit | Audit, Backup Hub, Home | Current working audit |
| `esl_audit_history` | Audit | Audit, Audit Dashboard, Backup Hub, Home, Teacher 360, Workload | Saved audit archive |
| `esl_audit_campuses` | Audit | Audit, Backup Hub | Campus name list |
| `walkthrough_plan_data_v2` | Planner | Planner, Backup Hub, Home | Current walkthrough session |
| `walkthrough_history` | Planner | Planner, Walk Dashboard, Coaching Tracker, Backup Hub, Home, Teacher 360, Workload, Goal Setting | Saved walkthrough archive — **most widely read key** |
| `esl_scope_data` | Scope & Seq | Scope & Seq, Backup Hub, Home | Coordinator tracking state |
| `shared_teacher_roster` | Planner (auto-harvest) | Planner, Coaching Tracker, Backup Hub, Teacher 360, Home | Teacher name autocomplete |
| `coaching_cycles_data` | Coaching Tracker | Coaching Tracker, Backup Hub, Home, Teacher 360, Goal Setting | Coaching cycle state |
| `walkthrough_audit_handoff` | Planner (temp) | Audit (consumed on load) | Walkthrough → Audit pipeline |
| `coaching_cycle_handoff` | Planner / Meeting Notes (temp) | Coaching Tracker (consumed on load) | Pre-fill new cycle modal |
| `elps_agent_docs` | ELPS Agent | ELPS Agent, Backup Hub | ELPS document chunks |
| `elps_agent_index` | ELPS Agent | ELPS Agent | Inverted search index |
| `elps_agent_settings` | ELPS Agent | ELPS Agent | API key, model preference |
| `elps_agent_history` | ELPS Agent | ELPS Agent | Recent query history |
| `esl_app_theme` | All tools | All tools | `"dark"` / `"light"` |
| `esl_gist_sync` | Backup Hub | Backup Hub | GitHub Gist PAT + Gist ID |
| `esl_gas_sync` | Backup Hub, Onboarding | Backup Hub, Team Overview, Onboarding, Workload, Principal Portal | Drive sync URL, coordinator ID/name, secret |
| `esl_onboarding_complete` | Onboarding | Onboarding | `{step1:true, ...}` |
| `esl_workload_campuses` | Coordinator Workload | Coordinator Workload | Campus→coordinator map |
| `pd_tracker_data` | PD Tracker | PD Tracker | `{version, sessions[], settings:{hourTargets{}}}` |
| `meeting_notes_data` | Meeting Notes | Meeting Notes | `{version, meetings[]}` |
| `parent_comm_log` | Parent Comm Log | Parent Comm Log | `{version, entries[], settings:{contactTypes[], languages[]}}` |
| `compliance_checklist_data` | Compliance Checklist | Compliance Checklist | `{version, items[], completions{}, settings:{campuses[], semesters[]}}` |
| `goal_setting_data` | Goal Setting | Goal Setting | `{version, goals[], checkins[]}` |
| `student_roster_data` | Student Roster | Student Roster | **FERPA: never sync to Drive** |
| `telpas_tracker_data` | TELPAS Tracker | TELPAS Tracker | **FERPA: never sync to Drive** |
| `calibration_sessions` | Calibration Tool | Calibration Tool, Backup Hub | `{version, sessions[]}` — inter-rater reliability sessions |

### Cross-tool navigation
- **Teacher profile links**: `<a class="teacher-link">` → `Teacher_360_Profile.html?teacher=NAME`
- **`teacherProfileLink(name)`**: utility in most tools; use `../Teacher_360_Profile.html` for subdirectory tools
- **Coaching handoff**: writes `coaching_cycle_handoff` → Coaching Tracker reads and removes on load
- **Walkthrough → Audit**: writes `walkthrough_audit_handoff` → Audit reads and removes on load

---

## Folder Structure

```
├── index.html                          # Home page — 19 tool cards, 3 role tabs (Manager/Coordinator/Campus Leader)
├── Team_Overview.html                  # Manager dashboard — aggregates all coordinator data via GAS
├── Onboarding.html                     # 5-step setup wizard (?gasUrl=, ?coordId=, ?coordName=, ?secret=)
├── Teacher_360_Profile.html            # Read-only aggregate teacher view (?teacher=NAME)
├── Data_Backup_Hub.html                # Export/import localStorage + GitHub Gist + Google Drive sync
├── Coordinator_Workload.html           # Per-coordinator workload stats + campus assignments
├── PD_Tracker.html                     # Professional development log (8 categories, Chart.js)
├── Meeting_Notes.html                  # Agenda builder + meeting archive (4 templates)
├── Parent_Communication_Log.html       # Parent contact log (configurable types/languages)
├── Compliance_Checklist.html           # ESL compliance checklist per campus per semester
├── Goal_Setting.html                   # Manager+coordinator goal planning with check-ins
├── Student_Roster.html                 # FERPA-safe EB student roster (localStorage only)
├── TELPAS_Tracker.html                 # TELPAS score tracker with decline alerts (localStorage only)
├── Calibration_Tool.html               # Scoring calibration — inter-rater reliability for audit items
├── Reports_Hub.html                    # Cross-tool reporting — semester overview, coordinator/campus/coaching reports
├── manifest.json                       # PWA manifest ("MLP Coordinator Hub")
├── service-worker.js                   # PWA service worker — cache-first, CACHE_NAME = "mlp-suite-v1"
├── Principal_Checkpoint_Portal/
│   ├── Principal_Checkpoint_Portal.html  # Campus leader view — coaching, audit scores, notes sync to GAS
│   └── Campus_Report_Card.html           # One-page weekly campus snapshot — health score, pipeline, action items
├── ESL_Classroom_Audit/
│   ├── ESL_Classroom_Audit.html          # 58-item checklist, 13 sections, 0–3 scale, max 174
│   ├── Audit_Dashboard.html              # Chart.js audit trends (4 views)
│   ├── manifest.json                     # Legacy audit-only PWA manifest
│   ├── service-worker.js                 # Legacy audit-only service worker
│   └── test-data-generator.js            # Console utility: generateTestData() / clearTestData()
├── ESL_Programming_Plans/
│   ├── ESL_Coordinator_Scope_Sequence.html  # 2026–27 school year tracker
│   └── Guiding_Documents/                   # Reference PDFs (ESL nonnegotiables, program design, etc.)
├── Academic_Monitoring_Leader_Facing/
│   ├── Academic_Monitoring_Planning_Template.html  # Walkthrough planning + ICS calendar export
│   ├── Walkthrough_Dashboard.html          # 5-view Chart.js dashboard + report generator
│   ├── Coaching_Cycle_Tracker.html         # 5-stage coaching pipeline + ICS export
│   └── test-data-generator.js              # Console test data utility
├── Data_Analysis/
│   ├── build_research_doc.py               # Python: builds research compilation
│   ├── Language Decline Research/           # EB language decline research docs
│   └── SPED_Time_Tracker/                  # Python + openpyxl SPED time tracker
├── ELPS_Agent/
│   ├── ELPS_Agent.html                     # PDF search + AI Q&A (Ollama/Anthropic/OpenAI)
│   ├── CLAUDE.md                           # ELPS Agent architecture notes
│   └── *.pdf                               # Pre-loaded ELPS reference documents
├── google_apps_script/
│   ├── Code.gs                             # GAS web app: Drive sync + email reminders
│   └── README.md                           # Full deployment guide
└── Newcomer_Resources/                     # ESL at Home PDF resources
```

---

## Tool-by-Tool Reference

### index.html — Unified Home Page
- **3 role tabs**: Manager (all 19 tools), MLP Coordinator (17 tools), Campus Leader (3 tools)
- `data-roles` attribute on `.tool-card` controls visibility per role
- Global search across localStorage (teachers, campuses, observations, coaching actions)
- Stats bar, alerts (overdue coaching, stalled cycles), recent activity timeline
- Role persisted in `esl_home_role`

### Team_Overview.html — Manager Dashboard
- Reads GAS `readAll` endpoint; requires `esl_gas_sync` configured
- Coordinator cards with freshness borders (green <24h, yellow <7d, red >7d)
- Chart.js walkthrough activity bar chart
- Send Reminders button → POSTs to GAS `sendReminders` action

### ESL_Classroom_Audit.html — Classroom Audit
- 58 items, 13 sections (7 permanent + 6 rotating), 0–3 rating, max score 174
- Reads `walkthrough_audit_handoff` on load to pre-fill metadata

### Academic_Monitoring_Planning_Template.html — Walkthrough Planner
- `ROUND_TYPES` (3): Procedural/Conceptual/Engagement
- `ROW_CONFIG` (6): Target Teachers, Date/Time, Look-For, Evidence Code, Gaps, Response
- `SUGGESTION_BANK` (7 categories) for look-fors
- ICS calendar export, coaching handoff pipeline

### Coaching_Cycle_Tracker.html — Coaching Cycles
- 5 stages: Observation → Feedback → Action Step → Follow-Up → Growth
- Reads `coaching_cycle_handoff` on load; supports `?teacher=NAME`

### ELPS_Agent.html — ELPS Knowledge Base
- PDF.js text extraction → chunking → inverted index → TF-IDF search
- Multi-provider AI streaming: Ollama (default), Anthropic, OpenAI
- Pre-loaded ELPS documents in `PRELOADED_DOCS` array
- See `ELPS_Agent/CLAUDE.md` for detailed architecture

### Data_Backup_Hub.html — Backup & Sync
- Export/import all localStorage keys as JSON
- GitHub Gist sync (PAT in `esl_gist_sync`)
- Google Drive sync via GAS (`esl_gas_sync`)
- `IMPORT_VALIDATORS` validates structure before writing

---

## External Dependencies

| Dependency | Used By | CDN URL |
|---|---|---|
| Chart.js 4.4.7 | Dashboards, PD Tracker, Student Roster, TELPAS Tracker | `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js` |
| PDF.js 4.0.379 | ELPS Agent only | jsDelivr CDN (ESM module) |

No npm, no node_modules, no build step.

---

## Google Apps Script Backend

`google_apps_script/Code.gs` — deployed as a GAS web app.

- **Drive folder**: `FOLDER_ID = '1HpYZoIgwbr0iZL6pnntBZw648--us9BG'`
- **Auth**: `SHARED_SECRET` validated on every request
- **File naming**: `{coordinatorId}_data.json`
- **GET actions**: `status`, `read`, `readAll`, `list`, `readKey`
- **POST actions**: `sync`, `syncKey`, `delete`, `sendReminders`
- **Email reminders**: Weekly Monday 7AM trigger → `weeklyReminderJob()`
- **Input validation**: `sanitizeCoordId()` strips non-alphanumeric, max 50 chars

---

## PWA & Caching

- **Cache name**: `mlp-suite-v1` in root `service-worker.js`
- Strategy: cache-first with network fallback
- All 21 HTML files + Chart.js CDN listed in `ASSETS` array
- **When adding files**: add to `ASSETS` and bump `CACHE_NAME`
- Legacy audit-only PWA files exist in `ESL_Classroom_Audit/` (can be ignored)

---

## Dark Mode

- Class: `body.dark-mode` (most tools) or `body.dark` (Audit, ELPS Agent)
- Key: `esl_app_theme` (`"dark"` / `"light"`) — read on load, written on toggle
- Audit also uses `esl_audit_dark_mode` but syncs with `esl_app_theme`
- ELPS Agent has its own system (`elps_agent_dark`)

---

## FERPA Compliance

`Student_Roster.html` and `TELPAS_Tracker.html` contain student PII. These keys must **NEVER** be synced to Google Drive or any external service:
- `student_roster_data`
- `telpas_tracker_data`

---

## Security Notes (from TODO.md)

**Completed**: API secret in GAS, input sanitization, Drive folder permissions
**Open items**:
- GitHub PAT stored in plaintext in `esl_gist_sync` — needs "Clear PAT" button
- Content Security Policy headers not yet added to HTML files
- GAS audit logging not yet implemented
- Sensitive localStorage keys not encrypted

---

## Common Patterns for Reference

### Adding a filter bar
```html
<div class="filter-bar">
  <div class="filter-group">
    <label>Coordinator</label>
    <select id="filterCoord" onchange="applyFilters()">
      <option value="">All</option>
      <option value="jmiller">J. Miller</option>
      <!-- etc -->
    </select>
  </div>
</div>
```

### Adding a Chart.js visualization
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<!-- ... -->
<script>
var myChart = null;
function renderChart() {
    var ctx = document.getElementById('myCanvas').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, { type: 'bar', data: {...}, options: {...} });
}
</script>
```

### localStorage read/write pattern
```javascript
function loadData() {
    try {
        var raw = localStorage.getItem('my_key');
        return raw ? JSON.parse(raw) : { version: 1, items: [] };
    } catch (e) { return { version: 1, items: [] }; }
}
function saveData() {
    localStorage.setItem('my_key', JSON.stringify(data));
    showToast('Saved');
}
```

### Dark mode toggle
```javascript
function toggleDarkMode() {
    var isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('esl_app_theme', isDark ? 'dark' : 'light');
}
// On load:
if (localStorage.getItem('esl_app_theme') === 'dark') document.body.classList.add('dark-mode');
```
