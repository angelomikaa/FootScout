# Plan 08-01 Summary: Comparison Route with Dual Radar + Delta Table

## Goal
Create the comparison route (`/division/compare`) with dual-player radar overlay and per-attribute delta table, respecting active weight configuration.

## What Was Done
- Created `app/routes/division/compare.tsx`:
  - Loader parses `players` URL param (comma-separated IDs), redirects if fewer than 2
  - Parses weight params using existing `parseWeightParams(request)`
  - Fetches both players and their reports in parallel
  - Computes `PonderatedAverages` for each player
  - Returns `{ playerA, playerB, averagesA, averagesB, boostedAttrs }`
  - Component renders:
    - Back link to player list
    - Page title with both player names
    - `AttributeToggle` for live weight adjustment
    - Global averages display (simple + ponderated) in two-column layout
    - Single `RadarChart` with two overlaid `<Radar>` elements (blue for A, red for B)
    - Legend below radar with colored dots and player names
    - `ComparisonDeltaTable` component below radar
  - ErrorBoundary handles missing players with pt-BR message
- Created `app/components/comparison-delta-table.tsx`:
  - Props: `averagesA`, `averagesB`, `playerAName`, `playerBName`
  - Table columns: Atributo | Player A | Player B | Delta (A−B)
  - All 12 ATTRIBUTE_KEYS in order
  - Delta color coding: green for positive, red for negative, gray for zero
  - Null attributes show "—" in all columns
  - Alternating row backgrounds for readability

## Verification
- `npm run typecheck` passes
- Comparison route loads with two players' data
- Dual radar renders with distinct colors (blue for A, red for B)
- AttributeToggle visible and functional
- Delta table shows correct A−B calculations with color coding
- Null attributes display "—" in all columns

## Files Changed
- `app/routes/division/compare.tsx` (new)
- `app/components/comparison-delta-table.tsx` (new)

## Status
✅ Complete
