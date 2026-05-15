# Phase 5: Player Profile - Context

**Gathered:** 2026-05-14  
**Status:** Ready for planning

<domain>
## Phase Boundary

Division members can drill into a player's full scouting picture — identity, reports, and scores in one view. A click from the player list navigates to a detailed profile page showing identity info, all scout reports with match context, and future scoring displays.

**In scope:**
- Player profile route at `/division/players/:id`
- Identity information card with all player fields
- Scout reports displayed as cards with attribute grids
- Report count and last scouted date wired to real data in player list
- Empty state for players with no reports
- Clickable player names in list linking to profile

**Out of scope:**
- Scoring calculations / radar charts (Phase 6-7)
- Comparison view (Phase 8)
- Score breakdown or ponderated averages (Phase 7)
- Editing player info (Phase 1 scope only)

</domain>

<decisions>
## Implementation Decisions

### Page Layout & Sections
- **D-01:** Vertical sections layout: identity card at top, reports section below, score section placeholder below that
- **D-02:** Score section shows a simple placeholder ("Scoring coming in Phase 6") with layout ready for Phase 6 to fill in
- **D-03:** Sections separated by clear visual breaks, responsive to mobile

### Navigation Pattern
- **D-04:** Click player name (not entire row) to navigate to `/division/players/:id`
- **D-05:** Navigation opens in same tab using React Router `<Link>` component
- **D-06:** Player names in the `PlayerList` component wrapped in `<Link>` to the profile route

### Report Display Style
- **D-07:** Reports displayed as cards (one per report), not a table
- **D-08:** Each card shows match context at top: date, opponent, competition, scout name
- **D-09:** Below match context: attribute ratings organized by category (physical, technical, tactical, match notes) in compact grids
- **D-10:** "Not observed" (null) attributes shown as a dash or "—" — never displayed as 0 or a middle value
- **D-11:** Cards ordered newest first by default

### Identity Fields to Show
- **D-12:** All identity fields displayed: name, date of birth + age, position (group + specific), club, nationality (text + flag emoji), preferred foot, height (cm), weight (kg)
- **D-13:** Identity section styled as a card at the top of the profile page
- **D-14:** Nationality displayed as ISO code with flag emoji inline (e.g., "🇦🇷 AR")

### Score Display in Phase 5
- **D-15:** Phase 5 shows a placeholder section titled "Player Scores" with a message: "Scoring and radar charts coming in Phase 6"
- **D-16:** Section layout structured to accept the Phase 6 scoring component (container with ID, spacing reserved)

### Empty Profile State
- **D-17:** Player with no reports shows identity card + empty state: "No reports yet for this player" with a note that scouts can submit reports via the Scout Area
- **D-18:** Empty state includes a link back to `/division/players` to continue browsing

### Data Integration
- **D-19:** Route loader fetches player by ID via `getPlayerById()` and reports via `getReportsByPlayer()`
- **D-20:** Player list route (`/division/players`) updated to pass real report count and last scouted date from profile data
- **D-21:** 404 handling: unknown player ID shows "Player not found" with link back to player list

### OpenCode's Discretion
- Exact card styling and attribute grid layout
- Date format display (locale-specific)
- Flag emoji rendering approach
- Mobile breakpoint behavior for identity card vs sidebar layout
- Animation/transition details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Route & Data
- `app/routes/division/players.tsx` — Existing player list route (needs link wiring)
- `app/components/player-list.tsx` — Player list component (needs Link wrapper on names)
- `app/data/data.ts` — `getPlayerById()`, `getReportsByPlayer()` functions
- `app/data/types.ts` — Player, Report, and attribute schemas

### UI Components
- `app/components/reports-table.tsx` — Existing report table pattern (report cards will be new but can reference structure)
- `app/components/player-list.tsx` — Existing player list (will be modified for links)
- `app/routes/division/players.tsx` — Will be modified to pass report counts

### Requirements
- `.planning/ROADMAP.md` § Phase 5 — Success criteria (BROWSE-03, BROWSE-04)
- `.planning/REQUIREMENTS.md` — BROWSE-03, BROWSE-04 requirement definitions

### Design System
- `.planning/phases/04-player-list-search/04-UI-SPEC.md` — Design contract (typography, colors, spacing)
- `app/components/home.tsx` — Home page navigation (links to player profile already stubbed)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`getPlayerById()`** (`app/data/data.ts:29`): Already exists, returns `Player | null`
- **`getReportsByPlayer()`** (`app/data/data.ts:74`): Already exists, returns `Report[]`
- **`PlayerList`** (`app/components/player-list.tsx`): Report count and last scouted are stubs (TODO Phase 5)
- **`ReportsTable`** (`app/components/reports-table.tsx`): Reference pattern for report data display
- **`home.tsx`** (`app/routes/home.tsx`): Already has "Player Profile — Coming in Phase 5" stub

### Established Patterns
- **Route with params**: `/division/players/:id` follows React Router v7 param pattern
- **Loader + useLoaderData**: Standard data fetching pattern across all routes
- **URL search params**: Used in Phase 3-4 for filter/sort state
- **Card layout**: Used in home page for navigation sections, adaptable for report cards

### Integration Points
- Player list player name cell → wrap in `<Link to={/division/players/${id}}>` (Phase 4 file)
- Route data fetching → `getPlayerById()` + `getReportsByPlayer()` in loader
- Report cards → New component `app/components/report-card.tsx` or inline in profile route
- Profile route → New file `app/routes/division/players.$id.tsx` (React Router v7 param file convention)

</code_context>

<specifics>
## Specific Ideas

- Report cards should make attribute ratings scannable at a glance — category headers with compact 2x2 grids
- Flag emojis for nationality can be derived directly from ISO code (e.g., "AR" → "🇦🇷")
- Age should show as "15 years old" rather than just a number
- "Not observed" attributes should be visually distinct (gray dash) so the division knows the scout didn't rate it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 5 scope.

### Reviewed Todos (not folded)
None.

</deferred>

---

*Phase: 5-Player Profile*  
*Context gathered: 2026-05-14*