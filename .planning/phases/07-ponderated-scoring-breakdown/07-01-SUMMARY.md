# Plan 07-01 Summary: Ponderated Scoring Engine + Weight Toggle UI + URL Param Persistence

## Goal
Extend the scoring engine with ponderated (weighted) average computation, build the 3×4 attribute toggle UI, and wire URL search param persistence across both division routes.

## What Was Done
- Extended `app/lib/scoring/player-average.ts` with:
  - `PonderatedAverages` interface (extends `PlayerAverages` with `ponderatedGlobalAverage` and `boostedAttributes`)
  - `parseWeightParams(request)` function to extract and validate `?w=` URL params against `ATTRIBUTE_KEYS` allowlist
  - `calculatePonderatedAverages(reports, boostedAttrs)` function with 3x/1x weighting, null exclusion from denominator, and [1,5] clamping
  - Exported `ATTRIBUTE_KEYS` const array (was previously non-exported)
- Created `app/components/attribute-toggle.tsx`:
  - 3 category sections (Físico, Técnico, Tático) with 2×2 grids (12 total toggle buttons)
  - Uses `useSearchParams()` with functional update form to avoid stale closures
  - Hidden checkbox + styled label pattern with accent color for active state
  - URL updates with `?w=pace,finishing` format
- Updated `app/routes/division/players.tsx`:
  - Loader accepts `{ request }` and calls `parseWeightParams(request)`
  - Computes `playerWeightedAverages` record for all players when weights active
  - Component renders `<AttributeToggle>` above player list
  - `effectiveSortBy` overrides to `"weightedScore"` when weights active
  - Passes `boostedAttrs` and `playerWeightedAverages` to `PlayerList`
- Updated `app/routes/division/players.$id.tsx`:
  - Loader accepts `{ params, request }` and calls `parseWeightParams(request)`
  - Uses `calculatePonderatedAverages` instead of `calculatePlayerAverages`
  - Renders `<AttributeToggle>` above `PlayerScores`
- Extended `PlayerListProps` with optional `boostedAttrs` and `playerWeightedAverages` props

## Verification
- `npm run typecheck` passes
- All acceptance criteria met:
  - `calculatePonderatedAverages` exported and functional
  - `parseWeightParams` validates against `ATTRIBUTE_KEYS` allowlist
  - `ATTRIBUTE_KEYS` exported
  - Toggle uses `setSearchParams((prev) => ...)` functional update
  - Both division route loaders parse weights from URL
  - Null attributes excluded from weighted denominator

## Files Changed
- `app/lib/scoring/player-average.ts` (extended)
- `app/components/attribute-toggle.tsx` (new)
- `app/routes/division/players.tsx` (modified)
- `app/routes/division/players.$id.tsx` (modified)
- `app/components/player-list.tsx` (props extended)

## Status
✅ Complete
