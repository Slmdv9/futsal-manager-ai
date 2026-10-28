# Feature Implementation Spec: Explore by category screen

## Source Feature

- **id:** `explore-by-category-screen`
- **area:** `browse`
- **status:** `accepted` (independent validation verdict `accept`)
- **depends_on:** `app-navigation-shell` (accepted), `category-filter` (accepted), `design-system-tokens` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/explore-by-category-screen` (stacked on `feat/explore-weekly-highlights` @ `428c148`, clean tree)
- **spec path:** `docs/specs/explore-by-category-screen.md`
- **reference:** `docs/design/prototype/02-explore-by-category/code.html` (drill cards with `Abrir en Pizarra`), `DESIGN.md` Core Screens item 2
- **baseline (verified in this planning run):** `./init.sh` exit 0, **358 tests / 227 suites**, `expo-doctor` 20/20; `contentVersion`/`CONTENT_PACKAGE_VERSION` `1.2.0` (71 exercises: 50 `library` + 21 `weekly`, 7 Programming), `infantil-u14-base` `1.1.0`, Board Data `1.0.0`.
- **size check:** correctly sized. One new pure helper, one board prop contract, one route rewrite, one card action, four small test files. No new module, layer, port, token, dependency or content change. No split needed.

## Goal

The selected-category experience on Explorar is already implemented and accepted: app bar, `ExploreHero`, `CategoryFilterBar`, `MethodologyOverviewCard` (stage, `Foco: …`, play model, duration, `Conceptos clave` chips), `WeeklyExercises`, the grouped `ExerciseLibraryList`, one `AiSessionEntryCard`, and the `Ver sistema de diseño` footer. The only missing piece of this feature is the **open-on-board action**: every library exercise card gains `Abrir en Pizarra`, and `/pizarra?exerciseId=<id>` opens the board tab already targeted at that exercise.

No board is drawn yet. The board screen shows a selected-exercise card (title, summary, `SELECCIONADO` chip) plus a note that the animated 2:1 board arrives in the next phase — the visible proof that the action targets the chosen exercise.

**Job story:** when I am reading my category's library and one drill catches my eye, I want to open the tactics board already pointing at that drill, so I do not have to find it again and I trust that the app understood which exercise I chose.

## Non-Goals

- No pitch, tokens, cones, arrows, phases or SVG (`tactics-board-renderer`); no playback or golden tests (`board-phase-playback`, `board-golden-tests`).
- No exercise detail route or screen (`exercise-detail-screen`), no citations UI, no thumbnails (`exercise-preview-board-thumbnail`).
- No `Abrir en Pizarra` on the weekly cards; only library cards.
- No content, package, parser, read-layer, provenance or version change: `contentVersion` `1.2.0`, `infantil-u14-base` `1.1.0`, Board Data `1.0.0` stay.
- No AI, quota, network, `fetch` or `ai` module work.
- No new colour, font, shadow, spacing token or `shared/ui` component; no weekly-card restyle; no change to the accepted composition, group headings/counts, methodology card, AI card position or footer text.
- No new cross-module import: `content` must not import `board`, `board` must not import `content`; `eslint.config.js` and the allowed-dependency table stay as they are.
- No `package.json` (dependency), `init.sh`, `src/shared/**`, `app.json` or `DESIGN.md` change; no E2E harness or React Native test runner.

## Acceptance Scenarios

### Scenario 1: Methodology focus and key concepts render (feature_list #1)

Given the bundled repository with a category selected (e.g. Infantil U14)
When Explorar renders
Then `MethodologyOverviewCard` shows the `Programming`-derived stage (`Etapa de asimilación táctica cognitiva` for Infantil), `Foco: <focus>`, the play model, `Sesiones de 60–75 min` and up to three `Conceptos clave` chips — unchanged from the accepted build, with the category chip label `Infantil (U14)`.

### Scenario 2: The library lists only that category's exercises (feature_list #2)

Given a selected category
When the library renders
Then it reads `listLibraryExercises` only: Infantil U14 shows `9 ejercicios` split `CALENTAMIENTO` 2 / `PARTE GENERAL` 5 / `VUELTA A LA CALMA` 2, every other category shows 7 split 2/3/2, no weekly highlight appears, and each card keeps its title, summary and `formatExerciseMeta` line.

### Scenario 3: Every library card exposes exactly one open-on-board action

Given any selected category
When a library exercise card renders
Then it contains exactly one `Link` labelled `Abrir en Pizarra`, rendered as `AppButton variant="secondary" fullWidth`, placed inside the card after title, summary and meta, wrapped with `Link asChild`, with an exercise-specific `accessibilityLabel` (`Abrir <title> en la Pizarra`), the pinned `accessibilityHint="Abre la pestaña Pizarra con este ejercicio seleccionado"`, and a measured touch target of at least 44 dp (Scenario 7).
And the weekly cards and the `Elige una categoría` prompt expose no such action.

### Scenario 4: The action targets the selected exercise (feature_list #3)

Given the library card for `salida-3-1-presion-alta` (`Salida 3-1 ante presión alta`)
When the coach taps `Abrir en Pizarra`
Then the app opens Pizarra at `/pizarra?exerciseId=salida-3-1-presion-alta` and shows the `Pizarra` header plus a card with a `SELECCIONADO` chip, the title `Salida 3-1 ante presión alta`, its summary `Salida en 3-1 con fijación del cierre y cambio de orientación al ala débil.` and the note `El tablero animado 2:1 llegará en la próxima fase.`

### Scenario 5: A different exercise changes the target

Given Pizarra is showing the first exercise
When the coach returns to Explorar (tab or back), keeps the category, and taps `Abrir en Pizarra` on `pase-y-va-carril-central` (`Pase y va al carril central`)
Then Pizarra shows that title and summary `Pase y va del cierre con devolución al desmarque y liberación del carril central.` with the same chip and note, and no stale content from the previous exercise.
And returning to Explorar keeps the category selected with its methodology, weekly block and library intact (session-only selection, no relaunch).

### Scenario 6: Unknown or unlicensed ids fall back without throwing

Given `/pizarra` opened with no `exerciseId`, an unknown id (`no-existe`), an unlicensed/draft id, or after a cold start
When the route resolves the parameter
Then `getExercise` returns `null` and `BoardScreen` renders the accepted fallback card byte-for-byte: `SIGUIENTE FASE`, `El tablero aún no está conectado`, `La reproducción por fases y las fichas de jugadores se añadirán cuando exista Board Data validado.`, with the `Pizarra` header present, no thrown error and no console error.
And `/pizarra` never fetches, never invents content and never renders a pitch.

### Scenario 7: Layout and accessibility hold at narrow width

Given `SM-M135F` at 320 dp width and `font_scale 1.3`
When the library and the board target card render
Then no library card text, button label or note is clipped or overlapped; `Abrir en Pizarra` measures at least 44 dp tall and spans the card width; the seven chips still scroll horizontally; the AI card and `Ver sistema de diseño` keep their accepted order and copy; `wm size reset`, `wm density reset` and `font_scale 1.0` are restored afterwards.

### Scenario 8: No forbidden change

Given the finished feature
When the diff and the gate run
Then only the board target contract/screen, `content/presentation` (routing helper, library card, public API), the `pizarra` route, new tests and the named docs changed; `content-package.json`, content domain/application/infrastructure, `src/shared/**`, `src/modules/ai/**`, `src/modules/club/**`, `package.json`, `eslint.config.js` and `init.sh` are untouched; `content` contains no `@/modules/board` import, `board` contains no `@/modules/content` import, and no literal hex colour or `content/infrastructure` import enters `content/presentation`.

## Contracts And Route Shape

### Board target (board module public contract)

```ts
// src/modules/board/presentation/board-exercise-target.ts   (type-only, no runtime)
import type { BoardData } from '@/shared/domain';

export type BoardExerciseTarget = {
  id: string;
  title: string;
  summary: string;
  boardData: BoardData;
};

// src/modules/board/presentation/screens/board-screen.tsx
export function BoardScreen({ exercise }: { exercise?: BoardExerciseTarget | null });
```

- With a target: `SectionPlaceholder` keeps `eyebrow="Pizarra"`, `title="Pizarra"`, `description="Ejercicios animados sobre el tablero táctico 2:1."`; the body renders a `Card` with `Chip label="SELECCIONADO"`, `exercise.title` (`headlineSm`, header role), `exercise.summary` (`bodyMd`, `textVariant`) and the note `El tablero animado 2:1 llegará en la próxima fase.` (`bodyMd`, `textVariant`).
- Without a target (`undefined` or `null`): the current fallback card is kept unchanged.
- `boardData` rides along untouched for `tactics-board-renderer`; nothing in this feature reads it.

### Content routing and mapping helpers (pure, presentation)

```ts
// src/modules/content/presentation/view-models/board-routing.ts
export type BoardHref = { pathname: '/pizarra'; params: { exerciseId: string } };
export type BoardExerciseTargetData = {
  id: string;
  title: string;
  summary: string;
  boardData: BoardData;
};

export function buildBoardHref(exerciseId: string): BoardHref;
export function buildBoardExerciseTarget(exercise: Exercise): BoardExerciseTargetData;
```

- `buildBoardHref` returns the literal `pathname: '/pizarra'` (required by typed routes) and the **raw** id in `params.exerciseId`, so expo-router encodes exactly once. No query string is baked in and no `encodeURIComponent` is applied here.
- `buildBoardExerciseTarget` copies exactly `id`, `title`, `summary`, `boardData` by reference — it never mutates, derives or rejects (visibility already happened in `getExercise`).
- `BoardExerciseTargetData` is structurally identical to `BoardExerciseTarget`; passing one into `BoardScreen exercise={…}` from `pizarra.tsx` is the typecheck-level proof. `content` never imports `board`.

### Action per library card

```tsx
// inside every group.exercises.map card, after the meta line
<Link href={buildBoardHref(exercise.id)} asChild>
  <AppButton
    label="Abrir en Pizarra"
    variant="secondary"
    fullWidth
    style={styles.boardAction}
    accessibilityLabel={`Abrir ${exercise.title} en la Pizarra`}
    accessibilityHint="Abre la pestaña Pizarra con este ejercicio seleccionado"
  />
</Link>
```

`styles.boardAction = { minHeight: spacing.xl + spacing.md }` (48 dp), mirroring the accepted AI CTA workaround for the 43.73 dp default. No new token.

### Route wiring (`src/app/(tabs)/pizarra.tsx`, thin composition root)

```tsx
import { useLocalSearchParams } from 'expo-router';
import { BoardScreen } from '@/modules/board';
import {
  buildBoardExerciseTarget,
  createBundledContentRepository,
  getExercise,
} from '@/modules/content';

const repository = createBundledContentRepository();

export default function PizarraRoute() {
  const params = useLocalSearchParams<{ exerciseId?: string | string[] }>();
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const exercise = exerciseId ? getExercise(repository, exerciseId) : null;

  return <BoardScreen exercise={exercise ? buildBoardExerciseTarget(exercise) : null} />;
}
```

Route shape `/pizarra?exerciseId=<exercise-id>`: any publishable exercise resolves (library or weekly), only library cards link. Unknown, empty, unlicensed or draft ids resolve to `null` → fallback. No `fetch`, no module internals, no business rules.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md` (Current Verified State, Sessions 019–021), `feature_list.json` (`explore-by-category-screen`, `explore-general-screen`, `explore-weekly-highlights`, `exercise-detail-screen`, `tactics-board-renderer`, `exercise-preview-board-thumbnail`, `board-phase-playback`).
- `ARCHITECTURE.md` (layer table, allowed dependencies, module catalog, composition root, data flows), `CONTEXT.md`, `DESIGN.md` (Core Screens 1–4, responsive/accessibility baselines), `docs/domain-model.md`, `docs/risks-and-open-questions.md`, `docs/device-development-workflow.md`.
- `docs/specs/explore-general-screen.md`, `docs/specs/explore-weekly-highlights.md`, `docs/design/prototype/02-explore-by-category/code.html`.
- `src/app/_layout.tsx`, `src/app/(tabs)/{index,pizarra,_layout}.tsx`.
- `src/modules/content/{index.ts,README.md}`, `application/get-exercise.ts`, `presentation/screens/explore-screen.tsx`, `presentation/components/{exercise-library-list,methodology-overview-card,ai-session-entry-card}.tsx`, `presentation/view-models/category-browse-model.ts`.
- `src/modules/board/{index.ts,README.md}`, `presentation/screens/board-screen.tsx`, and its empty `domain`/`application`/`infrastructure` layers.
- `src/shared/ui/{button,card,chip,index}.ts(x)`, `src/shared/ui/layout/section-placeholder.tsx`, `src/shared/domain/index.ts`, `src/shared/theme`.
- `eslint.config.js` (`content: []`, `board: []`; `module-presentation -> shared/domain` is permitted), `package.json` (`npm test` = `node --import tsx --test "tests/**/*.test.{ts,tsx}"`).
- `tests/modules/content/index.test.ts`, `presentation/composition-wiring.test.ts`, `presentation/screens/explore-general-screen.test.ts`, `tests/architecture/{architecture,boundaries}.test.ts`.

### Current Gaps

- `exercise-library-list.tsx` renders title/summary/meta only; it has no action and no `expo-router` import.
- `src/app/(tabs)/pizarra.tsx` is `export default BoardScreen;` and `BoardScreen()` takes no props, so nothing can target an exercise.
- The board module has no public target type; no helper builds the Pizarra href or maps a content `Exercise` into a board-safe target, which would force content knowledge into the board screen or a forbidden import.

### Existing Patterns To Follow

- `Link asChild` + `AppButton` is the accepted navigation pattern (`AiSessionEntryCard`, `Ver sistema de diseño`).
- Routes stay thin: `route → adapter factory → screen prop`; composition lives in `src/app` only.
- Presentation tests are `node:test` source-structure guards plus pure-function suites written as Given/When/Then; suites are `describe` blocks (`explore-general-screen.test.ts` is 13 tests / 9 suites).
- Modules exchange only public APIs and shared contracts; Board Data is the only board-related type content may use.

## Expected Files By Module And Layer

| Module | Layer | File | Change |
| --- | --- | --- | --- |
| `board` | presentation | `board/presentation/board-exercise-target.ts` | **new** `BoardExerciseTarget` type (`id`, `title`, `summary`, `boardData: BoardData`) |
| `board` | presentation | `board/presentation/screens/board-screen.tsx` | accept `exercise?: BoardExerciseTarget \| null`; selected-exercise card + note; keep fallback |
| `board` | public API | `board/index.ts` | export `BoardScreen` and `type BoardExerciseTarget` |
| `content` | presentation | `content/presentation/view-models/board-routing.ts` | **new** `buildBoardHref`, `buildBoardExerciseTarget`, `BoardHref`, `BoardExerciseTargetData` |
| `content` | presentation | `content/presentation/components/exercise-library-list.tsx` | one `Link asChild` + `AppButton` per library card, exercise-specific accessibility copy, local 48 dp style |
| `content` | public API | `content/index.ts` | export the two helpers and `BoardExerciseTargetData` |
| `app` | composition root | `src/app/(tabs)/pizarra.tsx` | rewrite as thin wrapper: `useLocalSearchParams` → `getExercise` → `buildBoardExerciseTarget` → `<BoardScreen exercise={…} />` |
| tests | content | `tests/modules/content/presentation/{view-models/board-routing,components/exercise-library-list,pizarra-wiring}.test.ts` | **new** suites |
| tests | board | `tests/modules/board/presentation/screens/board-screen.test.ts` | **new** contract/fallback suite |
| tests | content | `tests/modules/content/index.test.ts`, `presentation/screens/explore-general-screen.test.ts` | extend the public-API list and forbidden-scan source list only (no count change) |

Explicitly unchanged: content `domain`/`application`/`infrastructure`, `content-package.json`, `state/**`, both existing view models, `explore-screen.tsx`, `explore-hero.tsx`, `category-filter-bar.tsx`, `methodology-overview-card.tsx`, `weekly-exercises.tsx`, `ai-session-entry-card.tsx`, `src/shared/**`, `src/modules/{ai,club}/**`, `src/app/_layout.tsx`, `src/app/(tabs)/{index,_layout}.tsx`, `package.json`, `eslint.config.js`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md`, `docs/content-model.md`, `docs/board-data-schema.md`.

## Visual Design Impact

- `Abrir en Pizarra` is the prototype's drill-card action, softened from the prototype's filled primary CTA to `AppButton variant="secondary"` (`surface` fill, `outlineVariant` border) with `fullWidth`, inside the existing `Card`, below the meta line, separated by the existing `gap: spacing.sm`, so a 7–9 card list does not become a wall of primary buttons (recorded deviation).
- The board target card reuses `Card`, `Chip` (`neutral` or `press-trigger`, no new variant) and existing typography variants, and explicitly states the animated board is not there yet.
- Tokens only: no literal hex, no new spacing/radius/typography token, no shadow change, `DESIGN.md` not edited.

## Test Plan (exact counts)

Baseline **358 tests / 227 suites**. Target **378 tests / 246 suites** (+20 tests, +19 suites, 0 fail). Suites are `node:test` `describe` blocks; tests are `it` blocks — e.g. the accepted `explore-general-screen.test.ts` is 13 tests / 9 suites.

| File | Tests | Suites |
| --- | --- | --- |
| `tests/modules/content/presentation/view-models/board-routing.test.ts` (**new**) | 6 | 6 |
| `tests/modules/content/presentation/components/exercise-library-list.test.ts` (**new**) | 4 | 5 |
| `tests/modules/content/presentation/pizarra-wiring.test.ts` (**new**) | 4 | 3 |
| `tests/modules/board/presentation/screens/board-screen.test.ts` (**new**) | 6 | 5 |
| `tests/modules/content/index.test.ts` (list update only) | 1 (unchanged) | 3 (unchanged) |
| `tests/modules/content/presentation/screens/explore-general-screen.test.ts` (source-list update only) | 13 (unchanged) | 9 (unchanged) |

### `board-routing.test.ts` (pure; uses the bundled repository for a real `Exercise`)

1. Given a library exercise id / When `buildBoardHref` runs / Then `pathname` is exactly `/pizarra` and `params.exerciseId` is the id verbatim, with no baked-in `?` or `&`.
2. Given a plain slug id / When the href is built / Then the id is not pre-encoded (no `%` introduced), so expo-router encodes once.
3. Given an id with URL-reserved characters (`rondo 4v1/orientación`) / When the param is encoded and decoded / Then it round-trips to the original id.
4. Given the bundled `salida-3-1-presion-alta` / When `buildBoardExerciseTarget` runs / Then the result has exactly `id`, `title`, `summary`, `boardData` with the exercise's own values.
5. Given the same exercise / When the target is built / Then `boardData` is the same reference (no clone, no re-validation, no mutation of the source).
6. Given the same exercise / When the target is built / Then no content-only field (`provenance`, `references`, `collection`, `categoryIds`, `sessionPart`) is carried into the target.

### `exercise-library-list.test.ts` (source-structure guard)

1. Each card renders one `Link` from `buildBoardHref(exercise.id)` wrapping `AppButton label="Abrir en Pizarra"` (`variant="secondary"`, `fullWidth`); `label="Abrir en Pizarra"` appears exactly once in the file.
2. The button carries the exercise-specific `accessibilityLabel`, the pinned `accessibilityHint`, and `minHeight: spacing.xl + spacing.md`.
3. Card order is `exercise.title` < `exercise.summary` < `formatExerciseMeta(exercise)` < `Abrir en Pizarra`; group headings, counts, empty-state copy and `formatExerciseCount` usages are unchanged.
4. Only the library exposes the action: `weekly-exercises.tsx` contains no `Abrir en Pizarra`, no `buildBoardHref` and no `Link`.

### `pizarra-wiring.test.ts` (composition-root guard)

1. The route uses `useLocalSearchParams`, reads `exerciseId`, and resolves it with `getExercise(repository, exerciseId)`.
2. It passes `exercise={…buildBoardExerciseTarget(exercise)…}` to `<BoardScreen` and falls back to `null`.
3. It imports only `@/modules/board` and `@/modules/content` public APIs, creates the repository with `createBundledContentRepository()`, and references no internal module path.
4. It contains no `fetch(`, no `.json` import and no business rule beyond the lookup.

### `board-screen.test.ts` (board contract guard)

1. `board-exercise-target.ts` declares exactly `id: string`, `title: string`, `summary: string`, `boardData: BoardData`, importing `BoardData` from `@/shared/domain`.
2. `board-screen.tsx` accepts `exercise?: BoardExerciseTarget | null`.
3. With a target it renders `exercise.title`, `exercise.summary`, the `SELECCIONADO` chip and the pinned note inside the `Pizarra` header.
4. Without a target the fallback copy (`SIGUIENTE FASE`, `El tablero aún no está conectado`, the Board Data sentence) and the unchanged description remain.
5. The screen draws no pitch, token, phase, arrow or SVG (`react-native-svg`, `Svg`, `Circle`, `Arrow`, `pitch`, `phases`, `boardData.phases`) and imports no `@/modules/content`.
6. `board/index.ts` exports `BoardScreen` and `type BoardExerciseTarget`.

### Existing suites

`index.test.ts`: add `buildBoardHref`, `buildBoardExerciseTarget`, `BoardExerciseTargetData` to `requiredPublicApiExports` (same single test). `explore-general-screen.test.ts`: add `board-routing.ts` to `newOrChangedSources` and `@/modules/board` to the forbidden-scan assertions (same 13 tests). All other suites (`explore-general-model` 17/23, `category-browse-model` 10/17, seed suites, `tests/architecture/*`) must pass unedited. If cases are nested differently, **378 tests** is fixed; record the actual suite count and keep the same coverage.

## Verification Plan

1. `npm test` → **378/378 tests, 246 suites, 0 fail**; record the four new per-file counts and the unchanged counts of the two edited files.
2. `npm run lint` → exit 0 (no `content -> board`, no `board -> content`, no deep imports).
3. `npm run typecheck` → exit 0 (proves `BoardExerciseTargetData` → `BoardExerciseTarget` and the typed-route literal `pathname: '/pizarra'`).
4. `npm run verify` → exit 0 with `expo-doctor` 20/20.
5. `./init.sh` → exit 0 and starts no Metro.
6. Scans: `rg 'Abrir en Pizarra' src` hits only `exercise-library-list.tsx`; `rg '@/modules/board' src/modules/content` empty; `rg '@/modules/content' src/modules/board` empty; `rg '#[0-9a-fA-F]{3,8}\b' src/modules/content/presentation src/modules/board` empty; `rg 'fetch\(' "src/app/(tabs)/pizarra.tsx" src/modules/board src/modules/content/presentation` empty; `git diff --stat` limited to the expected files.
7. `npx expo export --platform android` → exit 0; record bundle size and confirm `Abrir en Pizarra`, `SELECCIONADO` and `El tablero animado 2:1 llegará en la próxima fase.` appear (UTF-8 and UTF-16LE scan; macOS `strings` is ASCII-only).
8. `SM-M135F` smoke (Galaxy M13, Android 14, 450 dpi, Expo Go 58.0.5, `adb reverse tcp:8081 tcp:8081`; a Metro instance may already run on 8081):
   - Select Infantil U14 → `PARTE GENERAL` → tap `Abrir en Pizarra` on `Salida 3-1 ante presión alta`; Pizarra shows `Pizarra`, `SELECCIONADO`, that title, its summary and the note.
   - Return to Explorar (tab and Android back) → Infantil still selected with methodology, weekly block and library intact; tap `Abrir en Pizarra` on `Pase y va al carril central` → the target changes.
   - Confirm no weekly card shows an action; the AI card and `Ver sistema de diseño` keep their accepted order and copy.
   - Confirm a `/pizarra` cold start and a deep link with `?exerciseId=no-existe` show the fallback card with no error.
   - Measure the action bounds with `uiautomator` (≥44 dp, full card width); check 320 dp (`wm size 900x1800`) at `font_scale 1.3`, then restore `wm size reset`, `wm density reset`, `font_scale 1.0`.
   - `adb logcat -d -t 600 | grep -iE 'ReactNativeJS.*(error|exception)|FATAL EXCEPTION'` → no lines.

## Evidence To Capture

- Test totals before/after, the four new per-file counts, and confirmation that untouched suites were not edited.
- `uiautomator` dumps for: Infantil card action and bounds, Pizarra with the first target, Pizarra with the second target, the no-target fallback, and the Explorar return with the category preserved.
- `git diff --stat` proving scope, plus explicit statements that `content` has no board import, `board` has no content import, and content/infrastructure, versions and `src/shared/**` are untouched.
- Bundle size and string-scan result; clean `logcat`; restored device size/density/font scale.
- The observed behavior when the Pizarra tab is re-entered after a target was opened (param persistence — see Risks).

## Durable Documentation Impact

| Document | Action | Reason |
| --- | --- | --- |
| `ARCHITECTURE.md` | update | Document the content↔board contract through `/pizarra?exerciseId=<id>` and the composition-root wiring (`useLocalSearchParams` → `getExercise` → `buildBoardExerciseTarget` → `BoardScreen exercise`); update the "Render a board" data flow. Dependency table unchanged. |
| `src/modules/content/README.md` | update | Add `board-routing.ts`, the per-card action and the new public exports. |
| `src/modules/board/README.md` | update | State the `BoardExerciseTarget` input contract, the selected-exercise card, and that `tactics-board-renderer` owns the drawing. |
| `AGENTS.md` | update | Project Status paragraph: library cards expose `Abrir en Pizarra` and Pizarra opens targeted through a route param; still no board rendering. |
| `PROGRESS.md` | update | Session log, verified state (test counts, branch, compare URL), next feature. |
| `feature_list.json` | update | `explore-by-category-screen` status `passing` then `accepted`, evidence and notes. |
| `docs/specs/explore-by-category-screen.md` | update | Check off tasks and append implementation evidence. |
| `DESIGN.md` | not needed | No token, type, colour or layout direction change; the `secondary` CTA deviation is recorded here. |
| `CONTEXT.md`, `docs/domain-model.md` | not needed | No new domain term or entity; `Board Data`, `Exercise`, `Pizarra` already exist. |
| `docs/content-model.md`, `docs/content-licensing.md`, `docs/board-data-schema.md` | not needed | No content, licence or Board Data contract change. |
| `docs/risks-and-open-questions.md` | not needed | No new blocking question; the stale "next feature" pointer is harness bookkeeping. |
| `CONSTRAINTS.md` | not applicable | File does not exist. |
| `init.sh` | not needed | Verification path unchanged; it must keep running non-blocking checks and never start Metro. |

## Implementation Tasks

- [x] 1. Add `BoardExerciseTarget` in `board/presentation/board-exercise-target.ts` and export it from `board/index.ts`.
- [x] 2. Give `BoardScreen` the optional `exercise` prop: selected-exercise card with `SELECCIONADO`, title, summary and the pinned note; keep the `Pizarra` header and the no-target fallback byte-identical.
- [x] 3. Add `content/presentation/view-models/board-routing.ts` with `buildBoardHref`, `buildBoardExerciseTarget`, `BoardHref` and `BoardExerciseTargetData` (literal `pathname`, raw id, no mutation).
- [x] 4. Export the two helpers and the data type from `content/index.ts`.
- [x] 5. Add the per-card `Link asChild` + `AppButton` action to `exercise-library-list.tsx` with the pinned copy, exercise-specific accessibility label/hint and the 48 dp local style; do not touch titles, summaries, meta, headings, counts or empty states.
- [x] 6. Rewrite `src/app/(tabs)/pizarra.tsx` as the thin param-reading wrapper; no `fetch`, no internals, no business rules.
- [x] 7. Add the four new test files and update the two existing test lists per the Test Plan.
- [x] 8. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run verify`, `./init.sh`, the scans and the Android export; record exact numbers.
- [x] 9. Run the `SM-M135F` smoke (two targets, return, fallback, no weekly action, 320 dp/1.3, bounds, `logcat`).
- [x] 10. Update `ARCHITECTURE.md`, both module READMEs, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, and check off these tasks.
- [x] 11. Committed as `feat: complete explore-by-category-screen` after independent acceptance.

## Validator Checklist

- [x] Methodology card still shows stage, `Foco: …`, play model, duration and up to three `Conceptos clave` chips for Infantil and one other category.
- [x] Library shows only the selected category's `library` exercises with 9 (2/5/2) / 7 (2/3/2), unchanged headings, counts and card copy; no weekly title appears.
- [x] Every library card renders exactly one `Abrir en Pizarra` action (`secondary`, `fullWidth`, inside the card) with exercise-specific accessibility copy and a measured target ≥44 dp.
- [x] Tapping two different cards opens `/pizarra?exerciseId=…` and Pizarra shows the corresponding title/summary with `SELECCIONADO` and the note; the second tap replaces the first.
- [x] `/pizarra` with no param, an unknown id, or an unlicensed/draft id renders the accepted fallback without throwing, and the route never fetches.
- [x] Explorar keeps the category, methodology, weekly block and library after returning from Pizarra; the AI card and `Ver sistema de diseño` keep their positions.
- [x] `content` imports no `@/modules/board`; `board` imports no `@/modules/content`; `eslint.config.js` and the dependency table are unchanged.
- [x] Tests **378 / 255 suites** pass with the four new per-file counts (the 246-suite estimate was low; the delta is `describe` nesting, not extra cases); untouched suites pass unedited.
- [x] `lint`, `typecheck`, `verify` (`expo-doctor`) and `./init.sh` exit 0; `./init.sh` starts no Metro; Android export succeeds.
- [x] No content/package/version/Board Data/AI/quota/`src/shared/**`/`package.json`/`init.sh` change; `contentVersion` `1.2.0`, `infantil-u14-base` `1.1.0`, Board Data `1.0.0`.
- [x] No literal hex colour, `content/infrastructure` import, SVG/pitch drawing, playback control, weekly action, exercise-detail route or thumbnail in the diff.
- [x] `SM-M135F` smoke recorded with `uiautomator` evidence and a clean `logcat`; 320 dp/1.3 reflow verified and the device restored.
- [x] `ARCHITECTURE.md`, both module READMEs, `AGENTS.md`, `PROGRESS.md`, `feature_list.json` and this spec match the shipped behavior.

## Risks And Open Points

- **Typed routes and the href object.** `experiments.typedRoutes` is on, so `buildBoardHref` must return the literal `pathname: '/pizarra'`; widening it to `string` breaks `Link href` under `tsc`.
- **Two module-scope repositories.** `pizarra.tsx` calls `createBundledContentRepository()` like `index.tsx`. Safe because the adapter caches its parsed package, but the evidence should state that no second parse happens.
- **Tab param persistence is unverified.** Expo Router keeps tab route state, so re-entering Pizarra from the tab bar may retain or clear the previous `exerciseId`. Either is acceptable if it never throws and shows the fallback or the right target; record the observed behavior so a validator does not treat it as a defect. If it persists, the target is session-scoped and a cold start returns to the fallback.
- **The target card must not look like a board.** Copy says the animated board arrives later; do not draw a pitch placeholder or aspect-ratio box, which would pre-empt `tactics-board-renderer`.
- **Card-height regression.** Adding a full-width button to every card lengthens the library and pushes the AI card further down. Verify reflow at 320 dp/1.3 and confirm nothing clips; the accepted "AI card last" tradeoff is unchanged.
- **Measured target height.** `AppButton`'s 44 `minHeight` measured 43.73 dp on `SM-M135F` before, so the local 48 dp `minHeight` is deliberate; do not replace it with a new token.
- **Structural tests assert raw source text.** Keep the assertions tag/regex-based rather than line-based so a later extraction does not become a false failure.
- **Prototype deviation.** The prototype uses a filled primary CTA; this spec uses `secondary` to keep a 7–9 card list readable. Recorded so a validator does not flag it.
- No blocking open questions. Remaining implementation-time questions stay in `docs/risks-and-open-questions.md`; none are introduced by this feature.

## Implementation Evidence

- **Contract shipped:** `board/presentation/board-exercise-target.ts` declares the type-only `BoardExerciseTarget` (`id`, `title`, `summary`, `boardData: BoardData`) and `board/index.ts` exports it next to `BoardScreen`. `BoardScreen({ exercise })` renders `SELECCIONADO` (`press-trigger`), `exercise.title` (header role), `exercise.summary`, and `El tablero animado 2:1 llegará en la próxima fase.` inside the unchanged `Pizarra` header; with `undefined`/`null` the accepted `SIGUIENTE FASE` card and its copy are byte-identical to the previous source. No pitch, SVG, token, arrow, phase, playback control, or `content` import was added.
- **Routing and mapping:** `content/presentation/view-models/board-routing.ts` returns the literal `{ pathname: '/pizarra', params: { exerciseId } }` with the raw id (no pre-encoding), and `buildBoardExerciseTarget` copies only `id`, `title`, `summary`, `boardData` by reference (no mutation, no re-validation). `content/index.ts` exports `buildBoardHref`, `buildBoardExerciseTarget`, and `BoardExerciseTargetData`.
- **Card action:** `exercise-library-list.tsx` now wraps one `AppButton label="Abrir en Pizarra"` (`variant="secondary"`, `fullWidth`) per library card in `<Link href={buildBoardHref(exercise.id)} asChild>`, after title/summary/meta, with `accessibilityLabel={`Abrir ${exercise.title} en la Pizarra`}`, the pinned hint, and `styles.boardAction = { minHeight: spacing.xl + spacing.md }`. Weekly cards, the unselected prompt, headings, counts, empty states, and formatters are unchanged.
- **Route:** `src/app/(tabs)/pizarra.tsx` is a thin composition root: `useLocalSearchParams<{ exerciseId?: string | string[] }>` → first value → `getExercise(repository, exerciseId)` → `buildBoardExerciseTarget` → `<BoardScreen exercise={…} />`, with `null` for no/unknown/unpublishable ids. It imports only `@/modules/board` and `@/modules/content`, creates the repository with `createBundledContentRepository()`, and has no `fetch`, JSON import, filter, or other business rule.
- **Tests:** `npm test` → **378/378 tests, 255 suites, 0 fail** (baseline 358/227; the spec fixed 378 tests and estimated 246 suites — the actual 255 comes from deeper Given/When/Then nesting, coverage is the specified 20 new cases). Per-file: `board-routing.test.ts` 6 tests/8 suites, `exercise-library-list.test.ts` 4/6, `pizarra-wiring.test.ts` 4/4, `board-screen.test.ts` 6/10; `index.test.ts` 1/3 and `explore-general-screen.test.ts` 13/9 are unchanged in count. All other suites pass unedited.
- **Gate:** `npm run lint` exit 0; `npm run typecheck` exit 0 (proves `BoardExerciseTargetData` → `BoardExerciseTarget` and the typed-route literal); `npm run verify` exit 0 with `expo-doctor` 20/20; `./init.sh` exit 0 and starts no Metro.
- **Scans:** `rg 'Abrir en Pizarra' src` hits only `exercise-library-list.tsx`; `rg '@/modules/board' src/modules/content` and `rg '@/modules/content' src/modules/board` are empty; no literal hex colour in `content/presentation` or `board`; no `fetch(` in the route, board, or content presentation; `git diff --stat` is limited to the expected source, tests, and docs. `content-package.json`, content domain/application/infrastructure, `src/shared/**`, `src/modules/{ai,club}/**`, `package.json`, `eslint.config.js`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, and `docs/domain-model.md` are untouched; versions stay `1.2.0`, `infantil-u14-base` `1.1.0`, Board Data `1.0.0`.
- **Android export:** `npx expo export --platform android` exit 0 with `entry-1b029770189404c45f2399a920a0585e.hbc`, 3,849,964 bytes; a UTF-8/UTF-16LE byte scan finds `Abrir en Pizarra`, `SELECCIONADO`, `El tablero animado 2:1 llegará en la próxima fase.`, and `Salida 3-1 ante presión alta`.
- **`SM-M135F` smoke** (Galaxy M13, Android 14, 450 dpi, Expo Go 58.0.5, `adb reverse tcp:8081 tcp:8081`, Metro reused on 8081): Infantil U14 → `PARTE GENERAL` → `Abrir en Pizarra` on `Salida 3-1 ante presión alta` opened `/pizarra?exerciseId=salida-3-1-presion-alta` showing `Pizarra`, `SELECCIONADO`, that title, `Salida en 3-1 con fijación del cierre y cambio de orientación al ala débil.` and the note, with no pitch; returning via the tab and Android back kept Infantil, its methodology, weekly block, and library, and `Abrir en Pizarra` on `Pase y va al carril central` replaced the target with that title/summary. The weekly block shows its three cards and no action; the AI card followed by `Ver sistema de diseño` kept their accepted order. `/--/pizarra` with no param and `?exerciseId=no-existe` both rendered the fallback card with no error. The library action measured `[116,496][966,631]` = 850×135 px = 302×48 dp at density 450 (full card content width). At `wm size 900x1800` (320 dp) and `font_scale 1.3` the cards, action labels, and target card wrapped without clipping; `wm size reset`, `wm density reset`, and `font_scale 1.0` were restored. `adb logcat -d -t 800` had 0 `ReactNativeJS` error/exception and 0 `FATAL EXCEPTION` lines. Tab re-entry after opening a target retained it (Expo Router keeps tab params); a force-stop/relaunch returned to the fallback. A module-scope repository is created once like `index.tsx`; the adapter caches its parse, so no second parse occurs.
- **No commit** was created in this session, per instruction; the branch stays uncommitted for independent validation. Task 11 is deferred.
