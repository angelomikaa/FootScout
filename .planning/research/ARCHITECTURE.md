# Architecture Patterns

**Domain:** Soccer scouting dashboard (U15 youth prospect tracking)
**Researched:** 2026-05-11

## Recommended Architecture

FootScout is a **React Router 7 framework-mode full-stack app** with SSR. The architecture follows a server-first, route-centric pattern where loaders fetch data, actions mutate data, and the server renders HTML — with automatic revalidation keeping the UI in sync without client-side state management libraries.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Route UI    │  │  RR7 Hooks   │  │  Scoring Engine       │  │
│  │  Components  │  │  useLoader   │  │  (pure client-side    │  │
│  │  + Recharts  │  │  useFetcher  │  │   weighted calc)      │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                      │              │
│         │   loaderData    │  Form / fetcher      │  reads from  │
│         │◄────────────────┤  .submit()           │  loaderData  │
│         │                 │──►                   │              │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
══════════╪═════════════════╪══════════════════════╪════════════════
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     React Router 7 Server                        │
│                     (@react-router/node + serve)                 │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Loaders     │  │  Actions     │  │  Data Layer           │  │
│  │  (read)      │  │  (write)     │  │  (JSON file storage   │  │
│  │              │  │              │  │   v1 → DB later)      │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┴──────────────────────┘              │
│                           │                                      │
│                     Automatic revalidation                       │
│                     after every action                           │
└─────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Route Modules** | Page-level UI + data loading + mutations | Loaders, Actions (co-located) |
| **Loaders** | Fetch data for route rendering (server) | Data Layer |
| **Actions** | Handle form submissions / mutations (server) | Data Layer |
| **Data Layer** | CRUD operations on JSON files (v1) | File system (`app/data/`) |
| **Scoring Engine** | Weighted average calculations (client) | Route Components (via loaderData) |
| **UI Components** | Reusable presentational pieces (forms, charts, cards) | Route Components (props) |
| **Recharts Visualizations** | Radar charts, score bars, comparison overlays | Route Components (data props) |

### Data Flow

**Read path (scout browses players):**
```
URL request → Router matches route → Loader fetches from Data Layer
→ Server renders HTML with loaderData → Hydrates in browser
→ Component reads loaderData → Passes to Scoring Engine → Renders Recharts
```

**Write path (scout submits report):**
```
Form submit → Route Action receives FormData → Validates + writes to Data Layer
→ Auto-revalidation: Loaders refetch → UI updates with fresh data
```

**Weighted scoring path (division searches with weights):**
```
User adjusts weight sliders → URL search params update (?w_finishing=3&w_passing=1)
→ Loader reads search params → Fetches player data → Returns raw + simple averages
→ Client Scoring Engine reads loaderData + weights from URL params
→ Calculates ponderated averages → Recharts renders updated radar/profile
```

Key design decision: **Scoring Engine is client-side only.** It is a pure function of `(playerScores, weights) → ponderatedResult`. It never writes to the server. It recalculates on every weight change via URL search params. This keeps the engine fast (no server round-trip for slider drags) and the weights bookmarkable/shareable via URL.

## Route Architecture

React Router 7 framework mode uses `app/routes.ts` for explicit route configuration. The route structure mirrors the two-role navigation pattern:

```ts
// app/routes.ts
import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // Scout role — data entry
  ...prefix("scout", [
    index("routes/scout/index.tsx"),               // Scout dashboard
    route("report", "routes/scout/report.tsx"),     // New report form
    route("reports", "routes/scout/reports.tsx"),   // My submitted reports
  ]),

  // Division role — appraisal & decisions
  ...prefix("division", [
    index("routes/division/index.tsx"),                           // Division dashboard
    route("players", "routes/division/players.tsx"),             // Browse all players
    route("players/:playerId", "routes/division/player-detail.tsx"), // Drill-down profile
    route("compare", "routes/division/compare.tsx"),             // Side-by-side comparison
    route("watchlist", "routes/division/watchlist.tsx"),         // Tracked players
  ]),

  // Shared — player profile (both roles can view)
  route("players/:playerId", "routes/player-profile.tsx"),
] satisfies RouteConfig;
```

### Route Module Pattern

Each route module follows the React Router 7 convention — co-located loader, action, component, and error boundary:

```ts
// app/routes/division/players.tsx
import type { Route } from "./+types/players";
import { Form, useSearchParams } from "react-router";
import { getPlayers } from "~/data/players";
import { PlayerList } from "~/components/player-list";

// Server-side data fetching
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const weights = parseWeightsFromSearch(url.searchParams);
  const players = await getPlayers();
  return { players, weights };
}

// Server-side mutation (e.g., adding to watchlist)
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const playerId = formData.get("playerId") as string;
  await addToWatchlist(playerId);
  return { ok: true };
}

// UI component
export default function Players({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const weights = parseWeightsFromSearch(searchParams);
  const ponderated = calculatePonderated(loaderData.players, weights);

  return (
    <div>
      <WeightSliders currentWeights={weights} />
      <PlayerList players={ponderated} />
    </div>
  );
}
```

## Scoring Engine Architecture

The scoring engine is the core differentiator. It must be architected as a **pure, testable, client-side module** — never tangled with server logic or UI rendering.

### Module Structure

```
app/
  lib/
    scoring/
      types.ts              # ScoreCategory, PlayerScores, Weights, PonderatedResult
      calculate.ts          # Core calculation functions
      aggregate.ts          # Multi-scout report averaging
      breakdown.ts          # Delta calculation (ponderated vs simple)
      scoring.test.ts       # Unit tests
```

### Core Types

```ts
// app/lib/scoring/types.ts

/** 1-5 integer scale for any individual attribute */
export type Score = 1 | 2 | 3 | 4 | 5;

/** The 4 scoring categories with their attributes */
export interface PlayerScores {
  physical: {
    pace: Score;
    strength: Score;
    stamina: Score;
    agility: Score;
  };
  technical: {
    finishing: Score;
    passing: Score;
    dribbling: Score;
    firstTouch: Score;
  };
  tactical: {
    positioning: Score;
    awareness: Score;
    decisionMaking: Score;
    workRate: Score;
  };
  matchNotes: {
    attitude: Score;
    coachability: Score;
    intensity: Score;
    impact: Score;
  };
}

/** Dynamic weights per attribute (0 = excluded, 5 = max importance) */
export type Weights = Partial<Record<keyof FlatScores, number>>;

/** Result of the scoring engine */
export interface PonderatedResult {
  simpleAverage: number;           // Unweighted mean across all attributes
  ponderatedAverage: number;       // Weight-adjusted mean
  categoryAverages: {              // Per-category averages
    physical: number;
    technical: number;
    tactical: number;
    matchNotes: number;
  };
  ponderatedCategories: {          // Per-category weighted averages
    physical: number;
    technical: number;
    tactical: number;
    matchNotes: number;
  };
  deltas: Record<string, number>;  // ponderated - simple per attribute
}
```

### Calculation Logic

```ts
// app/lib/scoring/calculate.ts

/**
 * Ponderated average: each attribute's score is multiplied by its weight,
 * summed, then divided by total weight. Attributes with no weight are excluded.
 * When no weights are provided, falls back to simple average.
 */
export function calculatePonderated(
  scores: FlatScores,
  weights: Weights
): PonderatedResult {
  const entries = Object.entries(scores) as [string, number][];

  // Simple average — always calculated
  const simpleAverage = entries.reduce((sum, [, v]) => sum + v, 0) / entries.length;

  // Ponderated average — only include weighted attributes
  const weightedEntries = entries.filter(([key]) => weights[key] && weights[key]! > 0);

  if (weightedEntries.length === 0) {
    // No weights → ponderated = simple
    return buildResult(simpleAverage, simpleAverage, scores, scores, {});
  }

  const totalWeight = weightedEntries.reduce(
    (sum, [key]) => sum + (weights[key] ?? 0), 0
  );
  const weightedSum = weightedEntries.reduce(
    (sum, [key, val]) => sum + val * (weights[key] ?? 0), 0
  );
  const ponderatedAverage = weightedSum / totalWeight;

  // Delta per attribute: shows why score shifted
  const deltas: Record<string, number> = {};
  for (const [key, val] of entries) {
    const weight = weights[key] ?? 0;
    if (weight > 0) {
      deltas[key] = val * weight / totalWeight - val / entries.length;
    }
  }

  return buildResult(simpleAverage, ponderatedAverage, /* ... */);
}
```

### Multi-Scout Aggregation

```ts
// app/lib/scoring/aggregate.ts

/**
 * When multiple scouts report on the same player,
 * average their scores per-attribute before feeding into the scoring engine.
 */
export function aggregateReports(reports: PlayerScores[]): PlayerScores {
  const count = reports.length;
  if (count === 0) throw new Error("No reports to aggregate");
  if (count === 1) return reports[0];

  // Simple mean per attribute across all scouts
  return flattenMerge(reports, (values) =>
    Math.round(values.reduce((a, b) => a + b, 0) / count) as Score
  );
}
```

**Why simple mean, not weighted-by-scout:** v1 has no scout reliability/ranking system. Equal weight per scout is the simplest defensible approach. If scout seniority weighting is needed later, it's an additive change to `aggregateReports`.

### Weight Sources

Weights come from **URL search params**, not server state:

```
/division/players?w_finishing=3&w_passing=1&w_pace=2
```

This means:
- **Bookmarkable:** A division member can share a "show me best finishers" search
- **No server round-trip:** Slider changes update the URL, the component re-reads search params, recalculates client-side
- **SSR-compatible:** The loader also reads search params so the initial render includes the weighted result

### Breakdown Visualization

The "why did the score change" breakdown is a first-class output:

```ts
// app/lib/scoring/breakdown.ts

/**
 * For each attribute, compute the delta between ponderated contribution
 * and simple-average contribution. Positive = weight boosted this attribute's
 * influence. Negative = weight reduced it.
 */
export function calculateDeltas(
  scores: FlatScores,
  weights: Weights
): AttributeDelta[] {
  // ... returns sorted array showing which attributes drove the score up/down
}
```

This feeds directly into the UI as color-coded bars (green = attribute boosted score, red = attribute dragged it down).

## Data Layer Architecture

For v1, data persistence is **JSON files on disk**. This avoids database setup overhead while establishing a clean interface that swaps to a real DB later.

### File Structure

```
app/
  data/
    players.json          # Player records
    reports.json          # Scout reports (linked to players + scouts)
    watchlist.json        # Division watchlist entries
    data.ts               # Typed CRUD functions (the "data layer interface")
```

### Data Layer Interface

```ts
// app/data/data.ts
// All functions are async — even though JSON files are sync,
// this ensures the interface is DB-ready without signature changes.

export async function getPlayers(): Promise<Player[]> { /* ... */ }
export async function getPlayerById(id: string): Promise<Player | null> { /* ... */ }
export async function getReportsByPlayer(playerId: string): Promise<Report[]> { /* ... */ }
export async function createReport(report: NewReport): Promise<Report> { /* ... */ }
export async function addToWatchlist(playerId: string): Promise<void> { /* ... */ }
export async function removeFromWatchlist(playerId: string): Promise<void> { /* ... */ }
export async function getWatchlist(): Promise<WatchlistEntry[]> { /* ... */ }
```

**Why JSON files, not SQLite or a real DB:**
- Zero setup — no database server, no migrations, no ORM config
- The interface is async — swapping to SQLite/Postgres later only changes `data.ts` internals
- U15 scouting volume is low (dozens of players, not thousands) — JSON reads/writes are fine
- SSR means reads happen on the server where file access is direct

**Why NOT localStorage:**
- Not accessible from server-side loaders (breaks SSR)
- Not shared between users (scouts can't see each other's reports)
- No concurrency control (two scouts writing simultaneously would corrupt data)

## Visualization Architecture

### Recharts for Radar Charts

Recharts is the recommended charting library because:
- **Native React components** — declarative `<RadarChart>`, `<Radar>`, `<PolarGrid>` etc.
- **First-class radar chart support** — the exact chart type needed for player profiles
- **Lightweight** — only what's needed, no 300KB ECharts bundle
- **Responsive containers** — `<ResponsiveContainer>` handles resize automatically
- **Composable** — overlay multiple Radar series for comparisons (player A vs player B)

```tsx
// Player radar chart — 4 category axes
<RadarChart data={radarData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="category" />
  <PolarRadiusAxis domain={[0, 5]} />  {/* 1-5 scale */}
  <Radar name="Simple Average" dataKey="simple" fill="#8884d8" fillOpacity={0.3} />
  <Radar name="Weighted Score" dataKey="ponderated" fill="#82ca9d" fillOpacity={0.5} />
  <Legend />
  <Tooltip />
</RadarChart>
```

The radar data shape is derived from `PonderatedResult`:

```ts
const radarData = [
  { category: "Physical",   simple: result.categoryAverages.physical,   ponderated: result.ponderatedCategories.physical },
  { category: "Technical",  simple: result.categoryAverages.technical,  ponderated: result.ponderatedCategories.technical },
  { category: "Tactical",   simple: result.categoryAverages.tactical,   ponderated: result.ponderatedCategories.tactical },
  { category: "Match Notes", simple: result.categoryAverages.matchNotes, ponderated: result.ponderatedCategories.matchNotes },
];
```

### Score Bars

Individual attribute scores use simple CSS bars (no chart library needed):

```tsx
// 1-5 scale bar — pure Tailwind, no library
<div className="flex gap-1">
  {[1,2,3,4,5].map(n => (
    <div
      key={n}
      className={cn(
        "h-3 w-8 rounded-sm",
        n <= score ? "bg-green-500" : "bg-gray-200"
      )}
    />
  ))}
</div>
```

This keeps the attribute-level display lightweight and avoids over-charting.

## Patterns to Follow

### Pattern 1: Server-First Data Fetching

**What:** Use route loaders for all data reads. Never fetch in `useEffect`.

**When:** Every route that needs data.

**Why:** React Router 7 SSR means the server fetches data before sending HTML. The user sees a fully-rendered page, not a spinner. Client-side fetching in `useEffect` defeats this.

```tsx
// ✅ Correct — loader fetches on the server
export async function loader() {
  const players = await getPlayers();
  return { players };
}

export default function Players({ loaderData }: Route.ComponentProps) {
  return <PlayerList players={loaderData.players} />;
}

// ❌ Wrong — fetches on client after hydration
export default function Players() {
  const [players, setPlayers] = useState([]);
  useEffect(() => { getPlayers().then(setPlayers); }, []);
  return <PlayerList players={players} />;
}
```

### Pattern 2: Form-Based Mutations with Automatic Revalidation

**What:** Use `<Form>` or `useFetcher` for all data writes. Never call APIs from event handlers.

**When:** Creating reports, adding to watchlist, marking for signing.

**Why:** React Router's action → revalidation loop is the framework's core value. Manual API calls + state updates replicate this badly.

```tsx
// ✅ Correct — Form triggers action, loaders auto-refetch
<Form method="post" action="/scout/report">
  <input name="playerName" />
  <input name="finishing" type="number" min={1} max={5} />
  <button type="submit">Submit Report</button>
</Form>

// ❌ Wrong — manual fetch + state management
<button onClick={async () => {
  await fetch("/api/reports", { method: "POST", body: JSON.stringify(data) });
  setPlayers(await getPlayers()); // manual refresh, race conditions
}}>Submit</button>
```

### Pattern 3: URL Search Params for Filter State

**What:** Scoring weights, position filters, sort order → URL search params.

**When:** Any UI state that should be bookmarkable, shareable, or affect data fetching.

**Why:** URL params are SSR-safe (loader reads them on server), shareable (paste link = same view), and don't require client state management.

```tsx
// Weight sliders update URL, component reads URL
export default function Players({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  function handleWeightChange(attribute: string, value: number) {
    setSearchParams(prev => {
      prev.set(`w_${attribute}`, String(value));
      return prev;
    });
  }

  const weights = parseWeights(searchParams);
  const results = calculatePonderated(loaderData.players, weights);
  // ...
}
```

### Pattern 4: Fetcher for Non-Navigating Mutations

**What:** Use `useFetcher` for actions that shouldn't change the URL (watchlist toggles, signing marks).

**When:** Toggling a player's watchlist status while staying on the player list page.

**Why:** `<Form>` causes navigation (adds history entry). `useFetcher` submits without navigation, perfect for inline toggles.

```tsx
function WatchlistButton({ playerId, isWatched }: { playerId: string; isWatched: boolean }) {
  const fetcher = useFetcher();
  const optimistic = fetcher.formData?.get("watched") === "true";

  return (
    <fetcher.Form method="post" action="/division/watchlist">
      <input type="hidden" name="playerId" value={playerId} />
      <button name="watched" value={isWatched ? "false" : "true"}>
        {optimistic ? "★" : isWatched ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
```

### Pattern 5: Pure Scoring Engine with No Side Effects

**What:** The scoring engine is a set of pure functions. No state, no DOM, no server calls.

**When:** All scoring calculations.

**Why:** Pure functions are testable, cacheable, and composable. The same `calculatePonderated` works on the server (for SSR) and client (for interactive weight changes).

```ts
// Pure function — same input always produces same output
export function calculatePonderated(scores: FlatScores, weights: Weights): PonderatedResult {
  // ... deterministic calculation, no side effects
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side State Cache (Redux, Zustand, etc.)

**What:** Storing server data in a client-side state manager.

**Why bad:** React Router 7 already manages a server-state cache via loaders + revalidation. Adding Redux creates two sources of truth that drift apart. The official React Router docs explicitly state: "most React Router applications forgo [client caching libraries] entirely."

**Instead:** Use `loaderData` (server state) and `useSearchParams` (URL state). For truly client-only state (e.g., a modal open/closed), use `useState` — not a global store.

### Anti-Pattern 2: API Routes + Client Fetching

**What:** Building `/api/players` endpoints and fetching from `useEffect`.

**Why bad:** Bypasses SSR, loses automatic revalidation, creates race conditions, duplicates loading/error logic.

**Instead:** Co-locate loaders and actions in route modules. The route IS the API.

### Anti-Pattern 3: Scoring on the Server Per Weight Change

**What:** Running the scoring engine in a loader every time the user drags a weight slider.

**Why bad:** Every slider change would trigger a server round-trip. The UX would feel sluggish and waste bandwidth. The scoring engine is O(n) in attributes with trivial computation — there's zero reason to round-trip.

**Instead:** Loader returns raw scores. Client-side scoring engine recalculates instantly on weight changes. The loader only needs to re-run when the underlying player data changes (new report submitted, etc.).

### Anti-Pattern 4: Storing Weights in Server State

**What:** Saving the current weight configuration to the database/server.

**Why bad:** Weights are per-search, ephemeral. A scout director changes weights per query, not as a persistent setting. Storing them server-side adds writes, network calls, and complexity for no benefit.

**Instead:** Weights live in URL search params. They're bookmarkable, shareable, and free to change without server interaction.

### Anti-Pattern 5: Premature Database

**What:** Setting up PostgreSQL, Prisma, and migrations for v1.

**Why bad:** A U15 scouting operation has maybe 50-200 players. JSON file reads take <1ms at this scale. A database adds setup time, deployment complexity, and migration maintenance before the data model is stable.

**Instead:** JSON files with an async interface. The interface is the contract — the implementation swaps when volume demands it.

## Two-Role Architecture

The system has two distinct user roles with different workflows:

### Scout Role (Data Entry)

- **Primary action:** Submit player reports
- **Navigation:** Scout dashboard → Report form → My reports
- **Data flow:** Form → Action → Data Layer (writes)
- **UI focus:** Efficient data entry, 1-5 sliders, validation feedback
- **Read needs:** Minimal — only their own submitted reports for review

### Division Role (Appraisal & Decisions)

- **Primary action:** Browse, evaluate, compare, decide
- **Navigation:** Player list (with weight controls) → Player detail → Compare → Watchlist
- **Data flow:** Loader → Read players/reports → Client scoring engine → Recharts
- **UI focus:** Visual profiles, comparison views, score breakdowns
- **Write needs:** Watchlist toggles, signing marks (via fetcher, non-navigating)

**v1 Authentication:** Simple role selection (no auth system). A cookie or search param stores the active role. This is sufficient for a small internal scouting team. Real auth (login, passwords) is a later-phase concern.

## Build Order (Component Dependencies)

The architecture implies a clear build order based on data dependencies:

```
Phase 1: Foundation
├── Data model types (Player, Report, Watchlist)
├── Data layer interface (data.ts with JSON backend)
├── App layout + route structure
└── Basic home + scout/dashboard routes

Phase 2: Core Write Path (Scout)
├── Report form (1-5 inputs across 4 categories)
├── Report action + validation
├── Multi-scout aggregation logic
└── "My reports" view

Phase 3: Core Read Path (Division)
├── Player list route + loader
├── Scoring engine (calculate, aggregate, breakdown)
├── Weight controls (URL search params)
├── Radar chart (Recharts) + score bars
└── Player detail route (drill-down)

Phase 4: Decision Features
├── Watchlist (fetcher-based toggle)
├── Player comparison view
├── Signing marks
└── Time tracking (report history per player)
```

**Dependency rationale:**
- **Phase 1 before everything:** Types and data layer are the foundation all features build on
- **Phase 2 before Phase 3:** Can't browse players until reports exist to populate their scores
- **Scoring engine in Phase 3, not earlier:** The engine needs player data to validate against; building it in isolation risks designing around imaginary data shapes
- **Phase 4 after Phase 3:** Watchlist and comparison only make sense once you can browse and evaluate players

## Scalability Considerations

| Concern | At 50 players | At 500 players | At 5K players |
|---------|--------------|----------------|---------------|
| JSON file reads | <1ms, fine | ~5ms, still fine | ~50ms, swap to SQLite |
| Scoring engine perf | Instant | Instant | Instant (O(n) in attributes, not players) |
| Route loader time | <10ms | <50ms | Needs pagination + DB indexing |
| Radar chart rendering | Instant | Instant | Lazy-load player detail charts |
| Multi-scout aggregation | Negligible | Negligible | Cache aggregated scores, recompute on new report only |
| Concurrent JSON writes | Risky (2 scouts) | Needs file locking | Must use real DB |

The scoring engine itself scales linearly and will never be a bottleneck — it's basic arithmetic on ~16 attributes per player. The scalability concern is the data layer, which the async interface makes swappable.

## Sources

- React Router 7 official docs — route modules, loaders, actions, state management (reactrouter.com) — **HIGH confidence**
- React Router 7 Context7 documentation — framework mode file structure, `routes.ts` API, `useFetcher` patterns — **HIGH confidence**
- Recharts Context7 documentation — RadarChart API, PolarGrid, responsive containers — **HIGH confidence**
- React Router 7 state management explanation — "most applications forgo [caching libraries] entirely" — **HIGH confidence**
- Scoring engine design based on PROJECT.md requirements (1-5 scale, 4 categories, ponderated averages, per-search weights) — **HIGH confidence**
- JSON file data layer pattern — standard Node.js approach for low-volume apps, consensus across React/Remix community — **MEDIUM confidence** (common pattern but not formally documented as a "best practice")
