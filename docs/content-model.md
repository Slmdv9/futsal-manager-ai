# Content Model

The durable contract for curated content: Category reference data, Exercise, Programming, the bundled content package, its validation rules, and the read layer that powers browsing and later AI grounding.

`docs/domain-model.md` owns the vocabulary and relationships. This document owns the concrete shape, file paths, invariants, and validation behavior. `docs/content-licensing.md` owns the licensing policy, the source register, and the author checklist.

## Source Of Truth

| Artifact | Path |
| --- | --- |
| Category reference data | `src/modules/content/domain/category.ts` |
| Exercise entity | `src/modules/content/domain/exercise.ts` |
| Collection vocabulary | `src/modules/content/domain/exercise-collection.ts` |
| Session part vocabulary | `src/modules/content/domain/session-part.ts` |
| Programming entity | `src/modules/content/domain/programming.ts` |
| Provenance | `src/modules/content/domain/provenance.ts` |
| Package contract, schema, parser | `src/modules/content/domain/content-package.ts` |
| Read port | `src/modules/content/domain/ports/content-repository.ts` |
| Bundled package | `src/modules/content/infrastructure/content/content-package.json` |
| Bundled adapter | `src/modules/content/infrastructure/bundled-content-repository.ts` |
| Category selection state | `src/modules/content/presentation/state` |
| Browse view model | `src/modules/content/presentation/view-models/category-browse-model.ts` |
| Category browser screen | `src/modules/content/presentation/screens/explore-screen.tsx` |
| Public API | `src/modules/content/index.ts` |

Board Data is a shared kernel, not content-owned: `src/shared/domain/board-data` and `docs/board-data-schema.md`.

## Categories

Categories are **domain reference data**, not JSON entries. There are exactly seven official RFEF age brackets, in this order:

| Order | id | Name | Age label | Age range |
| --- | --- | --- | --- | --- |
| 1 | `prebenjamin` | Prebenjamín | U8 | 6–7 |
| 2 | `benjamin` | Benjamín | U10 | 8–9 |
| 3 | `alevin` | Alevín | U12 | 10–11 |
| 4 | `infantil` | Infantil | U14 | 12–13 |
| 5 | `cadete` | Cadete | U16 | 14–15 |
| 6 | `juvenil` | Juvenil | U19 | 16–18 |
| 7 | `senior` | Senior | +18 | open-ended (`null`) |

- A Category is an age bracket, never a skill tier. There is no Chupetín stage in the model; source material that uses different stage names must be mapped explicitly when seeding.
- The package references categories by id only, so names are never duplicated in JSON.
- `CATEGORY_IDS`, `CATEGORIES`, `isCategoryId`, and `getCategoryById` are the only accessors. `CATEGORIES` is frozen.

## Exercise

An Exercise is the atomic library unit: one drill with one Board Data payload.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | lowercase slug | unique across the package |
| `title` | text ≤ 90 | Spanish |
| `summary` | text ≤ 240 | Spanish |
| `focus` | text ≤ 60 | e.g. `Salida de presión`, `Defensa` |
| `sessionPart` | `'warm-up' \| 'main' \| 'cool-down'` | required; never inferred from `focus` |
| `collection` | `'library' \| 'weekly'` | required; separates the browsable library from weekly highlights |
| `categoryIds` | `CategoryId[]` | 1–3 entries, unique, all known |
| `objective` | text ≤ 300 | Spanish |
| `players` | `{ total: 2–30; goalkeepers: 0–4 }` | `total >= goalkeepers` |
| `space` | `{ label; widthM; lengthM }` | 4–60 m each; `widthM` across the pitch, `lengthM` end to end |
| `durationMinutes` | integer | 5–120 |
| `intensity` | `{ level: 'low' \| 'medium' \| 'high'; percent?: 0–100 }` | |
| `workStructure` | text ≤ 120 | e.g. `Bloques de 3 minutos x 4 series` |
| `constraints` | `{ rule; detail }[]` | ≤ 6 entries |
| `coachingCues` | text[] | 1–8 entries |
| `boardData` | `BoardData` | validated with `parseBoardData` |
| `status` | `'draft' \| 'published' \| 'archived'` | only `published` + publishable provenance is readable |
| `provenance` | `ContentProvenance` | required on every record; see `docs/content-licensing.md` |
| `references` | `{ label; url }[]` | optional, ≤ 3; `url` must be an absolute http(s) URL |

## Programming

Programming is the per-category methodology and season plan. There is **at most one published record per Category**.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | lowercase slug | unique across the package |
| `categoryId` | `CategoryId` | known category |
| `version` | semver string | plan version of this record, independent of `contentVersion` (`infantil-u14-base` is `1.1.0`) |
| `formativeStage` | text ≤ 90 | |
| `focus` | text ≤ 160 | |
| `playModel` | text ≤ 240 | |
| `sessionDurationMinutes` | `{ min; max }` | 20–180 each, `max >= min` |
| `keyConcepts` | text[] | 1–8 entries |
| `objectives` | text[] | 1–8 entries |
| `sessionStructure` | `{ part: 'warm-up' \| 'main' \| 'cool-down'; title; description }[]` | 1–5 entries |
| `macrocycles` | `{ id; label; focus; microcycles }[]` | 1–6 entries |
| `microcycles` | `{ id; label; focus; sessionCount: 1–20 }[]` | 1–8 per macrocycle |
| `status` | `'draft' \| 'published'` | only `published` + publishable provenance is readable |
| `provenance` | `ContentProvenance` | required on every record; see `docs/content-licensing.md` |

## Provenance

Every record carries provenance and the licence policy is enforced when the package is parsed:

```ts
type ContentProvenance = {
  kind: 'original' | 'cmd-mora' | 'reference';
  sourceName: string;
  licenseStatus: 'owned' | 'permitted' | 'reference-only' | 'pending' | 'unlicensed';
  attribution?: string;
};
```

The current seed package is `original` with `licenseStatus: 'owned'`, `sourceName` `Futsal Manager AI`. The policy, the source register, and the author checklist live in `docs/content-licensing.md`; the enforced rules are:

- only `owned` and `permitted` may be published; `pending`, `unlicensed`, and `reference-only` records stay draft or archived;
- `kind` and `licenseStatus` cannot contradict: `cmd-mora` requires `permitted`, `reference` requires `reference-only` or `pending`, `original` accepts any status;
- published `permitted` or `cmd-mora` content must carry an `attribution`;
- the read layer also filters published-but-unlicensed records, so a repository that bypasses the parser cannot leak them.

The licence gate makes the value required and exposes `requiresAttribution`; the exercise detail screen renders it under `Atribución` when present.

## Package Contract

`content-package.json` is the single bundled content package:

```json
{
  "contentVersion": "1.2.0",
  "exercises": [],
  "programming": []
}
```

- `CONTENT_PACKAGE_VERSION` (`src/modules/content/domain/content-package.ts`) must equal the JSON `contentVersion`. Any other version fails validation. Additive changes bump the constant and the JSON together; breaking changes need a migration decision first.
- `contentVersion` is `1.2.0` since `Exercise` gained the required `collection` and the optional `references` fields. Board Data stays `1.0.0`.
- `Programming.version` is the plan version of that single record, not the package version. `infantil-u14-base` is `1.1.0` because its season plan grew to three macrocycles; the six other base records are `1.0.0`.
- Unknown keys are rejected at every level.
- The package is imported once, parsed once, and indexed by the bundled adapter.
- Current seed scope: 50 library exercises + 21 weekly highlights = 71 original exercises, plus 7 published Programming records, 78 audited records in total. Each non-Infantil category has seven library exercises split 2 warm-up / 3 main / 2 cool-down; Infantil keeps its original nine library exercises split 2 warm-up / 5 main / 2 cool-down. Every category also has exactly three weekly highlights, one per session part. Package order is part of the contract and append-only: exercises 0–25 keep their original sequence (index 0 is `salida-3-1-presion-alta`, tagged `infantil` + `cadete`), then indices 26–49 append four library exercises per category in `CATEGORY_IDS` order — Prebenjamín, Benjamín, Alevín, Cadete, Juvenil, Senior — and indices 50–70 append the 21 weekly highlights in the same category order, warm-up → main → cool-down inside each category. Programming holds `infantil-u14-base` (version `1.1.0`) first, then `prebenjamin-u8-base`, `benjamin-u10-base`, `alevin-u12-base`, `cadete-u16-base`, `juvenil-u19-base`, and `senior-base`, each at version `1.0.0`. Seed tests assert the exact 50 library ids and 21 weekly ids in package order and the seven Programming ids in `CATEGORY_IDS` order.

## Invariants And Validation

`safeParseContentPackage(input)` and `parseContentPackage(input)` enforce, in order:

1. Strict structural schema: package, Exercise, Programming, provenance, nested macrocycles/microcycles. A missing `provenance` block reports `Provenance is required on every Exercise and Programming record.`
2. `contentVersion` equals `CONTENT_PACKAGE_VERSION`.
3. Exercise ids are unique; Programming ids are unique.
4. `categoryIds` is non-empty, unique, and every id is one of the seven RFEF brackets.
5. `players.total >= players.goalkeepers`.
6. Licensing: a published record needs `owned` or `permitted`; published `permitted`/`cmd-mora` content needs `attribution`; every record's `kind` must allow its `licenseStatus` (see `docs/content-licensing.md`).
7. At most one `published` Programming record per `categoryId`.
8. Every Exercise has a `sessionPart` of `warm-up`, `main`, or `cool-down`; a missing value reports `exercises.<i>.sessionPart`, and an unknown value fails with the three allowed values.
9. Every Exercise has a `collection` of `library` or `weekly`; a missing or unknown value reports `exercises.<i>.collection` with `Exercise collection must be "library" or "weekly".`
10. Every Exercise `references` entry needs a `label` and an absolute http(s) `url`; invalid URLs report `exercises.<i>.references.<j>.url: Reference url must be an absolute http(s) URL.` and more than three entries report `exercises.<i>.references: At most 3 reference citations are allowed per exercise.`
11. Every Exercise `boardData` passes `parseBoardData`; Board Data issues are re-prefixed under `exercises.<i>.boardData.`.

Issues use dot paths like Board Data issues, for example:

- `exercises.26.sessionPart` — missing or unsupported session part.
- `exercises.50.collection` — missing or unsupported exercise collection.
- `exercises.50.references.0.url` — reference url that is not an absolute http(s) URL.
- `exercises.50.references` — more than three reference citations.
- `exercises.1.categoryIds.0` — unknown category id on the second exercise.
- `exercises.1.id` — duplicate exercise id.
- `exercises.1.categoryIds` — empty category list.
- `exercises.0.players.total` — goalkeepers exceed the player total.
- `exercises.0.provenance` — record without provenance.
- `exercises.0.provenance.licenseStatus` — published with `pending`, `unlicensed`, or `reference-only`, or a `kind`/`licenseStatus` contradiction.
- `exercises.0.provenance.attribution` — published `permitted`/`cmd-mora` record without attribution.
- `exercises.0.boardData.phases.1.positions` — missing phase position.
- `exercises.0.boardData.phases.1.positions.0.x` — coordinate outside 0–100.
- `programming.2.categoryId` — second published Programming record for one category.
- `contentVersion` — unsupported package version.

`parseContentPackage` throws `ContentValidationError` with every issue formatted as `<path>: <message>`; the safe parser returns `{ success: false, issues }`.

## Read Layer

Port (`ContentRepository`) exposes raw package reads: `getExercises`, `getExerciseById`, `getProgrammingByCategory`. Application use cases apply the visibility rules:

| Use case | Behavior |
| --- | --- |
| `listCategories()` | the seven frozen RFEF categories in order |
| `listExercises(repository, { categoryId? })` | published and publishable only, deduplicated by id, optionally filtered by one category; spans both collections |
| `listLibraryExercises(repository, categoryId?)` | the same publishable set narrowed to `collection: 'library'` |
| `listWeeklyHighlights(repository, categoryId?)` | the same publishable set narrowed to `collection: 'weekly'` |
| `getExercise(repository, id)` | publishable exercise or `null` (archived, draft, unlicensed, and unknown ids return `null`); can return a weekly record |
| `getProgramming(repository, categoryId)` | the publishable record or `null`; never invents content |

Visibility is `isPublishableExercise` / `isPublishableProgramming`: status `published` **and** a publishable license status. `isPublishedExercise` / `isPublishedProgramming` exist for status-only authoring checks and are never a visibility rule — a non-bundled repository cannot leak `pending`, `unlicensed`, or `reference-only` content into browsing or AI grounding.

A two-category exercise appears once under each category because the filter reads `categoryIds` and the result is deduplicated by exercise id.

`createBundledContentRepository()` is the infrastructure factory: it imports the JSON as `unknown`, parses it once, indexes exercises by id and Programming by category, and returns the cached repository. Route and other-module code must reach content through `@/modules/content`.

Browse flow: `app/(tabs)/index.tsx` → `createBundledContentRepository` → `ExploreScreen({ repository })` → session category selection → `buildCategoryBrowseModel` → `listLibraryExercises`/`getProgramming` → `ContentRepository` → bundled adapter → shared `parseBoardData`. The browse model groups the library-only result with `groupExercisesBySessionPart` into the fixed `warm-up` → `main` → `cool-down` order, preserving package order inside each group; grouping is presentation-only and adds no repository call.

`ExploreScreen` is the first read-layer consumer. It renders the seven RFEF chips, a compact anonymous hero with counts from `listExercises`/`listCategories` (`71 Ejercicios` because the hero counts both collections), the AI entry link to the Asistente IA tab, the selected Programming glance card, a weekly highlight block, and the filtered Exercise Library. The pure view models call only the read layer, so visibility and deduplication stay there. `buildCategoryBrowseModel` reads `listLibraryExercises`, so the library stays at 7/9 exercises. `buildExploreGeneralModel` keeps `buildCategoryBrowseModel` for `programming` but builds the weekly block from `listWeeklyHighlights`, one highlight per `sessionPart` in the fixed warm-up → main → cool-down order; it is deterministic and has no scheduler or persisted "current week". The block subtitle reads `Una selección fuera de la biblioteca` and the counter reads `N ejercicios`. The methodology glance card maps only `formativeStage`, `focus`, `playModel`, `sessionDurationMinutes` and the first three `keyConcepts` of the publishable `Programming` record. Nothing is invented when the record or a session part is missing. The selected category is **session-only UI state** owned by `content/presentation` (mounted once in `src/app/_layout.tsx`): it survives tab and `/design-system` navigation, is never written to device storage, and resets on app restart. There is no "all categories" state and no default category.

## Adding Or Changing Content

1. Edit `content-package.json` only; never add category names to JSON.
2. Validate every new Board Data payload against `docs/board-data-schema.md` (the package parser does this automatically; the test suite fails if it does not).
3. Keep exercise and programming ids unique and stable; ids are how browsing, saves, and AI grounding reference content.
4. Record provenance with the source register in `docs/content-licensing.md`: `kind`, `sourceName`, and a `licenseStatus` that the kind allows, plus `attribution` when permission depends on credit.
5. Set `collection` to `library` for browsable drills or `weekly` for weekly highlights. Weekly records carry exactly one `references` citation in the current seed; a citation is not provenance and never satisfies the licence gate.
6. Publish only `owned` or `permitted` content; keep `pending`, `unlicensed`, and `reference-only` material `draft` or `archived`.
7. Run `npm test` (content suites validate the real package, including the seed licensing audit) and `npm run verify`.

## Known Gaps

- The general Explorar screen consumes the read layer for the hero counts, category filter, methodology glance card, weekly highlight block and grouped library. The category experience (methodology, weekly block, library) lives on that same screen; the exercise detail screen renders metadata, the ordered phase text, `Inspirado en` and `Atribución`, while board rendering remains a separate feature.
- The licence policy is enforced, and the exercise detail screen displays `provenance.attribution` under `Atribución` when present and `references` under `Inspirado en` when the exercise has citations; records without either render no source block.
- CMD Mora's permission is recorded as a decision but not yet documented in writing, so no CMD Mora record is seeded.
- The package is module infrastructure, not a shared root package; `offline-content-bundle` decides build-time gating and whether the raw package moves.
- Every category now has a session-shaped library: six categories at seven exercises (2/3/2) and Infantil U14 at nine (2/5/2), plus three dedicated weekly highlights outside the library. The Infantil assignment places two extra drills in the main part and keeps the two cool-down drills; it is flagged for coach review in `docs/risks-and-open-questions.md`.
- Exercise cards show no board preview yet; `exercise-preview-board-thumbnail` waits on `tactics-board-renderer`.
- Board Data is authored but not rendered yet; legibility, 2:1 fidelity, and phase playback belong to the board features.
