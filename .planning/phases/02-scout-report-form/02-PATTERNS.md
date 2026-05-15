# Phase 2: Scout Report Form - Pattern Map

**Mapped:** 2026-05-12
**Files analyzed:** 8 (6 new, 2 modified/reference)
**Analogs found:** 4 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `app/routes/scout/report.tsx` | route | request-response | `app/routes/home.tsx` | role-match (route structure), root.tsx for error boundary |
| `app/components/scout-report-form.tsx` | component | request-response | `app/welcome/welcome.tsx` | partial (layout pattern only — no form analog exists) |
| `app/components/step-indicator.tsx` | component | transform | — | no analog (first UI component) |
| `app/components/attribute-rating-row.tsx` | component | transform | — | no analog (first custom input) |
| `app/components/player-combobox.tsx` | component | request-response | — | no analog (first combobox) |
| `app/components/new-player-fields.tsx` | component | transform | — | no analog (first form section) |
| `app/routes.ts` | config | — | `app/routes.ts` (self) | exact (modification) |
| `app/data/types.ts` | model | — | `app/data/types.ts` (self) | exact (reference, not modified) |

## Pattern Assignments

### `app/routes/scout/report.tsx` (route, request-response)

**Analog:** `app/routes/home.tsx` (route module pattern) + `app/root.tsx` (error boundary pattern)

**Imports pattern** — from `app/routes/home.tsx` (lines 1-2):
```typescript
import type { Route } from "./+types/report";
```
Extended for this route's needs:
```typescript
import type { Route } from "./+types/report";
import { redirect } from "react-router";
import { getPlayers, getScouts, createPlayer, createReport } from "~/data/data";
import { playerSchema, reportSchema } from "~/data/types";
import { ScoutReportForm } from "~/components/scout-report-form";
```

**Route module pattern** — from `app/routes/home.tsx` (lines 1-13):
```typescript
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
```
**Key conventions extracted:**
- Typed `Route` import from `./+types/{name}` (React Router 7 file-based type generation)
- `meta` export for SEO
- Default export renders a child component (delegates UI to component)
- Relative import for co-located components, `~/` alias for cross-module imports

**Loader pattern** — new, based on `app/data/data.ts` API (lines 15-27, 115-127):
```typescript
// Pattern: async function that calls data layer, returns serializable data
export async function loader({}: Route.LoaderArgs) {
  const [players, scouts] = await Promise.all([getPlayers(), getScouts()]);
  return { players, scouts };
}
```
**Data layer API from `app/data/data.ts`:**
- `getPlayers(): Promise<Player[]>` (line 15) — returns all players, empty array if no file
- `getScouts(): Promise<Scout[]>` (line 115) — returns all scouts, empty array if no file
- `createPlayer(input: NewPlayer): Promise<Player>` (line 37) — creates player, validates with schema
- `createReport(input: NewReport): Promise<Report>` (line 82) — creates report, validates FK references

**Action pattern** — new, based on React Router 7 action convention + data.ts API:
```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Helper: FormData string → number | null (PITFALL: FormData stores strings only)
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

  await createReport({
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
    // ... technical, tactical, matchNotes follow same pattern
  });

  return redirect("/scout/report");
}
```

**Error handling** — from `app/root.tsx` (lines 48-74):
```typescript
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404
      ? "The requested page could not be found."
      : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
```

**Component default export pattern:**
```typescript
export default function ScoutReportRoute({ loaderData }: Route.ComponentProps) {
  return <ScoutReportForm players={loaderData.players} scouts={loaderData.scouts} />;
}
```

---

### `app/components/scout-report-form.tsx` (component, request-response)

**Analog:** `app/welcome/welcome.tsx` (layout/styling pattern only — no form analog exists in codebase)

**Layout pattern** — from `app/welcome/welcome.tsx` (lines 4-47):
```typescript
export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          {/* ... */}
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            {/* ... */}
          </nav>
        </div>
      </div>
    </main>
  );
}
```
**Key conventions extracted:**
- Named export (not default) — `export function ComponentName()`
- Tailwind utility classes for layout, spacing, borders
- `dark:` variant support for dark mode
- Container pattern: `<main>` → centered `<div>` → content sections with `space-y-*` and `gap-*`
- Rounded containers with `border border-gray-200 p-6`

**Form orchestrator pattern** (no existing analog — derive from RESEARCH.md Pattern 1 + Pattern 2):
```typescript
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmit, useNavigation, useActionData } from "react-router";
import { z } from "zod";
import clsx from "clsx";
import { StepIndicator } from "./step-indicator";
import { AttributeRatingRow } from "./attribute-rating-row";
import { PlayerCombobox } from "./player-combobox";
import { NewPlayerFields } from "./new-player-fields";
// Zod schemas from types.ts — composed into form schema
import {
  physicalAttributesSchema,
  technicalAttributesSchema,
  tacticalAttributesSchema,
  matchNotesAttributesSchema,
  isoDateSchema,
  positionGroupSchema,
  positionSchema,
  nationalityCodeSchema,
  preferredFootSchema,
} from "~/data/types";
```

**Core pattern — single useForm wizard with trigger():**
```typescript
const STEP_FIELDS = {
  0: ["scoutId", "playerId", "isNewPlayer", /* + player creation fields */],
  1: ["physical.pace", "physical.strength", "physical.stamina", "physical.agility"],
  2: ["technical.finishing", "technical.passing", "technical.dribbling", "technical.firstTouch"],
  3: ["tactical.positioning", "tactical.awareness", "tactical.decisionMaking", "tactical.workRate"],
  4: ["matchNotes.attitude", "matchNotes.coachability", "matchNotes.intensity",
      "matchNotes.impact", "matchNotes.notes", "matchDate", "opponent", "competition", "matchResult"],
} as const;

function ScoutReportForm({ players, scouts }: { players: Player[]; scouts: Scout[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      isNewPlayer: false,
      physical: { pace: null, strength: null, stamina: null, agility: null },
      technical: { finishing: null, passing: null, dribbling: null, firstTouch: null },
      tactical: { positioning: null, awareness: null, decisionMaking: null, workRate: null },
      matchNotes: { attitude: null, coachability: null, intensity: null, impact: null, notes: "" },
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep] as string[];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  // ... render current step's fields
}
```

**RHF → React Router action bridge** (useSubmit pattern):
```typescript
const submit = useSubmit();
const navigation = useNavigation();
const isSubmitting = navigation.state === "submitting";

const onValidSubmit = (data: ReportFormValues) => {
  const formData = new FormData();
  formData.append("intent", data.isNewPlayer ? "create-player-and-report" : "create-report");
  // Flatten nested objects for FormData using dot notation
  for (const [key, value] of Object.entries(data.physical)) {
    formData.append(`physical.${key}`, String(value ?? "null"));
  }
  // ... other categories
  submit(formData, { method: "post" });
};
```

---

### `app/components/step-indicator.tsx` (component, transform)

**No analog found** — first UI component in the project. No existing progress/step indicators.

**Pattern to follow:** Pure presentational component with Tailwind styling conventions from `welcome.tsx`:
```typescript
// Follow the named export pattern from welcome.tsx
export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={clsx(
            "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
            index === currentStep
              ? "bg-blue-600 text-white"
              : index < currentStep
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500"
          )}
        >
          <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
            {index + 1}
          </span>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
```

**Styling conventions from `welcome.tsx`:**
- `rounded-*` for containers (welcome uses `rounded-3xl`, steps use `rounded-full`)
- `px-* py-*` for padding (welcome uses `p-3`, `p-6`)
- `text-sm font-medium` for labels (welcome uses similar patterns)
- `space-y-*` and `gap-*` for spacing between elements
- `dark:` variant for dark mode support

---

### `app/components/attribute-rating-row.tsx` (component, transform)

**No analog found** — no custom input components exist in the codebase.

**Pattern to follow:** RHF Controller-wrapped custom input (from RESEARCH.md Pattern 3):
```typescript
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import clsx from "clsx";

interface AttributeRatingRowProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
}

export function AttributeRatingRow<T extends FieldValues>({
  name, label, control,
}: AttributeRatingRowProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">{label}</span>
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
          {error && <span className="text-red-500 text-xs">{error.message}</span>}
        </div>
      )}
    />
  );
}
```

**Zod schema alignment** — from `app/data/types.ts` (lines 38-40):
```typescript
// Attribute score: 1-5 integer or null (not observed) - NEVER treat null as 3 (D-03)
export const attributeScoreSchema = z.number().int().min(1).max(5).nullable();
```
The Controller's `onChange` emits `1|2|3|4|5|null` — exactly matching `attributeScoreSchema`.

---

### `app/components/player-combobox.tsx` (component, request-response)

**No analog found** — no combobox/autocomplete components exist.

**Pattern to follow:** RHF Controller + WAI-ARIA Combobox (from RESEARCH.md Pattern 4):
```typescript
import { useState, useEffect, useRef } from "react";
import { Controller, type Control } from "react-hook-form";
import clsx from "clsx";

export function PlayerCombobox({ players, control, onSelectNew }: PlayerComboboxProps) {
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
          <input
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="player-listbox"
            className="w-full border rounded px-3 py-2"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => { /* ArrowDown, ArrowUp, Enter, Escape */ }}
          />
          {isOpen && (
            <ul role="listbox" className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
              {filteredPlayers.map((player, index) => (
                <li
                  key={player.id}
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
        </div>
      )}
    />
  );
}
```

**Key data shapes from `app/data/types.ts`:**
```typescript
// Player type (line 80-93)
export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  dateOfBirth: isoDateSchema,
  positionGroup: positionGroupSchema,
  position: positionSchema,
  club: z.string().min(1),
  nationality: nationalityCodeSchema,
  preferredFoot: preferredFootSchema,
  height: z.number().int().positive().optional(),
  weight: z.number().int().positive().optional(),
  createdAt: isoDateTimeSchema,
});
```

**Combobox display pattern** — from `app/data/players.json`: show `"{name} — {club}"` in dropdown items.

---

### `app/components/new-player-fields.tsx` (component, transform)

**No analog found** — no inline form sections exist.

**Pattern to follow:** Standard RHF `register()` inputs + Zod schema composition from `app/data/types.ts`.

**Zod schemas to compose** — from `app/data/types.ts`:
```typescript
// Reusable schemas for player fields (lines 4-32)
export const positionGroupSchema = z.enum(["GK", "DEF", "MID", "FWD"]);    // line 4
export const positionSchema = z.enum(["GK","CB","LB","RB","LWB","RWB",     // line 7
  "CDM","CM","CAM","LM","RM","LW","RW","CF","ST"]);
export const preferredFootSchema = z.enum(["left", "right", "both"]);      // line 27
export const nationalityCodeSchema = z.string().regex(/^[A-Z]{2}$/);       // line 31
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);     // line 35

// Player schema for form = playerSchema.omit({ id: true, createdAt: true })
// This gives us the NewPlayer type (line 94):
export type NewPlayer = Omit<Player, "id" | "createdAt">;
```

**Component pattern:**
```typescript
import { type UseFormRegister } from "react-hook-form";
import { positionGroupSchema, positionSchema, preferredFootSchema } from "~/data/types";

interface NewPlayerFieldsProps {
  register: UseFormRegister<ReportFormValues>;
  isVisible: boolean;
}

export function NewPlayerFields({ register, isVisible }: NewPlayerFieldsProps) {
  if (!isVisible) return null;

  return (
    <div className="space-y-4 mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
      <h3 className="text-sm font-semibold text-blue-700">New Player Details</h3>
      <input {...register("playerName")} placeholder="Player name" className="w-full border rounded px-3 py-2" />
      <input {...register("playerDateOfBirth")} type="date" className="w-full border rounded px-3 py-2" />
      <select {...register("playerPositionGroup")} className="w-full border rounded px-3 py-2">
        {/* positionGroupSchema options: GK, DEF, MID, FWD */}
      </select>
      <select {...register("playerPosition")} className="w-full border rounded px-3 py-2">
        {/* positionSchema options */}
      </select>
      <input {...register("playerClub")} placeholder="Club" className="w-full border rounded px-3 py-2" />
      {/* nationality, preferredFoot, height, weight ... */}
    </div>
  );
}
```

---

### `app/routes.ts` (config, modification)

**Analog:** `app/routes.ts` (self — modification)

**Current content** (lines 1-3):
```typescript
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx")] satisfies RouteConfig;
```

**New content** — add `prefix()` from `@react-router/dev/routes`:
```typescript
import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("scout", [
    route("report", "routes/scout/report.tsx"),  // /scout/report
  ]),
] satisfies RouteConfig;
```

**Key pattern:** `prefix()` spreads into the parent array with `...prefix()`. Route files follow `routes/{prefix}/{name}.tsx` convention.

---

### `app/data/types.ts` (model, reference only)

**Not modified** — existing schemas are imported and composed into the form schema. Key schemas used:

| Schema | Line | Used By |
|--------|------|---------|
| `attributeScoreSchema` | 39 | `AttributeRatingRow` — defines 1-5\|null validation |
| `physicalAttributesSchema` | 43-48 | Form step 1 validation |
| `technicalAttributesSchema` | 52-57 | Form step 2 validation |
| `tacticalAttributesSchema` | 61-66 | Form step 3 validation |
| `matchNotesAttributesSchema` | 70-76 | Form step 4 validation |
| `positionGroupSchema` | 4 | `NewPlayerFields` position group select |
| `positionSchema` | 7-23 | `NewPlayerFields` position select |
| `preferredFootSchema` | 27 | `NewPlayerFields` foot select |
| `nationalityCodeSchema` | 31 | `NewPlayerFields` nationality input |
| `isoDateSchema` | 35 | `NewPlayerFields` DOB, form matchDate |
| `playerSchema` | 80-92 | Server-side player validation in action |
| `reportSchema` | 97-110 | Server-side report validation in action |

**Form schema composition pattern:**
```typescript
// Build form schema by composing existing schemas — NOT by duplicating
import { z } from "zod";
import {
  physicalAttributesSchema, technicalAttributesSchema,
  tacticalAttributesSchema, matchNotesAttributesSchema,
  isoDateSchema, positionGroupSchema, positionSchema,
  nationalityCodeSchema, preferredFootSchema,
} from "~/data/types";

// Form schema = data schema minus server-generated fields
const reportFormSchema = z.discriminatedUnion("isNewPlayer", [
  z.object({
    isNewPlayer: z.literal(false),
    playerId: z.string().min(1, "Select a player"),
    scoutId: z.string().min(1, "Select a scout"),
    matchDate: isoDateSchema,
    opponent: z.string().min(1),
    competition: z.string().min(1),
    matchResult: z.string().optional(),
    physical: physicalAttributesSchema,
    technical: technicalAttributesSchema,
    tactical: tacticalAttributesSchema,
    matchNotes: matchNotesAttributesSchema,
  }),
  z.object({
    isNewPlayer: z.literal(true),
    playerName: z.string().min(1),
    playerDateOfBirth: isoDateSchema,
    playerPositionGroup: positionGroupSchema,
    playerPosition: positionSchema,
    playerClub: z.string().min(1),
    playerNationality: nationalityCodeSchema,
    playerPreferredFoot: preferredFootSchema,
    playerHeight: z.number().int().positive().optional(),
    playerWeight: z.number().int().positive().optional(),
    scoutId: z.string().min(1, "Select a scout"),
    matchDate: isoDateSchema,
    opponent: z.string().min(1),
    competition: z.string().min(1),
    matchResult: z.string().optional(),
    physical: physicalAttributesSchema,
    technical: technicalAttributesSchema,
    tactical: tacticalAttributesSchema,
    matchNotes: matchNotesAttributesSchema,
  }),
]);
```

---

## Shared Patterns

### Import Convention (all new files)

**Source:** `tsconfig.json` (line 17), `app/routes/home.tsx` (lines 1-2)

**Apply to:** All new files in `app/`

```typescript
// Path alias: ~/ → ./app/*  (from tsconfig.json line 17)
// Cross-module imports use ~/:
import { getPlayers, createReport } from "~/data/data";
import { playerSchema, reportSchema } from "~/data/types";

// Co-located imports use relative paths:
import type { Route } from "./+types/report";
import { StepIndicator } from "./step-indicator";

// Type imports use `import type` (enforced by verbatimModuleSyntax in tsconfig):
import type { Player, Scout } from "~/data/types";
```

### Tailwind CSS 4 Styling (all components)

**Source:** `app/app.css` (lines 1-6), `app/welcome/welcome.tsx`

**Apply to:** All new component files

```typescript
// Tailwind 4: imported via @tailwindcss/vite plugin — no PostCSS config needed
// Theme: Inter font family (app.css line 4)
// Dark mode: class-based via `dark:` prefix (welcome.tsx uses dark: variants)

// Common class patterns from welcome.tsx:
// Container:  "rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4"
// Text:       "text-sm font-medium", "leading-6 text-gray-700 dark:text-gray-200"
// Links:      "text-blue-700 hover:underline dark:text-blue-500"
// Hover:      "hover:bg-gray-50", "hover:underline"
// Spacing:    "space-y-4", "gap-3", "p-3", "px-4"
```

### Zod Schema Composition (form + action validation)

**Source:** `app/data/types.ts`

**Apply to:** `scout-report-form.tsx` (form schema), `routes/scout/report.tsx` (action validation)

```typescript
// NEVER duplicate schemas — compose from existing ones
// Form schema: omit server-generated fields
// playerSchema.omit({ id: true, createdAt: true })  → NewPlayer shape
// reportSchema.omit({ id: true, createdAt: true })  → NewReport shape

// CRITICAL: Attribute defaults MUST be null, never 3
// From types.ts line 38-39:
// attributeScoreSchema = z.number().int().min(1).max(5).nullable()
// In defaultValues: { pace: null }  ← correct
//                  : { pace: 3 }     ← WRONG (Pitfall 8 / D-03)
```

### React Router 7 Route Module Pattern

**Source:** `app/routes/home.tsx`, `app/root.tsx`

**Apply to:** `app/routes/scout/report.tsx`

```typescript
// Exports from a route module:
// 1. meta()          — SEO metadata (from home.tsx)
// 2. loader()        — Server-side data fetching (NEW for this route)
// 3. action()        — Server-side mutation handler (NEW for this route)
// 4. default export  — UI component receiving loaderData (from home.tsx pattern)
// 5. ErrorBoundary   — Error display (from root.tsx)

// Typed args: Route.LoaderArgs, Route.ActionArgs, Route.ComponentProps
// Type import: import type { Route } from "./+types/report"
```

### FormData Null Handling (action)

**Source:** RESEARCH.md Pitfall 2

**Apply to:** `app/routes/scout/report.tsx` action

```typescript
// FormData only stores strings. null → "null" (string), not JavaScript null.
// MUST convert on server side:
const toNullableNumber = (val: FormDataEntryValue | null): number | null => {
  if (!val || val === "null" || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};

// Usage for every attribute field:
physical: {
  pace: toNullableNumber(formData.get("physical.pace")),
  strength: toNullableNumber(formData.get("physical.strength")),
  // ...
}
```

### Data Layer API (loader/action)

**Source:** `app/data/data.ts`

**Apply to:** `app/routes/scout/report.tsx` loader and action

| Function | Signature | Returns | Line |
|----------|-----------|---------|------|
| `getPlayers()` | `() => Promise<Player[]>` | All players (empty array if no file) | 15 |
| `getScouts()` | `() => Promise<Scout[]>` | All scouts (empty array if no file) | 115 |
| `createPlayer()` | `(input: NewPlayer) => Promise<Player>` | New player with `id` + `createdAt` | 37 |
| `createReport()` | `(input: NewReport) => Promise<Report>` | New report; validates FK refs exist | 82 |

**Important:** `createReport()` (line 82-86) validates that `playerId` and `scoutId` reference existing records. When creating a new player + report in the same action, call `createPlayer()` FIRST to get the `playerId`, then pass it to `createReport()`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `app/components/step-indicator.tsx` | component | transform | No progress/step UI components exist in codebase |
| `app/components/attribute-rating-row.tsx` | component | transform | No custom input components exist; first Controller-wrapped widget |
| `app/components/player-combobox.tsx` | component | request-response | No combobox/autocomplete components exist; first search-as-you-type widget |
| `app/components/new-player-fields.tsx` | component | transform | No inline form sections exist; first conditional form block |

**For files with no analog, the planner should use:**
- RESEARCH.md Pattern 3 (Controller-wrapped button group) for `attribute-rating-row.tsx`
- RESEARCH.md Pattern 4 (Combobox without component library) for `player-combobox.tsx`
- RESEARCH.md Pattern 1 (Single useForm wizard) for `scout-report-form.tsx` step orchestration
- Tailwind styling conventions from `welcome.tsx` for all components
- WAI-ARIA Authoring Practices for `player-combobox.tsx` accessibility

---

## Metadata

**Analog search scope:** `app/routes/`, `app/components/`, `app/welcome/`, `app/data/`, `app/root.tsx`, `app/app.css`, `tsconfig.json`, `react-router.config.ts`, `package.json`

**Files scanned:** 10
- `app/routes/home.tsx` — route module pattern
- `app/welcome/welcome.tsx` — component layout/styling pattern
- `app/root.tsx` — error boundary pattern, layout structure
- `app/data/types.ts` — Zod schemas to compose
- `app/data/data.ts` — data layer API to call
- `app/routes.ts` — route config to modify
- `app/app.css` — Tailwind theme setup
- `tsconfig.json` — path alias config
- `react-router.config.ts` — SSR enabled
- `package.json` — dependencies (Zod v4 already installed; RHF + resolvers + clsx need installing)

**Pattern extraction date:** 2026-05-12
