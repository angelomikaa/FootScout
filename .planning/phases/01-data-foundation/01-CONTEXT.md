# Phase 1: Data Foundation - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Player and report data can be stored, retrieved, and validated through a typed async interface. This phase delivers Zod-validated data model types, JSON file data layer with async CRUD functions, and sample data demonstrating the full schema. No UI, no forms, no browsing — pure data infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Attribute granularity
- **D-01:** 4 scored attributes per category (16 total): physical (pace, strength, stamina, agility), technical (finishing, passing, dribbling, first touch), tactical (positioning, awareness, decision making, work rate), match notes (attitude, coachability, intensity, impact)
- **D-02:** Match-notes category includes both scored attributes AND a free-text `notes` field — the scored attributes feed the scoring engine, the free-text captures qualitative context that numbers can't express
- **D-03:** Each attribute rated on 1-5 integer scale OR null ("not observed") — the system never treats null as 3, never defaults to middle value

### Player identity fields
- **D-04:** Two position fields: `positionGroup` (enum: GK/DEF/MID/FWD) and `position` (enum of specific positions: GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, CF, ST) — enables group-level filtering while keeping detail
- **D-05:** Player entity includes preferred foot (enum: left/right/both), height (optional, in cm), and weight (optional, in kg) beyond the DATA-01 fields — height/weight are optional because they change frequently at U15
- **D-06:** Nationality stored as ISO 3166-1 alpha-2 country code (e.g., 'AR', 'ES', 'NG') — compact, standard, enables flag emoji display later

### JSON file structure
- **D-07:** Normalized file structure: `players.json` (player records), `reports.json` (scout reports linked by playerId), `scouts.json` (scout registry) — mirrors future DB tables, clean separation of concerns, easier migration
- **D-08:** Each JSON file stores an array of records with string IDs (UUID v4 or nanoid) — consistent ID format across entities

### Match context fields
- **D-09:** Competition is a free-text field (not an enum) — competitions vary too much across clubs/regions for a fixed set, text search suffices for filtering
- **D-10:** Scout identity uses a registry: `scouts.json` with scout IDs + names — scouts pick their name from a list when submitting, prevents inconsistencies like 'J. Pérez' vs 'Juan Perez'
- **D-11:** Report includes an optional `matchResult` free-text field (e.g., '3-1') — provides context for the division when evaluating performance, not required

### OpenCode's Discretion
- Exact Zod schema implementation details (refinements, transforms)
- ID generation strategy (UUID v4 vs nanoid vs crypto.randomUUID)
- Sample data content and number of records
- File locking strategy for concurrent JSON writes (if needed at this scale)
- Whether to use Zod v4 or v3 syntax (install latest stable)

</decisions>

<specifics>
## Specific Ideas

- Position group + detail mirrors how football scouting platforms categorize (Wyscout uses position groups for filtering, specific positions for detail)
- Scout registry prevents the name inconsistency problem that plagues manual-entry systems at small clubs
- Optional height/weight with explicit units (cm/kg) avoids the imperial/metric confusion common in international scouting

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model requirements
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-05 define the acceptance criteria for this phase
- `.planning/ROADMAP.md` § Phase 1 — Success criteria and scope boundary
- `.planning/PROJECT.md` — Core value, constraints, key decisions

### Architecture references
- `.planning/research/ARCHITECTURE.md` — Data layer interface design, JSON file structure, route architecture, scoring engine types (PlayerScores shape)
- `.planning/research/STACK.md` — Package versions (Zod, React Hook Form), version verification checklist
- `.planning/research/PITFALLS.md` — Pitfall 8 ("Not observed" ≠ 3), Pitfall 7 (scout identity), Pitfall 3 (data entry wall — attribute count matters)
- `.planning/research/SUMMARY.md` — Stack recommendations, architecture approach, JSON file rationale

### Existing codebase
- `app/routes.ts` — Current route configuration (single index route)
- `app/root.tsx` — Root layout with Inter font, error boundary pattern
- `package.json` — Current dependencies (React Router 7.15, React 19, Tailwind 4, Vite 8)
- `tsconfig.json` — Path alias `~/*` → `./app/*`, strict mode enabled
- `react-router.config.ts` — SSR enabled

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- React Router 7 scaffold: `app/root.tsx` provides Layout, Meta, Links, ErrorBoundary — standard pattern to follow for future routes
- Tailwind CSS 4 configured via Vite plugin (`@tailwindcss/vite`) — no PostCSS config needed
- Path alias `~/*` already configured in tsconfig — all new imports under `app/` use `~/`
- SSR enabled in `react-router.config.ts` — data layer functions must work in Node.js server context

### Established Patterns
- Route module pattern: `app/routes/{path}.tsx` with typed `Route` import from `./+types/{name}`
- Framework mode conventions: loaders, actions, meta exports from route modules
- Vite + tsconfig paths: `tsconfigPaths: true` in vite.config.ts enables the `~/` alias

### Integration Points
- `app/data/data.ts` — The data layer interface will be imported by loaders/actions in future phases
- `app/routes.ts` — Will be updated in Phase 2+ to add scout/division route prefixes
- Zod schemas defined in this phase will be shared between client forms (Phase 2) and server actions (Phase 2) — same validation on both sides

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---
*Phase: 01-data-foundation*
*Context gathered: 2026-05-11*
