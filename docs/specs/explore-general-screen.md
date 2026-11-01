# Feature Implementation Spec: General explore screen

## Source Feature

- **id:** `explore-general-screen`
- **area:** `browse`
- **status:** `accepted`
- **depends_on:** `app-navigation-shell` (accepted), `category-filter` (accepted), `design-system-tokens` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/explore-general-screen` (stacked on `feat/seed-session-structure` @ `2723176`)
- **spec path:** `docs/specs/explore-general-screen.md`
- **reference:** `docs/design/prototype/01-explore-general/code.html` + `screen.png`
- **baseline:** accepted Explorar already renders seven RFEF `FilterChip`s, the selected category's `ProgrammingSummaryCard`, and `ExerciseLibraryList` grouped as `CALENTAMIENTO` / `PARTE GENERAL` / `VUELTA A LA CALMA`; 255 tests in 173 suites pass.

## Feature Summary

Restyle and recompose Explorar so it reads like prototype 01: a lightweight anonymous-access hero with real library stats, the accepted category filter, an AI session entry point, a methodology overview derived from the selected category's `Programming` record, a "weekly exercises" block derived deterministically from the selected category's library, and the retained session-grouped library.

Everything is derived from the bundled content package through the existing publishable-only read layer. No AI call, no new persisted state, no new domain concept, no content/Board Data/version change.

## Problem And Goal

A coach opening Explorar today sees a developer-shaped page: a tall placeholder header, chips, one programming card and a flat library of cards. It does not communicate the three things the MVP promises on this screen — "this is free and anonymous", "here is a session-shaped slice of my category", "here is where AI will help" — and the AI entry point does not exist anywhere in the app.

**Goal:** Explorar becomes the product's front door: anonymous framing, real counts, category selection, an AI entry point that is visible and reachable one-handed, the category methodology at a glance, three curated drills (one per session part) and the full grouped library, using only documented tokens and existing module APIs.

## Job Story

When I open the app between sessions, I want to see what this library offers for my age bracket, understand the methodology of that stage, and know where the AI session generator will live, so I can decide in seconds whether this tool is worth using with my team.

## Users And Permissions

- **Anonymous coach:** browses only. No account, no AI request, no quota consumption.
- **Implementer:** presentation-only work inside `content/presentation` plus a pure view model and mirrored tests.
- **Validator:** reruns the gate and the three `feature_list` scenarios on `SM-M135F`, and confirms no content, board, AI, dependency-graph or version change.

## User-Visible Scope

In scope, top to bottom on the Explorar tab (prototype order):

1. Compact app bar: brand mark + `Futsal Manager AI`.
2. Anonymous-access hero card with a three-stat strip using real counts.
3. Category filter (accepted component, label copy aligned to the prototype).
4. AI session entry card with a full-width CTA to the existing Asistente IA tab.
5. Methodology overview derived from the selected category's `Programming` record.
6. "Ejercicios de la Semana" block: one exercise per session part.
7. Retained session-grouped library (`CALIENTAMIENTO` / `PARTE GENERAL` / `VUELTA A LA CALMA`).
8. Retained `Ver sistema de diseño` link at the very bottom (development gallery round trip).

Out of scope: any new route, any exercise/detail navigation, any board drawing, any AI request or prompt input, any team/calendar concept.

## Acceptance Scenarios

### Scenario 1: Layout matches prototype 01 (feature_list #1)

Given a cold launch with no category selected on a phone viewport
When Explorar renders
Then it shows, in this order, the app bar, the hero card (`Acceso Libre para Entrenadores`, `SIN REGISTRO PREVIO`, the stats `50 Ejercicios`, `7 Categorías`, `100% Abierto`), the `CATEGORÍA / RANGO DE EDAD` label with the seven chips, the AI card (`Pídele una sesión a la IA`), and the `Elige una categoría` prompt; no dead control (prompt input, `Generar`, `Ver Pizarra Táctica`, bookmark, `Ver Todos`, bell, avatar, "Todas las Categorías") is present, and the only deviations from the prototype are the ones listed in "Prototype Deviations".

### Scenario 2: Selecting a category updates the weekly exercises (feature_list #2)

Given the bundled repository with the prompt state showing
When the coach taps `Infantil (U14)`
Then the weekly block lists exactly three cards in session order — `Pase y va al carril central` (`CALENTAMIENTO`), `Salida 3-1 ante presión alta` (`PARTE GENERAL`), `Circulación rápida cierre-ala` (`VUELTA A LA CALMA`) — with the counter `3 de 9`, the methodology card shows `Etapa de asimilación táctica cognitiva` and `Foco Metodológico Infantil`, and the library still lists 2/5/2.
When the coach then taps `Senior (+18)`
Then the weekly cards become `Rondo 5 contra 2 de activación`, `Salida 3-2 con cambio de ala`, `Conservación 6 contra 2 a baja intensidad` with `3 de 7`, the methodology card shows `Etapa de rendimiento y gestión del modelo de juego`, and no Infantil title remains.

### Scenario 3: The AI entry point is visible and reachable one-handed (feature_list #3)

Given a cold launch on `SM-M135F` with no category selected
When the screen settles
Then the AI card is present in the first screenful (or after at most one short scroll), its CTA `Abrir Asistente IA` is a full-width button at least 44 dp tall with a width ≥ 280 dp, is horizontally outside no edge, and tapping it opens the Asistente IA tab showing its existing `PRÓXIMAMENTE` placeholder; returning to Explorar keeps the category selection.

### Scenario 4: The hero uses real numbers

Given the bundled package (50 exercises, seven categories)
When the hero renders
Then the stats are exactly `50` / `7` / `100%` from `listExercises(repository).length`, `listCategories().length`, and the static "all content open" fact — never a hardcoded prototype number such as `180+` — and a repository with fewer records renders its own counts.

### Scenario 5: The weekly derivation is deterministic and session-shaped

Given a category with exercises in all three session parts
When the weekly block is built
Then it returns exactly one exercise per part, taken as the first item of that part's group in package order, ordered warm-up → main → cool-down, and a part with no exercises is skipped instead of invented; the same input always returns the same three ids.

### Scenario 6: Methodology is derived, never invented

Given a selected category with a publishable `Programming` record
When the methodology card renders
Then the title is `programming.formativeStage`, the focus line is `programming.focus`, the body is `programming.playModel`, the meta is `formatSessionDuration(programming)`, and up to three chips come from `programming.keyConcepts` in order; no macrocycle, microcycle, objective list, coaching quote or stage taxonomy is invented.
Given a category with no publishable Programming record
Then the card shows `La metodología de esta categoría estará disponible pronto.` and nothing is fabricated.

### Scenario 7: The accepted behaviours are preserved

Given the accepted category filter and session grouping
When Explorar renders
Then the seven chips keep `accessibilityState.selected` plus the check glyph, the selection still comes from the root `CategorySelectionProvider` (session-only, resets on relaunch), the library keeps the three Spanish headings with counts, and `ProgrammingSummaryCard` is no longer rendered because `MethodologyOverviewCard` owns that content.

### Scenario 8: No forbidden change

Given the finished feature
When the diff and the gate are inspected
Then `content-package.json`, `contentVersion`/`CONTENT_PACKAGE_VERSION` (`1.1.0`), `infantil-u14-base` (`1.1.0`), Board Data (`1.0.0`), domain/application/infrastructure files, `src/app/**`, `src/shared/**`, `ai`/`board`/`club`, `package.json`, `eslint.config.js` and `init.sh` are unchanged, and the screen makes no network or AI call.

## Non-Goals

- **`explore-by-category-screen` owns:** a dedicated category route, the full methodology detail (all key concepts, objectives, macrocycle/microcycle plan), the filtered library as the primary screen, and `Abrir en Pizarra`.
- **`exercise-detail-screen` owns:** the exercise route, full metadata, phase explanations and coaching cues.
- **`tactics-board-renderer` / `exercise-preview-board-thumbnail` / `board-phase-playback` own:** any pitch drawing, miniature pitch header in cards, `Ver Pizarra Táctica`, and animation. This spec renders no SVG.
- **`ai-session-generator-ui`, `ai-chat-ui`, and the whole `ai` area own:** prompt inputs, `Generar`, session results, quota messaging, context passing, and the AI module. This spec only links to the existing tab.
- **`local-ai-results-persistence` / a future scheduling feature own:** a real week/calendar model, rotating selections, saved sessions, and restart persistence of the category.
- No "Todas las Categorías"/all-categories selection state, no skill tiers, no favourites, no notifications, no accounts, no Mi Club promotional banner.
- No new shared primitive, token, color, font, shadow, gradient, icon package, or dependency.
- No content, Board Data, schema, port, use case, package version, AI, quota, board, or route change.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` (`explore-general-screen`, `explore-by-category-screen`, `exercise-detail-screen`, `tactics-board-renderer`, `exercise-preview-board-thumbnail`, `ai-session-generator-ui`), `ARCHITECTURE.md` (layers, allowed module dependencies `content: none`, composition root, testing rules), `CONTEXT.md`, `DESIGN.md`, `docs/build-brief.md` (MVP slice 1 and the four-screen definition), `docs/domain-model.md`, `docs/content-model.md`, `docs/content-licensing.md`, `docs/risks-and-open-questions.md`.
- `docs/specs/category-filter.md`, `docs/specs/seed-session-structure.md` — the accepted selection/grouping contract, copy conventions and test style this spec must not break.
- `docs/design/prototype/01-explore-general/code.html` (full) and `screen.png` — section order, hero, filters, AI card, three methodology cards, three drill cards, quote card, Mi Club banner.
- `docs/device-development-workflow.md` — Expo Go loop, `adb reverse`, `uiautomator dump`, `screencap`, `logcat` filter.
- `src/modules/content/{index.ts,README.md}`, `domain/{category,exercise,programming,session-part}.ts`, `application/{list-categories,list-exercises,get-programming}.ts`, `infrastructure/bundled-content-repository.ts`, `presentation/**`, `src/shared/ui/**`, `src/shared/theme/**`, `src/app/**`, `src/modules/ai/**`, `src/modules/club/**`, `eslint.config.js`, `package.json`.
- `src/modules/content/infrastructure/content/content-package.json` — 50 exercises, 7 Programming records, `contentVersion` `1.1.0`; verified foci, stages, durations, key concepts and the grouped ids used by this spec's tests.
- `tests/modules/content/**` — especially the browse view-model, composition-wiring, public-API and seed suites.

### Existing Patterns To Follow

- Presentation imports its own `domain`/`application` and `@/shared/*` only; it never imports `infrastructure`, and `content` may not import another module's public API. Adapter wiring stays in `src/app`.
- Content reads go through `listCategories` / `listExercises` / `getProgramming`; visibility is already solved there, so no component reads `status` or `provenance`.
- Spanish UI copy, English identifiers/tests/docs; tokens only (no literal hex); `Card`, `AppText`, `AppButton`, `Chip`, `FilterChip` primitives; `spacing`/`radius`/`elevation`.
- Screens are exported from the module public API; routes stay thin and pass `repository`.
- Node tests are Given/When/Then, mirror the source path, and import layers directly because `node:test` cannot load React Native; structural checks read source text with `node:fs`.

### Current Gaps

- `ExploreScreen` uses `SectionPlaceholder` (tall eyebrow + title + description) and renders `CategoryFilterBar` → `ProgrammingSummaryCard` → `ExerciseLibraryList`; no hero, no AI entry, no methodology, no weekly block.
- There is no "weekly"/scheduled domain concept and no clock/calendar port; the prototype's `Ver Todos (48)`, `180+`, `Generar`, board buttons and quote are not backed by anything in the app.
- The `ai` module exposes only `AssistantScreen` (a `PRÓXIMAMENTE` card); nothing on Explorar links to it.
- `ProgrammingSummaryCard` only shows focus/stage/duration and is superseded by the methodology card.

## Screen Architecture

`ExploreScreen({ repository })` stays the single smart component of `content/presentation`:

- Reads `useCategorySelection()` (root provider, unchanged), `listCategories()`, and when a category is selected builds `buildCategoryBrowseModel(repository, category)` (accepted) plus `buildExploreGeneralModel(repository, category)` (new, pure).
- Renders a local screen scaffold (`SafeAreaView edges={['top']}` + `ScrollView`, same paddings as `SectionPlaceholder`) instead of `SectionPlaceholder`, so the tall eyebrow/title block does not push the AI card below the fold. `SectionPlaceholder` itself is unchanged and stays in use by Pizarra, Asistente IA and Mi Club; no shared primitive is added.
- Composes prop-driven presentational components only; no state beyond the existing selection, no `useEffect`, no fetch, no timers, no date/week read.
- Navigation wiring lives in presentation (allowed by `ARCHITECTURE.md`): the AI card uses Expo Router `Link href="/asistente" asChild` exactly like the existing `/design-system` link, so no `ai` module import and no app route change are needed.
- Route `src/app/(tabs)/index.tsx` is unchanged: `createBundledContentRepository()` + `<ExploreScreen repository={repository} />`.

## Layout And Component Breakdown

| Prototype section | Component (`content/presentation/components/`) | Content source | Notes |
| --- | --- | --- | --- |
| App bar (logo, bell, avatar) | local row in `explore-screen.tsx` | static | Brand mark + `Futsal Manager AI`; bell/avatar dropped (no notifications, no account). |
| Anonymous-access hero + quick stats | `explore-hero.tsx` | `listExercises(repository).length`, `listCategories().length`, static `100%` | Real counts replace `180+`; body copy drops the "generate with AI instantly" claim. |
| Category filters | `category-filter-bar.tsx` (accepted, copy only) | `listCategories()` | Label becomes `CATEGORÍA / RANGO DE EDAD`; no `Todas las Categorías` pill; chips unchanged. |
| AI prompt session card | `ai-session-entry-card.tsx` | static + `Link` | Honest next-phase card with one full-width CTA; no input, no `Generar`, no sample prompts. |
| Methodology by age | `methodology-overview-card.tsx` | `programming.formativeStage/focus/playModel/sessionDurationMinutes/keyConcepts` | One glance card, up to three concepts, no macrocycles/objectives. |
| Weekly recommended exercises | `weekly-exercises.tsx` | weekly rule below + `sessionParts` labels | Text cards (no pitch drawing), part chip, title, summary, meta, counter `3 de 9`. |
| Retained category summary + grouped library | `exercise-library-list.tsx` (accepted, header role) | `buildCategoryBrowseModel` | `ProgrammingSummaryCard` is retired; grouping and counts untouched. |
| Coaching quote card | — | — | Dropped: no derivable source; DESIGN.md forbids decorative gradients. |
| Mi Club optional banner | — | — | Dropped: Mi Club is locked; the tab already communicates next phase. |
| `Ver sistema de diseño` link | local in `explore-screen.tsx` | static | Kept last for the accepted gallery round trip. |

Order in `explore-screen.tsx`: `ExploreHero` → `CategoryFilterBar` → `AiSessionEntryCard` → (`unselected ? prompt : MethodologyOverviewCard → WeeklyExercises → ExerciseLibraryList`) → gallery link. Every section uses its own header `AppText` with `accessibilityRole="header"`.

## Derived Weekly Exercises Rule

**Decision:** the block is `Ejercicios de la Semana` with the rule "one exercise per session part, first in package order". For the selected category, reuse the accepted `sessionParts` groups and take `exercises[0]` of `warm-up`, then `main`, then `cool-down`, skipping an empty part. Three cards for a session-shaped category; `formatWeeklySelection(shown, total)` renders `3 de 9`.

Why this and not a real week:

- There is no week/session/calendar entity in `CONTEXT.md` or `docs/domain-model.md`, no clock port, and no persistence (category selection is explicitly session-only). A rotating "week N" selection would require a date source, an index rule and its own tests for a concept the product has not defined.
- The seed is curated and offline; package order is a documented contract. First-per-part is deterministic, reviewable by the content owner, stable across relaunches, and identical on every device — no hidden state can drift.
- It is session-shaped: a coach sees exactly one warm-up, one main-part and one cool-down drill, which mirrors how the library is grouped and how a session is built (`CONTEXT.md` "Session").
- Alternatives rejected: first three in package order (three main-part drills for six categories, not session-shaped); one random/least-recently-seen (needs persistence); deriving from `Programming.microcycles` (would invent a schedule and duplicate `explore-by-category-screen`).
- The UI never claims rotation: the subtitle pins the rule (`Una tarea de cada tramo de la sesión`), and the counter is `3 de 9`, not `Ver Todos (48)`. When a real scheduling feature lands, a new feature replaces the rule and the copy — this spec records the follow-up.

Pinned picks (bundled package): Infantil → `pase-y-va-carril-central`, `salida-3-1-presion-alta`, `circulacion-cierre-ala`; Senior → `rondo-5v2-activacion`, `salida-3-2-cambio-ala`, `conservacion-6v2-baja-intensidad`; Cadete → `rondo-4v2-activacion`, `salida-3-1-presion-alta`, `conservacion-5v2-baja-intensidad`.

## Methodology Derivation

- New pure builder `buildMethodologyOverview(programming: Programming | null)`; it maps the record, it does not add taxonomy: `{ stage: formativeStage, focus, playModel, sessionDurationLabel: formatSessionDuration(programming), keyConcepts: keyConcepts.slice(0, METHODOLOGY_KEY_CONCEPTS_LIMIT) }` with `METHODOLOGY_KEY_CONCEPTS_LIMIT = 3` and a non-mutating slice.
- The card shows a `Chip` with `formatCategoryLabel(category)` (for example `Infantil (U14)`), the stage as `headlineSm`, `Foco: {focus}`, `playModel` as `bodySm` `textVariant`, `sessionDurationLabel` as `labelMd`, and a `Conceptos clave` mono label followed by the concept chips in a wrapping row.
- `programming === null` → `La metodología de esta categoría estará disponible pronto.`; no category → `Elige una categoría para ver la metodología de su etapa.`
- Boundary with `explore-by-category-screen`: the general screen shows one glance card (stage, focus, play model, ≤3 concepts, duration). The category screen owns the full focus/key-concepts treatment, objectives, macrocycles, microcycles and the library as its primary content.

## AI Entry Point Behaviour And Copy

- Card content: a 32 dp `IA` badge (`secondaryFixed` background, `onSecondaryFixed` label), title `Pídele una sesión a la IA`, subtitle `Generador táctico en tiempo real`, status `Chip variant="tactical-alert"` label `PRÓXIMAMENTE` (replacing the prototype's `Gratis`), body `La generación de sesiones con IA llega en la próxima fase. Mientras tanto, toda la biblioteca curada está disponible sin conexión.`
- Single action: `AppButton variant="ai" label="Abrir Asistente IA" fullWidth` wrapped in `Link href="/asistente" asChild`. Behaviour: switches to the existing Asistente IA tab, which renders its `PRÓXIMAMENTE` placeholder; no AI request, no quota consumption, no loading state, no input. `accessibilityRole="button"`, `accessibilityLabel="Abrir Asistente IA"`, `accessibilityHint="Abre la pestaña Asistente IA, disponible en una próxima fase"`.
- Reachability: the card sits directly after the filter (prototype order) and the hero is compact (no page title block) so the CTA lands at or near the first screenful. If the device smoke shows it below one short scroll, the allowed remedy is to move the AI card above the filter row and record the deviation; the CTA stays full-width with `minHeight` 44 dp from the shared button.
- No category context is passed: nothing consumes it yet. `ai-session-generator-ui` will read `useCategorySelection()` itself.

## States

| State | Hero + filter + AI card | Methodology | Weekly | Library |
| --- | --- | --- | --- | --- |
| `unselected` (initial, and after relaunch) | always rendered | replaced by one prompt card: `Elige una categoría` + `Selecciona un tramo RFEF para ver su programación y su biblioteca de ejercicios.` | inside the same prompt | not rendered |
| `selected` with programming + exercises | rendered, stats unchanged | derived card | three cards + counter | grouped library |
| selected, `programming === null` | normal | `La metodología de esta categoría estará disponible pronto.` | normal | normal |
| selected, zero publishable exercises | normal | programming card or empty copy | `Todavía no hay ejercicios para esta categoría.` | existing empty copy |
| empty session part inside a category | normal | normal | part skipped | `Sin ejercicios en este tramo.` (accepted) |
| loading | none — bundled content is synchronous; no spinner, no skeleton | | | |
| error | none added — a package parse failure fails `npm test`/bundle before rendering; a thrown repository is not caught by the screen (same as accepted screens) | | | |

Copy is Spanish and pinned; identifiers stay English. No optimistic or placeholder "fake" content is rendered in any state.

## Accessibility And Design Tokens

- Touch targets: `FilterChip` 44 dp (accepted) and `AppButton` `minHeight` 44 dp; the AI CTA is `fullWidth`; no icon-only control is introduced.
- Semantics: section titles use `accessibilityRole="header"`; the AI CTA exposes role/label/hint above; the selected chip keeps `accessibilityState={{ selected }}` plus the check glyph; the `IA` badge is `accessibilityElementsHidden`/decorative; stat columns carry `accessibilityLabel="50 ejercicios"`-style labels so numbers are not read alone.
- No colour-only meaning: `PRÓXIMAMENTE` is text, part labels are text, selected state has a glyph. Contrast stays on existing token pairs only.
- Reflow: 320 dp width and `font_scale 1.3` must scroll rather than clip; summaries clamp to 2 lines (`numberOfLines={2}`), play model is not clamped, concept chips wrap.
- Tokens only: colors `background`, `surface`, `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh`, `primary`, `onPrimary`, `primaryFixed`, `onPrimaryFixed`, `secondary`, `secondaryFixed`, `onSecondaryFixed`, `text`, `textVariant`, `outline`, `outlineVariant`, `tertiary`; typography `headlineSm`, `headlineLgMobile` (brand row only if needed), `bodyLg`, `bodyMd`, `bodySm`, `labelLg`, `labelMd`, `labelSm`; spacing `2xs`–`xl`; radius `md`/`lg`/`full`; `elevation.card` for cards, `elevation.raised` only for the hero. No new token, hex literal, font, gradient or heavy shadow.

## Technical Approach

1. **`view-models/explore-general-model.ts`** (pure, no React/RN): `WEEKLY_EXERCISES_PER_PART = 1`, `METHODOLOGY_KEY_CONCEPTS_LIMIT = 3`, types `WeeklyExercise` (`{ part, label, exercise }`), `MethodologyOverview`, `ExploreStats` (`{ exerciseCount, categoryCount, openLabel }`), `ExploreGeneralModel` (`{ stats, weeklyExercises, methodology }`); `buildExploreStats(repository)`, `buildWeeklyExercises(sessionParts)`, `buildMethodologyOverview(programming)`, `buildExploreGeneralModel(repository, category | null)`, `formatWeeklySelection(shown, total)`. It consumes `buildCategoryBrowseModel`, `listExercises` and `listCategories`; no visibility logic of its own.
2. **Components** in `presentation/components/`: `explore-hero.tsx`, `ai-session-entry-card.tsx`, `methodology-overview-card.tsx`, `weekly-exercises.tsx` — all prop-driven, tokens only.
3. **`screens/explore-screen.tsx`**: local scaffold, the composition above, prompt state, gallery link; builds `browseModel` and `generalModel` only when a category is selected.
4. **`category-filter-bar.tsx`**: label copy to `CATEGORÍA / RANGO DE EDAD`; everything else unchanged.
5. **`exercise-library-list.tsx`**: add `accessibilityRole="header"` to its header; no copy or grouping change.
6. **Delete `presentation/components/programming-summary-card.tsx`** — its focus/stage/duration content moved into the methodology card; nothing else imports it.
7. **Public API**: export the new builders, limits and types from `src/modules/content/index.ts`; update the barrel test.

## Expected Files By Module And Layer

| Module | Layer | File | Change |
| --- | --- | --- | --- |
| `content` | presentation/view-models | `explore-general-model.ts` | **new** — weekly rule, methodology mapping, stats, formatter |
| `content` | presentation/components | `explore-hero.tsx` | **new** |
| `content` | presentation/components | `ai-session-entry-card.tsx` | **new** (Link to `/asistente`) |
| `content` | presentation/components | `methodology-overview-card.tsx` | **new** |
| `content` | presentation/components | `weekly-exercises.tsx` | **new** |
| `content` | presentation/components | `programming-summary-card.tsx` | **deleted** (superseded) |
| `content` | presentation/components | `category-filter-bar.tsx`, `exercise-library-list.tsx` | copy + header role only |
| `content` | presentation/screens | `explore-screen.tsx` | recomposed, local scaffold |
| `content` | public API | `src/modules/content/index.ts`, `README.md` | new exports + catalogue text |
| tests | presentation | `tests/modules/content/presentation/view-models/explore-general-model.test.ts` | **new** |
| tests | presentation | `tests/modules/content/presentation/screens/explore-general-screen.test.ts` | **new** source-structure guard |
| tests | public API | `tests/modules/content/index.test.ts` | new export names |
| docs | — | this spec, `ARCHITECTURE.md`, `src/modules/content/README.md`, `docs/content-model.md`, `docs/risks-and-open-questions.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json` | see Durable Documentation Impact |

**Unchanged:** `src/app/**` (route already passes `repository`), `src/shared/**`, `src/modules/{board,ai,club}/**`, all content `domain`/`application`/`infrastructure` files, `content-package.json`, `package.json`, `eslint.config.js`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, `docs/build-brief.md`, `docs/board-data-schema.md`, `docs/technical-discovery.md`.

## Test Plan

Baseline **255 tests / 173 suites**. No React Native renderer exists; coverage is pure view model + structural guard + device smoke. Expected **+10 to +15 tests**, ~**265–270 / 175–176**.

| File | Type | Assertions |
| --- | --- | --- |
| `presentation/view-models/explore-general-model.test.ts` (**new**) | bundled package + fake repositories | Infantil → pinned weekly ids and labels in part order, counter `3 de 9`, methodology stage/focus/play-model/duration, exactly 3 key concepts and the source array unmutated; Senior → pinned ids, `3 de 7`, Senior stage; Cadete → pinned ids (crossover `salida-3-1-presion-alta` inside `main`); `buildExploreStats` → `50`/`7` for the bundle and a smaller count for a fake; `category === null` → empty weekly, `methodology === null`, stats still computed; fake repository without Programming → `methodology === null`; fake category with a single session part → one weekly card, no invented parts; draft/archived/unlicensed fake records never appear (delegated to `listExercises`); `formatWeeklySelection(3, 9) === '3 de 9'` and `(0, 0) === '0 de 0'`; deterministic: two calls return equal id arrays. |
| `presentation/screens/explore-general-screen.test.ts` (**new**) | source structure (`node:fs`) | `explore-screen.tsx` composes hero, filter, AI card, methodology, weekly and library in that JSX order and no longer references `ProgrammingSummaryCard`; `ai-session-entry-card.tsx` contains `href="/asistente"`, `Abrir Asistente IA`, `PRÓXIMAMENTE` and no `AppInput`/`Generar`; the pinned Spanish strings exist; none of the new files contains a literal `#rrggbb` colour or an `infrastructure` import. |
| `tests/modules/content/index.test.ts` (update) | public API barrel | also exports `buildExploreGeneralModel`, `buildExploreStats`, `buildWeeklyExercises`, `buildMethodologyOverview`, `formatWeeklySelection`, `WEEKLY_EXERCISES_PER_PART`, `METHODOLOGY_KEY_CONCEPTS_LIMIT`, `ExploreGeneralModel`, `WeeklyExercise`, `MethodologyOverview`, `ExploreStats`; existing exports unchanged. |
| browse view-model, selection, composition-wiring, seed suites (unchanged) | node:test | stay green with no edits; proves grouping/selection/read-layer contracts were not re-implemented. |

## Verification Plan

1. `npm test` — new suites green, counts recorded before/after; `npm run lint`, `npm run typecheck`, `npm run verify` (expo-doctor 20/20), `./init.sh` exit 0 and no Metro.
2. Scans: `rg '#[0-9a-fA-F]{3,8}' src/modules/content/presentation` empty; `rg 'content/infrastructure' src/modules/content/presentation` empty; `rg 'modules/ai' src/modules/content` empty; `git diff --stat` limited to the files table above.
3. `npx expo export --platform android`, then a UTF-16LE scan of the bundle for `Ejercicios de la Semana`, `Pídele una sesión a la IA`, `Abrir Asistente IA`, `Acceso Libre para Entrenadores` (macOS `strings` is ASCII-only).
4. **Android device smoke** (`SM-M135F`, Android 14, Expo Go 58.0.5; `export ANDROID_HOME=…`, `adb reverse tcp:8081 tcp:8081`, `npm start -- --localhost`, deep link `exp://127.0.0.1:8081`):
   1. Cold launch, no category: screenshot next to `docs/design/prototype/01-explore-general/screen.png`; `uiautomator dump` confirms app bar, `Acceso Libre para Entrenadores`, `SIN REGISTRO PREVIO`, `50 Ejercicios`, `7 Categorías`, `100% Abierto`, the seven chips, `Pídele una sesión a la IA`, `Abrir Asistente IA`, and the prompt; no `Generar`, `Ver Pizarra Táctica`, `180+`, `Todas las Categorías` in the dump (Scenario 1).
   2. Record the CTA bounds from the dump and confirm `height ≥ 44 dp` (px ÷ 2.8125 at 450 dpi), full-card width, and presence within the first screenful or one short swipe (Scenario 3).
   3. Tap `Abrir Asistente IA`: the Asistente IA tab shows `PRÓXIMAMENTE`; return to Explorar; no error in `logcat`.
   4. Select `Infantil (U14)`: weekly shows `Pase y va al carril central`, `Salida 3-1 ante presión alta`, `Circulación rápida cierre-ala`, `3 de 9`, `CALENTAMIENTO`/`PARTE GENERAL`/`VUELTA A LA CALMA`, and the methodology stage/focus; library still 2/5/2 (Scenario 2).
   5. Select `Senior (+18)`: weekly and methodology swap, `3 de 7`, no Infantil title remains; verify Cadete once for the crossover pick.
   6. Selection persists across Pizarra and the `/design-system` round trip; force-stop + relaunch resets to the prompt (accepted behaviour).
   7. `320 dp` width at `font_scale 1.3`: header, AI card, chips, methodology chips and weekly cards scroll without clipped or overlapped text; restore settings.
   8. `adb logcat -d -t 400 | grep -iE "ReactNativeJS.*(error|exception)|FATAL EXCEPTION"` returns nothing; Pizarra, Asistente IA and Mi Club unchanged.
5. Persistent E2E: none exists. This is the agreed coverage: pure view-model tests, one source-structure test, and the scripted device smoke.

## Durable Documentation Impact

- `ARCHITECTURE.md` — **update:** `content.presentation` now owns the general Explorar composition (hero, AI entry link, methodology overview, weekly derivation, grouped library), the new `explore-general-model`, and the fact that Explorar's AI entry is a navigation link to the `(tabs)` route with no `ai` module import and no AI call. No layer, port or dependency-graph change.
- `src/modules/content/README.md` — **update:** presentation description, new files, retired `ProgrammingSummaryCard`, public exports, test locations.
- `docs/content-model.md` — **update:** presentation consumer section: the general screen derives a weekly slice (one exercise per session part, first in package order) and a methodology glance card from `Programming`; still publishable-only.
- `docs/risks-and-open-questions.md` — **update:** add "no week/scheduler model; weekly block is a deterministic curated slice" and "the Explorar AI entry leads to the next-phase assistant placeholder until `ai-session-generator-ui`"; move the next-feature note to `explore-by-category-screen`.
- `AGENTS.md` — **update:** project status (general Explorar recomposed; next ready feature `explore-by-category-screen`; thumbnail still deferred).
- `PROGRESS.md`, `feature_list.json` — **update:** evidence and state.
- `docs/domain-model.md` — **not needed:** no entity, relationship or lifecycle changes; the weekly slice is presentation derivation and the category-selection lifecycle is already documented.
- `DESIGN.md` — **not needed:** no token, font, shadow or layout-system change; empty states reuse documented tokens, and dropping the gradient quote card follows the existing "no decorative gradients" rule.
- `CONTEXT.md` — **not needed:** no new term is introduced; copy avoids "Tarea" in favour of "Ejercicio".
- `docs/build-brief.md`, `docs/technical-discovery.md`, `docs/board-data-schema.md`, `docs/content-licensing.md` — **not needed:** product slice, stack/test runner, Board Data and licensing policy are unchanged.
- `CONSTRAINTS.md` — **not needed:** the file does not exist.

## Implementation Plan And Tasks

1. Read this spec, `docs/specs/category-filter.md`, `docs/specs/seed-session-structure.md`, prototype 01 and the current presentation files; run `./init.sh` to confirm the 255/173 baseline.
2. Add `explore-general-model.ts` with the pinned limits, types, builders and formatter; write its test against the bundled package and fake repositories.
3. Build `ExploreHero`, `AiSessionEntryCard`, `MethodologyOverviewCard`, `WeeklyExercises` with tokens only and the pinned copy.
4. Recompose `explore-screen.tsx` (local scaffold, prompt state, section order, gallery link); delete `ProgrammingSummaryCard`; align the filter label and add the library header role.
5. Export the new surface and update the barrel test; add the source-structure guard test.
6. Run the gate, scans and Android export.
7. Run the device smoke script and capture dumps/screenshots (including the CTA bounds and the prototype comparison).
8. Update the named durable docs and harness state; tick this checklist.

- [x] Add the pure `explore-general-model` with `WEEKLY_EXERCISES_PER_PART = 1`, `METHODOLOGY_KEY_CONCEPTS_LIMIT = 3`, stats, methodology mapping and `formatWeeklySelection`.
- [x] Add the four presentational components with the pinned Spanish copy and tokens only.
- [x] Recompose `ExploreScreen` in prototype order and keep the accepted selection provider and session grouping.
- [x] Delete `ProgrammingSummaryCard` and confirm nothing imports it; keep `SectionPlaceholder` for the other tabs.
- [x] Wire the AI CTA to `/asistente` via `Link` with no `ai` module import and no AI request.
- [x] Write the view-model and source-structure tests; update the public-API surface test.
- [x] Run gate, scans, export and the `SM-M135F` smoke; record evidence, including CTA bounds.
- [x] Update the durable docs and harness state.

## Evidence To Capture

- Before/after test and suite counts plus the new suites' assertion results.
- `lint`/`typecheck`/`verify`/`./init.sh` exit codes with the expo-doctor score; scan outputs (empty) and `git diff --stat` scope proof.
- Android bundle size and the Spanish strings found in the bundle.
- Device model/density, prototype-comparison screenshot, `uiautomator` text dump of the cold-launch state, CTA bounds (px and dp), the Asistente IA navigation result, Infantil/Senior/Cadete weekly ids and counters, methodology copy per category, persistence across tabs, relaunch reset, 320 dp/1.3 check, and `logcat` status.
- Confirmation that no content, Board Data, version, AI, quota, board, route, shared, theme, `package.json` or `eslint.config.js` file changed.

## Validator Checklist

- [x] Scope matches this spec: only `content/presentation`, the content public API, mirrored tests and the named docs changed.
- [x] The three `feature_list` scenarios pass on `SM-M135F`: prototype layout comparison, weekly exercises updating with the category, AI entry visible and reachable one-handed.
- [x] The weekly rule is exactly one exercise per session part, first in package order, skipping empty parts; no week, clock, random or persisted state exists; the counter reads `3 de N`.
- [x] Methodology content comes only from the selected `Programming` record (≤3 key concepts), with the two pinned empty states and no invented quote, taxonomy or objective list.
- [x] The AI entry is a visible, full-width, ≥44 dp CTA that navigates to the existing Asistente IA tab; there is no input, `Generar`, network call, quota effect or `ai` module import.
- [x] Accepted behaviours preserved: root `CategorySelectionProvider`, seven chips with selected state + glyph, session grouping with counts, gallery link, session-only reset.
- [x] No dead controls and no unbacked prototype numbers (`180+`, `48`, `Ver Todos`, `Ver Pizarra Táctica`, bookmarks, bell/avatar, `Todas las Categorías`).
- [x] Tokens only: no literal hex, new font, new shadow, gradient or new shared primitive; touch targets ≥ 44 dp; section headers and CTA semantics exposed.
- [x] No content/Board Data/version/port/use-case/AI/quota/route/`package.json`/`eslint.config.js` change; `contentVersion` and `CONTENT_PACKAGE_VERSION` stay `1.1.0`.
- [x] Test files are Given/When/Then, mirror the source tree, pass with the full suite, and the barrel test lists the new exports.
- [x] Durable docs updated as listed; evidence recorded; task boxes ticked.

## Prototype Deviations

Intentional, each justified by what the repository actually supports: no `Todas las Categorías` (no all-category state); no demo prompt input, sample prompts or `Generar` (no AI); no pitch drawing on cards, no `Ver Pizarra Táctica`, no bookmark (no renderer/detail/favourites); no `Ver Todos (48)` (no category route, and the count was fictional); no `180+` (50 seeded exercises); no coaching quote card (no derivable source, and DESIGN.md forbids decorative gradients); no Mi Club banner (locked next phase); no bell/avatar (no notifications, no account); methodology is one derived card instead of three invented stage cards (no stage taxonomy exists beyond `Programming.formativeStage`).

### Implementation Deviations

- The weekly subtitle uses `Un ejercicio de cada tramo de la sesión` instead of the planned `Una tarea de cada tramo de la sesión`, following `CONTEXT.md`, which asks for `Ejercicio` rather than `Tarea` in UI copy. The structure guard and the Android bundle pin the final string.
- `AiSessionEntryCard` adds a local `minHeight: spacing.xl + spacing.md` (48 dp) to its CTA. The shared `AppButton` rendered 43.73 dp on `SM-M135F`, below the 44 dp target; the measured CTA is now 850x135 px = 302x48 dp at density 450. No shared primitive or token changed.
- `buildWeeklyExercises` iterates `SESSION_PARTS` itself, so it returns warm-up -> main -> cool-down even if a caller supplies the groups out of order; the test covers that input.


- On a 384 dp phone viewport the hero title wraps to two lines instead of the prototype's single line; this is accepted responsive behaviour, not a copy change.
- The prototype's small `Filtro Rápido` helper label and the `Metodología RFEF por Edades` section heading/subtitle are not rendered; the cards below already carry the category and methodology semantics, and adding an extra heading would duplicate them.

## Planning-Time Risks

- **"Semana" copy without a scheduler.** The heading is a prototype carry-over while the rule is fixed. Mitigation: the subtitle states the rule, the counter shows `3 de N`, weekend/rotation semantics are explicitly owned by a future feature, and the risk is recorded in `docs/risks-and-open-questions.md`.
- **Visible fidelity gap: no pitch artwork.** Prototype cards lead with a board drawing; ours are text-only until `tactics-board-renderer` / `exercise-preview-board-thumbnail`. Mitigation: strong part chips and metadata, documented deviation, and the deferred thumbnail feature already exists in `feature_list.json`.
- **Hero + chips can still push the AI CTA below the fold** on small phones or large font scales. Mitigation: no tall page title, compact hero, measured CTA bounds in the smoke; if it fails, the agreed remedy is to move the AI card above the filter row and record it.
- **Methodology overlap with `explore-by-category-screen`.** Mitigation: glance card only (stage/focus/play model/≤3 concepts/duration), no objectives or macrocycles, boundary stated here and in the architecture note; the category screen remains the detail owner.
- **Retiring `ProgrammingSummaryCard`.** A later spec could reference it. Mitigation: the methodology card carries all of its fields, the deletion is documented in `README.md`/`ARCHITECTURE.md`, and no barrel export or test depended on the component.
- **Hardcoded `/asistente` path inside `content/presentation`.** It duplicates app routing knowledge. Mitigation: allowed by `ARCHITECTURE.md` (presentation owns navigation wiring), mirrors the accepted `/design-system` link, appears once in one component, and is pinned by the structure test.
- **Stats are content-count assertions.** Hardcoding `50` would rot on the next seed change. Mitigation: the hero always computes counts from the read layer; tests assert computed values against `listExercises`/`listCategories`.
- **Long screen.** Seven sections plus a grouped library exceed the prototype's length. Mitigation: compact hero, three weekly cards, no duplicated programming card, and a check that the first screen still shows the AI entry.
- **No React Native renderer; structure tests are text-based.** Source-regex guards can drift and prove nothing about layout. Mitigation: keep them few and behavioural-adjacent (href, copy, order, no literal colours), and rely on the scripted device smoke for layout/visual truth. Adopting RNTL remains a separate harness decision already recorded.
