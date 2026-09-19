# Project Agent Instructions

This repository contains **Futsal Manager AI**, a mobile-first, Spanish-language app where any futsal coach can browse curated exercises and per-category programming, see exercises animated on a 2:1 futsal tactics board, and use grounded AI to generate sessions, adapt exercises, and answer coaching questions. The MVP is anonymous (no login) with a server-side daily AI quota.

## Read First

- `CONTEXT.md` — domain language and canonical terms. Use these words in code and UI.
- `docs/build-brief.md` — problem, users, goals, non-goals, MVP slice, validation.
- `docs/domain-model.md` — core entities, relationships, states, edge cases.
- `DESIGN.md` — visual direction and design tokens; authoritative for UI.
- `docs/risks-and-open-questions.md` — current risks and unresolved decisions.

Read on demand:

- `docs/technical-discovery.md` — stack, data, integrations, testing, observability, operations.
- `docs/design/prototype/` — original prototype screens, HTML references, and the full source-of-truth `DESIGN.md`.

## Project Status

Pre-bootstrap. There is no application code, no framework, and no chosen stack yet. The stack decision is a blocking open question; do not scaffold an app until it is resolved. The startup harness (`init.sh`, `PROGRESS.md`, `feature_list.json`) has not been created yet.

## Non-Negotiable Product Constraints

- **MVP is anonymous.** No accounts, login, registration, teams, rosters, or coach-owned calendars. Those are a later phase.
- **Categories are official RFEF age brackets** (Prebenjamín U8 … Senior), never skill tiers.
- **The board is a renderer.** It draws structured `Board Data` (tokens, cones, arrows, ordered phases) and must preserve a 2:1 pitch ratio. It never invents content.
- **AI must be grounded.** Session generator, variant adapter, and chatbot answer from seeded exercises and category programming, and must not fabricate library content.
- **LLM calls are server-side only** and bounded by a daily anonymous quota. Never expose API keys client-side.
- **Language split:** app UI and exercise content in Spanish; repository documents and code identifiers in English.
- **Content is curated**, not generated on demand. Licensing of seed sources is unresolved.

## Working Rules

- Work on one feature at a time; keep changes inside that feature's scope.
- Do not invent domain terminology; use `CONTEXT.md` (e.g. `Exercise` not "tarea", `Category` not skill level).
- Follow `DESIGN.md` tokens and the prototype layout; do not introduce new colors, fonts, or heavy shadows.
- Do not add code comments unless asked. Keep code identifiers in English.
- Do not mark work complete based on intent; verify it.
- Update durable docs when behavior, domain rules, or verification change.

## Verification

There is no build or test command yet. Once the stack is chosen:

- Validate every seeded exercise's `Board Data` against the agreed schema; unvalidated data must not be published.
- Add golden tests for board phase playback (positions and order).
- Add grounding tests: AI output must reference seeded exercises/categories and resist adversarial prompts that try to fabricate content.
- Test quota enforcement server-side.
- Manually test the board and screens on a real phone and tablet.

## Definition Of Done

A feature is done only when: the target behavior works, the relevant verification actually ran, evidence is recorded, the app still starts from the standard path, and affected docs are updated.

## Pending Harness

Before implementation begins, generate `init.sh`, `PROGRESS.md`, and `feature_list.json`, and resolve the blocking open questions in `docs/risks-and-open-questions.md` (seed content licensing, Board Data schema, stack).
