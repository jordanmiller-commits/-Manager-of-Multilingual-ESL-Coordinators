# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Folder Structure

```
Manager_of_Multilingual_ESL_Coordinators/
├── index.html                              # Unified Home Page — tool launcher, search, activity hub (18 tools)
├── Team_Overview.html                      # Manager dashboard — aggregate all coordinator data via Drive Sync
├── Onboarding.html                         # 5-step setup wizard for new coordinators; ?gasUrl= param support
├── Teacher_360_Profile.html                # Aggregate teacher data across all tools (read-only)
├── Data_Backup_Hub.html                    # Centralized backup/restore + GitHub Gist + Google Drive sync
├── Coordinator_Workload.html               # Per-coordinator workload stats + campus assignment panel
├── PD_Tracker.html                         # Professional development session log (8 categories, Chart.js)
├── Meeting_Notes.html                      # Agenda builder + searchable meeting archive (4 templates)
├── Parent_Communication_Log.html           # Parent contact log (configurable types/languages, CSV export)
├── Compliance_Checklist.html               # Custom ESL compliance checklist per campus per semester
├── Goal_Setting.html                       # Shared manager+coordinator goal planning with check-ins
├── Student_Roster.html                     # FERPA-safe EB student roster (localStorage only, CSV import/export)
├── TELPAS_Tracker.html                     # TELPAS score tracker — growth table, decline alerts (localStorage only)
├── manifest.json                           # PWA manifest (app name: "ESL Manager Suite")
├── service-worker.js                       # PWA service worker v4 — offline caching for all tools
├── CHANGELOG.md                            # Version history (Keep a Changelog format)
├── TODO.md                                 # Project to-do list — security hardening is next priority
├── .github/
│   └── workflows/
│       └── secret-scan.yml                 # Secret scan CI (on disk; needs 'workflow' PAT scope to push)
├── ESL_Classroom_Audit/
│   ├── ESL_Classroom_Audit.html            # 58-item checklist, 13 sections, 0–3 scale, max 174
│   ├── Audit_Dashboard.html                # Chart.js audit trends dashboard (4 views)
│   ├── manifest.json                       # Legacy audit-only PWA manifest
│   ├── service-worker.js                   # Legacy audit-only service worker
│   └── MLP Observation and Walkthrough Tool.docx
├── ESL_Programming_Plans/
│   ├── ESL_Coordinator_Scope_Sequence.html # 2026–27 school year tracker (4 coordinators)
│   └── Guiding_Documents/
│       ├── Addressing EB in the Classroom.pdf
│       ├── ESL Nonnegotiables (1).pdf
│       ├── ESL at Home Englishk-2.pdf
│       ├── Semester 1 YAG 25-26.pdf
│       ├── Semester 2 YAG 25-26.pdf
│       ├── Uplift ESL Program Model Design (1).pdf
│       └── breakout-englishelps.pdf
├── Academic_Monitoring_Leader_Facing/
│   ├── Academic_Monitoring_Planning_Template.html  # Walkthrough planning + ICS calendar export
│   ├── Walkthrough_Dashboard.html          # 5-view Chart.js dashboard + report generator
│   ├── Coaching_Cycle_Tracker.html         # 5-stage coaching pipeline + ICS export
│   ├── test-data-generator.js              # generateTestData() / clearTestData() — paste in browser console
│   ├── Academic_Monitoring_Planning_Template.jpg
│   ├── Academic Monitoring Coaching Resources.jpg
│   └── Responding to Misconceptions In Realtime.jpg
├── Data_Analysis/
│   ├── build_research_doc.py
│   ├── Language Decline Research/
│   │   ├── EB_Language_Decline_Research_Compilation.docx
│   │   └── EB_Language_Decline_Research_Compilation.md
│   └── SPED_Time_Tracker/
│       ├── build_tracker.py
│       ├── SPED_Time_Tracker.xlsx
│       └── Social Skills Times.xlsx
├── ELPS_Agent/
│   ├── ELPS_Agent.html                     # PDF search + optional Anthropic Claude API Q&A
│   ├── CLAUDE.md                           # ELPS Agent architecture notes
│   ├── ELP 201 Teacher Toolkit Secondary.pdf
│   └── ELPS Summaries for Learning Objectives.pdf
├── google_apps_script/
│   ├── Code.gs                             # GAS web app: Drive sync + email reminders + weekly trigger
│   └── README.md                           # Deployment guide, API endpoints, troubleshooting
├── Newcomer_Resources/
│   ├── ESL at Home English Weeks 5-8.pdf
│   └── ESL at Home English Weeks 9-12.pdf
├── Lesson_Planning/
└── CLAUDE.md
```

## Project Overview

A suite of single-file web applications for managing multilingual/ESL coordinators. All tools share the same conventions and localStorage-based data sharing. Hosted on GitHub Pages.

**Live URL**: `https://jordanmiller-commits.github.io/-Manager-of-Multilingual-ESL-Coordinators/`

**Coordinators**:
| ID | Name | Email |
|---|---|---|
| `jmiller` | J. Miller | jmiller@uplifteducation.org |
| `kpatterson` | K. Patterson | kpatterson@uplifteducation.org |
| `pokolo` | P. Okolo | Pokolo@uplifteducation.org |
| `vpalencia` | V. Palencia | vpalencia@uplifteducation.org |

## Development

Open any `.html` file directly in a browser. Changes take effect on reload. No build, lint, or test commands. External dependencies: Chart.js CDN (dashboards), PDF.js CDN (ELPS Agent).

## Key Conventions

- All JS uses `var` declarations and ES5-compatible syntax — **no arrow functions, no `let`/`const`, no template literals**.
- CSS in `<style>` in `<head>`. All JS in a single `<script>` block before `</body>`.
- Visual style: blue gradient header (`linear-gradient(135deg, #2c3e6e, #4a90d9)`), Segoe UI font, white cards with `border-radius:10px`, `#f0f2f7` background.
- Event handlers via inline `onclick` or closure-wrapped `addEventListener`.
- Persistence via `localStorage` with debounced auto-save.
- Dark mode: `body.dark-mode` class, persisted via `esl_app_theme` localStorage key, toggle button in every tool's header.
- PWA: Root `manifest.json` + `service-worker.js` (**currently v4**), registered from all HTML files.
- Print: `@media print` CSS in every tool hides toolbars and formats for paper.
- Mobile: `min-height:44px` on buttons/inputs at `≤600px`; layout breakpoints at `768px`.
- **When adding new HTML files**: bump `CACHE_NAME` to the next version in `service-worker.js` and add the file path to the `ASSETS` array.
- `escHtml(str)` utility present in all tools — uses `document.createTextNode` approach, never string concatenation for user data.
- `showToast(msg)` + `<div class="toast" id="toast"></div>` present in all tools.

## Cross-Tool Data Sharing

| Key | Written By | Read By | Purpose |
|---|---|---|---|
| `esl_audit_data` | Audit | Audit, Backup Hub, Home | Current working audit |
| `esl_audit_history` | Audit | Audit, Audit Dashboard, Backup Hub, Home, Teacher 360, Workload | Saved audit archive |
| `esl_audit_campuses` | Audit | Audit, Backup Hub | Campus name list |
| `walkthrough_plan_data_v2` | Planner | Planner, Backup Hub, Home | Current walkthrough session |
| `walkthrough_history` | Planner | Planner, Walk Dashboard, Coaching Tracker, Backup Hub, Home, Teacher 360, Workload, Goal Setting | Saved walkthrough archive |
| `esl_scope_data` | Scope & Seq | Scope & Seq, Backup Hub, Home | Coordinator tracking state |
| `shared_teacher_roster` | Planner (auto-harvest) | Planner, Coaching Tracker, Backup Hub, Teacher 360, Home | Teacher name autocomplete |
| `coaching_cycles_data` | Coaching Tracker | Coaching Tracker, Backup Hub, Home, Teacher 360, Goal Setting | Coaching cycle state |
| `walkthrough_audit_handoff` | Planner (temp) | Audit (consumed on load) | Walkthrough → Audit pipeline |
| `coaching_cycle_handoff` | Planner (temp), Meeting Notes | Coaching Tracker (consumed on load) | Pre-fill new cycle modal |
| `elps_agent_docs` | ELPS Agent | ELPS Agent, Backup Hub | ELPS document chunks |
| `elps_agent_index` | ELPS Agent | ELPS Agent | Inverted search index |
| `elps_agent_settings` | ELPS Agent | ELPS Agent | API key, model preference |
| `elps_agent_history` | ELPS Agent | ELPS Agent | Recent query history |
| `esl_app_theme` | All tools | All tools | Dark mode preference (`"dark"` / `"light"`) |
| `esl_gist_sync` | Backup Hub | Backup Hub | GitHub Gist PAT + Gist ID |
| `esl_gas_sync` | Backup Hub, Onboarding | Backup Hub, Team Overview, Onboarding, Workload | Drive sync URL, coordinator ID/name |
| `esl_onboarding_complete` | Onboarding | Onboarding | Checklist state `{step1:true, ...}` |
| `esl_workload_campuses` | Coordinator Workload | Coordinator Workload | Campus→coordinator assignment map |
| `pd_tracker_data` | PD Tracker | PD Tracker | `{version, sessions[], settings:{hourTargets{}}}` |
| `meeting_notes_data` | Meeting Notes | Meeting Notes | `{version, meetings[]}` |
| `parent_comm_log` | Parent Comm Log | Parent Comm Log | `{version, entries[], settings:{contactTypes[], languages[]}}` |
| `compliance_checklist_data` | Compliance Checklist | Compliance Checklist | `{version, items[], completions{}, settings:{campuses[], semesters[]}}` |
| `goal_setting_data` | Goal Setting | Goal Setting | `{version, goals[], checkins[]}` |
| `student_roster_data` | Student Roster | Student Roster | `{version, students[]}` — **FERPA: never sync to Drive** |
| `telpas_tracker_data` | TELPAS Tracker | TELPAS Tracker | `{version, records[]}` — **FERPA: never sync to Drive** |

---

## Unified Home Page

`index.html` — Landing page linking all 18 tools with live status badges.

- **Header**: Data Backup Hub link + Setup Guide (Onboarding) link + dark mode toggle
- **Global Search**: searches teachers, campuses, observations, coaching actions across all localStorage keys
- **Stats bar**: Audits saved, walkthroughs, teachers in roster, coaching cycles
- **Tool grid**: 18 cards with `metaXxx` badge IDs — all populated by `loadExtraMeta()`
- **Alerts**: Overdue coaching actions, stalled cycles, high-score celebrations, onboarding nudges
- **Recent Activity**: Merged timeline from `esl_audit_history` + `walkthrough_history`

---

## Team Overview

`Team_Overview.html` — Manager dashboard reading GAS `readAll` endpoint.

- GAS Script URL read/written from `esl_gas_sync`
- **Coordinator cards**: freshness border (green <24h, yellow <7d, red >7d), walkthrough/audit/cycle counts
- **Aggregated Pipeline**: badge row — total cycles at each of 5 stages
- **Walkthrough Activity chart**: Chart.js bar, coordinator names on X
- **Send Reminders**: POSTs `{action:"sendReminders", coordinators:[...]}` to GAS; requires `COORDINATOR_EMAIL_MAP` in Code.gs

---

## Onboarding Guide

`Onboarding.html` — 5-step setup wizard for coordinators.

- `?gasUrl=URL` param pre-fills Script URL (distribute with param baked in)
- Step 3 form writes `esl_gas_sync`; coordinator ID is auto-stripped of spaces and lowercased
- Checklist persisted in `esl_onboarding_complete`

---

## Coordinator Workload Dashboard

`Coordinator_Workload.html` — Local workload view per coordinator.

- **Campus Assignment Panel**: manager configures which campuses each coordinator owns → `esl_workload_campuses`
- **Stats grid**: total walkthroughs, audits, roster size, active cycles (from localStorage)
- **Coordinator cards**: per-coordinator walkthrough/audit counts, assigned campuses, progress bar showing share of team total
- **Workload Balance chart**: Chart.js horizontal bar — Walkthroughs + Audits per coordinator
- **Recent Activity**: last 3 walkthrough dates per coordinator as pills

---

## PD Tracker

`PD_Tracker.html` — Professional development session log.

- **8 Categories**: ELPS/Language Acquisition, Sheltered Instruction/ESL Strategies, Coaching & Instructional Leadership, Data Literacy/Assessment, Newcomer/SIFE Support, Bilingual Program Design, Family & Community Engagement, Technology/EdTech for EBs
- **Filter bar**: coordinator, category, school year, date range
- **Charts**: Hours by Category (horizontal bar) + Hours over Time (line, monthly cumulative, one line per coordinator)
- **Settings**: Annual hour targets per coordinator with progress bars
- **Export**: CSV of filtered sessions

---

## Meeting Notes

`Meeting_Notes.html` — Agenda builder and meeting archive.

- **4 Templates**: Weekly Coordinator Team Meeting, Campus Check-In, ESL Department Meeting, District/Manager Review
- **Layout**: Split-pane — 320px archive sidebar + fluid editor (collapses to single column on mobile)
- **Editor**: type pill (readonly), date, attendees, agenda items (checkbox + text), action items (text/owner/deadline/done), notes textarea; 800ms debounced auto-save
- **Export to Coaching Tracker**: writes `coaching_cycle_handoff` for all undone action items with an owner, opens Coaching Tracker

---

## Parent Communication Log

`Parent_Communication_Log.html` — Searchable parent contact log.

- **Configurable Settings**: contact types and languages are editable lists stored in `parent_comm_log.settings`
- **Filter bar**: coordinator, campus, teacher, contact type, language, date range
- **Stats**: total contacts, unique families (teacher+campus combos), most common language/type
- **Table**: paginated 20/page; outcome truncated with tooltip; notes icon with hover
- **Export**: CSV of filtered entries

---

## Compliance Checklist

`Compliance_Checklist.html` — ESL program compliance tracking.

- **Custom items**: user-defined checklist items with category grouping and required/optional toggle → `compliance_checklist_data.items`
- **Completion tracking**: keyed by `"{semester}_{campus}_{itemId}"` → stores checked state, notes, completed-by, date
- **Campus management**: editable campus list in `compliance_checklist_data.settings.campuses`
- **Campus Summary cards**: color-coded completion % per campus for selected semester
- **Generate Report**: print-ready overlay — items as rows, campuses as columns, ✓/○ symbols

---

## Goal-Setting & Growth Planning

`Goal_Setting.html` — Shared manager + coordinator goal framework.

- Each goal: coordinator, semester, title, description, success metric, manager target, action steps (mini-checklist), status
- **Check-ins**: mid-semester and end-of-semester; 1–4 rating (Not Yet / Developing / Proficient / Exceeds); evidence, manager notes, coordinator reflection
- **Goal cards**: action step progress bar, Mid/End check-in status pills, walkthrough fidelity badge (live from `walkthrough_history`), coaching cycle count badge
- **Coordinator colors**: J. Miller=purple, K. Patterson=teal, P. Okolo=red, V. Palencia=blue

---

## Student Roster

`Student_Roster.html` — FERPA-safe local EB student roster.

- **Fields**: firstName, lastName, campus, grade (K–12), coordinator, proficiencyLevel (Beginning/Intermediate/Advanced/Advanced High), programType (ESL/Bilingual/SLIFE/Newcomer), entryDate, notes
- **FERPA**: data stored in `student_roster_data` only — **never sync to Google Drive**
- **Import CSV**: header row required; merge (deduplicate by firstName+lastName+campus) or replace
- **Chart**: proficiency doughnut (Chart.js, shown when 5+ students)

---

## TELPAS Tracker

`TELPAS_Tracker.html` — Year-over-year TELPAS score tracker.

- **Fields**: firstName, lastName, campus, grade, coordinator, schoolYear, compositeLevel, listeningLevel, speakingLevel, readingLevel, writingLevel, testDate, notes
- **FERPA**: stored in `telpas_tracker_data` only — **never sync to Google Drive**
- **Growth table**: pairs students present in both selected year and prior year; ↑/→/↓ arrows; "Flagged for Decline" badge when composite drops 1+ level; sorted declines first
- **Decline alert**: orange banner when any decline detected, links to growth table
- **Distribution chart**: Chart.js grouped bar — current year vs prior year, 4 proficiency levels
- Level values for computation: Beginning=1, Intermediate=2, Advanced=3, Advanced High=4

---

## Cross-Tool Navigation

- **Teacher profile links**: `<a class="teacher-link">` → `Teacher_360_Profile.html?teacher=NAME`
- **`?teacher=NAME` param**: Teacher 360 (auto-selects), Walkthrough Dashboard (auto-filters to Teacher Trends), Coaching Tracker (auto-filters + breadcrumb)
- **Coaching handoff**: Planning Template 💬 button or Meeting Notes "Export to Coaching" → writes `coaching_cycle_handoff` → Coaching Tracker pre-fills new cycle modal on load
- **`teacherProfileLink(name)`**: utility in all tools; relative path `../Teacher_360_Profile.html` for subdirectory tools

---

## Classroom Environment Audit

`ESL_Classroom_Audit/ESL_Classroom_Audit.html` — 58-item checklist, 13 sections (7 permanent, 6 rotating), rating 0–3, max score 174.

- Planner writes `walkthrough_audit_handoff` → Audit pre-fills metadata on load and removes the key

---

## Audit Dashboard

`ESL_Classroom_Audit/Audit_Dashboard.html` — 4 Chart.js views: Score Trends (+ entries table with teacher links), Section Breakdown, Campus Comparison, Principles Compliance.

---

## ESL Coordinator Scope & Sequence

`ESL_Programming_Plans/ESL_Coordinator_Scope_Sequence.html` — Jul 2026–Jun 2027 school year. Two views: Interactive Tracker + Spreadsheet Reference. State in `esl_scope_data`.

---

## Classroom Walkthrough Planning Template

`Academic_Monitoring_Leader_Facing/Academic_Monitoring_Planning_Template.html`

- **`ROUND_TYPES`** (3): Procedural (blue), Conceptual (purple), Engagement (green)
- **`ROW_CONFIG`** (6): Target Teachers, Date/Time, Look-For, Evidence Code, Gaps, Response
- **`SUGGESTION_BANK`** (7 categories): CFU, Discourse, Scaffolding, Engagement, Rigor, ESL, ELPS Alignment
- **Calendar Export**: `exportCalendar()` → RFC 5545 `.ics`, one VEVENT per round; warns if no YYYY-MM-DD found in Date/Time cell
- **Pipeline**: `launchAuditFollowUp()` and `startCycleFromAction(idx)` for cross-tool handoffs

---

## Walkthrough Dashboard

`Academic_Monitoring_Leader_Facing/Walkthrough_Dashboard.html` — 5 views: Code Distribution, Teacher Trends, Focus Area Comparison, Coaching Pipeline, Campus Trends. "Generate Report" produces print-optimized PDF overlay.

---

## Coaching Cycle Tracker

`Academic_Monitoring_Leader_Facing/Coaching_Cycle_Tracker.html` — 5 stages: Observation → Feedback → Action Step → Follow-Up → Growth. ICS calendar export. `?teacher=NAME` param. `checkHandoff()` reads `coaching_cycle_handoff` on load.

---

## Data Backup Hub

`Data_Backup_Hub.html` — Export/import all localStorage keys. GitHub Gist sync. Google Drive sync (via `esl_gas_sync`). `IMPORT_VALIDATORS` validates structure before writing.

---

## Google Apps Script — Drive Sync Backend

`google_apps_script/Code.gs` — See `google_apps_script/README.md` for full deployment guide.

- **Folder**: `FOLDER_ID = '1FvxiBn6-SmLa2RKXWXdE7DMufwm0tOVo'`
- **File naming**: `{coordinatorId}_data.json`
- **GET**: `status`, `read`, `readAll`, `list`, `readKey`
- **POST**: `sync`, `syncKey`, `delete`, `sendReminders`
- **Email reminders**: `COORDINATOR_EMAIL_MAP` keyed by coordinatorId; `OVERDUE_DAYS=7`, `STALLED_DAYS=14`
- **Trigger**: `createWeeklyTrigger()` → Monday 7AM `weeklyReminderJob()` — deployed 2026-02-26

---

## ELPS Knowledge Base Agent

`ELPS_Agent/ELPS_Agent.html` — PDF.js full-text search + optional Anthropic API RAG Q&A. Keys: `elps_agent_docs`, `elps_agent_index`, `elps_agent_settings`, `elps_agent_history`.

---

## PWA & Offline Support

- **Cache version**: `esl-suite-v4` — **bump to v5** when adding new HTML files next time
- Cache-first with network fallback. All 18 HTML files + Chart.js CDN pre-cached.
- Every HTML file registers `./service-worker.js` and links `./manifest.json`.

---

## Dark Mode

- `body.dark-mode` class, `esl_app_theme` key (`"dark"` / `"light"`), toggle in every header
- ESL Classroom Audit uses `body.dark` + `esl_audit_dark_mode` but syncs with `esl_app_theme`
- ELPS Agent has its own dark mode system
