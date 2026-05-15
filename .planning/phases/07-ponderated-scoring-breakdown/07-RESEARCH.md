# Phase 7: Ponderated Scoring & Breakdown - Research

**Researched:** 2026-05-15
**Domain:** Weighted scoring engine, URL state persistence, Recharts multi-dataset radar, Tailwind CSS toggle/accordion UI
**Confidence:** HIGH

## Summary

This phase adds the core differentiator of FootScout: the ability for division members to shift scoring weights toward specific attributes and see transparent breakdowns of how weighted scores differ from simple averages. The implementation touches four areas: (1) extending the scoring engine with a weighted average function, (2) URL search param-based weight persistence across division routes, (3) updating the radar chart to optionally show ponderated data, and (4) building toggle button and accordion UI components.

The existing codebase is well-structured for this: `calculatePlayerAverages()` in `app/lib/scoring/player-average.ts` already computes per-attribute simple averages and a global average, the data layer uses Turso with a clean async interface, and React Router 7's `useSearchParams` + loader pattern is already established in `division/players.tsx`.

**Primary recommendation:** Extend `player-average.ts` with a `calculatePonderatedAverages(reports, boostedAttrs)` function, use URL search params (`w=pace,finishing`) on division routes for weight persistence, add a second `<Radar>` layer to the existing RadarChart when weights are active, and build a lightweight `AttributeToggle` component using React `useState` + Tailwind CSS `peer-checked` patterns — no external UI library needed.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Toggle buttons for each of the 12 attributes
- Organized in a 3x4 grid matching categories (physical, technical, tactical)
- When toggled, all players recalculate with weighted scores
- Player list reorders by highest weighted average when weights are active
- Player name/position remains prominent alongside the score
- Fixed 3x multiplier for boosted attributes
- Untoggled attributes stay at 1x weight
- Formula: `weighted_avg = sum(attr_value * weight) / sum(weights)`
- Multiple attributes can be boosted simultaneously
- Scoring naturally favors well-rounded players: a player with 5 in one attribute but 1s elsewhere loses to a player with 4 in that attribute and 3s elsewhere
- The global weighted average (all 12 attributes in denominator) handles this — no additional "consistency" penalty needed
- Compact accordion with chevron icon
- Expands to show per-attribute delta table: simple avg vs ponderated avg per attribute, and how much each contributed to the final score difference
- Collapsed state shows only the two headline numbers (simple vs ponderated)
- Weights persist while browsing players (player list → profile → back to list)
- Weights reset when navigating to unrelated pages (home, scout entry)
- Implementation: URL search params on division routes, cleared on non-division navigation
- When weights are active, list auto-re-sorts by weighted average (highest first)
- When weights are cleared, returns to original/default sort

### OpenCode's Discretion
(None specified — all decisions are locked)

### Deferred Ideas (OUT OF SCOPE)
- Position-adaptive weight presets (POS-01 in v2) — scouts define weights custom per search for v1
- Scout consistency indicators (AGGR-01 in v2)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCORE-03 | Division can select a preferential skill/attribute to activate ponderated scoring | URL search params + toggle UI + `calculatePonderatedAverages()` |
| SCORE-04 | Ponderated average re-weights the selected attribute higher, showing how the overall score shifts | Weighted formula (3x/1x), radar chart overlay, list re-sort |
| SCORE-05 | Score breakdown shows simple average, ponderated average, and per-attribute delta explaining why the ponderated score differs | Accordion component + delta table computation |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Weight toggle UI | Browser / Client | — | Interactive state, no server mutation needed |
| Weight persistence (URL params) | Browser / Client | Frontend Server (SSR) | `useSearchParams` for client; loader reads `request.url` for SSR |
| Ponderated average computation | API / Backend (loader) | Browser / Client | Computed in loader for SSR; client-side for instant toggle feedback |
| Player list re-sort by weighted avg | API / Backend (loader) | Browser / Client | Server computes weighted averages for all players, returns sorted |
| Radar chart with ponderated overlay | Browser / Client | — | Recharts renders client-side |
| Score breakdown accordion | Browser / Client | — | Pure client-side expand/collapse + delta display |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router | 7.15.0 (installed) | URL search params, loaders, client-side navigation | Already in project; `useSearchParams` + `loader` pattern established |
| recharts | 3.8.1 (installed) | Radar chart with multiple `<Radar>` overlays | Already in project; supports multiple series via separate `<Radar>` components |
| tailwindcss | 4.2.2 (installed) | Toggle button + accordion styling | Already in project; `peer-checked`, `group`, `aria-checked` utilities available |
| lucide-react | 1.16.0 (installed) | ChevronDown/ChevronUp icons for accordion | Already in project; used elsewhere |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 (installed) | Conditional className composition | Already in project via `cn()` utility |

### No New Dependencies Needed
All required capabilities are covered by existing installed packages. No `npm install` required.

**Version verification:**
```
npm view react-router version → 7.15.1 (project: 7.15.0 — compatible)
npm view recharts version → 3.8.1 (project: 3.8.1 — exact match)
npm view tailwindcss version → 4.3.0 (project: 4.2.2 — compatible)
npm view lucide-react version → 1.16.0 (project: 1.16.0 — exact match)
```

## Architecture Patterns

### System Architecture Diagram

```
[Division Member]
       │
       ▼
┌─────────────────────────────────┐
│  Division Players List Route     │
│  loader(request)                 │
│  ├─ Parse ?w=pace,finishing      │
│  ├─ Fetch all players + reports  │
│  ├─ calculatePonderatedAverages  │
│  │   (per player, with weights)  │
│  ├─ Sort by weighted avg (desc)  │
│  └─ Return { players, averages } │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  PlayerList Component            │
│  ├─ AttributeToggleGrid (client) │
│  │   └─ 3×4 toggle buttons       │
│  │   └─ Updates URL ?w=...       │
│  ├─ Player rows with scores      │
│  └─ Re-sorts when weights change │
└─────────────────────────────────┘
       │ (click player)
       ▼
┌─────────────────────────────────┐
│  Player Profile Route            │
│  loader({ params, request })     │
│  ├─ Read ?w= from request.url    │
│  ├─ Fetch player + reports       │
│  ├─ calculatePonderatedAverages  │
│  └─ Return { player, averages }  │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  PlayerScores Component          │
│  ├─ Simple avg headline          │
│  ├─ Ponderated avg headline      │
│  ├─ RadarChart (simple + ponderated overlay)
│  └─ ScoreBreakdownAccordion      │
│      └─ Per-attribute delta table│
└─────────────────────────────────┘
```

### Recommended Project Structure
```
app/
├── lib/scoring/
│   ├── player-average.ts      # Existing — extend with calculatePonderatedAverages()
│   └── average.ts             # Existing — unchanged
├── components/
│   ├── player-scores.tsx      # Existing — extend with ponderated radar + breakdown
│   ├── attribute-grid.tsx     # Existing — ATTRIBUTE_LABELS reused
│   ├── attribute-toggle.tsx   # NEW — 3×4 toggle grid for weight selection
│   └── score-breakdown.tsx    # NEW — accordion with per-attribute delta table
└── routes/division/
    ├── players.tsx            # Existing — extend loader + component with weight-aware sorting
    └── players.$id.tsx        # Existing — extend loader + component with ponderated scoring
```

### Pattern 1: URL Search Params for Weight State
**What:** Store boosted attributes as a comma-separated list in the URL (`?w=pace,finishing`). Read in loaders via `new URL(request.url).searchParams.get("w")`, read in components via `useSearchParams()`.
**When to use:** When state needs to persist across route navigations within a section but reset when leaving.
**Example:**
```typescript
// In a division route loader — CITED: reactrouter.com (Data Loading v7)
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const weightParam = url.searchParams.get("w");
  const boostedAttrs = weightParam
    ? weightParam.split(",").filter((k) => ATTRIBUTE_KEYS.includes(k as typeof ATTRIBUTE_KEYS[number]))
    : [];

  // Pass to scoring function
  const averages = calculatePonderatedAverages(reports, boostedAttrs);
  return { averages, boostedAttrs };
}

// In a component — CITED: api.reactrouter.com (useSearchParams)
const [searchParams, setSearchParams] = useSearchParams();
const toggleAttribute = (key: string) => {
  const next = new URLSearchParams(searchParams);
  const current = next.get("w")?.split(",") || [];
  if (current.includes(key)) {
    const filtered = current.filter((k) => k !== key);
    filtered.length ? next.set("w", filtered.join(",")) : next.delete("w");
  } else {
    next.set("w", [...current, key].join(","));
  }
  setSearchParams(next);
};
```

### Pattern 2: Recharts Multi-Series Radar
**What:** Add a second `<Radar>` element inside the existing `<RadarChart>` with a different `dataKey` and distinct color/stroke.
**When to use:** When comparing two data profiles on the same axes (simple vs ponderated).
**Example:**
```tsx
// Source: recharts.org/examples/radar-chart (Comparison of three series)
<RadarChart data={chartData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="attribute" />
  <PolarRadiusAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
  {/* Simple average — existing, keep as-is */}
  <Radar name="Média Simples" dataKey="simple" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} strokeWidth={2} />
  {/* Ponderated average — new, shown when weights active */}
  {hasWeights && (
    <Radar name="Ponderada" dataKey="ponderated" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} strokeDasharray="5 3" />
  )}
</RadarChart>
```
**Key insight:** Each `<Radar>` maps to a different `dataKey` in the same `data` array objects. Chart data shape becomes `{ attribute, simple, ponderated }`.

### Pattern 3: Tailwind CSS Toggle Button with `peer-checked`
**What:** Hidden checkbox + styled label that changes appearance when checked, using `peer` and `peer-checked:` utilities.
**When to use:** For individual attribute boost toggles in the 3×4 grid.
**Example:**
```tsx
// Source: DEV Community (Creating a custom toggle in TailwindCSS v4) + Dockyard (Accessible Toggle Switch)
function AttributeToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <span className="block text-center text-xs font-medium px-3 py-2 rounded-md border
        bg-white dark:bg-fm-card-alt text-gray-600 dark:text-fm-label border-gray-200 dark:border-fm-border
        peer-checked:bg-fm-accent/10 peer-checked:text-fm-accent peer-checked:border-fm-accent
        transition-colors duration-150">
        {label}
      </span>
    </label>
  );
}
```

### Pattern 4: React Accordion with `useState` + Chevron Rotation
**What:** Simple expandable section using React `useState` for open/closed state, with a rotating chevron icon.
**When to use:** For the score breakdown panel on the player profile.
**Example:**
```tsx
// Source: wpdean.com (Tailwind Accordion with React) — vanilla React pattern, no Radix needed for single collapsible
function ScoreBreakdown({ simpleAvg, ponderatedAvg, deltas }: ScoreBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-fm-border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        aria-expanded={isOpen}
      >
        <span>Média Simples: {simpleAvg} → Ponderada: {ponderatedAvg}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-3">
          {/* Delta table */}
        </div>
      )}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Storing weights in React context or global state:** The locked decision specifies URL search params. Context would not survive navigation or browser refresh.
- **Adding a third-party accordion library (Radix, Headless UI):** Overkill for a single collapsible section. The project has no existing accordion dependency; a simple `useState` + conditional render is sufficient and matches the project's lightweight approach.
- **Computing weighted averages client-side only:** The player list needs server-side sorting by weighted average. The loader must compute and return sorted data. Client-side computation alone would cause a flash of unsorted content.
- **Mutating `searchParams` directly:** `URLSearchParams` is mutable but React Router won't detect changes. Always clone: `new URLSearchParams(searchParams)` before modifying. [CITED: scientyficworld.org]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Weighted average formula | Custom math with edge cases | `sum(value * weight) / sum(weights)` with null exclusion | Null values ("not observed") must be excluded from both numerator and denominator; existing `collectAttributeValues` already handles this |
| URL search param management | Custom URL parsing/string building | `new URLSearchParams(searchParams)` + `setSearchParams()` | React Router handles encoding, navigation, and history; manual string building breaks on special characters |
| Radar chart multi-series | Two separate RadarChart components overlaid with CSS | Multiple `<Radar>` elements in one `<RadarChart>` | Recharts natively supports multiple series; CSS overlay breaks tooltips and axis alignment |
| Toggle button state | Custom div with onClick + className toggling | Hidden `<input type="checkbox">` + `peer-checked:` | Native checkbox gives keyboard accessibility, screen reader support, and form semantics for free |

**Key insight:** The scoring math is the only genuinely novel logic in this phase. Everything else is standard React Router + Recharts + Tailwind patterns that the project already uses.

## Common Pitfalls

### Pitfall 1: Null Attribute Handling in Weighted Average
**What goes wrong:** Including null ("not observed") attributes in the weighted denominator, artificially deflating the score.
**Why it happens:** The simple average already excludes nulls, but the weighted formula adds complexity — it's easy to forget that nulls should still be excluded when computing `sum(weights)` in the denominator.
**How to avoid:** Follow the same pattern as `collectAttributeValues`: only include attributes where the value is non-null. The weighted denominator is `sum(weight for each non-null attribute)`, not `sum(all weights)`.
**Warning signs:** A player with many "not observed" ratings gets an unexpectedly low ponderated score.

### Pitfall 2: Stale Closure with `setSearchParams`
**What goes wrong:** Multiple toggle buttons calling `setSearchParams` in rapid succession, with later calls overwriting earlier ones because each call captures a stale `searchParams` reference.
**Why it happens:** `setSearchParams` callback receives the current params, but if called from separate event handlers without batching, each handler reads the same snapshot.
**How to avoid:** Use the functional form: `setSearchParams((prev) => { const next = new URLSearchParams(prev); ...; return next; })`. Or consolidate all weight changes into a single `setSearchParams` call. [CITED: api.reactrouter.com — useSearchParams]
**Warning signs:** Toggling two attributes quickly results in only the second toggle appearing in the URL.

### Pitfall 3: Loader Not Re-running When Search Params Change
**What goes wrong:** Changing weights via `setSearchParams` doesn't trigger the loader to re-run, so the player list doesn't re-sort.
**Why it happens:** React Router v7 automatically revalidates loaders when URL search params change [CITED: reactrouter.com Route Object — "any change to URL search params"]. However, if the loader doesn't actually read the search params from `request.url`, the returned data won't change.
**How to avoid:** Ensure the loader explicitly parses `new URL(request.url).searchParams.get("w")` and uses it in computation. The revalidation will happen automatically.
**Warning signs:** URL updates but the displayed scores/sort order don't change.

### Pitfall 4: Radar Chart Domain Mismatch
**What goes wrong:** The ponderated radar polygon extends beyond the simple radar's visual bounds because the weighted average can exceed the simple average range.
**Why it happens:** With 3x weighting, the ponderated average is still on the 1-5 scale (it's a weighted mean of 1-5 values), so it shouldn't exceed the domain. But if null handling is wrong, it could produce unexpected values.
**How to avoid:** Keep `PolarRadiusAxis` domain at `[1, 5]`. Verify the ponderated average computation never produces values outside this range. Add a clamp as a safety measure: `Math.max(1, Math.min(5, weightedAvg))`.
**Warning signs:** Radar chart renders but the ponderated polygon is clipped or doesn't appear.

### Pitfall 5: Client-Side Sort vs Server-Side Sort Mismatch
**What goes wrong:** The `PlayerList` component has its own `sortedPlayers` sort logic (line 59 of `player-list.tsx`), but the loader also returns sorted data. The client-side sort overrides the server-side sort.
**Why it happens:** The current `players.tsx` passes `sortBy` and `sortDirection` to `PlayerList`, which sorts client-side. When weights are active, the sort column should be "weighted score" — a computed value not present in the `Player` type.
**How to avoid:** When weights are active, set `sortBy` to a special value (e.g., `"weightedScore"`) and add a case in the `PlayerList` sort switch that reads the pre-computed weighted average from the loader data. Alternatively, return pre-sorted players from the loader and skip client-side sorting when weights are active.
**Warning signs:** Player list shows players in wrong order despite correct weighted averages being computed.

## Code Examples

### Extending `calculatePlayerAverages` with Weighted Version
```typescript
// Source: existing app/lib/scoring/player-average.ts pattern
import type { Report } from "../../data/types";

const ATTRIBUTE_KEYS = [
  "pace", "strength", "stamina", "agility",
  "finishing", "passing", "dribbling", "firstTouch",
  "positioning", "awareness", "decisionMaking", "workRate",
] as const;

export interface PonderatedAverages extends PlayerAverages {
  ponderatedGlobalAverage: number | null;
  boostedAttributes: string[];
}

export function calculatePonderatedAverages(
  reports: Report[],
  boostedAttrs: string[]
): PonderatedAverages {
  const base = calculatePlayerAverages(reports);
  const weights: Record<string, number> = {};
  for (const key of ATTRIBUTE_KEYS) {
    weights[key] = boostedAttrs.includes(key) ? 3 : 1;
  }

  let ponderatedSum = 0;
  let ponderatedCount = 0;
  const ponderatedAttributes: Record<string, number | null> = {};

  for (const key of ATTRIBUTE_KEYS) {
    const attrValue = base.attributes[key];
    if (attrValue === null) {
      ponderatedAttributes[key] = null;
      continue;
    }
    const w = weights[key];
    ponderatedSum += attrValue * w;
    ponderatedCount += w;
    ponderatedAttributes[key] = attrValue; // per-attribute value doesn't change
  }

  return {
    ...base,
    ponderatedGlobalAverage: ponderatedCount > 0 ? ponderatedSum / ponderatedCount : null,
    boostedAttributes: boostedAttrs,
  };
}
```

### Score Breakdown Delta Computation
```typescript
// Computes per-attribute contribution to the score difference
export function computeScoreBreakdown(
  simpleAvg: number | null,
  ponderatedAvg: number | null,
  attributes: Record<string, number | null>,
  boostedAttrs: string[]
) {
  if (simpleAvg === null || ponderatedAvg === null) return null;

  const weights: Record<string, number> = {};
  for (const key of ATTRIBUTE_KEYS) {
    weights[key] = boostedAttrs.includes(key) ? 3 : 1;
  }

  // Per-attribute: how much this attribute's weighted contribution differs from its simple contribution
  const deltas = ATTRIBUTE_KEYS.map((key) => {
    const value = attributes[key];
    if (value === null) return { key, value: null, simpleContribution: null, ponderatedContribution: null, delta: null };

    // Simple contribution: value / totalObservedAttrs
    // Ponderated contribution: (value * weight) / totalWeightedSum
    // Delta = ponderatedContribution - simpleContribution
    // ... compute based on actual denominator values
  });

  return { simpleAvg, ponderatedAvg, difference: ponderatedAvg - simpleAvg, deltas };
}
```

### URL Weight Param Parser (for loaders)
```typescript
// Reusable utility — parse ?w= from request URL
export function parseWeightParams(request: Request): string[] {
  const url = new URL(request.url);
  const weightParam = url.searchParams.get("w");
  if (!weightParam) return [];
  return weightParam
    .split(",")
    .map((k) => k.trim())
    .filter((k) => ATTRIBUTE_KEYS.includes(k as typeof ATTRIBUTE_KEYS[number]));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side only state management for filters | URL search params as source of truth, read by loaders | React Router v7 framework mode | Server-rendered pages reflect URL state on initial load; shareable URLs |
| Single radar chart per player | Multi-series radar with simple + ponderated overlay | Recharts 3.x | Direct visual comparison without toggling views |
| Heavy accordion libraries (Radix, Headless UI) | Lightweight `useState` + conditional render for single collapsible | Project convention | Zero new dependencies, smaller bundle |
| Position-based weight presets | Custom per-search weight selection | FootScout design decision | Division members define what they're looking for dynamically |

**Deprecated/outdated:**
- JSON file data layer: Replaced by Turso DB in this project (already migrated). Research confirms the data layer uses `@libsql/client` with SQL queries.
- `react-router-dom`: Replaced by unified `react-router` package in v7. This project already uses `react-router` 7.15.0.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Ponderated average stays within 1-5 range (weighted mean of 1-5 values) | Pitfall 4 | If formula produces out-of-range values, radar chart breaks |
| A2 | React Router v7 automatically revalidates loaders on search param changes | Pitfall 3 | If not, manual revalidation trigger needed |
| A3 | Turso DB queries are fast enough to compute weighted averages for all players in a single loader call | Architecture | If slow, may need pre-computed or cached averages |
| A4 | The `ATTRIBUTE_KEYS` constant in `player-average.ts` matches the 12 attributes used everywhere | Standard Stack | If mismatched, some attributes won't be toggleable |

## Open Questions (RESOLVED)

1. **Should the player list show weighted scores inline when weights are active?**
   - What we know: Locked decision says "Player list reorders by highest weighted average when weights are active" and "Player name/position remains prominent alongside the score."
   - What's unclear: Whether the score column should show the ponderated average (replacing simple avg) or show both.
   - Recommendation: Show ponderated average when weights are active, with a subtle indicator (e.g., "3.82★") to signal it's weighted. Simple average remains visible in the breakdown.

2. **Should the radar chart on the profile show both simple and ponderated simultaneously, or toggle between them?**
   - What we know: Locked decision says the collapsed breakdown shows "two headline numbers (simple vs ponderated)."
   - What's unclear: Whether the radar chart should overlay both polygons or show only the ponderated when weights are active.
   - Recommendation: Overlay both — simple as solid fill, ponderated as dashed outline. This gives immediate visual comparison of how weighting changes the player's shape.

3. **How should the delta table handle attributes with null ("not observed") values?**
   - What we know: Null values are excluded from both simple and ponderated denominators.
   - What's unclear: Whether the delta table should show these attributes at all, or hide them.
   - Recommendation: Show them with a "—" or "Não observado" label and zero delta, so the user sees the complete picture.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + dev server | ✓ | Checked via npm | — |
| Turso DB (@libsql/client) | Data layer | ✓ | 0.17.3 | — |
| npm | Package management | ✓ | Available | — |
| TypeScript | Type checking | ✓ | 5.9.3 | — |

No new external dependencies required. All capabilities use existing installed packages.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | None — no test files, no test config, no test scripts in package.json |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCORE-03 | Toggle attribute boosts weights | unit | N/A — no test framework | ❌ Wave 0 |
| SCORE-04 | Ponderated average shifts with weights | unit | N/A — no test framework | ❌ Wave 0 |
| SCORE-05 | Breakdown shows simple vs ponderated delta | unit | N/A — no test framework | ❌ Wave 0 |

### Sampling Rate
- No test infrastructure exists. Manual verification via `npm run dev` + browser testing is the current validation method.

### Wave 0 Gaps
- [ ] `app/lib/scoring/__tests__/player-average.test.ts` — covers weighted average computation, null handling, 3x/1x weights
- [ ] Test framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` — none detected
- [ ] `vitest.config.ts` — configuration file

*(Note: Project has shipped 6 phases without test infrastructure. Adding tests is out of scope for this phase unless explicitly requested.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Two roles (scout/division) but no auth system in v1 |
| V3 Session Management | No | Scout identity via cookie, but weights are URL params (no session impact) |
| V4 Access Control | No | No role-based access control implemented yet |
| V5 Input Validation | Yes | Weight params from URL must be validated against known attribute keys |
| V6 Cryptography | No | No cryptographic operations |

### Known Threat Patterns for URL Search Params

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed weight params (e.g., `?w=../../../etc/passwd`) | Tampering | Validate against `ATTRIBUTE_KEYS` allowlist in loader — ignore unknown keys |
| Extremely long weight param string | Availability | URL length limits are browser-enforced; split filter limits to 12 known keys |
| XSS via reflected URL params | Injection | React auto-escapes rendered content; never use `dangerouslySetInnerHTML` with URL params |

## Sources

### Primary (HIGH confidence)
- Recharts RadarChart API — https://recharts.org/en-US/api/RadarChart — Multiple series via multiple `<Radar>` components
- Recharts RadarChart examples — https://www.mintlify.com/recharts/recharts/examples/radar-chart — "Comparison of three series" pattern
- React Router useSearchParams API — https://api.reactrouter.com/v7/functions/react-router.useSearchParams.html — Functional update form, stable reference
- React Router Data Loading — https://reactrouter.com/7.0.1/start/framework/data-loading — Loader reads `request.url` search params
- React Router Route Object — https://reactrouter.com/start/data/route-object — "any change to URL search params" triggers revalidation
- Tailwind CSS peer-checked utility — https://dockyard.com/blog/2024/05/28/creating-an-accessible-toggle-switch-in-tailwindcss — Accessible toggle pattern
- Tailwind CSS group helper — https://dev.to/chrisrhymes/creating-a-custom-toggle-in-tailwindcss-1h5m — Toggle with transition

### Secondary (MEDIUM confidence)
- React Router state management — https://reactrouter.com/7.13.1/explanation/state-management — URL search params as state
- Peterbe useSearchParams as global state — https://www.peterbe.com/plog/usesearchparams-react-global-state-manager — appendSearchParams pattern
- shadcn.io multiple radar chart — https://shadcn.io/charts/radar-chart/radar-chart-11 — Multi-series radar overlay pattern
- wpdean Tailwind accordion with React — https://wpdean.com/tailwind-accordion/ — useState + conditional render pattern

### Tertiary (LOW confidence)
- None — all critical claims verified against official sources or existing codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm registry and existing codebase
- Architecture: HIGH — patterns verified against official React Router, Recharts, and Tailwind docs
- Pitfalls: HIGH — derived from existing codebase analysis + official documentation behavior
- URL param handling: HIGH — React Router docs explicitly cover this pattern
- Radar multi-series: HIGH — Recharts examples and API confirm

**Research date:** 2026-05-15
**Valid until:** 2026-06-15 (30 days — stable stack, no fast-moving dependencies)
