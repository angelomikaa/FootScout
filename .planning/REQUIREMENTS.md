# Requirements: FootScout

**Defined:** 2026-05-11
**Core Value:** The weighted scoring engine — ponderated averages from 1 to 5 that shift based on what the division is looking for, with transparent breakdowns showing why a player's score rises or falls under specific search parameters.

## v1 Requirements

### Data Model

- [ ] **DATA-01**: Player entity with identity fields (name, date of birth, position, club, nationality)
- [ ] **DATA-02**: Scout report entity linked to player with match context (date, opponent, competition, scout name)
- [ ] **DATA-03**: Report contains 4 attribute categories: physical, technical, tactical, match notes
- [ ] **DATA-04**: Each attribute rated on 1-5 scale with optional "not observed" (null) to prevent lazy 3s
- [ ] **DATA-05**: Match notes captured as free-text field per report

### Scout Entry

- [ ] **SCOUT-01**: Scout can create a new player entry when submitting first report
- [ ] **SCOUT-02**: Scout can submit a report with staged form (physical → technical → tactical → notes)
- [x] **SCOUT-03**: Scout can save report as draft and resume later
- [x] **SCOUT-04**: Scout can view list of their own submitted reports

### Player Browsing

- [ ] **BROWSE-01**: Division can view sortable, filterable player list
- [ ] **BROWSE-02**: Division can search players by name, position, and club
- [x] **BROWSE-03**: Division can click from player list into detailed player profile
- [ ] **BROWSE-04**: Player profile displays identity info, all reports, and visual scores (partial: identity + reports built, scores placeholder pending Phase 6)

### Scoring & Visualization

- [ ] **SCORE-01**: System calculates simple average per attribute across all scout reports for a player
- [ ] **SCORE-02**: Player profile displays radar chart of attribute scores
- [ ] **SCORE-03**: Division can select a preferential skill/attribute to activate ponderated scoring
- [ ] **SCORE-04**: Ponderated average re-weights the selected attribute higher, showing how the overall score shifts
- [ ] **SCORE-05**: Score breakdown shows simple average, ponderated average, and per-attribute delta explaining why the ponderated score differs

### Comparison

- [ ] **COMP-01**: Division can select two players for side-by-side comparison
- [ ] **COMP-02**: Comparison overlays radar charts of both players
- [ ] **COMP-03**: Comparison respects active weight configuration (ponderated scores apply to both players)

## v2 Requirements

### Decision Workflow

- **DEC-01**: Division can flag players as Sign, Monitor, or Pass
- **DEC-02**: Division can save players to named watchlists/shortlists

### Multi-Scout Intelligence

- **AGGR-01**: Scout consistency indicator showing variance when scouts disagree (>1 point delta)
- **AGGR-02**: Individual scout reports viewable separately within player profile

### Longitudinal Tracking

- **TIME-01**: Development timeline showing score evolution across reports over time
- **TIME-02**: Visual freshness indicators flagging reports older than 3 months

### Position Intelligence

- **POS-01**: Position-adaptive weight presets (suggested starting weights by position, customizable)

### Export

- **EXP-01**: Exportable PDF scouting report (one-page player summary)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video integration / clip tagging | Massive infrastructure; manual entry is the intentional constraint |
| Automated event data ingestion | Completely different product model; FootScout is subjective-entry |
| Transfer value estimation | Not relevant for U15 youth where transfers are often free |
| xG / advanced analytics models | Requires event-level data FootScout doesn't collect |
| Physical tracking data (GPS/speed) | Requires hardware; scouts rate what they see subjectively |
| Multi-club / multi-organization access | Single-division internal tool; no multi-tenancy needed |
| Player self-registration / public profiles | Internal tool only; scouts create player entries |
| AI-generated scouting reports | Circular for a subjective-entry tool; scoring engine is the intelligence layer |
| Biometric maturation analysis | Deferred — important but not v1 |
| Club management / director access | Two roles only for v1: scouts and division |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| SCOUT-01 | Phase 2 | Pending |
| SCOUT-02 | Phase 2 | Pending |
| SCOUT-03 | Phase 3 | Complete |
| SCOUT-04 | Phase 3 | Complete |
| BROWSE-01 | Phase 4 | Pending |
| BROWSE-02 | Phase 4 | Pending |
| BROWSE-03 | Phase 5 | Complete |
| BROWSE-04 | Phase 5 | Pending |
| SCORE-01 | Phase 6 | Pending |
| SCORE-02 | Phase 6 | Pending |
| SCORE-03 | Phase 7 | Pending |
| SCORE-04 | Phase 7 | Pending |
| SCORE-05 | Phase 7 | Pending |
| COMP-01 | Phase 8 | Pending |
| COMP-02 | Phase 8 | Pending |
| COMP-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-11*
*Last updated: 2026-05-11 after initial definition*
