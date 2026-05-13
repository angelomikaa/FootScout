---
phase: 03-draft-report-management
plan: 02
subsystem: scout-report-form
tags:
  - draft
  - auto-save
  - resume
dependency_graph:
  requires:
    - 03-01
  provides:
    - draft-banner-component
    - draft-loader-action
    - auto-save-integration
  affects:
    - scout-report-form
tech-stack:
  added:
    - react-hook-form
    - react-router useFetcher
patterns:
  - discriminated-union-form
  - auto-save-on-transition
  - draft-resume
key-files:
  created:
    - app/components/draft-banner.tsx
  modified:
    - app/routes/scout/report.tsx
    - app/components/scout-report-form.tsx
decisions:
  - "DraftBanner receives playerName as prop to avoid extra player lookup"
  - "Auto-save triggers on step transition (step > 0) to avoid premature saves"
  - "Draft initial values computed via useMemo to prevent circular dependency"
metrics:
  duration: PT15M
  completed: 2026-05-13T00:00:00Z
---

# Phase 03 Plan 02: Draft Resume & Auto-Save Summary

One-liner: Implemented draft resume and auto-save functionality with DraftBanner component, draft-aware loader/action, and form integration with step-position memory.

## Completed Tasks

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Create draft banner component | 711044b |
| 2 | Update report route loader and action | ac843bf |
| 3 | Integrate draft resume and auto-save in form component | ecface4 |

## Implementation Details

### 1. DraftBanner Component (`app/components/draft-banner.tsx`)
- New component displaying unsaved draft warning
- Shows player name and match date from draft
- Two actions: Resume (continue editing) and Discard (delete draft)
- Uses `useFetcher` for discard action
- Visual warning with yellow theme

### 2. Report Route Updates (`app/routes/scout/report.tsx`)
**Loader changes:**
- Import `getScoutIdFromCookie` and `getDraftByScout`
- Parse scout cookie from request
- Fetch draft if scoutId exists
- Return `{ players, scouts, scoutId, draft }`

**Action changes:**
- Handle `save-draft` intent: upsert draft with current form values
- Handle `delete-draft` intent: delete draft by reportId
- On submit: check for existing draft and submit it, otherwise create new report

### 3. Form Integration (`app/components/scout-report-form.tsx`)
**Props:**
- Accept `draft: Report | null` prop

**State:**
- `currentStep` initialized from `draft?.currentStep || 0`
- `hasResumed` tracks if draft has been resumed
- `hasResumedForAutoSave` gates auto-save until draft is loaded

**Auto-save effect:**
- Triggers on step change when `currentStep > 0`
- Collects all form values into FormData
- Submits to `/scout/report` with `save-draft` intent
- Shows "Draft saved" indicator on success

**Draft resume:**
- `draftInitialValues` computed via `useMemo` from draft
- Form pre-filled with draft values on mount
- `currentStep` restored from draft
- `DraftBanner` shown when `draft && !hasResumed`

## Deviations from Plan

### Auto-fixed Issues
None - plan executed exactly as written.

## Threat Surface Scan

| Flag | File | Description |
|------|------|-------------|
| threat_flag: tampering | app/routes/scout/report.tsx | Form data validated via Zod schema in action (T-03-04) |
| threat_flag: repudiation | app/routes/scout/report.tsx | Single-user context; scout owns their draft (T-03-05) |
| threat_flag: elevation-of-privilege | app/routes/scout/report.tsx | Draft scoped to scoutId; no cross-scout access (T-03-06) |

## Known Stubs
None - all draft functionality is fully wired.

## Self-Check: PASSED

- [x] DraftBanner component exists at `app/components/draft-banner.tsx`
- [x] Report route loader returns draft data
- [x] Report route action handles save-draft, delete-draft intents
- [x] ScoutReportForm integrates auto-save on step transitions
- [x] Form pre-fills values from draft on resume
- [x] currentStep restored from draft
- [x] TypeScript compilation passes
