# Feature Implementation Spec: Seed seven exercises per category by session part

## Source Feature

- **id:** `seed-session-structure`
- **area:** `content`
- **status:** `passing`
- **depends_on:** `seed-remaining-categories` (accepted), `category-filter` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/seed-session-structure` (stacked on `feat/category-filter` @ `8846d39`)
- **spec path:** `docs/specs/seed-session-structure.md`
- **deferred sibling:** `exercise-preview-board-thumbnail` (not planned or implemented here)

## Goal

A coach reviewing Explorar on a real device said the library does not look like a session: each non-Infantil category only has three drills, and the list has no structure. After this feature every RFEF category opens as a session-shaped library grouped under three Spanish headings, with the format the coach asked for — **seven exercises per non-Infantil category split 2 warm-up / 3 main part / 2 cool-down** — and Infantil U14 keeps its existing nine exercises, each tagged with a session part instead of deleting content.

This requires a real `sessionPart` field on `Exercise` (`'warm-up' | 'main' | 'cool-down'`) rather than inferring it from `focus`, six categories grow from 3 to 7 exercises (**24 new exercises**), the content package contract moves to **`contentVersion` `1.1.0`**, and Explorar renders the three groups with counts.

Final package: **50 exercises + 7 Programming records = 57 records**. Content work plus a domain-contract field, mirrored content/presentation tests, and the named docs. No Board Data, AI, quota, board-rendering, or route change.

## Non-Goals

- The deferred `exercise-preview-board-thumbnail` request: no board thumbnails, renderer extraction, or `tactics-board-renderer` work.
- `explore-general-screen` chrome: no hero, weekly exercises, methodology overview, AI entry point, or layout rebuild. Only the existing `ExerciseLibraryList` gains group headings.
- `explore-by-category-screen`, `exercise-detail-screen`, attribution display, empty-state redesign, or persistence of category selection.
- Deleting, renaming, re-tagging, or re-ordering existing exercises; changing existing titles, summaries, focuses, or Board Data geometry.
- New RFEF categories, new provenance kinds, CMD Mora or `reference` material, new sources, new attribution text.
- Changing Board Data (`1.0.0`), `infantil-u14-base` (`1.1.0`), `ContentProvenance`, `CATEGORY_IDS`, ports, use cases, or `Programming` fields.
- AI retrieval/grounding/generation, quota, board playback, `init.sh`, `package.json`, or `eslint.config.js` changes.

## Job Story

When I select my category in Explorar, I want the exercise library to read like a session — calentamiento, parte general, vuelta a la calma — so I can pick my drills in coaching order instead of scrolling a flat three-item list.

## Acceptance Scenarios

### Scenario 1: Every category is session-shaped

Given the bundled content package
When `listExercises(repository, { categoryId })` runs for each of the seven `CATEGORY_IDS`
Then Prebenjamín, Benjamín, Alevín, Cadete, Juvenil and Senior each return exactly 7 exercises and Infantil returns its existing 9, grouped as 2 warm-up / 3 main / 2 cool-down for the six, and 2 warm-up / 5 main / 2 cool-down for Infantil.

### Scenario 2: Explorar shows the three Spanish headings with counts

Given the bundled repository and a selected category
When `buildCategoryBrowseModel` builds the model and `ExerciseLibraryList` renders it
Then the library shows `CALENTAMIENTO` (2), `PARTE GENERAL` (3) and `VUELTA A LA CALMA` (2) in that order for a non-Infantil category, each heading followed by its cards in package order, and `CALENTAMIENTO` (2), `PARTE GENERAL` (5), `VUELTA A LA CALMA` (2) for Infantil.

### Scenario 3: `sessionPart` is a real, required contract field

Given an exercise record
When the package is parsed
Then `sessionPart` is required and must be exactly `'warm-up'`, `'main'`, or `'cool-down'`; a missing value reports `exercises.<i>.sessionPart` and an unknown value fails with a message naming the three allowed values.

### Scenario 4: The 24 new exercises match the pinned plan

Given the 24 exercises appended by this feature
When their metadata is read
Then each id, title, focus, category, `sessionPart`, players, space, duration, intensity, work structure and phase count match the seed table below, each is `published` / `original` / `owned` / `Futsal Manager AI` with no `attribution`, and each board parses as Board Data `1.0.0`.

### Scenario 5: Boards stay valid

Given each of the 50 seeded exercises
When its `boardData` is re-parsed with `parseBoardData`
Then it passes at `1.0.0`, uses `pitch.format: 'full'`, has the planned phases with `order` = index + 1, positions every token once per phase, keeps coordinates inside 4–96, and arrows have distinct endpoints.
And for the 24 boards added by this feature, the board defines exactly `players.total` tokens and the `kind: 'keeper'` count equals `players.goalkeepers`.
And the five frozen legacy boards `salida-3-1-presion-alta`, `circulacion-cierre-ala`, `presion-tras-perdida`, `rondo-4v1-orientacion` and `transicion-3v2-tras-robo` predate that token rule, so their seeded token and keeper counts stay unchanged and are only covered by the 50-board re-parse above.

### Scenario 6: Existing content is preserved except for the new field

Given the 26 previously seeded exercises and 7 Programming records
When the package is read after the feature
Then all 26 ids, titles, categories and board phase counts are unchanged, `salida-3-1-presion-alta` is still exercise index 0, package order is unchanged, every Programming record is unchanged (`infantil-u14-base` still `1.1.0`), and the only field added to existing exercises is `sessionPart`.

### Scenario 7: Versions move together and only where intended

Given the package contract
When `CONTENT_PACKAGE_VERSION`, the JSON `contentVersion`, Board Data and the Infantil plan version are read
Then `CONTENT_PACKAGE_VERSION` and `contentVersion` are both `1.1.0`, Board Data stays `1.0.0`, and `infantil-u14-base` stays `1.1.0`.

### Scenario 8: Provenance audit covers 57 records

Given the bundled package
When the seed provenance audit runs
Then it sees 50 exercises and 7 Programming records, all `published`, `kind: 'original'`, `licenseStatus: 'owned'`, `sourceName` `Futsal Manager AI`, none `reference`, none with `attribution`, and no inspiration-only domain in any `sourceName`.

### Scenario 9: Grouping is deterministic and handles an empty group

Given a repository whose exercises have different session parts
When `groupExercisesBySessionPart` runs
Then it always returns exactly three groups in the order warm-up, main, cool-down, preserving the input (package) order inside each group, with Spanish labels `Calentamiento`, `Parte general`, `Vuelta a la calma`; a part with no exercises is still present with an empty list.

### Scenario 10: No forbidden stage taxonomy leaks in

Given the seeded package and the seven RFEF categories
When ids, titles, summaries, focuses, category ids and session parts are scanned
Then no record contains a Chupetín-style stage, every `categoryIds` entry is one of the seven RFEF brackets, and every `sessionPart` is one of the three allowed values.

### Scenario 11: The app still runs

Given the edited package, parser, view model and library component
When `npm run verify`, `./init.sh` and the Android device smoke run
Then all gates pass, Explorar still lists the seven chips, the selected category shows the grouped library, the other three tabs and `/design-system` are unchanged, and `logcat` has no React Native errors.

## Repository Research

### Files Inspected

- `feature_list.json` (`seed-session-structure`, `category-filter`, `explore-general-screen`, `exercise-preview-board-thumbnail`), `PROGRESS.md`, `AGENTS.md` — coach request, scope, version-bump rule, next features.
- `ARCHITECTURE.md`, `src/modules/content/README.md` — content layers, presentation responsibilities, package catalogue sentence (lines ~154–159).
- `CONTEXT.md`, `docs/domain-model.md`, `docs/build-brief.md` — canonical vocabulary: a Session has warm-up / main part / cool-down; "Session" already exists, "session part" for an Exercise is new.
- `DESIGN.md`, `src/shared/theme/typography.ts`, `src/shared/ui/text.tsx`, `src/modules/content/presentation/**` — existing heading pattern (`labelMd` uppercase `CATEGORÍA`, `headlineSm` section header, `labelMd` counts), `Card`, spacing.
- `docs/content-model.md`, `docs/content-licensing.md`, `docs/board-data-schema.md` — field limits, invariants, package order, licence audit, Board Data limits.
- `docs/specs/seed-infantil-u14.md`, `docs/specs/seed-remaining-categories.md`, `docs/specs/category-filter.md` — seed-table, copy-contract, board-authoring and test conventions.
- `src/modules/content/domain/{exercise,programming,content-package,category}.ts` — `Exercise` shape, existing `SessionPart` type in `programming.ts`, `exerciseSchema`, `CONTENT_PACKAGE_VERSION`, limits.
- `src/modules/content/infrastructure/content/content-package.json` — 26 exercises (indices 0–25) + 7 Programming records, `contentVersion` `1.0.0`; per-category ids and current package order verified.
- `src/modules/content/presentation/{screens/explore-screen.tsx,view-models/category-browse-model.ts,components/exercise-library-list.tsx}` and `src/shared/ui/filter-chip.tsx` — where grouping and headings belong.
- `tests/modules/content/**` — exact-count and id assertions that must move: `domain/content-package.test.ts`, `domain/fixtures/valid-content-package.json`, `application/content-queries.test.ts`, `presentation/view-models/category-browse-model.test.ts`, `presentation/composition-wiring.test.ts`, `infrastructure/{seed-provenance,bundled-content-repository,seed-infantil-u14,seed-remaining-categories}.test.ts`, `index.test.ts`.

### Existing Patterns To Follow

- One bundled JSON package; ids lowercase Spanish slugs; package order is contract and append-only; Spanish copy, English identifiers/tests/docs.
- Full token snapshot per phase, board-level tokens/cones, `pitch.format: 'full'`, coordinates 4–96.
- Seed tests import layers directly (`node:test` cannot load React Native), use Given/When/Then, and assert the real package.
- Presentation stays pure and prop-driven; the view model calls only `listExercises`/`getProgramming`; no component reads provenance or status.
- Versions: `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` always move together; `Programming.version` is a separate plan version.

### Current Gaps

- Six categories have 3 exercises each; Infantil's 9 are unclassified, so no UI can group them.
- `Exercise` has no session-part concept; `focus` is free text and cannot drive grouping safely.
- `ExerciseLibraryList` renders one flat list; there is no group heading, count per part, or Spanish label formatter.
- Count/id assertions are spread across five content test files plus the domain package fixture, which all must move in one change.

## Contract And Version Decisions

### `sessionPart` on `Exercise`

- New `src/modules/content/domain/session-part.ts`:
  - `export const SESSION_PARTS = ['warm-up', 'main', 'cool-down'] as const;`
  - `export type SessionPart = (typeof SESSION_PARTS)[number];`
- `exercise.ts` imports the type and adds a **required** field `sessionPart: SessionPart` immediately after `focus` in the `Exercise` type and in JSON key order.
- `programming.ts` stops declaring its own literal type and re-exports `SessionPart` from `session-part.ts`, so Programming and Exercise share one vocabulary and the public API path stays stable.
- `content-package.ts`: add `sessionPart: z.enum(SESSION_PARTS, { error: 'Exercise sessionPart must be "warm-up", "main", or "cool-down".' })` to `exerciseSchema`, and reuse `SESSION_PARTS` for `sessionStructureSchema.part`. No default: grouping must never guess.
- Public API (`src/modules/content/index.ts`) exports `SESSION_PARTS` and the grouping helpers; `SessionPart` stays exported.

### Package version

- `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` both move **`1.0.0` → `1.1.0`** in the same change (additive field, breaking for records that omit it; AGENTS.md rule).
- **Board Data stays `1.0.0`**: no Board Data key, coordinate, limit, or parser change.
- **`infantil-u14-base` stays `1.1.0`**: its `version` is the season-plan version, unrelated to the package version.
- The version test in `content-package.test.ts` and the version assertions in the seed tests move to `1.1.0`; the parser must still reject any other value, including `1.0.0`.

### Public API and read layer

- No port or use-case change: `listExercises` keeps returning the category's exercises in package order; grouping is presentation logic.
- Grouping is a pure presentation view model so the board, AI, and later screens can reuse the vocabulary without duplicating it.

## Session Part Assignment For Existing Exercises

Applied to the 26 existing records without renaming ids or titles, re-tagging categories, or reordering the package.

| id | category membership | current data | `sessionPart` |
| --- | --- | --- | --- |
| `salida-3-1-presion-alta` | infantil + cadete | 15 min, high 85, 3 phases | `main` |
| `circulacion-cierre-ala` | infantil | 12 min, medium 65 | `cool-down` |
| `presion-tras-perdida` | infantil | 18 min, high 90 | `main` |
| `rondo-4v1-orientacion` | infantil | 8 min, low 45, rondo | `cool-down` |
| `pase-y-va-carril-central` | infantil | 12 min, medium 70, technique | `warm-up` |
| `juego-posicion-3-1-pivote` | infantil | 14 min, medium 75, positional game | `warm-up` |
| `ataque-4-0-rotaciones` | infantil | 15 min, high 80 | `main` |
| `basculacion-rombo-defensivo` | infantil | 15 min, medium 70 | `main` |
| `transicion-3v2-tras-robo` | infantil | 12 min, high 85 | `main` |
| `conduccion-entre-conos` | prebenjamin | 8 min, low 45 | `warm-up` |
| `pases-por-parejas` | prebenjamin | 8 min, low 40 | `warm-up` |
| `juego-3v3-conos-porteria` | prebenjamin | 10 min, medium 55 | `main` |
| `rondo-4v1-dos-toques` | benjamin | 10 min, low 50 | `warm-up` |
| `pase-y-va-cambio-orientacion` | benjamin | 12 min, medium 60 | `warm-up` |
| `salida-portero-3v2` | benjamin | 12 min, medium 65 | `main` |
| `conservacion-4v2-carriles` | alevin | 12 min, medium 60 | `main` |
| `reaccion-tras-perdida-3v2` | alevin | 12 min, high 75 | `main` |
| `ataque-3v2-banda` | alevin | 14 min, medium 70 | `main` |
| `juego-posicion-4v4-comodines` | cadete | 16 min, medium 75 | `main` |
| `basculacion-bloque-1-2-1` | cadete | 18 min, medium 70 | `main` |
| `salida-4v3-con-portero` | juvenil | 18 min, high 80 | `main` |
| `transicion-4v3-tras-robo` | juvenil | 16 min, high 85 | `main` |
| `presion-alta-4v4` | juvenil | 18 min, high 85 | `main` |
| `salida-3-2-cambio-ala` | senior | 20 min, high 85 | `main` |
| `defensa-3-1-presion-cierre` | senior | 18 min, medium 75 | `main` |
| `transicion-5v4-carril-central` | senior | 18 min, high 90 | `main` |

**Why Infantil is 2 / 5 / 2 and not 2 / 3 / 2.** Infantil keeps nine drills, so two extra land somewhere. Both end phases keep the requested pair, and the surplus goes to the main part, which is where a U14 coach wants tactical options: the six-category split is exactly 2 / 3 / 2, while Infantil reads `CALENTAMIENTO` 2 · `PARTE GENERAL` 5 · `VUELTA A LA CALMA` 2. The two lowest-load drills (`rondo-4v1-orientacion` 45 %, `circulacion-cierre-ala` 65 %) close the session, and `pase-y-va-carril-central` + `juego-posicion-3-1-pivote` open it as a technical/positional activation. This is the only assignment that keeps two drills in every part without adding or deleting Infantil content; it is flagged for coach review in Risks.

**Cadete crossover.** `salida-3-1-presion-alta` is `main`, so it fills one of Cadete's three main slots and one of Infantil's five; Cadete's four new drills are therefore 2 warm-up + 2 cool-down.

## Planned Seed Table — 24 New Exercises

Appended after the 26 existing records in this exact order (package indices 26–49), one four-exercise block per category in `CATEGORY_IDS` order. `players` is `total/GK`; `space` is `label, width × length` metres; `intensity` is level + percent; `work` is the exact Spanish `workStructure`; `ph` is phase count. All boards have `tokens` = `players.total` and keeper tokens = `goalkeepers`.

| idx | id | category | part | focus | title | players | space | min | intensity | work | ph |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | `juego-4v4-dos-porterias` | `prebenjamin` | `main` | Juego reducido | Juego 4 contra 4 en dos porterías | 8/0 | Cuadrado de juego, 20×20 | 10 | medium 60 | Bloques de 3 minutos x 3 series | 2 |
| 27 | `conduccion-y-pase-en-cuadrado` | `prebenjamin` | `main` | Conducción y pase | Conducción y pase en el cuadrado | 8/0 | Cuadrado de trabajo, 15×15 | 10 | low 50 | Bloques de 3 minutos x 3 series | 2 |
| 28 | `rondo-libre-3v1` | `prebenjamin` | `cool-down` | Vuelta a la calma | Rondo libre 3 contra 1 | 4/0 | Cuadrado de rondo, 8×8 | 6 | low 35 | Rondos de 60 segundos x 4 series | 2 |
| 29 | `vuelta-a-la-calma-con-balon` | `prebenjamin` | `cool-down` | Vuelta a la calma | Vuelta a la calma con balón | 8/0 | Círculo de cierre, 10×10 | 6 | low 25 | Bloques de 2 minutos x 3 series | 2 |
| 30 | `juego-posicion-3v3-apoyos` | `benjamin` | `main` | Juego de posición | Juego de posición 3 contra 3 con apoyos | 8/0 | Rectángulo de juego, 20×15 | 12 | medium 65 | Bloques de 4 minutos x 3 series | 3 |
| 31 | `salida-3v1-desde-portero` | `benjamin` | `main` | Salida de balón | Salida 3 contra 1 desde portero | 4/1 | Medio campo, 20×20 | 10 | medium 60 | Bloques de 3 minutos x 3 series | 3 |
| 32 | `rondo-4v0-control-orientado` | `benjamin` | `cool-down` | Vuelta a la calma | Rondo 4 contra 0 con control orientado | 4/0 | Cuadrado de rondo, 8×8 | 6 | low 35 | Rondos de 60 segundos x 4 series | 2 |
| 33 | `circulacion-suave-y-movilidad` | `benjamin` | `cool-down` | Vuelta a la calma | Circulación suave y movilidad | 8/0 | Círculo de cierre, 10×10 | 6 | low 30 | Bloques de 2 minutos x 3 series | 2 |
| 34 | `rondo-5v1-activacion` | `alevin` | `warm-up` | Rondo | Rondo 5 contra 1 de activación | 6/0 | Cuadrado de rondo, 10×10 | 8 | low 45 | Rondos de 90 segundos x 4 series | 2 |
| 35 | `pase-y-control-en-movimiento` | `alevin` | `warm-up` | Pase | Pase y control en movimiento | 8/0 | Doble cuadrado, 20×20 | 10 | medium 55 | Bloques de 3 minutos x 3 series | 2 |
| 36 | `conservacion-suave-4v0` | `alevin` | `cool-down` | Vuelta a la calma | Conservación suave 4 contra 0 | 8/0 | Rectángulo de cierre, 15×10 | 6 | low 30 | Bloques de 2 minutos x 3 series | 2 |
| 37 | `rondo-final-4v1` | `alevin` | `cool-down` | Vuelta a la calma | Rondo final 4 contra 1 | 5/0 | Cuadrado de rondo, 10×10 | 6 | low 35 | Rondos de 60 segundos x 4 series | 2 |
| 38 | `rondo-4v2-activacion` | `cadete` | `warm-up` | Rondo | Rondo 4 contra 2 de activación | 6/0 | Cuadrado de rondo, 12×12 | 10 | low 50 | Rondos de 90 segundos x 5 series | 2 |
| 39 | `movilidad-y-pases-largos` | `cadete` | `warm-up` | Activación | Movilidad y pases largos | 8/0 | Franja de activación, 20×10 | 8 | low 45 | Bloques de 2 minutos x 4 series | 2 |
| 40 | `conservacion-5v2-baja-intensidad` | `cadete` | `cool-down` | Vuelta a la calma | Conservación 5 contra 2 a baja intensidad | 7/0 | Rectángulo de cierre, 20×15 | 8 | low 40 | Bloques de 3 minutos x 2 series | 2 |
| 41 | `estiramientos-guiados-con-balon` | `cadete` | `cool-down` | Vuelta a la calma | Estiramientos guiados con balón | 8/0 | Círculo de cierre, 10×10 | 6 | low 20 | Bloques de 2 minutos x 3 series | 2 |
| 42 | `rondo-4v2-con-salida` | `juvenil` | `warm-up` | Rondo | Rondo 4 contra 2 con salida | 6/0 | Cuadrado de rondo, 12×12 | 10 | low 50 | Rondos de 90 segundos x 5 series | 3 |
| 43 | `activacion-con-duelos-1v1` | `juvenil` | `warm-up` | Activación | Activación con duelos 1 contra 1 | 8/0 | Franja de duelos, 20×15 | 10 | medium 60 | Series de 45 segundos x 6 repeticiones | 2 |
| 44 | `conservacion-6v3-baja-intensidad` | `juvenil` | `cool-down` | Vuelta a la calma | Conservación 6 contra 3 a baja intensidad | 9/0 | Rectángulo de cierre, 20×15 | 8 | low 40 | Bloques de 3 minutos x 2 series | 2 |
| 45 | `rondo-final-y-movilidad` | `juvenil` | `cool-down` | Vuelta a la calma | Rondo final y movilidad | 8/0 | Círculo de cierre, 10×10 | 6 | low 25 | Bloques de 2 minutos x 3 series | 2 |
| 46 | `rondo-5v2-activacion` | `senior` | `warm-up` | Rondo | Rondo 5 contra 2 de activación | 7/0 | Cuadrado de rondo, 14×14 | 10 | low 50 | Rondos de 90 segundos x 5 series | 3 |
| 47 | `activacion-con-movilidad-y-pases` | `senior` | `warm-up` | Activación | Activación con movilidad y pases | 8/0 | Franja de activación, 20×15 | 10 | low 45 | Bloques de 2 minutos x 4 series | 2 |
| 48 | `conservacion-6v2-baja-intensidad` | `senior` | `cool-down` | Vuelta a la calma | Conservación 6 contra 2 a baja intensidad | 8/0 | Rectángulo de cierre, 20×15 | 8 | low 40 | Bloques de 3 minutos x 2 series | 2 |
| 49 | `vuelta-a-la-calma-y-analisis` | `senior` | `cool-down` | Vuelta a la calma | Vuelta a la calma y análisis | 8/0 | Círculo de cierre, 10×10 | 6 | low 20 | Bloques de 2 minutos x 3 series | 2 |

All 24 records: `categoryIds` = the single listed category, six are warm-up / four main / twelve cool-down, 2 constraints and 3 coaching cues each, provenance `{ kind: 'original', sourceName: 'Futsal Manager AI', licenseStatus: 'owned' }`, no `attribution`, `status: 'published'`.

### Spanish copy contract (summary, objective, phase ids/titles)

Phase explanations are one Spanish sentence each describing what the ball and referenced players do; constraints state the drill's two limits; cues are three observable coaching points tied to the objective.

- `juego-4v4-dos-porterias` — "Partido 4 contra 4 con dos porterías para buscar el gol tras circular el balón por todo el cuadrado."; "Ocupar los espacios libres y finalizar en la portería contraria con pase o conducción."; phases `circulacion` "Circulación y apoyos" / `finalizacion` "Finalización en portería".
- `conduccion-y-pase-en-cuadrado` — "Conducción por el cuadrado con entrega al compañero libre y cambio de sentido en la recepción."; "Conducir con la cabeza levantada y entregar el balón al compañero mejor perfilado."; phases `conduccion-entrega` "Conducción y entrega" / `recepcion-cambio` "Recepción y cambio de sentido".
- `rondo-libre-3v1` — "Rondo tranquilo de tres contra uno para cerrar la sesión con el balón en el pie."; "Mantener el balón sin prisa y terminar la sesión con sensaciones positivas."; phases `rondo-suave` "Rondo suave" / `cambio-defensor` "Cambio de defensor".
- `vuelta-a-la-calma-con-balon` — "Círculo de pases lentos y movilidad suave para bajar el ritmo al final del entrenamiento."; "Recuperar la calma con pases controlados y movilidad de las articulaciones."; phases `pases-en-circulo` "Pases en círculo" / `movilidad` "Movilidad y respiración".
- `juego-posicion-3v3-apoyos` — "Juego de posición 3 contra 3 con dos apoyos por fuera que sostienen la posesión."; "Conservar el balón con apoyos exteriores y cambiar de orientación cuando el centro se cierra."; phases `posesion-apoyos` "Posesión con apoyos" / `cambio-orientacion` "Cambio de orientación" / `progresion` "Progresión al espacio libre".
- `salida-3v1-desde-portero` — "Salida desde portero con tres jugadores ante la presión de un rival en medio campo."; "Superar al defensor con el pase al hombre libre y ocupar el carril de progresión."; phases `salida-portero` "Portero con balón" / `apoyo-cierre` "Apoyo del cierre" / `progresion-banda` "Progresión por banda".
- `rondo-4v0-control-orientado` — "Rondo sin defensor para cerrar la sesión con control orientado y pases cómodos."; "Terminar con el balón controlado y el cuerpo orientado hacia el compañero."; phases `control-orientado` "Control orientado" / `pase-companero` "Pase al compañero libre".
- `circulacion-suave-y-movilidad` — "Circulación lenta entre compañeros combinada con movilidad de tobillo, rodilla y cadera."; "Bajar la intensidad con circulación tranquila y movilidad articular guiada."; phases `circulacion-lenta` "Circulación lenta" / `movilidad-articular` "Movilidad articular".
- `rondo-5v1-activacion` — "Rondo de activación con cinco jugadores por fuera y un defensor que entra al recuperar."; "Activar el pase y el control orientado con superioridad y ritmo creciente."; phases `rondo-activacion` "Rondo de activación" / `presion-defensor` "Presión del defensor".
- `pase-y-control-en-movimiento` — "Pases entre dos cuadrados con control en movimiento y cambio de cuadrado tras la entrega."; "Recibir en movimiento y orientar el primer toque hacia el espacio libre."; phases `pase-control` "Pase y control" / `movimiento-espacio` "Movimiento al espacio libre".
- `conservacion-suave-4v0` — "Conservación sin oposición para cerrar el entrenamiento con pases tranquilos y cambios de orientación."; "Terminar la sesión conservando el balón a ritmo bajo y con apoyos claros."; phases `conservacion-tranquila` "Conservación tranquila" / `cambio-orientacion` "Cambio de orientación suave".
- `rondo-final-4v1` — "Rondo final de cuatro contra uno con ritmo bajo y cierre con estiramientos."; "Cerrar la sesión con el balón en el pie y el grupo conectado."; phases `rondo-final` "Rondo final" / `cierre-estiramiento` "Cierre y estiramiento".
- `rondo-4v2-activacion` — "Rondo de activación con cuatro jugadores por fuera y dos defensores que presionan juntos."; "Activar la circulación con dos toques y el cambio de orientación ante dos defensores."; phases `rondo-dos-defensores` "Rondo con dos defensores" / `cambio-orientacion` "Cambio de orientación".
- `movilidad-y-pases-largos` — "Activación con movilidad articular y pases largos entre parejas a lo ancho de la pista."; "Preparar tobillos, cadera y hombro mientras se ajusta la precisión del pase largo."; phases `movilidad` "Movilidad articular" / `pase-largo` "Pase largo y control".
- `conservacion-5v2-baja-intensidad` — "Conservación tranquila en superioridad para cerrar la sesión con el balón controlado."; "Bajar el ritmo conservando el balón y manteniendo los apoyos del 5 contra 2."; phases `conservacion-tranquila` "Conservación sin presión" / `cambio-lado` "Cambio de lado".
- `estiramientos-guiados-con-balon` — "Estiramientos guiados con el balón en el pie para cerrar la sesión y recuperar la calma."; "Relajar piernas y tronco con estiramientos suaves y respiración controlada."; phases `estiramiento-balon` "Estiramiento con balón" / `respiracion-cierre` "Respiración y cierre".
- `rondo-4v2-con-salida` — "Rondo de activación que termina en salida al espacio libre cuando se supera a los dos defensores."; "Activar la circulación con dos toques y reconocer el momento de salir del cuadrado."; phases `rondo-activacion` "Rondo de activación" / `salida-cuadrado` "Salida del cuadrado" / `progresion-espacio` "Progresión al espacio libre".
- `activacion-con-duelos-1v1` — "Duelos 1 contra 1 en franjas cortas para activar el cuerpo y la conducción a la línea."; "Activar el cuerpo con duelos cortos y ganar la línea de conducción con el primer apoyo."; phases `duelo-balon` "Duelo por el balón" / `conduccion-linea` "Conducción a la línea".
- `conservacion-6v3-baja-intensidad` — "Conservación en superioridad a ritmo bajo para cerrar la sesión con el grupo junto."; "Bajar la intensidad conservando el balón y cambiando de orientación sin riesgo."; phases `conservacion-tranquila` "Conservación tranquila" / `cambio-orientacion` "Cambio de orientación".
- `rondo-final-y-movilidad` — "Rondo final de baja intensidad combinado con movilidad y respiración para cerrar la sesión."; "Cerrar con el balón en el pie y recuperar la movilidad de tobillo y cadera."; phases `rondo-final` "Rondo final" / `movilidad-respiracion` "Movilidad y respiración".
- `rondo-5v2-activacion` — "Rondo de activación con cinco por fuera y dos defensores que ajustan la presión."; "Activar la circulación con dos toques y el cambio de orientación bajo presión."; phases `rondo-defensores` "Rondo con dos defensores" / `cambio-orientacion` "Cambio de orientación" / `salida-espacio` "Salida al espacio libre".
- `activacion-con-movilidad-y-pases` — "Activación articular combinada con pases y control orientado a ritmo progresivo."; "Preparar el cuerpo y ajustar el control orientado antes de la parte general."; phases `movilidad` "Movilidad articular" / `pases-control` "Pases y control orientado".
- `conservacion-6v2-baja-intensidad` — "Conservación sin presión alta para cerrar la sesión con pases seguros y cambios de lado."; "Recuperar la calma conservando el balón a ritmo bajo y con apoyos amplios."; phases `conservacion-sin-presion` "Conservación sin presión" / `cambio-lado` "Cambio de lado".
- `vuelta-a-la-calma-y-analisis` — "Estiramientos guiados y charla breve de análisis para cerrar la sesión en grupo."; "Relajar el cuerpo y fijar dos ideas del entrenamiento con una charla corta."; phases `estiramiento-guiado` "Estiramiento guiado" / `analisis-cierre` "Análisis y cierre".

### Board Data authoring rules for the 24 new boards

- `schemaVersion: '1.0.0'`, `pitch.format: 'full'`; exactly the planned phase count; `order` = index + 1.
- Tokens: exactly `players.total`, unique lowercase ids, `kind: 'keeper'` count = `players.goalkeepers`, 1–3 character labels (`POR`, `CIE`, `ALA`, `PIV`, `D1`…).
- Every phase positions every token once, `ball` present inside 4–96, arrows with distinct `from`/`to`, labels only where the drill names them.
- Coordinates inside **4–96**; small spaces (8×8 to 20×15) occupy a sub-region of the 2:1 board, never the whole board.
- Cones 0–30, only for squares/goals/gates named in the drill; strict keys only.
- Cool-down boards may use fewer arrows (slow passes) but still need one position per token per phase.

## Library Ordering

Grouping is by session part in the fixed order `warm-up` → `main` → `cool-down`; inside a group the package order is preserved. Pinned grouped order per category (ids):

| category | Calentamiento (2 or 3) | Parte general | Vuelta a la calma |
| --- | --- | --- | --- |
| `prebenjamin` | `conduccion-entre-conos`, `pases-por-parejas` | `juego-3v3-conos-porteria`, `juego-4v4-dos-porterias`, `conduccion-y-pase-en-cuadrado` | `rondo-libre-3v1`, `vuelta-a-la-calma-con-balon` |
| `benjamin` | `rondo-4v1-dos-toques`, `pase-y-va-cambio-orientacion` | `salida-portero-3v2`, `juego-posicion-3v3-apoyos`, `salida-3v1-desde-portero` | `rondo-4v0-control-orientado`, `circulacion-suave-y-movilidad` |
| `alevin` | `rondo-5v1-activacion`, `pase-y-control-en-movimiento` | `conservacion-4v2-carriles`, `reaccion-tras-perdida-3v2`, `ataque-3v2-banda` | `conservacion-suave-4v0`, `rondo-final-4v1` |
| `infantil` | `pase-y-va-carril-central`, `juego-posicion-3-1-pivote` | `salida-3-1-presion-alta`, `presion-tras-perdida`, `ataque-4-0-rotaciones`, `basculacion-rombo-defensivo`, `transicion-3v2-tras-robo` | `circulacion-cierre-ala`, `rondo-4v1-orientacion` |
| `cadete` | `rondo-4v2-activacion`, `movilidad-y-pases-largos` | `salida-3-1-presion-alta`, `juego-posicion-4v4-comodines`, `basculacion-bloque-1-2-1` | `conservacion-5v2-baja-intensidad`, `estiramientos-guiados-con-balon` |
| `juvenil` | `rondo-4v2-con-salida`, `activacion-con-duelos-1v1` | `salida-4v3-con-portero`, `transicion-4v3-tras-robo`, `presion-alta-4v4` | `conservacion-6v3-baja-intensidad`, `rondo-final-y-movilidad` |
| `senior` | `rondo-5v2-activacion`, `activacion-con-movilidad-y-pases` | `salida-3-2-cambio-ala`, `defensa-3-1-presion-cierre`, `transicion-5v4-carril-central` | `conservacion-6v2-baja-intensidad`, `vuelta-a-la-calma-y-analisis` |

Display order is package order filtered by session part, not load order. The earlier version of the Infantil cool-down row listed `rondo-4v1-orientacion` first because it was ordered by ascending load (45 % then 65 %), which contradicted Scenarios 2 and 9; the row above now follows package indices 1 and 3.

Package order (not display order) remains append-only: indices 0–25 unchanged, then 26–29 Prebenjamín, 30–33 Benjamín, 34–37 Alevín, 38–41 Cadete, 42–45 Juvenil, 46–49 Senior, exactly as the seed table. Canonical audit order: the 50 exercise ids in package order, then the seven Programming ids in `CATEGORY_IDS` order (`prebenjamin-u8-base`, `benjamin-u10-base`, `alevin-u12-base`, `infantil-u14-base`, `cadete-u16-base`, `juvenil-u19-base`, `senior-base`).

## UX Grouping

- `category-browse-model.ts` gains:
  - `type SessionPartGroup = { part: SessionPart; label: string; exercises: Exercise[] }`;
  - `groupExercisesBySessionPart(exercises: readonly Exercise[]): SessionPartGroup[]` — always three groups in `SESSION_PARTS` order, preserving input order, empty lists included;
  - `formatSessionPartLabel(part)` → `'Calentamiento'`, `'Parte general'`, `'Vuelta a la calma'`.
- `CategoryBrowseModel` keeps `exercises` (flat, package order, used for the total count) and adds `sessionParts: SessionPartGroup[]` built from the same `listExercises` result — no extra repository call.
- `ExerciseLibraryList` changes its prop from `exercises` to `groups: SessionPartGroup[]`; it keeps the `Biblioteca de ejercicios` header and total count (`formatExerciseCount`, now 7 or 9) and renders, per group, a heading row with `AppText variant="labelLg" color="primary"` and the uppercase Spanish label, plus `AppText variant="labelMd" color="textVariant"` with `formatExerciseCount(group.exercises.length)`. Cards keep `Card` + `headlineSm` title + `bodyMd` summary + `labelMd` meta.
- Empty group: still render the heading and `0 ejercicios`, with muted copy `Sin ejercicios en este tramo.`; the overall empty state (`Todavía no hay ejercicios para esta categoría.`) remains when the category has no exercises.
- `ExploreScreen` passes `browseModel.sessionParts`; the rest of the screen (chips, Programming card, prompt, design-system link) is untouched. No new tokens, colors, fonts, shadows, shared primitives, or route changes.

## Expected Files To Change

| Module / area | Layer | File | Change |
| --- | --- | --- | --- |
| `content` | domain | `src/modules/content/domain/session-part.ts` | **new** `SESSION_PARTS`, `SessionPart` |
| `content` | domain | `src/modules/content/domain/exercise.ts` | add required `sessionPart` |
| `content` | domain | `src/modules/content/domain/programming.ts` | reuse/re-export `SessionPart` |
| `content` | domain | `src/modules/content/domain/content-package.ts` | `1.1.0`, `sessionPart` schema, shared enum |
| `content` | infrastructure | `src/modules/content/infrastructure/content/content-package.json` | insert `sessionPart` in all 26 records, append 24 exercises, `contentVersion` `1.1.0` |
| `content` | presentation | `src/modules/content/presentation/view-models/category-browse-model.ts` | group type, grouper, label formatter, model field |
| `content` | presentation | `src/modules/content/presentation/components/exercise-library-list.tsx` | headings + counts + empty-group copy |
| `content` | presentation | `src/modules/content/presentation/screens/explore-screen.tsx` | pass groups |
| `content` | public API | `src/modules/content/index.ts` | export `SESSION_PARTS`, grouping helpers/types |
| tests | domain | `tests/modules/content/domain/content-package.test.ts` | `1.1.0`, sessionPart cases |
| tests | domain | `tests/modules/content/domain/fixtures/valid-content-package.json` | add `sessionPart` |
| tests | application | `tests/modules/content/application/content-queries.test.ts` | fixture builder gains `sessionPart` |
| tests | presentation | `tests/modules/content/presentation/view-models/category-browse-model.test.ts` | builder + grouping assertions |
| tests | infrastructure | `tests/modules/content/infrastructure/seed-session-structure.test.ts` | **new** session-structure contract |
| tests | infrastructure | `seed-provenance`, `bundled-content-repository`, `seed-infantil-u14`, `seed-remaining-categories` tests | counts/ids/sessionPart/version updates |
| tests | public API | `tests/modules/content/index.test.ts` | new exports |
| docs | — | `docs/content-model.md`, `docs/content-licensing.md`, `ARCHITECTURE.md`, `src/modules/content/README.md`, `docs/domain-model.md`, `docs/technical-discovery.md`, `docs/risks-and-open-questions.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, this spec | catalogues, counts, versions |

**Unchanged:** `src/app/**`, `src/shared/**`, `src/modules/{board,ai,club}/**`, `src/modules/content/{application,domain/ports}/**` (no use-case or port edits), `package.json`, `eslint.config.js`, `init.sh`, `docs/board-data-schema.md`, `docs/content-licensing.md` policy rules, `DESIGN.md`, `docs/build-brief.md`, `docs/specs/*` other than this file.

## Test Plan

Baseline: **184 tests across 160 suites**. Exact content counts that tests must encode: **50 exercises**, **7 Programming records**, **57 records audited**, per-category **7/7/7/9/7/7/7**, session parts **6 categories 2/3/2 + Infantil 2/5/2**, new records **24** (8 warm-up / 4 main / 12 cool-down).

| File | Type | Assertions |
| --- | --- | --- |
| `domain/content-package.test.ts` (update) | node:test | supported version is `1.1.0`; a package whose exercise omits `sessionPart` fails at `exercises.0.sessionPart`; an unknown value (`'activation'`) fails at the same path with the three-value message; existing cases still pass with the fixture updated. |
| `domain/fixtures/valid-content-package.json` (update) | fixture | both exercises carry a valid `sessionPart`; `contentVersion` `1.1.0`. |
| `application/content-queries.test.ts` (update) | node:test | `makeExercise` includes `sessionPart`; existing visibility/filter/dedup behaviour unchanged. |
| `presentation/view-models/category-browse-model.test.ts` (update) | node:test | `groupExercisesBySessionPart` returns three groups in fixed order with Spanish labels and preserves input order; empty part stays as an empty group; Infantil model groups 2/5/2 with the pinned ids; Senior model groups 2/3/2 with the pinned ids; total count formatting `7 ejercicios`/`1 ejercicio`. |
| `infrastructure/seed-session-structure.test.ts` (**new**) | real package | 50 exercises and 57 records; every exercise `sessionPart` is one of the three values; each category's grouped counts and pinned grouped ids match the ordering table; Cadete and Infantil both place `salida-3-1-presion-alta` first in `main`; the 24 new records match the seed table (metadata, parts, copy, 2 constraints, 3 cues, published/original/owned, single category); boards re-parse at `1.0.0` with token/keeper/position/arrow coherence; no Chupetín-stage value. |
| `infrastructure/seed-provenance.test.ts` (update) | real package | 50 exercises, 7 Programming records, 57 canonical ids in order; all `published`/`original`/`owned`/`Futsal Manager AI`; none `reference`; no `attribution`; no inspiration-only domain; every exercise carries a valid `sessionPart`. |
| `infrastructure/bundled-content-repository.test.ts` (update) | real package | unfiltered id array = 50 ids; `>= 50`; per-category counts 7/7/7/9/7/7/7; per-category programming ids unchanged; crossover dedup unchanged; unknown id → `null`. |
| `infrastructure/seed-infantil-u14.test.ts` (update) | real package | total 50; the 9 Infantil ids/order/boards/copy unchanged; Infantil parts 2/5/2 and each value valid; `infantil-u14-base` still `1.1.0`; `CONTENT_PACKAGE_VERSION`/JSON `contentVersion` now `1.1.0`; Board Data still `1.0.0`. |
| `infrastructure/seed-remaining-categories.test.ts` (update) | real package | plans gain `sessionPart`; new 24-record plans; 50-id canonical list; six categories at 7 with 2/3/2; legacy records keep ids/titles/categories/boards (only `sessionPart` inserted); versions updated. |
| `index.test.ts` (update) | structural | public API exports `SESSION_PARTS`, `groupExercisesBySessionPart`, `formatSessionPartLabel`, `SessionPartGroup`. |
| `presentation/composition-wiring.test.ts` (unchanged) | structural | Route/provider wiring stays thin and unchanged. |
| `shared/domain/board-data/**`, `tests/architecture/**` (unchanged) | node:test | Board Data `1.0.0` and boundaries stay green. |

Budget: roughly **+18 to +24 tests** (`seed-session-structure` ~12, view model ~4, package ~2, spread updates ~4), landing near **~202–208 tests**; the implementer records the exact before/after counts and suite totals in the evidence rather than forcing a number.

## Verification Plan

1. Standalone parse before touching tests: `npx tsx` script imports the edited JSON as `unknown`, runs `parseContentPackage`, prints every issue path, asserts 50 exercises / 7 Programming / `contentVersion` `1.1.0`, exits non-zero on failure.
2. `npm test` — all suites green, including the new session-structure contract and the updated audit/repository/Infantil suites.
3. `npm run lint` (boundaries unchanged; no new cross-module edge), `npm run typecheck`, `npm run verify` exit 0 with `expo-doctor` 20/20, `./init.sh` exit 0 and never starts Metro.
3b. `./init.sh` behavior unchanged: non-blocking checks only; it must not start Metro.
4. Invalid-package probes on an in-memory clone (no file edits): delete `sessionPart` from `exercises.26` → expect `exercises.26.sessionPart`; set `exercises.26.sessionPart = 'activation'` → expect the three-value message; set `contentVersion` back to `'1.0.0'` → expect a `contentVersion` issue naming `1.1.0`; confirm the untouched package parses.
5. Read-layer smoke via `tsx`: per category print total count, grouped counts and grouped ids, plus the Programming id/version; assert 7/7/7/9/7/7/7, the pinned grouped order, `infantil-u14-base@1.1.0`, and 50 unique exercises.
6. `npx expo export --platform android` succeeds; search the `.hbc` for new ids (macOS `strings` is ASCII-only, so use a UTF-16LE scan for accented Spanish copy) and for `PARTE GENERAL`/`VUELTA A LA CALMA` if feasible.
7. Device smoke on `SM-M135F` (Android 14, Expo Go 58.0.5, `adb reverse tcp:8081 tcp:8081`): select Infantil → `CALENTAMIENTO` 2, `PARTE GENERAL` 5, `VUELTA A LA CALMA` 2 and all nine titles grouped; select Senior → 2/3/2 with the three main-part titles; select Cadete → `Salida 3-1 ante presión alta` first in `PARTE GENERAL`; confirm no duplicate inside one list; check the four tabs and `/design-system`; 320 dp / `font_scale 1.3` readability; relaunch resets to `Elige una categoría`; `adb logcat` free of React Native errors/fatal exceptions.
8. Persistent E2E: none exists and there is no RN component runner; pure view-model tests, the seed contract, the export and the scripted device smoke are the agreed coverage.
9. Scope scan: `git diff --stat` shows only `content` domain/infrastructure/presentation/public API, mirrored tests, the package, and the named docs; no `ai`, `board`, `club`, `quota`, `src/app` (except no change), `package.json` or `eslint.config.js` change.

## Evidence To Capture

- Standalone parse output and the three probe issue paths/messages; untouched package pass.
- Before/after test and suite counts plus the audit listing 57 records.
- The seven per-category grouped lists with counts and the pinned order.
- `npm run verify` exit code and `expo-doctor` score; `./init.sh` exit code.
- Android bundle size and new ids/copy found in the bundle.
- Device model, grouped headings and counts per scenario, reset behavior, `logcat` status.
- Confirmation that `CONTENT_PACKAGE_VERSION`/`contentVersion` are `1.1.0`, Board Data is `1.0.0`, `infantil-u14-base` is `1.1.0`, and existing ids/titles/categories/boards (other than the inserted `sessionPart`) are unchanged.

## Durable Documentation Impact

- `docs/content-model.md`: **update** — Exercise table gains `sessionPart`; package contract/version `1.1.0`; seed scope 50 + 7 + 57 records with the new package and canonical order; Known Gaps (Infantil 9 with 2/5/2, thumbnail deferred).
- `docs/content-licensing.md`: **update** — source register row and seed audit description move to 50 exercises / 57 records (policy rules unchanged).
- `ARCHITECTURE.md`: **update** — `content` catalogue gains `sessionPart` + grouping and the new package version/counts; no layer, port or dependency change.
- `src/modules/content/README.md`: **update** — domain/contract, infrastructure counts/version, presentation grouping and new public exports.
- `docs/domain-model.md`: **update** — Exercise concept gains `sessionPart` (the session-part vocabulary already exists for Session/Programming); no lifecycle/state change.
- `docs/technical-discovery.md`: **update** — package `contentVersion` `1.1.0` and seed scope are stated there and would otherwise be stale.
- `docs/risks-and-open-questions.md`: **update** — content-volume risk becomes "seven per category, session-shaped", add the Infantil 2/5/2 assignment as a coach-review item, and move "next feature" to `explore-general-screen` while `exercise-preview-board-thumbnail` stays deferred behind `tactics-board-renderer`.
- `AGENTS.md`: **update** — project status, seed counts, package version, Explorar grouping, next ready feature.
- `PROGRESS.md`, `feature_list.json`: **update** — session log, evidence, status `passing` (or accepted after validation), notes naming the deferred thumbnail request.
- `CONSTRAINTS.md`: **not needed** — file does not exist. `docs/build-brief.md`, `docs/board-data-schema.md`, `DESIGN.md`, `CONTEXT.md`: **not needed** — no product, Board Data, visual-direction or vocabulary change beyond the domain-model line.

## Implementation Plan And Tasks

1. Read `docs/content-model.md`, `docs/board-data-schema.md` and the two seed specs; confirm limits and the append-only rule.
2. Add `domain/session-part.ts`, wire `exercise.ts` and `programming.ts`, extend `exerciseSchema`, bump `CONTENT_PACKAGE_VERSION` to `1.1.0`.
3. Edit `content-package.json`: insert `sessionPart` in all 26 existing exercises (after `focus`) using the tagging table, set `contentVersion` `1.1.0`, append the 24 new exercises in seed-table order with Spanish copy and boards.
4. Parse the edited package standalone; fix every issue path before touching tests.
5. Add grouping to the view model, `SessionPartGroup` to the model, render groups in `ExerciseLibraryList`, pass them from `ExploreScreen`, export the new API.
6. Update the domain fixture, content-package tests, content-queries builder and browse view-model tests.
7. Move the seed tests to 50/7/57 and the pinned ids; add `seed-session-structure.test.ts`; update the public-API surface test.
8. Update the durable docs and harness state; tick this spec's tasks.
9. Run the gate, probes, read-layer smoke, Android export and device smoke; record evidence.

- [x] Add `session-part.ts` and the required `sessionPart` field/schema.
- [x] Bump `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` to `1.1.0`; keep Board Data `1.0.0` and `infantil-u14-base` `1.1.0`.
- [x] Tag all 26 existing exercises per the assignment table (no renames, no reordering, no board edits).
- [x] Append the 24 new exercises with pinned metadata, Spanish copy, 2 constraints, 3 cues and valid boards.
- [x] Add the grouping view model, labels, model field and public exports.
- [x] Render the three headings with counts in `ExerciseLibraryList`; keep the rest of Explorar unchanged.
- [x] Update the domain fixture and all affected content/presentation/seed/index tests; add `seed-session-structure.test.ts`.
- [x] Run the standalone parse, probes, gate, read-layer smoke, Android export and `SM-M135F` device smoke; record evidence.
- [x] Update the durable docs and harness state listed above.

## Validator Checklist

- [x] Scope stays inside the `content` module (domain contract, package, presentation grouping, public API), mirrored tests, and named docs; no AI, board rendering, quota, thumbnail, route, dependency or lint-config change.
- [x] `sessionPart` is required on every Exercise and rejects anything outside `warm-up`/`main`/`cool-down` with an `exercises.<i>.sessionPart` path.
- [x] `CONTENT_PACKAGE_VERSION` and JSON `contentVersion` are both `1.1.0`; Board Data is `1.0.0`; `infantil-u14-base` is `1.1.0`.
- [x] Package holds exactly 50 exercises + 7 Programming records; the 24 new ids match this spec in order; the 26 legacy ids/titles/categories/boards/phases are unchanged apart from the inserted `sessionPart`.
- [x] Per-category counts are 7/7/7/9/7/7/7 and parts are 2/3/2 for six categories and 2/5/2 for Infantil, with the pinned grouped order.
- [x] Every new record is `published` `original`/`owned`/`Futsal Manager AI`, single-category, 2 constraints, 3 cues, no `attribution`; audit covers 57 records.
- [x] Every board parses at `1.0.0`, full pitch, planned phases, one position per token per phase, coordinates 4–96, distinct arrows; the 24 new boards have `tokens` = `players.total` with keeper count = `players.goalkeepers`, and the five frozen legacy exceptions (`salida-3-1-presion-alta`, `circulacion-cierre-ala`, `presion-tras-perdida`, `rondo-4v1-orientacion`, `transicion-3v2-tras-robo`) keep their seeded token/keeper counts.
- [x] Explorar shows the three Spanish headings with counts and grouped cards; the selected category, programming card, chips, empty prompt, other tabs and `/design-system` behave as before.
- [x] `npm test`, `npm run lint`, `npm run typecheck`, `npm run verify`, `./init.sh`, Android export and `SM-M135F` smoke pass; probes and the read-layer smoke match this spec.
- [x] Durable docs updated as listed; no stale `1.0.0` package or "three exercises per category" statements remain; task checkboxes ticked.

## Planning-Time Risks

- **Volume/edit risk.** 24 new records plus `sessionPart` inserted into 26 existing records touch most of the JSON. Mitigation: pinned ids/metadata/copy, standalone parse before tests, append-only package order, legacy ids/titles/boards asserted unchanged.
- **Infantil tag judgement.** Keeping nine drills forces 2/5/2 and places `juego-posicion-3-1-pivote` (14 min, medium 75) in warm-up and two low-load drills in cool-down. It is the only assignment that keeps two drills in each end without new content. Mitigation: documented rationale and explicit coach review in Risks; the alternative (2/6/1) is worse for session shape.
- **Five-part test coupling.** The 50-id list and per-category counts are encoded in several suites; a future insertion must update them together. Mitigation: one canonical list in the new session-structure test, package order documented, append-only authoring.
- **Grouping vs package order.** Display order differs from package order for the first time. Mitigation: the grouper preserves input order inside each group and the expected grouped lists are pinned per category.
- **Component regression without RN tests.** No RN component runner exists; heading layout/legibility is only covered by the device smoke. Mitigation: pure view-model tests plus a scripted `SM-M135F` smoke at normal and 320 dp/1.3 font scale.
- **Version drift.** Package `1.1.0` sits next to Board Data `1.0.0` and plan `1.1.0`. Mitigation: three explicit assertions in tests and a docs sentence that distinguishes them.
- **Copy drift.** All 24 records claim `original`/`owned`; author in-house Spanish from the pinned summaries/objectives, never from reference sites. Mitigation: `docs/content-licensing.md` checklist and the seed audit.
- **Small-space geometry.** New cool-down/warm-up drills use 8×8 to 20×15 spaces on the full board; parser-valid but visually unverified until `tactics-board-renderer` and the deferred thumbnail feature. Mitigation: keep geometry in coherent sub-regions; note it for the renderer feature.
- **Surprise scope creep.** The coach also asked for the board drawing per exercise; that is `exercise-preview-board-thumbnail`, deferred. Do not add thumbnails or renderer work here.
