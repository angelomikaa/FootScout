# FootScout

## What This Is

FootScout is a soccer scouting dashboard for U15 youth prospect capture. Scouts manually enter detailed player observations (physical, technical, tactical, and match notes) which the system transforms into consistent, weighted visual profiles. The scouting division browses, compares, and tracks prospects over time — deciding who to sign now versus who to keep monitoring.

**Shipped v1.0** with 8 phases: data foundation → staged report form → draft management → player list/search → player profiles → simple scoring + radar → ponderated scoring + breakdown → player comparison.
**Shipped v1.1 Phase 9**: Navigation & UX Polish — fixed hotbar, unsaved changes guard, dedicated compare tab, home page cleanup.

## Core Value

The weighted scoring engine — ponderated averages from 1 to 5 that shift based on what the division is looking for, with transparent breakdowns showing why a player's score rises or falls under specific search parameters.

**Verified:** Still the right priority. Shipping confirmed that the score breakdown accordion (SCORE-05) is what makes the product different — scouts and division members immediately understand why weighting matters when they see the per-attribute deltas.

## Requirements

### Validated

- ✓ DATA-01 through DATA-05: Player/report data model with Zod validation — v1.0
- ✓ SCOUT-01, SCOUT-02: Staged report form with new player creation — v1.0
- ✓ SCOUT-03, SCOUT-04: Draft persistence + My Reports view — v1.0
- ✓ BROWSE-01 through BROWSE-04: Player list, search, profiles — v1.0
- ✓ SCORE-01 through SCORE-05: Simple averages, radar, ponderated weights, breakdown — v1.0
- ✓ COMP-01 through COMP-03: Side-by-side comparison with dual radar — v1.0
- ✓ NAV-01 through NAV-08: Fixed hotbar, dirty-form guard, dedicated compare route, home cleanup — v1.1 Phase 9

### Active

- [ ] Division can flag players as Sign, Monitor, or Pass (DEC-01)
- [ ] Division can save players to named watchlists/shortlists (DEC-02)
- [ ] Scout consistency indicator showing variance when scouts disagree (AGGR-01)
- [ ] Individual scout reports viewable separately within player profile (AGGR-02)
- [ ] Development timeline showing score evolution across reports (TIME-01)
- [ ] Visual freshness indicators flagging reports older than 3 months (TIME-02)
- [ ] Position-adaptive weight presets (POS-01)
- [ ] Exportable PDF scouting report (EXP-01)

### Out of Scope

- External data APIs (Wyscout, InStat, etc.) — manual entry only
- Biometric maturation / relative age effect analysis — deferred
- Club management / director access — scouts and division only
- Predefined position templates for weight presets — scouts define weights custom per search
- Video integration / clip tagging — massive infrastructure; manual entry is the intentional constraint
- Automated event data ingestion — completely different product model
- Transfer value estimation — not relevant for U15 youth
- xG / advanced analytics models — requires event-level data FootScout doesn't collect
- Physical tracking data (GPS/speed) — requires hardware; scouts rate what they see
- Multi-club / multi-organization access — single-division internal tool
- Player self-registration / public profiles — internal tool only
- AI-generated scouting reports — circular for a subjective-entry tool

## Context

- **Shipped:** v1.0 on 2026-05-15 (4 days, 65 commits, ~3,815 LOC TypeScript/TSX)
- **Shipped:** v1.1 Phase 9 on 2026-05-15 (2 commits, ~698 insertions, ~755 deletions)
- **Tech stack:** React Router 7 (framework mode, SSR) + Tailwind CSS 4 + TypeScript + Vite 8 + Recharts + Zod
- **Data layer:** JSON files (v1) — designed for swap to Supabase later
- **User feedback themes:** Score breakdown transparency is the standout feature; comparison view is highly valued for relative evaluations
- **Known issues:**
  - JSON file data layer needs migration to Supabase for production scale
  - No Nyquist validation files created for any phase
  - Radar chart shows same shape for simple vs ponderated (mathematically correct; ponderated overlay could be added)

## Constraints

- **Tech stack**: React Router 7 + Tailwind CSS 4 + TypeScript
- **Data entry**: Manual only — no external API integrations
- **Age category**: U15 only in v1 (no maturation-adjusted scoring)
- **Users**: Two roles — scouts (data entry) and division (appraisal/decisions)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom weights per search via URL params | Position needs vary; a striker search weights finishing, a midfielder search weights passing | ✓ Good — URL persistence enables bookmarking |
| Averaged multi-scout reports | Reduces individual bias; conflicting assessments get smoothed | ✓ Good — null exclusion prevents skew |
| 1-5 scoring scale | Standard in football scouting; granular enough without overwhelming | ✓ Good — "not observed" (null) prevents lazy 3s |
| Track-over-time + sign model | Roster building is both frequent and opportunistic; need both workflows | ✓ Good — comparison view validates this |
| JSON file data layer (v1) | Simple start, swap to Supabase later | ⚠️ Revisit — needs migration before production |
| Score breakdown ships WITH ponderated engine | Transparency is the product, not a polish feature | ✓ Good — standout user feedback |
| Staged form with single useForm | Simpler state management across 5 steps | ✓ Good — no circular dependency issues |
| Cookie-based scout identity (7-day) | D-13 requirement, enables draft resume | ✓ Good — auto-save on step transition works well |
| Hotbar replaces redundant home navigation cards | Horizontal space is abundant; sidebar would compete with table content | ✓ Good — clean, compact, consistent across pages |
| `requestNavigation` pattern over `useBlocker` | RR7's `useBlocker` doesn't catch link clicks, only browser nav | ✓ Good — covers hotbar clicks + browser back |
| Dedicated compare route over inline comparison | Inline made it hard to browse while comparing; dedicated tab allows parallel workflow | ✓ Good — combobox selectors are faster than toggle buttons |
| Actions panel on home above prospects | "Novo Relatório" was buried in hotbar; prominent panel increases discoverability | ✓ Good — primary action is now above the fold |
| Shared layout route (`_layout.tsx`) | DRY — header + hotbar on every page without duplicating in each route | ✓ Good — single source of truth for nav |

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
*Last updated: 2026-05-15 after v1.1 Phase 9 (Navigation & UX Polish)*
