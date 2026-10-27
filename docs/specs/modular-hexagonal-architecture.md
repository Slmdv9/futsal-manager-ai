# Feature Implementation Spec: Adopt a modular hexagonal architecture

## Source Feature

- `id`: `modular-hexagonal-architecture`
- `area`: `foundation`
- `depends_on`: `bootstrap-app-shell`, `design-system-tokens`, `app-navigation-shell`, `board-data-schema`
- `status`: `not_started`
- `source`: `feature_list.json`

## Goal

Make the growing React Native app easy to extend without turning `src` into a flat collection of screens, components, and helpers. The source is reorganized into business modules, each with hexagonal layers, a public API, and mirrored tests. Cross-module contracts live in `shared`, and the dependency rules are enforced by the lint gate.

This feature changes structure, ownership, and guardrails. It does not implement new product behavior.

## Non-Goals

- Implementing `content-model-and-store` (Category, Exercise, Programming, or the content read layer).
- Rendering the board or adding playback (`tactics-board-renderer`, `board-phase-playback`).
- AI features, the LLM gateway, quota enforcement, or local AI persistence.
- Team, roster, or season domain models.
- A dependency-injection framework, a monorepo, micro-frontends, or module federation.
- New colors, fonts, screens, or copy beyond moving the existing placeholders.

## Job Story

When I add a feature to the app,
I want to place it in a known module and layer with explicit imports and mirrored tests,
so I can extend the product without breaking unrelated capabilities or guessing where code belongs.

## Users And Permissions

- App developer: adds or changes a module, layer, port, adapter, or screen; needs a stable structure and fast boundary feedback.
- Content author / AI service (later): consumes the shared Board Data contract; needs it to remain versioned and validated.
- End user: keeps the same four tabs and design-system gallery with no behavior change.

## Acceptance Scenarios

### Scenario 1: Business modules own their layers

Given the repository
When a developer inspects `src/modules`
Then `content`, `board`, `ai`, and `club` each expose `domain`, `application`, `infrastructure`, `presentation`, and a public `index.ts`.

### Scenario 2: Shared code is independent

Given the shared tree
When a developer inspects `src/shared`
Then Board Data, theme, and UI live there, and shared code does not import app routes or business modules.

### Scenario 3: Routes are thin

Given the four tabs and the design-system gallery
When a developer opens the route files
Then each route renders a screen from a module public API or shared presentation, and contains no business logic.

### Scenario 4: Boundaries fail fast

Given a deliberate cross-module deep import, an app-to-module deep import, or a shared-to-module import
When `npm run lint` runs
Then the lint gate rejects the import with an architecture message.

### Scenario 5: Tests mirror the source

Given a source file under a module or `shared`
When a developer looks for its tests
Then there is a mirrored path under `tests`, and behavior tests use Given/When/Then naming.

### Scenario 6: The app still works

Given the reorganized source
When `npm run verify` and `./init.sh` run
Then lint, typecheck, all tests, and `expo-doctor` pass, and the app still starts from the standard path without a Metro server.

### Scenario 7: Board Data remains the validated contract

Given the existing Board Data schema, fixtures, and parser
When they are moved to the shared kernel
Then all existing contract tests still pass, the schema version remains `1.0.0`, and invalid data is still rejected.

## Repository Research

### Files Inspected

- `AGENTS.md` — feature workflow, verification gate, Board Data rules, and the next ready feature.
- `PROGRESS.md` — accepted baseline and stale branch/acceptance bookkeeping.
- `feature_list.json` — feature order, dependencies, and the next feature.
- `CONTEXT.md` — canonical module vocabulary and the rejected `tarea` term.
- `docs/domain-model.md` — content, board, AI, and next-phase club entities.
- `docs/technical-discovery.md` — Expo Router, versioned JSON, SVG board, server-side AI, and offline rules.
- `docs/board-data-schema.md` — Board Data contract and current source path.
- `src/app/*`, `src/components/*`, `src/content/*`, `src/theme/*` — current flat structure.
- `package.json`, `tsconfig.json`, `eslint.config.js` — scripts, path aliases, and the current lint gate.

### Existing Patterns To Follow

- TypeScript strict mode and the `@/` path alias.
- Node's `node:test` through `tsx`; no second test runner yet.
- Token-driven UI from `src/shared/theme` and primitives from `src/shared/ui`.
- Spanish UI copy and English code identifiers.
- Board Data is validated at runtime and must not be published or rendered unvalidated.
- `npm run verify` is the single gate and `./init.sh` executes it.

### Current Gaps

- No module or shared tree exists; UI primitives, navigation, content, and theme are top-level technical folders.
- No architecture document defines module ownership, layering, or dependency direction.
- Tests are collocated with one source file and are not discovered automatically.
- No boundary enforcement exists.
- The Board Data contract is owned by `src/content`, but content, board, and AI will all exchange it.

## Architecture Decisions

### Decision 1: Modular monolith with four business modules

`content`, `board`, `ai`, and `club` are the current capabilities. A new module is added only when a capability has its own vocabulary, rules, lifecycle, and UI.

### Decision 2: Four hexagonal layers per module

Every module uses `domain`, `application`, `infrastructure`, and `presentation`. The public API is `index.ts`. Empty layers are marked with `.gitkeep` until the owning feature fills them.

### Decision 3: Board Data is a shared kernel

`shared/domain/board-data` owns the versioned contract because content, board, and AI all produce or consume it. This avoids a `content -> board` or `board -> content` dependency.

### Decision 4: `shared` is the bottom of the graph

`shared/domain`, `shared/theme`, and `shared/ui` may not import app routes or modules. Shared code is cross-module and has no business owner.

### Decision 5: Expo Router is the composition root

Route files stay thin. They render a module screen or shared presentation and, later, wire adapters. Business logic never lives in `src/app`.

### Decision 6: Boundaries are enforced by ESLint

`eslint-plugin-boundaries` classifies elements and files and rejects forbidden imports in `npm run lint`. The architecture document and the lint policy must change together when the dependency graph changes.

### Decision 7: Tests mirror the source tree

Tests live under `tests/modules/<module>/<layer>/...` and `tests/shared/...`. Cross-cutting structural checks live under `tests/architecture`. Behavior tests use Given/When/Then.

## Expected File Changes

- `ARCHITECTURE.md` — create; module map, layers, dependency rules, public APIs, testing, and adding a module.
- `docs/specs/modular-hexagonal-architecture.md` — this spec.
- `package.json`, `package-lock.json` — add the boundaries plugin; discover all tests automatically.
- `eslint.config.js` — classify app, module layers, shared, and test files; enforce dependency policies.
- `src/app/*` — keep the four routes and gallery; render module screens through public APIs.
- `src/modules/content/*` — create the module, public API, layers, README, and Explorar screen.
- `src/modules/board/*` — create the module, public API, layers, README, and Pizarra screen.
- `src/modules/ai/*` — create the module, public API, layers, README, and Asistente IA screen.
- `src/modules/club/*` — create the module, public API, layers, README, and Mi Club screen.
- `src/shared/domain/board-data/*` — move the Board Data schema and parser here.
- `src/shared/theme/*` — move design tokens and fonts here.
- `src/shared/ui/*` — move primitives, layout, and navigation components here.
- `tests/shared/domain/board-data/*` — move the Board Data tests and fixtures here; rewrite with Given/When/Then.
- `tests/architecture/architecture.test.ts` — create; verify module layers, public APIs, shared ownership, and removal of legacy folders.
- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — update the standard structure, status, evidence, and next feature.
- `docs/technical-discovery.md` — link the architecture and the automatic test discovery.
- `docs/board-data-schema.md` — update the source path of the contract.

## Visual Design Impact

- UI involved: yes, but no visual change.
- Design source: `DESIGN.md` and `docs/design/prototype/`.
- Screens or states affected: the four tabs and the `/design-system` gallery keep their current appearance and copy.
- New design artifact required: no.
- Verification: open all four tabs and the gallery on the connected Android device and confirm no layout, font, icon, or navigation regression.

## Durable Documentation Impact

- `ARCHITECTURE.md`: create — the architecture source of truth.
- `AGENTS.md`: update — read the architecture first; use module public APIs; keep tests mirrored; add boundaries to the gate.
- `PROGRESS.md`: update — record the architecture feature, branch, verification, and next step.
- `feature_list.json`: add the architecture feature, carry the `board-data-schema` acceptance, and make `content-model-and-store` depend on the architecture.
- `docs/technical-discovery.md`: update the test command and link the architecture.
- `docs/board-data-schema.md`: update paths only; the contract does not change.

## Implementation Plan

1. Reconcile the harness with the merged `board-data-schema` acceptance.
2. Create the shared tree and move Board Data, theme, and UI without changing their behavior.
3. Create the four module trees, public APIs, screens, READMEs, and empty layer markers.
4. Make the Expo Router files thin composition-root wrappers.
5. Move the Board Data tests and fixtures to the mirrored shared test path and rewrite them as Given/When/Then.
6. Add the structural architecture test.
7. Add `eslint-plugin-boundaries`, classify app/module/shared/test elements, and enforce the dependency policies.
8. Make `npm test` discover all tests.
9. Write `ARCHITECTURE.md` and update the durable docs and harness.
10. Run `npm run verify`, `./init.sh`, an Android export, and a device smoke check; commit and push the phase branch.

## Verification Plan

- `npm test` — all Board Data and architecture tests pass, discovered automatically.
- `npm run typecheck` — the moved code and tests compile with the `@/` alias.
- `npm run lint` — the boundary rules pass on the real tree and reject deliberate forbidden imports.
- `npm run verify` — lint, typecheck, tests, and `expo-doctor` pass.
- `./init.sh` — exits 0 and does not start Metro.
- `npx expo export --platform android` — still bundles.
- Device smoke check: cold start, all four tabs, selected states, locked Mi Club, design-system gallery, and the existing gallery interactions.
- Confirm `src/components`, `src/content`, and `src/theme` no longer exist.

## Evidence To Capture

- `npm test` pass/fail counts and suite count.
- `npm run verify` exit code and `expo-doctor` result.
- `./init.sh` exit code.
- Android export result and bundle size.
- Device model and observed tabs/gallery states.
- Exact lint messages for deliberate `shared -> module`, `app -> module internal`, and `cross-module internal` imports.
- Confirmation that Board Data `1.0.0` tests still pass from the new path.
- Confirmation that the old top-level folders are gone.

## Validator Checklist

- [ ] Implementation stays within this feature's scope.
- [ ] Acceptance scenarios pass.
- [ ] Verification evidence is present.
- [ ] Persistent E2E coverage was added/updated when the feature has an observable user/API flow and an E2E harness exists, or the spec explains why it is not needed.
- [ ] `feature_list.json` and `PROGRESS.md` were updated correctly.
- [ ] No unrelated product behavior or extra feature work was added.
