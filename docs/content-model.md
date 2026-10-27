# Content Model

The durable contract for curated content: Category reference data, Exercise, Programming, the bundled content package, its validation rules, and the read layer that powers browsing and later AI grounding.

`docs/domain-model.md` owns the vocabulary and relationships. This document owns the concrete shape, file paths, invariants, and validation behavior.

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
| `status` | `'draft' \| 'published' \| 'archived'` | only `published` is readable |
| `provenance` | `ContentProvenance` | required on every record |

## Programming

Programming is the per-category methodology and season plan. There is **at most one published record per Category**.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | lowercase slug | unique across the package |
| `categoryId` | `CategoryId` | known category |
| `version` | semver string | e.g. `1.0.0` |
| `formativeStage` | text ≤ 90 | |
| `focus` | text ≤ 160 | |
| `playModel` | text ≤ 240 | |
| `sessionDurationMinutes` | `{ min; max }` | 20–180 each, `max >= min` |
| `keyConcepts` | text[] | 1–8 entries |
| `objectives` | text[] | 1–8 entries |
| `sessionStructure` | `{ part: 'warm-up' \| 'main' \| 'cool-down'; title; description }[]` | 1–5 entries |
| `macrocycles` | `{ id; label; focus; microcycles }[]` | 1–6 entries |
| `microcycles` | `{ id; label; focus; sessionCount: 1–20 }[]` | 1–8 per macrocycle |
| `status` | `'draft' \| 'published'` | only `published` is readable |
| `provenance` | `ContentProvenance` | required on every record |

## Provenance

Every record carries provenance so licensing can be enforced later without rewriting the library:

```ts
type ContentProvenance = {
  kind: 'original' | 'cmd-mora' | 'reference';
  sourceName: string;
  licenseStatus: 'owned' | 'permitted' | 'reference-only' | 'pending' | 'unlicensed';
  attribution?: string;
};
```

The current seed package is `original` with `licenseStatus: 'owned'`. **Provenance is recorded but not yet enforced**: blocking publication of `pending`/`unlicensed`/`reference-only` material and showing attribution belong to `seed-content-licensing`.

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
- Unknown keys are rejected at every level.
- The package is imported once, parsed once, and indexed by the bundled adapter.
- Current seed scope is deliberately minimal: three original exercises (one tagged `infantil` + `cadete`) and one published Infantil Programming record. `seed-infantil-u14` and `seed-remaining-categories` fill the real library.

## Invariants And Validation

`safeParseContentPackage(input)` and `parseContentPackage(input)` enforce, in order:

1. Strict structural schema: package, Exercise, Programming, provenance, nested macrocycles/microcycles.
2. `contentVersion` equals `CONTENT_PACKAGE_VERSION`.
3. Exercise ids are unique; Programming ids are unique.
4. `categoryIds` is non-empty, unique, and every id is one of the seven RFEF brackets.
5. `players.total >= players.goalkeepers`.
6. At most one `published` Programming record per `categoryId`.
7. Every Exercise `boardData` passes `parseBoardData`; Board Data issues are re-prefixed under `exercises.<i>.boardData.`.

Issues use dot paths like Board Data issues, for example:

- `exercises.1.categoryIds.0` — unknown category id on the second exercise.
- `exercises.1.id` — duplicate exercise id.
- `exercises.1.categoryIds` — empty category list.
- `exercises.0.players.total` — goalkeepers exceed the player total.
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
| `listExercises(repository, { categoryId? })` | published only, deduplicated by id, optionally filtered by one category |
| `getExercise(repository, id)` | published exercise or `null` (archived, draft, and unknown ids return `null`) |
| `getProgramming(repository, categoryId)` | the published record or `null`; never invents content |

A two-category exercise appears once under each category because the filter reads `categoryIds` and the result is deduplicated by exercise id.

`createBundledContentRepository()` is the infrastructure factory: it imports the JSON as `unknown`, parses it once, indexes exercises by id and Programming by category, and returns the cached repository. Route and other-module code must reach content through `@/modules/content`.

Browse flow: `app/(tabs)/index.tsx` → `content` screen → use case → `ContentRepository` → bundled adapter → shared `parseBoardData`.

## Adding Or Changing Content

1. Edit `content-package.json` only; never add category names to JSON.
2. Validate every new Board Data payload against `docs/board-data-schema.md` (the package parser does this automatically; the test suite fails if it does not).
3. Keep exercise and programming ids unique and stable; ids are how browsing, saves, and AI grounding reference content.
4. Publish only content whose provenance is `owned` or `permitted` once `seed-content-licensing` lands.
5. Run `npm test` (content suites validate the real package) and `npm run verify`.

## Known Gaps

- The read layer has no screen consumer yet; `explore-general-screen` and `category-filter` are the named consumers.
- Provenance is recorded but not enforced, and no attribution is displayed.
- The package is module infrastructure, not a shared root package; `offline-content-bundle` decides build-time gating and whether the raw package moves.
- Only the Infantil Programming record exists; the other six categories have neither Programming nor exercises.
