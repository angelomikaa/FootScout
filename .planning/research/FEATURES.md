# Feature Landscape

**Domain:** Soccer scouting dashboard (U15 youth prospect tracking)
**Researched:** 2026-05-11

## Platform Survey

Features were extracted from analysis of the following football scouting platforms:

| Platform | Segment | Price Range | Relevance to FootScout |
|----------|---------|-------------|----------------------|
| **Wyscout** (Hudl) | Pro-tier video + data database | Enterprise (high) | HIGH — industry standard, most feature-complete |
| **StatsBomb** (Hudl) | Advanced analytics + data | Enterprise (high) | MEDIUM — data-driven, but event-data focus vs. subjective reports |
| **InStat** (Hudl) | Video + data analysis | Enterprise | MEDIUM — match analysis focus, less scout-entry |
| **SciSports** | AI-driven scouting + youth academies | Mid-tier | HIGH — explicitly serves youth academies, has player profiling |
| **SkillCorner** | AI physical/tracking data | Enterprise | LOW — tracking data focus, no scout-entry workflows |
| **Football Manager** | Simulation/game | Consumer | LOW — but its Scouting Centre UI is a cultural reference point |

**Key insight:** No major platform focuses on *manual scout-entry with weighted scoring*. They all ingest automated event/tracking data. FootScout's niche — subjective scout observations turned into structured, weighted profiles — is genuinely underserved.

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Player profile page** | Every scouting tool shows player details; a dashboard without drill-down is just a list | Med | Basic info + scores + notes. Radar chart is the universal visual language of scouting (Wyscout, StatsBomb, SciSports all use them) |
| **Scout report form** | Data entry is the core input mechanism; without it there's no data | Med | Must capture physical, technical, tactical, and match notes. 1-5 scale per attribute is industry-standard (FM, Wyscout templates, SciSports profiles) |
| **Player list/grid view** | Browsing is the primary discovery action; every platform starts here | Low | Sortable, filterable list. Wyscout calls this "player lists", SciSports "player database", StatsBomb "player search" |
| **Score visualization (radar charts)** | Radar charts are the lingua franca of football scouting — seen in every major platform's marketing | Med | Non-negotiable. StatsBomb built their brand on "iconic radars". SciSports, Wyscout, SkillCorner all feature them prominently |
| **Basic search/filter** | Scouts need to find players by name, position, club — this is the minimum viable browse | Low | Name search + position filter. Even the simplest tools have this |
| **Multiple scout reports per player** | Reduces individual bias; stated project requirement. SciSports and Wyscout both aggregate multiple sources | Med | Must show who submitted each report and how averaged scores are derived |
| **Simple average display** | Users need to see the unweighted baseline before weighted views change things | Low | Standard arithmetic mean of all scout ratings per attribute |
| **Player comparison (side-by-side)** | Wyscout, StatsBomb, SciSports all offer this. Recruitment is fundamentally comparative | Med | At minimum, overlay two radar charts. StatsBomb's comparison tables are a key selling point |
| **Watchlist / shortlist** | Every platform has this. Wyscout: "shadow teams" / "player lists". SciSports: "flagging and shortlisting". StatsBomb: "shortlists" | Low | Save players to a named list for later review. Essential for the "track over time" workflow |
| **Match context on reports** | Scouts record when/where they saw a player — match, date, competition. Without this, reports are unanchored | Low | Match date, opponent, competition, scout name. Metadata, not a feature, but must be there |

## Differentiators

Features that set the product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Ponderated (weighted) scoring engine** | THE core differentiator. No major platform offers configurable per-search weight shifting. Wyscout/StatsBomb have fixed metric weights. SciSports has "position profiles" but they're pre-baked. Custom weights per search is novel | Med | This is what makes FootScout unique. "Who's the best finisher?" gets a different answer than "Who's the best all-round forward?" — same data, different weights |
| **Weight transparency / score breakdown** | Showing WHY a weighted score differs from the simple average. No platform does this explicitly. StatsBomb radars show metrics but don't explain the delta between weighted vs unweighted | Med | Visual: show per-attribute [simple avg → weighted avg] with arrows/bars indicating which attributes moved and by how much. This makes the weighted engine *legible* |
| **Sign/Track decision markers** | Project-specific: the dual workflow of "sign now" vs "keep monitoring" is unique to roster-building at youth level. Pro tools focus on transfer value, not development pipeline decisions | Low | Flag players as "Sign", "Monitor", "Pass". Simple but powerful for division-level workflow |
| **Position-adaptive weight presets** | While the project says "no templates", offering *suggested starting weights* by position (striker weights finishing, midfielder weights passing) that the division can then customize is a UX win over starting from zero | Med | Don't lock them — offer as defaults. FM uses this approach (scout assignments with position-based criteria). SciSports has "translate position profiles into customized KPI search queries" |
| **Scout consistency indicator** | When multiple scouts report on the same player, showing variance/disagreement between scouts. No platform surfaces this well — they just average it away | Med | Flag when scouts disagree >1 point on an attribute. This is actionable: "Two scouts disagree on this player's tackling — send someone else to look" |
| **Development timeline (track over time)** | Youth scouting is longitudinal. SciSports benchmarks "over time" but most tools focus on current-snapshot. Showing score evolution across reports is valuable for U15 where development curves matter | Med | Plot attribute scores across report dates. Simple line chart per attribute over time. This is different from pro platforms where the question is "can they play now?" not "are they improving?" |
| **Exportable PDF scouting report** | Every pro platform generates reports. SciSports: "benchmarking and clear PDF reports". Wyscout: "reports on competitions, matches, teams and players". For board meetings and signing decisions | Med | One-page player summary: info, radar chart, scores, notes, recommendation. Standard output format |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Video integration / clip tagging** | This is Wyscout and InStat's entire value proposition — massive infrastructure (camera systems, video processing, clip libraries). Building this would consume the entire project budget and still be inferior. The project brief says "manual entry only" | Link to external video if needed; let scouts paste a URL in their match notes. Don't build video infrastructure |
| **Automated event data ingestion** | StatsBomb and SkillCorner's business model. Requires data partnerships, API contracts, and data-quality pipelines. Completely different product | Stay with manual scout entry. This is the intentional constraint that makes FootScout focused |
| **Transfer value estimation / market pricing** | SciSports' "Estimated Transfer Value". Requires proprietary models, market data, and constant updates. Not relevant for U15 youth where transfers are often free or development-fee based | Omit entirely. Not the division's concern at youth level |
| **xG / advanced analytics models** | StatsBomb's core IP (xG, OBV, HOPS). Requires event-level data collection that FootScout doesn't have. These models need shot location, goalkeeper position, etc. — data FootScout will never collect | The 1-5 subjective rating IS the data model. Don't try to replicate analytics that require different data |
| **Physical tracking data (GPS/speed)** | SkillCorner's domain. Requires wearable hardware or computer vision pipelines. Completely different infrastructure | Include "pace" and "endurance" as subjective 1-5 ratings in the physical category. Scouts rate what they see |
| **Multi-club / multi-organization access** | Pro platforms sell to many clubs. FootScout is a single-division tool. Building multi-tenancy adds enormous complexity for zero v1 value | Single organization, two roles (scout + division). No multi-tenant architecture needed |
| **Player self-registration / public profiles** | Scouting4U (basketball) and SciSports offer this. It's a marketplace feature. FootScout is an internal tool, not a marketplace | Scouts create player entries when they first report on a player. No public-facing side |
| **AI-generated scouting reports** | Scouting4U and emerging tools offer AI summaries. For a subjective-entry tool, this would be generating AI summaries of AI summaries — circular and low-value | Keep reports as raw scout observations. The weighted scoring engine is the "intelligence layer" — that's enough |
| **Match/tactical analysis module** | InStat and StatsBomb's territory. Requires event data, tactical boards, formation visualizers. Not what scouts do at youth level — they evaluate individuals, not team tactics | Match notes as free-text field. Scouts write what they observed; that's the tactical input |

## Feature Dependencies

```
Scout report form → Player profile page (profile needs report data)
Scout report form → Simple average display (averages need reports)
Scout report form → Multiple scout aggregation (aggregation needs multiple reports)
Player list/grid → Player profile page (list links to profiles)
Player profile page → Score visualization / radar charts (profile shows charts)
Player profile page → Ponderated scoring engine (engine powers profile scores)
Simple average display → Ponderated scoring engine (weighted score shown relative to simple avg)
Simple average display → Weight transparency / score breakdown (breakdown explains delta)
Ponderated scoring engine → Weight transparency / score breakdown (breakdown visualizes engine output)
Ponderated scoring engine → Position-adaptive weight presets (presets seed the engine)
Player profile page → Player comparison (comparison overlays profiles)
Player list/grid → Watchlist / shortlist (list feeds shortlist)
Watchlist / shortlist → Sign/Track decision markers (markers live on shortlisted players)
Multiple scout reports → Scout consistency indicator (consistency measures report variance)
Multiple scout reports → Development timeline (timeline plots reports over time)
Scout report form → Match context on reports (context is report metadata)
Player profile page → Exportable PDF scouting report (report summarizes profile)
```

### Critical Path (must-build sequence)

```
1. Scout report form (data input)
2. Player profile page (data display)
3. Player list/grid view (browsing)
4. Basic search/filter (finding)
5. Score visualization / radar charts (visual language)
6. Simple average display (baseline scoring)
7. Multiple scout aggregation (multi-scout)
8. Match context on reports (report anchoring)
9. Watchlist / shortlist (tracking workflow)
→ This sequence gives a complete scouting tool
```

### Differentiator Path (build after table stakes)

```
10. Ponderated scoring engine (THE differentiator)
11. Weight transparency / score breakdown (makes engine legible)
12. Player comparison (comparative recruitment)
13. Sign/Track decision markers (roster decision workflow)
14. Position-adaptive weight presets (UX improvement on engine)
15. Scout consistency indicator (multi-scout intelligence)
16. Development timeline (longitudinal tracking)
17. Exportable PDF scouting report (board-ready output)
```

## MVP Recommendation

**Prioritize (Phase 1):**
1. Scout report form — the data input, without which nothing else exists
2. Player profile page with radar charts — the visual output, immediately recognizable to scouts
3. Player list with search/filter — browsing is how users start every session
4. Simple average + multiple scout aggregation — the baseline scoring model
5. Watchlist — the tracking workflow that keeps users coming back

**Defer to Phase 2:**
- Ponderated scoring engine + weight transparency — the differentiator, but needs the baseline scoring working first for users to see the contrast
- Player comparison — high value but depends on having enough player profiles to compare

**Defer to Phase 3:**
- Sign/Track markers, development timeline, PDF export — workflow refinements
- Position-adaptive weight presets, scout consistency indicator — polish features

## Gap Analysis: What FootScout Does That Platforms Don't

| FootScout Feature | Platform Equivalent | FootScout Advantage |
|-------------------|--------------------|--------------------|
| Configurable per-search weighted scoring | Fixed metric weights (StatsBomb), pre-set position profiles (SciSports) | Scouting divisions can ask different questions of the same data and get different, meaningful answers |
| Weight transparency (show why weighted ≠ simple) | No platform explicitly surfaces this | Makes the scoring engine trustworthy; users understand *why* a player ranks differently under different searches |
| Manual subjective entry as primary data source | All platforms use automated event/tracking data as primary | Captures what automated data can't: intangibles, attitude, tactical intelligence, off-ball movement, coachability — things scouts actually evaluate at U15 |
| Scout variance/disagreement flagging | Platforms average away disagreement | Turns inter-scout conflict into actionable intelligence: "go look again" |
| Sign vs. Track dual workflow | Transfer valuation models (irrelevant at U15) | Matches how youth divisions actually make decisions: immediate need vs. development pipeline |

## Sources

- **Wyscout / Hudl** — Official product pages (wyscout.com, hudl.com/en_gb/products/wyscout). Features: video+data database, scouting area with report templates, advanced search, player lists, shadow teams, youth competitions (U14-U23, 190+ competitions, 75K+ players). Confidence: HIGH (official documentation)
- **StatsBomb / Hudl** — Official product pages (hudl.com/en_gb/products/statsbomb). Features: 3400+ events/match, xG model, OBV, HOPS, customizable radars, comparison tables, template saving, 170+ leagues, video integration, shortlists. Confidence: HIGH (official documentation)
- **InStat / Hudl** — Referenced on Hudl product pages. Video and data solution for analysis and scouting. Confidence: MEDIUM (indirect, less detailed)
- **SciSports** — Official product pages (scisports.com/scouting, scisports.com/youth-academies, scisports.com/player-profiles). Features: 225K+ player database, flagging/shortlisting, position-specific KPI queries, estimated transfer value, youth academy profiling, IDPs (Individual Development Plans), data-driven video profiles, feedback cycles, private profiles, benchmarking over time, PDF reports. Confidence: HIGH (official documentation, most relevant competitor)
- **SkillCorner** — Official product pages (skillcorner.com). Features: AI-driven physical/tracking data, 120+ leagues, position-specific athlete profiling, segmented in/out-of-possession analysis. Confidence: HIGH (official documentation) — but low relevance to FootScout's manual-entry approach
- **Scouting4U** — Official product pages (scouting4u.com). Basketball-focused, not football, but relevant for feature patterns: AI scouting reports, shot charts, player database, proprietary metrics (VAL, OER, VIR, S-VALUE), opponent breakdowns, player profile builder. Confidence: MEDIUM (cross-sport reference only)
- **Scoutpad** — No accessible website found. Likely defunct or rebranded. Confidence: LOW — excluded from analysis
- **Football Manager** — Cultural reference point for scouting UI patterns (scouting center, assignment system, report cards). Not a direct competitor. Confidence: MEDIUM (game UI, not professional tool)
