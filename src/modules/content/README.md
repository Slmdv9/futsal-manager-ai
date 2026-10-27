# Content module

Owns Category reference data, Exercise, Programming, the bundled content package, and the read layer that powers browsing. Board Data is a shared kernel in `src/shared/domain/board-data` because content, board, and AI all exchange it. The durable contract is `docs/content-model.md`.

## Layers

- `domain` — active. Seven frozen RFEF `Category` brackets, `Exercise`, `Programming`, `ContentProvenance` plus the licence policy helpers in `provenance.ts` (`PUBLISHABLE_LICENSE_STATUSES`, `isPublishableProvenance`, `requiresAttribution`, `isLicenseStatusAllowedForKind`), the strict `content-package.ts` contract (`CONTENT_PACKAGE_VERSION`, `parseContentPackage`, `safeParseContentPackage`, `ContentValidationError`), and the `ContentRepository` port in `domain/ports`.
- `application` — active. Publishable-only use cases: `listCategories`, `listExercises`, `getExercise`, `getProgramming`.
- `infrastructure` — active. `content/content-package.json` plus `bundled-content-repository.ts` (`createBundledContentRepository`), which imports the JSON as `unknown`, parses it once, and indexes it. The bundled seed holds 26 original exercises and seven Programming records (one per RFEF category): `infantil-u14-base` (record version `1.1.0`) is the deep slice and the six other categories carry three representative exercises plus a `1.0.0` base record; `contentVersion` stays `1.0.0`.
- `presentation` — Explorar placeholder until `explore-general-screen`; exercise detail follows in `exercise-detail-screen`.

## Public API

`src/modules/content/index.ts`. Other modules and routes must not import this module's internals directly. It exports the categories, package parser and error, entities, port, use cases, the bundled repository factory, and `ExploreScreen`.

Browse flow: route → use case → `ContentRepository` → bundled adapter → shared `parseBoardData`.

## Rules

- Categories exist only as domain reference data; the package references ids and parsing rejects unknown ones.
- Every exercise `boardData` is validated with `parseBoardData`; issues surface under `exercises.<i>.boardData.`.
- Licensing is a gate, not a note: parsing rejects published content unless its `licenseStatus` is `owned` or `permitted`, rejects `kind`/`licenseStatus` contradictions, and requires `attribution` for published `permitted`/`cmd-mora` records. Policy and source register: `docs/content-licensing.md`.
- Visibility means `published` **and** publishable: `listExercises`, `getExercise`, and `getProgramming` use `isPublishableExercise` / `isPublishableProgramming`, so an unlicensed record never leaks from a non-bundled repository. `isPublishedExercise` / `isPublishedProgramming` are status-only helpers, never a visibility rule.
- Programming returns one publishable record per category or `null`.
- A two-category exercise appears once under each category and never twice in one result.

## Tests

Mirror the source path under `tests/modules/content/`. `node:test` cannot load React Native, so node tests import layers directly; `tests/modules/content/index.test.ts` checks the public API surface and the device smoke covers the route that imports it.
