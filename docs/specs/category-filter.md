# Feature Implementation Spec: Filter exercises and programming by category

## Source Feature

- **id:** `category-filter`
- **area:** `browse`
- **status:** `passing`
- **depends_on:** `seed-infantil-u14` (accepted); the stacked branch `feat/category-filter` also contains the accepted `seed-remaining-categories`, so all seven RFEF categories are seeded
- **source:** `feature_list.json`
- **branch:** `feat/category-filter` (stacked on `feat/seed-remaining-categories`)
- **spec path:** `docs/specs/category-filter.md`

## Goal

Build the first real browsing UI: a coach picks one official RFEF category and the Explorar tab shows that category's Programming record and its filtered Exercise Library, and the selection survives navigating between tabs and routes for the rest of the app session. This is the selection mechanism plus the minimum visible filtered content; the full prototype layouts belong to `explore-general-screen` and `explore-by-category-screen`.

Delivered: a session-scoped category selection context owned by `content/presentation`, a reusable `FilterChip` design-system primitive, a filtered browse view model built only from the publishable read use cases, and an Explorar screen that renders the seven RFEF brackets, the selected programming summary and the selected exercise list.

## Non-Goals

- **`explore-general-screen` owns:** final prototype fidelity of Explorar (`docs/design/prototype/01-explore-general/code.html`), weekly exercises, the methodology-by-stage overview, the AI session-generator entry point, and the hero/header treatment.
- **`explore-by-category-screen` owns:** a dedicated category route, methodology focus + key concepts + macrocycle/microcycle presentation, and the "Abrir en Pizarra" action.
- **`exercise-detail-screen` / `tactics-board-renderer` / `board-phase-playback` own:** any exercise detail route, board rendering, phase playback, and navigation from a list row to a board.
- **AI features own:** the assistant/generator reading the selected category as context. This spec only exposes the hook; no AI code is touched.
- Any content change: `content-package.json`, `contentVersion`/`CONTENT_PACKAGE_VERSION` (`1.0.0`), `infantil-u14-base` (`1.1.0`), Board Data `1.0.0`, `CATEGORY_IDS`, ports, use cases, schema.
- Account, team, roster, or "Todos"/all-categories filter state.
- Persistence across app restarts (`AsyncStorage`/local storage), deep-linkable category params, or URL state.
- Anonymous AI quota, quota UI, offline gating, attribution display.
- Changing `init.sh`, `package.json`, or `eslint.config.js` (no dependency-graph change).

## Job Story

When I coach one RFEF age group, I want to pick my bracket once and immediately see that bracket's program and drills, so the app stops showing me generic content and stops asking me to choose again every time I change tabs.

## Users And Permissions

- **Anonymous coach:** selects a category and browses filtered content. No account, no AI request, no quota impact.
- **Implementer:** adds presentation state/components, one shared UI primitive, and composition-root wiring.
- **Validator:** re-runs the gate, checks the three feature_list scenarios on a device, and confirms no content, board, AI, or version change.

## Acceptance Scenarios

### Scenario 1: Infantil U14 filters to Infantil only (feature_list #1)

Given the app open on Explorar with no category selected
When the coach taps `Infantil (U14)`
Then the programming card shows `infantil-u14-base` (`Foco Metodológico Infantil`, `Etapa de asimilación táctica cognitiva`, `Sesiones de 60–75 min`) and the library lists exactly the nine Infantil exercise ids in package order with the label `9 ejercicios`; no Cadete-, Juvenil-, or Senior-only title is visible.

### Scenario 2: Senior swaps the content (feature_list #2)

Given Infantil U14 is selected
When the coach taps `Senior (+18)`
Then the programming card shows `senior-base` (`Foco Metodológico Senior`, `Etapa de rendimiento y gestión del modelo de juego`, `Sesiones de 75–90 min`) and the library lists exactly `salida-3-2-cambio-ala`, `defensa-3-1-presion-cierre`, `transicion-5v4-carril-central` with `3 ejercicios`; the nine Infantil titles are gone and only the Senior chip is marked selected.

### Scenario 3: A two-category exercise appears under both (feature_list #3)

Given the bundled seed, where `salida-3-1-presion-alta` is tagged `infantil` + `cadete`
When the coach selects `Cadete (U16)` and then `Infantil (U14)`
Then `Salida 3-1 ante presión alta` appears once in the Cadete list (first, because package order is preserved) and once in the Infantil list, and never twice inside one list.

### Scenario 4: Selection persists while navigating

Given `Alevín (U12)` is selected on Explorar
When the coach opens the Pizarra tab, returns to Explorar, then opens `/design-system` and returns
Then `Alevín (U12)` is still the only selected chip and the same programming record (`alevin-u12-base`) and three Alevín exercises render without re-selecting.

### Scenario 5: Empty and unselected states are explicit

Given no category selected
When Explorar renders
Then it shows the prompt `Elige una categoría` plus `Selecciona un tramo RFEF para ver su programación y su biblioteca de ejercicios.` and lists no exercises.
Given a repository whose selected category has no publishable Programming record
When the model renders
Then the card shows `La programación de esta categoría estará disponible pronto.` and no content is invented.

### Scenario 6: Only RFEF brackets are selectable

Given the seven category chips
When they are rendered and the selection state is exercised with a non-RFEF value such as `chupetin`
Then the chips are exactly `Prebenjamín (U8)`, `Benjamín (U10)`, `Alevín (U12)`, `Infantil (U14)`, `Cadete (U16)`, `Juvenil (U19)`, `Senior (+18)` in `CATEGORY_IDS` order, and the state ignores the unknown id without throwing or clearing the current selection.

### Scenario 7: Read-layer visibility is not re-implemented

Given a repository that returns draft, archived, and published-but-unlicensed records
When the browse model is built
Then those records never appear, because the model consumes `listExercises`/`getProgramming` and never filters `status`/`provenance` itself.

### Scenario 8: The app still starts and the other tabs are unchanged

Given the finished feature
When `npm run verify`, `./init.sh`, the Android export, and the device smoke run
Then all pass, Explorer is the only changed screen, Pizarra/Asistente IA/Mi Club are unchanged, and a fresh launch starts with no category selected.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, `ARCHITECTURE.md` — branch workflow, accepted baseline (170 tests / 131 suites), layering, composition-root rules, `node:test` limitation, and the neighbouring `explore-general-screen` / `explore-by-category-screen` / `exercise-detail-screen` entries.
- `CONTEXT.md`, `docs/domain-model.md`, `docs/build-brief.md`, `DESIGN.md` — Category = RFEF bracket (never a skill tier), multi-category edge case, prototype screen split, tokens, 44 px touch targets, "never rely on color alone".
- `docs/content-model.md`, `docs/content-licensing.md`, `docs/technical-discovery.md`, `docs/risks-and-open-questions.md`.
- `src/modules/content/{index.ts,README.md}`, `domain/{category,exercise,programming}.ts`, `application/{list-categories,list-exercises,get-exercise,get-programming}.ts`, `infrastructure/bundled-content-repository.ts`, `presentation/screens/explore-screen.tsx`.
- `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx`.
- `src/shared/ui/{index,chip,button,card,text}.tsx`, `src/shared/ui/layout/section-placeholder.tsx`, `src/shared/theme/{colors,spacing,radius,typography}.ts`, `eslint.config.js`.
- `tests/modules/content/{index,application/content-queries,infrastructure/*}.test.ts`, `tests/architecture/architecture.test.ts`.
- `docs/design/prototype/02-explore-by-category/code.html` (category selector section only; screenshots and the other three prototypes were not inspected in this pass).
- `docs/device-development-workflow.md`.

### Existing Patterns To Follow

- Presentation imports its own `domain`/`application` and `shared/ui`/`shared/theme`; it may **not** import `infrastructure` (`eslint-plugin-boundaries`), so the bundled adapter is wired in `src/app`.
- Read content only through `listCategories`/`listExercises`/`getProgramming`; visibility and dedup are already solved there.
- Screens are exported from the module public API; route files stay thin (`export default` wrapper or a two-line component).
- Node tests import module layers directly (never a public API that re-exports a screen), use `node:test` + Given/When/Then, and mirror the source path.
- UI copy in Spanish, identifiers/tests/docs in English, tokens only (no literal hex, no new fonts or shadows).

### Current Gaps

- `ExploreScreen` is still a `SectionPlaceholder` with "EN CONSTRUCCIÓN"; no selection state, no filtered content, no consumer of the read layer.
- `Chip` is a non-interactive `View` and too short for a 44 dp touch target, so it cannot serve as a filter pill.
- Nothing mounts a content-level provider; `src/app/_layout.tsx` only loads fonts and the stack.
- No React Native component-test runner exists (see Planning-Time Risks).

## State And Persistence Decision

**Chosen mechanism:** an in-memory React context owned by `content/presentation`, mounted once in `src/app/_layout.tsx` (root stack), exposing `useCategorySelection()`. It is created with React state and is never written to device storage.

Why this satisfies "the selection persists while navigating" and nothing more:

- The requirement is navigation-scoped ("persists while navigating"), not restart-scoped; the feature note says anonymous, no registration.
- The root layout covers every route — tabs, `/design-system`, and future detail/board routes pushed outside `(tabs)` — so tab switches, back navigation, and stack pushes keep the value. A mount inside `(tabs)` would lose state on a future root-level detail route.
- `AsyncStorage` or URL params would exceed the requirement: storage adds an infrastructure port with no owner yet (restart persistence is `local-ai-results-persistence` territory), and URL state would force every link to carry `?categoria=` and couple routes to state.
- A restart resetting to "no category selected" is the documented, expected behavior (Scenario 8) and is verified on the device.

Contract: `{ categoryId: CategoryId | null }`; `null` means "not chosen yet". `selectCategory` replaces the value (no stacking, no multi-select) and ignores ids that fail `isCategoryId`. No default category is pre-selected — defaulting to Infantil would bias the first impression and make Scenario 1 untestable.

## UX And State Design

Layout inside the existing `SectionPlaceholder` (eyebrow `Futsal Manager AI`, title `Explorar`, description `Programación semanal y ejercicios por categoría para tus sesiones.`):

1. `CATEGORÍA` mono label, then one horizontally scrollable row of seven `FilterChip` pills (prototype 02 selector). The row bleeds to the screen edge with a negative margin, `gap: spacing.xs`, no wrapping, no page dots.
2. Programming summary `Card`: mono label `Programación · <formatCategoryLabel>`, `headlineSm` = `programming.focus`, `bodyLg` `textVariant` = `programming.formativeStage`, mono meta = `formatSessionDuration(programming)`.
3. Library block: `headlineSm` `Biblioteca de ejercicios`, mono count `formatExerciseCount(exercises.length)`, then one `Card` per exercise with `headlineSm` title, `bodyMd` `textVariant` summary, and mono meta `formatExerciseMeta(exercise)`.
4. Keep the existing `Ver sistema de diseño` secondary button at the bottom so the accepted gallery round trip still works.

States: `unselected` (prompt only), `selected` (cards above), `programming missing` (Spanish empty copy, exercises still listed), `exercises empty` (`Todavía no hay ejercicios para esta categoría.` — defensive; the seed is non-empty). No loading state: content is bundled and synchronous. No error state beyond the package parse already failing tests/build.

Copy contract (Spanish, pinned): chip labels above; `Elige una categoría`; `Selecciona un tramo RFEF para ver su programación y su biblioteca de ejercicios.`; `Programación · Alevín (U12)`; `Sesiones de 60–75 min`; `Biblioteca de ejercicios`; `9 ejercicios` / `1 ejercicio`; `15 min · 10 jugadores · Intensidad alta`; intensity labels `Baja`/`Media`/`Alta`; the two empty copies above.

Accessibility and design constraints: pills are 44 dp minimum height with `accessibilityRole="button"`, `accessibilityState={{ selected }}`, and a Spanish `accessibilityLabel`; selection is signalled by the emerald fill **and** a leading check glyph, never color alone; tokens only (`primary`/`onPrimary`, `surfaceContainerLow`, `outlineVariant`, `text`; `labelMd`; `radius.full`); no new colors, fonts, or shadows; text `bodyMd` 14 px stays consistent with the accepted screen (DESIGN.md's 16 px body minimum is a known accepted deviation).

## Technical Approach

1. **Pure selection state** (`presentation/state/category-selection.ts`, no React/RN imports): `CategorySelection`, `INITIAL_CATEGORY_SELECTION`, `selectCategory(state, categoryId)` — valid RFEF id returns a new object, anything else returns the same reference.
2. **Provider + hook** (`presentation/state/category-selection-provider.tsx`): React context with `useState`, memoized `selectedCategory` via `getCategoryById`, `selectCategory` callback, and a hook that throws `useCategorySelection must be used inside CategorySelectionProvider.` outside the provider. Export both from `src/modules/content/index.ts`; mount the provider in `src/app/_layout.tsx` around the returned `Stack`.
3. **Browse view model** (`presentation/view-models/category-browse-model.ts`, pure): `buildCategoryBrowseModel(repository, category)` returns `{ category, programming: getProgramming(repository, category.id), exercises: listExercises(repository, { categoryId: category.id }) }`; plus `formatCategoryLabel`, `formatExerciseMeta`, `formatSessionDuration`, `formatExerciseCount`. No visibility logic of its own.
4. **Screen** (`presentation/screens/explore-screen.tsx`): `ExploreScreen({ repository }: { repository: ContentRepository })` reads the hook, computes `listCategories()` once per render (frozen reference data), builds the model only when a category is selected, and renders `CategoryFilterBar` → `ProgrammingSummaryCard` → `ExerciseLibraryList`. New dumb components live in `presentation/components/` and receive props.
5. **Composition root** (`src/app/(tabs)/index.tsx`): `const repository = createBundledContentRepository();` at module scope (the factory caches the parsed package) and `export default function ExplorarRoute() { return <ExploreScreen repository={repository} />; }`.
6. **Shared primitive** (`src/shared/ui/filter-chip.tsx`): `FilterChip({ label, selected, onPress, accessibilityLabel })` as described above (single-line `AppText` `numberOfLines={1}`), exported from `src/shared/ui/index.ts`. `Chip` stays untouched so existing gallery/status chips do not change.

## Expected Files To Change

- **New:** `src/modules/content/presentation/state/category-selection.ts`, `src/modules/content/presentation/state/category-selection-provider.tsx`, `src/modules/content/presentation/view-models/category-browse-model.ts`, `src/modules/content/presentation/components/{category-filter-bar,programming-summary-card,exercise-library-list}.tsx`, `src/shared/ui/filter-chip.tsx`.
- **Changed:** `src/modules/content/presentation/screens/explore-screen.tsx`, `src/modules/content/index.ts`, `src/modules/content/README.md`, `src/shared/ui/index.ts`, `src/app/_layout.tsx`, `src/app/(tabs)/index.tsx`.
- **New tests:** `tests/modules/content/presentation/state/category-selection.test.ts`, `tests/modules/content/presentation/view-models/category-browse-model.test.ts`, `tests/modules/content/presentation/composition-wiring.test.ts`.
- **Changed test:** `tests/modules/content/index.test.ts` (public API surface).
- **Docs:** this spec, `ARCHITECTURE.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, `docs/content-model.md`, `docs/domain-model.md`, `docs/risks-and-open-questions.md`.
- **Unchanged:** `content-package.json`, all content domain/application/infrastructure files, `src/shared/domain`, `src/shared/theme`, board/ai/club modules, `eslint.config.js`, `package.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, `docs/build-brief.md`.

## Test Plan

| File | Type | Assertions |
| --- | --- | --- |
| `presentation/view-models/category-browse-model.test.ts` (new) | real bundled package + fakes | Infantil → `infantil-u14-base` + the nine Infantil ids in package order; Senior → `senior-base` + the three Senior ids and no Infantil id; Cadete and Infantil both contain `salida-3-1-presion-alta` exactly once (Scenario 3); fake repository without Programming → `programming === null` with exercises still listed; draft/archived/unlicensed fake records never appear; `formatCategoryLabel`/`formatExerciseMeta`/`formatSessionDuration`/`formatExerciseCount` (including `1 ejercicio`) produce the pinned Spanish copy. |
| `presentation/state/category-selection.test.ts` (new) | pure | initial state is `null`; selecting an RFEF id stores it; selecting another replaces it; `chupetin`-style unknown ids are ignored and keep the previous selection; valid transitions return a new object while ignored ones return the same reference. |
| `presentation/composition-wiring.test.ts` (new) | source structure | `src/app/_layout.tsx` renders `CategorySelectionProvider` imported from `@/modules/content`; `src/app/(tabs)/index.tsx` wires `createBundledContentRepository` from `@/modules/content` and references no module internal path or JSON file. |
| `tests/modules/content/index.test.ts` (update) | public API barrel | the barrel also exports `CategorySelectionProvider`, `useCategorySelection`, `buildCategoryBrowseModel`, `formatCategoryLabel`, `formatExerciseMeta`, `formatSessionDuration`, `formatExerciseCount`, `selectCategory`, `INITIAL_CATEGORY_SELECTION`; existing exports unchanged. |
| existing content/architecture suites | unchanged | `content-queries`, seed suites, boundaries, and architecture tests stay green with no edits. |

No React component renderer is added: `node:test` + `tsx` cannot load React Native, and the repository has no component-test runner. Presentation behavior is covered by the pure view model/reducer tests, the composition-wiring test, and the device smoke. Record the exact before/after counts (baseline 170 tests / 131 suites); do not pin a number.

## Verification Plan

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run verify` (expo-doctor 20/20), `./init.sh` exit 0 without Metro.
- Literal-style scan: `rg '#[0-9a-fA-F]{3,8}' src/shared/ui src/modules/content/presentation` returns no matches.
- `npx expo export --platform android`; `strings` on the bundle finds `Elige una categoría`, `Biblioteca de ejercicios`, and `Foco Metodológico Senior`.
- **Android device smoke** (`SM-M135F`, Android 14, Expo Go 58.0.5, `adb reverse tcp:8081 tcp:8081`, per `docs/device-development-workflow.md`):
  1. Cold launch: Explorar shows the seven chips and `Elige una categoría`; no exercise card is visible.
  2. Tap `Infantil (U14)`; `uiautomator` dump shows `Foco Metodológico Infantil`, `Sesiones de 60–75 min`, `9 ejercicios`, and Infantil titles; no `Senior`-only title.
  3. Tap `Senior (+18)`; dump shows `Foco Metodológico Senior`, `3 ejercicios`, the three Senior titles, and no Infantil title (Scenario 2).
  4. Tap `Cadete (U16)` → `Salida 3-1 ante presión alta` visible first; tap `Infantil (U14)` → the same title visible (Scenario 3).
  5. Select `Alevín (U12)`, open Pizarra, return to Explorar, open `/design-system`, return: selection and list unchanged (Scenario 4).
  6. Force-stop and relaunch: Explorar resets to `Elige una categoría` (documented session-only behavior).
  7. Chip row: swipe horizontally to reach `Senior (+18)`; each chip measures ≥ 44 dp tall; the selected chip shows the check glyph (not color alone).
  8. At 320 dp width and `font_scale 1.3`, content stays readable and the chip row scrolls instead of clipping; restore the device settings afterwards.
  9. `adb logcat` shows no React Native errors/exceptions; Pizarra, Asistente IA, and Mi Club render unchanged.
- Persistent E2E: none exists; the view-model tests plus the scripted device smoke are the agreed coverage for this feature.

## Durable Documentation Impact

- `ARCHITECTURE.md` — **update:** `content.presentation` now owns the category browse screen, session selection state, and the browse view model; note the composition-root wiring pattern `route → createBundledContentRepository → ExploreScreen({ repository })` and that the selection provider is mounted once in `src/app/_layout.tsx`. No layer, port, or dependency-graph change.
- `docs/content-model.md` — **update:** the read layer now has a screen consumer; Known Gaps drops "no screen consumer"; record that category selection is session-only UI state in `content/presentation`.
- `docs/domain-model.md` — **update:** add "Category selection (UI state, session only): unselected → selected; resets on app restart" to States and Lifecycles.
- `docs/risks-and-open-questions.md` — **update:** add the session-only selection expectation and the missing React Native component-test runner as implementation-time items.
- `src/modules/content/README.md` — **update:** presentation layer, public API additions, test location.
- `AGENTS.md` — **update:** project status (first browsing UI + session category selection), next ready feature `explore-general-screen`.
- `PROGRESS.md` and `feature_list.json` — **update:** evidence and state.
- `CONSTRAINTS.md` — **not needed:** the file does not exist.
- `DESIGN.md`, `CONTEXT.md`, `docs/build-brief.md`, `docs/technical-discovery.md`, `docs/board-data-schema.md` — **not needed:** no new token, vocabulary, product, stack, or Board Data change; the filter pill derives from prototype 02 with existing tokens.

## Implementation Plan

1. Add the pure selection state and the provider/hook, export them, and mount the provider in the root layout.
2. Add `FilterChip` to `shared/ui` (tokens, 44 dp, check glyph, accessibility state).
3. Add the pure browse view model and its formatters; write the view-model and state tests against the bundled package and fake repositories.
4. Build `CategoryFilterBar`, `ProgrammingSummaryCard`, `ExerciseLibraryList`, then rewrite `ExploreScreen` to accept `repository` and compose them.
5. Wire `src/app/(tabs)/index.tsx` to `createBundledContentRepository()`; keep the design-system link.
6. Update the public API surface test and add the composition-wiring test; run the full gate.
7. Run the device smoke script, capture `uiautomator` text and screenshots, then update the durable docs and harness state.

## Implementation Tasks

- [x] Add `category-selection.ts` (`CategorySelection`, `INITIAL_CATEGORY_SELECTION`, `selectCategory`) with no React/RN imports.
- [x] Add `category-selection-provider.tsx` (`CategorySelectionProvider`, `useCategorySelection`) and export both from `src/modules/content/index.ts`.
- [x] Mount `CategorySelectionProvider` in `src/app/_layout.tsx`.
- [x] Add `FilterChip` to `src/shared/ui` and export it; leave `Chip` unchanged.
- [x] Add `category-browse-model.ts` with `buildCategoryBrowseModel` and the four formatters.
- [x] Add `CategoryFilterBar`, `ProgrammingSummaryCard`, `ExerciseLibraryList` using tokens only.
- [x] Rewrite `ExploreScreen({ repository })` with unselected/selected/empty states and pinned Spanish copy.
- [x] Wire `src/app/(tabs)/index.tsx` to the bundled repository and keep the gallery link.
- [x] Add the two presentation test files and the composition-wiring test; update `index.test.ts`.
- [x] Update `ARCHITECTURE.md`, `docs/content-model.md`, `docs/domain-model.md`, `docs/risks-and-open-questions.md`, `src/modules/content/README.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`.
- [x] Run the gate, Android export, and the device smoke; record evidence and tick this checklist.

## Evidence To Capture

- Test/suite counts before and after and the three new test files' assertions passing.
- `npm run lint`/`typecheck`/`verify` exit codes with the expo-doctor score; `./init.sh` exit code.
- Strict-mode scan showing no literal colors in the new presentation and shared UI files.
- Android export size plus the Spanish strings found in the bundle.
- Device model/density, `uiautomator` text dumps for Scenarios 1–4, chip heights, the horizontal-swipe result, the 320 dp/1.3 font-scale check, and `logcat` status.
- Confirmation that content, Board Data, versions, ports, use cases, AI, and board code are unchanged, and that the selection resets after a force-stop.

## Validator Checklist

- [x] Scope matches this spec: no changes to `content-package.json`, content domain/application/infrastructure, Board Data, AI, board, `package.json`, `eslint.config.js`, or `init.sh`.
- [x] Only RFEF brackets are selectable; no Chupetín-style stage, no skill tiers, no "Todos" option, no default category.
- [x] Selection state is in-memory only, mounted once at the root layout, and survives tab switches plus the `/design-system` round trip; it resets on relaunch.
- [x] The browse view model goes through `listExercises`/`getProgramming`; no local `status`/`provenance` filtering, no `infrastructure` import from presentation.
- [x] Scenario 1 (Infantil: 9 exercises + `infantil-u14-base`), Scenario 2 (Senior swap), and Scenario 3 (`salida-3-1-presion-alta` under Infantil and Cadete, once per list) pass on the device.
- [x] `FilterChip` uses tokens only, meets the 44 dp target, exposes `accessibilityState.selected`, and signals selection with more than color.
- [x] The route file stays thin and wires the adapter from `@/modules/content`; screens stay in `content/presentation`.
- [x] New tests are Given/When/Then, mirror the source tree, and pass with the full suite; the public-API surface test is updated.
- [x] Durable docs updated as listed; task checkboxes ticked; evidence recorded in `feature_list.json` and `PROGRESS.md`.

## Planning-Time Risks

- **Overlap with neighbouring features.** The Explorar layout will be rebuilt by `explore-general-screen` and the category detail by `explore-by-category-screen`. Mitigation: this spec builds only the filter mechanism plus a minimal summary/list, keeps components prop-driven and free of prototype-specific chrome, and adds no board or detail navigation.
- **No React Native component tests.** `node:test` cannot render RN and the repo has no component-test runner, which deviates from `ARCHITECTURE.md`'s "add RNTL when the first interactive screen lands". Mitigation: pure view-model/reducer tests + composition-wiring test + scripted device smoke, and a follow-up test-infra item recorded in `docs/risks-and-open-questions.md`; adopting a Jest-based component runner is its own feature-sized decision.
- **Persistence expectation gap.** A coach may assume the category survives app restart. Mitigation: documented session-only behavior, explicit device check, and a risk entry naming the future owner (`local-ai-results-persistence` or a settings feature).
- **Filter pill as new design-system surface.** A primitive added outside the gallery could drift. Mitigation: tokens only, prototype 02 as the reference, and device inspection of selected/unselected states; no change to existing `Chip` consumers.
- **Narrow widths and large font scales.** Seven Spanish labels cannot fit one row and can truncate (precedent: `Asistente IA`). Mitigation: single-line pills (`numberOfLines={1}`, prototype nowrap) inside a horizontal `ScrollView` with no fixed chip widths, so extra width becomes scroll instead of clipping, plus a 320 dp/1.3 scale device check.
- **Single source of truth for the selected category.** Future AI/detail features must read the same hook, not the tab's local state. Mitigation: export only the provider/hook, document the wiring in `ARCHITECTURE.md`, and keep `ExploreScreen` free of ad-hoc state.
- **Threading the repository through props.** More future screens will need the same adapter. Mitigation: state the `route → adapter factory → screen prop` pattern once in `ARCHITECTURE.md` so the next screens copy it instead of importing infrastructure into presentation.
- **Cold-start cost.** The bundled package is parsed on first navigation to Explorar (cached afterwards). Mitigation: module-scope factory call, and confirm launch/reload timing is not visibly worse in the device smoke.
