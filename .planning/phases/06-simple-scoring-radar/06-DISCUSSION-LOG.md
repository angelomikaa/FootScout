# Discussion Log — Phase 6: Simple Scoring & Radar

**Date:** 2026-05-15  
**Participants:** User + OpenCode  
**Trigger:** `/gsd-next` → `/gsd-discuss-phase 6`

## Areas Discussed

### 1. Score Aggregation Model
- **Options presented:** Both (radar + headline) vs Per-attribute only
- **Selected:** Both — per-attribute averages for the 12-axis radar + a single global headline number
- **Notes:** Nulls excluded from denominator in both calculations. Only submitted reports count.

### 2. Radar Chart Design
- **Options presented:** Standard Recharts (filled, clean) vs Minimal (outline only)
- **Selected:** Standard Recharts `RadarChart` with filled polygon, axis labels, app accent color
- **Notes:** 12 axes total. No extra flourishes.

### 3. Profile Layout & Integration
- **Options presented:** Above reports / Between identity and reports / Bottom (current position)
- **Selected:** Above the scout reports section — score is the first thing on the profile after the identity card

## Decisions Recorded

All decisions written to `06-CONTEXT.md`.
