# Phase 3: Draft & Report Management - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Scouts can manage their report workflow — saving in-progress work as drafts and reviewing past submissions. This phase delivers: (1) draft persistence with auto-save on step transitions, (2) draft resume with step-position memory, (3) a "my reports" table view at /scout/reports showing submitted reports filtered by scout. No report editing, no division-side views — those are future phases.

</domain>

<decisions>
## Implementation Decisions

### Draft storage
- **D-01:** Drafts use a `status` field on the existing `reportSchema`: `'draft' | 'submitted'`. Drafts and submitted reports coexist in `reports.json`. Filtering by status + scoutId gives "my drafts" and "my reports" from the same source. No separate drafts file.
- **D-02:** Auto-save on every step transition (Next/Back). Every step change triggers a server action to persist the draft. A visible "Draft saved" indicator confirms persistence to the scout.
- **D-03:** One draft per scout. If the scout starts a new report while a draft exists, the existing draft is replaced (with confirmation). The form is always a single in-progress report per scout.
- **D-04:** Draft → submitted: on form submit, the `status` field flips from `'draft'` to `'submitted'` in-place. Same report record, same ID. No delete+create.
- **D-05:** Data layer note: JSON files are fine for now. The user intends to migrate to spreadsheets (CSV/Excel) as the data store in the future, as spreadsheets are more compatible with what the product aims to replace (current scouting workflow). The async data layer interface abstracts this — swapping storage is a future task.

### Draft resume UX
- **D-06:** When resuming a draft, the form restores all previously entered values AND lands on the last step the scout was on. Saves the scout from re-clicking through completed steps.
- **D-07:** Draft discovery via banner on form entry. When the scout selects their identity (or it's auto-selected from cookie), if a draft exists for that scout, a banner appears: "You have an unsaved draft for [player name]. Resume or discard?" Resume loads the draft; Discard deletes it and starts fresh.
- **D-08:** Draft is scout-scoped. The draft's `scoutId` determines ownership. The form checks for drafts belonging to the currently-selected scout.

### My reports layout
- **D-09:** Table layout at `/scout/reports` route. Separate from the report form (`/scout/report`). Clean separation — form is for entry, reports is for reviewing.
- **D-10:** Scout dropdown filter at the top of the reports page. Once a scout is selected, the table filters to their submitted reports. Same identity pattern as the report form.
- **D-11:** Full-detail columns: Player name, Match date, Opponent, Competition, Match result, Overall average score. The overall average is a simple numeric average across all rated (non-null) attributes in that report — excludes null from the denominator.
- **D-12:** One overall average number per report in the table. Compact, fits one cell. Enough to quickly spot standout or weak reports. Per-category breakdowns belong on the player profile (Phase 5).

### Scout identity persistence
- **D-13:** Cookie-persisted scout selection. Store the last-selected `scoutId` in a cookie. Auto-select the scout on page load for both `/scout/report` and `/scout/reports`. Scout can change via dropdown at any time.

### OpenCode's Discretion
- Draft banner styling and placement
- "Draft saved" indicator position and animation
- Table column widths and responsive behavior
- Overall average number formatting (decimal places)
- Cookie name and expiration duration
- Confirmation dialog styling for draft replacement
- Sort direction defaults for the reports table

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model and validation
- `.planning/phases/01-data-foundation/01-CONTEXT.md` — D-01 through D-11 define the data model decisions (attribute categories, position fields, null handling, scout registry, JSON file structure)
- `.planning/phases/02-scout-report-form/02-CONTEXT.md` — D-01 through D-09 define the form UX decisions (step wizard, block advance, inline player creation, numbered buttons, N/O toggle)
- `.planning/REQUIREMENTS.md` — SCOUT-03 (draft save/resume) and SCOUT-04 (my reports list) define the acceptance criteria for this phase
- `.planning/ROADMAP.md` § Phase 3 — Success criteria and scope boundary

### Architecture and patterns
- `.planning/research/ARCHITECTURE.md` — Write path: Form submit → Route Action → Data Layer; auto-revalidation after actions
- `.planning/research/PITFALLS.md` — Pitfall 3 (data entry wall), Pitfall 7 (scout identity consistency), Pitfall 8 ("not observed" ≠ 3)

### Existing codebase
- `app/data/types.ts` — Zod schemas (playerSchema, reportSchema, scoutSchema) — reportSchema needs `status` field added
- `app/data/data.ts` — Async CRUD functions — needs draft-aware functions (getDraftByScout, upsertDraft, submitDraft)
- `app/data/form-schema.ts` — Form validation schema — needs to align with draft status field
- `app/routes/scout/report.tsx` — Route module with loader, action, ScoutReportForm — needs draft loading and auto-save
- `app/components/scout-report-form.tsx` — Form orchestrator with step wizard — needs draft resume and auto-save integration
- `app/routes.ts` — Route config — needs `/scout/reports` route added
- `package.json` — Current dependencies (React Router 7.15, React 19, Tailwind 4, react-hook-form, @hookform/resolvers, clsx)
- `AGENTS.md` — Project workflow guide, route prefix conventions (/scout/* for data entry)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/data/types.ts` — `reportSchema` can be extended with a `status` field. The existing `NewReport` type (Omit<Report, "id" | "createdAt">) will need adjustment to include/exclude `status` appropriately.
- `app/data/data.ts` — `getReports()`, `createReport()` can be extended. New functions needed: `getReportsByScout(scoutId)`, `getDraftByScout(scoutId)`, `upsertDraft()`, `submitDraft()`.
- `app/components/scout-report-form.tsx` — The `ScoutReportForm` component already manages step state and form values. Draft resume pre-fills `defaultValues`; auto-save calls an action on step transitions.
- `app/components/step-indicator.tsx` — Step progress indicator, reusable as-is.
- `app/routes/scout/report.tsx` — The loader already fetches players and scouts. Needs to also fetch the scout's draft (if any). The action already handles report creation — needs to also handle draft upsert.

### Established Patterns
- Route module pattern: `app/routes/{path}.tsx` with typed `Route` import
- Framework mode: loaders for data fetching, actions for mutations, auto-revalidation
- Intent-based action routing: `formData.get("intent")` to distinguish operations (already used for "create-player-and-report" vs "create-report")
- `useSubmit()` bridges RHF to React Router action
- `formValueToNullableNumber()` handles null serialization in FormData

### Integration Points
- `app/routes.ts` — Add `route("reports", "routes/scout/reports.tsx")` under the existing `prefix("scout", [...])`
- `app/data/types.ts` — Add `status: z.enum(["draft", "submitted"])` to `reportSchema`; update `NewReport` type
- `app/data/data.ts` — Add draft-aware CRUD functions
- `app/routes/scout/report.tsx` — Loader returns draft data; action handles draft upsert; ScoutReportForm receives draft
- `app/components/scout-report-form.tsx` — Accept draft prop, pre-fill values, auto-save on step transitions
- Cookie: Scout identity persistence — set/read cookie in loaders and form component

</code_context>

<specifics>
## Specific Ideas

- Spreadsheets (CSV/Excel) are the intended future data store — JSON files are a stepping stone. The async interface in `data.ts` abstracts storage so this swap is feasible later.
- The draft banner should feel non-intrusive but clear — the scout needs to know their work is saved without feeling interrupted.
- The overall average in the reports table excludes null ratings from the denominator (per D-03 from Phase 1 — null ≠ 3, null ≠ 0, null is "not observed").
- One draft per scout keeps the mental model simple — "the form is where I write my current report."

</specifics>

<deferred>
## Deferred Ideas

- Report editing (edit submitted reports) — future phase, not scoped here
- Division-side report views — Phase 4/5
- Per-category score breakdowns in the reports table — Phase 5 (player profile)
- Spreadsheet/CSV data layer migration — future task, JSON files for now
- Bulk draft management (drafts list page) — one draft per scout makes this unnecessary

</deferred>

---
*Phase: 03-draft-report-management*
*Context gathered: 2026-05-13*
