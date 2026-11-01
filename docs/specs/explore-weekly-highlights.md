# Feature Implementation Spec: Explore weekly block layout and AI card order

## Source Feature

- **id:** `explore-weekly-highlights`
- **area:** `browse`
- **status:** `accepted`
- **depends_on:** `seed-weekly-highlights` (accepted), `explore-general-screen` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/explore-weekly-highlights` (stacked on `feat/seed-weekly-highlights` @ `4e89f75`)
- **spec path:** `docs/specs/explore-weekly-highlights.md`
- **baseline:** `4e89f75`, clean tree, `npm test` verified in this planning run at **356 tests / 227 suites**; package `1.2.0` with 71 exercises (50 `library` + 21 `weekly`) and 7 Programming records; Board Data `1.0.0`.
- **size check:** correctly sized. Two source files, one test file, no new module/layer/route/contract. No split needed.

## Goal

The coach asked, on 2026-10-28, that Explorar stop leading with the AI card and instead close with it: the AI session entry must be the **last product card** on the screen, directly above the retained `Ver sistema de diseño` development link, so the browsing stack (hero → filter → methodology → weekly → library) reads as one continuous block and the AI entry acts as the closing call to action.

`seed-weekly-highlights` already switched the weekly block to the non-library `weekly` collection and pinned its copy. This feature only finishes the composition:

1. Move `AiSessionEntryCard` to the end of the scroll content — after the methodology/weekly/library stack when a category is selected, and after the `Elige una categoría` prompt when nothing is selected.
2. Remove the now-dead `totalCount` prop from `WeeklyExercises` and from its only call site, keeping the pinned `Una selección fuera de la biblioteca` / `3 ejercicios` copy.
3. Leave everything else byte-identical: hero, filter, methodology card, weekly block internals, grouped library, `AiSessionEntryCard` internals, `Link href="/asistente"`, tokens, spacing, accessibility and session-only selection.

## Non-Goals

- No content, package, parser, read-layer, provenance, `references`, `collection` or version change: `CONTENT_PACKAGE_VERSION`/`contentVersion` stay `1.2.0`, `infantil-u14-base` `1.1.0`, Board Data `1.0.0`.
- No copy change anywhere. The weekly subtitle, counter, empty states, prompt, hero, methodology and AI card strings stay exactly as accepted.
- No restyle: no token, spacing, radius, color, font or `shared/ui` change; the `ScrollView` `contentContainer` `gap: spacing.lg` already produces the same rhythm for the new neighbor pairs.
- No new component, wrapper, section heading or `View` around the AI card; it stays a single `<AiSessionEntryCard />` element.
- No navigation to exercise detail, no board rendering/thumbnail, no AI prompt/input/`Generar`, no AI module import, no quota work.
- No route, provider, selection-state, `src/app/**`, `src/shared/**`, `src/modules/{board,ai,club}/**`, `package.json`, `eslint.config.js`, `init.sh` or dependency change.
- No React Native component-test runner, no E2E harness, no new test dependency.
- `DESIGN.md` is not edited even though its narrative list mentions the AI entry before the methodology card; the divergence is an explicit coach decision recorded in this spec (see Risks).

## Job Story

When I open Explorar and read my category's methodology, weekly highlights and library, I want the session-generator entry to be the last thing I see before I leave the screen, so the browsing stack is uninterrupted and the AI card reads as the closing action instead of breaking the reading flow near the top.

## Final Composition (contractual)

Both states render from the same `ExploreScreen` scroll content with `gap: spacing.lg`. The only branch is the category-specific middle block.

### Selected category state — top to bottom

1. App bar: `FM` brand mark + `Futsal Manager AI` header.
2. `<ExploreHero stats={generalModel.stats} />` — `71 Ejercicios` from the read layer.
3. `<CategoryFilterBar ... />` — seven RFEF chips.
4. `<MethodologyOverviewCard category={browseModel.category} methodology={generalModel.methodology} />`.
5. `<WeeklyExercises exercises={generalModel.weeklyExercises} />` — **no `totalCount`**.
6. `<ExerciseLibraryList groups={browseModel.sessionParts} />`.
7. `<AiSessionEntryCard />` — **last product card**.
8. `<Link href="/design-system" asChild><AppButton label="Ver sistema de diseño" variant="secondary" fullWidth /></Link>` — technical footer, still last in the file.

### No category selected state — top to bottom

1. App bar.
2. `<ExploreHero stats={generalModel.stats} />`.
3. `<CategoryFilterBar ... />`.
4. The `Elige una categoría` prompt `<Card>` (header + `Selecciona un tramo RFEF para ver su programación y su biblioteca de ejercicios.`).
5. `<AiSessionEntryCard />` — **last product card**, now below the prompt.
6. `Ver sistema de diseño` link.

### Source shape (the only structural change)

`<AiSessionEntryCard />` moves out of position 4 (between `CategoryFilterBar` and the branch) to a single occurrence **after the ternary closes and before the `<Link>`** — one element outside both branches, so both orders above hold automatically:

```
<CategoryFilterBar ... />
{browseModel ? (<> methodology → weekly → library </>) : (<Card> prompt </Card>)}
<AiSessionEntryCard />
<Link href="/design-system" asChild>…</Link>
```

## Acceptance Scenarios

### Scenario 1: Selected state ends with the AI card

Given the bundled repository and a selected RFEF category (e.g. Infantil U14)
When Explorar renders
Then the product order is exactly hero → `CategoryFilterBar` → `MethodologyOverviewCard` → `WeeklyExercises` → `ExerciseLibraryList` → `AiSessionEntryCard`, each appearing once, and the `Ver sistema de diseño` link is the only element after the AI card.

### Scenario 2: Unselected state ends with the AI card

Given a cold launch with no category selected
When Explorar renders
Then the order is hero → `CategoryFilterBar` → `Elige una categoría` prompt → `AiSessionEntryCard` → `Ver sistema de diseño`, and the AI card is no longer between the filter and the prompt.

### Scenario 3: The AI card is rendered once and is reachable

Given the Explorar screen source and the rendered screen with a category selected
When I scroll to the bottom
Then `<AiSessionEntryCard` appears exactly once in `explore-screen.tsx`, sits after both the library list and the `Elige una categoría` prompt in source order, and renders as a full card bearing `Pídele una sesión a la IA`, `PRÓXIMAMENTE` and the `Abrir Asistente IA` CTA; tapping the CTA opens the existing Asistente IA tab (`/asistente`), and returning to Explorar keeps the category selected.

### Scenario 4: The CTA keeps its accepted size and internals

Given the moved card on `SM-M135F` (450 dpi)
When the card is measured
Then the `Abrir Asistente IA` button is still `850x135` px = `302x48` dp (full card width, `minHeight: spacing.xl + spacing.md`), `variant="ai"`, `fullWidth`, with `accessibilityLabel="Abrir Asistente IA"` and its `accessibilityHint`, and `ai-session-entry-card.tsx` is unchanged.

### Scenario 5: Weekly copy unchanged, dead prop gone

Given the weekly block
When it renders for a category with three weekly highlights
Then it shows `Ejercicios de la Semana`, `Una selección fuera de la biblioteca`, the counter `3 ejercicios` from `formatWeeklySelection(exercises.length)`, and the three session-part cards in warm-up → main → cool-down order.
And `WeeklyExercisesProps` no longer declares `totalCount`, `ExploreScreen` no longer passes it, and neither file contains the identifier `totalCount`.

### Scenario 6: Library and weekly data unchanged

Given Explorar with Infantil U14 and then Prebenjamín selected
When the library and weekly blocks render
Then the library still shows 9 (2/5/2) and 7 (2/3/2) exercises under `CALENTAMIENTO` / `PARTE GENERAL` / `VUELTA A LA CALMA` with no weekly title repeated, and the weekly blocks still show the seeded weekly highlights (`Activación con pases entre líneas` / `Ataque 3-1 con cambio de orientación` / `Rondo de cierre con movilidad`; `Activación con pases y nombres` / `Juego de las cuatro esquinas` / `Rondo tranquilo en círculo`).

### Scenario 7: No dead control or forbidden change

Given the finished feature
When the diff and scans run
Then no input, `Generar`, `Ver Pizarra Táctica`, `Todas las Categorías`, `Ver Todos` or `180+` appears; `content-package.json`, domain/application/infrastructure, `src/app/**`, `src/shared/**`, `board`/`ai`/`club`, `package.json`, `eslint.config.js` and `init.sh` are unchanged; no literal hex color or `content/infrastructure` import enters `content/presentation`; and `AiSessionEntryCard` keeps `Link href="/asistente"` with no `modules/ai` import and no `fetch(`.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md` (Sessions 019–020 and Current Verified State), `feature_list.json` (`explore-weekly-highlights`, `seed-weekly-highlights`, `explore-general-screen`, `explore-by-category-screen`, `exercise-detail-screen`).
- `ARCHITECTURE.md` (module catalog `content` presentation paragraph, allowed dependencies, composition root), `src/modules/content/README.md` (layers, public API, browse flow), `DESIGN.md` (design tokens and the screen list).
- `docs/specs/explore-general-screen.md`, `docs/specs/seed-weekly-highlights.md` (pinned order, copy, evidence and scope conventions).
- `src/modules/content/presentation/screens/explore-screen.tsx`, `components/{ai-session-entry-card,weekly-exercises,exercise-library-list,explore-hero,category-filter-bar,methodology-overview-card}.tsx`, `view-models/{explore-general-model,category-browse-model}.ts`, `state/category-selection-provider.tsx`.
- `tests/modules/content/presentation/screens/explore-general-screen.test.ts`, `presentation/composition-wiring.test.ts`, `presentation/view-models/{explore-general-model,category-browse-model}.test.ts`.
- Verified baseline in this planning run: `npm test` → **356 tests / 227 suites, 0 fail**.

### Current Gaps

- `explore-screen.tsx:49` renders `<AiSessionEntryCard />` between `CategoryFilterBar` and the category branch, so the AI card splits the browsing stack and sits above the prompt.
- `weekly-exercises.tsx:11-14` still declares `totalCount: number` and `explore-screen.tsx:58` still passes `browseModel.exercises.length`, although the component stopped reading the prop in `seed-weekly-highlights`. It is dead surface that misleads future readers and keeps an unnecessary library-model read in the call site the test suite still guards (`/totalCount\b(?!:)/`).
- The composition guard in `explore-general-screen.test.ts` still asserts the *old* order (`<AiSessionEntryCard` before `<MethodologyOverviewCard`) and the gallery-link check only compares against `<ExerciseLibraryList`, so it cannot detect a regression to the previous layout.
- `ARCHITECTURE.md:157`, `src/modules/content/README.md:10` and the `AGENTS.md` status paragraph describe the AI card in its old position.

### Existing Patterns To Follow

- `content/presentation` only; `ExploreScreen` receives `ContentRepository` as a prop and reads selection from `useCategorySelection()`.
- Components are prop-driven and use `shared/ui`/`shared/theme` only; literal colors and infrastructure imports are forbidden and scanned by the existing guard.
- Presentation tests are `node:test` source-structure/non-regression suites (no React Native renderer), written as Given/When/Then with `describe` wrappers; the pure view models and selectors carry behavior coverage.
- The route stays thin: `src/app/(tabs)/index.tsx` → `createBundledContentRepository()` → `ExploreScreen({ repository })`; this feature touches neither.

## Expected Files By Module And Layer

| Module | Layer | File | Change |
| --- | --- | --- | --- |
| `content` | presentation | `src/modules/content/presentation/screens/explore-screen.tsx` | move `<AiSessionEntryCard />` after the category branch and immediately before the `<Link href="/design-system">`; drop `totalCount={browseModel.exercises.length}` |
| `content` | presentation | `src/modules/content/presentation/components/weekly-exercises.tsx` | remove `totalCount: number;` from `WeeklyExercisesProps` (destructuring already ignores it); no JSX, style or copy change |
| tests | presentation | `tests/modules/content/presentation/screens/explore-general-screen.test.ts` | pin the new order in both states, single AI card, no `totalCount`, AI card before the gallery link |
| docs | — | `ARCHITECTURE.md`, `src/modules/content/README.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json` | composition-order text and verification evidence |
| docs | — | `docs/specs/explore-weekly-highlights.md` | this spec |

Explicitly unchanged: `src/app/**`, `src/shared/**`, `src/modules/{board,ai,club}/**`, content `domain`/`application`/`infrastructure`, `content-package.json`, `index.ts` (no export change), `ai-session-entry-card.tsx`, `explore-hero.tsx`, `category-filter-bar.tsx`, `methodology-overview-card.tsx`, `exercise-library-list.tsx`, `state/**`, both view models, `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md`, `docs/content-model.md`, `docs/content-licensing.md`, `package.json`, `eslint.config.js`, `init.sh`.

## Test Plan (exact counts)

Baseline: **356 tests / 227 suites** (`npm test` at `4e89f75`, re-verified in this planning run). Target after this feature: **358 tests / 227 suites** (+2 tests, +0 suites). Per-file baseline: `explore-general-screen.test.ts` 11 tests / 9 suites, `explore-general-model.test.ts` 17 / 23, `category-browse-model.test.ts` 10 / 17. After the change `explore-general-screen.test.ts` reads 13 / 9 because both new cases land inside existing `describe` blocks; if the implementer wraps them in new Given/When `describe`s, suites become 229 and that must be stated in the evidence instead.

No React Native component-test runner and no E2E harness exist; coverage is the source-structure guard plus the untouched pure view-model suites.

### Updates in `tests/modules/content/presentation/screens/explore-general-screen.test.ts`

1. **Rewrite the order test** (`then it renders the hero, filter, AI card, methodology, weekly block, and library in prototype order`) to `then it renders the hero, filter, methodology, weekly block, library, and AI card in the final order` with the tag list `['<ExploreHero', '<CategoryFilterBar', '<MethodologyOverviewCard', '<WeeklyExercises', '<ExerciseLibraryList', '<AiSessionEntryCard']`, keeping the same ascending-index assertion. The branch arms are in source order, so this pins the selected state.
2. **Extend the gallery-link test** to also assert `indexOf('<AiSessionEntryCard') < indexOf('href="/design-system"')` and `indexOf('href="/design-system"') > indexOf('<ExerciseLibraryList')`, i.e. the link is the technical footer and the AI card is the last product card.
3. **Rewrite the weekly `totalCount` assertion** from `assert.doesNotMatch(weeklyExercisesSource, /totalCount\b(?!:)/)` to `assert.doesNotMatch(weeklyExercisesSource, /totalCount/)` and add `assert.doesNotMatch(exploreScreenSource, /totalCount/)`, so the dead prop cannot return on either side.
4. **New test (+1)** in the `When the JSX composition is inspected` block: `then it renders the AI card once, after both category branches`, asserting the `<AiSessionEntryCard` occurrence count is exactly 1 and that its index is greater than the indices of `Elige una categoría` (the else-branch prompt) and `<ExerciseLibraryList` — that source position is what makes it follow the prompt when unselected and the library when selected.
5. **New test (+1)**: `then it keeps the accepted AI card internals while moving it`, asserting `ai-session-entry-card.tsx` still contains `href="/asistente"`, `variant="ai"`, `fullWidth`, `minHeight: spacing.xl + spacing.md`, `Pídele una sesión a la IA` and `PRÓXIMAMENTE` (guards against an accidental restyle during the move).

### Pure view-model non-regression

`tests/modules/content/presentation/view-models/explore-general-model.test.ts` (17 tests / 23 suites) and `category-browse-model.test.ts` (10 / 17) are **not edited**; their unmodified pass is the evidence that the weekly slice, methodology mapping, hero stats (`71`), `formatWeeklySelection` (`3 ejercicios` / `1 ejercicio` / `0 ejercicios`) and the library-only grouping (`7`/`9`, `2/3/2`, `2/5/2`) are byte-identical in behaviour. `tests/modules/content/presentation/composition-wiring.test.ts` and `tests/modules/content/index.test.ts` are also unchanged.

## Verification Plan

1. `npm test` → **358/358 tests, 227 suites, 0 fail**; record the per-file counts of `explore-general-screen.test.ts` (11 → 13) and confirm the two view-model suites are unchanged.
2. `npm run lint` → exit 0 (architecture boundaries clean).
3. `npm run typecheck` → exit 0 (proves no remaining `totalCount` reference anywhere typed).
4. `npm run verify` → exit 0, `expo-doctor` green.
5. `./init.sh` → exit 0, never starts Metro.
6. Scans: `rg totalCount src tests` returns only this spec/feature-list text if any (no source hits); `rg '#[0-9a-fA-F]{3,8}\b' src/modules/content/presentation` empty; `rg 'content/infrastructure' src/modules/content/presentation` empty; `rg 'modules/ai|fetch\(' src/modules/content` empty; `git diff --stat` limited to the two source files, one test file and the named docs.
7. `npx expo export --platform android` (cheap) → exit 0; record the Hermes bundle size and confirm the pinned strings still appear (`Abrir Asistente IA`, `Una selección fuera de la biblioteca`, `Ejercicios de la Semana`, `Ver sistema de diseño`).
8. `SM-M135F` smoke via `adb reverse tcp:8081 tcp:8081` + Expo Go 58.0.5:
   - Cold launch, no category: `uiautomator` order is `FM`/`Futsal Manager AI`, hero, `CATEGORÍA / RANGO DE EDAD` chips, `Elige una categoría`, `Pídele una sesión a la IA`, `Ver sistema de diseño`; the AI card is below the prompt and above the gallery link.
   - Select Infantil U14: order is hero, filter, methodology (`Foco Metodológico Infantil`), weekly (`Una selección fuera de la biblioteca`, `3 ejercicios`, three cards warm-up → main → cool-down), library (9 under 2/5/2), AI card, gallery link. Scroll to the bottom to confirm the AI card is the last product card.
   - Measure the CTA bounds → still `850x135` px = `302x48` dp at density 450; tap it → Asistente IA opens with its accepted `PRÓXIMAMENTE` placeholder; go back → Infantil still selected and its content intact.
   - Select Prebenjamín: library 7 (2/3/2), weekly `3 ejercicios` with its three titles, AI card still last.
   - 320 dp at `font_scale 1.3`: scroll through and confirm no clipped/overlapped text around the new AI-card/prompt and AI-card/library neighbors; restore `wm size reset`, `wm density reset`, `font_scale 1.0`.
   - Other tabs (Pizarra, Asistente IA, Mi Club) and `/design-system` unchanged.
   - `adb logcat -d -t 600 | grep -iE 'ReactNativeJS.*(error|exception)|FATAL EXCEPTION'` → no lines.

## Evidence To Capture

- Test totals before/after and the `explore-general-screen.test.ts` per-file count.
- `uiautomator` dumps for both states showing the final order, plus the CTA bounds and the `/asistente` round trip with selection preserved.
- `git diff --stat` proving the scope; explicit statement that `ai-session-entry-card.tsx` and both view models are unmodified.
- Bundle size and the string scan result; clean `logcat` output.
- Baseline confirmation that `contentVersion` `1.2.0`, `infantil-u14-base` `1.1.0` and Board Data `1.0.0` are untouched.

## Documentation Impact

| Document | Action | Reason |
| --- | --- | --- |
| `ARCHITECTURE.md` | update | The `content` presentation sentence lists the composition order; it must read hero → filter → methodology → weekly → library → AI card, with the gallery link as the technical footer. |
| `src/modules/content/README.md` | update | Layer description and browse flow repeat the old order and mention the removed `totalCount` surface. |
| `AGENTS.md` | update | Project Status paragraph describes the Explorar composition; state that the AI card is the last product card. |
| `PROGRESS.md` | update | Session log, current verified state (test counts, branch, PR compare URL) and next feature. |
| `feature_list.json` | update | `explore-weekly-highlights` status/evidence/notes after implementation and after independent acceptance. |
| `docs/specs/explore-weekly-highlights.md` | update | Check off implementation tasks and record evidence during the implementation session. |
| `DESIGN.md` | not needed | No token, spacing, color or typography change. Its narrative screen list keeps its wording; the deliberate order change is recorded here. |
| `CONTEXT.md`, `docs/domain-model.md`, `docs/content-model.md`, `docs/content-licensing.md`, `docs/board-data-schema.md`, `docs/technical-discovery.md` | not needed | No domain term, entity, contract, content or infrastructure change. |
| `CONSTRAINTS.md` | not applicable | File does not exist in this repository. |
| `init.sh` | not needed | Verification path unchanged; the script keeps executing non-blocking checks and must not start Metro. |

## Implementation Tasks

- [x] 1. In `explore-screen.tsx`, delete `<AiSessionEntryCard />` from between `<CategoryFilterBar>` and the branch.
- [x] 2. Insert a single `<AiSessionEntryCard />` after the closing `)}` of the category ternary and immediately before `<Link href="/design-system" asChild>`.
- [x] 3. Remove `totalCount={browseModel.exercises.length}` from the `<WeeklyExercises>` call site; leave `exercises={generalModel.weeklyExercises}` untouched.
- [x] 4. Remove `totalCount: number;` from `WeeklyExercisesProps`; keep the component body, destructuring, copy, chips and styles byte-identical.
- [x] 5. Update `tests/modules/content/presentation/screens/explore-general-screen.test.ts` per Test Plan items 1–3 (order, gallery link, `totalCount`).
- [x] 6. Add Test Plan items 4–5 (single AI card after both branches; accepted AI card internals).
- [x] 7. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run verify`, `./init.sh`, the scans and the Android export; record exact numbers.
- [x] 8. Run the `SM-M135F` smoke (both states, CTA bounds, `/asistente`, Infantil + Prebenjamín, 320 dp/1.3, other tabs, `logcat`).
- [x] 9. Update `ARCHITECTURE.md`, `src/modules/content/README.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json` and check off these tasks.
- [x] 10. Commit on `feat/explore-weekly-highlights` with a Conventional Commit message and leave the GitHub compare URL for the user. — done: committed as `feat: complete explore-weekly-highlights` after independent acceptance.

## Validator Checklist

- [x] Only `explore-screen.tsx`, `weekly-exercises.tsx`, the presentation source-structure test and the named docs changed (`git diff --stat`).
- [x] Selected order is hero → filter → methodology → weekly → library → AI card → gallery link, each element once; verified in source and on device.
- [x] Unselected order is hero → filter → `Elige una categoría` → AI card → gallery link; the AI card is no longer above the prompt.
- [x] `<AiSessionEntryCard />` occurs exactly once and sits outside both ternary arms.
- [x] `totalCount` appears nowhere in `src` or `tests`; `WeeklyExercisesProps` has only `exercises`.
- [x] Weekly copy, order, counter and empty state are unchanged; library counts/groupings and weekly ids unchanged on device.
- [x] `AiSessionEntryCard` internals unmodified (`git diff` empty for that file); CTA still `302x48` dp, `variant="ai"`, `fullWidth`, opens `/asistente` with selection preserved.
- [x] Tests **358 / 227 suites** pass; the two view-model suites and the composition/barrel tests were not edited and still pass.
- [x] `lint`, `typecheck`, `verify` (with `expo-doctor`) and `./init.sh` exit 0; `./init.sh` starts no Metro.
- [x] No content/package/version/Board Data/AI/quota/route/`shared`/`package.json`/`eslint.config.js`/`init.sh` change; `contentVersion` `1.2.0`, `infantil-u14-base` `1.1.0`, Board Data `1.0.0`.
- [x] No literal hex color, infrastructure import, AI module import, `fetch(`, input, `Generar`, `Ver Pizarra Táctica`, `Todas las Categorías`, `Ver Todos` or `180+` in `content/presentation`.
- [x] `SM-M135F` smoke recorded with `uiautomator` evidence for both states and a clean `logcat`.
- [x] `ARCHITECTURE.md`, `src/modules/content/README.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json` and this spec match the shipped behavior.

## Risks And Open Points

- **AI card below the fold when a category is selected.** The library (7–9 cards) now sits above it, so reaching the AI entry requires scrolling to the end. This is the coach's explicit request and it does not violate `explore-general-screen` Scenario 3, whose one-hand/short-scroll promise was written for the unselected state; the spec records the tradeoff so a validator does not flag it as a regression. Measure the scroll distance during the smoke and state it in the evidence.
- **Unselected state also changes relative order.** The prompt now precedes the AI card, so the AI entry is second-to-last instead of third. Verify the unselected cold launch explicitly, since it is the state a first-time coach sees.
- **`DESIGN.md` narrative drift.** `DESIGN.md` lists "category filter, AI session prompt entry, methodology-by-stage overview, weekly exercises" in that order and is intentionally not edited. The divergence is a product decision (2026-10-28) recorded here only; a future design-token pass may reconcile the wording.
- **Source-structure tests assert raw text indices.** A future refactor that extracts sections into components would break them; keep the assertions tag-based rather than line-based, and never weaken them to accommodate a different order.
- **Device smoke needs a scroll.** The AI card is now at the end of a long page, so `adb shell input swipe` to the bottom before the relevant `uiautomator` dump.
- **Single-occurrence guard is the only protection against branch duplication.** If a later change re-renders the card inside a branch, the new exactly-one assertion fails immediately; keep it.
- No blocking open questions. Remaining implementation-time questions stay tracked in `docs/risks-and-open-questions.md`; none are introduced by this feature.

## Implementation Evidence (`2026-10-28`)

- **Source change:** `explore-screen.tsx` now renders `<CategoryFilterBar />`, the selected/unselected ternary, one `<AiSessionEntryCard />` outside both branches, then the `<Link href="/design-system">` footer. `totalCount` is gone from the `WeeklyExercises` call site and from `WeeklyExercisesProps`; `ai-session-entry-card.tsx` and both view models are unmodified (`git diff` empty for them).
- **Tests:** `npm test` → **358 tests / 227 suites, 0 fail** (baseline 356/227). `explore-general-screen.test.ts` reads **13 / 9** (was 11 / 9); the two new cases landed inside existing `describe` blocks, so no suite count change. `explore-general-model.test.ts` (17/23) and `category-browse-model.test.ts` (10/17) were not edited and still pass.
- **Gates:** `npm run lint` exit 0, `npm run typecheck` exit 0, `npm run verify` exit 0 (358/358, `expo-doctor` 20/20), `./init.sh` exit 0 and no Metro started.
- **Scans:** namespace `totalCount` appears only inside the two new negative assertions in the screen test (no source hits); no literal hex colours, `content/infrastructure` imports, `modules/ai`/`fetch(` references, or `Ver Pizarra Táctica`/`Todas las Categorías`/`Ver Todos`/`180+`/`Generar` strings in `content/presentation`. `git diff --stat` is limited to `explore-screen.tsx`, `weekly-exercises.tsx`, `explore-general-screen.test.ts` and the named docs/harness files.
- **Android export:** `npx expo export --platform android` exit 0, Hermes bundle `entry-7aa263a96b3a9423db72999517312228.hbc` at **3,847,820 bytes**; `Abrir Asistente IA` and `Ejercicios de la Semana` found in UTF-8, and `Una selección fuera de la biblioteca`, `Ver sistema de diseño` and `Pídele una sesión a la IA` found in UTF-16LE (`3 ejercicios` is composed at runtime by `formatWeeklySelection`).
- **`SM-M135F` smoke** (Galaxy M13, Android 14, 450 dpi, Expo Go 58.0.5, `adb reverse tcp:8081 tcp:8081`, existing Metro reused):
  - Cold launch unselected: `FM`/`Futsal Manager AI` → hero (`71`, `7`, `100%`) → `CATEGORÍA / RANGO DE EDAD` chips → `Elige una categoría` prompt → AI card (`Pídele una sesión a la IA`, `PRÓXIMAMENTE`, `Abrir Asistente IA`) → `Ver sistema de diseño` last.
  - Infantil U14: methodology (`Foco Metodológico Infantil`, `Sesiones de 60–75 min`, three key concepts) → weekly (`Ejercicios de la Semana`, `3 ejercicios`, `Una selección fuera de la biblioteca`, `Activación con pases entre líneas` → `Ataque 3-1 con cambio de orientación` → `Rondo de cierre con movilidad`) → library (`9 ejercicios`, `CALENTAMIENTO` 2 → `PARTE GENERAL` 5 → `VUELTA A LA CALMA` 2, no weekly title repeated) → AI card → gallery link. Prebenjamín: library `7 ejercicios` 2/3/2 and weekly `Activación con pases y nombres` / `Juego de las cuatro esquinas` / `Rondo tranquilo en círculo`, AI card still last.
  - CTA measured `[116,1630][966,1765]` = **850x135 px = 302x48 dp** at density 450 (clickable parent), unchanged from the accepted build; tapping it in both states opens the existing Asistente IA tab with its `PRÓXIMAMENTE` placeholder, and returning to Explorar keeps the category selected with its content intact.
  - 320 dp (`wm size 900x1800`) at `font_scale 1.3`: the prompt→AI card and library→AI card neighbours render without clipping or overlap (`Ver sistema de diseño` still below the AI card); `wm size reset`, `wm density reset` and `font_scale 1.0` restored.
  - Pizarra, Asistente IA, Mi Club and `/design-system` render their accepted screens; `adb logcat -d -t 600 | grep -iE 'ReactNativeJS.*(error|exception)|FATAL EXCEPTION'` returns **0 lines**.
- **Scroll distance (risk 1):** reaching the AI card with Infantil U14 selected took six up-swipe gestures (≈7,800 px ≈ 2,770 dp of scroll) from the top — the coach's accepted tradeoff, no clipping at the end of the page.
- **Versions unchanged:** `contentVersion`/`CONTENT_PACKAGE_VERSION` `1.2.0`, `infantil-u14-base` plan `1.1.0`, Board Data `1.0.0`.
- **Status:** implementation and self-verification complete; `feature_list.json` is `passing` and independent validation is the remaining step. No commit was created in this session.
