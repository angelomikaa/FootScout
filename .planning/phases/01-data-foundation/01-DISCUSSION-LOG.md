# Phase 1: Data Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis.

**Date:** 2026-05-11
**Phase:** 01-data-foundation
**Mode:** discuss (interactive)
**Areas discussed:** Attribute granularity, Player identity fields, JSON file structure, Match context fields

## Area 1: Attribute granularity

| Question | Options presented | User selection |
|----------|-----------------|----------------|
| Should match-notes have scored attributes or be free-text only? | Scored + free-text / Free-text only / More attributes per category | Scored + free-text (recommended) |
| Are the 16 proposed attributes correct? | These 16 are good / Swap a few | These 16 are good |

**Key decision:** Match-notes category has 4 scored attributes (attitude, coachability, intensity, impact) PLUS a free-text notes field. All 16 attributes confirmed as proposed.

## Area 2: Player identity fields

| Question | Options presented | User selection |
|----------|-----------------|----------------|
| How should positions be represented? | Enum of common positions / Free-text / Position group + detail | Position group + detail |
| Extra fields beyond DATA-01? | Just DATA-01 / Add preferred foot / Add preferred foot + height + weight | Add preferred foot + height + weight |
| How should nationality be represented? | ISO country code / Free-text country name / Flag emoji only | ISO country code (recommended) |

**Key decisions:** Two position fields (group + specific), preferred foot + height + weight added, ISO alpha-2 country code for nationality. Height/weight are optional (U15 players change frequently).

## Area 3: JSON file structure

| Question | Options presented | User selection |
|----------|-----------------|----------------|
| How should data be organized in JSON files? | Normalized / Nested / Hybrid | Normalized (recommended) |

**Key decision:** Separate players.json, reports.json, scouts.json — normalized, linked by playerId, mirrors future DB tables.

## Area 4: Match context fields

| Question | Options presented | User selection |
|----------|-----------------|----------------|
| How should competition be represented? | Free-text / Enum of common types / Type + free-text | Free-text (recommended) |
| How should scout identity work in v1? | Name string / Scout ID + name registry / Session-based role selection | Scout ID + name registry |
| Should report include match result? | Yes, optional result field / No, out of scope | Yes, optional result field |

**Key decisions:** Competition is free-text, scouts.json registry with IDs, optional matchResult field on reports.

## Corrections Made

No corrections — all decisions accepted as proposed or with recommended option.

## Deferred Ideas

None — all discussion stayed within phase scope.
