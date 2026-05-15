---
phase: 03-draft-report-management
plan: 01
subsystem: data-layer
tags:
  - draft-management
  - data-layer
  - cookies
dependency_graph:
  requires:
    - 01-data-foundation: Report schema and data layer foundation
  provides:
    - status field on report schema for draft/submitted distinction
    - cookie utilities for scout identity persistence
    - draft CRUD functions for draft lifecycle management
  affects:
    - 03-02: Draft form persistence
    - 03-03: Reports list view
tech_stack:
  added:
    - react-router cookies (createCookie)
  patterns:
    - status enum for state machine (draft → submitted)
    - cookie-based identity persistence
    - upsert pattern for draft management
key_files:
  created:
    - app/cookies.server.ts: Cookie utilities for scout identity
  modified:
    - app/data/types.ts: Added status and currentStep to reportSchema
    - app/data/data.ts: Added draft CRUD functions
  moved: []
  deleted: []
decisions:
  - "status enum defaults to 'submitted' for backward compatibility"
  - "currentStep tracks last step scout was on for draft resume"
  - "Cookie expires after 7 days (D-13)"
  - "writeReports helper function extracted for reuse"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-13T17:41:25Z"
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  lines_added: 119
  lines_removed: 10
---

# Phase 03 Plan 01: Data Layer Extension Summary

Extend data layer with draft support and cookie-based scout identity persistence.

## Completed Tasks

| Task | Description | Commit | Key Changes |
|------|-------------|--------|-------------|
| 1 | Add status field to report schema and create cookie utilities | `4aae208` | Extended reportSchema with status enum and currentStep; created cookies.server.ts |
| 2 | Implement draft-aware data layer functions | `78ed14f` | Added getDraftByScout, upsertDraft, submitDraft, deleteDraft, getReportsByScout |

## Summary of Changes

### Schema Extensions (`app/data/types.ts`)
- Added `status: z.enum(["draft", "submitted"]).default("submitted")` to reportSchema
- Added `currentStep: z.number().default(0)` to track form progress
- Added `updatedAt: isoDateTimeSchema` for tracking report modifications
- Updated `NewReport` type to include optional `status` and `currentStep` fields

### Cookie Utilities (`app/cookies.server.ts` - NEW)
- Created `scoutCookie` with 7-day expiration (D-13)
- Implemented `getScoutIdFromCookie(request)` for reading scout identity
- Implemented `setScoutIdCookie(scoutId)` for persisting scout selection

### Data Layer Functions (`app/data/data.ts`)
- Added `writeReports()` helper for consistent file writes
- Implemented `getDraftByScout(scoutId)` - retrieves draft report by scout ID
- Implemented `upsertDraft(data)` - creates or updates draft reports
- Implemented `submitDraft(reportId)` - transitions draft to submitted status
- Implemented `deleteDraft(reportId)` - removes draft from storage
- Implemented `getReportsByScout(scoutId, status?)` - filters reports by scout and optional status

### Route Updates (`app/routes/scout/report.tsx`)
- Updated report creation to include `status` and `currentStep` fields
- Ensures backward compatibility with existing report creation flow

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added updatedAt field to reportSchema**
- **Found during:** task 1 typecheck
- **Issue:** Original plan didn't include `updatedAt` field, but TypeScript required it for proper report tracking
- **Fix:** Added `updatedAt: isoDateTimeSchema` to reportSchema and updated all report creation logic
- **Files modified:** `app/data/types.ts`, `app/data/data.ts`, `app/routes/scout/report.tsx`
- **Commit:** `4aae208`, `78ed14f`, `3b69390`

**2. [Rule 3 - Blocking] Updated report route to satisfy NewReport type**
- **Found during:** task 1 typecheck
- **Issue:** Report creation in route didn't include new required fields (status, currentStep)
- **Fix:** Added explicit status and currentStep values to reportData object
- **Files modified:** `app/routes/scout/report.tsx`
- **Commit:** `3b69390`

## Verification Results

✅ TypeScript compilation passes (`npm run typecheck`)
✅ reportSchema includes status field with 'draft' | 'submitted' enum
✅ reportSchema includes currentStep field as number
✅ app/cookies.server.ts exports scoutCookie, getScoutIdFromCookie, setScoutIdCookie
✅ app/data/data.ts exports all required draft functions
✅ All new functions are properly typed and exported

## Commits

- `4aae208`: feat(03-01): Add status and currentStep to report schema, create cookie utilities
- `78ed14f`: feat(03-01): Implement draft-aware data layer functions
- `3b69390`: fix(03-01): Update report route to include status and currentStep fields

## Threat Surface Scan

| Flag | File | Description |
|------|------|-------------|
| threat_flag: T-03-01 | app/data/data.ts | upsertDraft validates status via Zod schema (mitigated) |
| threat_flag: T-03-02 | app/cookies.server.ts | Cookie contains only scout ID (accepted risk) |

## Self-Check: PASSED

- [x] All created files exist
- [x] All commits verified in git log
- [x] TypeScript compilation passes
- [x] All required exports present
- [x] SUMMARY.md created with substantive content
