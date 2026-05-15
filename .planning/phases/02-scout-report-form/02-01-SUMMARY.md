---
plan: 02-01
phase: 02-scout-report-form
status: complete
completed_at: 2026-05-13
---

# Plan 02-01: Route Skeleton + Form Schema — Summary

## What Was Built

**Server-side foundation for the scout report form** — installed form dependencies, created the route skeleton with loader/action, and built the Zod form validation schema with discriminatedUnion for conditional new-player validation.

- **Form packages installed** (`package.json`):
  - `react-hook-form` ^7.75.0 — form state management with trigger() for step validation
  - `@hookform/resolvers` ^5.2.2 — zodResolver with auto-detection of Zod v3/v4
  - `clsx` ^2.1.1 — conditional Tailwind class merging

- **Route config** (`app/routes.ts`):
  - Added `prefix("scout", [...])` with `/scout/report` route per AGENTS.md convention

- **Form validation schema** (`app/data/form-schema.ts`):
  - `reportFormSchema` uses `z.discriminatedUnion("isNewPlayer", [...])` for conditional validation
  - When `isNewPlayer=false`: only `playerId` + `scoutId` required (existing player path)
  - When `isNewPlayer=true`: all player creation fields required (new player path)
  - Both branches share: scoutId, matchDate, opponent, competition, matchResult, physical, technical, tactical, matchNotes
  - `STEP_FIELDS` — field names per step for trigger() validation
  - `STEP_LABELS` — display labels per step
  - `TOTAL_STEPS` = 5

- **Route module** (`app/routes/scout/report.tsx`):
  - `loader()` — fetches players + scouts via `Promise.all([getPlayers(), getScouts()])`
  - `action()` — handles form submission with two intents: "create-report" and "create-player-and-report"
  - `formValueToNullableNumber()` — converts FormData string "null" to JavaScript null (per RESEARCH.md Pitfall 2)
  - Server-side re-validation via `reportFormSchema.parse()` before data layer writes
  - `meta()` — page title and description
  - Placeholder default export (replaced in Plan 02-03)

## Verification

- [x] `npm run typecheck` exits 0
- [x] `react-hook-form`, `@hookform/resolvers`, `clsx` in package.json dependencies
- [x] `app/routes.ts` contains `prefix("scout"` and `route("report"`
- [x] `app/data/form-schema.ts` contains `reportFormSchema`, `STEP_FIELDS`, `ReportFormValues`
- [x] `app/routes/scout/report.tsx` contains loader, action, formValueToNullableNumber
- [x] discriminatedUnion correctly validates both isNewPlayer branches

## Key Decisions

- Used discriminatedUnion (not manual trigger() only) for schema-level conditional validation
- Intent-based action routing: "create-player-and-report" vs "create-report" (default)
- formValueToNullableNumber handles "null" string from FormData serialization

## Files Modified

- `package.json` — Added react-hook-form, @hookform/resolvers, clsx
- `package-lock.json` — Updated
- `app/routes.ts` — Added scout prefix with report route
- `app/data/form-schema.ts` — Created (form schema + step constants)
- `app/routes/scout/report.tsx` — Created (loader, action, meta, placeholder component)

## Next Steps

Server-side foundation ready for:
- **Plan 02-02**: UI components (AttributeRatingRow, StepIndicator, PlayerCombobox, NewPlayerFields)
- **Plan 02-03**: Form orchestrator wiring all components together
