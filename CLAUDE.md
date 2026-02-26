# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Folder Structure

```
Manager_of_Multilingual_ESL_Coordinators/
├── index.html                              # Unified Home Page — tool launcher & activity hub
├── Data_Backup_Hub.html                    # Centralized backup/restore for all localStorage
├── ESL_Classroom_Audit/                    # ESL classroom environment audit
│   ├── ESL_Classroom_Audit.html
│   ├── Audit_Dashboard.html                # Chart.js audit trends dashboard
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
│   └── Language Decline Research/
│       ├── EB_Language_Decline_Research_Compilation.docx
│       └── EB_Language_Decline_Research_Compilation.md
├── ELPS_Agent/                             # ELPS knowledge base Q&A tool
│   ├── ELPS_Agent.html
│   ├── ELP 201 Teacher Toolkit Secondary.pdf
│   └── ELPS Summaries for Learning Objectives.pdf
├── Newcomer_Resources/                     # Newcomer ESL home resources
│   ├── ESL at Home English Weeks 5-8.pdf
│   └── ESL at Home English Weeks 9-12.pdf
├── Lesson_Planning/                        # Future lesson planning projects
└── CLAUDE.md
```

## Project Overview

A suite of single-file web applications for managing multilingual/ESL coordinators. All tools share the same conventions and localStorage-based data sharing.

## Development

Open any `.html` file directly in a browser. Changes take effect on reload. There are no build, lint, or test commands. No external dependencies except Chart.js CDN for dashboard files.

## Key Conventions

- All JS uses `var` declarations and ES5-compatible syntax (no arrow functions, no `let`/`const`, no template literals).
- CSS is embedded in `<style>` in `<head>`. JS is in a single `<script>` block before `</body>`.
- Visual style: blue gradient header (`linear-gradient(135deg, #2c3e6e, #4a90d9)`), Segoe UI font, white cards with `border-radius:10px`, `#f0f2f7` background.
- Event handlers via inline `onclick` or closure-wrapped `addEventListener`.
- Persistence via browser `localStorage` with debounced auto-save.

## Cross-Tool Data Sharing

All tools share localStorage when served from the same origin (same directory on `file://`).

| Key | Written By | Read By | Purpose |
|---|---|---|---|
| `esl_audit_data` | Audit | Audit, Backup Hub, Home | Current working audit |
| `esl_audit_history` | Audit | Audit, Audit Dashboard, Backup Hub, Home | Saved audit archive |
| `esl_audit_campuses` | Audit | Audit, Backup Hub | Campus name list |
| `walkthrough_plan_data_v2` | Planner | Planner, Backup Hub, Home | Current walkthrough session |
| `walkthrough_history` | Planner | Planner, Walk Dashboard, Coaching Tracker, Backup Hub, Home | Saved walkthrough archive |
| `esl_scope_data` | Scope & Seq | Scope & Seq, Backup Hub, Home | Coordinator tracking state |
| `shared_teacher_roster` | Planner (auto-harvest) | Planner, Coaching Tracker, Backup Hub | Teacher name autocomplete list |
| `coaching_cycles_data` | Coaching Tracker | Coaching Tracker, Backup Hub, Home | Coaching cycle state |
| `walkthrough_audit_handoff` | Planner (temp) | Audit (consumed on load) | Walkthrough → Audit pipeline context |
| `elps_agent_docs` | ELPS Agent | ELPS Agent, Backup Hub | ELPS document chunks |
| `elps_agent_index` | ELPS Agent | ELPS Agent | Inverted search index |
| `elps_agent_settings` | ELPS Agent | ELPS Agent | API key, model preference |
| `elps_agent_history` | ELPS Agent | ELPS Agent | Recent query history |

---

## Unified Home Page

`index.html` — Landing page that links all tools and shows cross-tool activity.

- **Stats bar**: Audits saved, walkthroughs, teachers in roster, coaching cycles
- **Tool grid**: Cards linking to each tool with live status badges (e.g., "3 active coaching cycles")
- **Alerts**: Overdue coaching actions, stalled coaching cycles, high-score celebrations, onboarding nudges
- **Recent Activity**: Merged timeline from `esl_audit_history` and `walkthrough_history`, sorted by date
- **Link to Data Backup Hub** in header

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
| Score Trends | Line | Date range, Campus, Teacher |
| Section Breakdown | Horizontal Bar | Date range, Campus |
| Campus Comparison | Grouped Bar | Date range |
| Principles Compliance | Stacked Bar | Date range, Campus |

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
8. **Quick-Code Floating Bar**: Fixed bottom bar for fast mobile observation entry — round selector, teacher autocomplete, code buttons (✓/O/P/NA), notes, auto-timestamped. Toggle via toolbar button.

### Key Function Groups

- **Grid**: `renderGrid()`, `addRound()`, `removeLastRound()`, `removeRound()`, `toggleExample()`.
- **Observations**: `renderObservations()`, `addObservation()`, `removeObservation()`.
- **Coaching**: `renderCoaching()`, `addCoachingAction()`, `removeCoachingAction()`.
- **Metrics**: `computeMetrics()`, `renderMiniDash()` — hooked into observation/coaching renders.
- **History**: `saveToWalkthroughHistory()`, `getWalkthroughHistory()`, `renderHistoryList()`, `loadFromWalkthroughHistory()`, `deleteFromWalkthroughHistory()`.
- **Roster**: `getRoster()`, `saveRoster()`, `addToRoster()`, `harvestTeachers()`, `showAutocomplete()`, `pickAutocomplete()`.
- **Quick-Code**: `toggleQuickCode()`, `selectQCCode()`, `submitQuickCode()`, `updateQCRounds()`.
- **Pipeline**: `launchAuditFollowUp()` — writes handoff and opens audit tool.
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
- **Cycle Board**: Cards with 5-stage visual pipeline (color-coded dots + progress bar), expandable stage editors
- **Filter bar**: Teacher text search, campus dropdown, status (All/Active/Completed)
- **Stats row**: Active cycles, completed, avg days, teachers in coaching
- **Shared roster**: Reads `shared_teacher_roster` for teacher autocomplete

---

## Data Backup Hub

`Data_Backup_Hub.html` — Centralized export/import for ALL localStorage data across all tools.

### Features

- **Status dashboard**: Card per key showing tool name, status (Has Data/Empty), item count, data size
- **Export All**: Downloads single JSON with all keys as `ESL_Tools_Backup_YYYY-MM-DD.json`
- **Import All**: File picker + paste, preview with per-key sizes and overwrite warnings
- **Selective export/import**: Per-key checkboxes
- **Clear individual keys**: Danger button with confirmation

Manages all keys listed in the Cross-Tool Data Sharing table above.

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
