# Phase 3: Draft & Report Management - Planning Summary

**Phase:** 03-draft-report-management  
**Plans Created:** 3 plans in 2 waves  
**Date:** 2026-05-13  
**Status:** Ready for execution

---

## Wave Structure

| Wave | Plans | Autonomous | Dependencies |
|------|-------|------------|--------------|
| 1 | 03-01, 03-02 | yes, yes | — |
| 2 | 03-03 | yes | 03-01, 03-02 |

**Wave 1 (Parallel):** Data layer foundation + Form integration  
**Wave 2:** Reports table view (depends on data layer from 03-01)

---

## Plans Overview

### Plan 03-01: Data Layer Extension
**Objective:** Extend data layer with draft support and cookie-based scout identity

**Files Modified:**
- `app/data/types.ts` — Add status and currentStep to reportSchema
- `app/data/data.ts` — Implement draft CRUD functions
- `app/cookies.server.ts` — Create cookie utilities (NEW)

**Key Functions:**
- `getDraftByScout(scoutId)` — Get draft by scout
- `upsertDraft(data)` — Create or update draft
- `submitDraft(reportId)` — Change status to submitted
- `deleteDraft(reportId)` — Remove draft
- `getReportsByScout(scoutId, status?)` — Filter reports

**Requirements Addressed:** SCOUT-03, SCOUT-04

---

### Plan 03-02: Draft Resume & Auto-Save
**Objective:** Implement draft resume and auto-save functionality in the scout report form

**Files Modified:**
- `app/routes/scout/report.tsx` — Loader/action with draft support
- `app/components/scout-report-form.tsx` — Auto-save integration
- `app/components/draft-banner.tsx` — Draft discovery banner (NEW)

**Key Features:**
- Draft banner on form entry (D-07)
- Auto-save on step transitions via useFetcher (D-02)
- Form pre-fill from draft values (D-06)
- Step position memory (D-06)
- Draft replacement confirmation (D-03)

**Requirements Addressed:** SCOUT-03

---

### Plan 03-03: Reports Table View
**Objective:** Create "My Reports" table view for scouts to review submitted reports

**Files Modified:**
- `app/routes/scout/reports.tsx` — Reports page (NEW)
- `app/components/reports-table.tsx` — Table component (NEW)
- `app/lib/scoring/average.ts` — Overall average utility (NEW)
- `app/routes.ts` — Add /scout/reports route

**Key Features:**
- 6-column table: Player, Date, Opponent, Competition, Result, Avg Score (D-11)
- Scout dropdown filter (D-10)
- Overall average excludes nulls from denominator (D-12)
- Cookie-based scout identity (D-13)
- Route at /scout/reports (D-09)

**Requirements Addressed:** SCOUT-04

---

## Must-Haves Coverage

### Truths (User Perspective)
- [x] Draft reports persist with status field distinguishing draft from submitted
- [x] Auto-save triggers on step transitions without navigation
- [x] Draft resume restores form values and step position
- [x] Scout identity persists via cookie across page loads
- [x] Scout views list of their submitted reports
- [x] Reports table shows player, date, opponent, competition, result, average
- [x] Scout dropdown filters reports
- [x] Overall average excludes null ratings from denominator

### Artifacts (Files)
- [x] `app/data/types.ts` — Report schema with status field
- [x] `app/data/data.ts` — Draft-aware CRUD functions
- [x] `app/cookies.server.ts` — Cookie utilities
- [x] `app/routes/scout/report.tsx` — Draft-aware loader/action
- [x] `app/components/scout-report-form.tsx` — Auto-save integration
- [x] `app/components/draft-banner.tsx` — Draft banner
- [x] `app/routes/scout/reports.tsx` — Reports page
- [x] `app/components/reports-table.tsx` — Table component
- [x] `app/lib/scoring/average.ts` — Average calculation

### Key Links (Connections)
- [x] Data layer imports reportSchema
- [x] Cookie utilities use createCookie from react-router
- [x] Form uses useFetcher for auto-save
- [x] Reports page imports getReportsByScout
- [x] Table imports calculateOverallAverage

---

## User Decisions Implemented

All 13 locked decisions from CONTEXT.md are covered:

- **D-01:** Status field on reportSchema ✓ (Plan 01)
- **D-02:** Auto-save on step transitions ✓ (Plan 02)
- **D-03:** One draft per scout ✓ (Plan 02)
- **D-04:** Draft → submitted in-place ✓ (Plan 01)
- **D-05:** JSON files for now ✓ (All plans)
- **D-06:** Draft resume with step position ✓ (Plan 02)
- **D-07:** Draft banner on entry ✓ (Plan 02)
- **D-08:** Scout-scoped draft ✓ (Plan 01)
- **D-09:** Table layout at /scout/reports ✓ (Plan 03)
- **D-10:** Scout dropdown filter ✓ (Plan 03)
- **D-11:** Full-detail columns ✓ (Plan 03)
- **D-12:** One overall average number ✓ (Plan 03)
- **D-13:** Cookie-persisted scout selection ✓ (Plan 01)

---

## Threat Model Summary

**Trust Boundaries Identified:**
- Client→Server (form data) — validated via Zod
- Client→Server (URL params) — validated server-side
- Server→File System — trusted

**Threats Mitigated:**
- T-03-01: Tampering via status field — Zod validation
- T-03-04: Tampering via draft data — Zod validation
- T-03-07: Tampering via URL params — server-side validation
- T-03-09: Cross-scout access — server-side filtering

**Threats Accepted (low risk):**
- T-03-02: Cookie information disclosure — scout ID is public
- T-03-03: Scout identity spoofing — single-division tool
- T-03-05: Draft repudiation — scout owns their draft
- T-03-06: Draft access elevation — scoped to scoutId
- T-03-08: Reports information disclosure — filtered by scoutId

---

## Execution Order

**Recommended sequence:**
1. Execute Plan 03-01 (data layer) — foundation
2. Execute Plan 03-02 (form integration) — builds on 03-01
3. Execute Plan 03-03 (reports table) — builds on 03-01 data functions

**Note:** Plans 03-01 and 03-02 can execute in parallel (Wave 1), but 03-02 logically benefits from 03-01 completion. Plan 03-03 must wait for 03-01 (Wave 2).

---

## Next Steps

**Execute:** `/gsd-execute-phase 3`

**What to expect:**
- Wave 1: Data layer + Form integration (~40-50% context)
- Wave 2: Reports table view (~30-40% context)
- Verification: Type checking, import validation, functional tests

**Dependencies:** Phase 2 (Scout Report Form) must be complete

---

*Planning completed: 2026-05-13*  
*Plans committed to git*
