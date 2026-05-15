---
phase: 04-player-list-search
plan: 01
subsystem: player-list
tags:
  - player-management
  - data-display
  - sorting
dependency_graph:
  requires: []
  provides:
    - Player list route at /division/players
    - PlayerList component with sortable columns
  affects:
    - app/routes.ts
tech_stack:
  added: []
  patterns:
    - React Router 7 loader pattern
    - URL-based sort state management
    - Client-side sorting with URL param persistence
key_files:
  created:
    - app/components/player-list.tsx
    - app/routes/division/players.tsx
    - app/routes/division/+types/players.ts
  modified:
    - app/routes.ts
decisions:
  - Used URL search params for sort state to enable bookmarkable URLs
  - Implemented client-side sorting for responsiveness
  - Created position badge using inline styles instead of shadcn/ui (not installed)
metrics:
  duration: PT5M
  completed: "2026-05-14T20:17:00Z"
---

# Phase 04 Plan 01: Player List Route and Sortable Table Summary

## One-liner
Player list route at `/division/players` with 6-column sortable table displaying all players from data layer.

## Completed Tasks

### Task 1: Verify getPlayers() function
- **Status:** ✅ Complete
- **Result:** `getPlayers()` function confirmed exported from `app/data/data.ts` (line 15)
- **Commit:** N/A (pre-existing)

### Task 2: Create PlayerList component
- **Status:** ✅ Complete
- **File:** `app/components/player-list.tsx`
- **Features:**
  - 6 columns: Player, Position, Club, Age, Reports, Last Scouted
  - Sortable column headers with click handlers
  - Sort indicators: ↑ (asc), ↓ (desc), ⇅ (inactive)
  - Empty state handling with "No players yet" message
  - Props: players, sortBy, sortDirection, onSort
  - Position displayed as badge-style span
  - Age calculated from dateOfBirth
  - Report count and last scouted as placeholders (Phase 5)
- **Commit:** `feat(04-01): create PlayerList component with sortable table`

### Task 3: Create /division/players route
- **Status:** ✅ Complete
- **File:** `app/routes/division/players.tsx`
- **Features:**
  - Loader calls `getPlayers()` from data layer
  - Uses `useLoaderData` hook to access player data
  - Sort state managed via URL search params (sortBy, sortDirection)
  - Default sort: createdAt desc
  - Renders PlayerList component with sort handlers
- **Commit:** `feat(04-01): create player list route with loader`

### Route Configuration
- **File:** `app/routes.ts`
- **Change:** Added division/players route under prefix("division", ...)
- **Commit:** `feat(04-01): add division/players route to config`

## Verification Results

### Automated Verification
- [x] `getPlayers()` export confirmed in `app/data/data.ts`
- [x] `player-list.tsx` exists and exports `PlayerList` component
- [x] `players.tsx` route exists with loader function
- [x] TypeScript compilation passes
- [x] Route registered in `app/routes.ts`

### Manual Verification (pending)
- [ ] Navigate to `/division/players` — table displays all players
- [ ] Click column headers — sort toggles ascending → descending → no sort
- [ ] Verify default sort is by creation date (newest first)
- [ ] Verify empty state shows when no players exist

## Deviations from Plan

### None
Plan executed exactly as written.

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| Report count always 0 | `app/components/player-list.tsx` | 38-40 | Requires player-report relationship (Phase 5) |
| Last scouted uses createdAt | `app/components/player-list.tsx` | 33-35 | Requires report date tracking (Phase 5) |

## Files Created/Modified

### Created
- `app/components/player-list.tsx` (190 lines)
- `app/routes/division/players.tsx` (55 lines)
- `app/routes/division/` directory

### Modified
- `app/routes.ts` (added division/players route)

## Threat Model Compliance

| Threat ID | Component | Disposition | Status |
|-----------|-----------|-------------|--------|
| T-04-01 | Player list data | accept | ✅ Read-only display, no client mutation |
| T-04-02 | Player PII | accept | ✅ Only scouting-relevant data displayed |

## Self-Check: PASSED
- [x] All created files exist
- [x] TypeScript compilation passes
- [x] Route configuration updated
- [x] Summary created at `.planning/phases/04-player-list-search/04-01-SUMMARY.md`
