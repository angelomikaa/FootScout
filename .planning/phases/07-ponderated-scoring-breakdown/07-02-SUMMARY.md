# Plan 07-02 Summary: Score Breakdown Accordion + Weighted Player List Sorting

## Goal
Build the score breakdown accordion with per-attribute delta table, extend the radar chart component to show both simple and ponderated headline numbers, and add weighted-average sorting to the player list.

## What Was Done
- Created `app/components/score-breakdown.tsx`:
  - Accordion with `useState` for open/closed state
  - Collapsed state shows "Média Simples: X.XX → Ponderada: Y.YY" with rotating chevron
  - Expanded state shows per-attribute delta table with 4 columns: attribute, simple contribution, ponderated contribution, delta
  - Null attributes show "Não observado" with "—" in numeric columns
  - Delta column uses accent color for positive, red for negative
  - Boosted attributes marked with asterisk and footnote
- Extended `app/components/player-scores.tsx`:
  - Accepts `PonderatedAverages` instead of `PlayerAverages`
  - Shows both simple and ponderated headline numbers when weights active
  - Renders `<ScoreBreakdown>` below radar when `boostedAttributes.length > 0`
  - Preserves original behavior (simple average only) when no weights
- Updated `app/components/player-list.tsx`:
  - Added `"weightedScore"` case to sort switch statement
  - Added "Pontuação" column header (sortable) when weights active
  - Score column shows `ponderatedGlobalAverage.toFixed(2)` with accent styling
  - Players without reports show "—" in score column

## Verification
- `npm run typecheck` passes
- All acceptance criteria met:
  - `ScoreBreakdown` component exported and functional
  - Accordion uses `useState` with rotating chevron
  - Per-attribute delta table with correct computation
  - `player-scores.tsx` accepts `PonderatedAverages`
  - Player list sorts by weighted score when weights active
  - Score column appears only when weights active
  - Column header sorting works for all columns

## Files Changed
- `app/components/score-breakdown.tsx` (new)
- `app/components/player-scores.tsx` (extended)
- `app/components/player-list.tsx` (extended with weightedScore sort and score column)

## Status
✅ Complete
