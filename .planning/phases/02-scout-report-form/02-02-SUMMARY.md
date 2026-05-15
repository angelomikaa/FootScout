---
plan: 02-02
phase: 02-scout-report-form
status: complete
completed_at: 2026-05-13
---

# Plan 02-02: UI Components — Summary

## What Was Built

**Four reusable React components** implementing all locked input-widget decisions (D-03 through D-09) for the scout report form wizard.

- **AttributeRatingRow** (`app/components/attribute-rating-row.tsx`):
  - Generic Controller-wrapped button group for attribute ratings (D-07, D-08, D-09)
  - 5 numbered buttons (1-5) calling `onChange(rating)` — blue-600 when selected
  - N/O toggle button calling `onChange(null)` — deselects any active rating (D-08)
  - `aria-pressed` and `aria-label` on all buttons for accessibility
  - Inline error message from `fieldState.error`
  - Conditional styling via `clsx`
  - All buttons use `type="button"` to prevent form submission

- **StepIndicator** (`app/components/step-indicator.tsx`):
  - Horizontal row of step badges with numbered circles + labels
  - Label format per D-03: rating steps show "{label} ({n}/{total-1})", step 0 shows plain label
  - Current step: bg-blue-600 text-white
  - Completed steps: bg-blue-100 text-blue-700
  - Future steps: bg-gray-100 text-gray-500
  - `whitespace-nowrap` + `overflow-x-auto` for responsive behavior

- **PlayerCombobox** (`app/components/player-combobox.tsx`):
  - Search-as-you-type player selector (D-05, D-04)
  - Controller-wrapped `playerId` field with local `inputValue`, `isOpen`, `activeIndex` state
  - Filtering: `players.filter(p => p.name.toLowerCase().includes(inputValue.toLowerCase()))`
  - Dropdown displays "{player.name} — {player.club}"
  - Click-outside close via useEffect + mousedown listener
  - When no match and inputValue.length > 0: shows "Create '{inputValue}' as new player" option
  - Keyboard navigation: ArrowDown/ArrowUp change activeIndex, Enter selects, Escape closes
  - WAI-ARIA: `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls`, `aria-activedescendant`
  - `initialDisplayName` prop for re-initializing display text when navigating back (Pitfall 4)
  - SSR-safe: defaults to isOpen=false, inputValue="" (Pitfall 6)

- **NewPlayerFields** (`app/components/new-player-fields.tsx`):
  - Inline player creation form section (D-04)
  - Returns null when `isVisible=false`
  - Fields: playerName, playerDateOfBirth, playerClub, playerNationality, playerPositionGroup (select), playerPosition (select), playerPreferredFoot (select), playerHeight (number, valueAsNumber), playerWeight (number, valueAsNumber)
  - Bordered blue container: "New Player Details" heading
  - Each field shows RHF error inline below input
  - Select options hardcoded from Zod enum values (positionGroupOptions, positionOptions, preferredFootOptions)
  - valueAsNumber on height/weight fields for Zod number validation

## Verification

- [x] `npm run typecheck` exits 0
- [x] All four component files exist with named exports
- [x] AttributeRatingRow uses Controller with `onChange(null)` for N/O
- [x] StepIndicator shows labeled numbered steps with current/completed/future styling
- [x] PlayerCombobox has WAI-ARIA combobox attributes and keyboard navigation
- [x] NewPlayerFields conditionally renders based on isVisible
- [x] NewPlayerFields uses valueAsNumber for height/weight

## Key Decisions

- Used `any` for NewPlayerFields props types because FieldErrors on a discriminatedUnion type only resolves the first variant — player-specific fields don't exist on the `isNewPlayer: false` branch
- FieldError helper uses duck-typing to extract message string from RHF error objects
- PlayerCombobox keyboard Enter also triggers "Create new player" when activeIndex points to the no-match option

## Files Modified

- `app/components/attribute-rating-row.tsx` — Created
- `app/components/step-indicator.tsx` — Created
- `app/components/player-combobox.tsx` — Created
- `app/components/new-player-fields.tsx` — Created

## Next Steps

Components ready for composition by:
- **Plan 02-03**: ScoutReportForm orchestrator + route wiring
