# Phase 4: Player List & Search - Discussion Log

**Phase:** 04-player-list-search  
**Discussion Date:** 2026-05-14  
**Status:** Complete - Ready for execution

---

## Session Summary

This discussion captured implementation decisions for Phase 4 after UI spec approval and planning completion. The phase boundary was clear from ROADMAP.md, and the UI spec (04-UI-SPEC.md) already locked the visual design contract.

**Key outcome:** 18 implementation decisions captured across route structure, table design, search/filter behavior, and design system compliance.

---

## Decisions Captured

### Route & Component Structure (3 decisions)
- **D-01:** Player list route at `/division/players`
- **D-02:** Component structure: `PlayerList` + `PlayerRow`
- **D-03:** Data fetching via `getPlayers()` from existing data layer

### Table Design (4 decisions)
- **D-04:** 6 columns: Player, Position, Club, Age, Reports, Last Scouted
- **D-05:** Default sort: Last Scouted (newest first)
- **D-06:** Click header toggles: asc → desc → no sort
- **D-07:** Visual indicators: ↑ (asc), ↓ (desc)

### Search & Filter Behavior (5 decisions)
- **D-08:** Search: case-insensitive substring match
- **D-09:** Position filter: All, GK, DEF, MID, FWD
- **D-10:** Club filter: dynamic from data
- **D-11:** AND logic for combining filters
- **D-12:** URL params for bookmarkability

### UI Components (3 decisions)
- **D-13:** shadcn/ui (Radix) primitives
- **D-14:** Lucide React icons
- **D-15:** Empty state messaging

### Design System Compliance (3 decisions)
- **D-16:** Typography scale
- **D-17:** Color system with dark mode
- **D-18:** Table-specific spacing

---

## OpenCode's Discretion

Areas where implementation flexibility was noted:
- Player name links to profile (Phase 5 prep)
- Age calculated from DOB
- "Reports" count display

---

## Deferred Ideas

None — discussion stayed within Phase 4 scope.

---

*Discussion logged: 2026-05-14*  
*Next step: Execute plans via `/gsd-execute-phase 04`*
