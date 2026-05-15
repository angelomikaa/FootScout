# Phase 07 Context: Ponderated Scoring & Breakdown

## Domain
Weight controls that shift player scores based on what the division is looking for, with transparent breakdowns showing why the ponderated score differs from the simple average.

## Decisions

### Weight Control UI
- Toggle buttons for each of the 12 attributes
- Organized in a 3×4 grid matching categories (physical, technical, tactical)
- When toggled, all players recalculate with weighted scores
- Player list reorders by highest weighted average when weights are active
- Player name/position remains prominent alongside the score

### Weight Magnitude
- Fixed 3x multiplier for boosted attributes
- Untoggled attributes stay at 1x weight
- Formula: `weighted_avg = sum(attr_value * weight) / sum(weights)`

### Multiple Weights + Well-Roundedness
- Multiple attributes can be boosted simultaneously
- Scoring naturally favors well-rounded players: a player with 5 in one attribute but 1s elsewhere loses to a player with 4 in that attribute and 3s elsewhere
- The global weighted average (all 12 attributes in denominator) handles this — no additional "consistency" penalty needed

### Score Breakdown Display
- Compact accordion with chevron icon
- Expands to show per-attribute delta table: simple avg vs ponderated avg per attribute, and how much each contributed to the final score difference
- Collapsed state shows only the two headline numbers (simple vs ponderated)

### Weight Persistence
- Weights persist while browsing players (player list → profile → back to list)
- Weights reset when navigating to unrelated pages (home, scout entry)
- Implementation: URL search params on division routes, cleared on non-division navigation

### Player List Behavior
- When weights are active, list auto-re-sorts by weighted average (highest first)
- When weights are cleared, returns to original/default sort

## Canonical Refs
- `.planning/ROADMAP.md` — Phase 7 requirements (SCORE-03, SCORE-04, SCORE-05)
- `.planning/REQUIREMENTS.md` — SCORE-03, SCORE-04, SCORE-05 definitions
- `app/lib/scoring/player-average.ts` — Existing `calculatePlayerAverages()` function (base for ponderated version)
- `app/components/player-scores.tsx` — Existing radar chart component (will show both simple and ponderated)
- `app/routes/division/players.$id.tsx` — Profile route (needs weight-aware scoring)
- `app/routes/division/players.tsx` — Player list route (needs weight-aware sorting)
- `app/components/attribute-grid.tsx` — `ATTRIBUTE_LABELS` exported (reuse for toggle button labels)

## Code Context
- 12 scored attributes: pace, strength, stamina, agility, finishing, passing, dribbling, firstTouch, positioning, awareness, decisionMaking, workRate
- 3 categories: physical (4), technical (4), tactical (4)
- Recharts RadarChart already rendering on profile
- Turso DB with `reports` table containing per-report attribute values
- `calculatePlayerAverages()` returns `{ attributes, globalAverage, reportCount }` — ponderated version will accept weights as input
- URL search params already used for scout filter on reports page

## Deferred Ideas
- Position-adaptive weight presets (POS-01 in v2) — scouts define weights custom per search for v1
- Scout consistency indicators (AGGR-01 in v2)
