---
phase: "05-player-profile"
plan: "01"
subsystem: "player-profile"
tags:
  - route
  - component
  - identity-card
  - report-card
  - attribute-grid
  - score-placeholder
  - 404
  - empty-state
  - division
provides:
  - "app/routes/division/players.$id.tsx :: Profile page route with loader and 404 boundary"
  - "app/components/identity-card.tsx :: Player identity information card"
  - "app/components/report-card.tsx :: Scout report card with match context and attribute grids"
  - "app/components/attribute-grid.tsx :: 2x2 attribute score grid with em dash for null"
  - "app/components/score-placeholder.tsx :: Dashed-border placeholder for Phase 6 scoring"
  - "app/routes.ts :: Route registration for /division/players/:id"
requires: []
affects:
  - "app/routes/division/players.tsx :: Future integration: player name links will point here"
  - ".planning/phases/05-player-profile/05-02-PLAN.md :: Next plan: wire player list with links"
tech-stack:
  added: []
  patterns:
    - "Route param convention: `players.$id.tsx` for React Router 7 framework mode"
    - "Loader fetches player + reports + scouts in parallel via Promise.all"
    - "Attribute grid for category scores with null-safe rendering (em dash)"
    - "Flag emoji derived programmatically from ISO 3166-1 alpha-2 code"
    - "ErrorBoundary for route-level 404 handling with back link"
key-files:
  created:
    - "app/components/attribute-grid.tsx (116 lines)"
    - "app/components/identity-card.tsx (97 lines)"
    - "app/components/report-card.tsx (72 lines)"
    - "app/components/score-placeholder.tsx (22 lines)"
    - "app/routes/division/players.$id.tsx (120 lines)"
  modified:
    - "app/routes.ts (+1 line)"
decisions: []
metrics:
  duration: "~10 min"
  completed_date: "2026-05-14"
  task_count: 2
  commit_count: 1
self_check: "PASSED"
---

# Phase 5 Plan 01: Player Profile Core

## One-liner

Player profile route (`/division/players/:id`) with IdentityCard, ReportCard (4 category grids per report), AttributeGrid (null→"—"), ScorePlaceholder for Phase 6, and 404 ErrorBoundary — all wired to existing data layer.

## What Was Built

### Route
- **`app/routes/division/players.$id.tsx`** (120 lines) — Profile page route using React Router 7 param file convention. Loader fetches player via `getPlayerById()`, reports via `getReportsByPlayer()`, and scouts via `getScouts()` in parallel. Reports filtered to `submitted` only, sorted newest first by `matchDate`. Scout names mapped by ID for display. 404 ErrorBoundary with "Player not found" message and back link to `/division/players`.

### Components
- **`app/components/attribute-grid.tsx`** (116 lines) — 2×2 grid of attribute scores. Category heading in uppercase tracking-wider label. Each row shows label and either a blue score pill or an em dash for null. Includes `getFlagEmoji()` helper for ISO→flag emoji conversion. Handles notes field exclusion from grid rows.

- **`app/components/report-card.tsx`** (72 lines) — Individual scout report card with match context header (date, opponent, competition, scout name, optional match result) and four `AttributeGrid` sections (Physical, Technical, Tactical, Match Notes). Destructures `notes` from Match Notes to pass as separate prop to AttributeGrid.

- **`app/components/identity-card.tsx`** (97 lines) — Player identity card with name (xl bold), position group + specific badges, club, and a responsive details grid (2 cols mobile, 3 cols sm+) showing nationality with flag emoji, DOB+age, preferred foot, height (optional), weight (optional). Age calculated from dateOfBirth with birthday-year adjustment.

- **`app/components/score-placeholder.tsx`** (22 lines) — Dashed-border container with `id="player-scores"` for Phase 6 targeting. Shows "Player Scores" heading and "Scoring and radar charts coming in Phase 6" message. Minimum height of `min-h-[200px]` to reserve layout space.

### Route Config
- **`app/routes.ts`** — Added `route("players/:id", "routes/division/players.$id.tsx")` after the existing players route in the division prefix.

## Verification

| Check | Result |
|-------|--------|
| Route file exists | ✅ `players.$id.tsx` in routes/division |
| Components exist | ✅ All 4 components created |
| Route registered | ✅ `players/:id` route in routes.ts |
| TypeScript typecheck | ✅ Passes with 0 errors |
| Commit | ✅ `4c6fc43` feat(05-01): create player profile route and display components |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MatchNotes type incompatibility with AttributeGrid**
- **Found during:** Task 2
- **Issue:** `report.matchNotes` has a `notes?: string` field, but `AttributeGrid` props expect `attributes: Record<string, number | null>`. TypeScript rejected the direct assignment.
- **Fix:** Destructured `{ notes, ...matchNotesAttributes }` from `report.matchNotes` in `ReportCard` and passed `notes` as a separate prop to `AttributeGrid`.
- **Files modified:** `app/components/report-card.tsx`
- **Commit:** `4c6fc43`

### Auto-added Functionality

None — plan executed as designed.

### Architectural Decisions

None — all decisions within autonomy boundary.

## Verification Details

### Automated Checks Passed
- ✅ All 5 files exist at specified paths
- ✅ TypeScript type checking passes (`npm run typecheck`)
- ✅ Route file follows `players.$id.tsx` convention
- ✅ Components export named functions matching plan spec
- ✅ `getFlagEmoji()` helper available in attribute-grid.tsx
- ✅ null attribute values render as em dash, not 0
- ✅ Reports sorted newest first by matchDate
- ✅ Submitted reports filtered (status === "submitted")
- ✅ ScorePlaceholder has `id="player-scores"` attr for Phase 6

### Contract Verification

| Copywriting Contract | Status |
|---------------------|--------|
| "← Back to players" | ✅ Link above identity card |
| "Scout Reports" section | ✅ With heading |
| "No reports yet for this player" | ✅ Empty state |
| "Scout Area" link | ✅ Links to /scout/report |
| "Player Scores" placeholder | ✅ With Phase 6 message |
| "Player not found" 404 | ✅ ErrorBoundary with explanation and back link |

| UI Design Spec | Status |
|----------------|--------|
| Vertical sections with space-y-8 | ✅ Identity → Reports → Scores |
| border-t separators | ✅ Between sections |
| Identity card bg-gray-50 with shadow | ✅ |
| Report card bg-white with border | ✅ |
| Score pill bg-blue-50 text-blue-700 | ✅ |
| Null→"—" in text-gray-300 | ✅ |
| Dark mode via `dark:` variants | ✅ All components |

## Threat Surface Scan

No new threat surface introduced beyond what the threat model accepts (T-05-01, T-05-02, T-05-03 all `accept` disposition).

## Blockers

None.

## Self-Check: PASSED

All files verified by `Test-Path` or `Get-ChildItem`. TypeScript type checking passes. Commit `4c6fc43` confirmed.
