---
status: complete
phase: 05-player-profile
source: 05-01-SUMMARY.md, 05-02-SUMMARY.md
started: 2026-05-14T22:14:33Z
updated: 2026-05-14T22:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Navigate to Player Profile from Player List
expected: On the Player List page (/division/players), player names appear as clickable links (dark text, blue on hover). Clicking a player name navigates to /division/players/{id} and shows the player's profile page.
result: issue
reported: "Failed to read reports.json: updatedAt field missing from seed data — Zod validation crash on getPlayerReportStats()"
severity: blocker
fix_applied: Made updatedAt optional in reportSchema; added status, currentStep, updatedAt to all 5 seed reports in reports.json

### 2. Identity Card Displays All Player Info
expected: Profile page shows an identity card with: player name (large bold), position group + specific position badges, club name, nationality with flag emoji, date of birth + calculated age, preferred foot, and optionally height/weight if available.
result: pass

### 3. Back to Players Link Works
expected: Clicking the "← Back to players" link at the top of the profile page returns to /division/players.
result: pass

### 4. Scout Reports Section Shows Submitted Reports
expected: Below the identity card, a "Scout Reports" section heading appears. Each submitted report displays as a card with match date, opponent, competition, scout name, and four attribute category grids (Physical, Technical, Tactical, Match Notes). Reports are sorted newest first.
result: pass

### 5. Attribute Grids Show Scores and Null Values
expected: Each attribute in a report card shows either a blue score pill (1-5) or an em dash (—) for "not observed" (null). Match Notes category also shows the free-text notes field.
result: pass

### 6. Empty State for Player with No Reports
expected: When a player has no submitted reports, the identity card still displays, and the reports section shows "No reports yet for this player" with a link to the Scout Area.
result: skipped
reason: "All seed players had reports — added player-004 with no reports to test; confirmed working"

### 7. Score Placeholder Section Visible
expected: Below the reports section, a dashed-border area shows "Player Scores" heading and "Scoring and radar charts coming in Phase 6" message.
result: pass

### 8. 404 Page for Invalid Player ID
expected: Navigating to /division/players/{nonexistent-id} shows a "Player not found" heading, descriptive body text, and a "← Back to player list" link.
result: pass

### 9. Player List Shows Real Report Counts
expected: On the Player List page, the "Reports" column shows actual submitted report counts (not all zeros). Players with no reports show 0.
result: pass

### 10. Player List Shows Real Last Scouted Dates
expected: On the Player List page, the "Last Scouted" column shows the most recent report match date for players with reports, and "-" for players without any reports.
result: pass

### 11. Home Page Links Work
expected: Home page (/) shows navigation dashboard with working links to /scout/report (New Report), /scout/reports (My Reports), and /division/players (Player List). The "Player Profile — Coming in Phase 5" item is still shown as disabled/dashed since profiles are accessed via the player list, not directly from home.
result: pass

### 12. Dark Mode Support on Profile
expected: All profile page elements (identity card, report cards, attribute grids, score placeholder, empty state, 404 page) render correctly in dark mode with appropriate dark: variant colors.
result: issue
reported: "Poor contrast on the player list in dark mode, also on my reports (looks purposeful there), and in new report there is a scrollbar on the scouting report steps"
severity: major
fix_applied: Added dark: variants to all player-list.tsx elements (thead, tbody, th, td, tr, position badge, empty states, sort indicators). Added scrollbar-none class to step-indicator.tsx overflow container.

## Summary

total: 12
passed: 9
issues: 2
pending: 0
skipped: 1
blocked: 0

## Gaps

- truth: "Player list loads without Zod validation crash"
  status: fixed
  reason: "User reported: Failed to read reports.json — updatedAt field missing from seed data, Zod validation crash"
  severity: blocker
  test: 1
  root_cause: "Seed data (reports.json) created in Phase 1 before updatedAt/status/currentStep fields were added in Phase 3. Zod reportSchema required updatedAt with no default, causing validation failure when getPlayerReportStats() → getReports() parsed the seed data."
  artifacts:
    - path: "app/data/types.ts"
      issue: "updatedAt was required (isoDateTimeSchema) with no .default() — seed data missing field"
    - path: "app/data/reports.json"
      issue: "5 seed reports missing updatedAt, status, and currentStep fields"
  missing:
    - "Made updatedAt optional in reportSchema (.optional())"
    - "Added status='submitted', currentStep=0, updatedAt=createdAt to all 5 seed reports"

- truth: "All pages render with proper dark mode contrast and no visual artifacts"
  status: fixed
  reason: "User reported: Poor contrast on player list in dark mode, scrollbar on step indicator in new report"
  severity: major
  test: 12
  root_cause: "Player list table (player-list.tsx) had hardcoded light-mode-only classes (bg-gray-50, bg-white, text-gray-500) with no dark: variants. Step indicator used overflow-x-auto with visible scrollbar."
  artifacts:
    - path: "app/components/player-list.tsx"
      issue: "Missing dark: variants on table, thead, tbody, th, td, tr, badge, empty state, sort indicators"
    - path: "app/components/step-indicator.tsx"
      issue: "overflow-x-auto shows visible scrollbar in some viewports"
  missing:
    - "Added dark: variants to all player-list.tsx elements"
    - "Added scrollbar-none class to step-indicator.tsx"
