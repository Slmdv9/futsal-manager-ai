# Content Model

The durable contract for curated content: Category reference data, Exercise, Programming, the bundled content package, its validation rules, and the read layer that powers browsing and later AI grounding.

`docs/domain-model.md` owns the vocabulary and relationships. This document owns the concrete shape, file paths, invariants, and validation behavior. `docs/content-licensing.md` owns the licensing policy, the source register, and the author checklist.

## Source Of Truth

| Artifact | Path |
| --- | --- |
| Category reference data | `src/modules/content/domain/category.ts` |
| Exercise entity | `src/modules/content/domain/exercise.ts` |
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

Attribution display belongs to `exercise-detail-screen`; the licence gate only makes the value required and exposes `requiresAttribution`.

## Package Contract

`content-package.json` is the single bundled content package:

```json
{
  "contentVersion": "1.0.0",
  "exercises": [],
  "programming": []
}
```

- `CONTENT_PACKAGE_VERSION` (`src/modules/content/domain/content-package.ts`) must equal the JSON `contentVersion`. Any other version fails validation. Additive changes bump the constant and the JSON together; breaking changes need a migration decision first.
- `Programming.version` is the plan version of that single record, not the package version. `infantil-u14-base` moved to `1.1.0` when its season plan grew to three macrocycles while `contentVersion` stayed `1.0.0`.
- Unknown keys are rejected at every level.
- The package is imported once, parsed once, and indexed by the bundled adapter.
- Current seed scope: 26 original exercises and 7 published Programming records covering all seven RFEF categories. Package order is part of the contract and append-only: the first nine exercises are the Infantil U14 slice in its original sequence (index 0 is `salida-3-1-presion-alta`, tagged `infantil` + `cadete`), followed by three exercises per remaining category in `CATEGORY_IDS` order — Prebenjamín, Benjamín, Alevín, Cadete (two new), Juvenil, Senior. Programming holds `infantil-u14-base` (version `1.1.0`) first, then `prebenjamin-u8-base`, `benjamin-u10-base`, `alevin-u12-base`, `cadete-u16-base`, `juvenil-u19-base`, and `senior-base`, each at version `1.0.0`. Seed tests assert the exact 26 exercise ids in package order and the seven Programming ids in `CATEGORY_IDS` order.

## Invariants And Validation

`safeParseContentPackage(input)` and `parseContentPackage(input)` enforce, in order:

1. Strict structural schema: package, Exercise, Programming, provenance, nested macrocycles/microcycles. A missing `provenance` block reports `Provenance is required on every Exercise and Programming record.`
2. `contentVersion` equals `CONTENT_PACKAGE_VERSION`.
3. Exercise ids are unique; Programming ids are unique.
4. `categoryIds` is non-empty, unique, and every id is one of the seven RFEF brackets.
5. `players.total >= players.goalkeepers`.
6. Licensing: a published record needs `owned` or `permitted`; published `permitted`/`cmd-mora` content needs `attribution`; every record's `kind` must allow its `licenseStatus` (see `docs/content-licensing.md`).
7. At most one `published` Programming record per `categoryId`.
8. Every Exercise `boardData` passes `parseBoardData`; Board Data issues are re-prefixed under `exercises.<i>.boardData.`.

Issues use dot paths like Board Data issues, for example:

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
| `listExercises(repository, { categoryId? })` | published and publishable only, deduplicated by id, optionally filtered by one category |
| `getExercise(repository, id)` | publishable exercise or `null` (archived, draft, unlicensed, and unknown ids return `null`) |
| `getProgramming(repository, categoryId)` | the publishable record or `null`; never invents content |

Visibility is `isPublishableExercise` / `isPublishableProgramming`: status `published` **and** a publishable license status. `isPublishedExercise` / `isPublishedProgramming` exist for status-only authoring checks and are never a visibility rule — a non-bundled repository cannot leak `pending`, `unlicensed`, or `reference-only` content into browsing or AI grounding.

A two-category exercise appears once under each category because the filter reads `categoryIds` and the result is deduplicated by exercise id.

`createBundledContentRepository()` is the infrastructure factory: it imports the JSON as `unknown`, parses it once, indexes exercises by id and Programming by category, and returns the cached repository. Route and other-module code must reach content through `@/modules/content`.

Browse flow: `app/(tabs)/index.tsx` → `createBundledContentRepository` → `ExploreScreen({ repository })` → session category selection → `buildCategoryBrowseModel` → `listExercises`/`getProgramming` → `ContentRepository` → bundled adapter → shared `parseBoardData`.

`ExploreScreen` is the first read-layer consumer. It renders the seven RFEF chips, the selected Programming summary, and the filtered Exercise Library; the pure view model calls only `listExercises` and `getProgramming`, so visibility and deduplication stay in the read layer. The selected category is **session-only UI state** owned by `content/presentation` (mounted once in `src/app/_layout.tsx`): it survives tab and `/design-system` navigation, is never written to device storage, and resets on app restart. There is no "all categories" state and no default category.

## Adding Or Changing Content

1. Edit `content-package.json` only; never add category names to JSON.
2. Validate every new Board Data payload against `docs/board-data-schema.md` (the package parser does this automatically; the test suite fails if it does not).
3. Keep exercise and programming ids unique and stable; ids are how browsing, saves, and AI grounding reference content.
4. Record provenance with the source register in `docs/content-licensing.md`: `kind`, `sourceName`, and a `licenseStatus` that the kind allows, plus `attribution` when permission depends on credit.
5. Publish only `owned` or `permitted` content; keep `pending`, `unlicensed`, and `reference-only` material `draft` or `archived`.
6. Run `npm test` (content suites validate the real package, including the seed licensing audit) and `npm run verify`.

## Known Gaps

- The Explorar category browser consumes the read layer, but the full prototype layout (weekly exercises, methodology overview, AI entry point, hero) still belongs to `explore-general-screen`; the dedicated category detail belongs to `explore-by-category-screen`.
- The licence policy is enforced, but no screen displays `attribution` yet; `exercise-detail-screen` owns that copy and placement.
- CMD Mora's permission is recorded as a decision but not yet documented in writing, so no CMD Mora record is seeded.
- The package is module infrastructure, not a shared root package; `offline-content-bundle` decides build-time gating and whether the raw package moves.
- Every category now has at least three exercises plus one Programming record, but Infantil U14 stays the only deep slice: the other six have exactly three representative exercises each until a later content-authoring feature deepens them.
- Board Data is authored but not rendered yet; legibility, 2:1 fidelity, and phase playback belong to the board features.
