---
phase: 03-draft-report-management
plan: 03
subsystem: scout-reports
tags: [reports, table, scout, view]
dependency_graph:
  requires:
    - 03-01
    - 03-02
  provides:
    - Reports list view for scouts
    - Overall average calculation
  affects:
    - app/routes/scout/reports.tsx
    - app/components/reports-table.tsx
    - app/lib/scoring/average.ts
tech_stack:
  added:
    - calculateOverallAverage utility
    - ReportsTable component
  patterns:
    - Server-first data loading
    - Cookie-based scout identity
key_files:
  created:
    - app/lib/scoring/average.ts
    - app/components/reports-table.tsx
    - app/routes/scout/reports.tsx
  modified:
    - app/routes.ts
decisions:
  - Used matchResult from Report type (not matchNotes.result) for Result column
  - Scout dropdown uses URL search params for filter state
  - Overall average excludes nulls from denominator (D-12)
metrics:
  duration: ~15 minutes
  completed: "2026-05-13T21:16:00Z"
---

# Phase 03 Plan 03: Reports Table View Summary

**One-liner:** Created "My Reports" table view with 6-column display, scout filter dropdown, and null-excluding average calculation

## Objective

Create "My Reports" table view for scouts to review submitted reports with filtering, sortable columns, and overall average calculation.

## Completed Tasks

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create overall average calculation utility | `a191aec` | `app/lib/scoring/average.ts` |
| 2 | Create reports table component | `7149037` | `app/components/reports-table.tsx` |
| 3 | Create reports route and wire everything | `1afdaee` | `app/routes/scout/reports.tsx`, `app/routes.ts` |

## Key Features Implemented

### 1. Overall Average Calculation (`app/lib/scoring/average.ts`)
- `calculateOverallAverage(report: Report)`: Calculates average across physical, technical, and tactical attributes
- Excludes null values from denominator (D-12)
- Only includes attribute categories, not matchNotes
- `formatOverallAverage(report: Report)`: Returns formatted string with 2 decimal places

### 2. Reports Table Component (`app/components/reports-table.tsx`)
- 6-column table: Player, Match Date, Opponent, Competition, Result, Avg Score
- Empty state when no reports found
- Player name lookup from players list
- Result column uses `matchResult` field from Report type

### 3. Reports Route (`app/routes/scout/reports.tsx`)
- Route at `/scout/reports` (D-09)
- Loader fetches submitted reports filtered by scoutId
- Cookie-based scout identity (D-13)
- Scout dropdown filter (D-10) using URL search params
- Only shows submitted reports (excludes drafts)

### 4. Route Configuration (`app/routes.ts`)
- Added `/scout/reports` route to scout prefix

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed matchNotes.result reference**
- **Found during:** task 3 typecheck
- **Issue:** Plan specified `report.matchNotes.result` but the actual type has `matchResult` at the top level
- **Fix:** Changed to use `report.matchResult` which is the correct field per the Report type definition
- **Files modified:** `app/routes/scout/reports.tsx` (in ReportsTable component usage)
- **Commit:** `7149037`

**2. [Rule 3 - Blocking] Fixed imports for React Router patterns**
- **Found during:** task 3 typecheck
- **Issue:** Used `json` export which doesn't exist in react-router; used wrong import paths
- **Fix:** Changed to use `~` alias imports and proper Route.LoaderArgs type pattern from existing routes
- **Files modified:** `app/routes/scout/reports.tsx`
- **Commit:** `1afdaee`

## Threat Model Compliance

| Threat ID | Category | Component | Mitigation |
|-----------|----------|-----------|------------|
| T-03-07 | Tampering | URL scoutId param | Validated against scouts list in loader |
| T-03-08 | Information Disclosure | reports data | Scout-only view; reports filtered by scoutId |
| T-03-09 | Improper Authorization | cross-scout access | Server-side filter ensures scouts only see their own reports |

## Verification Results

- [x] TypeScript compilation passes: `npm run typecheck`
- [x] `app/lib/scoring/average.ts` exports `calculateOverallAverage`
- [x] `calculateOverallAverage` excludes null values from denominator
- [x] `ReportsTable` component shows 6 columns
- [x] `app/routes/scout/reports.tsx` has loader with scout filter
- [x] `app/routes.ts` includes `/scout/reports` route
- [x] Scout dropdown filters reports by scoutId

## Success Criteria Met

- [x] Scouts see table of their submitted reports
- [x] Table shows player, date, opponent, competition, result, average
- [x] Scout dropdown filters reports
- [x] Overall average correctly excludes nulls from denominator
- [x] Route accessible at `/scout/reports`

## Known Stubs

None - all features fully implemented.

## Threat Flags

None - all threat model mitigations implemented as specified.
