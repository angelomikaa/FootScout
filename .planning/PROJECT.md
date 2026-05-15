# FootScout

## What This Is

FootScout is a soccer scouting dashboard for U15 youth prospect capture. Scouts manually enter detailed player observations (physical, technical, tactical, and match notes) which the system transforms into consistent, weighted visual profiles. The scouting division browses, compares, and tracks prospects over time — deciding who to sign now versus who to keep monitoring.

## Core Value

The weighted scoring engine — ponderated averages from 1 to 5 that shift based on what the division is looking for, with transparent breakdowns showing why a player's score rises or falls under specific search parameters.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Scouts can submit detailed player reports with physical, technical, tactical, and match-note data
- [ ] System calculates ponderated averages (1-5 scale) with configurable per-search weights
- [ ] Scouting division can browse player list and drill into detailed visual profiles
- [ ] Player profiles show score breakdowns: simple average, ponderated average, and what drives the difference
- [ ] Multiple scouts can report on the same player; scores are averaged automatically
- [ ] Division can track players over time (watchlist) and mark players for signing
- [ ] Visual presentations include radar charts, score bars, and comparative views

### Out of Scope

- External data APIs (Wyscout, InStat, etc.) — manual entry only for v1
- Biometric maturation / relative age effect analysis — deferred to future
- Club management / director access — scouts and division only for v1
- Predefined position templates for weight presets — scouts define weights custom per search

## Context

- Existing codebase: React Router 7 (framework mode) + Tailwind CSS 4 + Vite 8 + TypeScript
- Scaffolded from create-react-router template (single home route, no business logic)
- U15 scouting has high roster churn — tracking over time is as important as immediate signing decisions
- Signing decisions are opportunistic: a strong player might be tracked long-term if their position is covered, or signed immediately if there's a gap
- The weighted scoring system is the key differentiator — it lets the division ask "who's the best finisher?" and get an answer where finishing actually matters

## Constraints

- **Tech stack**: React Router 7 + Tailwind CSS 4 + TypeScript (already scaffolded)
- **Data entry**: Manual only — no external API integrations
- **Age category**: U15 only in v1 (no maturation-adjusted scoring)
- **Users**: Two roles — scouts (data entry) and division (appraisal/decisions)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom weights per search | Position needs vary; a striker search weights finishing, a midfielder search weights passing — templates were considered but real-world scouting adjusts dynamically | — Pending |
| Averaged multi-scout reports | Reduces individual bias; conflicting assessments get smoothed | — Pending |
| 1-5 scoring scale | Standard in football scouting; granular enough without overwhelming | — Pending |
| Track-over-time + sign model | Roster building is both frequent and opportunistic; need both workflows | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-11 after initialization*
