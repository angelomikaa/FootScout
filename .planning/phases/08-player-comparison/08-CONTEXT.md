# Phase 08 Context: Player Comparison

## Domain
Side-by-side comparison of two players with radar overlay and weight-aware scoring, enabling relative evaluations for signing or tracking decisions.

## Decisions

### Player Selection
- Individual "Compare" button on each player row in the player list
- Clicking "Compare" on the first player highlights them as "Player A"
- Clicking "Compare" on a second player navigates to the comparison view
- If a player already has a "Compare" button active, clicking it deselects them
- A floating bar appears when one player is selected: "1 player selected — select another to compare"

### Comparison View Layout
- Single Recharts RadarChart with two overlaid `<Radar>` elements
- Player A uses the existing accent color (`--color-fm-accent, #2563eb`)
- Player B uses a distinct secondary color (e.g., `#ef4444` / red)
- Both polygons visible simultaneously for immediate shape comparison
- Below the radar: per-attribute data table with columns: Attribute | Player A | Player B | Delta
- Delta column shows Player A − Player B with green for positive, red for negative

### Comparison Entry Point
- Player list only for Phase 8 (roster-vs-prospect comparison deferred to v2)
- "Comparar" button on each row in `player-list.tsx`
- Selection state managed via URL search params: `?compare=player-001,player-002`
- When two players are selected via URL params, the comparison route loads

### Weight Behavior in Comparison
- Active weights from URL params (`?w=pace,finishing`) apply to both players automatically
- The `AttributeToggle` component is visible in the comparison view
- Adjusting weights recalculates both players' ponderated averages live
- Comparison route: `/division/compare?players=player-001,player-002` (weights via `&w=...`)

### Score Difference Display
- Per-attribute delta table shows: Attribute name | Player A value | Player B value | Delta (A−B)
- Delta column color-coded: green for positive (A > B), red for negative (A < B), gray for zero
- Global averages shown prominently above the radar: both simple and ponderated (when weights active)
- Null attributes show "—" in all columns

### Route Structure
- New route: `app/routes/division/compare.tsx`
- URL: `/division/compare?players=player-001,player-002`
- Loader fetches both players and their reports, computes averages (simple + ponderated)
- If fewer than 2 players specified, redirect to player list with a notice

## Canonical Refs
- `.planning/ROADMAP.md` — Phase 8 requirements (COMP-01, COMP-02, COMP-03)
- `.planning/REQUIREMENTS.md` — COMP-01, COMP-02, COMP-03 definitions
- `app/lib/scoring/player-average.ts` — `calculatePonderatedAverages()`, `PonderatedAverages`, `ATTRIBUTE_KEYS`
- `app/components/player-scores.tsx` — Existing RadarChart pattern to reuse/extend
- `app/components/attribute-toggle.tsx` — Weight toggle component (reuse in comparison view)
- `app/components/player-list.tsx` — Player list (needs "Compare" button per row)
- `app/routes/division/players.tsx` — Player list route (needs compare selection state)
- `app/components/attribute-grid.tsx` — `ATTRIBUTE_LABELS` for delta table rows
- `app/routes/division/players.$id.tsx` — Profile route (reference for loader pattern)

## Code Context
- Recharts already installed with RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer
- Two `<Radar>` elements can coexist in one `<RadarChart>` (multi-series support)
- URL search params already used for weights (`?w=`) and sorting (`sortBy`, `sortDirection`)
- `PonderatedAverages` interface available with `ponderatedGlobalAverage` and `boostedAttributes`
- pt-BR translation pattern established across all routes and components
- Turso DB with `getPlayerById()` and `getReportsByPlayer()` for data fetching

## Deferred Ideas
- Roster management system (DEC-01, DEC-02 in v2) — track signed/monitored players
- Roster-vs-prospect comparison — compare a roster member against a potential signing
- Multi-player comparison (3+ players) — Phase 8 is strictly 2-player
- Export comparison as PDF or image
