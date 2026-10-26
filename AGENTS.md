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

Bootstrapped. The app shell runs on React Native + Expo (Expo Router) with a Spanish home placeholder. Install with `npm install`, verify with `npm run verify` (or `./init.sh`), and start with `npm start`. `bootstrap-app-shell` is implemented and ready for independent validation; the next feature is `design-system-tokens`.

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read `PROGRESS.md` for current verified state and the next step.
3. Read `feature_list.json` and pick the first ready unfinished feature in list order.
4. Run `./init.sh`.
5. If baseline verification fails, fix the baseline before adding new feature work.

## Branch And Pull Request Workflow

This repository works one branch per SDD phase and never commits directly to `main`.

1. Update `main` and create a branch from it before starting a phase.
2. Name the branch by phase:
   - `docs/<phase>` for discovery or documentation phases (e.g. `docs/build-brief`).
   - `chore/<phase>` for harness or maintenance phases (e.g. `chore/harness-starter`).
   - `feat/<feature-id>` for implementation features (e.g. `feat/bootstrap-app-shell`).
3. Keep the branch scoped to one phase or one feature in `feature_list.json`.
4. Commit on the branch using Conventional Commit messages.
5. When the phase is ready, push the branch and give the user the GitHub compare URL. The user opens the pull request from the web; do not try to create it with `gh`.
6. Before handoff, prepare a suggested PR title and body with the phase or feature id, what changed, verification actually run, and remaining risks.
7. Record the branch name and PR status in `PROGRESS.md` before ending the session.

Do not reuse a merged phase branch for unrelated work.

## Non-Negotiable Product Constraints

- **MVP is anonymous.** No accounts, login, registration, teams, rosters, or coach-owned calendars. Those are a later phase.
- **Categories are official RFEF age brackets** (Prebenjamín U8 … Senior), never skill tiers.
- **The board is a renderer.** It draws structured `Board Data` (tokens, cones, arrows, ordered phases) and must preserve a 2:1 pitch ratio. It never invents content.
- **AI must be grounded.** Session generator, variant adapter, and chatbot answer from seeded exercises and category programming, and must not fabricate library content.
- **AI provider is DevExpert Inference** (OpenAI-compatible, model `chat` for all features). LLM calls are server-side only and bounded by 5 anonymous requests per day keyed by installation ID plus hashed IP. Never expose API keys client-side.
- **Content is original plus CMD Mora material** used with club permission; external reference sites are inspiration only.
- **Language split:** app UI and exercise content in Spanish; repository documents and code identifiers in English.
- **Content is curated**, not generated on demand. Content and the board must work offline from the bundled JSON; AI results are saved locally.

## Working Rules

- Work on one feature at a time; keep changes inside that feature's scope.
- Do not invent domain terminology; use `CONTEXT.md` (e.g. `Exercise` not "tarea", `Category` not skill level).
- Follow `DESIGN.md` tokens and the prototype layout; do not introduce new colors, fonts, or heavy shadows.
- Do not add code comments unless asked. Keep code identifiers in English.
- Do not mark work complete based on intent; verify it.
- Update durable docs when behavior, domain rules, or verification change.

## Verification

`./init.sh` is the standard startup path. It runs `npm run verify` (ESLint, `tsc --noEmit`, and `expo-doctor`) and never starts a long-running server. Start the app with `npm start`. Once content and AI exist:

- Validate every seeded exercise's `Board Data` against the agreed schema; unvalidated data must not be published.
- Add golden tests for board phase playback (positions and order).
- Add grounding tests: AI output must reference seeded exercises/categories and resist adversarial prompts that try to fabricate content.
- Test quota enforcement server-side.
- Manually test the board and screens on a real phone and tablet.

## Definition Of Done

A feature is done only when: the target behavior works, the relevant verification actually ran, evidence is recorded, the app still starts from the standard path, and affected docs are updated.

## Required Artifacts

- `feature_list.json`: source of truth for feature state and verification evidence.
- `PROGRESS.md`: current verified state and lightweight session log.
- `init.sh`: standard startup and verification path.

Before implementation begins, resolve the blocking open questions in `docs/risks-and-open-questions.md` (seed content licensing, Board Data schema, stack). The first ready feature is `bootstrap-app-shell`.

## End Of Session

Before ending a session: update `PROGRESS.md` and `feature_list.json`, record unresolved risks or blockers, leave the repo runnable through `./init.sh`, push the phase branch, and leave the compare URL for the user to open the pull request.
