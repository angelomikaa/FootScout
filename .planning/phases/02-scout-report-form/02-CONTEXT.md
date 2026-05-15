# Phase 2: Scout Report Form - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Scouts can enter detailed player observations through a staged form that prevents data entry fatigue. This phase delivers a 4-step wizard form (physical → technical → tactical → notes) with new-player creation within the flow, scout identity selection, and Zod-validated submission via React Router actions. No draft persistence, no report list viewing — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Step navigation style
- **D-01:** Step-by-step wizard — one category visible at a time with Next/Back buttons at the bottom. Prevents the "data entry wall" pitfall (PITFALLS.md Pitfall 3) by focusing the scout on 4 attributes per step instead of all 16+ at once.
- **D-02:** Block advance on invalid — scout cannot move to the next step until all required fields on the current step pass validation. Catches errors early per-category rather than a pile-up at submit.
- **D-03:** Progress indicator uses labeled steps with numbers — "Physical (1/4)", "Technical (2/4)", "Tactical (3/4)", "Notes (4/4)". Scout always knows what step they're on and what's next.

### New player creation flow
- **D-04:** Inline expansion — when the scout types a player name that doesn't match any existing player, a "Create new player" section expands inline with name, DOB, position, club, nationality, preferred foot, height, weight fields. Scout stays in the report flow — no page navigation or modal.
- **D-05:** Search-as-you-type dropdown (combobox/autocomplete) for player selection. Filters the player list as the scout types. Shows matching players in a dropdown. Selecting one fills the player field; no match triggers the inline creation (D-04).
- **D-06:** Scout identity via dropdown select from the scouts registry (`scouts.json`). Simple `<select>` listing all scouts by name. Matches D-10 from Phase 1 — prevents name inconsistency.

### Attribute input widget
- **D-07:** Numbered buttons (1 2 3 4 5) for attribute rating input. Not stars — ratings are evaluations, not subjective "likes". Star ratings are reserved for display-only contexts (future phases). Numbered buttons are compact, unambiguous, and map directly to Zod's integer validation.
- **D-08:** Explicit "N/O" (not observed) toggle button per attribute, positioned next to the 1-5 buttons. When pressed, it deselects any rating and marks the attribute as null. This makes the distinction between "I didn't observe this" and "I forgot to rate it" explicit and visible. Critical for D-03 from Phase 1 — null is never treated as 3.
- **D-09:** Row-per-attribute layout — each attribute on its own row with label on the left, numbered buttons + N/O toggle on the right. Compact vertical layout, easy to scan down the list, works well on mobile.

### OpenCode's Discretion
- Exact button styling and hover/active states
- Color coding for N/O toggle (muted/neutral vs active rating buttons)
- Form field spacing and typography
- Error message presentation (inline below fields vs summary)
- Scout selection placement (top of form vs first step)
- Match result field placement (within match notes step vs separate field)

</decisions>

<specifics>
## Specific Ideas

- Numbered buttons for input, star ratings reserved for display only — keeps the evaluation context clear (a 5 in strength is an observation, not "5 stars")
- N/O toggle must be visually distinct from the 1-5 rating buttons so scouts don't accidentally mark something as "not observed" when they meant to rate it
- The inline player creation should feel like a natural part of the flow, not a jarring context switch

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model and validation
- `.planning/phases/01-data-foundation/01-CONTEXT.md` — D-01 through D-11 define the data model decisions that constrain this phase (attribute categories, position fields, null handling, scout registry)
- `.planning/REQUIREMENTS.md` — SCOUT-01 and SCOUT-02 define the acceptance criteria for this phase
- `.planning/ROADMAP.md` § Phase 2 — Success criteria and scope boundary

### Architecture and patterns
- `.planning/research/ARCHITECTURE.md` — Write path: Form submit → Route Action receives FormData → Validates + writes to Data Layer → Auto-revalidation
- `.planning/research/STACK.md` — React Hook Form + Zod integration patterns, package versions
- `.planning/research/PITFALLS.md` — Pitfall 3 (Data Entry Wall — attribute count matters), Pitfall 7 (Scout identity consistency), Pitfall 8 ("Not observed" ≠ 3)

### Existing codebase
- `app/data/types.ts` — Zod schemas (playerSchema, reportSchema, scoutSchema) and TypeScript types to be shared between client form validation and server action validation
- `app/data/data.ts` — Async CRUD functions (createPlayer, createReport, getPlayers, getScouts) to be called from route actions/loaders
- `app/routes.ts` — Current route configuration (single index route, needs /scout/* prefix added)
- `app/root.tsx` — Root layout with Inter font, error boundary pattern
- `package.json` — Current dependencies (React Router 7.15, React 19, Tailwind 4, Vite 8, Zod 4)
- `AGENTS.md` — Project workflow guide, tech stack, route prefix conventions (/scout/* for data entry)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/data/types.ts` — Zod schemas (playerSchema, reportSchema, scoutSchema, attributeScoreSchema) are ready to be reused directly in form validation. Same schemas validate on both client and server.
- `app/data/data.ts` — `createPlayer()`, `createReport()`, `getPlayers()`, `getScouts()` are ready to be called from React Router actions and loaders.
- React Router 7 framework mode — loaders for data fetching (player list, scout list), actions for form submission (create report), auto-revalidation after actions.

### Established Patterns
- Route module pattern: `app/routes/{path}.tsx` with typed `Route` import from `./+types/{name}`
- Framework mode conventions: `loader` exports for server-side data fetching, `action` exports for mutations, `meta` exports for SEO
- Path alias `~/*` → `./app/*` in tsconfig — all new imports use `~/`
- Tailwind CSS 4 via `@tailwindcss/vite` plugin — no PostCSS config needed
- SSR enabled — all data layer calls happen in server context

### Integration Points
- `app/routes.ts` — Will be updated to add `/scout/*` route prefix (per AGENTS.md convention: /scout/* for data entry routes)
- `app/data/data.ts` — Action will call `createReport()` (and optionally `createPlayer()`) after Zod validation
- `app/data/types.ts` — Zod schemas will be imported for both client-side form validation and server-side action validation

</code_context>

<deferred>
## Deferred Ideas

- Draft persistence (save partially completed report) — Phase 3
- Report list view ("my reports") — Phase 3
- Star ratings for display — future phase (Phase 5/6 when profiles are built)
- Player photo upload — out of scope for v1

</deferred>

---
*Phase: 02-scout-report-form*
*Context gathered: 2026-05-12*
