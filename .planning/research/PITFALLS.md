# Domain Pitfalls

**Domain:** Soccer scouting dashboard — U15 youth prospect tracking with weighted scoring
**Researched:** 2026-05-11

---

## Critical Pitfalls

Mistakes that cause rewrites, user abandonment, or fundamentally broken trust in the system.

---

### Pitfall 1: The Opaque Black-Box Score

**What goes wrong:** The weighted scoring engine produces a single number (e.g., "3.7") without showing how it was computed. Users see a score change when weights shift but cannot trace why. They stop trusting the system — "Is this number right? I'll just use my gut." The entire differentiator of the product becomes a liability.

**Why it happens:** Developers treat the scoring engine as a pure math problem — `score = Σ(weight_i × rating_i) / Σ(weight_i)` — and assume the output speaks for itself. The formula is trivially simple from an engineering perspective, so no one invests effort in explaining it. But the *business logic* is subtle: why does finishing weight 2x in a striker search but 0.5x in a midfielder search? That's domain expertise, not code, and it needs to be visible.

**Consequences:**
- Division users ignore weighted scores and fall back to raw averages (defeating the product's core value)
- Scouts feel their detailed input is "lost" in an inscrutable formula
- Any scoring anomaly (even correct) is treated as a bug, generating false bug reports
- The product becomes interchangeable with a spreadsheet

**Prevention:**
- Every displayed weighted score must have a **breakdown affordance** — a click/tap that reveals "simple avg: 3.2 → weighted: 3.7, driven by +0.8 finishing (weight 2.0), +0.4 speed (weight 1.5), −0.1 tactical (weight 0.5)"
- Show the **weight configuration** alongside the result — not buried in a settings panel. The user needs to see: "These are the weights that produced this number"
- Use **delta indicators**: show what changed between simple average and weighted average per attribute, so users can instantly see which attributes drove the shift
- Consider a **"Why this score?" tooltip** that appears on hover/click of any score, showing the full computation in plain language

**Detection:**
- Users ask "how is this calculated?" more than once in testing
- Users manually recompute scores on paper/spreadsheet to verify
- Bug reports about "wrong score" that are actually correct computations with unexpected weights

**Phase to address:** Scoring engine phase (Phase 2 or equivalent) — build breakdown UI from day one, not as a retrofit. Retrofitting transparency onto an opaque scoring engine is extremely painful because it requires rethinking the entire data flow, not just adding a tooltip.

**Confidence:** HIGH — This is the single most dangerous pitfall for FootScout specifically. The PROJECT.md identifies the weighted scoring engine as the "key differentiator," and opacity is the #1 failure mode for scoring systems in domain-specific tools.

---

### Pitfall 2: Averaging Away the Outlier Scout

**What goes wrong:** Two scouts report on the same player. Scout A gives finishing 5/5; Scout B gives finishing 2/5. The system averages to 3.5 and presents it as the "finishing score." The 2.5-point disagreement — potentially the most important insight about this player — is erased. One scout saw world-class potential; the other saw a weakness. Both observations are valuable and should trigger investigation, not cancellation.

**Why it happens:** Averaging is the simplest aggregation function and feels "fair." But in scouting, disagreement is signal, not noise. Averaging treats all observations as equivalent measurements of the same ground truth. In reality, scouts observe different matches, different contexts, or bring different evaluative frameworks. The spread between their scores IS the data — the average is what you lose.

**Consequences:**
- Critical disagreements between scouts are invisible
- A single generous scout inflates a player's profile without anyone noticing
- The division makes signing decisions on smoothed data that hides the real risk profile
- Scouts feel their individual observation is "diluted" — why write a detailed report if it just becomes a data point in an average?

**Prevention:**
- **Always show variance alongside the mean.** When displaying an aggregated attribute score, show both the average AND the spread (range, or std dev if 3+ scouts). E.g., "Finishing: 3.5 (range: 2–5, 2 scouts)"
- **Flag high-disagreement attributes visually.** If two scouts differ by >1.5 points on any attribute, highlight it: yellow for moderate disagreement, red for severe. This is a call-to-action for the division: "Look closer here."
- **Let the division drill into per-scout breakdown.** From any aggregated score, the user should be able to see each scout's individual rating for that attribute
- **Preserve the individual report as a first-class entity.** Never discard or make it hard to access the raw scout observation. The aggregated view is a convenience layer, not a replacement
- **Consider weighted scout trust** (future): not all scouts should carry equal weight in the average. A senior scout's 5 may be more reliable than a junior scout's 5. But this is a v2 concern — for v1, just showing the disagreement is enough

**Detection:**
- A player's radar chart looks suspiciously "round" (all 3s) — the hallmark of averaged disagreement
- Division users ask "who gave this rating?" and can't find out
- Scouts complain their report "doesn't matter" because it gets averaged away

**Phase to address:** Multi-scout aggregation phase (Phase 2 or equivalent) — variance display must be built into the aggregation model from the start, not bolted on after. The data model needs to preserve individual reports as separate entities, not merge them into a single record.

**Confidence:** HIGH — This is a well-documented failure mode in subjective rating aggregation. The PROJECT.md explicitly notes "Multiple scouts can report on the same player; scores are averaged automatically" as a requirement, making this pitfall directly applicable.

---

### Pitfall 3: The Data Entry Wall

**What goes wrong:** A scout opens the report form and faces 20+ individual attribute sliders/inputs, each requiring a 1–5 rating across physical, technical, and tactical categories, plus free-text match notes. The form is overwhelming. The scout fills it out once (or never), and then avoids the system. Reports come in late, incomplete, or not at all. The dashboard starves for data.

**Why it happens:** The domain has many attributes because scouting is genuinely multidimensional. The natural impulse is to capture everything. But scouts are often at the pitch side, on their phone, writing observations between halves. They don't have 15 minutes to fill out a comprehensive form. The cognitive load of evaluating 20+ attributes simultaneously is enormous — you can't meaningfully rate "aerial ability" and "off-the-ball movement" at the same time without shifting your observational frame.

**Consequences:**
- Low report submission rate — scouts simply don't use the system
- Reports are filled with lazy "3s" (the safe middle value) — data pollution that looks like data
- Scouts enter reports only for standout players (exceptionally good or bad), creating survivorship bias in the data
- The system becomes a ghost town — no data, no value, no users

**Prevention:**
- **Staged disclosure for the report form.** Start with the essentials: player identification + overall impression + key standout attribute + match notes. Let the scout submit a "quick report" in under 2 minutes. Offer an "expand" to fill in the full attribute matrix. (NN/g's progressive disclosure principle: show core options first, defer specialized options to secondary screens.)
- **Default values for optional fields.** If a scout didn't observe a particular attribute closely enough to rate it, that's legitimate — the field should default to "not observed" (which is NOT the same as a 3). Do not force a rating on every attribute.
- **Mobile-first form design.** Scouts are at the pitch, not at a desk. The form must work on a phone screen with one hand. Large touch targets, minimal scrolling, swipe-friendly input patterns.
- **Autocomplete player identification.** Don't make scouts type full player names and team names every time. Recent players, recently scouted teams should be quick-select options.
- **Draft persistence.** If a scout starts a report and gets interrupted (halftime is over), the draft must be saved. Nothing is more demoralizing than losing 10 minutes of data entry to a page refresh.
- **Time-box the full form.** If the expanded form takes more than 5 minutes to complete, it's too long. Ruthlessly cut attributes that overlap (e.g., "pace" and "acceleration" might be one rating for U15 level).

**Detection:**
- Scouts take >10 minutes per report in usability testing
- High rate of "3" ratings across all attributes (the "lazy 3" pattern)
- Many reports submitted with only some attributes filled
- Scouts express that the form is "too much" during onboarding

**Phase to address:** Report form phase (Phase 1 or earliest feature phase) — this is a make-or-break UX problem. If scouts don't enter data, nothing else in the system matters. Build the quick-report flow FIRST, then expand to the full form.

**Confidence:** HIGH — Data entry fatigue is the #1 killer of data-collection tools in field settings. The PROJECT.md confirms manual-only entry with no API integrations, making this the single largest adoption risk.

---

### Pitfall 4: Stale Data Masquerading as Current

**What goes wrong:** A scout submitted a report on a U15 player 8 months ago. The player has since hit a growth spurt, improved technically, and changed positions. But the dashboard still shows the 8-month-old ratings prominently. The division sees "Finishing: 2.5" from the old report and writes off a player who is now a legitimate prospect. U15 players can transform in 3–6 month cycles due to maturation, coaching changes, or simply rapid development.

**Why it happens:** Scouting dashboards often treat all reports as equally valid regardless of age. There's no built-in concept of "data freshness" or "observation recency." The system was designed for data persistence, not data decay. But U15 scouting data has a half-life — a report from 6 months ago is less reliable than one from yesterday, and this decay is domain-specific (faster for younger age groups).

**Consequences:**
- Outdated reports lead to bad signing decisions (both false positives and false negatives)
- The division trusts the dashboard less over time as they encounter stale data surprises
- Players who improved get overlooked; players who declined get overvalued
- No natural incentive for scouts to submit updated reports (the old ones still "work")

**Prevention:**
- **Show observation date prominently on every score.** Every displayed attribute rating must indicate when it was last observed. "Finishing: 3.5 (last observed: 3 months ago)" vs. "Finishing: 3.5 (last observed: 2 weeks ago)" tells very different stories.
- **Implement a "freshness decay" visual indicator.** Reports older than a threshold (e.g., 3 months for U15) should get a visual "stale" indicator — faded, flagged, or labeled "outdated." The exact threshold should be configurable, but the default should be aggressive for U15.
- **Separate "current profile" from "historical record."** The player's displayed profile should default to showing only recent observations (e.g., last 3 months). Full history should be available but not the default view. This prevents stale data from being the first thing a user sees.
- **Prompt for re-evaluation.** If a player hasn't been scouted in N months, flag them in the system: "No recent observations — consider scheduling a follow-up scout." This turns data decay into an actionable workflow item.
- **Show temporal trajectory, not just current snapshot.** If a player has reports from 6 months ago AND 2 weeks ago, show the trend — "Finishing: 2.5 → 3.5 (improving)" is far more valuable than either number alone.

**Detection:**
- Division users ask "when was this report from?" frequently
- Decisions are made on data older than 3 months without anyone noticing
- Players' profiles show dramatic changes between old and new reports (indicating stale data was previously the only data)

**Phase to address:** Player profile and time-tracking phase (Phase 2–3) — the data model must support temporal awareness from the start, but the UI for freshness indicators can come when building the profile views. The critical thing is that the data model stores observation timestamps and the UI renders them prominently.

**Confidence:** HIGH — Well-documented in youth sports science literature. The relative age effect and maturation variability at U15 means data decay is significantly faster than for adult scouting. Science for Sport notes that "biological maturity can often be mistaken for superiority" at this age — and maturity status changes rapidly.

---

### Pitfall 5: The Christmas-Tree Dashboard

**What goes wrong:** The dashboard displays radar charts, bar charts, sparklines, score cards, comparison overlays, and trend lines — all at once. The division user opens the page and is visually overwhelmed. They can't find the one number they need to make a decision. Instead of clarifying, the visualization obscures. The dashboard becomes a showroom of charting capability rather than a decision-making tool.

**Why it happens:** Developers (and stakeholders) want to "show the data" and believe more visualization = more value. Every attribute gets its own chart. Every comparison gets its own view. Nobody makes hard choices about what to show first. The radar chart is particularly dangerous — it's the iconic scouting visualization (used by Wyscout, FIFA games, every scouting article), so the impulse is to put it everywhere. But a radar chart with 10+ axes is cognitively heavy — you can't compare two overlapping 10-vertex polygons at a glance.

**Consequences:**
- Decision-making slows down rather than speeds up
- Users develop "dashboard blindness" — they stop looking at most of the page
- The product feels "complicated" in demos, reducing adoption
- Users resort to exporting data to spreadsheets (the ultimate failure signal for a dashboard)

**Prevention:**
- **Apply progressive disclosure ruthlessly.** (NN/g: "Initially show users only a few of the most important options. Offer a larger set of specialized options upon request.") The player list should show ONE key metric per player (the weighted overall score). The player profile should show the radar chart + score breakdown. The comparison view should show side-by-side radars. Never show all three simultaneously.
- **Limit radar chart axes to 6–8 max.** Beyond 8 axes, a radar chart becomes unreadable. Group sub-attributes into category-level scores for the radar (Physical, Technical, Tactical as 3 axes), with drill-down into sub-attributes.
- **Design for a single decision at a time.** The division's workflow is: (1) "Who should I look at?" → player list with key scores, (2) "Tell me about this player" → profile with radar + breakdown, (3) "How does he compare?" → comparison view, (4) "Sign or track?" → action buttons. Each step gets one focused view, not all views crammed into one page.
- **Use color intentionally, not decoratively.** Every color on the page should encode meaning. Avoid multi-colored charts where color is just for differentiation. Use 2–3 colors maximum for data encoding, with consistent meaning (e.g., green = above average, red = below average, gray = not observed).
- **Show the answer, not the data.** The division doesn't want to see 15 attribute ratings. They want to see: "This player ranks #3 for your current search criteria, driven by elite finishing and above-average pace. Weakness: aerial ability."

**Detection:**
- Users can't answer "what's the most important thing on this page?" in under 3 seconds
- Page load includes 4+ distinct chart components
- Users zoom out / scroll past visualizations to find what they need
- More than 3 distinct colors used for data encoding on a single view

**Phase to address:** Dashboard/profile design phase (Phase 2–3) — design views incrementally. Build the list view first (simple), then the profile view (moderate complexity), then the comparison view (high complexity). Never build all visualizations in one phase.

**Confidence:** HIGH — Dashboard overload is a well-documented UX failure mode (NN/g Top 10 Application Design Mistakes: #8 Meaningless Information, #9 Junk-Drawer Menus). The PROJECT.md requires "radar charts, score bars, and comparative views" — a recipe for overload if not carefully sequenced.

---

## Moderate Pitfalls

---

### Pitfall 6: The Weight Configuration Trap

**What goes wrong:** The system lets users set per-attribute weights (0.5–2.0 or similar) for each search. But there's no guidance on what reasonable weights look like. Users set extreme weights (5.0 for finishing, 0.0 for everything else) and get meaningless results. Or they set all weights to 1.0, making the weighted score identical to the simple average — defeating the purpose. Without guardrails, the weight system produces noise, not insight.

**Prevention:**
- **Provide weight presets as starting points** (even though PROJECT.md says scouts define weights custom per search — presets are starting points, not restrictions). "Striker search", "Midfielder search", "Defender search" presets give users a sensible baseline. They can then customize from there.
- **Set weight bounds** — e.g., minimum 0.0, maximum 3.0. Prevent absurd configurations.
- **Show the impact of weights in real-time** — as the user adjusts a weight, show how the player rankings change. This makes the weight system feel tangible rather than abstract.
- **Warn on extreme configurations** — if one weight dominates (e.g., >60% of total weight on one attribute), show a soft warning: "This search heavily prioritizes [attribute]. Players strong in other areas may be overlooked."

**Detection:**
- Users set all weights to the same value
- Users set one weight extremely high and the rest to zero
- Weighted results don't differ from simple averages

**Phase to address:** Scoring/search phase (Phase 2) — build presets and bounds into the weight configuration from the start.

**Confidence:** MEDIUM — Based on general UX principles for parameter configuration (NN/g: defaults, guidance, feedback). Specific to scouting weight systems by inference from the domain.

---

### Pitfall 7: Scout Identity Lost in Aggregation

**What goes wrong:** When displaying aggregated scores, the system doesn't indicate which scout contributed which observation. The division can't assess whether a rating comes from their most trusted senior scout or a first-year junior. Two "3.5" ratings carry very different weight depending on who provided them. Without scout attribution, the division can't calibrate their trust in the data.

**Prevention:**
- **Show scout attribution on every rating.** In the drill-down from aggregated scores, each individual observation must show who submitted it and when.
- **Never merge individual reports into an aggregated record.** Individual reports are the source of truth; the aggregate is a derived view. The data model must preserve the one-to-many relationship: player → many reports → aggregated scores.
- **Consider scout profiles (future).** A scout's historical accuracy (how often their high-rated players actually succeeded) could weight their future observations more heavily. But this is a v2+ feature.

**Detection:**
- Division users ask "who rated this?" and can't find out
- Decisions are made on aggregated data without anyone checking the source observations

**Phase to address:** Data model phase (Phase 1, foundational) — the data model must preserve individual reports as separate entities from the start. Retrofitting this after reports are merged is a rewrite.

**Confidence:** HIGH — This is a direct consequence of the multi-scout aggregation requirement and is a well-understood pattern in collaborative rating systems.

---

### Pitfall 8: The "Not Observed" ≠ "3" Conflation

**What goes wrong:** A scout didn't observe a player's aerial ability (maybe the match had zero aerial situations). The form forces a 1–5 rating. The scout enters "3" (the middle, "neutral" value). The system treats this as a real observation. Later, the aggregated "aerial ability" score for this player is dragged toward 3 by a data point that carries no information. A player who was never observed aerially appears "average" instead of "unknown."

**Prevention:**
- **Make every attribute rating optional.** Allow "not observed" as a legitimate state distinct from any 1–5 value. This is NOT the same as leaving a field blank (which implies the scout forgot to fill it in).
- **The scoring engine must exclude "not observed" from averages.** If 2 scouts rated finishing but only 1 rated aerial ability, the finishing average includes both observations but the aerial average includes only one. Display the observation count: "Aerial: 3.0 (1 observation)" vs. "Finishing: 3.5 (2 observations)."
- **Visual distinction.** "Not observed" attributes on the radar chart should be displayed differently (dashed line, faded, or omitted) — never plotted as a "3" that creates a false impression of completeness.

**Detection:**
- Radar charts look suspiciously symmetrical (many 3s filling gaps)
- More than 50% of any attribute's ratings are "3"
- Scouts report feeling forced to guess on attributes they couldn't evaluate

**Phase to address:** Data model and form phase (Phase 1) — the "not observed" state must exist in the data model from the start. Converting integer ratings to nullable integers later is a schema migration that affects every part of the system.

**Confidence:** HIGH — This is a well-known problem in subjective rating systems where forced-choice scales produce meaningless mid-point responses. The PROJECT.md specifies a "1-5 scoring scale" without mentioning "not observed," making this a likely oversight.

---

### Pitfall 9: Confusing "Simple Average" and "Weighted Average" Semantics

**What goes wrong:** The system shows both a simple average and a weighted average for a player. Users don't understand why they're different or which one to trust. The simple average feels "objective" (no arbitrary weights), while the weighted average feels "subjective" (depends on who set the weights). Users default to the simple average because it seems more "fair," undermining the product's core differentiator.

**Prevention:**
- **Name them clearly.** Never use "average" and "weighted average" — these sound like variants of the same thing. Use something like "Overall Rating" (weighted) and "Raw Average" (simple). Make the weighted score the HERO number and the raw average the reference point.
- **Always show them together.** Never present one without the other nearby. The VALUE of the weighted score is in how it differs from the raw average — that difference IS the insight.
- **Frame the difference as the feature.** "With your current search criteria, [Player] rises from #8 to #3 because their finishing (your top priority) is elite." The weighted score isn't "a different average" — it's the answer to the division's specific question.

**Detection:**
- Users ask "which number should I look at?"
- The simple average is used more often than the weighted average in decision-making
- Users don't understand why two different numbers exist for the same player

**Phase to address:** Profile display phase (Phase 2) — how the two averages are framed and displayed determines whether the product's core value proposition lands.

**Confidence:** MEDIUM — Based on general UX principles for dual-metric display and domain inference. The specific naming/framing should be validated with real users.

---

### Pitfall 10: Position-Agnostic Scoring in a Position-Specific Domain

**What goes wrong:** The system treats all attributes as equally relevant for all players. A goalkeeper's "finishing" rating carries the same visibility as a striker's "finishing." The weighted search partially addresses this (a GK search would weight finishing near zero), but the default profile view shows all attributes equally. This means a GK's profile always looks "weak" because several irrelevant attributes are rated low, dragging down visual impressions.

**Prevention:**
- **Let the primary position influence which attributes are highlighted in the profile view.** Not hidden — all data should be accessible — but the DEFAULT view should emphasize position-relevant attributes. A GK profile leads with reflexes, positioning, aerial ability; a striker profile leads with finishing, movement, pace.
- **The "overall" score should always be contextual.** There is no position-independent "overall" rating that means anything. Show "Overall for [position/search context]" — not a single universal number.
- **Don't require ratings on irrelevant attributes.** If a scout is evaluating a GK, the form should deprioritize "dribbling" and "finishing" — not hide them, but make them clearly secondary.

**Detection:**
- GK profiles consistently look "weak" compared to outfield players
- Division users mentally adjust scores based on position ("well, he's a GK, so...")
- The "overall" score doesn't account for position relevance

**Phase to address:** Player profile phase (Phase 2–3) — position-aware display is a UX concern, not a data model concern. The data model should store position metadata; the profile view uses it to organize the display.

**Confidence:** MEDIUM — Position-specific evaluation is standard in professional scouting tools (Wyscout, InStat), but the PROJECT.md specifies "custom weights per search" rather than position templates. The interaction between search weights and profile display needs careful design.

---

## Minor Pitfalls

---

### Pitfall 11: Radar Chart Axis Ordering Confusion

**What goes wrong:** The order of axes on a radar chart strongly affects its visual shape. Two players with identical attribute values can look very different if the axis order changes. Users compare radar shapes visually and draw incorrect conclusions because "round" vs. "pointy" depends on axis arrangement, not underlying values.

**Prevention:**
- **Fix the axis order** across all radar charts in the app. Never let different views reorder axes.
- **Group related axes adjacently** (physical attributes together, technical together, tactical together) so the visual "lobes" of the radar correspond to meaningful categories.
- **In comparison views, overlay both players on the SAME chart with the same axis order.** Never put two radars side-by-side with different axis arrangements.

**Detection:** Users compare two players by eyeballing radar shapes rather than reading values.

**Phase to address:** Visualization phase (Phase 2–3).

**Confidence:** HIGH — Well-documented visualization pitfall. Radar charts are notoriously sensitive to axis ordering.

---

### Pitfall 12: The Unbounded Comparison

**What goes wrong:** The system allows comparing 5+ players simultaneously. The comparison view becomes an unreadable mess of overlapping radar charts and data columns. Comparison should be 2–3 players max; beyond that, the user needs a ranked list, not a side-by-side view.

**Prevention:**
- **Cap comparison at 3 players** (or at most 4). Beyond that, redirect users to a ranked list view filtered by their search criteria.
- **If comparing >2 players, use tabular comparison** rather than overlaid radar charts. Overlaid radar charts with 3+ series become visual noise.

**Detection:** Comparison views with 4+ players look unreadable in testing.

**Phase to address:** Comparison view phase (Phase 3+).

**Confidence:** MEDIUM — Based on general data visualization principles; specific to scouting dashboards by inference.

---

### Pitfall 13: Missing Scout-Report Context

**What goes wrong:** Attribute ratings are displayed without the match context that produced them. A "pace: 4/5" rating means very different things if observed in a high-intensity derby vs. a low-stakes friendly. The match notes (free-text) contain this context, but they're often buried or disconnected from the attribute ratings.

**Prevention:**
- **Link every attribute rating to its source report** (including match notes, opponent level, match type)
- **Show a brief context snippet** alongside the rating: "Pace: 4/5 — observed vs. [Opponent] in [Competition]"
- **Don't separate the quantitative and qualitative data.** The radar chart and the match notes should be part of the same view, not different tabs.

**Detection:** Users click away from the profile to find "the match notes" frequently.

**Phase to address:** Profile view phase (Phase 2–3).

**Confidence:** MEDIUM — Based on domain knowledge of scouting workflows; the match context is critical for score interpretation.

---

### Pitfall 14: The Watchlist Becomes a Graveyard

**What goes wrong:** The "track over time" / watchlist feature accumulates players but never prompts re-evaluation. The division adds 30 players to the watchlist over 3 months and never revisits any of them. The watchlist becomes a list of players they were once interested in — not an active monitoring tool.

**Prevention:**
- **Add "last evaluated" dates to watchlist entries** and sort by staleness by default. Players not evaluated in 3+ months appear at the top with a "re-evaluate" prompt.
- **Consider scheduled reminders:** "5 players on your watchlist haven't been scouted in 2+ months. Schedule follow-ups?"
- **Make the watchlist actionable**, not archival. Each entry should have a clear next-step: "Schedule scout", "Promote to shortlist", "Remove from watchlist."

**Detection:** Watchlist grows without bound; entries older than 3 months have no follow-up actions.

**Phase to address:** Watchlist/tracking phase (Phase 3+).

**Confidence:** MEDIUM — Based on general task-management UX principles. Specific to scouting workflows by inference.

---

### Pitfall 15: Signing Decision Without Audit Trail

**What goes wrong:** The division marks a player as "sign" but there's no record of what information led to that decision. If the player flops, there's no way to review what the scouts saw, what the scores were, or what weights were used. Without an audit trail, the organization can't learn from bad decisions or calibrate their evaluation criteria.

**Prevention:**
- **Snapshot the scoring state when a signing decision is made.** Capture: the weighted scores, the weight configuration, the individual scout reports, and the date. This is a point-in-time record of "what we knew when we decided."
- **Store the decision rationale.** Let the division record why they signed or passed on a player. Even a one-line note ("Strong finisher, fills gap at striker") creates an audit trail.
- **Make past decisions reviewable.** A "decision history" view showing signed/passed players, their scores at decision time, and outcomes (if known).

**Detection:** Nobody can answer "why did we sign this player?" 6 months later.

**Phase to address:** Signing/decision phase (Phase 3+).

**Confidence:** MEDIUM — Based on general decision-support system principles. Specific to scouting by inference from the signing workflow described in PROJECT.md.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Confidence |
|-------------|---------------|------------|------------|
| **Data model design** | Merging individual reports into aggregated records (Pitfall 2, 7) | Individual reports as first-class entities; aggregation is always derived | HIGH |
| **Data model design** | No "not observed" state — forced 1–5 (Pitfall 8) | Nullable ratings with explicit "not observed" state | HIGH |
| **Report form design** | Data entry wall — 20+ fields at once (Pitfall 3) | Staged disclosure, quick-report flow, mobile-first | HIGH |
| **Scoring engine** | Opaque scores with no breakdown (Pitfall 1) | Breakdown UI from day one; show computation path | HIGH |
| **Scoring engine** | Weight configuration without guardrails (Pitfall 6) | Presets, bounds, real-time impact preview | MEDIUM |
| **Player profile view** | Christmas-tree dashboard (Pitfall 5) | Progressive disclosure; one decision per view | HIGH |
| **Player profile view** | Simple vs. weighted average confusion (Pitfall 9) | Clear naming; weighted as hero, raw as reference | MEDIUM |
| **Player profile view** | Position-agnostic display (Pitfall 10) | Position-aware attribute highlighting | MEDIUM |
| **Multi-scout aggregation** | Averaging away outlier observations (Pitfall 2) | Show variance; flag high-disagreement attributes | HIGH |
| **Time tracking / watchlist** | Stale data masquerading as current (Pitfall 4) | Freshness indicators; temporal defaults; re-evaluation prompts | HIGH |
| **Time tracking / watchlist** | Watchlist becomes a graveyard (Pitfall 14) | Staleness sorting; re-evaluation prompts | MEDIUM |
| **Comparison view** | Radar chart overload with 4+ players (Pitfall 12) | Cap at 3; tabular comparison beyond that | MEDIUM |
| **Signing decisions** | No audit trail for decisions (Pitfall 15) | Snapshot scoring state at decision time | MEDIUM |

---

## Sources

- **Science for Sport — Talent Identification** (sciencforsport.com, updated 2025-04): Longitudinal study showing few developmental trajectory differences between selected/non-selected U13 players; existing advantages persist rather than emerge. Confirms that U15 data is inherently volatile and early observations are unreliable predictors.

- **Science for Sport — Relative Age Effect** (scienceforsport.com, updated 2025-03): Birth timing creates significant selection bias in youth football. Children born earlier in the selection year are 3.5x more likely to be selected. The effect is most pronounced during Peak Height Velocity (approximately 13 years). "Biological maturity can often be mistaken for superiority." Critical context for why U15 scoring must account for maturation variability.

- **Nielsen Norman Group — Top 10 Application-Design Mistakes** (nngroup.com, 2019): Application UX failure patterns including poor feedback (#1), no default values (#4), and meaningless information (#8). Directly applicable to scoring feedback, form defaults, and dashboard information hierarchy.

- **Nielsen Norman Group — Progressive Disclosure** (nngroup.com, 2006, durable): "Initially show users only a few of the most important options. Offer a larger set of specialized options upon request." Core principle for preventing data entry fatigue and dashboard overload. Research-validated: users understand systems BETTER when complexity is deferred.

- **Hudl/Wyscout Platform** (hudl.com, current): Industry-standard scouting tool. Uses advanced search, player lists, shadow teams, and reporting. Confirms the radar chart as the dominant visualization paradigm in football scouting. Their "Youth Competitions Pack" validates the U15 scouting market segment.

- **Context7 — Recharts Documentation** (context7.com, current): RadarChart with PolarGrid, PolarAngleAxis, PolarRadiusAxis. Custom tooltip support for score breakdowns. Confirms that Recharts supports the visualization patterns needed, but axis ordering and comparison overlays require careful implementation.

- **PROJECT.md — FootScout** (local, 2026-05-11): Core requirements including weighted scoring engine, multi-scout aggregation, manual-only data entry, 1-5 scale, track-over-time + sign model. Key decisions including custom weights per search and averaged multi-scout reports.
