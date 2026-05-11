# Technology Stack

**Project:** FootScout — U15 Soccer Scouting Dashboard
**Researched:** 2026-05-11

---

## Recommended Stack

### Core Framework (Already Scaffolded — Do Not Change)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | ^19.2.6 | UI rendering | Already scaffolded; React 19 is current stable with improved concurrent features and `<meta>` support | HIGH |
| React Router 7 | 7.15.0 | Framework mode (SSR, loaders, actions) | Already scaffolded; framework mode provides server loaders/actions for auth-gated data fetching, automatic revalidation, and middleware for auth checks | HIGH |
| @react-router/node | 7.15.0 | Node.js server adapter | Already scaffolded; required for SSR framework mode | HIGH |
| @react-router/serve | 7.15.0 | Production server | Already scaffolded; handles SSR serving out of the box | HIGH |
| @react-router/dev | 7.15.0 | Vite plugin + build tooling | Already scaffolded; provides the `reactRouter()` Vite plugin | HIGH |
| Vite | ^8.0.3 | Build tool | Already scaffolded; v8 is current, fast HMR | HIGH |
| TypeScript | ^5.9.3 | Type safety | Already scaffolded; essential for scoring engine correctness | HIGH |
| Tailwind CSS | ^4.2.2 | Styling | Already scaffolded; v4 uses CSS-first config, no `tailwind.config.js` needed — use `@theme` in CSS | HIGH |

**Key React Router 7 framework mode specifics for this project:**

- **`ssr: true`** (already set in `react-router.config.ts`) — Keep it. SSR enables route `loader` functions that run on the server, which is how we gate data behind auth. Loaders fetch player data from Supabase server-side and stream it to the component via `loaderData` props.
- **`middleware`** — Use route middleware for auth checks. A root-level `authMiddleware` can verify the session cookie and set the user in `context`, making it available to all loaders without repeating auth logic in every route.
- **`action`** — Scout report submissions go through `action` exports. Actions process `<Form>` submissions server-side, validate with Zod, write to Supabase, and trigger automatic revalidation of all loaders on the page.
- **`clientLoader` / `clientAction`** — Use sparingly. Only for client-only concerns (e.g., watchlist toggles that don't need server round-trip immediately). The server `loader`/`action` should be the primary data flow.
- **Route module type safety** — React Router 7 auto-generates types via `./+types/route-name`. Use `Route.ComponentProps`, `Route.LoaderArgs`, `Route.ActionArgs` instead of hooks like `useLoaderData()` for fully-typed props.
- **NOT using RSC mode** — The `unstable_reactRouterRSC` plugin is experimental. Stick with standard SSR framework mode which is stable and well-documented.

---

### Data Visualization (Charting)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Recharts** | ^3.8.1 | Radar charts, bar charts, comparative views | Declarative React components for all chart types FootScout needs. `RadarChart` + `PolarGrid` + `PolarAngleAxis` maps directly to the scouting profile radar. `BarChart` handles score bars. `ResponsiveContainer` handles fluid layouts. React 19 peer dep supported (`^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19`). v3 is a mature, stable major with 17 patch/minor releases — battle-tested. | HIGH |

**Why Recharts over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| Chart.js + react-chartjs-2 | Imperative canvas rendering; Recharts renders SVG (crucial for SSR — SVG is serializable HTML, canvas is not). Chart.js requires a canvas element that can't be server-rendered, breaking React Router's SSR pipeline. |
| D3.js | Low-level; would require building radar chart from scratch. 5-10x more code for the same result. No React component model — you'd fight React's reconciliation with D3's DOM mutations. |
| visx (Airbnb) | Composable but fragmented — radar chart requires assembling 6+ low-level packages (`@visx/radar`, `@visx/scale`, `@visx/shape`, `@visx/axis`, `@visx/grid`, `@visx/tooltip`). No single `RadarChart` component. Higher DX tax for identical output. Maintenance uncertainty — Airbnb hasn't been actively developing visx; last meaningful release was 2023. |
| Nivo | Nice API but wraps D3 internally; adds bundle size without meaningful benefit over Recharts for the chart types we need. Less ecosystem traction. |

**Recharts usage patterns for FootScout:**

- **Player profile radar**: `RadarChart` with `PolarAngleAxis` showing attribute names (pace, shooting, passing, dribbling, defending, physical), `PolarRadiusAxis` domain `[0, 5]`, multiple `Radar` series for simple vs. ponderated average overlay.
- **Score bars**: Horizontal `BarChart` with `layout="vertical"` for attribute-by-attribute comparison, `domain={[0, 5]}` on Y-axis.
- **Comparison view**: Two overlapping `Radar` series in one `RadarChart` for side-by-side player comparison.
- **All charts wrapped in `ResponsiveContainer`** for fluid Tailwind grid layouts.

---

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Zustand** | ^5.0.13 | Client-side scoring engine state, weight configuration, UI state | The scoring engine needs reactive client state for weight sliders that recalculate ponderated averages in real-time as the division adjusts weights. Zustand's `create` + slices pattern maps cleanly: one slice for weight config, one for computed scores, one for UI filters. 1.1KB gzipped. No providers, no boilerplate. v5 is current stable with React 19 support. | HIGH |

**Why Zustand over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| Redux Toolkit | 10x more boilerplate for the same capability. The scoring engine is a self-contained computation, not a distributed state graph. RTK's slices concept is identical to Zustand's but heavier. No need for Redux DevTools for a scoring engine. |
| Jotai | Atomic model is wrong fit — scoring weights are not independent atoms; they're a cohesive configuration that changes together and triggers a unified recalculation. Atom granularity fights the domain model. |
| React Context | No selective re-renders; changing one weight re-renders every consumer. Zustand's selectors prevent this. Also, Context doesn't support middleware (persist, devtools). |
| MobX | Observable magic conflicts with React 19's concurrent rendering philosophy. Overkill for this scope. |

**Zustand usage patterns for FootScout:**

```
Slices:
├── weightsSlice    — per-attribute weights (1-5 scale), preset management
├── scoresSlice     — computed ponderated averages, derived from weights + player data
├── filtersSlice    — player list filters (position, age, score range)
└── uiSlice         — chart display options, comparison selections, watchlist (persisted)
```

- **`persist` middleware** on `uiSlice` — watchlist and filter preferences survive page refresh.
- **`devtools` middleware** — optional in dev for inspecting weight changes.
- **Do NOT persist `weightsSlice` or `scoresSlice`** — these are ephemeral per-session. The division sets weights per search; persisting them creates stale state confusion.
- **Scoring computation lives in Zustand, not React Router loaders** — Loaders fetch raw player data from Supabase; the client-side scoring engine (Zustand) applies weights and computes ponderated averages. This separation keeps the server stateless (same player data regardless of who's viewing) and the client reactive (instant recalculation on weight change without server round-trips).

---

### Backend & Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Supabase** (managed) | @supabase/supabase-js ^2.105.4 | PostgreSQL database + Auth + RLS + auto-generated API | The only backend FootScout needs. Postgres stores players, reports, watchlists. Built-in Auth handles scout/division roles. Row Level Security enforces role-based data access at the database level — scouts write reports, division reads all. Zero custom API code. Free tier covers development; Pro ($25/mo) covers production for a scouting department. | HIGH |
| **@supabase/ssr** | ^0.10.3 | Server-side Supabase client with cookie-based auth | Required for React Router SSR. Moves auth sessions from localStorage to cookies so loaders/actions can access the authenticated user server-side. The `createServerClient` + `createBrowserClient` pattern is the standard SSR integration. | MEDIUM |

**Why Supabase over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| Custom Express/Fastify + Prisma + PostgreSQL | 3-5x more code for auth, CRUD, and RLS that Supabase provides out of the box. You'd build: JWT auth, session management, role middleware, CRUD endpoints, and manually enforce row access. Supabase gives all of this via RLS policies. |
| Firebase | NoSQL doesn't fit relational scouting data (players → reports → scouts, with joins). No row-level security equivalent. No SQL for complex queries like "average all scout reports for player X grouped by attribute." |
| Convex | Real-time-first architecture is overkill — scouts submit reports at human speed, not real-time collab. Smaller ecosystem. Vendor lock-in risk. |
| Self-hosted Supabase (Docker) | Community-supported only; no managed backups, no PITR, no platform features. For a single-organization scouting tool, managed Supabase's free/Pro tier is more cost-effective than maintaining Docker infra. Only self-host if there's a compliance requirement for data locality. |

**Supabase schema design for FootScout:**

```sql
-- Core tables
players        (id, name, birth_date, position, club, created_at)
reports        (id, player_id, scout_id, match_date, opponent, notes,
                physical_score, technical_score, tactical_score,
                pace, shooting, passing, dribbling, defending, physical,
                created_at)
scouts         (id, auth_user_id, name, role)  -- role: 'scout' | 'division'
watchlist      (id, division_user_id, player_id, status, notes, added_at)
               -- status: 'tracking' | 'sign' | 'pass'

-- RLS policies
-- Scouts: INSERT on reports (own), SELECT on players
-- Division: SELECT on all tables, UPDATE on watchlist, can view all reports
```

**Supabase + React Router 7 integration pattern:**

1. **`entry.server.tsx`** — Create a Supabase server client per request using `@supabase/ssr`'s `createServerClient` with cookie handling.
2. **`middleware`** on protected routes — Verify auth session, set user in `context`.
3. **`loader`** functions — Use the server client to query Postgres with RLS automatically applied based on the auth user's role. Return typed data to components.
4. **`action`** functions — Use the server client for mutations (report submission, watchlist updates). RLS ensures scouts can only insert their own reports.
5. **Browser client** — `createBrowserClient` from `@supabase/ssr` for client-side Supabase calls (e.g., real-time watchlist updates if added later).

---

### Authentication & Authorization

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Supabase Auth** | (included in @supabase/supabase-js) | User authentication, session management | Built into Supabase. Email/password login for scouts and division. JWT sessions stored as cookies (not localStorage) for SSR compatibility. | HIGH |
| **PostgreSQL RLS** | (included in Supabase Postgres) | Role-based data access control | Enforces authorization at the database level — even if a client-side bug sends the wrong query, RLS prevents scouts from accessing division-only data. Two roles: `scout` (write reports, read players) and `division` (read all, manage watchlist, mark for signing). | HIGH |

**Auth architecture:**

```
Login flow:
1. Scout/Division user submits email+password via React Router <Form>
2. action() calls supabase.auth.signInWithPassword()
3. Session JWT set as httpOnly cookie via @supabase/ssr
4. Redirect to role-appropriate dashboard

Route protection:
1. middleware() in protected routes calls supabase.auth.getUser()
2. No valid session → redirect to /login
3. Valid session → set user + role in context
4. loader() uses role to apply correct RLS policies

Role enforcement:
- Database level: RLS policies on all tables
- Application level: Conditional UI rendering based on role
- NEVER rely on UI-only role checks — RLS is the source of truth
```

---

### Form Handling & Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **React Hook Form** | ^7.75.0 | Scout report form management | Scout report forms have 6+ scored attributes plus match notes. RHF manages the form state without re-rendering the entire component on each input change. React 19 support confirmed (peer dep `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19`). | HIGH |
| **Zod** | ^4.4.3 | Schema validation for form inputs and action payloads | Validate scout report submissions (scores 1-5, required fields, date constraints). Share schemas between client (form validation) and server (action validation) — same Zod schema validates in both places. v4 is the current major with improved performance and TypeScript inference. | HIGH |
| **@hookform/resolvers** | ^5.2.2 | Connects Zod schemas to RHF | `zodResolver(schema)` — one line to wire Zod validation into RHF. | HIGH |

**Why RHF + Zod over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| React Router `<Form>` alone | Works for simple forms but doesn't handle complex multi-field validation, conditional fields, or real-time error display without manual state. Use `<Form>` for the submission mechanism, RHF for the field management. |
| Formik | Deprecated in all but name. RHF has been the standard for 2+ years. |
| Yup | Zod has superior TypeScript inference (infers types from schemas), better error messages, and v4 performance improvements. Yup's TS inference is weaker. |

**Pattern: React Router `<Form>` + RHF + Zod together**

```tsx
// Scout report form:
// 1. Define Zod schema (shared between client and server)
// 2. RHF manages form fields with zodResolver
// 3. On valid submit, RHF data → React Router <Form method="post">
// 4. Server action re-validates with same Zod schema
// 5. Action writes to Supabase via server client
```

---

### UI Utilities

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Lucide React** | ^1.14.0 | Icon library | Tree-shakeable SVG icons. Small footprint (only import what you use). Clean, consistent iconography for scouting UI. | HIGH |
| **clsx** | ^2.1.1 | Conditional class name utility | Lightweight (228B) helper for composing Tailwind classes conditionally. Essential for state-dependent styling (active filters, selected players, role-based UI). | HIGH |
| **date-fns** | ^4.1.0 | Date formatting and manipulation | Format match dates, calculate player ages from birth dates, display "last scouted X days ago." Tree-shakeable — import only `format`, `differenceInDays`, `parseISO`. Moment.js is deprecated; date-fns v4 is current and lightweight. | HIGH |

**Why NOT using a component library (shadcn/ui, Radix, Headless UI):**

FootScout's UI is highly domain-specific — radar charts, score bars, weight sliders, player comparison cards. A component library would add 40+ unused components and fight against the custom layout needs. Build primitives with Tailwind CSS 4 + clsx. The only exception would be a dropdown/menu component if needed later — defer that decision, don't install a library preemptively.

---

### Data Table (Deferred — But Recommended)

| Technology | Version | Purpose | When to Use | Confidence |
|------------|---------|---------|-------------|------------|
| **@tanstack/react-table** | ^8.21.3 | Player list with sorting, filtering, pagination | Phase 2 when the player list needs column sorting, multi-filter, and virtualized rows. Not needed in Phase 1 (simple list). v8 is current, headless (pairs with Tailwind), and supports React 19. | MEDIUM |

**Why TanStack Table over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| Custom table with HTML | Reinventing sorting, pagination, and column management. 200+ lines of unnecessary code. |
| AG Grid | Enterprise-grade, 1MB+ bundle. Massive overkill for a 50-200 player list. |
| MUI DataGrid | Pulls in all of MUI. Wrong direction for a Tailwind project. |

---

## Alternatives Considered (Summary)

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Charting | Recharts ^3.8.1 | Chart.js + react-chartjs-2 | Canvas rendering breaks SSR |
| Charting | Recharts ^3.8.1 | visx (Airbnb) | Fragmented packages, maintenance uncertain, 6x more setup for radar |
| Charting | Recharts ^3.8.1 | D3.js | Low-level, 5-10x more code, fights React reconciliation |
| State | Zustand ^5.0.13 | Redux Toolkit | 10x more boilerplate, no benefit for this scope |
| State | Zustand ^5.0.13 | Jotai | Atomic model wrong for cohesive weight config |
| Backend | Supabase (managed) | Custom Express + Prisma | 3-5x more code for auth/CRUD/RLS |
| Backend | Supabase (managed) | Firebase | NoSQL doesn't fit relational scouting data |
| Backend | Supabase (managed) | Self-hosted Supabase | Community-supported only, no managed backups |
| Forms | RHF ^7.75.0 + Zod ^4.4.3 | Formik | Deprecated |
| Forms | RHF ^7.75.0 + Zod ^4.4.3 | Yup | Weaker TypeScript inference |
| Icons | Lucide React ^1.14.0 | React Icons (FontAwesome) | Not tree-shakeable, pulls entire icon sets |
| Dates | date-fns ^4.1.0 | Moment.js | Deprecated, non-tree-shakeable, 70KB |
| Components | Tailwind + custom | shadcn/ui + Radix | 40+ unused components, fights custom layout needs |
| Tables | @tanstack/react-table ^8.21.3 | AG Grid | 1MB+ bundle, enterprise overkill |

---

## Installation

### Core dependencies (add to existing scaffold)

```bash
# Data visualization
npm install recharts

# State management
npm install zustand

# Backend + Auth
npm install @supabase/supabase-js @supabase/ssr

# Form handling + validation
npm install react-hook-form zod @hookform/resolvers

# UI utilities
npm install lucide-react clsx date-fns
```

### Dev dependencies (none additional required)

The existing dev dependencies (Tailwind CSS 4, Vite 8, TypeScript 5.9, React Router 7) are current and correct.

### Deferred installation (Phase 2)

```bash
# Data table (when player list needs sorting/filtering)
npm install @tanstack/react-table
```

---

## Architecture Integration Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ React Router │  │   Zustand    │  │    Recharts        │  │
│  │  Components  │  │  ┌─────────┐│  │  (RadarChart,      │  │
│  │  (SSR + CSR) │←→│  │weights  ││←→│   BarChart, etc.)  │  │
│  │              │  │  │scores   ││  │                    │  │
│  │  loaderData  │  │  │filters  ││  │  Reads computed     │  │
│  │  from server │  │  │ui       ││  │  scores from store  │  │
│  └──────┬───────┘  └──────────────┘  └───────────────────┘  │
│         │                                                    │
│    Form submissions                                         │
│    (action, clientAction)                                   │
│         │                                                    │
└─────────┼──────────────────────────────────────────────────┘
          │ HTTP (cookies carry JWT session)
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Server (React Router SSR via @react-router/serve)          │
│                                                             │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  middleware   │→ │  loader/action   │→ │  Supabase    │  │
│  │  (auth check) │  │  (data fetch,    │  │  Server      │  │
│  │  sets user in │  │   validation,    │  │  Client      │  │
│  │  context)     │  │   mutations)     │  │  (@supabase/ │  │
│  └──────────────┘  │  Zod validation  │  │   ssr)        │  │
│                     └──────────────────┘  └──────┬───────┘  │
│                                                    │         │
└────────────────────────────────────────────────────┼─────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────┐
                                          │  Supabase        │
                                          │  ┌────────────┐  │
                                          │  │ PostgreSQL  │  │
                                          │  │ + RLS       │  │
                                          │  │ + Auth      │  │
                                          │  └────────────┘  │
                                          └──────────────────┘
```

---

## Data Flow: Scout Report Submission

```
1. Scout fills form (RHF manages fields, Zod validates client-side)
2. Valid submit → React Router <Form method="post">
3. Server action() receives FormData
4. action() re-validates with Zod schema (shared)
5. action() calls supabase.from('reports').insert() via server client
6. RLS policy verifies: auth.uid() === report.scout_id
7. Insert succeeds → action returns redirect or success
8. React Router auto-revalidates all page loaders
9. Updated player data flows to component via loaderData
10. Zustand scoring engine recomputes ponderated averages
11. Recharts radar re-renders with new profile shape
```

---

## Data Flow: Weight Adjustment (Client-Side)

```
1. Division user drags weight slider for "finishing"
2. Zustand weightsSlice updates weight value
3. Zustand scoresSlice recomputes ponderated average:
   - For each player: sum(attribute_score × weight) / sum(weights)
4. Recharts RadarChart re-renders (Zustand selector triggers)
5. No server round-trip — instant feedback
6. If division wants to "save" a search config, that's a future feature
```

---

## Version Verification Checklist

| Package | Verified Version | Source | React 19 Compatible |
|---------|-----------------|--------|---------------------|
| recharts | 3.8.1 | npm registry (2026-05-11) | YES (peer dep `^19`) |
| zustand | 5.0.13 | npm registry (2026-05-11) | YES |
| @supabase/supabase-js | 2.105.4 | npm registry (2026-05-11) | N/A (no React peer dep) |
| @supabase/ssr | 0.10.3 | npm registry (2026-05-11) | N/A |
| react-hook-form | 7.75.0 | npm registry (2026-05-11) | YES (peer dep `^19` since 7.52) |
| zod | 4.4.3 | npm registry (2026-05-11) | N/A |
| @hookform/resolvers | 5.2.2 | npm registry (2026-05-11) | YES |
| lucide-react | 1.14.0 | npm registry (2026-05-11) | YES |
| clsx | 2.1.1 | npm registry (2026-05-11) | N/A |
| date-fns | 4.1.0 | npm registry (2026-05-11) | N/A |
| @tanstack/react-table | 8.21.3 | npm registry (2026-05-11) | YES |

---

## What NOT to Install

| Package | Why Avoid |
|---------|----------|
| `@tanstack/react-query` | React Router 7's loaders + actions already handle server state (fetch, cache, revalidate). React Query would duplicate this responsibility and create confusion about which system owns what. Only add if you need polling/websocket subscriptions — not needed for v1. |
| `@radix-ui/react-*` | Individual Radix primitives add value for accessible dropdowns/dialogs, but FootScout v1 doesn't need them. If needed later, install individual packages — not the full `radix-ui` meta-package. |
| `shadcn/ui` | Pulls in Radix + Tailwind components. FootScout's UI is custom visualizations, not form-heavy admin. The CLI adds components you won't use. Build custom. |
| `framer-motion` | Radar chart transitions are handled by Recharts' built-in animation. Page transitions in React Router 7 use View Transitions API (native). Don't add a 30KB animation library for 2 animations. |
| `axios` | React Router 7 loaders/actions use the native `Request`/`Response` API. Supabase client has its own HTTP layer. Axios would be a third HTTP abstraction with no benefit. |
| `lodash` | Modern JS + TypeScript covers `groupBy`, `sortBy`, `debounce` natively or via small single-purpose packages. Don't add 70KB for 3 utility functions. |
| `@next/font`, `next/...` | This is React Router, not Next.js. Common mistake when copy-pasting patterns from tutorials. |

---

## Sources

- Recharts: Context7 (`/recharts/recharts`), npm registry version check, official docs (recharts.org)
- React Router 7: Context7 (`/remix-run/react-router`), official docs (reactrouter.com/start/framework), npm registry
- Zustand: Context7 (`/pmndrs/zustand`), npm registry, official docs (zustand.pmnd.rs)
- Supabase: Context7 (`/supabase/supabase`), official docs (supabase.com/docs), npm registry
- @supabase/ssr: Official docs (supabase.com/docs/guides/auth/server-side/overview), npm registry
- react-hook-form: npm registry peer dependency verification
- Zod: npm registry version check
- TanStack Table: npm registry version check
- Tailwind CSS 4: Existing scaffold, official docs
- Vite 8: Existing scaffold, npm registry
