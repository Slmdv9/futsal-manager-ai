# Project Agent Instructions

This repository contains **Futsal Manager AI**, a mobile-first, Spanish-language app where any futsal coach can browse curated exercises and per-category programming, see exercises animated on a 2:1 futsal tactics board, and use grounded AI to generate sessions, adapt exercises, and answer coaching questions. The MVP is anonymous (no login) with a server-side daily AI quota.

## Read First

- `ARCHITECTURE.md` — module map, hexagonal layers, public APIs, dependency rules, and test layout. Authoritative for where code belongs.
- `CONTEXT.md` — domain language and canonical terms. Use these words in code and UI.
- `docs/build-brief.md` — problem, users, goals, non-goals, MVP slice, validation.
- `docs/domain-model.md` — core entities, relationships, states, edge cases.
- `docs/content-model.md` — content package contract: RFEF categories, Exercise/Programming fields, invariants, provenance, and validation paths.
- `docs/content-licensing.md` — licensing policy: publishable statuses, kind/status rules, attribution, source register, and the author checklist.
- `DESIGN.md` — visual direction and design tokens; authoritative for UI.
- `docs/risks-and-open-questions.md` — current risks and unresolved decisions.

Read on demand:

- `docs/technical-discovery.md` — stack, data, integrations, testing, observability, operations.
- `docs/board-data-schema.md` — Board Data v1.0.0 contract, coordinates, limits, validation, and versioning.
- `docs/device-development-workflow.md` — build, launch, reload, and inspect the app on the connected Android device.
- `docs/design/prototype/` — original prototype screens, HTML references, and the full source-of-truth `DESIGN.md`.

## Project Status

Bootstrapped, design system, navigation, Board Data contract, modular hexagonal architecture, and the content model plus bundled read layer implemented. The app runs on React Native + Expo (Expo Router) with a four-tab bottom navigation (Explorar, Pizarra, Asistente IA, Mi Club) and a `/design-system` gallery outside the tabs. Board Data v1.0.0 is defined and validated with `parseBoardData`; its contract lives in `docs/board-data-schema.md`. The `content` module holds the seven RFEF `Category` brackets, `Exercise` (with a required `collection` of `library` or `weekly` and an optional `references` citation array), `Programming`, a strict `1.2.0` content package, and publishable-only read use cases; the package parser enforces the licence gate (published content must be `owned` or `permitted`, kind/status must agree, permission-dependent content needs attribution) and the read layer filters unlicensed records. Its contracts live in `docs/content-model.md` and `docs/content-licensing.md`. The content presentation layer renders the browsing UI: Explorar opens with a compact app bar and an anonymous hero built from real read-layer counts (it reads `71 Ejercicios`), lists the seven RFEF brackets with a reusable `shared/ui` `FilterChip` under `CATEGORÍA / RANGO DE EDAD`, shows the selected category's methodology glance card and three weekly highlights read from `listWeeklyHighlights` (subtitle `Una selección fuera de la biblioteca`, counter `3 ejercicios`, ordered warm-up → main → cool-down), and keeps the category's library grouped by the required `Exercise.sessionPart` into `CALENTAMIENTO` / `PARTE GENERAL` / `VUELTA A LA CALMA` with counts. One `<AiSessionEntryCard />` sits outside the selected/unselected branch as the last product card — after the library when a category is selected, after the `Elige una categoría` prompt otherwise — directly above the retained `Ver sistema de diseño` technical footer, and links to the existing Asistente IA tab without importing the `ai` module. Every library card carries exactly one `Abrir en Pizarra` action (`Link asChild` + full-width secondary `AppButton`) that opens `/pizarra?exerciseId=<id>`; `src/app/(tabs)/pizarra.tsx` resolves the param with `getExercise`, maps it with `buildBoardExerciseTarget`, and passes it to `BoardScreen`, which shows the `SELECCIONADO` chip, title, summary, and the note that the animated 2:1 board arrives in the next phase, or the accepted fallback when no publishable target resolves. No pitch or SVG is drawn yet. The library browse model reads `listLibraryExercises` only, so weekly records never appear in the library or in another category's plan, and weekly cards expose no board action. Selection stays in a session-only `CategorySelectionProvider` mounted once in `src/app/_layout.tsx`. Source is organized into `content`, `board`, `ai`, and `club` modules under `src/modules`, each with `domain`, `application`, `infrastructure`, `presentation`, and a public `index.ts`; shared code lives in `src/shared`. Install with `npm install`, run `npm run verify` (or `./init.sh`), and start with `npm start`. The bundled seed holds 71 original exercises (50 `library` + 21 `weekly`) and seven published Programming records, one per RFEF category, at `contentVersion` `1.2.0`: six categories carry seven library exercises split 2 warm-up / 3 main / 2 cool-down, Infantil U14 keeps its nine library exercises split 2/5/2, every category has three weekly highlights (one per session part) with exactly one inspiration citation, and `infantil-u14-base` stays at plan version `1.1.0`. `bootstrap-app-shell`, `design-system-tokens`, `app-navigation-shell`, `board-data-schema`, `modular-hexagonal-architecture`, `content-model-and-store`, `seed-content-licensing`, `seed-infantil-u14`, `seed-remaining-categories`, `category-filter`, `seed-session-structure`, `explore-general-screen`, `seed-weekly-highlights`, `explore-weekly-highlights` and `explore-by-category-screen` are accepted; the next unstarted feature is `exercise-detail-screen`, which must render the `Inspirado en` citation; `exercise-preview-board-thumbnail` is deferred behind `tactics-board-renderer`. The physical device loop is documented in `docs/device-development-workflow.md`.

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

For content:

- Validate the bundled package with `parseContentPackage` and keep every Exercise `boardData` passing `parseBoardData`; the content tests load the real `content-package.json`, so `npm test` fails on invalid seed data.
- Read content through the `content` public API and its publishable-only use cases (`isPublishableExercise` / `isPublishableProgramming`); never deep-import the package or expose draft, archived, or unlicensed records. Contracts: `docs/content-model.md` and `docs/content-licensing.md`.
- Publish only `owned` or `permitted` provenance; keep `pending`, `unlicensed`, and `reference-only` material draft, and credit the source when permission depends on attribution. Never add an inspiration-only source to the package.
- Bump `CONTENT_PACKAGE_VERSION` and the JSON `contentVersion` together when the package contract changes.

## Definition Of Done

A feature is done only when: the target behavior works, the relevant verification actually ran, evidence is recorded, the app still starts from the standard path, and affected docs are updated.

## Required Artifacts

- `feature_list.json`: source of truth for feature state and verification evidence.
- `PROGRESS.md`: current verified state and lightweight session log.
- `init.sh`: standard startup and verification path.

There are no blocking open questions. Remaining implementation-time questions are tracked in `docs/risks-and-open-questions.md`. The next unstarted feature is `exercise-detail-screen`.

## End Of Session

Before ending a session: update `PROGRESS.md` and `feature_list.json`, record unresolved risks or blockers, leave the repo runnable through `./init.sh`, push the phase branch, and leave the compare URL for the user to open the pull request.
