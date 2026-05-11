# Project Research Summary

**Project:** FootScout — U15 Soccer Scouting Dashboard
**Domain:** Sports analytics / domain-specific data tool (youth scouting)
**Researched:** 2026-05-11
**Confidence:** MEDIUM-HIGH

## Executive Summary

FootScout is a niche internal scouting tool for U15 youth soccer, where scouts manually enter subjective player ratings and division managers evaluate prospects using a configurable weighted scoring engine. Unlike major platforms (Wyscout, StatsBomb, SciSports) that ingest automated event/tracking data, FootScout's deliberate constraint — manual scout entry with configurable per-search weight shifting — fills a genuine gap in the market. No existing platform offers configurable per-search weighted scoring; they all use fixed metric weights or pre-baked position profiles. This is FootScout's core differentiator and the feature that must land flawlessly for the product to have value.

The recommended approach is a **React Router 7 SSR app** with a phased data strategy: **JSON file storage for v1** (zero setup, trivial at 50–200 player scale), swapping to Supabase when auth/multi-user/concurrency demands it. The scoring engine must be a **pure client-side module** — never server-side on weight changes — with **URL search params for weight state** (bookmarkable, shareable, SSR-safe). The single most important architectural decision is keeping the scoring engine, data layer, and visualization as decoupled modules so the data backend can swap without touching the scoring logic.

The dominant risk is **data entry adoption** — if scouts find the report form overwhelming, the dashboard starves for data and becomes useless. The second risk is **score opacity** — a weighted scoring engine that produces numbers without showing how they were computed will be distrusted and ignored. Both must be addressed from Phase 1, not retrofitted. A notable research tension exists between STACK.md (recommends Supabase + Zustand + full auth from the start) and ARCHITECTURE.md (recommends JSON files + URL params + simple role selection for v1). The synthesis resolves this in favor of ARCHITECTURE.md's pragmatic v1 approach, with Supabase + Zustand as the documented Phase 3+ migration path.

## Key Findings

### Recommended Stack

The project is already scaffolded with **React 19 + React Router 7 (framework mode, SSR) + Vite 8 + TypeScript 5.9 + Tailwind CSS 4**. These are current, correct, and must not be changed. The critical additions are **Recharts** (SVG-based radar charts that work with SSR — Chart.js's canvas rendering breaks it), **Zod + React Hook Form** (shared validation schemas for client/server), and **Lucide React + clsx + date-fns** (utilities). See STACK.md for full version matrix.

**Core technologies:**
- **React Router 7 (framework mode, SSR):** Server loaders for data fetching, actions for mutations, middleware for auth, auto-revalidation — the entire data flow backbone
- **Recharts ^3.8.1:** Declarative `<RadarChart>` + `<PolarGrid>` for player profiles, `<ResponsiveContainer>` for fluid layouts, SVG rendering for SSR compatibility
- **Zod ^4.4.3 + React Hook Form ^7.75.0:** Shared validation schemas between client form and server action; RHF manages complex multi-field report forms without re-render storms
- **Supabase (deferred to Phase 3+):** PostgreSQL + Auth + RLS eliminates custom API code; `@supabase/ssr` handles cookie-based auth for SSR. NOT used in v1 — JSON files first, migrate when ready
- **Zustand ^5.0.13 (deferred to Phase 3+):** Client-side scoring engine state with weight/filters/ui slices. NOT used in v1 — URL search params + `useState` are sufficient for the initial scoring engine. Zustand becomes valuable when watchlist persistence and complex UI state are needed
- **JSON file storage (v1 data layer):** Async interface (`getPlayers`, `createReport`, etc.) over `app/data/*.json` files — swaps to Supabase with zero signature changes when auth/concurrency demands it

**Critical version note:** All recommended packages support React 19 peer dependencies. Verified via npm registry 2026-05-11. See STACK.md § Version Verification Checklist.

### Expected Features

**Must have (table stakes):**
- **Scout report form** — the data input mechanism; without it, nothing else exists. 1-5 scale per attribute is industry-standard (FM, Wyscout, SciSports). Must support staged disclosure (quick report → full form) to avoid the Data Entry Wall pitfall
- **Player profile page with radar charts** — the visual output; radar charts are the lingua franca of football scouting (Wyscout, StatsBomb, SciSports all use them). Non-negotiable
- **Player list/grid with search/filter** — browsing is how every session starts; name search + position filter is the minimum
- **Multiple scout reports per player** — reduces individual bias; must preserve individual reports as first-class entities (never merge into aggregated records)
- **Simple average display** — the unweighted baseline; weighted scores only make sense relative to this
- **Watchlist/shortlist** — the tracking workflow that keeps users returning; every platform has this
- **Match context on reports** — date, opponent, scout name; unanchored reports are meaningless

**Should have (differentiators):**
- **Ponderated (weighted) scoring engine** — THE core differentiator. No major platform offers configurable per-search weight shifting. "Who's the best finisher?" vs. "Who's the best all-round forward?" — same data, different weights, different answers
- **Weight transparency / score breakdown** — showing WHY weighted ≠ simple. No platform does this explicitly. Makes the engine trustworthy
- **Player comparison (side-by-side)** — recruitment is fundamentally comparative. At minimum, overlay two radar charts
- **Sign/Track decision markers** — dual workflow unique to youth roster-building. Simple but powerful for division-level decisions

**Defer (v2+):**
- **Position-adaptive weight presets** — UX improvement on the engine, not a prerequisite
- **Scout consistency indicator** — valuable but requires enough multi-scout data to be meaningful
- **Development timeline** — longitudinal tracking is a differentiator for U15, but depends on accumulated report history
- **Exportable PDF scouting report** — board-ready output; polish feature
- **@tanstack/react-table** — player list needs only simple filtering in v1; column sorting/pagination is a Phase 2 refinement

### Architecture Approach

The architecture is a **server-first, route-centric React Router 7 SSR app** with a clean separation between server data (loaders/actions + JSON file data layer) and client computation (pure scoring engine + Recharts visualization). The scoring engine is a pure function of `(playerScores, weights) → ponderatedResult` that lives entirely on the client — it never writes to the server, never needs a server round-trip for weight changes, and recalculates instantly via URL search params. This is the key architectural insight: **loaders return raw scores, the client engine applies weights**.

**Major components:**
1. **Route Modules** — page-level UI + co-located loader (data fetch) + action (mutations) + error boundary. The route IS the API — no separate `/api/` endpoints
2. **Data Layer (`app/data/data.ts`)** — async CRUD interface over JSON files (v1) → Supabase client (v2+). The interface is the contract; implementation swaps without touching loaders or components
3. **Scoring Engine (`app/lib/scoring/`)** — pure, testable, client-side module with `calculate.ts` (ponderated average), `aggregate.ts` (multi-scout averaging), `breakdown.ts` (delta visualization). No side effects, no server calls, works identically on server (SSR) and client
4. **Recharts Visualizations** — radar charts with `PolarAngleAxis` for 4 category-level scores, `ResponsiveContainer` for fluid layout, multiple `<Radar>` series for simple vs. weighted overlay and player comparison
5. **URL Search Params** — the state management solution for weights, filters, and sort order. SSR-safe, bookmarkable, shareable. Replaces the need for Zustand in v1

### Critical Pitfalls

1. **The Opaque Black-Box Score** — weighted scores without breakdowns destroy user trust. Prevention: build breakdown UI from day one; every weighted score shows "simple avg → weighted avg" with per-attribute deltas explaining the shift
2. **The Data Entry Wall** — 20+ attribute inputs overwhelm scouts, who abandon the system. Prevention: staged disclosure (2-minute quick report → expandable full form), "not observed" as a legitimate state (≠ 3), mobile-first design, draft persistence
3. **Averaging Away the Outlier Scout** — simple averaging erases inter-scout disagreement, which is the most valuable signal. Prevention: always show variance alongside mean; flag attributes where scouts differ by >1.5 points; preserve individual reports as first-class entities
4. **Stale Data Masquerading as Current** — U15 players transform in 3–6 month cycles; an 8-month-old report is unreliable. Prevention: show observation dates on every score; freshness decay indicators; default to recent observations; flag players needing re-evaluation
5. **The Christmas-Tree Dashboard** — radar + bar + sparkline + comparison all at once overwhelms. Prevention: progressive disclosure ruthlessly — list shows one key metric, profile shows radar + breakdown, comparison shows side-by-side; limit radar to 6–8 axes; one decision per view

## Implications for Roadmap

### Phase 1: Foundation + Data Entry

**Rationale:** Types and data layer are the foundation all features build on. The report form is the most critical feature — without scout data input, nothing else matters. Building it first forces the data model to be real (not imagined), and surfaces the Data Entry Wall pitfall early when it's cheapest to fix.

**Delivers:** Working app shell, data model, JSON data layer, scout report form (with staged disclosure), basic player list, "my reports" view for scouts

**Addresses features:** Scout report form, player list/grid view, basic search/filter, match context on reports

**Avoids pitfalls:**
- **Data Entry Wall (Pitfall 3):** Build staged disclosure from the start — quick report flow first, expandable full attribute matrix second
- **"Not observed" ≠ 3 (Pitfall 8):** Data model must support nullable/optional ratings from day one; schema migration later is painful
- **Scout identity lost (Pitfall 7):** Individual reports as first-class entities in the data model — never merge into aggregated records

### Phase 2: Scoring Engine + Player Profiles

**Rationale:** The scoring engine is the core differentiator, but it needs real player data to validate against (from Phase 1). Player profiles are where the scoring engine's output becomes visible. Building the engine alongside profiles ensures the breakdown visualization is integrated from the start, avoiding the Opaque Black-Box Score pitfall.

**Delivers:** Pure scoring engine (calculate, aggregate, breakdown), weight controls via URL search params, player profile page with radar chart + score bars, simple average vs. weighted average display with deltas, position-adaptive weight presets as defaults

**Addresses features:** Ponderated scoring engine, weight transparency/score breakdown, score visualization (radar charts), simple average display, multiple scout aggregation

**Uses:** Recharts (RadarChart, ResponsiveContainer), URL search params for weight state, Zod for weight validation

**Implements:** Scoring Engine module (`app/lib/scoring/`), Recharts visualization components, weight slider UI

**Avoids pitfalls:**
- **Opaque Black-Box Score (Pitfall 1):** Breakdown UI built from day one alongside the scoring engine; every weighted score shows its computation path
- **Simple vs. weighted confusion (Pitfall 9):** Clear naming ("Overall Rating" for weighted, "Raw Average" for simple); always shown together; weighted as hero number
- **Weight configuration trap (Pitfall 6):** Position-adaptive presets as starting points, weight bounds (0–3), real-time ranking preview as weights change
- **Christmas-Tree Dashboard (Pitfall 5):** Profile view shows radar + breakdown only; one decision per view
- **Radar axis ordering (Pitfall 11):** Fixed axis order across all charts; related axes grouped adjacently

### Phase 3: Decision Features + Multi-Scout Intelligence

**Rationale:** Watchlist and comparison only make sense once users can browse and evaluate players (Phase 2). Multi-scout intelligence features (consistency indicators, variance display) require enough reports to be meaningful. This phase adds the workflow features that turn a data viewer into a decision tool.

**Delivers:** Watchlist with staleness tracking, player comparison view (2–3 players, radar overlay + tabular), Sign/Track/Monitor decision markers, scout consistency indicator (variance display), development timeline (attribute scores over time)

**Addresses features:** Player comparison, watchlist/shortlist, Sign/Track decision markers, scout consistency indicator, development timeline

**Avoids pitfalls:**
- **Averaging away outliers (Pitfall 2):** Variance display built into aggregation model; high-disagreement attributes flagged visually
- **Unbounded comparison (Pitfall 12):** Cap at 3 players; tabular comparison beyond that
- **Watchlist graveyard (Pitfall 14):** Staleness sorting by default; re-evaluation prompts; clear next-step actions per entry
- **Stale data (Pitfall 4):** Freshness indicators on scores; default to recent observations; temporal trajectory display
- **Missing scout context (Pitfall 13):** Link ratings to source reports with match context snippets

### Phase 4: Production Readiness + Migration

**Rationale:** When the app needs real auth (multiple scouts, role enforcement), concurrent writes (2+ scouts submitting simultaneously), or deployment to production, JSON files become insufficient. This phase migrates to Supabase for PostgreSQL + Auth + RLS, adds Zustand for client-side UI state (watchlist persistence, complex filter combinations), and adds PDF export for board-ready output.

**Delivers:** Supabase integration (Postgres, Auth, RLS), cookie-based SSR auth, role-based access enforcement, Zustand for client state, PDF scouting report export, signing decision audit trail

**Addresses features:** Exportable PDF scouting report, production auth

**Avoids pitfalls:**
- **Signing decision without audit trail (Pitfall 15):** Snapshot scoring state at decision time; store rationale

### Phase Ordering Rationale

- **Phase 1 before everything:** Data model + report form are the foundation — no data means no dashboard. The "not observed" nullable rating must be in the schema from day one.
- **Phase 2 after Phase 1:** The scoring engine needs real player data to validate against; building it in isolation risks designing around imaginary data shapes. Radar charts need scores to render.
- **Phase 3 after Phase 2:** Watchlist, comparison, and multi-scout intelligence only make sense once users can browse and evaluate players. Variance display requires enough multi-scout reports to be meaningful.
- **Phase 4 as needed:** Supabase migration is driven by operational need (concurrent writes, auth requirements), not feature dependencies. Some projects may never need it.
- **JSON → Supabase migration is safe** because the data layer interface (`data.ts`) is async from day one — only the implementation changes, not the function signatures that loaders/actions call.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Report Form UX):** Staged disclosure pattern for complex forms in React Router 7 — need to research best practices for progressive disclosure with `<Form>` + RHF + action flow. The "quick report → full form" UX pattern needs concrete implementation research
- **Phase 2 (Scoring Engine + Weights UX):** Weight slider interaction design — how to make weight adjustments feel tangible with instant visual feedback. Real-time ranking preview as weights change needs UI research. The breakdown visualization (per-attribute deltas as color-coded bars) needs design validation
- **Phase 4 (Supabase Migration):** `@supabase/ssr` integration with React Router 7 middleware pattern — MEDIUM confidence in STACK.md; needs concrete implementation research. Cookie-based auth with SSR loaders is well-documented for Next.js but less so for React Router 7

Phases with standard patterns (skip research-phase):
- **Phase 1 (Data Layer):** JSON file CRUD with async interface is a well-established Node.js pattern — no research needed
- **Phase 2 (Recharts Radar):** RadarChart + PolarGrid + PolarAngleAxis is well-documented in Recharts docs and Context7 — standard implementation
- **Phase 3 (Watchlist + Comparison):** Fetcher-based toggles and side-by-side comparison are standard React Router 7 patterns — no research needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified against npm registry for React 19 peer dep compatibility. React Router 7 framework mode well-documented via official docs + Context7. Supabase integration pattern documented but MEDIUM confidence for React Router 7 specifically (more Next.js examples exist). |
| Features | HIGH | Feature landscape drawn from 6 professional scouting platforms (Wyscout, StatsBomb, SciSports, SkillCorner, InStat, Scouting4U) + Football Manager cultural reference. Gap analysis is strong — no platform offers configurable per-search weighted scoring. Feature prioritization follows clear critical path from dependency analysis. |
| Architecture | MEDIUM-HIGH | React Router 7 patterns (loaders, actions, middleware, fetchers) are well-documented and HIGH confidence. JSON file data layer is a standard pattern but MEDIUM confidence as a "recommended" approach — it's pragmatic for v1 but not formally documented as best practice. **Key tension:** STACK.md and ARCHITECTURE.md disagree on backend (Supabase vs JSON) and state management (Zustand vs URL params). Resolution favors ARCHITECTURE.md's v1 pragmatism with STACK.md's recommendations deferred to Phase 4. |
| Pitfalls | HIGH | Top 5 pitfalls grounded in domain science (Science for Sport on U15 maturation variability, relative age effect) and UX research (NN/g progressive disclosure, top 10 app design mistakes). Pitfalls 1 (opaque scores), 2 (averaging outliers), 3 (data entry wall), and 8 (not observed ≠ 3) are directly traceable to PROJECT.md requirements. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **STACK.md vs. ARCHITECTURE.md tension on backend:** STACK.md recommends Supabase from the start; ARCHITECTURE.md recommends JSON files for v1. The synthesis favors JSON files for v1 (faster to build, adequate for 50–200 players, clean swap path), but the team should validate this decision early. If auth/role requirements are hard requirements from day one, Supabase should move to Phase 1.
- **STACK.md vs. ARCHITECTURE.md tension on state management:** STACK.md recommends Zustand; ARCHITECTURE.md says "avoid client-side state caches" and uses URL search params + useState. The synthesis favors URL params for v1 (simpler, bookmarkable, SSR-native), with Zustand added when watchlist persistence or complex filter state exceeds what URL params can comfortably handle. This should be validated during Phase 1 planning.
- **"Not observed" data model:** PROJECT.md specifies "1-5 scoring scale" without mentioning a "not observed" state. PITFALLS.md identifies this as a HIGH-confidence pitfall. The data model needs to support nullable/optional ratings, but the UX for "not observed" in the form and radar chart needs design validation with real scouts.
- **Weight slider UX:** How weight adjustments translate to visual ranking changes in real-time is a key UX question. No existing platform does this — it's FootScout's differentiator. The interaction pattern (sliders? dropdowns? comparison sliders?) needs design research.
- **Scoring breakdown naming:** "Ponderated average" vs. "weighted average" vs. "Overall Rating" — the naming frames how users understand the product. PITFALLS.md recommends "Overall Rating" (weighted) + "Raw Average" (simple), but this should be validated with domain users.

## Sources

### Primary (HIGH confidence)
- **Context7 — Recharts (`/recharts/recharts`):** RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer API. Current, comprehensive.
- **Context7 — React Router 7 (`/remix-run/react-router`):** Framework mode, loaders, actions, middleware, fetchers, routes.ts configuration, type-safe route modules.
- **Context7 — Zustand (`/pmndrs/zustand`):** Store creation, slices, persist/devtools middleware, React 19 compatibility.
- **Context7 — Supabase (`/supabase/supabase`):** Client initialization, RLS policies, auth flows, `@supabase/ssr` for server-side auth.
- **React Router 7 official docs (reactrouter.com/start/framework):** Framework mode architecture, SSR configuration, state management guidance ("most applications forgo [caching libraries] entirely").
- **Recharts official docs (recharts.org):** Chart component API, radar chart examples, responsive container usage.
- **Wyscout/Hudl official docs (hudl.com):** Feature set, scouting workflows, player lists, shadow teams, youth competitions. Industry standard reference.
- **SciSports official docs (scisports.com):** Youth academy features, player profiling, position-specific KPI queries, flagging/shortlisting. Most relevant competitor.
- **StatsBomb/Hudl official docs (hudl.com):** Radar chart paradigm, comparison tables, shortlists, customizable metrics.
- **npm registry (2026-05-11):** Version verification for all recommended packages, React 19 peer dependency confirmation.
- **Science for Sport — Talent Identification & Relative Age Effect:** U15 maturation variability, biological maturity mistaken for superiority, developmental trajectory volatility. Directly supports Pitfall 4 (stale data).
- **Nielsen Norman Group — Progressive Disclosure & Top 10 App Design Mistakes:** Research-validated UX principles supporting Pitfalls 3 (data entry wall), 5 (dashboard overload), and 6 (weight configuration).

### Secondary (MEDIUM confidence)
- **SkillCorner official docs (skillcorner.com):** AI-driven physical/tracking data features. Low relevance to FootScout's manual-entry approach but confirms the market gap.
- **InStat/Hudl:** Video + data analysis features. Indirect reference, less detailed.
- **Scouting4U official docs (scouting4u.com):** Basketball-focused (cross-sport reference only). AI scouting reports, shot charts, proprietary metrics. Medium relevance for feature patterns.
- **Football Manager:** Cultural reference for scouting UI patterns (scouting center, report cards, assignment system). Not a professional tool — medium confidence for UX patterns only.
- **JSON file data layer pattern:** Standard Node.js approach for low-volume apps, consensus across React/Remix community. Common pattern but not formally documented as "best practice."

### Tertiary (LOW confidence)
- **Scoutpad:** No accessible website found. Likely defunct or rebranded. Excluded from analysis.
- **Position-adaptive weight presets:** Inferred from FM scout assignments and SciSports "position profiles" — not a directly documented pattern in professional scouting tools.
- **Scout consistency/variance display:** No existing platform implements this well; the approach is inferred from general rating system design principles.

---
*Research completed: 2026-05-11*
*Ready for roadmap: yes*
