# Plan 06-01 Summary: Player-Level Scoring Aggregation

## Goal
Aggregate per-attribute averages across all submitted reports for a player, producing a 12-axis score profile + global headline number.

## What Was Done
- Created `app/lib/scoring/player-average.ts` with `calculatePlayerAverages()` function
- Function iterates all submitted reports, accumulates per-attribute sums and counts (excluding nulls)
- Returns `{ attributes: Record<string, number>, globalAverage: number, reportCount: number }`
- Global average computed from all attribute averages that have data
- Returns nulls for all values when no reports exist

## Verification
- `npm run typecheck` passes
- Server returns correct globalAverage for players with reports (e.g., player-001: 2.75, player-019: 3.44)
- Unscouted players return null averages (player-025)

## Files Changed
- `app/lib/scoring/player-average.ts` (new)

## Status
✅ Complete
