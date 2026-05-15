# Phase Integration Audit — FootScout Milestone

**Date:** 2026-05-15
**Auditor:** Cross-Phase Integration Checker
**Phases in Scope:** 1–8 (all phases)

---

## Cross-Phase Wiring Status (per phase boundary)

### Phase 1 → Phase 2 (Data → Scout Form)
| Connection | Status | Detail |
|---|---|---|
| `types.ts` → `form-schema.ts` (Zod schemas) | WIRED | `physicalAttributesSchema`, `technicalAttributesSchema`, etc. imported and reused |
| `types.ts` → `report.tsx` action (`NewPlayer`, `NewReport`) | WIRED | Types imported and used for `createPlayer`, `createReport` calls |
| `data.ts` → `report.tsx` loader (`getPlayers`, `getScouts`) | WIRED | Loader fetches players + scouts for form dropdowns |
| `data.ts` → `report.tsx` action (`createPlayer`, `createReport`) | WIRED | Action calls both functions on submit |
| `form-schema.ts` → `report.tsx` (validation) | WIRED | `reportFormSchema.parse()` validates form data before DB write |

### Phase 1 → Phase 3 (Data → Draft & Reports)
| Connection | Status | Detail |
|---|---|---|
| `data.ts` → `report.tsx` loader (`getDraftByScout`) | WIRED | Draft loaded and passed to `ScoutReportForm` |
| `data.ts` → `report.tsx` action (`upsertDraft`, `submitDraft`, `deleteDraft`) | WIRED | All draft operations wired to form intents |
| `data.ts` → `reports.tsx` loader (`getReportsByScout`, `getPlayers`, `getScouts`) | WIRED | Reports + players loaded for table display |
| `cookies.server.ts` → `report.tsx` / `reports.tsx` (`getScoutIdFromCookie`) | WIRED (imported) | **BUT cookie is never set — see BLOCKER-1** |

### Phase 2 → Phase 3 (Form → Draft Management)
| Connection | Status | Detail |
|---|---|---|
| `ScoutReportForm` receives `draft` prop | WIRED | Draft data from loader passed as prop |
| Auto-save via `fetcher.submit` to `/scout/report` | WIRED | `save-draft` intent triggers `upsertDraft` in action |
| `DraftBanner` → `delete-draft` intent | WIRED | Banner calls action with `delete-draft` intent |
| Draft resume via `defaultValues` | WIRED | `draftInitialValues` memoized and passed to `useForm` |

### Phase 1 → Phase 4 (Data → Player List)
| Connection | Status | Detail |
|---|---|---|
| `data.ts` → `players.tsx` loader (`getPlayers`, `getPlayerReportStats`) | WIRED | Players and report stats loaded |
| `player-average.ts` → `players.tsx` (`parseWeightParams`, `calculatePonderatedAverages`) | WIRED | Weight params parsed, ponderated averages computed when weights active |
| `PlayerList` component receives all props | WIRED | Sort, search, filter, compare, weighted averages all passed |

### Phase 4 → Phase 5 (Player List → Profile)
| Connection | Status | Detail |
|---|---|---|
| `PlayerList` → `<Link to="/division/players/${player.id}">` | WIRED | Player names are clickable links to profile |
| `players.$id.tsx` loader (`getPlayerById`, `getReportsByPlayer`, `getScouts`) | WIRED | Profile loads player, reports, scout names |
| `player-average.ts` → `players.$id.tsx` (`calculatePonderatedAverages`) | WIRED | Profile computes ponderated averages with weight params |

### Phase 5 → Phase 6 (Profile → Scoring & Radar)
| Connection | Status | Detail |
|---|---|---|
| `players.$id.tsx` → `PlayerScores` component | WIRED | `playerAverages` passed to `PlayerScores` |
| `PlayerScores` → Recharts `RadarChart` | WIRED | Radar renders 12-axis chart from `averages.attributes` |
| `player-average.ts` → `PlayerScores` (`PonderatedAverages` type) | WIRED | Type imported and used for props |
| Null exclusion in averages | WIRED | `collectAttributeValues` filters out `null` values |

### Phase 6 → Phase 7 (Simple → Ponderated Scoring)
| Connection | Status | Detail |
|---|---|---|
| `AttributeToggle` → URL `?w=` params | WIRED | Toggle updates search params, triggers re-render |
| `parseWeightParams` → all routes | WIRED | Used in `players.tsx`, `players.$id.tsx`, `compare.tsx` loaders |
| `ScoreBreakdown` → delta accordion | WIRED | Shows simple vs ponderated per-attribute contributions |
| `players.tsx` weighted sorting | WIRED | `weightedScore` sort uses `ponderatedGlobalAverage` |

### Phase 7 → Phase 8 (Ponderated → Comparison)
| Connection | Status | Detail |
|---|---|---|
| `players.tsx` compare selection → `/division/compare?players=...&w=...` | WIRED | Floating bar navigates with player IDs + weight params |
| `compare.tsx` loader (`parseWeightParams`, `calculatePonderatedAverages`) | WIRED | Both players get ponderated averages with same weights |
| `compare.tsx` → dual `RadarChart` overlay | WIRED | Two `<Radar>` elements in same chart |
| `compare.tsx` → `ComparisonDeltaTable` | WIRED | Delta table receives both players' averages |
| `compare.tsx` → `AttributeToggle` | WIRED | Weights can be changed on comparison page too |

---

## E2E Flow Verification

### Flow 1: Scout submits report → appears in "My Reports" → appears in player profile
| Step | Status | Detail |
|---|---|---|
| Scout selects name from dropdown | WIRED | Dropdown populated by `getScouts()` in loader |
| Scout selects/creates player | WIRED | `PlayerCombobox` + `NewPlayerFields` |
| Scout fills staged form (5 steps) | WIRED | Step validation via `STEP_FIELDS` + `trigger()` |
| Form submits to `/scout/report` action | WIRED | `onValidSubmit` → `submit(formData, { method: "post" })` |
| Action creates player (if new) + report | WIRED | `createPlayer` + `createReport` called |
| Redirect to `/?submitted=true` | WIRED | Home page shows success banner |
| Report appears in "My Reports" | **BROKEN** | `getScoutIdFromCookie` always returns `null` — cookie never set. Reports list is empty unless `?scoutId=xxx` manually added |
| Report appears in player profile | WIRED | `getReportsByPlayer(playerId)` returns all reports for that player |

**Verdict: BROKEN** — Scout identity cookie is never persisted, so "My Reports" cannot auto-filter.

### Flow 2: Division browses list → filters/searches → clicks player → sees profile with scores
| Step | Status | Detail |
|---|---|---|
| Division views player list | WIRED | `players.tsx` loader fetches all players |
| Search by name | WIRED | `player.name.toLowerCase().includes(search.toLowerCase())` |
| Filter by position | WIRED | `player.positionGroup === positionFilter` |
| Filter by club | WIRED | `player.club === clubFilter` |
| Click player → profile | WIRED | `<Link to="/division/players/${player.id}">` |
| Profile shows identity | WIRED | `IdentityCard` component |
| Profile shows reports | WIRED | `ReportCard` for each submitted report |
| Profile shows scores/radar | WIRED | `PlayerScores` with radar chart |

**Verdict: PASSED**

### Flow 3: Division toggles weights → list re-sorts → profile shows ponderated averages
| Step | Status | Detail |
|---|---|---|
| Toggle attribute weight | WIRED | `AttributeToggle` updates `?w=` search params |
| Player list re-sorts by weighted score | WIRED | `effectiveSortBy` defaults to `weightedScore` when weights active |
| Profile shows ponderated average | WIRED | `calculatePonderatedAverages` called in profile loader |
| Score breakdown shows delta | WIRED | `ScoreBreakdown` accordion renders when `hasWeights` |
| Comparison respects weights | WIRED | `compare.tsx` passes `boostedAttrs` to both players' averages |

**Verdict: PASSED**

### Flow 4: Division selects two players → navigates to comparison → sees dual radar + deltas
| Step | Status | Detail |
|---|---|---|
| Click "Comparar" on player A | WIRED | `handleCompareToggle` adds to `?compare=` param |
| Click "Comparar" on player B | WIRED | Second player added (max 2 enforced) |
| Floating bar shows "Comparar" button | WIRED | Appears when `selectedCompareIds.length === 2` |
| Navigate to `/division/compare?players=A,B&w=...` | WIRED | `handleCompareNavigate` constructs URL with weights |
| Comparison page loads both players | WIRED | Loader fetches both players + reports |
| Dual radar overlay renders | WIRED | Two `<Radar>` elements in same `RadarChart` |
| Delta table shows per-attribute differences | WIRED | `ComparisonDeltaTable` renders with color-coded deltas |
| Weights can be changed on comparison page | WIRED | `AttributeToggle` present, updates URL params |

**Verdict: PASSED**

---

## Gaps and Broken Links

### BLOCKER-1: Scout identity cookie is never set
- **Location:** `app/cookies.server.ts` exports `setScoutIdCookie`, but it is **never called** anywhere in the codebase
- **Impact:** `getScoutIdFromCookie()` always returns `null` in all loaders
- **Affected flows:**
  - Scout report form: draft is never loaded (`getDraftByScout` skipped when `scoutId` is null)
  - "My Reports" page: always shows empty list unless `?scoutId=xxx` is manually added to URL
  - Auto-save: draft saved but never retrieved on page reload
- **Affected requirements:** SCOUT-03 (draft resume), SCOUT-04 (view own reports)
- **Fix needed:** The scout selection dropdown in the report form should call `setScoutIdCookie` via a server action or the form submission should set the cookie in the response headers

### WARNING-1: "My Reports" table has no clickable links to player profiles
- **Location:** `app/components/reports-table.tsx`
- **Detail:** Player names are rendered as plain text (`{getPlayerName(report.playerId)}`), not as `<Link>` elements
- **Impact:** Scouts viewing their reports cannot click through to see the player's full profile with scores
- **Affected requirements:** SCOUT-04 (view reports — partial, no navigation to player context)

### WARNING-2: Player list search only searches by name, not position or club
- **Location:** `app/routes/division/players.tsx` line 140
- **Detail:** `matchesSearch = player.name.toLowerCase().includes(search.toLowerCase())` — only name is searched
- **Requirement BROWSE-02:** "Division can search players by name, position, and club"
- **Current state:** Position and club are filterable via dropdowns, but not searchable via the text input
- **Impact:** Users cannot type "CB" or "Barcelona" in the search box to find players; they must use the dropdown filters
- **Severity:** Low — dropdown filters provide equivalent functionality, but the requirement text says "search"

### WARNING-3: Radar chart does not visually reflect ponderated weights
- **Location:** `app/components/player-scores.tsx`
- **Detail:** The radar chart uses `averages.attributes` which are the simple per-attribute averages. The ponderated scoring only changes the global average number, not the per-attribute values. The radar shape is identical whether weights are active or not.
- **Impact:** Users see the ponderated score change numerically but the visual radar doesn't shift, which may be confusing
- **Affected requirements:** SCORE-04 (ponderated average re-weights — works numerically but not visually)
- **Note:** This is arguably a design choice rather than a bug, since ponderation changes the global weighting, not individual attribute scores. The score breakdown shows the per-attribute contribution deltas.

### WARNING-4: Home page status indicator is stale
- **Location:** `app/routes/home.tsx` lines 181-197
- **Detail:** Shows "Phase 6: Scoring & Radar (Next)" as the next phase, but all 8 phases are complete
- **Impact:** Cosmetic only — misleading project status display

### WARNING-5: Mixed language in player list search placeholder
- **Location:** `app/components/player-list.tsx` line 205
- **Detail:** Placeholder says "Search by player name..." (English) while the rest of the UI is in Portuguese
- **Impact:** Cosmetic inconsistency

---

## Data Consistency Check

| Check | Status | Detail |
|---|---|---|
| `Report` type matches DB schema | WIRED | `rowToReport` correctly maps all 28 columns |
| `Player` type matches DB schema | WIRED | `rowToPlayer` correctly maps all 11 columns |
| `AttributeScore` (1-5 or null) consistent | WIRED | Used in all attribute schemas, form schema, and scoring engine |
| Null exclusion in scoring | WIRED | `collectAttributeValues` filters `null`, `calculateOverallAverage` filters `null` |
| Draft vs submitted status | WIRED | `status` enum used consistently across data layer, form, and display |
| `ATTRIBUTE_KEYS` (12 attrs) consistent | WIRED | Same 12 keys in `player-average.ts`, `score-breakdown.tsx`, `comparison-delta-table.tsx`, `compare.tsx` |
| `ATTRIBUTE_LABELS` (16 labels) consistent | WIRED | Covers all 12 scored + 4 matchNotes attributes, used in 5 files |
| URL param `?w=` for weights | WIRED | Consistent across `players.tsx`, `players.$id.tsx`, `compare.tsx`, `attribute-toggle.tsx` |

---

## Requirements Integration Map

| Requirement | Integration Path | Status | Issue |
|---|---|---|---|
| DATA-01 | `types.ts` Player schema → `data.ts` createPlayer/getPlayerById → `players.tsx` loader | WIRED | — |
| DATA-02 | `types.ts` Report schema → `data.ts` createReport/getReportsByPlayer → `players.$id.tsx` loader | WIRED | — |
| DATA-03 | `types.ts` physical/technical/tactical schemas → `form-schema.ts` → `scout-report-form.tsx` | WIRED | — |
| DATA-04 | `attributeScoreSchema` (nullable 1-5) → `AttributeRatingRow` → scoring engine null exclusion | WIRED | — |
| DATA-05 | `matchNotesAttributesSchema.notes` → `Textarea` in form → persisted in DB | WIRED | — |
| SCOUT-01 | Form `isNewPlayer` branch → `createPlayer` in action → player created before report | WIRED | — |
| SCOUT-02 | 5-step form with `STEP_FIELDS` validation → staged attribute categories | WIRED | — |
| SCOUT-03 | `getDraftByScout` → `DraftBanner` → `upsertDraft` on step change → resume via `defaultValues` | **PARTIAL** | BLOCKER-1: Cookie never set, draft never auto-loaded on revisit |
| SCOUT-04 | `getReportsByScout` → `ReportsTable` → displays player name, date, opponent, avg | **PARTIAL** | BLOCKER-1: Reports list empty without manual `?scoutId=` param; WARNING-1: No links to player profiles |
| BROWSE-01 | `PlayerList` with sortable columns (name, position, club, age, reports, lastScouted, weightedScore) | WIRED | — |
| BROWSE-02 | Search by name + position dropdown + club dropdown | **PARTIAL** | WARNING-2: Search only covers name; position/club are filters not text search |
| BROWSE-03 | `<Link to="/division/players/${player.id}">` → `players.$id.tsx` route | WIRED | — |
| BROWSE-04 | `IdentityCard` + `ReportCard` list + `PlayerScores` (radar + averages) | WIRED | — |
| SCORE-01 | `calculatePlayerAverages` → simple average per attribute, null excluded | WIRED | — |
| SCORE-02 | `PlayerScores` → Recharts `RadarChart` with 12 axes | WIRED | — |
| SCORE-03 | `AttributeToggle` → URL `?w=` params → `parseWeightParams` in loaders | WIRED | — |
| SCORE-04 | `calculatePonderatedAverages` → 3x weight on boosted attributes → ponderated global average | WIRED | — |
| SCORE-05 | `ScoreBreakdown` accordion → simple vs ponderated per-attribute delta | WIRED | — |
| COMP-01 | Compare buttons in `PlayerList` → `?compare=` param → floating bar → navigate to `/division/compare` | WIRED | — |
| COMP-02 | `compare.tsx` → dual `<Radar>` overlay in same `RadarChart` | WIRED | — |
| COMP-03 | `compare.tsx` loader passes `boostedAttrs` to both players' `calculatePonderatedAverages` | WIRED | — |

**Requirements with no cross-phase wiring:** None — all 21 v1 requirements have cross-phase connections.

---

## Summary

### Wiring Summary

- **Connected:** 32+ export/import connections verified across all 8 phases
- **Orphaned:** 1 — `setScoutIdCookie` exported but never called
- **Missing:** 1 — Scout identity persistence mechanism (cookie set)

### API Coverage

All data layer functions have consumers:
- `getPlayers` → players.tsx, report.tsx, reports.tsx
- `getPlayerById` → players.$id.tsx, compare.tsx
- `createPlayer` → report.tsx action
- `getReports` → (not directly used, but `getReportsByPlayer` and `getReportsByScout` are)
- `getReportsByPlayer` → players.$id.tsx, compare.tsx, players.tsx (for weighted averages)
- `createReport` → report.tsx action
- `getDraftByScout` → report.tsx loader
- `upsertDraft` → report.tsx action
- `submitDraft` → report.tsx action
- `deleteDraft` → report.tsx action
- `getReportsByScout` → reports.tsx loader
- `getScouts` → report.tsx, reports.tsx, players.$id.tsx
- `getPlayerReportStats` → players.tsx loader

### Auth Protection

No authentication layer exists (intentional for v1 — scout identity via cookie). The scout cookie mechanism is incomplete (see BLOCKER-1).

### E2E Flows

- **Complete:** 3 of 4 flows work end-to-end
- **Broken:** 1 flow (scout report → My Reports) broken at the identity persistence step

### Overall Verdict: **GAPS_FOUND**

The codebase has strong cross-phase wiring for the division-facing flows (browse → profile → scoring → comparison). All scoring engine connections are solid. The comparison feature is fully wired from selection through dual radar to delta table.

The critical gap is the **scout identity cookie never being set**, which breaks draft persistence and the "My Reports" view. This is a single-point fix but it blocks two requirements (SCOUT-03, SCOUT-04).

---

## INTEGRATION CHECK COMPLETE
