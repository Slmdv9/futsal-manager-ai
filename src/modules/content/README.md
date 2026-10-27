# Content module

Owns Category reference data, Exercise, Programming, the bundled content package, and the read layer that powers browsing. Board Data is a shared kernel in `src/shared/domain/board-data` because content, board, and AI all exchange it. The durable contract is `docs/content-model.md`.

## Layers

- `domain` — active. Seven frozen RFEF `Category` brackets, `Exercise`, `Programming`, the shared `SESSION_PARTS`/`SessionPart` vocabulary in `session-part.ts`, `ContentProvenance` plus the licence policy helpers in `provenance.ts` (`PUBLISHABLE_LICENSE_STATUSES`, `isPublishableProvenance`, `requiresAttribution`, `isLicenseStatusAllowedForKind`), the strict `content-package.ts` contract (`CONTENT_PACKAGE_VERSION`, `parseContentPackage`, `safeParseContentPackage`, `ContentValidationError`), and the `ContentRepository` port in `domain/ports`.
- `application` — active. Publishable-only use cases: `listCategories`, `listExercises`, `getExercise`, `getProgramming`.
- `infrastructure` — active. `content/content-package.json` plus `bundled-content-repository.ts` (`createBundledContentRepository`), which imports the JSON as `unknown`, parses it once, and indexes it. The bundled seed holds 50 original exercises and seven Programming records (one per RFEF category) at `contentVersion` `1.1.0`: six categories carry seven exercises split 2/3/2 by `sessionPart`, Infantil U14 keeps its nine split 2/5/2, and `infantil-u14-base` stays at record version `1.1.0`.
- `presentation` — active. `ExploreScreen({ repository })` composes the general Explorar screen: a compact app bar and `ExploreHero` (real counts from `listExercises`/`listCategories`), `CategoryFilterBar` (seven RFEF `FilterChip`s under `CATEGORÍA / RANGO DE EDAD`), `AiSessionEntryCard` (a `Link` to the existing `/asistente` tab with no `ai` module import), `MethodologyOverviewCard` (a glance card derived from the selected `Programming` record), `WeeklyExercises` (one exercise per session part), and `ExerciseLibraryList`, which renders the three Spanish session-part headings with counts. Session-only selection lives in `state/category-selection.ts` (pure reducer) and `state/category-selection-provider.tsx` (`CategorySelectionProvider`, `useCategorySelection`), mounted once in `src/app/_layout.tsx`; `view-models/category-browse-model.ts` builds the filtered model through `listExercises`/`getProgramming`, groups it with `groupExercisesBySessionPart`, and owns the Spanish formatters, while `view-models/explore-general-model.ts` owns the hero stats, the deterministic weekly slice, the methodology mapping and `formatWeeklySelection`. `ProgrammingSummaryCard` was retired because the methodology card owns its fields. The dedicated category detail belongs to `explore-by-category-screen` and exercise detail to `exercise-detail-screen`.

## Public API

`src/modules/content/index.ts`. Other modules and routes must not import this module's internals directly. It exports the categories, package parser and error, entities, `SESSION_PARTS`/`SessionPart`, port, use cases, the bundled repository factory, `ExploreScreen`, the session selection state and provider (`INITIAL_CATEGORY_SELECTION`, `selectCategory`, `CategorySelectionProvider`, `useCategorySelection`), the browse view model plus formatters (`buildCategoryBrowseModel`, `groupExercisesBySessionPart`, `formatCategoryLabel`, `formatExerciseMeta`, `formatSessionDuration`, `formatExerciseCount`, `formatSessionPartLabel`, `SessionPartGroup`), and the general explore model (`buildExploreGeneralModel`, `buildExploreStats`, `buildWeeklyExercises`, `buildMethodologyOverview`, `formatWeeklySelection`, `WEEKLY_EXERCISES_PER_PART`, `METHODOLOGY_KEY_CONCEPTS_LIMIT`, `ExploreGeneralModel`, `ExploreStats`, `WeeklyExercise`, `MethodologyOverview`).

Browse flow: route → `createBundledContentRepository` → `ExploreScreen({ repository })` → session category selection → browse view model → use case → `ContentRepository` → bundled adapter → shared `parseBoardData`.

## Rules

- Categories exist only as domain reference data; the package references ids and parsing rejects unknown ones.
- Every exercise declares a required `sessionPart` (`warm-up`, `main`, or `cool-down`); the parser never defaults it, and grouping preserves package order inside the fixed session-part order.
- Every exercise `boardData` is validated with `parseBoardData`; issues surface under `exercises.<i>.boardData.`.
- Licensing is a gate, not a note: parsing rejects published content unless its `licenseStatus` is `owned` or `permitted`, rejects `kind`/`licenseStatus` contradictions, and requires `attribution` for published `permitted`/`cmd-mora` records. Policy and source register: `docs/content-licensing.md`.
- Visibility means `published` **and** publishable: `listExercises`, `getExercise`, and `getProgramming` use `isPublishableExercise` / `isPublishableProgramming`, so an unlicensed record never leaks from a non-bundled repository. `isPublishedExercise` / `isPublishedProgramming` are status-only helpers, never a visibility rule.
- Programming returns one publishable record per category or `null`.
- A two-category exercise appears once under each category and never twice in one result.

## Tests

Mirror the source path under `tests/modules/content/`. `node:test` cannot load React Native, so node tests import layers directly; the presentation suites cover the pure selection reducer, the browse view model, the general explore view model, and the app composition wiring, plus a source-structure guard for the new screen and components (`tests/modules/content/presentation/screens/explore-general-screen.test.ts`), while `tests/modules/content/index.test.ts` checks the public API surface and the device smoke covers the rendered route.
