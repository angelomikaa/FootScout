# Phase 2: Scout Report Form - Research

**Researched:** 2026-05-12
**Domain:** Multi-step wizard form with React Hook Form + Zod v4 in React Router 7 framework mode
**Confidence:** HIGH

## Summary

Phase 2 builds a 4-step wizard form (physical → technical → tactical → notes) with inline new-player creation, scout identity selection, and Zod-validated submission via React Router actions. The form must prevent data-entry fatigue by showing one category at a time, block forward advance on invalid steps, and handle nullable attribute scores (1–5 or null "not observed").

The critical technical challenge is bridging React Hook Form (client-side form state) with React Router 7's `<Form method="post">` action pattern (server-side mutation). RHF manages field state, step validation, and combobox logic client-side; on valid final submit, the RHF data is serialized into `FormData` and posted to the route `action`, which re-validates with the same Zod schemas server-side before calling the data layer.

Zod v4 (^4.4.3) is already installed and its `from "zod"` import defaults to the v4 API — confirmed by runtime test. The existing schemas in `types.ts` (`z.number().int().min(1).max(5).nullable()`, `z.object({...})`, `z.enum([...])`) are all Zod v4 compatible. The `@hookform/resolvers` ^5.2.2 package explicitly supports Zod v4 via `zodResolver` with auto-detection of v3 vs v4 schemas. React Hook Form ^7.75.0 supports React 19.

**Primary recommendation:** Use a single `useForm()` for the entire wizard (all 4 steps + player fields), with `trigger(stepFieldNames)` to validate each step before advancing, and `handleSubmit()` to construct `FormData` for the React Router `<Form>` action on final submit.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Step-by-step wizard — one category visible at a time, Next/Back buttons at the bottom
- **D-02:** Block advance on invalid — can't move to next step until current step validates
- **D-03:** Labeled steps with numbers — "Physical (1/4)", "Technical (2/4)", "Tactical (3/4)", "Notes (4/4)"
- **D-04:** Inline expansion for new player creation when no match found (no modal/page nav)
- **D-05:** Search-as-you-type dropdown (combobox/autocomplete) for player selection
- **D-06:** Scout identity via dropdown select from scouts.json registry
- **D-07:** Numbered buttons (1 2 3 4 5) for attribute rating input (not stars)
- **D-08:** Explicit N/O (not observed) toggle per attribute, next to 1–5 buttons; deselects rating when pressed
- **D-09:** Row-per-attribute layout — label left, buttons + N/O toggle right

### OpenCode's Discretion
- Exact button styling and hover/active states
- Color coding for N/O toggle (muted/neutral vs active rating buttons)
- Form field spacing and typography
- Error message presentation (inline below fields vs summary)
- Scout selection placement (top of form vs first step)
- Match result field placement (within match notes step vs separate field)

### Deferred Ideas (OUT OF SCOPE)
- Draft persistence (save partially completed report) — Phase 3
- Report list view ("my reports") — Phase 3
- Star ratings for display — future phase (Phase 5/6 when profiles are built)
- Player photo upload — out of scope for v1
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCOUT-01 | Scout can create a new player entry when submitting first report | Single useForm + conditional validation: when `isNewPlayer` is true, player fields become required; inline expansion pattern with Controller-wrapped inputs; action calls createPlayer() then createReport() |
| SCOUT-02 | Scout can submit a report with staged form (physical → technical → tactical → notes) | Single useForm with all fields registered; step state tracked via useState; trigger(stepFields) validates before advance; handleSubmit on final step constructs FormData for React Router action |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form field state management | Browser / Client | — | RHF useForm() is a client-side hook managing field values, errors, touched state |
| Step navigation & validation | Browser / Client | — | Step state (currentStep) is pure UI state; trigger() validates client-side before advancing |
| Combobox player search | Browser / Client | Frontend Server (SSR) | Loader provides player list data; client-side filtering + keyboard navigation in the browser |
| Scout dropdown population | Frontend Server (SSR) | — | Loader fetches scouts.json; component renders from loaderData |
| Form submission | Frontend Server (SSR) | — | React Router action receives FormData server-side |
| Zod validation (client) | Browser / Client | — | zodResolver validates form fields on trigger/submit |
| Zod validation (server) | API / Backend | — | Route action re-validates with same schemas before data layer writes |
| Player creation | API / Backend | — | createPlayer() runs server-side in the action |
| Report creation | API / Backend | — | createReport() runs server-side in the action |
| Data persistence | Database / Storage | — | JSON file writes in data.ts |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.75.0 | Form state management | Performant field management without unnecessary re-renders; `trigger()` for step validation; `Controller` for custom inputs; React 19 peer dep `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19` [VERIFIED: npm registry] |
| @hookform/resolvers | ^5.2.2 | Zod ↔ RHF bridge | `zodResolver(schema)` with auto-detection of Zod v3 vs v4; `raw` option for un-coerced values; explicit `'zod/v4'` support in docs [VERIFIED: npm registry, Context7 /react-hook-form/resolvers] |
| zod | ^4.4.3 | Schema validation (client + server) | Already installed; `from "zod"` defaults to v4 API; existing schemas verified compatible; nullable + partial + pick methods all work [VERIFIED: npm registry, runtime test] |
| clsx | ^2.1.1 | Conditional Tailwind classes | Lightweight (228B); essential for button selected states, step indicators, error styling [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Router 7 | 7.15.0 | Route action + loader + Form | Already installed; provides `<Form method="post">`, `action()` export, `redirect()` [VERIFIED: installed] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single useForm() for wizard | Separate useForm() per step | Separate forms require shared state between steps (complexity); single form is simpler with trigger() for step-level validation. RHF official docs use separate forms + little-state-machine for URL-routed steps, but our steps are conditional renders, not routes — single form is the right fit |
| zodResolver | standardSchemaResolver | standardSchemaResolver is newer and works with any Standard Schema library, but zodResolver is battle-tested, has better error mapping, and auto-detects Zod v4. Use zodResolver |

**Installation:**

```bash
npm install react-hook-form @hookform/resolvers clsx
```

**Version verification:**

| Package | Verified Version | Published | Source |
|---------|-----------------|-----------|--------|
| react-hook-form | 7.75.0 | 2026-05 | npm registry |
| @hookform/resolvers | 5.2.2 | 2026-05 | npm registry |
| clsx | 2.1.1 | 2026-05 | npm registry |
| zod | 4.4.3 | 2026-05 | npm registry (already installed) |

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Browser / Client                                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ScoutReportForm (single route component)                        │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │    │
│  │  │ StepIndicator │  │ useForm()        │  │ PlayerCombobox  │  │    │
│  │  │ "Physical 1/4"│  │ ├─ register()    │  │ (Controller)    │  │    │
│  │  │ "Technical 2/4│  │ ├─ Controller    │  │ ├─ filter players│  │    │
│  │  │ "Tactical 3/4"│  │ ├─ trigger()     │  │ ├─ keyboard nav │  │    │
│  │  │ "Notes 4/4"   │  │ ├─ handleSubmit │  │ └─ isNewPlayer?  │  │    │
│  │  └──────────────┘  │ └─ watch/getValues│     │              │  │    │
│  │                     └──────────────────┘     ▼              │  │    │
│  │  ┌────────────────────────────────────────────────────────┐  │    │
│  │  │ Inline New Player Fields (conditional)                │  │    │
│  │  │ name, DOB, position, club, nationality, foot, h, w    │  │    │
│  │  └────────────────────────────────────────────────────────┘  │    │
│  │                                                              │    │
│  │  ┌────────────────────────────────────────────────────────┐  │    │
│  │  │ AttributeRatingRow × 4 (per step)                     │  │    │
│  │  │ [Label]  [1][2][3][4][5]  [N/O]                       │  │    │
│  │  │ Controller: onChange → 1|2|3|4|5|null                  │  │    │
│  │  └────────────────────────────────────────────────────────┘  │    │
│  │                                                              │    │
│  │  ┌────────────────┐                                         │    │
│  │  │ [Back] [Next]  │  Next: trigger(stepFields) → advance   │    │
│  │  │ or [Submit]    │  Submit: handleSubmit → FormData post   │    │
│  │  └────────────────┘                                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                          │                                               │
│           handleSubmit builds FormData                                   │
│           from RHF getValues()                                           │
│                          │                                               │
│           ┌──────────────▼──────────────┐                               │
│           │  React Router <Form> post   │                               │
│           │  (hidden inputs approach)   │                               │
│           └──────────────┬──────────────┘                               │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │ HTTP POST (FormData)
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ React Router 7 Server (SSR)                                             │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │ Route Action (routes/scout/report.tsx)                        │      │
│  │                                                               │      │
│  │  1. request.formData() → extract all fields                  │      │
│  │  2. Determine intent: "create-player-and-report" | "report"  │      │
│  │  3. If new player: validate playerSchema → createPlayer()    │      │
│  │  4. Validate reportSchema → createReport()                   │      │
│  │  5. redirect("/scout/report") or return { success: true }    │      │
│  └──────────────────────────┬────────────────────────────────────┘      │
│                             │                                            │
│  ┌──────────────────────────▼────────────────────────────────────┐      │
│  │ Route Loader (routes/scout/report.tsx)                        │      │
│  │                                                               │      │
│  │  getPlayers() → player list for combobox                     │      │
│  │  getScouts()  → scout list for dropdown                      │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                             │                                            │
│                             ▼                                            │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │ Data Layer (data.ts)                                          │      │
│  │ createPlayer() → players.json                                 │      │
│  │ createReport() → reports.json                                 │      │
│  └───────────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
app/
├── routes/
│   └── scout/
│       └── report.tsx          # Main route: loader + action + default export
├── components/
│   ├── scout-report-form.tsx   # Form orchestrator (single useForm, step state)
│   ├── step-indicator.tsx      # "Physical (1/4)" progress display
│   ├── attribute-rating-row.tsx # [Label] [1][2][3][4][5] [N/O] per attribute
│   ├── player-combobox.tsx     # Search-as-you-type player selector
│   └── new-player-fields.tsx   # Inline player creation fields
├── data/
│   ├── types.ts                # Existing Zod schemas (shared client+server)
│   └── data.ts                 # Existing data layer (createPlayer, createReport, etc.)
└── routes.ts                   # Updated with prefix("scout", [...])
```

### Pattern 1: Single useForm Wizard with trigger()

**What:** One `useForm()` manages ALL form fields across all 4 steps plus player selection/creation. Step visibility is controlled by a `currentStep` state variable. Each step renders only its fields.

**When to use:** Multi-step forms where all data submits together in one action.

**Why over separate forms:** No state syncing between steps. All fields are always registered. `trigger(stepFieldNames)` validates only the visible step's fields. Back button doesn't need to validate (per D-02, only forward advance is blocked).

```tsx
// Source: RHF official docs trigger() API + architectural reasoning
const STEP_FIELDS = {
  0: ["scoutId", "playerId", "isNewPlayer", "playerName", "playerDateOfBirth",
      "playerPosition", "playerClub", "playerNationality", "playerPreferredFoot",
      "playerHeight", "playerWeight"],  // Step 0: Player/Scout selection
  1: ["physical.pace", "physical.strength", "physical.stamina", "physical.agility"],
  2: ["technical.finishing", "technical.passing", "technical.dribbling", "technical.firstTouch"],
  3: ["tactical.positioning", "tactical.awareness", "tactical.decisionMaking", "tactical.workRate"],
  4: ["matchNotes.attitude", "matchNotes.coachability", "matchNotes.intensity",
      "matchNotes.impact", "matchNotes.notes", "matchDate", "opponent",
      "competition", "matchResult"],
} as const;

function ScoutReportForm({ players, scouts }: { players: Player[]; scouts: Scout[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      physical: { pace: null, strength: null, stamina: null, agility: null },
      technical: { finishing: null, passing: null, dribbling: null, firstTouch: null },
      tactical: { positioning: null, awareness: null, decisionMaking: null, workRate: null },
      matchNotes: { attitude: null, coachability: null, intensity: null, impact: null, notes: "" },
      // ... other defaults
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep] as string[];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };

  const handleBack = () => {
    // D-02: Back does NOT validate — only forward advance is blocked
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // ... render current step's fields
}
```

### Pattern 2: RHF → React Router Action Bridge

**What:** RHF manages form state client-side. On valid final submit, `handleSubmit` fires. Inside the submit handler, we use a ref to a hidden `<Form method="post">` to submit via React Router's action mechanism, or we construct `FormData` and submit programmatically.

**When to use:** When RHF manages client-side validation but React Router's action handles server-side mutation.

**Key insight:** Do NOT put RHF's `<form onSubmit={handleSubmit}>` inside React Router's `<Form>`. They are different submission mechanisms. Instead: RHF handles validation and field state; on valid submit, RHF's `handleSubmit` callback constructs FormData and submits it to the React Router action.

```tsx
// Source: ARCHITECTURE.md Pattern 2 + RHF docs handleSubmit + React Router docs action
import { Form, useNavigation, useActionData } from "react-router";

function ScoutReportForm() {
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { /* ... */ },
  });

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData();
  const formRef = useRef<HTMLFormElement>(null);

  // RHF handleSubmit: validates all fields, then on success triggers the RR Form
  const onValidSubmit = (data: ReportFormValues) => {
    // RHF has validated everything — now populate hidden inputs and submit
    // the React Router <Form>
    formRef.current?.submit();
  };

  return (
    <form onSubmit={form.handleSubmit(onValidSubmit)}>
      {/* RHF-managed visible fields for current step */}
      {/* ... */}

      {/* Hidden inputs that carry RHF values into the React Router action */}
      {/* These get populated by RHF's field management */}
      <Form ref={formRef} method="post" className="hidden">
        {/* Hidden inputs populated from form.getValues() at submit time */}
        <input type="hidden" name="intent" value="create-report" />
        <input type="hidden" name="scoutId" {...form.register("scoutId")} />
        {/* ... all fields as hidden inputs */}
      </Form>
    </form>
  );
}
```

**Alternative (simpler) approach:** Use a single `<Form method="post">` as the DOM container, register RHF fields inside it, and call `form.handleSubmit()` which calls `event.preventDefault()` (stopping the native submission) and runs RHF validation. On valid submit, programmatically call the form's native submit (bypassing RHF's `preventDefault`):

```tsx
// Simpler: single <Form> container, RHF manages validation
const onValidSubmit = () => {
  // RHF validated successfully — let the React Router <Form> submit natively
  // by calling the DOM form's submit() (not React's handleSubmit)
  const formEl = document.querySelector('form[method="post"]') as HTMLFormElement;
  formEl?.submit(); // native DOM submit, bypasses RHF's preventDefault
};

return (
  <Form method="post" action="/scout/report">
    {/* RHF-managed fields with register/Controller */}
    <input type="hidden" name="intent" value="create-report" />
    <select {...form.register("scoutId")}>{/* ... */}</select>
    {/* Attribute rows as Controller-wrapped button groups */}
    <button type="button" onClick={handleNext}>Next</button>
    <button type="submit" onClick={form.handleSubmit(onValidSubmit)}>Submit</button>
  </Form>
);
```

**Best approach for this project:** Use RHF for client-side validation + step management, then on valid final submit, construct a `FormData` object from `form.getValues()` and submit it programmatically via `useSubmit()` from React Router. This is the cleanest separation:

```tsx
// Source: React Router docs useSubmit + RHF docs getValues
import { useSubmit } from "react-router";

const submit = useSubmit();

const onValidSubmit = (data: ReportFormValues) => {
  const formData = new FormData();
  formData.append("intent", data.isNewPlayer ? "create-player-and-report" : "create-report");
  formData.append("scoutId", data.scoutId);
  if (data.isNewPlayer) {
    formData.append("playerName", data.playerName);
    // ... new player fields
  } else {
    formData.append("playerId", data.playerId);
  }
  // Flatten nested objects for FormData
  for (const [category, attrs] of Object.entries(data.physical)) {
    formData.append(`physical.${category}`, String(attrs ?? "null"));
  }
  // ... other categories
  submit(formData, { method: "post" });
};
```

### Pattern 3: Controller-Wrapped Button Group for Attribute Ratings

**What:** Each attribute row uses `Controller` to wrap a custom button group (1–5 + N/O). The Controller's `onChange` receives the selected value (1|2|3|4|5|null). Pressing N/O sets value to null and deselects any active rating.

**When to use:** Custom non-native input widgets integrated with RHF.

```tsx
// Source: Context7 /react-hook-form/documentation Controller API
import { Controller, type Control } from "react-hook-form";

interface AttributeRatingRowProps {
  name: string;           // e.g., "physical.pace"
  label: string;          // e.g., "Pace"
  control: Control<any>;
}

function AttributeRatingRow({ name, label, control }: AttributeRatingRowProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => onChange(rating)}
                className={clsx(
                  "w-8 h-8 rounded text-sm font-semibold",
                  value === rating
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {rating}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChange(null)}
              className={clsx(
                "ml-2 px-2 h-8 rounded text-sm font-medium",
                value === null
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              N/O
            </button>
          </div>
          {error && <span className="text-red-500 text-xs">{error.message}</span>}
        </div>
      )}
    />
  );
}
```

### Pattern 4: Combobox Without Component Library

**What:** A controlled text input that filters a player list as the scout types. Uses RHF `Controller` for field management. Keyboard navigation (arrow keys, Enter, Escape) + click selection. When no match, shows "Create new player" trigger.

**When to use:** D-05 requires search-as-you-type. No component library allowed.

```tsx
// Source: WAI-ARIA Combobox pattern + RHF Controller API
function PlayerCombobox({ players, control, onSelectNew }: PlayerComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  const noMatch = inputValue.length > 0 && filteredPlayers.length === 0;

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Controller
      name="playerId"
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div ref={comboboxRef} className="relative">
          <label htmlFor="player-search" className="block text-sm font-medium mb-1">
            Player
          </label>
          <input
            id="player-search"
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="player-listbox"
            aria-activedescendant={
              activeIndex >= 0 ? `player-option-${filteredPlayers[activeIndex]?.id}` : undefined
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Search player by name..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev) => Math.min(prev + 1, filteredPlayers.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                const player = filteredPlayers[activeIndex];
                onChange(player.id);
                setInputValue(player.name);
                setIsOpen(false);
              } else if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
          />

          {isOpen && (
            <ul
              id="player-listbox"
              role="listbox"
              className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredPlayers.map((player, index) => (
                <li
                  key={player.id}
                  id={`player-option-${player.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={clsx(
                    "px-3 py-2 cursor-pointer",
                    index === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  )}
                  onClick={() => {
                    onChange(player.id);
                    setInputValue(player.name);
                    setIsOpen(false);
                  }}
                >
                  {player.name} — {player.club}
                </li>
              ))}
              {noMatch && (
                <li className="px-3 py-2 text-blue-600 cursor-pointer hover:bg-blue-50"
                    onClick={() => onSelectNew(inputValue)}>
                  Create "{inputValue}" as new player
                </li>
              )}
            </ul>
          )}
          {error && <span className="text-red-500 text-xs mt-1">{error.message}</span>}
        </div>
      )}
    />
  );
}
```

### Pattern 5: React Router 7 Route Prefix Setup

**What:** Use `prefix()` from `@react-router/dev/routes` to create `/scout/*` routes. The report form lives at `/scout/report` with co-located loader + action.

**When to use:** All scout data-entry routes.

```tsx
// Source: Context7 /remix-run/react-router prefix() API
// app/routes.ts
import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("scout", [
    index("routes/scout/index.tsx"),       // /scout (dashboard, future)
    route("report", "routes/scout/report.tsx"), // /scout/report (this phase)
  ]),
] satisfies RouteConfig;
```

```tsx
// app/routes/scout/report.tsx
import type { Route } from "./+types/report";
import { redirect } from "react-router";
import { getPlayers, getScouts, createPlayer, createReport } from "~/data/data";
import { playerSchema, reportSchema } from "~/data/types";
import { ScoutReportForm } from "~/components/scout-report-form";

// Load players + scouts for form dropdowns
export async function loader({}: Route.LoaderArgs) {
  const [players, scouts] = await Promise.all([getPlayers(), getScouts()]);
  return { players, scouts };
}

// Handle form submission
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  let playerId: string;

  if (intent === "create-player-and-report") {
    // Validate and create new player
    const newPlayerData = {
      name: formData.get("playerName") as string,
      dateOfBirth: formData.get("playerDateOfBirth") as string,
      positionGroup: formData.get("playerPositionGroup") as string,
      position: formData.get("playerPosition") as string,
      club: formData.get("playerClub") as string,
      nationality: formData.get("playerNationality") as string,
      preferredFoot: formData.get("playerPreferredFoot") as string,
      height: formData.get("playerHeight") ? Number(formData.get("playerHeight")) : undefined,
      weight: formData.get("playerWeight") ? Number(formData.get("playerWeight")) : undefined,
    };
    // Server-side validation with same Zod schema
    const player = await createPlayer(playerSchema.omit({ id: true, createdAt: true }).parse(newPlayerData) as any);
    playerId = player.id;
  } else {
    playerId = formData.get("playerId") as string;
  }

  // Validate and create report
  const reportData = {
    playerId,
    scoutId: formData.get("scoutId") as string,
    matchDate: formData.get("matchDate") as string,
    opponent: formData.get("opponent") as string,
    competition: formData.get("competition") as string,
    matchResult: (formData.get("matchResult") as string) || undefined,
    physical: {
      pace: formData.get("physical.pace") === "null" ? null : Number(formData.get("physical.pace")),
      // ... other physical attributes
    },
    // ... technical, tactical, matchNotes
  };

  // Server-side validation
  const report = await createReport(reportSchema.omit({ id: true, createdAt: true }).parse(reportData) as any);

  return redirect("/scout/report"); // or return { success: true }
}

export default function ScoutReportRoute({ loaderData }: Route.ComponentProps) {
  return <ScoutReportForm players={loaderData.players} scouts={loaderData.scouts} />;
}
```

### Anti-Patterns to Avoid

- **Nesting RHF `<form>` inside React Router `<Form>`:** Two competing submission mechanisms. RHF's `handleSubmit` calls `preventDefault()`, preventing React Router's `<Form>` from submitting. Use a single submission path — either `useSubmit()` or native form submit after RHF validation passes.
- **Separate `useForm()` per step:** Requires syncing state between steps via external store or context. Unnecessary complexity when all data submits together in one action. Single `useForm()` with `trigger()` is simpler and correct.
- **Using `zodResolver` on a schema that includes `id` and `createdAt`:** The form creates a NEW report, not a full Report object. The Zod schema for form validation must omit server-generated fields. Use `reportSchema.omit({ id: true, createdAt: true })` for the form schema.
- **Setting attribute defaults to `3`:** Per Pitfall 8 and D-03 from Phase 1, the default for every attribute must be `null` (not observed), never `3`. The form schema and `defaultValues` must use `null`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Step validation before advance | Custom step validation state + error tracking | RHF `trigger(fieldNames)` | trigger() uses the same zodResolver, returns `Promise<boolean>`, focuses first error field; no custom validation logic needed [VERIFIED: Context7 /react-hook-form/documentation] |
| Combobox accessibility | Custom ARIA attributes from scratch | WAI-ARIA Combobox pattern (role, aria-expanded, aria-autocomplete, aria-activedescendant) | ARIA combobox has ~15 required attributes/states; missing any breaks screen reader UX. Follow the WAI-ARIA Authoring Practices pattern explicitly |
| FormData serialization for nested objects | Custom JSON-in-FormData encoding | Dot-notation field names (`physical.pace`) + `formData.get("physical.pace")` | React Router's `request.formData()` returns flat key-value pairs; dot notation is the standard way to represent nested data in HTML forms |
| Zod schema for form (different from data schema) | Copy-paste + modify schemas | `schema.pick()` + `schema.extend()` + `schema.omit()` | Zod v4 supports `.pick()`, `.partial()`, `.omit()`, `.extend()` on objects — build the form schema by composing existing schemas, not duplicating them [VERIFIED: runtime test with Zod v4] |

**Key insight:** The Zod schemas in `types.ts` define the DATA model (with `id`, `createdAt`). The FORM schema is a derived version that omits server-generated fields and may make some fields required that are optional in the data model (e.g., the form may require at least one attribute per step to be rated, or matchDate to be filled). Use `pick`/`omit`/`extend` to build the form schema from the data schemas.

## Common Pitfalls

### Pitfall 1: zodResolver Validates Entire Schema on trigger()

**What goes wrong:** `trigger(["physical.pace"])` still runs the entire zodResolver against ALL form values, not just the triggered fields. The zodResolver source confirms: `schema.parseAsync(values)` validates the complete values object.

**Why it happens:** zodResolver is designed for full-form validation. `trigger()` limits which ERRORS are surfaced, but the schema still processes all fields.

**How to avoid:** This is actually fine for our use case. We call `trigger(stepFieldNames)` which calls zodResolver internally, but only returns errors for the named fields. Un-triggered fields' errors are not shown. The key is: use `trigger(fieldNames)` (NOT `trigger()`) so only current step's errors are visible. Back navigation should call `clearErrors()` to clean up previous step errors.

**Warning signs:** Seeing validation errors from step 3 while on step 1.

### Pitfall 2: FormData null Handling

**What goes wrong:** `formData.append("physical.pace", null)` converts null to the string `"null"`. On the server, `formData.get("physical.pace")` returns `"null"` (a string), not JavaScript `null`. The Zod schema expects `number | null`, not `string`.

**Why it happens:** HTML FormData only stores strings and Files. There's no native null representation.

**How to avoid:** On the server-side action, parse FormData values with explicit null conversion: if a value is `"null"` or empty string, convert to JavaScript `null` before passing to Zod. Create a helper function:

```ts
function formValueToNullableNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "" || value === "null") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}
```

**Warning signs:** Server-side Zod validation fails with "Expected number, received string" for attribute fields.

### Pitfall 3: RHF `defaultValues` Missing Nested Objects

**What goes wrong:** Setting `defaultValues: { "physical.pace": null }` instead of `defaultValues: { physical: { pace: null } }`. RHF uses the defaultValues shape to determine field paths. Flat keys for nested objects cause `register("physical.pace")` to fail silently.

**Why it happens:** RHF's field registration depends on the defaultValues shape matching the schema structure.

**How to avoid:** Default values must mirror the exact nested structure:

```ts
defaultValues: {
  physical: { pace: null, strength: null, stamina: null, agility: null },
  technical: { finishing: null, passing: null, dribbling: null, firstTouch: null },
  // ...
}
```

**Warning signs:** Fields appear uncontrolled; `form.getValues()` returns `undefined` for nested fields; `trigger()` doesn't validate registered fields.

### Pitfall 4: Combobox Losing Selected Player on Re-render

**What goes wrong:** Scout selects a player from the combobox, then moves to the next step. When they go back, the combobox input is empty because the display text (player name) is stored in local state that was reset, while the actual `playerId` value in RHF is still correct.

**Why it happens:** The combobox's visible text (local `inputValue` state) and the form's actual value (`playerId` in RHF) are decoupled.

**How to avoid:** Initialize the combobox's display text from the selected player's name, not from the playerId. When navigating back to step 0, look up the player name from the `players` prop using the current `playerId` value:

```tsx
const selectedPlayerId = form.watch("playerId");
useEffect(() => {
  if (selectedPlayerId) {
    const player = players.find(p => p.id === selectedPlayerId);
    if (player) setInputValue(player.name);
  }
}, [selectedPlayerId, players]);
```

**Warning signs:** Combobox appears empty after navigating back, even though a player was previously selected.

### Pitfall 5: Conditional Validation for New Player Fields

**What goes wrong:** The player creation fields (name, DOB, position, etc.) are always validated by zodResolver, even when the scout is selecting an existing player (not creating a new one). This causes false validation errors on player fields that should be ignored.

**Why it happens:** zodResolver validates the entire form schema on every `trigger()` or `handleSubmit()`. If the form schema includes player fields as required, they fail validation even when irrelevant.

**How to avoid:** Use a discriminated union schema or `z.union()` / conditional refinement based on `isNewPlayer`:

```ts
// Form schema with conditional player fields
const reportFormSchema = z.discriminatedUnion("isNewPlayer", [
  // Existing player path — playerId required, player fields ignored
  z.object({
    isNewPlayer: z.literal(false),
    playerId: z.string().min(1, "Select a player"),
    // player fields optional/not-validated
  }),
  // New player path — playerId absent, player fields required
  z.object({
    isNewPlayer: z.literal(true),
    // playerId not needed — server creates it
    playerName: z.string().min(1, "Name is required"),
    playerDateOfBirth: isoDateSchema,
    playerPositionGroup: positionGroupSchema,
    playerPosition: positionSchema,
    playerClub: z.string().min(1, "Club is required"),
    playerNationality: nationalityCodeSchema,
    playerPreferredFoot: preferredFootSchema,
    playerHeight: z.number().int().positive().optional(),
    playerWeight: z.number().int().positive().optional(),
  }),
]).and(
  // Both paths share report fields
  z.object({
    scoutId: z.string().min(1, "Select a scout"),
    matchDate: isoDateSchema,
    opponent: z.string().min(1),
    competition: z.string().min(1),
    matchResult: z.string().optional(),
    physical: physicalAttributesSchema,
    technical: technicalAttributesSchema,
    tactical: tacticalAttributesSchema,
    matchNotes: matchNotesAttributesSchema,
  })
);
```

**Alternative (simpler):** Use `z.lazy()` or two separate schemas. When `trigger()` is called for step 0, only validate the relevant fields based on `isNewPlayer`:

```ts
// Simpler: don't include player fields in the main zod schema at all.
// Validate them manually in the step handler:
const handleStep0Next = async () => {
  const isNewPlayer = form.getValues("isNewPlayer");
  if (isNewPlayer) {
    const playerValid = await form.trigger([
      "playerName", "playerDateOfBirth", "playerPositionGroup",
      "playerPosition", "playerClub", "playerNationality", "playerPreferredFoot"
    ]);
    if (!playerValid) return;
  } else {
    const playerValid = await form.trigger("playerId");
    if (!playerValid) return;
  }
  const scoutValid = await form.trigger("scoutId");
  if (scoutValid) setCurrentStep(1);
};
```

**Warning signs:** Validation errors on player creation fields when selecting an existing player.

### Pitfall 6: SSR Hydration Mismatch with Combobox

**What goes wrong:** The combobox's open/closed state and filtered list differ between server render and client hydration, causing React hydration mismatches and errors.

**Why it happens:** The combobox state (isOpen, filteredPlayers, inputValue) is client-only interactive state. On the server, the dropdown is closed and empty. On the client, if the user has already typed, the state differs.

**How to avoid:** Combobox state (`isOpen`, `inputValue`, `activeIndex`) must be client-only. Initialize with `isOpen: false`, `inputValue: ""`. These states will never differ between server and client because they default to "closed/empty" on both. The component only becomes interactive after hydration. Since RHF's `Controller` uses the form's `defaultValues` for the initial render, and those are the same on server and client, hydration is safe.

**Warning signs:** React hydration warnings in console; dropdown briefly appears open on page load.

## Code Examples

Verified patterns from official sources:

### RHF + Zod v4 Integration

```tsx
// Source: Context7 /react-hook-form/resolvers — zodResolver supports Zod v4
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Zod v4 — default export is v4 API

const schema = z.object({
  name: z.string().min(1, { error: "Required" }),  // v4 uses { error: } not { message: }
  score: z.number().int().min(1).max(5).nullable(),
});

type FormValues = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, control, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", score: null },
  });

  // trigger() validates specific fields — returns Promise<boolean>
  const validateStep = async () => {
    const isValid = await trigger(["name", "score"]);
    return isValid; // true if no errors
  };

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {/* ... */}
    </form>
  );
}
```

### RHF Controller for Custom Button Group

```tsx
// Source: Context7 /react-hook-form/documentation Controller API
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

function RatingButtonGroup<T extends FieldValues>({
  name,
  label,
  control,
}: {
  name: Path<T>;
  label: string;
  control: Control<T>;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium w-32">{label}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={clsx(
                  "w-8 h-8 rounded text-sm font-semibold transition-colors",
                  value === n
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                aria-label={`Rate ${label} ${n} out of 5`}
                aria-pressed={value === n}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChange(null)}
              className={clsx(
                "ml-2 px-2 h-8 rounded text-xs font-medium transition-colors border",
                value === null
                  ? "bg-gray-700 text-white border-gray-700"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              )}
              aria-label={`Mark ${label} as not observed`}
              aria-pressed={value === null}
            >
              N/O
            </button>
          </div>
        </div>
      )}
    />
  );
}
```

### React Router Action with FormData Parsing

```tsx
// Source: Context7 /remix-run/react-router action + FormData docs
import type { Route } from "./+types/report";
import { redirect } from "react-router";
import { createPlayer, createReport, getPlayers, getScouts } from "~/data/data";
import { reportSchema } from "~/data/types";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Helper: FormData value → number | null
  const toNullableNumber = (val: FormDataEntryValue | null): number | null => {
    if (!val || val === "null" || val === "") return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  let playerId: string;

  if (intent === "create-player-and-report") {
    const newPlayer = await createPlayer({
      name: formData.get("playerName") as string,
      dateOfBirth: formData.get("playerDateOfBirth") as string,
      positionGroup: formData.get("playerPositionGroup") as any,
      position: formData.get("playerPosition") as any,
      club: formData.get("playerClub") as string,
      nationality: formData.get("playerNationality") as string,
      preferredFoot: formData.get("playerPreferredFoot") as any,
      height: toNullableNumber(formData.get("playerHeight")) ?? undefined,
      weight: toNullableNumber(formData.get("playerWeight")) ?? undefined,
    });
    playerId = newPlayer.id;
  } else {
    playerId = formData.get("playerId") as string;
  }

  const report = await createReport({
    playerId,
    scoutId: formData.get("scoutId") as string,
    matchDate: formData.get("matchDate") as string,
    opponent: formData.get("opponent") as string,
    competition: formData.get("competition") as string,
    matchResult: (formData.get("matchResult") as string) || undefined,
    physical: {
      pace: toNullableNumber(formData.get("physical.pace")),
      strength: toNullableNumber(formData.get("physical.strength")),
      stamina: toNullableNumber(formData.get("physical.stamina")),
      agility: toNullableNumber(formData.get("physical.agility")),
    },
    technical: {
      finishing: toNullableNumber(formData.get("technical.finishing")),
      passing: toNullableNumber(formData.get("technical.passing")),
      dribbling: toNullableNumber(formData.get("technical.dribbling")),
      firstTouch: toNullableNumber(formData.get("technical.firstTouch")),
    },
    tactical: {
      positioning: toNullableNumber(formData.get("tactical.positioning")),
      awareness: toNullableNumber(formData.get("tactical.awareness")),
      decisionMaking: toNullableNumber(formData.get("tactical.decisionMaking")),
      workRate: toNullableNumber(formData.get("tactical.workRate")),
    },
    matchNotes: {
      attitude: toNullableNumber(formData.get("matchNotes.attitude")),
      coachability: toNullableNumber(formData.get("matchNotes.coachability")),
      intensity: toNullableNumber(formData.get("matchNotes.intensity")),
      impact: toNullableNumber(formData.get("matchNotes.impact")),
      notes: (formData.get("matchNotes.notes") as string) || undefined,
    },
  });

  return redirect("/scout/report");
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zod v3 `import { z } from "zod"` | Zod v4 `import { z } from "zod"` (default is now v4) | Zod v4 release 2025 | Same import path, new API. `.nullable()` still works. `message` → `error` for customization. No breaking changes for the schema patterns used in this project |
| `@hookform/resolvers` Zod v3 only | Auto-detects Zod v3 vs v4 schemas | @hookform/resolvers v5 | No import path change needed; `zodResolver` handles both. Comment in docs: `import { z } from 'zod'; // or 'zod/v4'` |
| RHF wizard with `little-state-machine` | Single `useForm()` + `trigger()` | RHF docs still show little-state-machine but community uses single useForm | For non-URL-routed steps (our case), single useForm + conditional rendering + trigger() is the standard pattern |
| Form submission via fetch | React Router `<Form>` + action + auto-revalidation | React Router 6→7 | Use `useSubmit()` or `<Form>` for mutations; never manual fetch |

**Deprecated/outdated:**
- `z.string().ip()`: Removed in Zod v4 — use `z.ipv4()` or `z.ipv6()` [VERIFIED: Context7 /websites/zod_dev_v4]
- `z.string().cidr()`: Removed in Zod v4 — use `z.cidrv4()` or `z.cidrv6()` [VERIFIED: Context7 /websites/zod_dev_v4]
- Zod v3 `message` parameter: Deprecated in v4 — use `error` parameter instead [VERIFIED: Context7 /websites/zod_dev_v4]
- Formik: Deprecated — RHF is the standard [CITED: STACK.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useSubmit()` from React Router is the best bridge between RHF handleSubmit and RR7 actions | Architecture Patterns | If `useSubmit()` doesn't work with SSR or has quirks, the fallback is constructing a hidden `<Form>` with hidden inputs and triggering its native `submit()` |
| A2 | Zod's `.discriminatedUnion()` works well for the conditional new-player validation path | Common Pitfalls 5 | If discriminatedUnion + `.and()` intersection doesn't work cleanly with zodResolver, fallback to manual `trigger()` per conditional path (simpler approach documented in Pitfall 5) |
| A3 | No debouncing library needed for the player combobox — the player list is small enough (<200) that filtering is instant client-side | Don't Hand-Roll | If player list grows beyond ~500, add `useDeferredValue` or a simple `setTimeout` debounce. No library needed — `setTimeout` + `clearTimeout` in useEffect is sufficient |
| A4 | The `height` and `weight` fields in the inline new-player creation should be optional (matching the data model where they're `z.number().int().positive().optional()`) | Code Examples | Low risk — if they become required, just change the form schema |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Should the form have a step 0 for player/scout selection, or should scout selection be above all steps?**
   - What we know: D-06 says scout identity via dropdown; D-04/D-05 say player selection with inline creation. These logically come before any attribute rating.
   - What's unclear: Whether player/scout selection is a "step" (making it 5 steps total: select → physical → technical → tactical → notes) or a header section above the 4 attribute steps.
   - Recommendation: Treat player/scout selection as a pre-step (step 0), making 5 total steps. The step indicator shows "Physical (1/4)" through "Notes (4/4)" for the attribute steps, with the player/scout section always visible at the top OR as a preliminary step. This is OpenCode's discretion per CONTEXT.md.

2. **Should the match context fields (matchDate, opponent, competition, matchResult) be in a specific step?**
   - What we know: They're required for the report schema but don't belong to any attribute category.
   - What's unclear: CONTEXT.md says "Match result field placement" is OpenCode's discretion.
   - Recommendation: Place match context fields (date, opponent, competition, result) in the Notes step (step 4/4), since that step also has the free-text notes field. Alternatively, they could be in step 0 with player/scout selection. The Notes step is logical because it's where the scout provides context for the entire report.

3. **How should the form behave after successful submission?**
   - What we know: ARCHITECTURE.md shows actions → redirect or return success.
   - What's unclear: Should the form reset for a new report, or navigate to a confirmation page?
   - Recommendation: Reset the form to defaultValues and show a success message. No "my reports" page exists yet (Phase 3). The simplest successful UX is: form clears, toast/inline message says "Report submitted", scout can immediately enter another report.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | React Router SSR | ✓ | 24.13.0 | — |
| npm | Package installation | ✓ | 11.6.2 | — |
| Vite | Build tool | ✓ | ^8.0.3 | — |
| TypeScript | Type checking | ✓ | ^5.9.3 | — |
| react-hook-form | Form management | ✗ | — | npm install (required) |
| @hookform/resolvers | Zod-RHF bridge | ✗ | — | npm install (required) |
| clsx | Conditional classes | ✗ | — | npm install (required) |
| Tailwind CSS 4 | Styling | ✓ | ^4.2.2 | — |
| React 19 | UI runtime | ✓ | ^19.2.6 | — |
| React Router 7 | Framework | ✓ | 7.15.0 | — |
| Zod 4 | Validation | ✓ | ^4.4.3 | — |

**Missing dependencies with no fallback:**
- react-hook-form — blocks all form implementation
- @hookform/resolvers — blocks zodResolver integration
- clsx — blocks conditional styling (could inline ternaries but clsx is cleaner)

**Missing dependencies with fallback:**
- None — all missing packages are required with no alternative

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (recommended — Vite-native, fast, ESM-first) |
| Config file | none — see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

**Note:** No test framework is currently installed. The project uses Vite 8, which pairs naturally with Vitest. However, this phase may defer test infrastructure setup to a later phase given the UI-heavy nature. At minimum, the action's FormData parsing + Zod validation can be unit-tested.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCOUT-01 | New player creation within report flow | integration | `npx vitest run tests/scout-report-action.test.ts` | ❌ Wave 0 |
| SCOUT-02 | Staged form with step-by-step validation | unit | `npx vitest run tests/step-validation.test.ts` | ❌ Wave 0 |
| SCOUT-02 | Null handling for "not observed" attributes | unit | `npx vitest run tests/attribute-score.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vitest` + `@vitest/coverage-v8` install — framework setup
- [ ] `vitest.config.ts` — Vite-compatible test config
- [ ] `tests/scout-report-action.test.ts` — covers SCOUT-01 (action parses FormData correctly, creates player + report)
- [ ] `tests/attribute-score.test.ts` — covers nullable number parsing (formValueToNullableNumber helper)
- [ ] `tests/step-validation.test.ts` — covers step field mapping + trigger() validation logic

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in v1 (role selection only, per ARCHITECTURE.md) |
| V3 Session Management | no | No sessions in v1 |
| V4 Access Control | no | No access control in v1 — single-organization internal tool |
| V5 Input Validation | yes | Zod v4 schemas validate both client-side (RHF zodResolver) and server-side (action re-validation) |
| V6 Cryptography | no | No encryption needed in v1 |
| V8 Data Protection | yes | Server-side re-validation prevents client bypass; Zod schemas enforce type safety |

### Known Threat Patterns for React Router 7 + FormData

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client-side validation bypass | Tampering | Server-side re-validation with same Zod schema in action (ARCHITECTURE.md Pattern 2) |
| FormData type coercion | Tampering | `formValueToNullableNumber()` helper + Zod schema parsing; never trust FormData strings directly |
| Mass assignment (extra fields) | Tampering | Zod schema `.passthrough()` / `.strict()` — v4 strips unknown keys by default on `.parse()` |
| Concurrent JSON writes | Tampering | Known limitation (WR-02 in data.ts); acceptable at U15 scouting scale |

## Sources

### Primary (HIGH confidence)

- Context7 `/react-hook-form/resolvers` — zodResolver API, Zod v3/v4 auto-detection, raw mode, criteriaMode
- Context7 `/react-hook-form/documentation` — trigger() API, Controller render props, useForm defaults, FormProvider
- Context7 `/websites/zod_dev_v4` — Zod v4 API: nullable, partial, pick, omit, extend, discriminatedUnion, error vs message parameter
- Context7 `/remix-run/react-router` — prefix() route config, Form component, action/loader pattern, useSubmit, useNavigation, redirect
- npm registry — react-hook-form 7.75.0, @hookform/resolvers 5.2.2, zod 4.4.3, clsx 2.1.1 (version verification)

### Secondary (MEDIUM confidence)

- Zod v4 package exports — verified `zod/v4` subpath export exists; `from "zod"` defaults to v4
- Runtime test — confirmed Zod v4 schemas in types.ts parse correctly with `from "zod"` (nullable, partial, pick, enum all work)
- RHF official docs advanced-usage — wizard form pattern with little-state-machine (adapted to single useForm approach)

### Tertiary (LOW confidence)

- WAI-ARIA Combobox Authoring Practices — referenced for accessibility attributes but not fetched directly in this session; pattern is well-known and stable

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry; Zod v4 compatibility confirmed by runtime test and @hookform/resolvers docs
- Architecture: HIGH — patterns derived from Context7 docs for RHF, React Router, and Zod; bridge pattern (RHF → React Router action) reasoned from both libraries' APIs
- Pitfalls: HIGH — FormData null handling, conditional validation, and zodResolver behavior verified against source code and runtime behavior

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (stable libraries, 30-day window)
