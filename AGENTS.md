# FootScout — GSD Workflow Guide

## Project

Soccer scouting dashboard for U15 youth prospect tracking. Scouts enter detailed player observations; the system produces weighted visual profiles for the scouting division.

**Core value:** The weighted scoring engine — ponderated averages that shift based on what the division is looking for.

## Workflow Rules

- Always read `.planning/STATE.md` first for current position
- Read `.planning/PROJECT.md` for project context
- Read `.planning/ROADMAP.md` for phase details and success criteria
- Read `.planning/REQUIREMENTS.md` for requirement definitions and traceability
- Never skip verification steps
- Commit artifacts after each phase transition
- Run `npm run typecheck` before committing code changes

## Tech Stack

- React Router 7 (framework mode, SSR)
- Tailwind CSS 4
- TypeScript
- Vite 8
- Recharts (radar charts)

## Key Patterns

- Server-first: use loaders/actions, not client-side state management
- Scoring engine: client-side pure functions, weights via URL search params
- Data layer: async interface (JSON files v1, swap to Supabase later)
- "Not observed" (null) ≠ 3 on the 1-5 scale — never treat null as a rating
- Score breakdown must ship with ponderated engine — transparency is the product

## Conventions

- Two route prefixes: `/scout/*` (data entry), `/division/*` (appraisal)
- Attribute ratings: 1-5 integer or null (not observed)
- Scoring scale: 1-5 with configurable per-attribute weights
