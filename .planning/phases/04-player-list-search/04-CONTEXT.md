# Phase 4: Player List & Search - Context

**Gathered:** 2026-05-14  
**Status:** Ready for execution

<domain>
## Phase Boundary

Division members can find and identify players of interest from a browsable, searchable list. This phase delivers a player list view at `/division/players` with sortable columns, search by name, and filters for position and club.

**In scope:**
- Player list route and table component
- Sort by any column (ascending/descending)
- Search by player name (case-insensitive substring match)
- Filter by position (GK, DEF, MID, FWD)
- Filter by club (dynamic from data)
- URL params for sort/search/filter state (bookmarkable)
- Empty state handling

**Out of scope:**
- Player profile pages (Phase 5)
- Scoring calculations (Phase 6-7)
- Comparison view (Phase 8)
- Advanced filters beyond position/club

</domain>

<decisions>
## Implementation Decisions

### Route & Component Structure
- **D-01:** Player list route at `/division/players` following the `/division/*` route prefix pattern
- **D-02:** Component structure: `PlayerList` (main container) + `PlayerRow` (individual row)
- **D-03:** Data fetching via `getPlayers()` from `app/data/data.ts` (existing async interface)

### Table Design
- **D-04:** 6 columns: Player, Position, Club, Age, Reports, Last Scouted
- **D-05:** Default sort: Last Scouted (newest first)
- **D-06:** Click header to toggle sort: ascending → descending → no sort
- **D-07:** Visual sort indicators: ↑ (asc), ↓ (desc)

### Search & Filter Behavior
- **D-08:** Search: case-insensitive substring match on player name
- **D-09:** Position filter: dropdown with All, GK, DEF, MID, FWD
- **D-10:** Club filter: dynamic dropdown from available clubs in data
- **D-11:** Filters combine with AND logic
- **D-12:** State persisted in URL search params for bookmarkability

### UI Components
- **D-13:** Use shadcn/ui (Radix primitives): Button, Input, Label, Card, Badge, DropdownMenu, Select, Table
- **D-14:** Icons from Lucide React: Search, Filter, SortAsc, SortDesc, ChevronDown
- **D-15:** Empty state: "No players found" with guidance to adjust filters

### Design System Compliance
- **D-16:** Typography: `text-sm` (14px) for cells, `text-lg` (20px) for headings
- **D-17:** Color: `bg-blue-600` for primary actions, dark mode support via `dark:` variants
- **D-18:** Spacing: Table row padding `py-3` (12px), cell gap `gap-4` (16px)

### OpenCode's Discretion
- Player name in table links to profile (Phase 5) - preparation for next phase
- Age calculated from DOB for display convenience
- "Reports" count shows number of scout reports per player

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Route & Data
- `app/routes/division/players.tsx` — Player list route with loader
- `app/data/data.ts` — `getPlayers()` function for data fetching
- `app/data/types.ts` — Player entity schema (from Phase 1)

### UI Components
- `app/components/player-list.tsx` — Main player list component (new)
- `app/components/player-row.tsx` — Individual player row component (new)

### Design Contract
- `.planning/phases/04-player-list-search/04-UI-SPEC.md` — UI design contract with all 6 dimensions approved

### Requirements
- `.planning/ROADMAP.md` — Phase 4 success criteria (BROWSE-01, BROWSE-02)
- `.planning/REQUIREMENTS.md` — BROWSE-01, BROWSE-02 requirement definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`ReportsTable` component** (`app/components/reports-table.tsx`): Table pattern for scout reports — can adapt structure for player list
- **`scout-report-form.tsx`**: Form validation patterns with Zod schemas
- **`data.ts`**: Async interface pattern (`getPlayers`, `getReportsByScout`, etc.) ready for player list
- **React Router 7 patterns**: Existing routes use loaders/actions (framework mode)

### Established Patterns
- **Server-first data fetching**: All routes use loaders, not client-side state
- **URL search params**: Used for state management (seen in Phase 3 scout dropdown)
- **TypeScript + Zod**: Type-safe data layer with runtime validation
- **Dark mode support**: All components support `dark:` variants

### Integration Points
- Player list route connects to existing `getPlayers()` from data layer
- Uses same design system (Tailwind + shadcn/ui) as Phase 2-3 components
- Will feed into Phase 5 player profile (click-through from table row)

</code_context>

<specifics>
## Specific Ideas

- Sort indicators should be immediately visible (↑/↓ icons in headers)
- Search input should have focus ring (`focus:ring-2 focus:ring-blue-500`)
- Empty state should be encouraging, not alarming ("Players will appear here once scouts start submitting reports.")
- Position badges match the attribute categories from scout form (physical, technical, tactical)

</specifics>

<deferred>
## Deferred Ideas

None — all discussion stayed within Phase 4 scope (player list, search, filters).

### Reviewed Todos (not folded)
None.

</deferred>

---

*Phase: 4-Player List & Search*  
*Context gathered: 2026-05-14*
