---
phase: 05-player-profile
plan: 02
subsystem: "Player List → Profile Navigation & Report Stats"
tags:
  - player-list
  - reports
  - navigation
  - data-layer
requires:
  - 05-01 (player profile route)
provides:
  - BROWSE-03 (navigate player list → profile)
  - D-20 (report count and last scouted)
affects:
  - app/data/data.ts
  - app/routes/division/players.tsx
  - app/components/player-list.tsx
tech-stack:
  added: []
  patterns:
    - "Parallel data fetching via Promise.all in route loaders"
    - "Dedicated stats aggregation function for player report metrics"
key-files:
  created: []
  modified:
    - app/data/data.ts
    - app/routes/division/players.tsx
    - app/components/player-list.tsx
decisions:
  - "reportStats is computed server-side and passed as a prop rather than client-side map — consistent with server-first pattern"
  - "getPlayerReportStats() returns a flat Record for O(1) lookup by playerId"
  - "Only submitted reports (not drafts) are counted"
  - "Last scouted date is the most recent matchDate, not createdAt"
metrics:
  duration: 0.2 hours
  completed: "2026-05-14"
---

# Phase 5 Plan 2: Player List → Profile Wiring

**One-liner:** Player names in the table are now clickable links navigating to `/division/players/:id`, and the Reports/Last Scouted columns show real data from submitted reports instead of hardcoded stubs.

## Summary

Wired the division player list to the player profile route by (1) adding a `getPlayerReportStats()` data helper that aggregates report counts and latest scouted dates across all players, (2) updating the route loader to fetch both players and stats in parallel, and (3) updating the `PlayerList` component to consume real data and wrap player names in `<Link>` elements.

## Tasks

| # | Name | Type | Commit | Files |
|---|------|------|--------|-------|
| 1 | Add `getPlayerReportStats()` helper to data.ts | auto | `e4b2f6a` | app/data/data.ts |
| 2 | Wire PlayerList with clickable links, real report counts, and real last scouted dates | auto | `a8e1bd8` | app/routes/division/players.tsx, app/components/player-list.tsx |

## Details

### Task 1 — `getPlayerReportStats()` helper

Added a new exported async function that:
- Calls `getReports()` to get all reports
- Iterates over reports, filtering to `status === "submitted"` only (excludes drafts)
- Per player, tracks report count and the maximum `matchDate` string
- Returns `Record<playerId, { count: number; lastScouted: string | null }>`
- Edge case: if a player has no submitted reports, they simply have no entry in the record — consumers use `stats[id]?.count ?? 0`

### Task 2 — Route loader + PlayerList updates

**Route (`players.tsx`):**
- Updated import to include `getPlayerReportStats`
- Changed loader from sequential to parallel `Promise.all([getPlayers(), getPlayerReportStats()])`
- Destructures `reportStats` from loader data and passes it as a prop to `<PlayerList>`

**PlayerList (`player-list.tsx`):**
- Added `import { Link } from "react-router"`
- Added `reportStats` prop to interface and destructured in function signature
- Replaced `getReportCount` stub (always returned 0) with `reportStats[player.id]?.count ?? 0`
- Replaced `getLastScouted` stub (used `createdAt`) with `reportStats[player.id]?.lastScouted`, formatted as locale date string, falling back to `"-"`
- Player name cell now wraps in `<Link to={`/division/players/${player.id}`}>` with `text-gray-900 hover:text-blue-600` (not blue until hover)

## Verification

- [x] Task 1: `getPlayerReportStats()` exported from data.ts (line 249)
- [x] Task 1: Only counts submitted reports (filters `report.status !== "submitted"`)
- [x] Task 1: Tracks latest matchDate lexicographically (ISO YYYY-MM-DD strings compare correctly)
- [x] Task 1: Edge case: empty reports → returns `{}`
- [x] Task 2: `Link` imported in player-list.tsx (line 1)
- [x] Task 2: `reportStats` prop added to `PlayerListProps` (line 9)
- [x] Task 2: Player name wrapped in `<Link to={`/division/players/${player.id}`}>` (line 273-278)
- [x] Task 2: `getReportCount` uses `reportStats[player.id]?.count ?? 0` (line 59)
- [x] Task 2: `getLastScouted` uses `reportStats[player.id]?.lastScouted` (line 53-54)
- [x] Task 2: Route loader imports and calls `getPlayerReportStats()` (line 2, 9)
- [x] Task 2: Route passes `reportStats` to `<PlayerList>` (line 107)
- [x] `npm run typecheck` passes
- [x] Git log shows both commits

## Success Criteria

- [x] Player names are clickable and navigate to `/division/players/:id`
- [x] Reports column shows actual submitted report count (not hardcoded 0)
- [x] Last Scouted column shows most recent `matchDate` (not `createdAt`)
- [x] Players with no reports correctly show `0` and `"-"` respectively
- [x] All filter/sort/search behaviors preserved
- [x] TypeScript type checking passes

## Deviations from Plan

None — plan executed exactly as written.

## Stubs

None introduced.

## Threat Flags

None — all changes are within the bounds assessed by the plan's threat model (T-05-04, T-05-05, T-05-06).

## Self-Check: PASSED

- `app/data/data.ts` — exists, contains `getPlayerReportStats`
- `app/routes/division/players.tsx` — exists, contains `getPlayerReportStats` and `reportStats`
- `app/components/player-list.tsx` — exists, contains `Link` and `reportStats`
- Commits `e4b2f6a` and `a8e1bd8` — both found in git log
