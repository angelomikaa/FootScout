# Roadmap: FootScout

## Overview

FootScout's roadmap flows from data foundation to data entry to data consumption. The scoring engine — the core differentiator — is built in two deliberate steps: simple average + radar first (so profiles are immediately visual), then ponderated weights + breakdown (so the differentiator ships with transparency baked in). Comparison comes last because it depends on both radar charts and weight configuration being ready. Every phase delivers a coherent, verifiable capability that a scout or division member can actually use.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Data Foundation** - Player/report entities, JSON data layer, Zod schemas with nullable ratings
- [x] **Phase 2: Scout Report Form** - Staged entry form (physical → technical → tactical → notes) with new-player creation
- [x] **Phase 3: Draft & Report Management** - Draft persistence, "my reports" view for scouts
- [x] **Phase 4: Player List & Search** - Sortable, filterable, searchable player list for division
- [ ] **Phase 5: Player Profile** - Detailed profile page with identity info, report history, and score displays
- [x] **Phase 6: Simple Scoring & Radar** - Simple average calculation across reports, radar chart visualization
- [x] **Phase 7: Ponderated Scoring & Breakdown** - Weight controls, ponderated average, transparent score breakdown with deltas
- [ ] **Phase 8: Player Comparison** - Side-by-side comparison with radar overlay respecting active weights

## Phase Details

### Phase 1: Data Foundation
**Goal**: Player and report data can be stored, retrieved, and validated through a typed async interface
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
1. A player entity can be created with name, date of birth, position, club, and nationality, and retrieved by ID
2. A scout report can be created linked to a player with match context (date, opponent, competition, scout name) and retrieved as part of that player's data
3. Report attributes are organized into physical, technical, and tactical categories, each rated 1-5 or explicitly "not observed" (null) — the system never treats null as 3
4. Match notes are captured as a free-text field per report and persisted correctly
**Plans**: 1 plan
- [ ] 01-01-PLAN.md — Define Zod schemas/types + async JSON data layer with sample data

### Phase 2: Scout Report Form
**Goal**: Scouts can enter detailed player observations through a staged form that prevents data entry fatigue
**Depends on**: Phase 1
**Requirements**: SCOUT-01, SCOUT-02
**Success Criteria** (what must be TRUE):
1. Scout can create a new player entry (name, DOB, position, club, nationality) within the report submission flow when the player doesn't already exist
2. Scout submits a report through staged steps: physical attributes → technical attributes → tactical attributes → match notes, with each step presenting only its category
3. "Not observed" is available as an explicit option for each attribute rating — the scout never has to guess or default to a middle value
**UI hint**: yes
**Plans**: 3 plans
- [x] 02-01-PLAN.md — Install packages, route skeleton, form validation schema
- [x] 02-02-PLAN.md — Build UI components (AttributeRatingRow, StepIndicator, PlayerCombobox, NewPlayerFields)
- [x] 02-03-PLAN.md — Form orchestrator, RHF→RR action bridge, end-to-end verification

### Phase 3: Draft & Report Management
**Goal**: Scouts can manage their report workflow — saving in-progress work and reviewing past submissions
**Depends on**: Phase 2
**Requirements**: SCOUT-03, SCOUT-04
**Success Criteria** (what must be TRUE):
1. Scout can save a partially completed report as a draft and resume it later, with all previously entered values preserved
2. Scout can view a list of all their own submitted reports, seeing player name, match date, and opponent at a glance
**UI hint**: yes
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Add draft schema fields, cookie utilities, and draft-aware data functions
- [ ] 03-02-PLAN.md — Implement draft resume, auto-save, and draft banner in form
- [ ] 03-03-PLAN.md — Create "My Reports" table view with scout filtering

### Phase 4: Player List & Search
**Goal**: Division members can find and identify players of interest from a browsable, searchable list
**Depends on**: Phase 1
**Requirements**: BROWSE-01, BROWSE-02
**Success Criteria** (what must be TRUE):
1. Division member views a list of all players showing key identity fields, sortable by any column
2. Division member filters the player list by position and club, and searches by player name
**UI hint**: yes
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Create player list route and sortable table
- [ ] 04-02-PLAN.md — Add search by name and filter by position/club

### Phase 5: Player Profile
**Goal**: Division members can drill into a player's full scouting picture — identity, reports, and scores in one view
**Depends on**: Phase 4
**Requirements**: BROWSE-03, BROWSE-04
**Success Criteria** (what must be TRUE):
1. Division member clicks a player from the list and lands on a detailed profile page showing identity info, all scout reports, and score displays
2. Profile page shows each scout report with match context (date, opponent, competition, scout name) so the division can contextualize the observations
**UI hint**: yes
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Create profile route, IdentityCard, ReportCard, AttributeGrid, ScorePlaceholder components
- [x] 05-02-PLAN.md — Wire player list with clickable Links, real report counts, and last scouted dates

### Phase 6: Simple Scoring & Radar
**Goal**: Player profiles show visual score profiles based on simple averages across all scout reports
**Depends on**: Phase 5
**Requirements**: SCORE-01, SCORE-02
**Success Criteria** (what must be TRUE):
1. System calculates a simple average per attribute across all scout reports for a player, correctly excluding "not observed" (null) ratings from the denominator
2. Player profile displays a radar chart with attribute scores on labeled axes, giving an immediate visual shape of the player's strengths and gaps
**UI hint**: yes

### Phase 7: Ponderated Scoring & Breakdown
**Goal**: Division members can shift scoring weights to match what they're looking for, and see exactly why the weighted score differs from the simple average
**Depends on**: Phase 6
**Requirements**: SCORE-03, SCORE-04, SCORE-05
**Success Criteria** (what must be TRUE):
1. Division member selects a preferential skill/attribute and the system recalculates the player's overall score with that attribute weighted higher
2. Player profile shows both the simple average and the ponderated average side by side, so the user sees how weighting shifts the number
3. A score breakdown displays per-attribute deltas explaining exactly why the ponderated score differs from the simple average — the user never sees a weighted number without understanding its derivation
**UI hint**: yes
**Plans**: 2 plans

Plans:
- [ ] 07-01-PLAN.md — Ponderated scoring engine + weight toggle UI + URL param persistence
- [ ] 07-02-PLAN.md — Score breakdown accordion + radar overlay + player list weighted sorting

### Phase 8: Player Comparison
**Goal**: Division members can compare two players side by side to make relative evaluations for signing or tracking decisions
**Depends on**: Phase 7
**Requirements**: COMP-01, COMP-02, COMP-03
**Success Criteria** (what must be TRUE):
1. Division member selects two players from the list and sees them in a side-by-side comparison view
2. Comparison overlays both players' radar charts so visual shape differences are immediately apparent
3. Comparison respects the active weight configuration — if ponderated scoring is on, both players' radar charts and scores reflect the same weight adjustments
**UI hint**: yes
**Plans**: 2 plans

Plans:
- [ ] 08-01-PLAN.md — Comparison route with dual radar overlay + delta table + weight-aware scoring
- [ ] 08-02-PLAN.md — Player list compare buttons + URL selection state + floating bar

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 1/1 | Complete | 2026-05-12 |
| 2. Scout Report Form | 3/3 | Complete | 2026-05-13 |
| 3. Draft & Report Management | 3/3 | Complete | 2026-05-13 |
| 4. Player List & Search | 2/2 | Complete | 2026-05-14 |
| 5. Player Profile | 2/2 | Complete | 2026-05-14 |
| 6. Simple Scoring & Radar | 2/2 | Complete | 2026-05-15 |
| 7. Ponderated Scoring & Breakdown | 2/2 | Complete | 2026-05-15 |
| 8. Player Comparison | 0/TBD | Not started | - |
