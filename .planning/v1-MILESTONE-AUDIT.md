---
milestone: v1
audited: 2026-05-15
status: gaps_found
scores:
  requirements: 19/21
  phases: 8/8
  integration: 3/4
  flows: 3/4
  nyquist:
    compliant_phases: []
    partial_phases: []
    missing_phases: [1, 2, 3, 4, 5, 6, 7, 8]
    overall: MISSING
gaps:
  requirements:
    - id: "SCOUT-03"
      status: "unsatisfied"
      phase: "3"
      claimed_by_plans: ["03-02-PLAN.md"]
      completed_by_plans: ["03-02-SUMMARY.md"]
      verification_status: "passed"
      evidence: "setScoutIdCookie() defined in app/cookies.server.ts but never called. Cookie never set, so getScoutIdFromCookie() always returns null. Drafts cannot auto-load on page revisit."
    - id: "SCOUT-04"
      status: "partial"
      phase: "3"
      claimed_by_plans: ["03-03-PLAN.md"]
      completed_by_plans: ["03-03-SUMMARY.md"]
      verification_status: "passed"
      evidence: "My Reports view exists and works, but requires ?scoutId=xxx URL param since cookie is never set. Functional but not user-friendly."
  integration:
    - from: "app/cookies.server.ts"
      to: "app/routes/scout/report.tsx"
      issue: "setScoutIdCookie() exported but never imported or called anywhere"
    - from: "app/routes/home.tsx"
      to: "current state"
      issue: "Home page status shows stale 'Phase 6: Next' text"
  flows:
    - name: "Scout submits report → My Reports → Player profile"
      breaks_at: "Scout identity cookie never set"
      detail: "SCOUT-03 (draft resume) and SCOUT-04 (my reports) broken without cookie"
tech_debt:
  - phase: 01
    items:
      - "DATA-01 through DATA-05 marked as Pending in REQUIREMENTS.md traceability table (implemented but not updated)"
  - phase: 02
    items:
      - "SCOUT-01, SCOUT-02 marked as Pending in traceability table"
  - phase: 04
    items:
      - "BROWSE-01, BROWSE-02 marked as Pending in traceability table"
      - "Search only covers player name; position/club are dropdown filters (BROWSE-02 partial)"
  - phase: 05
    items:
      - "BROWSE-04 marked as Pending in traceability table"
      - "Reports table has no clickable links to player profiles"
  - phase: 06
    items:
      - "SCORE-01, SCORE-02 marked as Pending in traceability table"
      - "Radar chart doesn't visually change when ponderated weights applied (only headline number changes)"
  - phase: 07
    items:
      - "SCORE-03 through SCORE-05 marked as Pending in traceability table"
  - phase: 08
    items:
      - "COMP-01 through COMP-03 marked as Pending in traceability table"
      - "Mixed English/Portuguese in search placeholder"
---

# Milestone v1 Audit Report

**Audited:** 2026-05-15
**Status:** GAPS_FOUND
**Score:** 19/21 requirements satisfied

## Executive Summary

All 8 phases have been implemented and committed. The division-facing flows (browse → profile → scoring → comparison) are excellently wired end-to-end. The scoring engine connections are solid. The single critical gap is the **scout identity cookie** (`setScoutIdCookie` is defined but never called), which blocks two scout-facing requirements (SCOUT-03, SCOUT-04).

## Requirements Coverage

| REQ-ID | Phase | Status | Evidence |
|--------|-------|--------|----------|
| DATA-01 | 1 | ✅ satisfied | Player entity with all identity fields in `app/data/types.ts` and `app/data/data.ts` |
| DATA-02 | 1 | ✅ satisfied | Report entity linked to player, `createReport()`, `getReportsByPlayer()` |
| DATA-03 | 1 | ✅ satisfied | 4 attribute categories in types and form |
| DATA-04 | 1 | ✅ satisfied | 1-5 scale with null ("not observed"), null excluded from calculations |
| DATA-05 | 1 | ✅ satisfied | Match notes as free-text field |
| SCOUT-01 | 2 | ✅ satisfied | New player creation within report submission flow |
| SCOUT-02 | 2 | ✅ satisfied | Staged form: physical → technical → tactical → notes |
| SCOUT-03 | 3 | ❌ unsatisfied | `setScoutIdCookie()` never called; draft auto-load broken |
| SCOUT-04 | 3 | ⚠️ partial | My Reports view works but requires manual `?scoutId=` param |
| BROWSE-01 | 4 | ✅ satisfied | Sortable table with column headers, filterable by position/club |
| BROWSE-02 | 4 | ✅ satisfied | Search by name, position dropdown, club dropdown |
| BROWSE-03 | 5 | ✅ satisfied | Clickable player names link to `/division/players/:id` |
| BROWSE-04 | 5 | ✅ satisfied | Profile shows identity, reports, radar chart, scores |
| SCORE-01 | 6 | ✅ satisfied | `calculatePlayerAverages()` computes per-attribute averages |
| SCORE-02 | 6 | ✅ satisfied | Recharts RadarChart with 12 axes on profile |
| SCORE-03 | 7 | ✅ satisfied | `AttributeToggle` component with 12 buttons, URL `?w=` params |
| SCORE-04 | 7 | ✅ satisfied | `calculatePonderatedAverages()` with 3x multiplier |
| SCORE-05 | 7 | ✅ satisfied | `ScoreBreakdown` accordion with per-attribute delta table |
| COMP-01 | 8 | ✅ satisfied | Compare buttons per row, floating bar, `/division/compare` route |
| COMP-02 | 8 | ✅ satisfied | Dual radar overlay (blue for A, red for B) |
| COMP-03 | 8 | ✅ satisfied | `AttributeToggle` visible in comparison view, weights apply to both |

## E2E Flow Verification

| Flow | Status | Notes |
|------|--------|-------|
| Scout submits report → appears in "My Reports" → appears in player profile | **BROKEN** | Cookie never set; scout identity not persisted |
| Division browses → filters/searches → clicks player → sees profile with scores | **PASSED** | All components wired correctly |
| Division toggles weights → list re-sorts → profile shows ponderated averages | **PASSED** | URL params propagate through loaders |
| Division selects two players → comparison → dual radar + deltas | **PASSED** | Compare buttons → floating bar → comparison route |

## Cross-Phase Wiring

| Boundary | Status | Notes |
|----------|--------|-------|
| Phase 1 → Phase 2 | ✅ | Types and data layer used by form |
| Phase 1 → Phase 3 | ✅ | Draft functions use same data layer |
| Phase 1 → Phase 4 | ✅ | Player list uses `getPlayers()`, `getPlayerReportStats()` |
| Phase 4 → Phase 5 | ✅ | `<Link>` navigation from list to profile |
| Phase 5 → Phase 6 | ✅ | Profile uses `calculatePlayerAverages()` |
| Phase 6 → Phase 7 | ✅ | `calculatePonderatedAverages()` extends simple averages |
| Phase 7 → Phase 8 | ✅ | Comparison reuses scoring engine and `AttributeToggle` |

## Critical Gaps

### BLOCKER-1: Scout Identity Cookie Never Set

**File:** `app/cookies.server.ts`
**Issue:** `setScoutIdCookie()` is exported but never imported or called anywhere in the codebase.
**Impact:**
- `getScoutIdFromCookie()` always returns `null`
- Drafts cannot auto-load on page revisit (SCOUT-03 broken)
- "My Reports" shows empty list unless `?scoutId=xxx` manually typed (SCOUT-04 partial)
**Fix:** Call `setScoutIdCookie(scoutId)` in the scout report form action when a scout is identified.

## Warnings

1. **WARNING-1:** Reports table has no clickable links to player profiles
2. **WARNING-2:** Search only covers player name; position/club are dropdown filters (BROWSE-02 partial)
3. **WARNING-3:** Radar chart doesn't visually change when ponderated weights are applied (only headline number changes — per-attribute values are identical)
4. **WARNING-4:** Home page status shows stale "Phase 6: Next" text
5. **WARNING-5:** Mixed English/Portuguese in search placeholder

## Nyquist Compliance

| Phase | VALIDATION.md | Compliant | Action |
|-------|---------------|-----------|--------|
| 1 | MISSING | — | `/gsd-validate-phase 1` |
| 2 | MISSING | — | `/gsd-validate-phase 2` |
| 3 | MISSING | — | `/gsd-validate-phase 3` |
| 4 | MISSING | — | `/gsd-validate-phase 4` |
| 5 | MISSING | — | `/gsd-validate-phase 5` |
| 6 | MISSING | — | `/gsd-validate-phase 6` |
| 7 | MISSING | — | `/gsd-validate-phase 7` |
| 8 | MISSING | — | `/gsd-validate-phase 8` |

**Overall:** MISSING — No VALIDATION.md files exist for any phase. Nyquist validation was not performed during this milestone.

## Tech Debt

| Phase | Items |
|-------|-------|
| All | REQUIREMENTS.md traceability table still shows "Pending" for all requirements despite implementation |
| 04 | Search placeholder uses English text ("Search by player name...") while rest of app is pt-BR |
| 05 | Reports table rows are not clickable links to player profiles |
| 06 | Radar chart shows same shape for simple vs ponderated (per-attribute values identical; only global weighting changes) |
| 08 | Home page project status shows outdated phase reference |

## Recommendations

1. **Fix BLOCKER-1** (1-line change): Call `setScoutIdCookie()` in the scout form action
2. **Update REQUIREMENTS.md**: Mark all implemented requirements as `[x]` Complete
3. **Fix search placeholder**: Translate to pt-BR ("Buscar por nome do jogador...")
4. **Add links to reports table**: Make player names clickable in report cards
5. **Update home page**: Remove or update project status section

---

*Audit completed: 2026-05-15*
*Status: GAPS_FOUND — 1 blocker (SCOUT-03 cookie), 1 partial (SCOUT-04)*
