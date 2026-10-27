# Project Agent Instructions

This repository contains **Futsal Manager AI**, a mobile-first, Spanish-language app where any futsal coach can browse curated exercises and per-category programming, see exercises animated on a 2:1 futsal tactics board, and use grounded AI to generate sessions, adapt exercises, and answer coaching questions. The MVP is anonymous (no login) with a server-side daily AI quota.

## Read First

- `ARCHITECTURE.md` — module map, hexagonal layers, public APIs, dependency rules, and test layout. Authoritative for where code belongs.
- `CONTEXT.md` — domain language and canonical terms. Use these words in code and UI.
- `docs/build-brief.md` — problem, users, goals, non-goals, MVP slice, validation.
- `docs/domain-model.md` — core entities, relationships, states, edge cases.
- `DESIGN.md` — visual direction and design tokens; authoritative for UI.
- `docs/risks-and-open-questions.md` — current risks and unresolved decisions.

Read on demand:

- `docs/technical-discovery.md` — stack, data, integrations, testing, observability, operations.
- `docs/board-data-schema.md` — Board Data v1.0.0 contract, coordinates, limits, validation, and versioning.
- `docs/device-development-workflow.md` — build, launch, reload, and inspect the app on the connected Android device.
- `docs/design/prototype/` — original prototype screens, HTML references, and the full source-of-truth `DESIGN.md`.

## Project Status

Bootstrapped, design system, navigation, and the Board Data contract implemented. The app runs on React Native + Expo (Expo Router) with a four-tab bottom navigation (Explorar, Pizarra, Asistente IA, Mi Club) and a `/design-system` gallery outside the tabs. Board Data v1.0.0 is defined and validated with `parseBoardData`; its contract lives in `docs/board-data-schema.md`. Install with `npm install`, verify with `npm run verify` (or `./init.sh`), and start with `npm start`. `bootstrap-app-shell`, `design-system-tokens`, `app-navigation-shell`, and `board-data-schema` are accepted. The next ready feature is `content-model-and-store`. The physical device loop is documented in `docs/device-development-workflow.md`.

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read `PROGRESS.md` for current verified state and the next step.
3. Read `feature_list.json` and pick the first ready unfinished feature in list order.
4. Read `ARCHITECTURE.md` and place the work in the owning module and layer before editing.
5. Run `./init.sh`.
6. If baseline verification fails, fix the baseline before adding new feature work.

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
- Place code by business module and hexagonal layer: `domain`, `application`, `infrastructure`, or `presentation` under `src/modules/<module>`. Put genuinely cross-module code in `src/shared`.
- Import another module or an app route only through `@/modules/<module>` or `@/shared/*`. Never deep-import another module's layers; `npm run lint` enforces this with `eslint-plugin-boundaries`.
- Keep Expo Router files in `src/app` thin: they render module screens through public APIs and wire adapters; no business logic there.
- Mirror source under `tests/modules/<module>/...` and `tests/shared/...`, and write behavior tests as Given/When/Then. Cross-cutting structure checks live in `tests/architecture`.
- Do not invent domain terminology; use `CONTEXT.md` (e.g. `Exercise` not "tarea", `Category` not skill level).
- Follow `DESIGN.md` tokens and the prototype layout; do not introduce new colors, fonts, or heavy shadows.
- Do not add code comments unless asked. Keep code identifiers in English.
- Do not mark work complete based on intent; verify it.
- Update durable docs when behavior, domain rules, or verification change.

## Verification

`./init.sh` is the standard startup path. It runs `npm run verify` (ESLint with architecture boundaries, `tsc --noEmit`, all tests discovered from `tests/**/*.test.{ts,tsx}` via `npm test`, and `expo-doctor`) and never starts a long-running server. Start the app with `npm start`. For every notable UI or behavior change, follow `docs/device-development-workflow.md` and verify the change on the connected Android device before handoff.

For architecture:

- Read `ARCHITECTURE.md` before adding a module, layer, port, adapter, or cross-module dependency.
- Add or change a module through its public API; keep domain free of React Native, Expo, HTTP, and storage.
- Update `ARCHITECTURE.md`, the allowed module dependency table, and `eslint.config.js` together when the dependency graph changes.
- Add mirrored tests and keep `tests/architecture/architecture.test.ts` passing.

For Board Data:

- Validate every authored, seeded, or AI-generated payload with `parseBoardData` against `docs/board-data-schema.md`; unvalidated data must not be published or rendered.
- Add fixtures and `node:test` coverage for every contract change; `npm test` must stay green.
- Add golden tests for board phase playback (positions and order) once the renderer and playback exist.
- Add grounding tests: AI output must reference seeded exercises/categories and resist adversarial prompts that try to fabricate content.
- Test quota enforcement server-side.
- Manually test the board and screens on a real phone and tablet.

## Definition Of Done

A feature is done only when: the target behavior works, the relevant verification actually ran, evidence is recorded, the app still starts from the standard path, and affected docs are updated.

## Required Artifacts

- `feature_list.json`: source of truth for feature state and verification evidence.
- `PROGRESS.md`: current verified state and lightweight session log.
- `init.sh`: standard startup and verification path.

There are no blocking open questions. Remaining implementation-time questions are tracked in `docs/risks-and-open-questions.md`. The next ready feature is `content-model-and-store`.

## End Of Session

Before ending a session: update `PROGRESS.md` and `feature_list.json`, record unresolved risks or blockers, leave the repo runnable through `./init.sh`, push the phase branch, and leave the compare URL for the user to open the pull request.
