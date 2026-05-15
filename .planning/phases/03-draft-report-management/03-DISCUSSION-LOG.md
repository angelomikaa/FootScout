# Phase 3: Draft & Report Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 03-draft-report-management
**Areas discussed:** Draft Storage, Draft Resume UX, My Reports Layout, Report Summary Indicator, Scout Identity Persistence

---

## Draft Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Server JSON file | Add `drafts.json` alongside existing JSON files. Server-side, Zod-validated, survives browser close. | |
| Browser sessionStorage | Store draft in sessionStorage. No server round-trip, instant. Lost on tab close. | |
| Browser localStorage | Store draft in localStorage. No server round-trip, persists across sessions but tied to one device. | |

**User's choice:** Server JSON file, with note that spreadsheets (CSV/Excel) are the intended future data store — JSON files are fine for now.
**Notes:** Spreadsheets are more compatible with what the product aims to replace (current scouting workflow).

| Option | Description | Selected |
|--------|-------------|----------|
| Status field on report | Add `status: 'draft' \| 'submitted'` to reportSchema. One file, one query. Filter by status. | ✓ |
| Separate drafts.json file | Clean separation but adds file management and cross-file draft→report conversion. | |

**User's choice:** Status field on report

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-save per step | Save on every step transition. No data loss. More network calls. | |
| Manual save button | Explicit "Save as Draft" button. Fewer calls, risk of unsaved work loss. | |
| Auto-save + indicator | Auto-save on step transition + visible "Draft saved" indicator. Best of both worlds. | ✓ |

**User's choice:** Auto-save + indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Any scout can resume | Simpler, no ownership. Risk of cross-scout confusion. | |
| Scoped to scout | Drafts scoped via scoutId. "My drafts" filters by current scout. Prevents confusion. | ✓ |

**User's choice:** Scoped to scout

| Option | Description | Selected |
|--------|-------------|----------|
| One draft per scout | If scout starts new while draft exists, existing draft replaced (with confirmation). Simplest model. | ✓ |
| Multiple drafts per scout | Unlimited concurrent drafts. More flexible but adds draft-picker UI. | |

**User's choice:** One draft per scout

| Option | Description | Selected |
|--------|-------------|----------|
| Update status in-place | Status flips from 'draft' to 'submitted'. Same record, same ID. | ✓ |
| Delete + create new | Delete draft, create submitted report. Two writes, race condition risk. | |

**User's choice:** Update status in-place

---

## Draft Resume UX

| Option | Description | Selected |
|--------|-------------|----------|
| Resume at last step | Form restores all values and lands on the last step the scout was on. | ✓ |
| Always start at step 0 | All values pre-filled but scout starts from step 0. Extra clicks. | |

**User's choice:** Resume at last step

| Option | Description | Selected |
|--------|-------------|----------|
| Banner on form entry | When scout selects identity, banner shows: "You have an unsaved draft for [player]. Resume or discard?" | ✓ |
| Separate drafts list page | A "My Drafts" section listing in-progress drafts. More discoverable but adds route/page. | |

**User's choice:** Banner on form entry

| Option | Description | Selected |
|--------|-------------|----------|
| Draft is scout-scoped | Draft persists scoutId. On form load, check for draft belonging to current scout. | ✓ |
| Pick scout first, then check | Two-step: pick scout → then see draft banner. | |

**User's choice:** Draft is scout-scoped

---

## My Reports Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Table layout | Rows with columns: Player, Match Date, Opponent, Competition. Sortable, compact. Consistent with spreadsheet-like scouting data. | ✓ |
| Card layout | One card per report with player name, match info, score summary. More visual but less dense. | |
| Compact list | Minimal one-line per report. Click to expand. Very compact but requires expansion. | |

**User's choice:** Table layout

| Option | Description | Selected |
|--------|-------------|----------|
| Separate /scout/reports route | Clean separation — form is for entry, reports is for reviewing. | ✓ |
| Combined scout dashboard | Combine drafts and reports on one page (e.g., /scout/dashboard). | |

**User's choice:** Separate /scout/reports route

| Option | Description | Selected |
|--------|-------------|----------|
| Scout dropdown filter | Scout dropdown at top, table filters to that scout's reports. Same pattern as report form. | ✓ |
| Single scout (no filter) | Hardcode one scout for v1. Simpler but limited. | |

**User's choice:** Scout dropdown filter

| Option | Description | Selected |
|--------|-------------|----------|
| 3 columns (SCOUT-04 minimum) | Player name, match date, opponent. | |
| 4 columns | Add competition. Still compact. | |
| Full detail (6+ columns) | Player, date, opponent, competition, match result, summary indicator. Rich but wider. | ✓ |

**User's choice:** Full detail (6+ columns)

---

## Report Summary Indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Numeric average | Single number (e.g., '3.8') — simple average across all rated attributes. Quick to compute, easy to scan. | ✓ |
| Color badge | Green/yellow/red based on score range. Very scannable but loses precision. | |
| Category mini-bars | 4 tiny bars for P/T/T/M averages. Most visual but complex, may not fit table cell. | |

**User's choice:** Numeric average

| Option | Description | Selected |
|--------|-------------|----------|
| One overall number | Simple, compact, fits one table cell. Enough to spot standout/weak reports. | ✓ |
| Per-category numbers | Four numbers — one per category. More detail but wider cells. | |

**User's choice:** One overall number

---

## Scout Identity Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Pick every time | Scout selects identity on each page visit. Simplest, repetitive. | |
| Cookie-persisted scout | Store last-selected scoutId in cookie. Auto-select on load, changeable via dropdown. Survives refresh and navigation. | ✓ |
| sessionStorage | Persists within tab session, lost on tab close. Middle ground. | |

**User's choice:** Cookie-persisted scout

---

## OpenCode's Discretion

- Draft banner styling and placement
- "Draft saved" indicator position and animation
- Table column widths and responsive behavior
- Overall average number formatting (decimal places)
- Cookie name and expiration duration
- Confirmation dialog styling for draft replacement
- Sort direction defaults for the reports table

## Deferred Ideas

- Report editing (edit submitted reports) — future phase
- Division-side report views — Phase 4/5
- Per-category score breakdowns in reports table — Phase 5
- Spreadsheet/CSV data layer migration — future task
- Bulk draft management page — unnecessary with one-draft-per-scout model
