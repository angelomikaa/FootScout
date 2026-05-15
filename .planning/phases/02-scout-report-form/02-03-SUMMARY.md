---
plan: 02-03
phase: 02-scout-report-form
status: complete
completed_at: 2026-05-13
---

# Plan 02-03: Form Orchestrator + Route Wiring — Summary

## What Was Built

**ScoutReportForm component** — the form orchestrator that composes all UI components into a working 5-step wizard, with step navigation, conditional validation, and the RHF→React Router action bridge via useSubmit. Also wired the component into the route module.

- **ScoutReportForm** (`app/components/scout-report-form.tsx`):
  - Single `useForm<ReportFormValues>()` for entire wizard (RESEARCH.md Pattern 1)
  - `zodResolver(reportFormSchema)` for client-side validation
  - All attribute defaults are `null` — NEVER defaults to 3 (Pitfall 8/D-03)
  - Step state: `useState(0)` for currentStep (0-4)
  - `handleNext()` — step 0 has conditional validation based on isNewPlayer (Pitfall 5), steps 1-4 use `trigger(STEP_FIELDS[currentStep])`
  - `handleBack()` — calls `clearErrors()` then decrements step (D-02: Back doesn't validate)
  - `isNewPlayer` toggle: `handleSelectNew()` sets isNewPlayer=true + pre-fills playerName; `handleSelectExisting()` resets to false + clears player fields
  - `onValidSubmit()` — constructs FormData from `form.getValues()`, flattens nested attribute objects with dot-notation keys, handles null as "null" string, calls `submit(formData, { method: "post" })`
  - Navigation: Back (steps 1-4), Next (steps 0-3), Submit Report (step 4, disabled when submitting)
  - Layout: max-w-xl container, rounded-2xl border card, responsive spacing

  - **Step content**:
    - Step 0: Scout `<select>` dropdown + PlayerCombobox + isNewPlayer toggle + NewPlayerFields
    - Step 1: 4 AttributeRatingRow for physical (Pace, Strength, Stamina, Agility)
    - Step 2: 4 AttributeRatingRow for technical (Finishing, Passing, Dribbling, First Touch)
    - Step 3: 4 AttributeRatingRow for tactical (Positioning, Awareness, Decision Making, Work Rate)
    - Step 4: 4 AttributeRatingRow for matchNotes (Attitude, Coachability, Intensity, Impact) + match context fields (matchDate, opponent, competition, matchResult, notes textarea)

- **Route wiring** (`app/routes/scout/report.tsx`):
  - Default export replaced from placeholder to `<ScoutReportForm players={loaderData.players} scouts={loaderData.scouts} />`
  - Loader, action, meta, and formValueToNullableNumber unchanged from Plan 02-01

## Verification

- [x] `npm run typecheck` exits 0
- [x] `npm run build` exits 0
- [x] ScoutReportForm renders all 5 steps with correct content
- [x] Step navigation: Next validates current step, Back goes back without validation
- [x] N/O button sets attribute value to null (not 3)
- [x] isNewPlayer toggle shows/hides NewPlayerFields
- [x] useSubmit bridges RHF to React Router action on valid final submit
- [x] Production build succeeds

## Key Decisions

- Used `as any` casts throughout for discriminatedUnion field access — TypeScript can't narrow the union variant at the field level for register/trigger/setValue calls
- STEP_FIELDS indexed with `currentStep as 0 | 1 | 2 | 3 | 4` to satisfy TypeScript index signature
- Combobox `initialDisplayName` derived from `players.find(p => p.id === selectedPlayerId)?.name` — handles Pitfall 4 (combobox losing selected player on re-render)
- Intent "create-player-and-report" vs "create-report" drives action branching

## Files Modified

- `app/components/scout-report-form.tsx` — Created
- `app/routes/scout/report.tsx` — Updated (import ScoutReportForm, replaced placeholder component)

## Next Steps

Phase 2 execution complete. All 3 plans have shipped:
- 02-01: Route skeleton + form schema + packages
- 02-02: 4 UI components
- 02-03: Form orchestrator + route wiring

Ready for:
- **Phase verification** via /gsd-verify-work
- **Phase 3**: Draft & Report Management (draft persistence, "my reports" view)
