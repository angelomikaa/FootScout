# Phase 3: Draft & Report Management - Research

**Researched:** 2026-05-13
**Domain:** Draft persistence, report list view, cookie-based scout identity in React Router 7 framework mode
**Confidence:** HIGH

## Summary

Phase 3 extends the existing scout report form with draft persistence (auto-save on step transitions), draft resume (step-position memory + pre-filled values), and a "my reports" table view at `/scout/reports`. All 13 decisions (D-01 through D-13) are locked from the discuss phase. The implementation centers on three concrete technical additions: (1) a `status` field on `reportSchema` enabling draft/submitted distinction, (2) data layer CRUD functions for draft operations (getDraftByScout, upsertDraft, submitDraft), and (3) cookie-based scout identity persistence using React Router 7's `createCookie` API. The auto-save mechanism uses `useFetcher().submit()` — not `useSubmit()` — because step transitions should persist the draft without causing a full navigation that resets form state.

The overall average calculation (D-12) is a pure function: collect all non-null attribute values across the 4 scored categories (16 attributes total), sum them, divide by the count of non-null values. This is a simple mean, not weighted. It excludes `matchNotes.notes` (free-text) from the denominator.

**Primary recommendation:** Add `status` and `currentStep` fields to `reportSchema`, use `useFetcher` for auto-save on step transitions (avoids navigation-induced state loss), use `createCookie` from `react-router` for scout identity persistence, and build the `/scout/reports` route as a standard loader+component page with a scout dropdown filter.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Drafts use a `status` field on the existing `reportSchema`: `'draft' | 'submitted'`. Drafts and submitted reports coexist in `reports.json`. Filtering by status + scoutId gives "my drafts" and "my reports" from the same source. No separate drafts file.
- **D-02:** Auto-save on every step transition (Next/Back). Every step change triggers a server action to persist the draft. A visible "Draft saved" indicator confirms persistence to the scout.
- **D-03:** One draft per scout. If the scout starts a new report while a draft exists, the existing draft is replaced (with confirmation). The form is always a single in-progress report per scout.
- **D-04:** Draft → submitted: on form submit, the `status` field flips from `'draft'` to `'submitted'` in-place. Same report record, same ID. No delete+create.
- **D-05:** Data layer note: JSON files are fine for now. The user intends to migrate to spreadsheets (CSV/Excel) as the data store in the future. The async data layer interface abstracts this — swapping storage is a future task.
- **D-06:** When resuming a draft, the form restores all previously entered values AND lands on the last step the scout was on.
- **D-07:** Draft discovery via banner on form entry. When the scout selects their identity (or it's auto-selected from cookie), if a draft exists for that scout, a banner appears: "You have an unsaved draft for [player name]. Resume or discard?" Resume loads the draft; Discard deletes it and starts fresh.
- **D-08:** Draft is scout-scoped. The draft's `scoutId` determines ownership. The form checks for drafts belonging to the currently-selected scout.
- **D-09:** Table layout at `/scout/reports` route. Separate from the report form (`/scout/report`). Clean separation — form is for entry, reports is for reviewing.
- **D-10:** Scout dropdown filter at the top of the reports page. Once a scout is selected, the table filters to their submitted reports. Same identity pattern as the report form.
- **D-11:** Full-detail columns: Player name, Match date, Opponent, Competition, Match result, Overall average score. The overall average is a simple numeric average across all rated (non-null) attributes in that report — excludes null from the denominator.
- **D-12:** One overall average number per report in the table. Compact, fits one cell. Enough to quickly spot standout or weak reports. Per-category breakdowns belong on the player profile (Phase 5).
- **D-13:** Cookie-persisted scout selection. Store the last-selected `scoutId` in a cookie. Auto-select the scout on page load for both `/scout/report` and `/scout/reports`. Scout can change via dropdown at any time.

### OpenCode's Discretion
- Draft banner styling and placement
- "Draft saved" indicator position and animation
- Table column widths and responsive behavior
- Overall average number formatting (decimal places)
- Cookie name and expiration duration
- Confirmation dialog styling for draft replacement
- Sort direction defaults for the reports table

### Deferred Ideas (OUT OF SCOPE)
- Report editing (edit submitted reports) — future phase, not scoped here
- Division-side report views — Phase 4/5
- Per-category score breakdowns in the reports table — Phase 5 (player profile)
- Spreadsheet/CSV data layer migration — future task, JSON files for now
- Bulk draft management (drafts list page) — one draft per scout makes this unnecessary
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCOUT-03 | Scout can save report as draft and resume later | D-01 through D-08: `status` field on reportSchema, auto-save on step transitions via useFetcher, draft resume with step-position memory, one draft per scout with replace confirmation |
| SCOUT-04 | Scout can view list of their own submitted reports | D-09 through D-13: `/scout/reports` route with loader, scout dropdown filter, 6-column table including overall average (nulls excluded from denominator), cookie-persisted scout selection |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Draft persistence (auto-save) | API / Backend | Frontend Server (SSR) | Write happens in route action → data layer; SSR loader reads draft for resume |
| Draft resume (pre-fill + step restore) | Browser / Client | Frontend Server (SSR) | Server loads draft data in loader; client pre-fills RHF defaultValues and restores step state |
| Cookie-based scout identity | Frontend Server (SSR) | Browser / Client | Cookie is parsed in server loader via `request.headers`; Set-Cookie header returned from actions |
| Report list view | Frontend Server (SSR) | — | Loader fetches reports from data layer; server renders table HTML |
| Overall average calculation | Browser / Client | API / Backend | Pure computation from report data; could live server-side for sorting but primarily for display |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router | 7.15.0 | Framework mode (loaders, actions, cookies) | Project stack — locked by AGENTS.md |
| react-hook-form | ^7.75.0 | Form state management with draft resume | Installed in Phase 2 — RHF defaultValues handles draft pre-fill |
| zod | ^4.4.3 | Schema validation including `status` enum | Installed in Phase 1 — extends reportSchema with status field |
| clsx | ^2.1.1 | Conditional CSS classes for UI components | Installed in Phase 2 — table styling, banner, indicator |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| createCookie (from react-router) | 7.15.0 | Cookie creation/parse/serialize for scout identity | D-13 — scout selection persistence across routes |
| useFetcher (from react-router) | 7.15.0 | Non-navigating form submission for auto-save | D-02 — auto-save on step transitions without page navigation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useFetcher for auto-save | useSubmit | useSubmit causes navigation (adds history entry, re-runs loaders, resets component state); useFetcher submits silently without navigation — essential for preserving step state during auto-save |
| createCookie for scout identity | URL search params for scout | URL params are bookmarkable but awkward for identity (scout ID in every URL); cookie is invisible to user, persists across routes, and works with SSR loaders |
| status field on reportSchema | Separate drafts.json file | Separate file breaks the "one source of truth" model; status field keeps drafts and reports in same collection, filterable by status+scoutId |

**Installation:** No new packages needed — all functionality uses existing dependencies.

**Version verification:**
```
react-router: 7.15.0 [VERIFIED: npm registry, 2026-05-13]
zod: 4.4.3 [VERIFIED: npm registry, 2026-05-13]
react-hook-form: ^7.75.0 [VERIFIED: package.json]
```

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ Browser                                                       │
│                                                               │
│  /scout/report                     /scout/reports             │
│  ┌────────────────────┐           ┌──────────────────────┐   │
│  │ ScoutReportForm    │           │ ReportsTable          │   │
│  │ ├─ RHF (values)    │           │ ├─ ScoutDropdown      │   │
│  │ ├─ Step state      │           │ ├─ Table rows         │   │
│  │ └─ Draft banner    │           │ └─ Overall avg calc   │   │
│  └──────┬──────┬──────┘           └──────────┬───────────┘   │
│         │      │                              │               │
│   Next/Back   fetcher.submit()         Loader reads          │
│   (step Δ)   (auto-save draft)         cookie+reports       │
│         │      │                              │               │
└─────────┼──────┼──────────────────────────────┼───────────────┘
          │      │                              │
══════════╪══════╪══════════════════════════════╪═════════════════
          │      │                              │
          ▼      ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│ React Router 7 Server                                         │
│                                                               │
│  /scout/report                   /scout/reports               │
│  ┌────────────────────┐         ┌──────────────────────┐     │
│  │ Loader:            │         │ Loader:              │     │
│  │  - players, scouts │         │  - scouts (all)      │     │
│  │  - draft by scout  │         │  - scoutId from cookie│     │
│  │  - scoutId cookie  │         │  - reports filtered  │     │
│  ├────────────────────┤         └──────────────────────┘     │
│  │ Action:            │                                      │
│  │  intent=save-draft │   ┌──────────────────────────┐       │
│  │  intent=submit     │   │ scoutId Cookie           │       │
│  │  intent=delete-draft│  │ (parse in loader,        │       │
│  │  intent=set-scout  │   │  serialize in action)    │       │
│  └──────┬─────────────┘   └────────────┬─────────────┘       │
│         │                               │                     │
│         ▼                               ▼                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Data Layer (data.ts)                                │     │
│  │  - getDraftByScout(scoutId)                         │     │
│  │  - upsertDraft(reportData)  ← create or update      │     │
│  │  - submitDraft(reportId)    ← status: draft→submitted│     │
│  │  - deleteDraft(reportId)    ← remove draft record    │     │
│  │  - getReportsByScout(scoutId, status?)              │     │
│  │  - updateReport(id, data)   ← generic update        │     │
│  │  Storage: reports.json (status field differentiates) │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
app/
├── cookies.server.ts      # NEW — createCookie for scout identity
├── data/
│   ├── types.ts           # MODIFIED — add status, currentStep to reportSchema
│   ├── data.ts            # MODIFIED — add draft-aware CRUD functions
│   ├── form-schema.ts     # UNCHANGED — form validation stays as-is
│   ├── reports.json       # MODIFIED — existing records get status:"submitted"
│   └── scouts.json        # UNCHANGED
├── lib/
│   └── scoring/
│       └── average.ts     # NEW — overall average calculation (pure function)
├── routes/
│   ├── scout/
│   │   ├── report.tsx     # MODIFIED — loader returns draft, action handles intents
│   │   └── reports.tsx    # NEW — my reports table view
│   └── ts
├── components/
│   ├── scout-report-form.tsx  # MODIFIED — draft resume, auto-save, banner
│   ├── draft-banner.tsx       # NEW — draft discovery/dismiss banner
│   ├── reports-table.tsx      # NEW — table component for /scout/reports
│   ├── step-indicator.tsx     # UNCHANGED
│   ├── attribute-rating-row.tsx # UNCHANGED
│   ├── player-combobox.tsx    # UNCHANGED
│   └── new-player-fields.tsx  # UNCHANGED
└── routes.ts              # MODIFIED — add /scout/reports route
```

### Pattern 1: Auto-Save with useFetcher (Non-Navigating Submit)

**What:** On every step transition (Next/Back), serialize the current form values and submit them to the route action via `useFetcher().submit()`. The fetcher does not cause navigation, so the form component's step state and RHF values are preserved.

**When to use:** Every step transition in the report form (D-02).

**Example:**

```typescript
// Source: [VERIFIED: Context7 /remix-run/react-router — useFetcher docs]
import { useFetcher, useNavigation } from "react-router";

export function ScoutReportForm({ players, scouts, draft }: ScoutReportFormProps) {
  const fetcher = useFetcher();
  const isAutoSaving = fetcher.state === "submitting";

  const handleNext = async () => {
    // ... validate current step ...
    if (isValid) {
      // Auto-save draft before transitioning
      const formData = buildDraftFormData(form.getValues(), currentStep + 1);
      fetcher.submit(formData, { method: "post" });
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };

  // Draft saved indicator
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      setShowSavedIndicator(true);
      const timer = setTimeout(() => setShowSavedIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.state, fetcher.data]);
}
```

**Why useFetcher, not useSubmit:** `useSubmit()` causes a navigation — the route's loader re-runs, the component remounts, and RHF state is lost. `useFetcher()` submits to the same action without navigation, preserving the component tree. This is the canonical pattern documented in React Router's "Form vs Fetcher" guide: "Use a fetcher for interactions that don't cause a navigation — auto-save, likes, inline edits." [VERIFIED: Context7 — react-router form-vs-fetcher docs]

### Pattern 2: Cookie-Based Scout Identity with createCookie

**What:** Create a cookie object using `createCookie` from `react-router`. Parse it in loaders to read the last-selected scout. Serialize it in actions when the scout selection changes.

**When to use:** D-13 — scout identity persistence across `/scout/report` and `/scout/reports`.

**Example:**

```typescript
// app/cookies.server.ts
// Source: [VERIFIED: Context7 /remix-run/react-router — createCookie docs]
import { createCookie } from "react-router";

export const scoutIdCookie = createCookie("scout-id", {
  path: "/scout",       // Scoped to /scout/* routes
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30, // 30 days
  httpOnly: false,       // Must be readable by client for initial selection
});

// In a loader:
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieValue = await scoutIdCookie.parse(cookieHeader);
  const scoutId = cookieValue?.scoutId || null;
  // ... fetch data ...
  return { scoutId, ... };
}

// In an action (when scout changes):
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const scoutId = formData.get("scoutId") as string;
  return data({ ok: true }, {
    headers: {
      "Set-Cookie": await scoutIdCookie.serialize({ scoutId }),
    },
  });
}
```

**SSR compatibility:** The cookie is read from `request.headers` on the server — this is the only way to read cookies in SSR. Client-side `document.cookie` would cause hydration mismatches. [VERIFIED: Context7 — react-router sessions-and-cookies docs]

### Pattern 3: Intent-Based Action Routing (Extended)

**What:** The existing action uses `formData.get("intent")` to distinguish between `create-player-and-report` and `create-report`. Extend this pattern with new intents: `save-draft`, `submit-report`, `delete-draft`, `set-scout`.

**When to use:** All mutations in the `/scout/report` action.

**Example:**

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "save-draft": {
      // Upsert draft: create if no draft exists for this scout, update if one does
      const scoutId = formData.get("scoutId") as string;
      const reportData = parseReportFormData(formData);
      await upsertDraft(scoutId, { ...reportData, status: "draft", currentStep: Number(formData.get("currentStep")) });
      // Set scout cookie
      return data({ ok: true }, {
        headers: { "Set-Cookie": await scoutIdCookie.serialize({ scoutId }) },
      });
    }
    case "submit-report": {
      // Flip status from draft to submitted (D-04)
      const reportId = formData.get("reportId") as string;
      if (reportId) {
        await submitDraft(reportId);
      } else {
        // New report submission (existing flow)
        await createReport(reportData);
      }
      return redirect("/scout/report", {
        headers: { "Set-Cookie": await scoutIdCookie.serialize({ scoutId }) },
      });
    }
    case "delete-draft": {
      const reportId = formData.get("reportId") as string;
      await deleteDraft(reportId);
      return data({ ok: true });
    }
    case "set-scout": {
      const scoutId = formData.get("scoutId") as string;
      return data({ ok: true }, {
        headers: { "Set-Cookie": await scoutIdCookie.serialize({ scoutId }) },
      });
    }
    // ... existing create-player-and-report, create-report intents ...
  }
}
```

### Pattern 4: Draft Resume via RHF defaultValues

**What:** When the loader returns a draft, the form component uses the draft's data as `defaultValues` for react-hook-form. The `currentStep` field from the draft determines which step to show first.

**When to use:** D-06, D-07 — draft resume with step-position memory.

**Example:**

```typescript
// In the route component:
export default function ScoutReportRoute({ loaderData }: Route.ComponentProps) {
  return (
    <ScoutReportForm
      players={loaderData.players}
      scouts={loaderData.scouts}
      draft={loaderData.draft}          // Draft data or null
      cookieScoutId={loaderData.scoutId} // Scout ID from cookie
    />
  );
}

// In ScoutReportForm:
export function ScoutReportForm({ players, scouts, draft, cookieScoutId }: Props) {
  const [currentStep, setCurrentStep] = useState(draft?.currentStep ?? 0);
  const [showDraftBanner, setShowDraftBanner] = useState(!!draft);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: draft
      ? draftToFormValues(draft)     // Pre-fill from draft
      : {
          isNewPlayer: false,
          scoutId: cookieScoutId || "",  // Auto-select from cookie
          // ... other defaults ...
        },
  });
}
```

### Pattern 5: Overall Average Calculation (Pure Function)

**What:** Compute the simple average of all non-null attribute scores in a report. 16 scored attributes across 4 categories (physical×4, technical×4, tactical×4, matchNotes×4). Free-text `matchNotes.notes` is excluded.

**When to use:** D-12 — overall average column in the reports table.

**Example:**

```typescript
// app/lib/scoring/average.ts
// Source: [ASSUMED] — pattern follows D-12 spec and Phase 1 D-03 (null ≠ 3)

export function calculateOverallAverage(report: Report): number | null {
  const allScores: (number | null)[] = [
    report.physical.pace, report.physical.strength,
    report.physical.stamina, report.physical.agility,
    report.technical.finishing, report.technical.passing,
    report.technical.dribbling, report.technical.firstTouch,
    report.tactical.positioning, report.tactical.awareness,
    report.tactical.decisionMaking, report.tactical.workRate,
    report.matchNotes.attitude, report.matchNotes.coachability,
    report.matchNotes.intensity, report.matchNotes.impact,
  ];

  const ratedScores = allScores.filter((s): s is number => s !== null);
  if (ratedScores.length === 0) return null; // All attributes not observed

  return ratedScores.reduce((sum, val) => sum + val, 0) / ratedScores.length;
}
```

**Key constraint:** `null` values are excluded from BOTH the numerator and denominator. This follows D-03 from Phase 1 — "not observed" is never treated as 0 or 3. If all 16 attributes are null, the average is `null` (no data to average).

### Anti-Patterns to Avoid

- **Using useSubmit() for auto-save:** `useSubmit()` causes a navigation that re-runs loaders and remounts the component, destroying RHF state and step position. Use `useFetcher().submit()` instead. [VERIFIED: Context7 — react-router form-vs-fetcher docs]
- **Using localStorage for scout identity:** Not accessible from SSR loaders — causes hydration mismatch. Cookie is parsed server-side from `request.headers`. [CITED: ARCHITECTURE.md — "Why NOT localStorage"]
- **Creating a separate drafts.json file:** D-01 explicitly states drafts and submitted reports coexist in reports.json with a `status` field. A separate file breaks the single-source model.
- **Treating null as 0 in overall average:** D-12 explicitly states nulls excluded from denominator. `null ≠ 0 ≠ 3`. [VERIFIED: AGENTS.md — "Not observed" (null) ≠ 3]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie parsing/serialization | Manual `document.cookie` string parsing | `createCookie` from `react-router` | Handles encoding, signing, SameSite, path scoping; SSR-compatible via `request.headers` |
| Non-navigating form submission | `fetch()` + manual state refresh | `useFetcher()` from `react-router` | Handles FormData serialization, automatic revalidation, state tracking (idle/submitting/loading) |
| Overall average with null exclusion | Custom reduce with null checks scattered in JSX | `calculateOverallAverage()` pure function | Centralized, testable, follows scoring engine architecture pattern |

**Key insight:** The project already uses `useSubmit()` for form submission (Phase 2). This phase ADDS `useFetcher()` for auto-save — the two coexist. `useSubmit()` remains for the final "Submit Report" action (which should navigate/redirect), while `useFetcher()` handles step-transition saves.

## Common Pitfalls

### Pitfall 1: useSubmit() vs useFetcher() Confusion for Auto-Save

**What goes wrong:** Using `useSubmit()` for draft auto-save causes the route to navigate, loaders re-run, the component remounts, and RHF form state is lost. The scout's partially-entered data disappears on every step transition.

**Why it happens:** `useSubmit()` and `useFetcher().submit()` have nearly identical APIs. The critical difference is that `useSubmit()` causes a navigation (same as `<Form method="post">`), while `useFetcher().submit()` submits without navigation. This is not obvious from the API signatures.

**How to avoid:** Use `useFetcher()` for all auto-save operations. Use `useSubmit()` (or `<Form>`) only for the final "Submit Report" action where a redirect is desired.

**Warning signs:** Form resets to default values after clicking Next; step counter jumps back to 0 after auto-save.

### Pitfall 2: Draft Resume defaultValues Not Taking Effect

**What goes wrong:** The form renders with empty values even though `defaultValues` contains draft data. RHF only applies `defaultValues` on mount — if the component is already mounted when draft data arrives (e.g., after a fetcher call), the values don't update.

**Why it happens:** RHF's `defaultValues` is only read during `useForm()` initialization. Subsequent changes to the prop are ignored. The draft data must be available BEFORE the component mounts (i.e., from the loader).

**How to avoid:** The draft is loaded in the route's `loader()` function, so it's available at mount time. The component receives `draft` as a prop and passes it to `useForm({ defaultValues: draft ? draftToFormValues(draft) : emptyDefaults })`. Since the loader provides the data before render, the values are present at mount time.

**Warning signs:** Draft data appears in `loaderData` but form shows empty fields.

### Pitfall 3: Race Condition on Rapid Step Transitions

**What goes wrong:** Scout clicks Next rapidly through steps. Multiple `fetcher.submit()` calls fire in quick succession. Each call reads all reports from the file, modifies the draft, and writes the entire file back. A later write can overwrite an earlier write's data if the earlier read hadn't completed yet.

**Why it happens:** The JSON file data layer has no locking (WR-02 from data.ts). Concurrent writes to `reports.json` are not atomic.

**How to avoid:** This is an existing data layer limitation (documented in data.ts as WR-02). At the U15 scouting scale (single-digit concurrent users), the risk is minimal. The `useFetcher` submits sequentially — the next submit waits for the previous one to complete because the fetcher state tracks submission state. However, if two different scouts auto-save simultaneously, they could overwrite each other's changes. This is accepted risk for v1 (same as Phase 2's `createReport` race condition).

**Warning signs:** Draft data intermittently resets to an earlier state after rapid step transitions.

### Pitfall 4: Cookie Not Available During SSR

**What goes wrong:** The cookie is read using `document.cookie` on the client, but during SSR the server can't access `document`. This causes a hydration mismatch — the server renders one scout selection, the client renders a different one.

**Why it happens:** `document.cookie` is a browser-only API. React Router 7 SSR renders on the server first, then hydrates on the client.

**How to avoid:** Always read cookies from `request.headers.get("Cookie")` in the loader, never from `document.cookie`. The loader runs on the server and has access to the request headers. Pass the cookie value to the component via `loaderData`.

**Warning signs:** Hydration mismatch warnings in console; scout dropdown shows different value on server vs client.

### Pitfall 5: Draft Replacement Without Confirmation

**What goes wrong:** Scout starts a new report while a draft exists, and the existing draft is silently replaced. The scout loses their in-progress work without knowing.

**Why it happens:** D-03 specifies "one draft per scout" with replacement on new report creation. If the confirmation dialog is skipped or the auto-save creates a new draft before the user responds, the old draft is gone.

**How to avoid:** Always show a confirmation dialog before replacing a draft. The draft banner (D-07) should include both "Resume" and "Discard" options. When the scout changes the player selection on step 0 while a draft exists, show the confirmation. The auto-save should NOT fire until the scout has confirmed they want to start a new report (or resumed the existing one).

**Warning signs:** Scout reports losing partially-entered data after selecting a different player.

### Pitfall 6: httpOnly Cookie Not Readable for Auto-Selection

**What goes wrong:** The cookie is created with `httpOnly: true`, but the client-side code needs to read it to auto-select the scout in the dropdown. The cookie is inaccessible from JavaScript.

**Why it happens:** `httpOnly` cookies are designed to prevent XSS access. But the scout identity is a UI preference, not a security secret — it needs to be readable by both server (loader) and client (initial selection before first server round-trip).

**How to avoid:** Set `httpOnly: false` on the scout ID cookie. The cookie only stores a scout UUID, not sensitive data. The server still reads it from `request.headers`, and the client can also read it if needed for optimistic updates. Alternatively, rely entirely on server-side reading (via loader) and don't read the cookie client-side at all — the loader provides the value before first render.

**Warning signs:** Scout dropdown shows "Select scout..." instead of auto-selecting the previously-chosen scout.

## Code Examples

Verified patterns from official sources:

### Cookie Definition (app/cookies.server.ts)

```typescript
// Source: [VERIFIED: Context7 /remix-run/react-router — createCookie API]
import { createCookie } from "react-router";

export const scoutIdCookie = createCookie("scout-id", {
  path: "/scout",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30, // 30 days — OpenCode's discretion on duration
  httpOnly: false,             // Readable by client for auto-selection
});
```

### Loader Reading Cookie + Draft

```typescript
// Source: [VERIFIED: Context7 /remix-run/react-router — cookie in loader]
import type { Route } from "./+types/report";
import { getPlayers, getScouts, getDraftByScout } from "~/data/data";
import { scoutIdCookie } from "~/cookies.server";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieValue = await scoutIdCookie.parse(cookieHeader);
  const scoutId = cookieValue?.scoutId || null;

  const [players, scouts] = await Promise.all([getPlayers(), getScouts()]);

  let draft = null;
  if (scoutId) {
    draft = await getDraftByScout(scoutId);
  }

  return { players, scouts, draft, cookieScoutId: scoutId };
}
```

### Action with Multiple Intents + Cookie

```typescript
// Source: [VERIFIED: Context7 /remix-run/react-router — action with cookie]
import { data, redirect } from "react-router";
import type { Route } from "./+types/report";
import { scoutIdCookie } from "~/cookies.server";
import { upsertDraft, submitDraft, deleteDraft, createReport, createPlayer } from "~/data/data";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await scoutIdCookie.parse(cookieHeader)) || {};

  switch (intent) {
    case "save-draft": {
      const scoutId = formData.get("scoutId") as string;
      cookie.scoutId = scoutId;
      const reportData = parseDraftFormData(formData);
      await upsertDraft(scoutId, reportData);
      return data({ ok: true }, {
        headers: { "Set-Cookie": await scoutIdCookie.serialize(cookie) },
      });
    }
    case "submit-report": {
      // ... existing submit logic, plus status flip ...
    }
    case "delete-draft": {
      const reportId = formData.get("reportId") as string;
      await deleteDraft(reportId);
      return data({ ok: true });
    }
    case "set-scout": {
      const scoutId = formData.get("scoutId") as string;
      cookie.scoutId = scoutId;
      return data({ ok: true }, {
        headers: { "Set-Cookie": await scoutIdCookie.serialize(cookie) },
      });
    }
  }
}
```

### useFetcher Auto-Save in Form Component

```typescript
// Source: [VERIFIED: Context7 /remix-run/react-router — useFetcher auto-save]
import { useFetcher } from "react-router";

function ScoutReportForm({ draft, cookieScoutId, ... }: Props) {
  const fetcher = useFetcher();
  const isAutoSaving = fetcher.state !== "idle";

  const autoSaveDraft = (step: number) => {
    const formData = new FormData();
    formData.append("intent", "save-draft");
    formData.append("currentStep", String(step));
    formData.append("scoutId", form.getValues("scoutId"));
    // ... append all current form values ...
    fetcher.submit(formData, { method: "post" });
  };

  const handleNext = async () => {
    // ... validate ...
    if (isValid) {
      autoSaveDraft(currentStep + 1);  // Save BEFORE step change
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };
}
```

### Overall Average Calculation

```typescript
// Source: [ASSUMED] — follows D-12 and Phase 1 D-03 specification
import type { Report } from "~/data/types";

export function calculateOverallAverage(report: Report): number | null {
  const allScores: (number | null)[] = [
    report.physical.pace, report.physical.strength,
    report.physical.stamina, report.physical.agility,
    report.technical.finishing, report.technical.passing,
    report.technical.dribbling, report.technical.firstTouch,
    report.tactical.positioning, report.tactical.awareness,
    report.tactical.decisionMaking, report.tactical.workRate,
    report.matchNotes.attitude, report.matchNotes.coachability,
    report.matchNotes.intensity, report.matchNotes.impact,
  ];

  const ratedScores = allScores.filter((s): s is number => s !== null);
  if (ratedScores.length === 0) return null;

  const sum = ratedScores.reduce((acc, val) => acc + val, 0);
  return sum / ratedScores.length;
}
```

### Draft-to-Form-Values Mapper

```typescript
// Source: [ASSUMED] — maps Report type back to RHF-compatible form values
import type { Report } from "~/data/types";
import type { ReportFormValues } from "~/data/form-schema";

export function draftToFormValues(draft: Report): Partial<ReportFormValues> {
  return {
    isNewPlayer: false,
    playerId: draft.playerId,
    scoutId: draft.scoutId,
    matchDate: draft.matchDate,
    opponent: draft.opponent,
    competition: draft.competition,
    matchResult: draft.matchResult || "",
    physical: { ...draft.physical },
    technical: { ...draft.technical },
    tactical: { ...draft.tactical },
    matchNotes: {
      attitude: draft.matchNotes.attitude,
      coachability: draft.matchNotes.coachability,
      intensity: draft.matchNotes.intensity,
      impact: draft.matchNotes.impact,
      notes: draft.matchNotes.notes || "",
    },
  };
}
```

### Reports Table Route (/scout/reports)

```typescript
// Source: [VERIFIED: Context7 /remix-run/react-router — loader pattern]
import type { Route } from "./+types/reports";
import { getScouts, getReportsByScout } from "~/data/data";
import { scoutIdCookie } from "~/cookies.server";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieValue = await scoutIdCookie.parse(cookieHeader);
  const scoutId = cookieValue?.scoutId || null;

  const scouts = await getScouts();
  let reports: Report[] = [];

  if (scoutId) {
    reports = await getReportsByScout(scoutId, "submitted");
  }

  return { scouts, reports, cookieScoutId: scoutId };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Remix `useSubmit()` for all mutations | `useFetcher()` for non-navigating mutations | React Router 7 (merged Remix) | Auto-save patterns now use fetcher; submit still for navigations |
| `document.cookie` parsing | `createCookie` + `request.headers` | Remix v2 / React Router 7 | SSR-safe cookie handling; no hydration mismatches |
| `z.discriminatedUnion` limited to literals | Supports union and pipe discriminators | Zod 4 | More flexible schema composition (not directly needed here) |
| Separate draft storage | Status field on same entity | Modern pattern | Single source of truth; simpler queries |

**Deprecated/outdated:**
- `document.cookie` string manipulation for cookies: Use `createCookie` from `react-router` — handles encoding, parsing, and SSR compatibility. [VERIFIED: Context7 — react-router sessions-and-cookies docs]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useFetcher().submit()` does not cause navigation or remount of the current component | Pattern 1, Pitfall 1 | If wrong, auto-save would reset form state; need to use a different approach (e.g., fetch API + manual revalidation) |
| A2 | RHF `defaultValues` from draft data works correctly when provided at mount time via loader | Pattern 4, Pitfall 2 | If wrong, draft resume won't pre-fill form; need to use `form.reset()` after mount |
| A3 | `createCookie` with `httpOnly: false` is safe for storing a scout UUID (non-sensitive preference data) | Pattern 2, Pitfall 6 | If wrong, need to implement CSRF protection or use a session-based approach instead |
| A4 | The `currentStep` field can be stored on the report record alongside the attribute data for draft resume (D-06) | Pattern 4 | If this violates the report schema's intended semantics, need separate draft metadata storage |
| A5 | `matchResult` field is stored on existing reports in `reports.json` but is missing from the sample data (some records lack it) — it's `.optional()` in the schema so this is fine | Data Model | Low risk — schema already handles this |
| A6 | The `calculateOverallAverage` function uses all 16 scored attributes across 4 categories, excluding `matchNotes.notes` (free-text) | Pattern 5 | If wrong, the average would include/exclude wrong attributes |

## Open Questions

1. **Should `currentStep` be part of `reportSchema` or a separate field?**
   - What we know: D-06 requires step-position memory. The draft needs to store which step the scout was on.
   - What's unclear: Whether `currentStep` belongs on the Zod `reportSchema` (which validates the data model) or is a UI-only concern stored alongside the draft.
   - Recommendation: Add `currentStep` as `z.number().int().min(0).max(4).optional()` to `reportSchema`. Drafts have it; submitted reports don't need it (it's irrelevant after submission). This keeps all draft data in one record.

2. **How to handle the "first visit" scenario when no cookie exists?**
   - What we know: D-13 says auto-select from cookie. But on first visit, there's no cookie.
   - What's unclear: Should the form show step 0 with an empty scout dropdown, or should it prompt the scout to select themselves first?
   - Recommendation: Show step 0 with an empty scout dropdown (current behavior). Once the scout selects themselves and auto-saves, the cookie is set for future visits.

3. **Should `set-scout` intent be a separate fetcher call or piggyback on `save-draft`?**
   - What we know: Scout selection changes need to persist the cookie. Auto-save also sets the cookie.
   - What's unclear: Whether changing the scout dropdown alone (without step transition) should immediately persist the cookie.
   - Recommendation: Persist the cookie on every `save-draft` call (step transitions). For standalone scout selection changes (before any step transition), use a `set-scout` intent via fetcher. This ensures the cookie is always current when the scout changes their identity.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + SSR | ✓ | 24.13.0 | — |
| npm | Package management | ✓ | 11.6.2 | — |
| react-router | Framework mode | ✓ | 7.15.0 | — |
| zod | Schema validation | ✓ | 4.4.3 | — |
| react-hook-form | Form management | ✓ | ^7.75.0 | — |
| vitest | Test framework | ✗ | — | Skip automated tests in this phase |

**Missing dependencies with no fallback:**
- None — all required dependencies are available.

**Missing dependencies with fallback:**
- vitest: No test framework installed. Validation architecture section documents this gap.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | none — see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCOUT-03 | Auto-save draft on step transition | manual | N/A | ❌ Wave 0 |
| SCOUT-03 | Draft resume with pre-filled values and correct step | manual | N/A | ❌ Wave 0 |
| SCOUT-03 | One draft per scout with replacement confirmation | manual | N/A | ❌ Wave 0 |
| SCOUT-03 | Draft → submitted status flip in-place | manual | N/A | ❌ Wave 0 |
| SCOUT-04 | Reports table shows submitted reports filtered by scout | manual | N/A | ❌ Wave 0 |
| SCOUT-04 | Overall average excludes null from denominator | unit | N/A | ❌ Wave 0 |
| SCOUT-04 | Cookie-persisted scout selection | manual | N/A | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run typecheck` (type safety verification — per AGENTS.md)
- **Per wave merge:** Manual testing via `npm run dev`
- **Phase gate:** Full manual walkthrough of draft save/resume/submit + reports table view

### Wave 0 Gaps

- [ ] `app/lib/scoring/average.test.ts` — unit tests for `calculateOverallAverage` (null exclusion, all-null, partial-null, full-ratings)
- [ ] `vitest.config.ts` — test framework configuration (or add to `vite.config.ts`)
- [ ] Framework install: `npm install -D vitest` — needed for automated testing

**Note:** The `calculateOverallAverage` function is a pure function with clear test cases (null exclusion logic). This is the highest-value test to automate. The rest of the phase features (auto-save, draft resume, cookie persistence, table view) require manual/integration testing against the running app.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth system — simple role selection per AGENTS.md |
| V3 Session Management | no | Cookie stores preference, not auth session |
| V4 Access Control | no | No access control in v1 — any scout can see any reports |
| V5 Input Validation | yes | Zod schemas validate all form input server-side |
| V6 Cryptography | no | No encryption needed for scout UUID cookie |
| V8 Data Protection | partial | Cookie `sameSite: "lax"` prevents CSRF for cookie reads; no sensitive data stored |

### Known Threat Patterns for React Router 7 + Cookie

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cookie tampering (scout ID changed by user) | Tampering | Cookie only stores a UUID preference; server validates scoutId against scouts.json before using it |
| XSS reading non-httpOnly cookie | Information Disclosure | Cookie value is a non-sensitive scout UUID; no secrets stored in cookie |
| CSRF via cookie auto-attachment | Spoofing | `sameSite: "lax"` prevents cross-site submission; form actions validate intent |

## Sources

### Primary (HIGH confidence)

- Context7 `/remix-run/react-router` — `createCookie` API, `useFetcher` auto-save pattern, loader/action cookie handling, form-vs-fetcher explanation
- React Router 7 official docs — `sessions-and-cookies.md`, `state-management.md` — cookie lifecycle in SSR context
- Project codebase — `app/data/types.ts`, `app/data/data.ts`, `app/data/form-schema.ts`, `app/routes/scout/report.tsx`, `app/components/scout-report-form.tsx` — verified existing patterns, schema structures, and action signatures

### Secondary (MEDIUM confidence)

- Context7 `/websites/zod_dev_v4` — `z.discriminatedUnion` upgrade in Zod 4, `z.enum` patterns — confirms backward compatibility with existing schema
- `ARCHITECTURE.md` — Data flow patterns, server-first approach, anti-patterns (no localStorage, no client-side state cache)
- `PITFALLS.md` — Pitfall 3 (data entry wall), Pitfall 7 (scout identity), Pitfall 8 (null ≠ 3) — directly relevant to this phase

### Tertiary (LOW confidence)

- Draft resume UX pattern (RHF defaultValues from loader data) — common React Router + RHF pattern but not specifically documented in Context7 for this exact use case
- `calculateOverallAverage` attribute list (16 attributes across 4 categories) — derived from schema inspection, not from an explicit spec listing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and verified in package.json
- Architecture: HIGH — patterns verified via Context7 (useFetcher, createCookie) and existing codebase analysis
- Pitfalls: HIGH — useSubmit vs useFetcher is a documented React Router distinction; cookie SSR handling is well-documented
- Overall average calculation: MEDIUM — logic is straightforward but the exact attribute list was derived from schema inspection rather than an explicit spec

**Research date:** 2026-05-13
**Valid until:** 2026-06-12 (30 days — stable stack, no fast-moving dependencies)
