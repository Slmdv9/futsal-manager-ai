# Feature Implementation Spec: Seed weekly highlight exercises with inspiration references

## Source Feature

- **id:** `seed-weekly-highlights`
- **area:** `content`
- **status:** `accepted`
- **depends_on:** `seed-session-structure` (accepted), `explore-general-screen` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/seed-weekly-highlights` (stacked on `feat/explore-general-screen` @ `6d18ee6`)
- **spec path:** `docs/specs/seed-weekly-highlights.md`
- **baseline:** package `1.1.0` with 50 `published` exercises and 7 Programming records (57 audited records); `Exercise` has no `collection` and no `references`; 280 tests in 205 suites pass.
- **next consumer:** `explore-weekly-highlights` (AI-card reorder and final layout pass), then `exercise-detail-screen` (renders the reference citation).

## Goal

The Explorar weekly block currently repeats the first exercise of each session part, so the coach sees the same drills twice on one screen. Give every RFEF category **three dedicated weekly-highlight exercises that are not part of its library** — exactly one per session part — authored in-house and stored in a separate `collection` so the library stays untouched at 7 drills (Infantil 9). Each weekly record also stores the public URL of the resource that inspired it, as an inspiration citation for the future exercise detail screen.

Concretely: a new required `Exercise.collection` (`'library' | 'weekly'`), a new optional `Exercise.references` (`{ label, url }[]`, max 3, absolute http(s)), 21 appended exercises, publishable-only read use cases for each collection, package contract **`1.1.0` → `1.2.0`**, and 21 valid Board Data `1.0.0` payloads. The feature also rewires two existing view models so Explorar stays correct after the data change: `buildCategoryBrowseModel` reads only the library collection, and `buildExploreGeneralModel` builds the weekly block from `listWeeklyHighlights`. No AI, quota, route, Board Data, design-token, `ExploreScreen` or AI-card change. Final package: **71 exercises (50 library + 21 weekly) + 7 Programming = 78 records.**

Because `listExercises` keeps counting both collections, the Explorar hero stat derived from it becomes **`71 Ejercicios`** in this feature. The hero component is not edited and the number is not hardcoded or adjusted; it is the read-layer count.

## Non-Goals

- **`explore-weekly-highlights` owns:** moving `AiSessionEntryCard` to the end of Explorar, the final Explorar layout pass, and cleaning up the now-unused `totalCount` prop. It no longer owns the weekly content switch, the library/weekly data split, or the weekly counter copy.
- **`exercise-detail-screen` owns:** navigating to an exercise, rendering metadata/cues/phases, and rendering `references` as an `Inspirado en` note with the "original Futsal Manager AI content" disclaimer. This feature only stores the citation.
- **No layout redesign and no recomposition:** `ExploreScreen` keeps its current section order, spacing, styling and AI-card position; `AiSessionEntryCard` is not moved or edited; routes and the tab shell do not change.
- **Scope boundary:** the only presentation changes are two view-model read switches (`buildCategoryBrowseModel` → `listLibraryExercises`, `buildExploreGeneralModel` → `listWeeklyHighlights`) plus the weekly block's subtitle/counter copy and their tests. `ExploreScreen`, `AiSessionEntryCard`, the board renderer, AI, quota, routes and `package.json` are untouched.
- `explore-by-category-screen`, `tactics-board-renderer`, `exercise-preview-board-thumbnail`, `board-phase-playback`, AI sessions/variants/chat, local persistence, teams, accounts.
- No new `provenance` kind, no `reference` record in the package, no CMD Mora record, no `permitted` licence, no `attribution` text.
- No copy, diagram, progression table or board layout reproduced from the four sources; no source becomes a redistribution source.
- No Board Data key, limit, version, or parser change (`1.0.0` stays). No change to `infantil-u14-base` (`1.1.0`), AI, quota, routes, `src/app/**`, `src/shared/**`, `package.json`, `eslint.config.js`, or `init.sh`.

## Job Story

When I open Explorar and pick my category, I want the weekly block to show three session highlights that are not already in my library — warm-up, main part and cool-down — so I can plan a session without the library repeating the same exercises in two places.

## Users And Permissions

- **Anonymous coach:** in this feature the library stays at 7 drills per category (Infantil 9), the weekly block swaps to the three dedicated weekly highlights, and the hero reads `71 Ejercicios`. `explore-weekly-highlights` only reorders the AI card and does the final layout pass.
- **Implementer:** content domain contract, bundled package, two application use cases, two presentation read switches, the weekly block copy, mirrored tests, named docs.
- **Validator:** reruns the parse/read-layer proofs, the full gate, the Android export, and the Explorar device smoke (library 7/9, weekly three new titles, `3 ejercicios`, `71 Ejercicios`), plus an originality spot-check of the 21 records against the four cited sources.

## Licensing And Legal Decision (non-negotiable)

The four sources are **inspiration only**. `docs/content-licensing.md` registers them as `reference` / `reference-only`, and `AGENTS.md` states external reference sites are inspiration only, never redistribution sources.

- All 21 new records are **new in-house authorship**: `kind: 'original'`, `licenseStatus: 'owned'`, `sourceName: 'Futsal Manager AI'`, `status: 'published'`, **no `attribution`**.
- **No `reference` record is added to the package.** The kind/status table, the publish gate, the read-layer filter, and `CONTENT_PROVENANCE_KINDS` are unchanged. The seed audit still asserts that no seeded record is `reference`.
- `Exercise.references` is an **inspiration citation, not a licence claim and not a rights statement**. It does not make a record `permitted`, does not change `provenance`, and grants no redistribution right. The four URLs must never appear in `provenance.sourceName` or `attribution`.
- **No copied material:** titles, sentences, diagrams, progression tables and board layouts are new. Reading the sources for theme and progression logic is allowed; copying expression is not. The 21 records must survive an originality read against the cited page before merge.
- **Display obligation (future):** `exercise-detail-screen` must show the label and URL under `Inspirado en` together with a disclaimer that the exercise is original Futsal Manager AI content. `feature_list.json` already records that obligation on `exercise-detail-screen`.
- **Why `references` is safe to ship:** it is inert metadata (a label + URL) attached to our own record. It is not third-party content, so it does not need a licence; the licence gate stays about `provenance`.

## Acceptance Scenarios

### Scenario 1: `collection` is a required contract field

Given an exercise record
When the package is parsed
Then `collection` is required and must be exactly `'library'` or `'weekly'`; a missing value reports `exercises.<i>.collection` and an unknown value (`'highlights'`) fails at the same path with a message naming `"library"` and `"weekly"`.

### Scenario 2: `references` is optional and validated

Given an exercise with a `references` array
When the package is parsed
Then up to three `{ label, url }` entries are accepted, `references` may be omitted, a fourth entry fails at `exercises.<i>.references` with a clear max-3 message, and a URL that is not absolute http(s) (`ftp://…`, `/recursos`, `adrimartinofutsal.es.tl`) fails at `exercises.<i>.references.<j>.url` with `Reference url must be an absolute http(s) URL.`
Given a reference entry without `label`
Then parsing fails at `exercises.<i>.references.<j>.label`.

### Scenario 2b: A reference is a citation, not a licence

Given a weekly record with `references` naming one of the four inspiration-only sources
When provenance and licensing are inspected
Then its provenance is still `original` / `owned` / `Futsal Manager AI` with no `attribution`, no record uses `kind: 'reference'`, and the read layer publishes it unchanged; the citation grants nothing and is not a provenance field.

### Scenario 3: Versions move together, only where intended

Given the package contract
When the versions are read
Then `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` are both `1.2.0`, Board Data is still `1.0.0`, and `infantil-u14-base` is still plan version `1.1.0`; a package at `1.1.0` is rejected with a `contentVersion` issue naming `1.2.0`.

### Scenario 4: The library collection is exactly the previous seed

Given the bundled package
When library exercises are listed
Then there are exactly 50, their ids and package order are the previous 50-id list, `salida-3-1-presion-alta` is still index 0, each category still has 7 library drills (Infantil 9) split 2/3/2 (Infantil 2/5/2), and the only added field is `collection: 'library'` (no id, title, category, board, provenance or copy edit).

### Scenario 5: Each category has three distinct weekly highlights

Given the bundled package
When weekly highlights are listed per category
Then each of the seven categories returns exactly three, one `warm-up`, one `main`, one `cool-down`, each single-category, and none of those ids appears in that category's library; the three read as an activation → main work → cool-down sequence.

### Scenario 6: The 21 new records match this spec

Given the 21 weekly exercises
When their metadata and copy are read
Then id, category, session part, title, summary, focus, objective, players, space, duration, intensity, work structure, two constraints, three coaching cues and phase ids/titles match the seed tables below, and each carries exactly one `references` entry.

### Scenario 7: Weekly boards are valid Board Data `1.0.0`

Given each of the 71 seeded exercises
When its `boardData` is re-parsed with `parseBoardData`
Then all pass at `1.0.0` with `pitch.format: 'full'`, `order` equal to index + 1, exactly one position per token per phase, coordinates inside 4–96 and distinct arrow endpoints.
And for the 21 new boards, tokens equal `players.total`, the `kind: 'keeper'` count equals `players.goalkeepers`, cones and arrows stay inside the declared 2:1 sub-region, and no board exceeds the documented limits.

### Scenario 8: The read layer separates collections without changing visibility

Given a repository mixing library, weekly, draft, unlicensed and cross-category records
When `listLibraryExercises` and `listWeeklyHighlights` run
Then each returns only published and publishable records of its own collection, deduplicated and in package order, filtered by category when one is passed, and `listExercises` still returns every publishable exercise in both collections (71 in the bundle).

### Scenario 8b: Totals and the hero count

Given the bundled package
When the totals are read
Then there are 71 publishable exercises (50 library + 21 weekly), 7 Programming records and 78 audited records in total; the Explorar hero stat derived from `listExercises().length` reads `71 Ejercicios` instead of `50` because `listExercises` counts both collections, and neither `ExploreHero` nor `ExploreScreen` hardcodes the number.

### Scenario 8c: The library keeps its own exercises

Given the Explorar category view after this change
When I look at the library list
Then it shows exactly 7 exercises for six categories and 9 for Infantil, grouped 2/3/2 (Infantil 2/5/2) under `CALENTAMIENTO` / `PARTE GENERAL` / `VUELTA A LA CALMA`, and none of the three weekly ids appears in the library list or in `sessionParts`.
And all three weekly cards are absent from the library: `listLibraryExercises` never returns a `collection: "weekly"` record, and `buildCategoryBrowseModel` reads `listLibraryExercises(repository, category.id)` rather than `listExercises`.

### Scenario 8d: The weekly block shows the dedicated highlights in session order

Given the Explorar category view after this change
When the weekly block renders
Then it shows exactly the three weekly records for that category, one per session part, in the deterministic order warm-up → main part → cool-down, drawn from `listWeeklyHighlights` and not from the library groups; no scheduler, date, week number or random selection is involved.
And the block subtitle reads `Una selección fuera de la biblioteca` and the counter reads `3 ejercicios` (singular `1 ejercicio`, zero `0 ejercicios`) via `formatWeeklySelection(count)`; `WeeklyExercises` no longer derives the counter from the library total.

### Scenario 8e: The screen composition is untouched

Given the Explorar screen source
When the component tree, tab routes and AI card are inspected
Then `ExploreScreen` and `AiSessionEntryCard` are byte-identical to the accepted version, the order stays hero → filter → AI card → methodology → weekly block → library, and no route, provider, design token, Board Data version, AI/quota code or `package.json` changed.

### Scenario 9: No forbidden provenance, stage or duplicate leaks in

Given the package
When ids, titles, source names, provenance kinds and categories are scanned
Then no `sourceName` names one of the four inspiration-only domains, no record is `reference`, no record carries `attribution`, no Chupetín-style stage appears, every `categoryIds` entry is one of the seven RFEF brackets, and no weekly id or title duplicates a library record.

### Scenario 10: The app still runs

Given the edited contract, package, use cases, both view models and the weekly block copy
When `npm test`, `npm run lint`, `npm run typecheck`, `npm run verify`, `./init.sh` and the Android export run
Then all pass at **356 tests / 220 suites**, the bundle contains the new ids and a reference label, Explorar still boots with the library at 7/9 and the three weekly cards, and the other tabs and `/design-system` are unchanged.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` (`seed-weekly-highlights`, `explore-weekly-highlights`, `exercise-detail-screen`, `explore-general-screen`, `seed-session-structure`), `ARCHITECTURE.md` (layers, `content` catalogue, allowed dependencies, composition root, tests), `CONTEXT.md`.
- `docs/content-model.md`, `docs/content-licensing.md`, `docs/domain-model.md`, `docs/board-data-schema.md`, `docs/risks-and-open-questions.md`, `docs/technical-discovery.md`.
- `docs/specs/seed-session-structure.md`, `docs/specs/explore-general-screen.md` — seed-table, copy, board-authoring, test-count and scope conventions this spec follows.
- `src/modules/content/domain/{exercise,provenance,content-package,session-part,programming,category}.ts`, `domain/ports/content-repository.ts`, `application/{list-exercises,get-exercise,get-programming,list-categories}.ts`, `infrastructure/bundled-content-repository.ts`, `infrastructure/content/content-package.json` (one full exercise record plus a full Senior board inspected), `presentation/view-models/{category-browse-model,explore-general-model}.ts`, `presentation/components/weekly-exercises.tsx`, `presentation/screens/explore-screen.tsx`, `src/modules/content/index.ts`, `src/modules/content/README.md`.
- `tests/modules/content/**` — `domain/content-package.test.ts`, `domain/fixtures/valid-content-package.json`, `application/content-queries.test.ts`, `presentation/view-models/{category-browse-model,explore-general-model}.test.ts`, `presentation/screens/explore-general-screen.test.ts`, `infrastructure/{seed-provenance,seed-session-structure,seed-infantil-u14,seed-remaining-categories,bundled-content-repository}.test.ts`, `index.test.ts`; `tests/shared/domain/board-data/board-data.test.ts`.
- Verified baseline by running `npm test`: 280 tests / 205 suites, package `1.1.0` with 50 exercises and 7 Programming records.

### Existing Patterns To Follow

- One bundled JSON package; Spanish copy, English identifiers/tests/docs; ids are lowercase slugs; package order is contract and append-only.
- `domain` is platform-free; `application` is the only place visibility rules live; presentation never imports infrastructure and never reads `status`/`provenance`.
- Parser issues use dot paths and `superRefine` for cross-record rules; Board Data issues are re-prefixed under `exercises.<i>.boardData.`.
- Seed tests import layers directly (`node:test` cannot load React Native), use Given/When/Then, assert the real package, and pin each new record with one test plus one board test.
- `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` always move together; `Programming.version` is a separate plan version.

### Current Gaps

- `Exercise` has no way to tell a library drill from a weekly highlight, so any new record is indistinguishable from the library.
- `buildCategoryBrowseModel` calls `listExercises(repository, { categoryId })`, which would include weekly drills and raise the rendered library to 10/12 if it is not switched to the library collection.
- There is no place to store an inspiration URL; the four sources exist only in `docs/content-licensing.md`.
- The Explorar weekly slice is derived from the same set as the library, which is exactly the duplication the coach reported.

## Contract Changes

### `Exercise.collection`

- New `src/modules/content/domain/exercise-collection.ts`:

```ts
export const EXERCISE_COLLECTIONS = ['library', 'weekly'] as const;

export type ExerciseCollection = (typeof EXERCISE_COLLECTIONS)[number];
```

- `exercise.ts` imports the type and adds a **required** `collection: ExerciseCollection` immediately after `sessionPart` (type and JSON key order).
- `content-package.ts` adds to `exerciseSchema`:

```ts
collection: z.enum(EXERCISE_COLLECTIONS, {
  error: 'Exercise collection must be "library" or "weekly".',
}),
```

- No default. The parser never guesses a collection.
- The parser does **not** enforce editorial rules such as "weekly implies references" or "weekly is single-category"; those are seed-audit assertions so the contract stays reusable.

### `Exercise.references`

- `exercise.ts` adds:

```ts
export type ExerciseReference = {
  label: string;
  url: string;
};

references?: ExerciseReference[];
```

- `EXERCISE_LIMITS` gains `maxReferences: 3`.
- Field order: `references` is the last Exercise field, immediately after `provenance`.
- `content-package.ts` adds:

```ts
const referenceSchema = z.strictObject({
  label: textSchema(120),
  url: z
    .string()
    .trim()
    .max(2048)
    .refine(isAbsoluteHttpUrl, 'Reference url must be an absolute http(s) URL.'),
});

references: z
  .array(referenceSchema)
  .max(EXERCISE_LIMITS.maxReferences, 'At most 3 reference citations are allowed per exercise.')
  .optional(),
```

- `isAbsoluteHttpUrl(value)` parses with `new URL`, requires `protocol === 'http:' || 'https:'` and a non-empty hostname. It is a local helper in `content-package.ts` (or `exercise.ts` if the implementer prefers; either way it is not exported).
- Issue paths: `exercises.<i>.references` (max 3), `exercises.<i>.references.<j>.url` (not absolute http(s)), `exercises.<i>.references.<j>.label` (missing/empty/too long).
- `references` is legal on any collection; only the seed audit requires it on weekly records.

### Versions

- `CONTENT_PACKAGE_VERSION` and JSON `contentVersion`: **`1.1.0` → `1.2.0`** together (required `collection` is additive for future records and breaking for packages that omit it).
- **Board Data stays `1.0.0`.** **`infantil-u14-base` stays `1.1.0`.** Programming records are untouched.
- The version tests move to `1.2.0`; the parser still rejects any other value, including `1.1.0`.

### Package order and counts

- Exercises 0–49 keep their current order and content; each gains `collection: 'library'`.
- Exercises 50–70 are the 21 weekly records in this order: Prebenjamín (3), Benjamín (3), Alevín (3), Infantil (3), Cadete (3), Juvenil (3), Senior (3); inside a category `warm-up`, `main`, `cool-down`.
- Totals: **50 library + 21 weekly = 71 exercises**, **7 Programming**, **78 audited records**.
- Canonical audit order: the 71 exercise ids in package order, then the seven Programming ids in `CATEGORY_IDS` order.

## Seed Plan — 21 New Weekly Exercises

### Table A — Identity, category, part and copy

| idx | id | category | part | title | summary | focus | objective |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 50 | `activacion-pases-y-nombres` | `prebenjamin` | `warm-up` | Activación con pases y nombres | Círculo de pases en el que cada jugador nombra al compañero antes de entregar el balón. | Activación | Activar el cuerpo con pases sencillos y reconocer al compañero antes de recibir. |
| 51 | `juego-cuatro-esquinas` | `prebenjamin` | `main` | Juego de las cuatro esquinas | Juego de pases y relevos en el que las cuatro esquinas del cuadrado son refugios para recibir. | Juego reducido | Ocupar la esquina libre y recibir antes de que el perseguidor llegue. |
| 52 | `rondo-tranquilo-en-circulo` | `prebenjamin` | `cool-down` | Rondo tranquilo en círculo | Rondo sin presión para cerrar la sesión con el balón en el suelo y pases cortos. | Vuelta a la calma | Cerrar la sesión con pases cómodos y sensaciones positivas. |
| 53 | `pase-y-movimiento-en-triangulo` | `benjamin` | `warm-up` | Pase y movimiento en triángulo | Triángulos de pase en los que el jugador entrega y ocupa el vértice que queda libre. | Pase | Activar el pase y el apoyo constante en el vértice libre del triángulo. |
| 54 | `juego-4v4-con-portero-apoyo` | `benjamin` | `main` | Juego 4 contra 4 con portero-apoyo | Partido reducido en el que el portero juega como quinto jugador en la salida. | Juego con portero | Usar al portero como apoyo para superar la primera presión y progresar. |
| 55 | `circulacion-tranquila-en-parejas` | `benjamin` | `cool-down` | Circulación tranquila en parejas | Parejas que circulan el balón a ritmo bajo mientras caminan por la franja de cierre. | Vuelta a la calma | Recuperar la calma con pases suaves y movimiento continuo y lento. |
| 56 | `activacion-3v1-con-pared` | `alevin` | `warm-up` | Activación 3 contra 1 con pared | Rondo de activación en el que el pase de pared libera al portador del defensor. | Activación | Activar la pared y el desmarque de apoyo ante un defensor. |
| 57 | `salida-de-presion-3v2-con-pivote` | `alevin` | `main` | Salida de presión 3 contra 2 con pívot | Salida con tres jugadores y un pívot fijo que ofrece la salida por el carril central. | Salida de presión | Superar la presión de dos rivales usando al pívot como referencia central. |
| 58 | `conservacion-suave-en-dos-zonas` | `alevin` | `cool-down` | Conservación suave en dos zonas | Conservación sin oposición repartida en dos zonas para cerrar con pases seguros. | Vuelta a la calma | Bajar el ritmo conservando el balón y cambiando de zona sin prisa. |
| 59 | `activacion-con-pases-entre-lineas` | `infantil` | `warm-up` | Activación con pases entre líneas | Activación en doble cuadrado en la que el pase entre líneas abre la siguiente zona. | Activación | Activar el pase entre líneas y el apoyo por detrás del receptor. |
| 60 | `ataque-3-1-con-cambio-de-orientacion` | `infantil` | `main` | Ataque 3-1 con cambio de orientación | Ataque en 3-1 que fija el cierre rival y libera el ala contraria con el pívot como enlace. | Ataque | Fijar la defensa en un lado y liberar el ala contraria con el pívot como enlace. |
| 61 | `rondo-de-cierre-con-movilidad` | `infantil` | `cool-down` | Rondo de cierre con movilidad | Rondo final de baja intensidad combinado con movilidad de tobillo y cadera. | Vuelta a la calma | Cerrar la sesión con el balón en el pie y recuperar movilidad articular. |
| 62 | `activacion-con-triangulos-y-desmarques` | `cadete` | `warm-up` | Activación con triángulos y desmarques | Activación por franjas con triángulos que se abren al desmarque del tercer hombre. | Activación | Activar el desmarque del tercer hombre dentro de un triángulo de pase. |
| 63 | `presion-tras-saque-de-banda` | `cadete` | `main` | Presión tras saque de banda | Acción a balón parado defensiva que presiona el saque de banda y cierra la continuación. | ABP defensiva | Presionar el saque de banda y cerrar la primera línea de pase del rival. |
| 64 | `circulacion-suave-con-cambios-de-lado` | `cadete` | `cool-down` | Circulación suave con cambios de lado | Circulación sin oposición a ritmo bajo con cambios de lado largos y control orientado. | Vuelta a la calma | Recuperar la calma con circulación amplia y cambios de orientación suaves. |
| 65 | `activacion-con-salida-de-presion-4v2` | `juvenil` | `warm-up` | Activación con salida de presión 4 contra 2 | Activación con salida desde portero y cuatro jugadores ante dos presionadores. | Activación | Activar la salida con superioridad y el pase al hombre libre. |
| 66 | `ataque-4-0-con-rotacion-de-alas` | `juvenil` | `main` | Ataque 4-0 con rotación de alas | Ataque 4-0 con rotación continua de alas y pívot para desordenar el rombo rival. | Ataque | Desordenar la defensa en rombo con rotaciones de ala y cambio de orientación. |
| 67 | `conservacion-lenta-con-apoyos` | `juvenil` | `cool-down` | Conservación lenta con apoyos | Conservación tranquila con dos apoyos exteriores para cerrar la sesión sin riesgo. | Vuelta a la calma | Bajar la intensidad conservando el balón y usando los apoyos exteriores. |
| 68 | `activacion-con-rondo-y-cambio-de-ritmo` | `senior` | `warm-up` | Activación con rondo y cambio de ritmo | Rondo de activación con cambio de ritmo y salida explosiva al espacio libre. | Activación | Activar la circulación y el cambio de ritmo antes de la parte principal. |
| 69 | `salida-4-0-ante-defensa-en-rombo` | `senior` | `main` | Salida 4-0 ante defensa en rombo | Salida 4-0 que ataca el rombo rival con fijación del pívot y cambio de ala. | Salida de presión | Atacar el rombo defensivo con la fijación del pívot y el cambio al ala débil. |
| 70 | `vuelta-a-la-calma-con-respiracion-guiada` | `senior` | `cool-down` | Vuelta a la calma con respiración guiada | Estiramientos y respiración guiada para cerrar la sesión y bajar las pulsaciones. | Vuelta a la calma | Recuperar la calma con estiramientos suaves y respiración controlada. |

All 21: `categoryIds` = the single listed category, `status: 'published'`, provenance `{ kind: 'original', sourceName: 'Futsal Manager AI', licenseStatus: 'owned' }`, no `attribution`, `collection: 'weekly'`, exactly one `references` entry (Table D), 2 constraints and 3 coaching cues (Table C).

### Table B — Logistics, load and board shape

`players` is total/GK; `space` is label, width × length metres; `intensity` is level + percent. Every board: `schemaVersion: '1.0.0'`, `pitch.format: 'full'`, phases with `order` = index + 1, coordinates 4–96, tokens = `players.total`, keeper tokens = `goalkeepers`.

| idx | id | players | space | min | intensity | workStructure | board shape |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 50 | `activacion-pases-y-nombres` | 8/0 | Círculo de activación, 10×10 | 6 | low 40 | Bloques de 2 minutos x 3 series | 2 fases; 8 tokens en círculo (x 32–68, y 30–70); 4 conos en los ejes; 2 pases por fase. |
| 51 | `juego-cuatro-esquinas` | 8/0 | Cuadrado con esquinas, 20×20 | 10 | medium 55 | Bloques de 3 minutos x 3 series | 2 fases; 8 tokens (4 en esquinas x/y 26/74, 4 dentro); 4 conos en esquinas; 1 pase + 1 carrera por fase. |
| 52 | `rondo-tranquilo-en-circulo` | 6/0 | Círculo de cierre, 10×10 | 6 | low 30 | Rondos de 60 segundos x 4 series | 2 fases; 5 tokens en círculo + 1 defensor pasivo dentro; 4 conos; 2 pases lentos por fase. |
| 53 | `pase-y-movimiento-en-triangulo` | 9/0 | Triángulo de pases, 18×15 | 8 | low 45 | Bloques de 2 minutos x 4 series | 2 fases; 9 tokens en tres triángulos; 6 conos; 2 pases + 1 carrera por fase. |
| 54 | `juego-4v4-con-portero-apoyo` | 10/2 | Campo reducido, 24×18 | 12 | medium 65 | Bloques de 4 minutos x 3 series | 2 fases; 10 tokens (4 + 4 de campo y 2 porteros); 2 conos de portería; 1 pase + 1 carrera por fase. |
| 55 | `circulacion-tranquila-en-parejas` | 8/0 | Franja de cierre, 15×10 | 6 | low 30 | Bloques de 2 minutos x 3 series | 2 fases; 8 tokens en cuatro parejas; 0 conos; 2 pases suaves por fase. |
| 56 | `activacion-3v1-con-pared` | 8/0 | Cuadrado de activación, 14×14 | 8 | low 50 | Rondos de 90 segundos x 4 series | 2 fases; 8 tokens (4 en el cuadrado, 3 apoyos exteriores, 1 defensor); 4 conos; 2 pases por fase. |
| 57 | `salida-de-presion-3v2-con-pivote` | 9/0 | Medio campo, 24×20 | 14 | medium 70 | Bloques de 3 minutos x 4 series | 3 fases; 9 tokens (3 de salida, 1 pívot, 2 defensores, 3 apoyos); 4 conos; 2 pases + 1 carrera por fase. |
| 58 | `conservacion-suave-en-dos-zonas` | 8/0 | Rectángulo de cierre, 18×12 | 6 | low 35 | Bloques de 2 minutos x 3 series | 2 fases; 8 tokens repartidos 4 + 4 en dos zonas; 2 conos de zona; 2 pases por fase. |
| 59 | `activacion-con-pases-entre-lineas` | 10/0 | Doble cuadrado, 22×18 | 10 | low 50 | Bloques de 3 minutos x 3 series | 3 fases; 10 tokens repartidos 5 + 5 en los dos cuadrados; 8 conos; 3 pases por fase. |
| 60 | `ataque-3-1-con-cambio-de-orientacion` | 10/2 | Pista completa, 20×40 | 16 | high 80 | Bloques de 4 minutos x 4 series | 3 fases; 10 tokens (4 de campo + 1 portero local, 4 rivales + 1 portero rival); 2 conos; 2 pases + 1 carrera por fase. |
| 61 | `rondo-de-cierre-con-movilidad` | 8/0 | Cuadrado de cierre, 10×10 | 6 | low 30 | Rondos de 60 segundos x 4 series | 2 fases; 8 tokens en círculo; 4 conos; 2 pases lentos por fase. |
| 62 | `activacion-con-triangulos-y-desmarques` | 9/0 | Franja de activación, 24×16 | 10 | low 50 | Bloques de 2 minutos x 4 series | 2 fases; 9 tokens en tres triángulos dentro de la franja; 6 conos; 2 pases + 1 carrera por fase. |
| 63 | `presion-tras-saque-de-banda` | 10/2 | Pista completa, 20×40 | 16 | high 85 | Series de 2 minutos x 5 repeticiones | 3 fases; 10 tokens (5 + 5 con dos porteros); 2 conos de banda; 1 pase rival + 1 presión + 1 cobertura por fase. |
| 64 | `circulacion-suave-con-cambios-de-lado` | 8/0 | Rectángulo de cierre, 20×15 | 8 | low 35 | Bloques de 3 minutos x 2 series | 2 fases; 8 tokens en rectángulo; 4 conos; 2 pases por fase. |
| 65 | `activacion-con-salida-de-presion-4v2` | 10/2 | Medio campo, 24×20 | 10 | low 50 | Bloques de 2 minutos x 4 series | 2 fases; 10 tokens (portero propio, portero rival, 4 de salida, 2 presionadores, 2 apoyos); 4 conos; 2 pases + 1 carrera por fase. |
| 66 | `ataque-4-0-con-rotacion-de-alas` | 10/2 | Pista completa, 20×40 | 18 | high 85 | Bloques de 4 minutos x 4 series | 3 fases; 10 tokens (5 + 5 con dos porteros); 2 conos; 2 pases + 1 carrera por fase. |
| 67 | `conservacion-lenta-con-apoyos` | 8/0 | Rectángulo de cierre, 20×15 | 8 | low 35 | Bloques de 3 minutos x 2 series | 2 fases; 8 tokens (6 dentro + 2 apoyos exteriores); 4 conos; 2 pases por fase. |
| 68 | `activacion-con-rondo-y-cambio-de-ritmo` | 9/0 | Cuadrado de rondo, 16×16 | 10 | low 50 | Rondos de 90 segundos x 5 series | 3 fases; 9 tokens (7 en el rondo + 2 defensores); 4 conos; 2 pases + 1 carrera por fase. |
| 69 | `salida-4-0-ante-defensa-en-rombo` | 10/2 | Pista completa, 20×40 | 20 | high 90 | Bloques de 4 minutos x 5 series | 3 fases; 10 tokens (5 + 5 con dos porteros); 2 conos; 2 pases + 1 carrera por fase. |
| 70 | `vuelta-a-la-calma-con-respiracion-guiada` | 8/0 | Círculo de cierre, 10×10 | 6 | low 25 | Bloques de 2 minutos x 3 series | 2 fases; 8 tokens en círculo; 0 conos; 2 pases lentos por fase. |

### Table C — Constraints, cues and phase ids/titles

| id | constraint 1 | constraint 2 | coaching cues (3, in order) | phases (id — title) |
| --- | --- | --- | --- | --- |
| `activacion-pases-y-nombres` | Nombrar antes de pasar — Cada jugador dice en voz alta el nombre del compañero antes de entregar el balón. | Balón raso — Todos los pases se juegan por el suelo y con el pie de apoyo orientado al receptor. | Nombrar al compañero antes del pase. / Recibir con el cuerpo abierto hacia el centro del círculo. / Acompañar el pase con el pie de golpeo. | `pases-en-circulo` — Pases en círculo; `cambio-de-sentido` — Cambio de sentido |
| `juego-cuatro-esquinas` | Una esquina por jugador — No puede haber dos jugadores esperando en la misma esquina. | Pase antes de tres segundos — El portador debe entregar el balón antes de contar tres segundos. | Mirar la esquina libre antes de recibir. / Cambiar de esquina con el primer toque. / Avisar en voz alta del defensor que persigue. | `ocupar-esquina` — Ocupar la esquina; `relevo-esquina` — Relevo de esquina |
| `rondo-tranquilo-en-circulo` | Toque libre — Cada jugador puede pasar al primer o al segundo toque, sin límite. | Defensor pasivo — El defensor solo cierra líneas de pase y no entra al contacto. | Pasar siempre al compañero libre. / Controlar la respiración entre series. / Terminar con el balón en el suelo. | `rondo-tranquilo` — Rondo tranquilo; `cierre-respiracion` — Cierre y respiración |
| `pase-y-movimiento-en-triangulo` | Un toque por vértice — En cada vértice se juega al primer toque salvo el primero de la serie. | Ocupar siempre el vértice libre — Tras pasar, el jugador se mueve al vértice que no tiene compañero. | Orientar el cuerpo antes de recibir. / Pasar con la pierna más lejana al defensor imaginario. / Ocupar el vértice libre sin cruzar por delante del balón. | `pase-vertice` — Pase al vértice; `ocupar-vertice` — Ocupar el vértice libre |
| `juego-4v4-con-portero-apoyo` | Portero con dos toques — El portero participa en la circulación con un máximo de dos toques. | Gol tras salida del portero — Solo cuenta el gol si la jugada empieza en el portero. | Ofrecer línea de pase al portero. / Abrir el campo tras la salida. / Fijar antes de progresar. | `salida-con-portero` — Salida con portero; `progresion-campo` — Progresión al campo rival |
| `circulacion-tranquila-en-parejas` | Dos toques máximo — Cada jugador controla y devuelve en un máximo de dos toques. | Ritmo de caminar — Las parejas se desplazan caminando y nunca aceleran el paso. | Caminar mientras se circula el balón. / Respirar de forma pausada entre pases. / Terminar la serie con estiramiento de gemelo. | `circulacion-parejas` — Circulación en parejas; `movilidad-caminando` — Movilidad caminando |
| `activacion-3v1-con-pared` | Pared obligatoria — Antes de cambiar de orientación debe haber al menos una pared. | Defensor activo — El defensor presiona al portador sin entrar al contacto. | Fijar al defensor antes de la pared. / Ofrecer el apoyo en el ángulo libre. / Cambiar de orientación tras la pared. | `pared-inicial` — Pared inicial; `desmarque-apoyo` — Desmarque de apoyo |
| `salida-de-presion-3v2-con-pivote` | Pívot fijo — El pívot no puede salir del carril central durante la salida. | Dos toques — Los jugadores de salida juegan en un máximo de dos toques. | Fijar a un presionador antes de pasar al pívot. / Pivotar lejos del defensor. / Atacar el carril que deja libre el pívot. | `salida-pivote` — Salida con pívot; `fijacion-central` — Fijación central; `progresion-banda` — Progresión por banda |
| `conservacion-suave-en-dos-zonas` | Cambio de zona cada tres pases — El equipo cambia de zona después de tres pases consecutivos. | Sin presión — Ningún jugador puede robar el balón durante la conservación. | Circular el balón con el cuerpo orientado. / Cambiar de zona cuando el pase está claro. / Reducir la velocidad en cada serie. | `conservacion-zona-alta` — Conservación en zona alta; `cambio-zona` — Cambio de zona |
| `activacion-con-pases-entre-lineas` | Pase entre líneas obligatorio — Para cambiar de zona el balón debe pasar entre los dos conos centrales. | Apoyo por detrás — El receptor siempre tiene un compañero de apoyo detrás del balón. | Mirar la línea antes de recibir. / Pasar con el interior cuando el carril está libre. / Acompañar el pase con un desmarque de apoyo. | `pase-interior` — Pase interior; `apoyo-detras` — Apoyo detrás del receptor; `cambio-zona` — Cambio de zona |
| `ataque-3-1-con-cambio-de-orientacion` | Pívot como enlace — El cambio de orientación debe pasar por el pívot. | Dos toques en banda — Los alas juegan en un máximo de dos toques tras recibir. | Fijar al cierre antes del cambio. / Pivotar con el cuerpo perfilado. / Atacar el segundo palo del ala débil. | `fijacion-cierre` — Fijación del cierre; `enlace-pivote` — Enlace del pívot; `cambio-ala` — Cambio de ala |
| `rondo-de-cierre-con-movilidad` | Toque libre — El rondo se juega sin límite de toques para mantener el ritmo bajo. | Movilidad entre series — Entre serie y serie se realiza movilidad de tobillo y cadera. | Recibir con el pie de apoyo relajado. / Mover el tobillo entre series. / Terminar con respiración profunda. | `rondo-final` — Rondo final; `movilidad-articular` — Movilidad articular |
| `activacion-con-triangulos-y-desmarques` | Tercer hombre obligatorio — Cada serie debe incluir al menos un pase al tercer hombre. | Franja limitada — El triángulo no puede salir de la franja de activación. | Fijar al primer defensor antes de abrir el triángulo. / Desmarcarse fuera de la línea de pase. / Recibir perfilado hacia la siguiente franja. | `triangulo-pase` — Triángulo de pase; `desmarque-tercer-hombre` — Desmarque del tercer hombre |
| `presion-tras-saque-de-banda` | Saque obligatorio por banda — El rival reinicia siempre con saque de banda en la misma banda. | Cierre de la primera línea — El defensor más cercano debe impedir el pase interior antes de dos segundos. | Salir a presionar en el momento del saque. / Cerrar el pase interior con el cuerpo. / Orientar al rival hacia la banda. | `saque-banda` — Saque de banda rival; `presion-primera-linea` — Presión de la primera línea; `cierre-continuacion` — Cierre de la continuación |
| `circulacion-suave-con-cambios-de-lado` | Cambio de lado obligatorio — Cada serie incluye al menos dos cambios de lado largos. | Ritmo bajo — Los jugadores circulan caminando y sin presión. | Orientar el primer toque hacia el lado contrario. / Abrir el campo antes del cambio. / Terminar la serie con estiramiento de aductor. | `circulacion-amplia` — Circulación amplia; `cambio-lado` — Cambio de lado |
| `activacion-con-salida-de-presion-4v2` | Superioridad obligatoria — La salida se juega siempre con cuatro jugadores más el portero. | Dos toques — Cada jugador de salida juega en un máximo de dos toques. | Ofrecer líneas de pase al portero. / Fijar a un presionador antes de pasar. / Jugar al hombre libre del lado contrario. | `salida-superioridad` — Salida en superioridad; `pase-hombre-libre` — Pase al hombre libre |
| `ataque-4-0-con-rotacion-de-alas` | Rotación completa — Cada ataque incluye una rotación completa de ala antes de finalizar. | Pívot fijo — El pívot mantiene el carril central durante la rotación. | Rotar sin perder la orientación del balón. / Fijar al cierre antes de cambiar de ala. / Finalizar al segundo palo. | `rotacion-ala` — Rotación de ala; `fijacion-pivote` — Fijación del pívot; `ataque-ala-debil` — Ataque al ala débil |
| `conservacion-lenta-con-apoyos` | Apoyo exterior obligatorio — Cada serie debe pasar al menos dos veces por un apoyo exterior. | Sin presión — La conservación se juega sin oposición. | Circular el balón a ritmo lento. / Usar el apoyo exterior cuando el centro se cierra. / Respirar de forma pausada entre series. | `conservacion-apoyos` — Conservación con apoyos; `cambio-lado-suave` — Cambio de lado suave |
| `activacion-con-rondo-y-cambio-de-ritmo` | Salida obligatoria — Cada serie termina con una salida al espacio libre. | Dos toques — El rondo se juega en un máximo de dos toques. | Recibir perfilado antes de la salida. / Acelerar solo en el último apoyo. / Comunicar la salida al espacio. | `rondo-ritmo` — Rondo con ritmo; `cambio-ritmo` — Cambio de ritmo; `salida-espacio` — Salida al espacio |
| `salida-4-0-ante-defensa-en-rombo` | Pívot fijo — El pívot mantiene el carril central hasta el cambio de orientación. | Cambio de ala obligatorio — La salida termina con un pase al ala débil. | Fijar al cierre antes de liberar el ala. / Pivotar lejos del defensor. / Atacar el espacio que deja el rombo. | `salida-4-0` — Salida 4-0; `fijacion-pivote` — Fijación del pívot; `cambio-ala-debil` — Cambio al ala débil |
| `vuelta-a-la-calma-con-respiracion-guiada` | Respiración guiada — Cada estiramiento se mantiene durante cuatro respiraciones lentas. | Sin balón en la segunda fase — La respiración final se realiza sin balón y en silencio. | Mantener el estiramiento sin rebotes. / Inspirar por la nariz y espirar por la boca. / Terminar la sesión en círculo. | `estiramiento-guiado` — Estiramiento guiado; `respiracion-final` — Respiración final |

### Table D — Reference assignment (exactly one per weekly record)

| idx | id | label | url |
| --- | --- | --- | --- |
| 50 | `activacion-pases-y-nombres` | Adri Martín Futsal | https://adrimartinofutsal.es.tl/ |
| 51 | `juego-cuatro-esquinas` | KeepMove — Recursos de entrenamiento | https://www.keepmove.net/recursosdeentrenamiento/ |
| 52 | `rondo-tranquilo-en-circulo` | Adri Martín Futsal | https://adrimartinofutsal.es.tl/ |
| 53 | `pase-y-movimiento-en-triangulo` | Manual de entrenamiento de fútbol sala de la UEFA | https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf |
| 54 | `juego-4v4-con-portero-apoyo` | Adri Martín Futsal | https://adrimartinofutsal.es.tl/ |
| 55 | `circulacion-tranquila-en-parejas` | KeepMove — Recursos de entrenamiento | https://www.keepmove.net/recursosdeentrenamiento/ |
| 56 | `activacion-3v1-con-pared` | Ejercicios de Fútbol Sala | https://www.ejerciciosdefutbolsala.com/ |
| 57 | `salida-de-presion-3v2-con-pivote` | Ejercicios de Fútbol Sala | https://www.ejerciciosdefutbolsala.com/ |
| 58 | `conservacion-suave-en-dos-zonas` | KeepMove — Recursos de entrenamiento | https://www.keepmove.net/recursosdeentrenamiento/ |
| 59 | `activacion-con-pases-entre-lineas` | Manual de entrenamiento de fútbol sala de la UEFA | https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf |
| 60 | `ataque-3-1-con-cambio-de-orientacion` | Ejercicios de Fútbol Sala | https://www.ejerciciosdefutbolsala.com/ |
| 61 | `rondo-de-cierre-con-movilidad` | Adri Martín Futsal | https://adrimartinofutsal.es.tl/ |
| 62 | `activacion-con-triangulos-y-desmarques` | Manual de entrenamiento de fútbol sala de la UEFA | https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf |
| 63 | `presion-tras-saque-de-banda` | Ejercicios de Fútbol Sala | https://www.ejerciciosdefutbolsala.com/ |
| 64 | `circulacion-suave-con-cambios-de-lado` | KeepMove — Recursos de entrenamiento | https://www.keepmove.net/recursosdeentrenamiento/ |
| 65 | `activacion-con-salida-de-presion-4v2` | Manual de entrenamiento de fútbol sala de la UEFA | https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf |
| 66 | `ataque-4-0-con-rotacion-de-alas` | Ejercicios de Fútbol Sala | https://www.ejerciciosdefutbolsala.com/ |
| 67 | `conservacion-lenta-con-apoyos` | Adri Martín Futsal | https://adrimartinofutsal.es.tl/ |
| 68 | `activacion-con-rondo-y-cambio-de-ritmo` | Manual de entrenamiento de fútbol sala de la UEFA | https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf |
| 69 | `salida-4-0-ante-defensa-en-rombo` | Manual de entrenamiento de fútbol sala de la UEFA | https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf |
| 70 | `vuelta-a-la-calma-con-respiracion-guiada` | KeepMove — Recursos de entrenamiento | https://www.keepmove.net/recursosdeentrenamiento/ |

Source spread: UEFA 6 (periodisation and playing principles), Adri Martín 5 (tasks, warm-ups, goalkeepers), KeepMove 5 (categorised resources and planning), Ejercicios de Fútbol Sala 5 (systems, ABP, goalkeepers). Every source is used; no record cites more than one.

### Board authoring rules for the 21 new boards

- `schemaVersion: '1.0.0'`, `pitch.format: 'full'`, phase count from Table B, `order` = index + 1, `ball` present in every phase.
- Tokens: exactly `players.total`, unique lowercase ids, `kind: 'keeper'` count = `players.goalkeepers` (only the `10/2` records have keepers), labels 1–3 characters.
- Every phase positions every token exactly once; arrows have distinct endpoints; labels only where the drill names a zone.
- Coordinates inside **4–96**. Small spaces (10×10 to 20×20) occupy a coherent sub-region of the 2:1 board, never the whole board; `20×40` records may use the full board.
- Cones only for the squares, goals, zones or touchlines named in Table B; strict keys only.

## Read Layer

Two new publishable-only use cases, both delegating to `listExercises` so visibility and deduplication stay in one place:

```ts
export function listLibraryExercises(
  repository: ContentRepository,
  categoryId?: CategoryId,
): Exercise[];

export function listWeeklyHighlights(
  repository: ContentRepository,
  categoryId?: CategoryId,
): Exercise[];
```

- Implementation is `listExercises(repository, { categoryId }).filter((exercise) => exercise.collection === 'library')` and `.filter((exercise) => exercise.collection === 'weekly')` respectively; no new port method, no new repository call, no visibility logic duplicated.
- `listExercises` keeps its meaning: **every publishable exercise in both collections** (71 in the bundle) because hero stats and future AI grounding count the whole catalog. It is not narrowed to the library.
- `getExercise` is unchanged and can return a weekly record by id (the detail screen will need it).
- Public API exports `EXERCISE_COLLECTIONS`, `ExerciseCollection`, `ExerciseReference`, `listLibraryExercises`, `listWeeklyHighlights`.

**Presentation changes (two read switches, one copy rule, no layout work):**

1. `buildCategoryBrowseModel` calls `listLibraryExercises(repository, category.id)` instead of `listExercises`, so the rendered library stays 7/9 (Infantil 9) and weekly drills never appear under `CALENTAMIENTO` / `PARTE GENERAL` / `VUELTA A LA CALMA`. `model.exercises` and `model.sessionParts` are therefore library-only.
2. `buildExploreGeneralModel` keeps `buildCategoryBrowseModel` for `programming` but builds the weekly block from `listWeeklyHighlights(repository, category.id)`, not from `browseModel.sessionParts`. The block contains exactly the category's three weekly records, one per session part, ordered warm-up → main → cool-down with `SESSION_PARTS`; it is deterministic and has no date/week/random scheduler or persisted "current week".
3. `buildWeeklyExercises` takes `readonly Exercise[]` (the weekly result) and returns one `WeeklyExercise` per session part present, preserving that fixed order. `WEEKLY_EXERCISES_PER_PART` stays `1`.
4. `formatWeeklySelection` changes to a single argument and pins the copy: `formatWeeklySelection(3) === '3 ejercicios'`, `1` → `1 ejercicio`, `0` → `0 ejercicios`. It may reuse the existing `formatExerciseCount` helper; the strings are the contract.
5. `WeeklyExercises` changes its subtitle from `Un ejercicio de cada tramo de la sesión` to **`Una selección fuera de la biblioteca`** and renders `formatWeeklySelection(exercises.length)`. It no longer reads `totalCount` (destructure only `exercises`); the `totalCount` prop and its type stay in place during this feature so `ExploreScreen` remains byte-identical, and `explore-weekly-highlights` removes the dead prop in its cleanup.

**Evidence of no composition change:** `ExploreScreen` keeps the same JSX order and passes `totalCount` exactly as today; `AiSessionEntryCard` is untouched; no route, provider, token, Board Data, AI/quota file or `package.json` changes.

## Expected Files By Module And Layer

| Module | Layer | File | Change |
| --- | --- | --- | --- |
| `content` | domain | `src/modules/content/domain/exercise-collection.ts` | **new** — `EXERCISE_COLLECTIONS`, `ExerciseCollection` |
| `content` | domain | `src/modules/content/domain/exercise.ts` | required `collection`, optional `references`, `ExerciseReference`, `maxReferences` |
| `content` | domain | `src/modules/content/domain/content-package.ts` | `1.2.0`, `collection` enum, reference schema + http(s) check, issue messages |
| `content` | application | `src/modules/content/application/list-library-exercises.ts` | **new** |
| `content` | application | `src/modules/content/application/list-weekly-highlights.ts` | **new** |
| `content` | infrastructure | `src/modules/content/infrastructure/content/content-package.json` | `contentVersion` `1.2.0`, `collection: 'library'` on 50 records, 21 appended weekly records |
| `content` | presentation | `src/modules/content/presentation/view-models/category-browse-model.ts` | read the library collection only (`listLibraryExercises`), no layout change |
| `content` | presentation | `src/modules/content/presentation/view-models/explore-general-model.ts` | build the weekly block from `listWeeklyHighlights`; `buildWeeklyExercises` takes `readonly Exercise[]`; `formatWeeklySelection(count)` pins `N ejercicios` |
| `content` | presentation | `src/modules/content/presentation/components/weekly-exercises.tsx` | subtitle `Una selección fuera de la biblioteca`; counter from the weekly count; stops reading `totalCount` (prop kept) |
| `content` | public API | `src/modules/content/index.ts`, `README.md` | new exports, catalogue text |
| tests | domain | `tests/modules/content/domain/content-package.test.ts`, `domain/fixtures/valid-content-package.json` | `1.2.0`, `collection`, reference cases |
| tests | application | `tests/modules/content/application/content-queries.test.ts` | collection use cases, `collection` in fixtures |
| tests | infrastructure | `tests/modules/content/infrastructure/seed-weekly-highlights.test.ts` | **new** — 21-record and board contract |
| tests | infrastructure | `seed-provenance`, `bundled-content-repository`, `seed-session-structure`, `seed-infantil-u14`, `seed-remaining-categories` | counts 71/7/78, versions, library grouping, reference audit |
| tests | presentation | `category-browse-model.test.ts`, `explore-general-model.test.ts`, `screens/explore-general-screen.test.ts` | library-only model 7/9, stats `71`, pinned weekly ids/order, `3 ejercicios` copy, untouched composition |
| tests | public API | `tests/modules/content/index.test.ts` | new export names |
| docs | — | this spec, `docs/content-model.md`, `docs/content-licensing.md`, `ARCHITECTURE.md`, `src/modules/content/README.md`, `docs/domain-model.md`, `docs/risks-and-open-questions.md`, `docs/technical-discovery.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json` | see Durable Documentation Impact |

**Unchanged:** `src/app/**`, `src/shared/**`, `src/modules/{board,ai,club}/**`, the `ContentRepository` port, `getExercise`, `getProgramming`, `listExercises`, `ExploreScreen`, `AiSessionEntryCard`, `ExerciseLibraryList`, `ExploreHero`, `MethodologyOverviewCard`, `CategoryFilterBar`, `DESIGN.md`, `CONTEXT.md`, `docs/board-data-schema.md`, `package.json`, `eslint.config.js`, `init.sh`.

## Test Plan

Baseline: **280 tests / 205 suites**. Target after this feature: **356 tests / 220 suites** (+76 tests, +15 suites). The implementer records actual counts; any deviation from the target is justified in the evidence.

Delta accounting from the original plan: `category-browse-model.test.ts` stays `+1`; `explore-general-model.test.ts` grows from `+1` to **+3** (+2 net) for the weekly-only source, the session order and the pinned counter copy; `explore-general-screen.test.ts` is updated in place (0 new tests, only the pinned-copy assertions change). 74 + 2 = 76.

| File | Tests | Suites | Assertions |
| --- | --- | --- | --- |
| `domain/content-package.test.ts` (update) | +4 | +2 | missing `collection` → `exercises.0.collection`; unknown `'highlights'` → same path and two-value message; invalid URL (`ftp://`, relative) → `exercises.<i>.references.0.url`; four references → `exercises.<i>.references` max-3 message. Existing cases updated to `1.2.0` and the fixture. |
| `domain/fixtures/valid-content-package.json` (update) | 0 | 0 | `contentVersion` `1.2.0`; both exercises `collection: 'library'`; one carries a valid reference. |
| `application/content-queries.test.ts` (update) | +5 | +4 | library excludes weekly; weekly excludes library; `listExercises` returns both (3 tests in one new Given/When); weekly category filter (1); draft/unlicensed weekly filtered from both queries (1, inside the existing licence Given). `makeExercise` gains a `collection` parameter. |
| `infrastructure/seed-weekly-highlights.test.ts` (**new**) | +60 | +8 | 4 package/read tests (71/7/78, 50-id library order, 21-id weekly order, no duplicate id or title); 8 category tests (7 per-category weekly shape + 1 aggregate one-per-part/no-library-overlap); 21 per-record metadata/copy/reference tests; 1 all-board re-parse + 21 per-board coherence tests; 3 reference-audit tests (exactly one, four labels, public http(s)); 2 version/legacy tests (1.2.0/1.0.0/1.1.0 and the 50 legacy records unchanged apart from `collection`). |
| `infrastructure/seed-provenance.test.ts` (update) | +2 | 0 | 71 exercises + 7 Programming = 78 canonical records; all `original`/`owned`/`Futsal Manager AI`, none `reference`, no `attribution`, no inspiration domain in `sourceName`; new: only weekly records carry references and exactly one each; every reference URL is public http(s) with one of the four labels, and `references` never appears in provenance. |
| `infrastructure/bundled-content-repository.test.ts` (update) | +1 | +1 | `1.2.0`; 71-id array; per-category library counts 7/9 and weekly counts 3; per-category Programming unchanged; new test: the package splits into 50 library + 21 weekly. |
| `infrastructure/seed-session-structure.test.ts` (update) | 0 | 0 | 71 exercises and 78 records; grouped ids computed from `listLibraryExercises` so the pinned 2/3/2 and 2/5/2 lists stay valid; versions `1.2.0` / `1.0.0` / `1.1.0`. |
| `infrastructure/seed-infantil-u14.test.ts`, `seed-remaining-categories.test.ts` (update) | 0 | 0 | totals and version assertions move to 71/78 and `1.2.0`; legacy record byte-identity is asserted apart from `collection`. |
| `presentation/view-models/category-browse-model.test.ts` (update) | +1 | 0 | fixtures gain `collection`; the model excludes weekly records from `exercises` and `sessionParts` (one new test); pinned counts stay 7/9 (Infantil 2/5/2). |
| `presentation/view-models/explore-general-model.test.ts` (update) | +3 | 0 | bundled stats `71` / `7` / `100%`; rewritten pinned weekly ids per category; three new tests: (a) the weekly list is weekly-only and contains no library record, (b) the weekly list is always ordered warm-up → main → cool-down, (c) `formatWeeklySelection` returns `1 ejercicio` / `3 ejercicios` / `0 ejercicios`. `makeExercise` gains a `collection` argument. |
| `presentation/screens/explore-general-screen.test.ts` (update) | 0 | 0 | replace the old subtitle assertion with `Una selección fuera de la biblioteca`; assert the counter comes from the weekly list and not from the library total; keep the component order, AI-card position and no-hardcoded-count assertions. |
| `index.test.ts` (update) | 0 | 0 | exports `EXERCISE_COLLECTIONS`, `ExerciseCollection`, `ExerciseReference`, `listLibraryExercises`, `listWeeklyHighlights`. |
| `tests/shared/domain/board-data/**`, `tests/architecture/**` (unchanged) | 0 | 0 | Board Data `1.0.0` and boundaries stay green. |

Budget note: the new suite is intentionally one test per record plus one board test per record, matching `seed-session-structure`; that is 42 generated tests of the 60.

## Verification Plan

1. **Standalone parse** before touching tests: `npx tsx` imports the edited JSON as `unknown`, runs `parseContentPackage`, prints issues, asserts `1.2.0`, 71 exercises, 7 Programming, 50 `library`, 21 `weekly`, exits non-zero on failure.
2. **Invalid-package probes on an in-memory clone (no file edits):**
   - delete `exercises[50].collection` → `exercises.50.collection` with the two-value message;
   - set it to `'highlights'` → same path/message;
   - set `exercises[50].references[0].url` to `ftp://example.com/x` and to `/recursos` → `exercises.50.references.0.url: Reference url must be an absolute http(s) URL.`;
   - append four references → `exercises.50.references: At most 3 reference citations are allowed per exercise.`;
   - set `contentVersion` to `'1.1.0'` → a `contentVersion` issue naming `1.2.0`;
   - confirm the untouched package parses and the JSON file is unchanged by the probes.
3. **Read-layer smoke** (`tsx`) per category: library count and ids, weekly count and ids in warm-up → main → cool-down order, weekly session parts, bundle totals 50/21/71 and 7 Programming; `listExercises` returns 71 unique; `getExercise` resolves one weekly id; `buildCategoryBrowseModel(...).exercises` contains only library ids (7 or 9), and `buildExploreGeneralModel(...).weeklyExercises` returns the three weekly ids.
4. `npm test` (target **356/220**), `npm run lint`, `npm run typecheck`, `npm run verify` (expo-doctor 20/20), `./init.sh` exit 0 with no Metro.
5. **Scans:** `git diff --stat` limited to the files table; no `reference` provenance value in the package; no inspiration domain in any `sourceName`; no `#rrggbb` in `content/presentation`; no `content/infrastructure` import in presentation; Board Data still `1.0.0`; `buildCategoryBrowseModel` no longer imports `listExercises` as its data source.
6. `npx expo export --platform android`; search the bundle for weekly ids and `Adri Martín Futsal` (macOS `strings` is ASCII-only, so use a UTF-16LE scan for accented copy) and for `Manual de entrenamiento de fútbol sala de la UEFA`.
7. **Device smoke on `SM-M135F`** (Android 14, Expo Go 58.0.5, `adb reverse tcp:8081 tcp:8081`): Explorar boots; the hero reads `71 Ejercicios`; a selected category shows its 7/9 library under the three headings with counts 2/3/2 (Infantil 2/5/2) and no weekly title in the library; the weekly block shows that category's three weekly titles in warm-up → main → cool-down order, subtitle `Una selección fuera de la biblioteca`, counter `3 ejercicios`; the AI card is still in its current position; Pizarra, Asistente IA, Mi Club and `/design-system` unchanged; `adb logcat` free of React Native errors. The AI-card reorder and the final layout pass are not part of this smoke.
8. **Persistent E2E:** none exists and there is no RN component runner; the package contract, read-layer smoke, seed suite, export and device smoke are the agreed coverage.

## Durable Documentation Impact

- `docs/content-model.md` — **update:** Exercise table gains `collection` and `references`; package contract/version `1.2.0`; seed scope 50 library + 21 weekly = 71 exercises + 7 Programming = 78 records with package order; invariants for `collection` and reference URL/count with issue paths; read-layer table gains the two queries; presentation note records that `buildCategoryBrowseModel` reads `listLibraryExercises`, `buildExploreGeneralModel` reads `listWeeklyHighlights`, and the hero counts both collections (`71 Ejercicios`); `exercise-detail-screen` renders `references`.
- `docs/content-licensing.md` — **update:** source register rows describe the four sources as inspiration-only citations and note that `references` stores a citation, not a licence; add a "Reference citation rule" (a reference is not provenance, grants no redistribution right, never satisfies the publish gate, must not appear in `sourceName`/`attribution`); audit text moves to 78 records and 21 weekly records with exactly one public http(s) citation; author checklist gains the citation/originality items.
- `ARCHITECTURE.md` — **update:** `content` domain gains `exercise-collection.ts`, `Exercise.collection` and `Exercise.references`; application gains `listLibraryExercises`/`listWeeklyHighlights`; infrastructure package is `1.2.0` with 71 exercises + 7 Programming; presentation browse model reads the library collection only and the weekly block reads the weekly collection; no layer, port or dependency-graph change.
- `src/modules/content/README.md` — **update:** layers, package counts/version, new use cases, public exports, collection/reference rules, library-vs-weekly read split, weekly block copy, libraries used, test locations.
- `docs/domain-model.md` — **update:** Exercise concept gains `collection` (library vs weekly highlight) and `references` (inspiration citation); content package version `1.2.0`; no lifecycle change.
- `docs/risks-and-open-questions.md` — **update:** copyright boundary (citations are not licences; originality review of the 21 records; no copied expression), the future detail-screen display obligation, the `"Semana"` deterministic-slice note now says the weekly block is a separate collection read in fixed session order with no scheduler; next feature is `explore-weekly-highlights` (AI-card reorder and final layout only).
- `docs/technical-discovery.md` — **update:** `contentVersion` `1.2.0`, 71 exercises (50 library + 21 weekly) + 7 Programming.
- `AGENTS.md` — **update:** project status, package version/counts, new collection/references contract, library/weekly read split, hero `71 Ejercicios`, next ready feature `explore-weekly-highlights` (AI-card reorder and layout only), thumbnail still deferred.
- `PROGRESS.md`, `feature_list.json` — **update:** session log, evidence, status; record the 21 ids, the reference assignment and the view-model copy decision; `explore-weekly-highlights` scope shrinks to the AI-card reorder and final layout pass.
- `CONSTRAINTS.md` — **not needed:** file does not exist.
- `DESIGN.md`, `CONTEXT.md`, `docs/build-brief.md`, `docs/board-data-schema.md` — **not needed:** no visual, vocabulary, product-slice or Board Data change.

## Implementation Plan And Tasks

1. Read this spec, `docs/content-model.md`, `docs/content-licensing.md`, `docs/board-data-schema.md`, the accepted seed specs; run `./init.sh` to confirm 280/205 and package `1.1.0`.
2. Add `domain/exercise-collection.ts`; extend `exercise.ts` with `collection`, `ExerciseReference`, `references?`, `maxReferences`; extend `content-package.ts` with the enum, reference schema, http(s) refinement and `1.2.0`.
3. Edit `content-package.json`: bump `contentVersion`, add `collection: 'library'` to all 50 records (no other edit), append the 21 weekly records at indices 50–70 in Table A order with Tables B–D data and valid boards.
4. Parse standalone; fix every issue path before touching tests; run the invalid-package probes.
5. Add `application/list-library-exercises.ts` and `application/list-weekly-highlights.ts`; switch `buildCategoryBrowseModel` to `listLibraryExercises`; switch `buildExploreGeneralModel` to `listWeeklyHighlights`, change `buildWeeklyExercises` to accept `readonly Exercise[]`, and pin `formatWeeklySelection(count)`; export the new surface.
6. Update `weekly-exercises.tsx` copy to `Una selección fuera de la biblioteca` and derive the counter from the weekly list only; leave `ExploreScreen` and `AiSessionEntryCard` untouched.
7. Update the fixture and the domain/application tests; add `seed-weekly-highlights.test.ts`; update the seed, repository, browse-model, explore-model, screen and public-API tests to 71/7/78, `1.2.0` and the new weekly copy.
8. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run verify`, `./init.sh`, the read-layer smoke, the scans and the Android export.
9. Run the `SM-M135F` smoke for the library 7/9, the three weekly titles and `71 Ejercicios`; record evidence.
10. Update the durable docs and harness state; tick these boxes.

- [x] Add `EXERCISE_COLLECTIONS`/`ExerciseCollection` and the required `Exercise.collection`.
- [x] Add optional `Exercise.references` with max 3 and absolute http(s) validation plus clear paths/messages.
- [x] Bump `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` to `1.2.0`; keep Board Data `1.0.0` and `infantil-u14-base` `1.1.0`.
- [x] Tag all 50 existing records `collection: 'library'` without touching any other field.
- [x] Append the 21 weekly records with the pinned metadata, Spanish copy, two constraints, three cues, one citation and valid boards.
- [x] Add `listLibraryExercises`/`listWeeklyHighlights`, export them, and read the library collection from `buildCategoryBrowseModel`.
- [x] Read `listWeeklyHighlights` from `buildExploreGeneralModel`; pin the session order and the `N ejercicios` counter.
- [x] Update `weekly-exercises.tsx` copy without moving `AiSessionEntryCard` or recomposing `ExploreScreen`.
- [x] Update all affected tests and add `seed-weekly-highlights.test.ts` (actual: **356 tests / 227 suites**; the test count matches the target, the suite count is +7 because `node:test` counts the new Given/When `describe` blocks as suites).
- [x] Run the parse, probes, gate, smoke, export and device checks; record evidence.
- [x] Update the durable docs and harness state.

## Evidence To Capture

- Standalone parse output (`1.2.0`, 71, 7, 50 library, 21 weekly) and the six probe paths/messages; untouched package pass; JSON unchanged.
- Before/after test and suite counts (280/205 → **356/220**) and the new suite result.
- Read-layer smoke per category: library counts 7/7/7/9/7/7/7, weekly 3 each, per-part order, bundle totals, Programming ids/versions; `buildCategoryBrowseModel` returns only library ids and `buildExploreGeneralModel` returns the three weekly ids.
- `lint`/`typecheck`/`verify`/`./init.sh` exit codes and the expo-doctor score; scan outputs.
- Android bundle size and the weekly ids, reference labels and UEFA label found in it.
- Device model/density, `71 Ejercicios`, the selected category's 7/9 library with 2/3/2 headings and no weekly title in it, the three weekly titles in warm-up → main → cool-down order with `3 ejercicios`, the AI card still in place, unchanged other tabs, and `logcat` status.
- Confirmation that no AI, quota, route, shared, board-renderer, `package.json`, `eslint.config.js` or Board Data file changed, that `ExploreScreen`/`AiSessionEntryCard` are byte-identical, and that the 50 library records differ only by `collection`.

## Validator Checklist

- [x] Scope matches this spec: content domain, package, two use cases, the two presentation read switches (`buildCategoryBrowseModel`, `buildExploreGeneralModel`), the weekly block copy, mirrored tests and the named docs only.
- [x] `collection` is required and rejects anything outside `'library'`/`'weekly'` at `exercises.<i>.collection`; all 50 legacy records are `library` and otherwise unchanged.
- [x] `references` is optional, max 3, `{ label, url }` only, absolute http(s); invalid URL, missing label and four entries fail at their documented paths.
- [x] `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` are `1.2.0`; Board Data is `1.0.0`; `infantil-u14-base` is `1.1.0`; Programming records untouched.
- [x] Package holds 50 library + 21 weekly = 71 exercises and 7 Programming = 78 records; the 21 ids/order match this spec.
- [x] Each category has exactly three weekly highlights, one per session part, single-category, none listed in that category's library, reading as activation → main → cool-down.
- [x] All 21 records match Tables A–D; two constraints, three cues, one citation each; `published`/`original`/`owned`/`Futsal Manager AI`, no `attribution`, no `reference` kind.
- [x] Every board parses at `1.0.0`, full pitch, planned phases, one position per token per phase, 4–96 coordinates, distinct arrows, tokens = `players.total` and keepers = `goalkeepers`.
- [x] No copied expression from the four sources; no inspiration domain in `sourceName`; the four URLs appear only inside `references`.
- [x] `listLibraryExercises` and `listWeeklyHighlights` are publishable-only, deduplicated, category-filterable and mutually exclusive; `listExercises` still returns all 71.
- [x] `buildCategoryBrowseModel` renders exactly 7 library drills per category (Infantil 9) grouped 2/3/2 (Infantil 2/5/2), and none of the three weekly ids appears in the library list.
- [x] `buildExploreGeneralModel` renders exactly the three weekly drills in warm-up → main → cool-down order with subtitle `Una selección fuera de la biblioteca` and counter `3 ejercicios` (deterministic, no scheduler).
- [x] `ExploreScreen`, `AiSessionEntryCard`, routes, Board Data `1.0.0`, AI/quota, `package.json`, `eslint.config.js` and `init.sh` are untouched; the hero reads `71 Ejercicios` without a hardcoded value.
- [x] Gate passes at **356 tests / 220 suites**; export and `SM-M135F` smoke pass; evidence recorded; durable docs updated; boxes ticked.

## Planning-Time Risks

- **Library regression if the browse model is not switched.** `listExercises` now returns 71, so leaving `buildCategoryBrowseModel` untouched would render 10/12 drills in the library and defeat the coach's request. Mitigation: the spec requires the explicit switch to `listLibraryExercises` and pins 7/9 counts plus a weekly-exclusion test.
- **Hero count changes to 71.** The hero derives from `listExercises`, so the accepted `50 Ejercicios` becomes `71 Ejercicios` without a component change. It is intended (stats count the whole catalog) and must be recorded in docs and device evidence, not treated as a bug.
- **Originality/copyright drift.** 21 hand-authored drills inspired by four third-party resources can drift into paraphrasing. Mitigation: no copied titles, sentences, diagrams, tables or boards; one originality read against the cited page before merge; citations are metadata only; no `reference` provenance; legal/open questions updated.
- **A citation can be misread as a licence.** A coach or a future agent could treat `references` as permission to redistribute the source. Mitigation: docs, README and the contract state it is citation-only; the detail screen must carry the original-content disclaimer; the licence gate ignores `references`.
- **Board geometry is parser-valid but visually unreviewed.** 21 hand-authored boards, including small U8/U10 spaces, wait on `tactics-board-renderer`. Mitigation: coherent sub-regions, coordinates 4–96, one position per token per phase; legibility is recorded as a risk.
- **Exact-count coupling.** Five suites encode totals, ids and versions; a future insertion must update them together. Mitigation: one canonical list in `seed-weekly-highlights.test.ts`, append-only package order, documented canonical order.
- **Counter copy can read like a library fraction.** `3 de 7` makes the weekly block look like a subset of the library. Mitigation: the copy is pinned to `3 ejercicios` with subtitle `Una selección fuera de la biblioteca`; `formatWeeklySelection` no longer accepts a total, and the screen test pins both strings.
- **Weekly block regression if the second switch is missed.** Changing only `buildCategoryBrowseModel` makes the library correct but leaves the weekly block repeating library drills. Mitigation: `buildExploreGeneralModel` must call `listWeeklyHighlights`; a new view-model test asserts the weekly ids are the 21 pinned records and never a library id.
- **Scope creep into the final layout.** It is tempting to move the AI card or restructure `ExploreScreen` while touching the block. Mitigation: non-goals, the file table and the byte-identity check keep `ExploreScreen`/`AiSessionEntryCard` untouched; `explore-weekly-highlights` owns that pass.
- **`listExercises` semantics widen.** AI grounding and future features now see weekly highlights in the "all exercises" set. Mitigation: documented as "every publishable exercise"; grounded generation can choose the library collection when it lands, and that decision belongs to the AI feature, not this one.
- **Test-suite growth.** +76 tests and a heavier package raise runtime. Mitigation: one consolidated new suite with generated per-record tests; no duplicate fixtures; keep the gate under the existing `node:test` runner.
