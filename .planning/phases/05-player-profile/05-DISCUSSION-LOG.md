# Phase 5: Player Profile - Discussion Log

**Phase:** 05-player-profile  
**Discussion Date:** 2026-05-14  
**Status:** Complete - Ready for planning

---

## Session Summary

Discussion captured implementation decisions for the Player Profile page. The phase boundary was clear from ROADMAP.md: identity info, reports, and score displays in one view.

**Key outcome:** 21 implementation decisions captured across page layout, navigation, report display, identity fields, and data integration.

---

## Gray Areas Discussed

### 1. Page Layout & Sections
**Chosen:** Vertical sections
- Identity card at top, reports section below, score section below that
- Simple, scrollable, works on mobile
- Phase 6 scoring slots in naturally between identity and reports

### 2. Navigation Pattern
**Chosen:** Click player name to navigate
- Player names wrapped in `<Link>` to `/division/players/:id`
- Same tab navigation
- Clean separation from row click interactions

### 3. Report Display Style
**Chosen:** Report cards
- Each report as a card showing match context at top
- Per-category attribute ratings in compact grids
- "Not observed" shown as dash, never 0 or middle value
- Newest first ordering

### 4. Identity Fields to Show
**Chosen:** All fields
- Name, DOB + age, position (group + specific), club, nationality with flag emoji
- Preferred foot, height (cm), weight (kg)
- Styled as a card at the top

---

## OpenCode's Discretion

- Score display shows placeholder text ("Scoring coming in Phase 6") with layout ready for Phase 6
- Empty profile state: identity card + "No reports yet" message with link to scout area
- 404 handling: "Player not found" with link back to list
- Exact card styling, date format, flag emoji rendering
- Mobile breakpoint behavior

---

## Deferred Ideas

None — discussion stayed within Phase 5 scope.

---

*Discussion logged: 2026-05-14*  
*Next step: Plan Phase 5 via `/gsd-plan-phase 5`*
