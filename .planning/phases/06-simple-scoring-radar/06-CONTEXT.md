# Phase 6: Simple Scoring & Radar — Context

**Created:** 2026-05-15  
**Source:** `/gsd-next` transition from Phase 5 + `/gsd-discuss-phase 6`

---

## Domain

Player profiles show visual score profiles based on simple averages across all scout reports. The profile already has IdentityCard + ReportCards + a ScorePlaceholder — this phase replaces the placeholder with real data and a radar chart.

---

## Requirements (from REQUIREMENTS.md)

- **SCORE-01**: System calculates simple average per attribute across all scout reports for a player
- **SCORE-02**: Player profile displays radar chart of attribute scores

Both must handle "not observed" (null) ratings correctly — exclude from denominator.

---

## Prior Decisions (carried forward)

- Attribute schema uses 1-5 integer or null (never treat null as 3) — from Phase 1
- `calculateOverallAverage()` exists in `app/lib/scoring/average.ts` (per-report avg) — will adapt for player-level
- ScorePlaceholder component exists at `app/components/score-placeholder.tsx` — will be replaced
- Reports table already displays per-report avg via `formatOverallAverage()`
- App uses Tailwind CSS 4, React Router 7 framework mode (SSR)
- Platform: Turso database, Vercel deployment

---

## Decisions (from discussion)

### Score Aggregation Model
- **Both levels**: Per-attribute averages for the radar chart (12 axes) + a single global headline number
- Per-attribute: mean of each attribute across all submitted reports (nulls excluded)
- Global: mean of the 12 per-attribute averages
- Only `status = 'submitted'` reports count (drafts excluded)

### Radar Chart
- **Library**: Recharts `RadarChart` component
- **Style**: Standard filled polygon with app accent color, axis labels on all 12 axes
- **12 axes**: pace, strength, stamina, agility, finishing, passing, dribbling, firstTouch, positioning, awareness, decisionMaking, workRate
- Clean look — no extra flourishes, grid lines subtle

### Profile Layout
- Order: IdentityCard → **Radar + headline score** → Scout Reports
- Score section goes ABOVE the report history (replaces current ScorePlaceholder position between identity and reports)
- Headline number displayed prominently near the radar chart

---

## Codebase Context

### Existing scoring code
- `app/lib/scoring/average.ts` — `calculateOverallAverage(report)` and `formatOverallAverage(report)` — per-report only, needs player-level aggregation
- `app/components/score-placeholder.tsx` — currently renders placeholder text, to be replaced
- `app/routes/division/players.$id.tsx` — profile route, renders ScorePlaceholder between identity and reports sections
- `app/components/report-card.tsx` — already uses `AttributeGrid` to show per-report scores

### Attribute structure
- 12 scored attributes across 3 categories (physical, technical, tactical) + 4 match-notes attributes (NOT included in scoring per D-12)
- Each attribute: `AttributeScore` = `number | null` (1-5 or not observed)
- Schema: `app/data/types.ts` lines 42-67

### Design system
- Accent color: `text-fm-accent` / `bg-fm-accent` / `fill-fm-accent` (Tailwind custom color)
- Card component: `rounded-lg border border-gray-200 dark:border-fm-border bg-white dark:bg-fm-card p-4`

---

## Canonical References

| Ref | Path |
|-----|------|
| Attribute types & scoring schema | `app/data/types.ts:38-77` |
| Per-report average calculation | `app/lib/scoring/average.ts` |
| Profile route (integration point) | `app/routes/division/players.$id.tsx` |
| ScorePlaceholder (to replace) | `app/components/score-placeholder.tsx` |
| Reports table (existing avg display) | `app/components/reports-table.tsx` |
| Phase 6 roadmap definition | `.planning/ROADMAP.md:95-102` |
| Requirement SCORE-01 / SCORE-02 | `.planning/REQUIREMENTS.md:32-33` |

---

## Deferred Ideas

None from this discussion.
