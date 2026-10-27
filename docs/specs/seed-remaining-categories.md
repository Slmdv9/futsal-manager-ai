# Feature Implementation Spec: Seed representative exercises for the remaining categories

## Source Feature

- **id:** `seed-remaining-categories`
- **area:** `content`
- **status:** `accepted`
- **depends_on:** `seed-infantil-u14` (accepted on `feat/seed-infantil-u14`)
- **source:** `feature_list.json`
- **branch:** `feat/seed-remaining-categories` (stacked on `feat/seed-infantil-u14`)
- **spec path:** `docs/specs/seed-remaining-categories.md`

## Goal

Close the Exercise Library so no RFEF category is empty. Today only Infantil U14 is a complete slice (9 exercises + 1 Programming record) and the other six categories have nothing, so any category filter leads to a dead screen and AI grounding has one sixth of the taxonomy. After this feature each of the six remaining categories — Prebenjamín U8, Benjamín U10, Alevín U12, Cadete U16, Juvenil U19 and Senior — is guaranteed at least three published original exercises and one published Programming record, every exercise carries Board Data that parses as `1.0.0`, and the seed audit covers the whole package.

Final package: **26 exercises + 7 Programming records = 33 records**. This is data authoring plus mirrored content tests and docs. No schema, port, use case, screen, board, AI, license, or version change.

## Non-Goals

- Any UI: category filter, explore general/by-category screens, exercise detail, empty states, attribution display.
- Board rendering, phase playback, golden board tests, half-pitch shading.
- AI retrieval, grounding, generation, chat, quota.
- Deepening any category beyond the frozen volume below; Infantil stays the deep slice.
- Cross-category re-tagging (except the existing, untouched `salida-3-1-presion-alta` → `infantil` + `cadete`).
- Changing `contentVersion`/`CONTENT_PACKAGE_VERSION` (`1.0.0`), Board Data `1.0.0`, `ContentProvenance`, `CATEGORY_IDS`, or any JSON key.
- CMD Mora material, `reference`-kind drafts, new provenance kinds, or any new source.
- `init.sh`, `package.json`, `eslint.config.js`, or any `src/**/*.ts` edit.

## Job Story

When I coach any RFEF category from U8 to Senior, I want my category to show a real program and real drills on the board, so the library feels usable today instead of "Infantil only".

## Users And Permissions

- Anonymous coach: reads the seeded categories through the read layer once browsing screens land; no account, no quota impact.
- Content author: edits `src/modules/content/infrastructure/content/content-package.json` only, following `docs/content-licensing.md` and `docs/board-data-schema.md`.
- Validator: inspects the package diff, the updated audit, the new seed test and the docs; re-runs the gate and the probes.

## Acceptance Scenarios

### Scenario 1: No category is empty

Given the bundled content package
When `listExercises(repository, { categoryId })` runs for each of the seven `CATEGORY_IDS`
Then every category returns at least three published exercises, and `getProgramming(repository, categoryId)` returns a published record for each one.

### Scenario 2: The six remaining categories are complete and ordered

Given the bundled package
When exercises are filtered per category
Then the filtered ids are exactly: `prebenjamin` → `conduccion-entre-conos`, `pases-por-parejas`, `juego-3v3-conos-porteria`; `benjamin` → `rondo-4v1-dos-toques`, `pase-y-va-cambio-orientacion`, `salida-portero-3v2`; `alevin` → `conservacion-4v2-carriles`, `reaccion-tras-perdida-3v2`, `ataque-3v2-banda`; `cadete` → `salida-3-1-presion-alta`, `juego-posicion-4v4-comodines`, `basculacion-bloque-1-2-1`; `juvenil` → `salida-4v3-con-portero`, `transicion-4v3-tras-robo`, `presion-alta-4v4`; `senior` → `salida-3-2-cambio-ala`, `defensa-3-1-presion-cierre`, `transicion-5v4-carril-central`.

### Scenario 3: Every new board is valid Board Data

Given each of the 17 new exercises
When its `boardData` is re-parsed with `parseBoardData`
Then it passes at `1.0.0`, uses `pitch.format: 'full'`, has exactly the planned 2–3 phases with `order` = index + 1, defines exactly `players.total` tokens (`keeper` count = `players.goalkeepers`), positions every token in every phase, keeps coordinates within 4–96, and every arrow has distinct `from`/`to`.

### Scenario 4: Every new record carries complete Spanish copy

Given each of the 17 new exercises and 6 new Programming records
When title, summary, focus, objective, work structure, space label, cues, constraints, phase copy and Programming sections are read
Then all are non-empty Spanish text within contract limits, with 2 constraints, 3 coaching cues and the pinned titles/phase titles from this spec, and no placeholder (`todo`, `tbd`, `pendiente`, `xxx`).

### Scenario 5: Every category has its planned Programming record

Given the bundled package
When `getProgramming` runs per category
Then it returns `prebenjamin-u8-base`, `benjamin-u10-base`, `alevin-u12-base`, `infantil-u14-base` (`1.1.0`, unchanged), `cadete-u16-base`, `juvenil-u19-base`, `senior-base`; each new one is published, version `1.0.0`, with a non-empty `formativeStage`/`focus`/`playModel`, `sessionDurationMinutes` inside 20–180 and `max >= min`, exactly 4 key concepts, 3 objectives, warm-up/main/cool-down, and 2 macrocycles × 2 microcycles with `sessionCount >= 1`.

### Scenario 6: Provenance audit covers the whole seed

Given the bundled package
When the seed provenance audit runs
Then it sees 26 exercises and 7 Programming records (33 records), all `published`, `kind: 'original'`, `licenseStatus: 'owned'`, `sourceName` `Futsal Manager AI`, none `reference`, none with `attribution`, and no inspiration-only domain in any `sourceName`.

### Scenario 7: Existing records and contracts are preserved

Given the 9 Infantil records and the 1 Infantil Programming record
When the package is read after the feature
Then `salida-3-1-presion-alta` is still exercise index 0 and byte-identical, the Infantil ids appear in their previous order, `infantil-u14-base` is unchanged at `1.1.0`, `contentVersion`/`CONTENT_PACKAGE_VERSION` stay `1.0.0`, and Board Data stays `1.0.0`.

### Scenario 8: No forbidden stage taxonomy leaks in

Given the seeded package and the seven RFEF categories
When ids, titles, summaries, focuses, category ids and Programming copy are scanned
Then no record, category or filter value contains a Chupetín-style stage, and every `categoryIds` entry is one of the seven RFEF brackets.

### Scenario 9: Invalid seed data and the app still behave

Given an in-memory clone of the shipped package
When a new exercise coordinate is moved outside 0–100 or a token position is deleted
Then `parseContentPackage` fails with `exercises.<i>.boardData...`; and when `npm run verify`, `./init.sh` and the Android device smoke run, they pass with Explorar unchanged.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — stacked-branch workflow, accepted baseline (114 tests / 122 suites), `seed-remaining-categories` minimum scope, next feature `category-filter`.
- `ARCHITECTURE.md`, `src/modules/content/README.md` — content module layers; seed is infrastructure JSON data; catalogue sentence in ARCHITECTURE line ~159.
- `CONTEXT.md`, `docs/domain-model.md`, `docs/build-brief.md` — RFEF brackets, "representative exercises for the rest", no Chupetín, multi-category edge case.
- `docs/content-model.md`, `docs/content-licensing.md` — field limits, package invariants, one published Programming per category, licence gate, source register, seed audit contract.
- `docs/board-data-schema.md` — 2:1 full-pitch coordinates, strict keys, phase/arrow/label limits, one position per token per phase.
- `docs/specs/seed-infantil-u14.md` — volume/append/board-authoring precedent and evidence style.
- `src/modules/content/domain/{category,exercise,programming,content-package}.ts` — exact limits: title 90, summary 240, focus 60, objective 300, space label 60 and 4–60 m, duration 5–120, workStructure 120, constraints ≤6, cues ≤8, players 2–30 / GK 0–4; Programming 4 key concepts / 3 objectives are within 1–8; slug `^[a-z0-9]+(-[a-z0-9]+)*$` ≤60.
- `src/modules/content/infrastructure/content/content-package.json` — 9 exercises (index 0 = `salida-3-1-presion-alta`, the only `cadete` record) + `infantil-u14-base` (`1.1.0`).
- `tests/modules/content/infrastructure/{seed-infantil-u14,seed-provenance,bundled-content-repository}.test.ts` — exact counts/ids that must move, and `listExercises` package-order semantics.
- `tests/modules/content/application/content-queries.test.ts` — fake-repository tests already cover `getProgramming` → `null`, so seeded tests need no empty-category case.
- `docs/risks-and-open-questions.md` — content-volume risk, seed-scope decision, next-feature line.

### Existing Patterns To Follow

- One bundled JSON package, ids lowercase Spanish slugs ≤60, package order is contract, Spanish copy for all content text, English identifiers/tests/docs.
- Full token snapshot per phase, board-level tokens/cones, `pitch.format: 'full'`, optional `curve`/`align`.
- Seed tests import layers directly (public API re-exports a screen), use `node:test` + Given/When/Then, assert real-package behavior.
- Append-only authoring; no mid-array insertion; legacy bytes never reformatted.

### Current Gaps

- Six categories with zero exercises and `null` programming.
- Audit hard-coded to 9 + 1; `bundled-content-repository` hard-codes 9 ids and asserts Cadete/second-category nulls; `seed-infantil-u14` asserts the other categories stay empty — all three must move together.
- No test asserts per-category minimums, board token/keeper coherence, or Chupetín absence.

## Seed Volume Decision

**17 new exercises + 6 new Programming records**, one category block each, appended after the 9 Infantil records. Three exercises per remaining category is the feature minimum and is enough to make a filter meaningful (technique + possession + game/defence shape); it keeps 17 hand-authored boards reviewable in one feature. Infantil remains the only deep slice; going beyond three re-opens every expectation for little MVP value.

**Cadete decision:** the existing `salida-3-1-presion-alta` **counts as one of Cadete's three** exercises — it is published, original/owned, Cadete-tagged, and has 3 valid phases. Append only **two** new Cadete-specific drills after it. Do not re-tag, re-order, reformat, or duplicate it; it stays exercise index 0. Cadete filtered order is legacy first, then the two new records, because `listExercises` preserves package order.

## Planned Seed Table (exercises)

New records are appended in this exact order (package indices 9–25). `players` is `total/GK`; `space` is `label`, `width × length` metres; `work` is the exact Spanish `workStructure` (`Bloques de N minutos x M series`); `ph` is phase count. All tokens = `players.total`.

| # | id | category | focus | title | players | space | min | intensity | work | ph |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | `conduccion-entre-conos` | `prebenjamin` | Conducción | Conducción entre conos | 8/0 | Franja de conducción, 10×20 | 8 | low 45 | Bloques de 3 minutos x 3 series | 2 |
| 11 | `pases-por-parejas` | `prebenjamin` | Pase | Pases por parejas en el cuadrado | 8/0 | Cuadrado de pase, 10×10 | 8 | low 40 | Bloques de 2 minutos x 4 series | 2 |
| 12 | `juego-3v3-conos-porteria` | `prebenjamin` | Juego reducido | Juego 3 contra 3 con conos portería | 6/0 | Cuadrado de juego, 15×15 | 10 | medium 55 | Bloques de 4 minutos x 2 series | 2 |
| 13 | `rondo-4v1-dos-toques` | `benjamin` | Rondo | Rondo 4 contra 1 a dos toques | 5/0 | Cuadrado de rondo, 12×12 | 10 | low 50 | Bloques de 3 minutos x 3 series | 2 |
| 14 | `pase-y-va-cambio-orientacion` | `benjamin` | Pase y va | Pase y va con cambio de orientación | 8/0 | Doble cuadrado, 20×20 | 12 | medium 60 | Bloques de 4 minutos x 3 series | 3 |
| 15 | `salida-portero-3v2` | `benjamin` | Salida de balón | Salida del portero en 3 contra 2 | 6/1 | Medio campo, 20×20 | 12 | medium 65 | Bloques de 3 minutos x 4 series | 3 |
| 16 | `conservacion-4v2-carriles` | `alevin` | Conservación | Conservación 4 contra 2 por carriles | 6/0 | Rectángulo de tres carriles, 20×30 | 12 | medium 60 | Bloques de 4 minutos x 3 series | 2 |
| 17 | `reaccion-tras-perdida-3v2` | `alevin` | Presión tras pérdida | Reacción tras pérdida en 3 contra 2 | 5/0 | Medio campo, 20×20 | 12 | high 75 | Bloques de 3 minutos x 4 series | 3 |
| 18 | `ataque-3v2-banda` | `alevin` | Ataque 3v2 | Ataque 3 contra 2 por banda | 6/1 | Medio campo, 20×25 | 14 | medium 70 | Bloques de 4 minutos x 3 series | 3 |
| 19 | `juego-posicion-4v4-comodines` | `cadete` | Juego de posición | Juego de posición 4 contra 4 con comodines | 10/0 | Pista completa, 20×40 | 16 | medium 75 | Bloques de 4 minutos x 4 series | 3 |
| 20 | `basculacion-bloque-1-2-1` | `cadete` | Bloque defensivo | Basculación del bloque 1-2-1 | 10/2 | Pista completa, 20×40 | 18 | medium 70 | Bloques de 4 minutos x 4 series | 3 |
| 21 | `salida-4v3-con-portero` | `juvenil` | Salida de presión | Salida de presión 4 más portero contra 3 | 9/2 | Pista completa, 20×40 | 18 | high 80 | Bloques de 4 minutos x 4 series | 3 |
| 22 | `transicion-4v3-tras-robo` | `juvenil` | Transición | Transición 4 contra 3 tras robo | 7/0 | Medio campo, 20×25 | 16 | high 85 | Bloques de 3 minutos x 4 series | 2 |
| 23 | `presion-alta-4v4` | `juvenil` | Presión alta | Presión alta 4 contra 4 | 10/2 | Pista completa, 20×40 | 18 | high 85 | Bloques de 4 minutos x 4 series | 3 |
| 24 | `salida-3-2-cambio-ala` | `senior` | Salida de presión | Salida 3-2 con cambio de ala | 10/2 | Pista completa, 20×40 | 20 | high 85 | Bloques de 4 minutos x 4 series | 3 |
| 25 | `defensa-3-1-presion-cierre` | `senior` | Defensa en zona | Defensa 3-1 en zona con presión al cierre | 10/2 | Pista completa, 20×40 | 18 | medium 75 | Bloques de 4 minutos x 4 series | 3 |
| 26 | `transicion-5v4-carril-central` | `senior` | Transición | Transición 5 contra 4 por el carril central | 9/0 | Pista completa, 20×40 | 18 | high 90 | Bloques de 4 minutos x 4 series | 2 |

All 17 records: `categoryIds` = the single listed category, `status: 'published'`, provenance `{ kind: 'original', sourceName: 'Futsal Manager AI', licenseStatus: 'owned' }`, no `attribution`, exactly 2 constraints and 3 coaching cues.

**Canonical audit order (33 ids).** Exercises in package order: `salida-3-1-presion-alta`, `circulacion-cierre-ala`, `presion-tras-perdida`, `rondo-4v1-orientacion`, `pase-y-va-carril-central`, `juego-posicion-3-1-pivote`, `ataque-4-0-rotaciones`, `basculacion-rombo-defensivo`, `transicion-3v2-tras-robo`, `conduccion-entre-conos`, `pases-por-parejas`, `juego-3v3-conos-porteria`, `rondo-4v1-dos-toques`, `pase-y-va-cambio-orientacion`, `salida-portero-3v2`, `conservacion-4v2-carriles`, `reaccion-tras-perdida-3v2`, `ataque-3v2-banda`, `juego-posicion-4v4-comodines`, `basculacion-bloque-1-2-1`, `salida-4v3-con-portero`, `transicion-4v3-tras-robo`, `presion-alta-4v4`, `salida-3-2-cambio-ala`, `defensa-3-1-presion-cierre`, `transicion-5v4-carril-central`; then Programming in `CATEGORY_IDS` order: `prebenjamin-u8-base`, `benjamin-u10-base`, `alevin-u12-base`, `infantil-u14-base`, `cadete-u16-base`, `juvenil-u19-base`, `senior-base`.

## Spanish Copy Contract (summary, objective, phases)

Each entry pins `summary`, `objective` and phase `id`/`title`; every phase `explanation` is one Spanish sentence describing what the ball and the referenced players do in that phase. Constraints encode the drill's two stated limits; cues name three observable coaching points tied to the objective.

- `conduccion-entre-conos` — summary "Circuito de conducción con cambios de dirección entre conos, ida y vuelta por parejas."; objective "Conducir el balón con las dos piernas y cambiar de dirección sin perder el control."; phases `ida` "Ida entre conos" / `vuelta` "Vuelta con cambio de pie".
- `pases-por-parejas` — summary "Parejas en los lados del cuadrado se pasan el balón y cambian de lado tras cada entrega."; objective "Golpear el balón con el interior del pie y orientar el control hacia el compañero."; phases `pase-control` "Pase y control" / `cambio-lado` "Cambio de lado".
- `juego-3v3-conos-porteria` — summary "Partido 3 contra 3 en espacio reducido con dos conos portería por equipo."; objective "Buscar la portería contraria con conducción y pase corto sin perder el balón."; phases `conservacion` "Conservación y búsqueda" / `gol-cono` "Gol en el cono portería".
- `rondo-4v1-dos-toques` — summary "Rondo 4 contra 1 con límite de dos toques donde el defensor entra al recuperar el balón."; objective "Mantener el balón con control orientado y ocupar los apoyos del cuadrado."; phases `rondo` "Rondo con dos toques" / `cambio-defensor` "Cambio de defensor".
- `pase-y-va-cambio-orientacion` — summary "Pase y va por parejas que cambian de cuadrado tras cada entrega para liberar el carril."; objective "Pasar y desmarcarse al espacio libre con perfil abierto y buen timing de la entrega."; phases `pase-desmarque` "Pase y desmarque" / `recepcion` "Recepción en el cuadrado contrario" / `cambio-orientacion` "Cambio de orientación".
- `salida-portero-3v2` — summary "Salida desde portero con tres jugadores ante la presión de dos rivales en medio campo."; objective "Superar la primera presión con pase al hombre libre y ocupar los tres carriles."; phases `salida` "Portero con balón" / `hombre-libre` "Pase al hombre libre" / `progresion` "Progresión por el carril libre".
- `conservacion-4v2-carriles` — summary "Conservación 4 contra 2 en un rectángulo de tres carriles con punto extra al cambiar de carril."; objective "Conservar el balón cambiando de orientación para encontrar el carril libre."; phases `posesion-carril` "Posesión en el carril" / `cambio-carril` "Cambio de carril".
- `reaccion-tras-perdida-3v2` — summary "Tras la pérdida, tres jugadores presionan al portador y cierran la salida en cinco segundos."; objective "Reaccionar juntos tras la pérdida y cerrar la salida del rival por el centro."; phases `perdida` "Pérdida del balón" / `presion-portador` "Presión al portador" / `recuperacion` "Recuperación o repliegue".
- `ataque-3v2-banda` — summary "Ataque 3 contra 2 por banda con llegada del segundo hombre al área."; objective "Finalizar el 3 contra 2 por banda con remate o pase atrás."; phases `conduccion-banda` "Conducción por banda" / `fijacion` "Fijación del defensor" / `pase-atras` "Pase atrás y remate".
- `juego-posicion-4v4-comodines` — summary "Juego de posición 4 contra 4 con dos comodines que juegan con el equipo en posesión."; objective "Sostener la posesión con apoyos interiores y cambio de orientación ante presión media."; phases `posesion-comodines` "Posesión con comodines" / `cambio-orientacion` "Cambio de orientación" / `progresion-carril` "Progresión al carril libre".
- `basculacion-bloque-1-2-1` — summary "Bloque 1-2-1 que bascula con el balón y cierra el pasillo central ante el cambio de orientación."; objective "Basculación del bloque 1-2-1 con coberturas y cierre del pasillo central."; phases `bloque-orientado` "Bloque orientado al balón" / `basculacion` "Basculación al lado contrario" / `cierre-central` "Cierre del pasillo central".
- `salida-4v3-con-portero` — summary "Salida en 4 con portero ante la presión de tres rivales que defienden la primera línea."; objective "Fijar la presión rival y liberar el carril opuesto con el pase del cierre."; phases `salida-portero` "Salida desde portero" / `fijacion-derecha` "Fijación por el carril derecho" / `pase-opuesto` "Pase al carril opuesto".
- `transicion-4v3-tras-robo` — summary "Tras el robo en medio campo, cuatro jugadores atacan en transición contra tres defensores."; objective "Atacar el espacio antes de que el rival reorganice su línea defensiva."; phases `robo` "Robo y primer pase" / `ataque-espacio` "Ataque del espacio".
- `presion-alta-4v4` — summary "Presión alta coordinada en 4 contra 4 con referencia al pasillo y salto del hombre del balón."; objective "Presionar alto en 4 contra 4 sin romper la línea defensiva."; phases `orientacion-presion` "Orientación de la presión" / `salto-pasillo` "Salto al pasillo" / `robo-transicion` "Robo y transición".
- `salida-3-2-cambio-ala` — summary "Salida 3-2 que fija la presión por un carril y cambia de ala para progresar."; objective "Superar la presión con la salida 3-2 y el cambio de ala al jugador libre."; phases `salida-3-2` "Salida 3-2" / `fijacion-carril` "Fijación del carril fuerte" / `cambio-ala` "Cambio de ala".
- `defensa-3-1-presion-cierre` — summary "Defensa 3-1 en zona que presiona al cierre rival y cierra el carril central."; objective "Defender en 3-1 en zona cerrando al cierre rival y el pasillo central."; phases `bloque-3-1` "Bloque 3-1" / `presion-cierre` "Presión al cierre" / `cierre-centro` "Cierre del centro".
- `transicion-5v4-carril-central` — summary "Transición de cinco jugadores por el carril central tras recuperar el balón en campo propio."; objective "Finalizar la transición 5 contra 4 por el carril central antes del repliegue."; phases `recuperacion-salida` "Recuperación y salida" / `finalizacion-centro` "Finalización por el centro".

## Programming Plan

Six new published records appended after `infantil-u14-base`, each `version: '1.0.0'`, provenance `original`/`owned`/`Futsal Manager AI`, exactly 4 `keyConcepts`, 3 `objectives`, 3 session parts (warm-up/main/cool-down), and 2 macrocycles × 2 microcycles. Microcycle ids `microciclo-1`/`microciclo-2` per macrocycle, `sessionCount` as pinned.

| category | id | duration | formativeStage | focus | playModel |
| --- | --- | --- | --- | --- | --- |
| `prebenjamin` | `prebenjamin-u8-base` | 45–60 | Etapa de iniciación motriz y familiarización con el balón | Foco Metodológico Prebenjamín | Juego guiado con conducción, pase y partidos reducidos, sin especialización por puestos. |
| `benjamin` | `benjamin-u10-base` | 50–65 | Etapa de iniciación táctica con apoyos y desmarques | Foco Metodológico Benjamín | Posesión guiada en espacios reducidos con pase y va, apoyos constantes y salida desde portero. |
| `alevin` | `alevin-u12-base` | 55–70 | Etapa de desarrollo táctico colectivo con superioridades | Foco Metodológico Alevín | Conservación y presión organizada en medio campo con transición inmediata y ataque por banda. |
| `cadete` | `cadete-u16-base` | 65–80 | Etapa de especialización táctica y consolidación del modelo | Foco Metodológico Cadete | Juego de posición 4-4 con comodines, basculación del bloque 1-2-1 y salida de presión 3-1. |
| `juvenil` | `juvenil-u19-base` | 70–85 | Etapa de rendimiento táctico y autonomía competitiva | Foco Metodológico Juvenil | Presión alta coordinada, salida de presión en cuatro y transición vertical de cuatro jugadores. |
| `senior` | `senior-base` | 75–90 | Etapa de rendimiento y gestión del modelo de juego | Foco Metodológico Senior | Salida 3-2 con cambio de ala, defensa 3-1 en zona y transición de cinco jugadores por el centro. |

Key concepts / objectives / macrocycles (macrocycle labels `Macrociclo N · <period>`, session counts per microcycle):

- `prebenjamin-u8-base` — concepts "Conducción con ambas piernas", "Control con la planta del pie", "Pase con el interior del pie", "Ocupación de espacios libres"; objectives "Conducir el balón con seguridad en espacios reducidos", "Pasar y recibir con el interior del pie a un compañero", "Resolver el 3 contra 3 buscando la portería contraria"; structure titles "Juego de activación con balón", "Circuito de conducción y juego reducido", "Estiramientos y juego tranquilo"; macro 1 "Conducción y control" (micros "Conducción en espacios reducidos" 3, "Pase y control orientado" 3), macro 2 "Juego reducido" (micros "Juego 3 contra 3" 3, "Progresión al 4 contra 4" 3).
- `benjamin-u10-base` — concepts "Control orientado antes del pase", "Desmarque de apoyo al lado del balón", "Pase y va al espacio libre", "Salida desde portero en tres carriles"; objectives "Mantener el balón en superioridad con dos toques", "Pasar y desmarcarse para ocupar el espacio libre", "Iniciar la salida desde portero con el hombre libre"; titles "Rondo de activación", "Bloques de pase y va con salida", "Estiramientos y preguntas"; macro 1 "Rondo, pase y va" (micros "Rondo y control orientado" 3, "Pase y va con cambio de orientación" 3), macro 2 "Salida desde portero y juego" (micros "Salida del portero en 3 contra 2" 3, "Juego reducido con porteros" 3).
- `alevin-u12-base` — concepts "Cambio de orientación para liberar el carril", "Presión coordinada tras la pérdida", "Ataque por banda con llegada del segundo hombre", "Repliegue ordenado a la línea del balón"; objectives "Conservar el balón en superioridad cambiando de carril", "Recuperar el balón en cinco segundos tras la pérdida", "Finalizar el 3 contra 2 por banda con remate o pase atrás"; structure titles "Rondo y movilidad", "Bloques de conservación, presión y ataque por banda", "Estiramientos y análisis"; macro 1 "Conservación y presión tras pérdida" (micros "Conservación por carriles" 4, "Reacción tras pérdida" 4), macro 2 "Ataque por banda y repliegue" (micros "Ataque 3 contra 2 por banda" 4, "Repliegue y equilibrio" 4).
- `cadete-u16-base` — concepts "Superioridad en el juego de posición", "Basculación del bloque 1-2-1", "Cierre del pasillo central", "Fijación del cierre rival en la salida 3-1"; objectives "Sostener la posesión en 4 contra 4 con comodines", "Bascular el bloque 1-2-1 con coberturas", "Superar la primera presión con la salida 3-1"; structure titles "Rondo y activación", "Juego de posición y bloque defensivo", "Estiramientos y preguntas"; macro 1 "Juego de posición y salida 3-1" (micros "Juego de posición 4 contra 4" 4, "Salida 3-1 ante presión alta" 4), macro 2 "Bloque defensivo y repaso del modelo" (micros "Basculación del bloque 1-2-1" 4, "Repaso de salida y juego de posición" 4).
- `juvenil-u19-base` — concepts "Salida en cuatro con portero", "Presión alta con referencia al pasillo", "Transición vertical de cuatro jugadores", "Cambio de orientación para atacar el carril opuesto"; objectives "Superar la primera línea con la salida en cuatro", "Presionar alto en 4 contra 4 sin romper la línea", "Atacar en transición antes de que el rival reorganice"; structure titles "Activación con rondo", "Salida, presión alta y transición", "Estiramientos y análisis táctico"; macro 1 "Salida de presión y presión alta" (micros "Salida 4 más portero contra 3" 4, "Presión alta 4 contra 4" 4), macro 2 "Transición y competitividad" (micros "Transición 4 contra 3 tras robo" 4, "Repaso del modelo y partido condicionado" 4).
- `senior-base` — concepts "Cambio de ala en la salida 3-2", "Presión al cierre en la defensa 3-1", "Transición de cinco jugadores por el carril central", "Cierre del pasillo central en zona"; objectives "Superar la presión con la salida 3-2 y el cambio de ala", "Defender en 3-1 en zona cerrando al cierre rival", "Finalizar la transición 5 contra 4 por el carril central"; structure titles "Activación con rondo y movilidad", "Salida, defensa en zona y transición", "Vuelta a la calma y análisis"; macro 1 "Salida 3-2 y defensa en zona" (micros "Salida 3-2 con cambio de ala" 4, "Defensa 3-1 en zona" 4), macro 2 "Transición y ritmo competitivo" (micros "Transición 5 contra 4" 4, "Repaso del modelo y ritmo de partido" 4).

Descriptions of each session part are Spanish and state the part's duration consistent with the record's `sessionDurationMinutes`. Programming order in JSON: prebenjamin, benjamin, alevin, cadete, juvenil, senior appended after `infantil-u14-base`.

## Board Data Authoring Rules

- `schemaVersion: '1.0.0'`, `pitch.format: 'full'` on all 17 new boards (half-pitch shading is unpinned).
- Tokens: exactly `players.total`, ids lowercase slugs unique per board, `kind: 'keeper'` count = `players.goalkeepers`, labels 1–3 non-space characters (`POR`, `CIE`, `ALA`, `PIV`, `D1`…).
- Phases: exactly the planned 2–3, array order = `order` 1..n, phase ids lowercase slugs unique per board, titles ≤60, explanations ≤500 Spanish.
- Every phase positions every token exactly once; no stray/unknown `tokenId`; `ball` present and inside 4–96.
- Coordinates inside **4–96** on both axes; keep the drill inside the region implied by `space.label` (small spaces occupy a sub-region of the full 2:1 pitch, never the whole board).
- Arrows ≤30 per phase, `from`/`to` at least 0.1 apart, ids unique per phase, `curve` only when it clarifies the path; labels ≤12 per phase, ids unique per phase.
- Cones 0–30 per board, only where the drill names them (square corners, goals, gates).
- Strict keys only: no extra properties anywhere.

## Technical Approach

1. **Data only.** Edit `content-package.json`: append the 17 exercises after index 8 in the table order and the 6 Programming records after `infantil-u14-base`. Do not touch the 9 existing exercises or `infantil-u14-base` one byte; no reformatting of existing blocks.
2. **Frozen ids and metadata** come from this spec; the implementation copies ids, categories, players, space, duration, intensity, work structure, titles, summaries, objectives and phase titles verbatim. No new categories, kinds, tags or fields.
3. **Validate before touching tests.** Parse the edited JSON standalone with a one-off `npx tsx` script that imports the JSON as `unknown`, runs `parseContentPackage`, prints every issue path, and exits non-zero on failure. Fix all issues first.
4. **Move the existing expectations.** Update `seed-provenance.test.ts`, `bundled-content-repository.test.ts` and `seed-infantil-u14.test.ts` for the new totals and id lists, deleting only the assertions this spec makes false (the empty-category block and the seeded Cadete/Senior `null` Programming expects; the `null` case remains covered with fake repositories in `tests/modules/content/application/content-queries.test.ts`).
5. **Add the new seed contract test, then docs and harness state.** `seed-remaining-categories.test.ts` owns the canonical 26-id list and the per-category contract; docs and `feature_list.json`/`PROGRESS.md` record the new seed scope and evidence.

## Expected Files To Change

- `src/modules/content/infrastructure/content/content-package.json` — append 17 exercises + 6 Programming records; `contentVersion` stays `1.0.0`.
- `tests/modules/content/infrastructure/seed-remaining-categories.test.ts` — **new** seed contract test (Scenarios 1–8).
- `tests/modules/content/infrastructure/seed-provenance.test.ts` — 33 records, canonical id list.
- `tests/modules/content/infrastructure/bundled-content-repository.test.ts` — 26-id array, `>= 26`, Cadete's 3 ids, programming per category.
- `tests/modules/content/infrastructure/seed-infantil-u14.test.ts` — total count 26; drop the obsolete empty-category block.
- Docs: `docs/content-model.md`, `docs/content-licensing.md`, `ARCHITECTURE.md`, `src/modules/content/README.md`, `docs/risks-and-open-questions.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, this spec.
- **Unchanged:** all `src/**/*.ts`, `src/app/**`, `eslint.config.js`, `init.sh`, `package.json`, `docs/board-data-schema.md`, `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md`, `docs/build-brief.md`.

## Visual Design Impact

- UI involved: no. No route, screen, component, token or copy surface changes; `DESIGN.md` is unaffected and Board Data is not yet rendered.
- Device check is a regression smoke only: Explorar must still render `LA BIBLIOTECA LLEGA EN LA SIGUIENTE FASE` with a clean `logcat`.

## Durable Documentation Impact

- `ARCHITECTURE.md`: update — the `content` catalogue sentence now describes 26 exercises across all seven categories with 7 Programming records; no layer/port/dependency change.
- `CONSTRAINTS.md`: not needed — the file does not exist.
- `AGENTS.md`: update — project status (all seven categories seeded), seed audit count, next ready feature `category-filter`.
- `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md`, `docs/build-brief.md`: not needed — no visual, vocabulary, relationship or product change.
- Other: `docs/content-model.md` (seed scope/package order/Known Gaps), `docs/content-licensing.md` (source register count, audit description), `docs/risks-and-open-questions.md` (volume risk + next feature), `src/modules/content/README.md`, `PROGRESS.md`, `feature_list.json`.

## Implementation Plan

1. Re-read the limits and the Infantil spec's board conventions; sketch each new board's phases from the planned tokens.
2. Append the 17 exercises (metadata + Spanish copy + Board Data) in table order; append the 6 Programming records.
3. Parse the edited package standalone; fix every issue path before editing tests.
4. Move the audit to 26 exercises + 7 Programming records and the canonical 33-id list.
5. Update the repository and Infantil tests for the new totals; remove the obsolete empty-category assertions.
6. Add `seed-remaining-categories.test.ts` for Scenarios 1–8.
7. Update the durable docs and harness state; tick this spec's tasks.
8. Run the gate, read-layer smoke, invalid-package probes, Android export and device smoke; record evidence.

## Implementation Tasks

- [x] Add the 3 Prebenjamín exercises with 2-phase boards.
- [x] Add the 3 Benjamín exercises with 2–3-phase boards.
- [x] Add the 3 Alevín exercises with 2–3-phase boards.
- [x] Add the 2 new Cadete exercises with 3-phase boards, leaving `salida-3-1-presion-alta` first and byte-identical.
- [x] Add the 3 Juvenil exercises with 2–3-phase boards.
- [x] Add the 3 Senior exercises with 2–3-phase boards.
- [x] Append the 6 Programming records (`version` `1.0.0`) with the pinned sections and macrocycles.
- [x] Verify every new record is published, `original`/`owned`/`Futsal Manager AI`, single planned category, 2 constraints, 3 cues, no `attribution`.
- [x] Update `seed-provenance.test.ts` to 26 + 7 and the canonical 33-id list.
- [x] Update `bundled-content-repository.test.ts` and `seed-infantil-u14.test.ts` for 26 exercises and the non-empty categories.
- [x] Add `seed-remaining-categories.test.ts`.
- [x] Update `docs/content-model.md`, `docs/content-licensing.md`, `ARCHITECTURE.md`, `src/modules/content/README.md`, `docs/risks-and-open-questions.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`.
- [x] Run the gate, probes, Android export, device smoke; record evidence.

## Test Plan

| File | Type | Assertions |
| --- | --- | --- |
| `infrastructure/seed-remaining-categories.test.ts` (new) | real package | each of the 7 categories returns ≥3 exercises and non-null programming; the six filtered id lists are exactly Scenario 2's; 26 exercises, unique ids, every new record published and single-tagged as planned; each new record's focus/players/space/duration/intensity/work/phases match the table; boards re-parse at `1.0.0`, full pitch, ordered phases, tokens = `players.total`, keeper tokens = `players.goalkeepers`, one position per token per phase, coordinates 4–96; 2 constraints, 3 cues, Spanish copy non-empty on every field and phase; 6 new Programming records with pinned ids/version 4/3/3/2×2 shape; Cadete order legacy-first and legacy phases 3; no `chupetin`/`chupetín` in any id or copy and every category id is RFEF; `contentVersion` `1.0.0`. |
| `infrastructure/seed-provenance.test.ts` (update) | real package | 26 exercises, 7 Programming records, 33 canonical ids in order (exercises in package order, programming in `CATEGORY_IDS` order); all `published`/`original`/`owned`/`Futsal Manager AI`; none `reference`; none with `attribution`; no inspiration-only domain. |
| `infrastructure/bundled-content-repository.test.ts` (update) | real package | `>= 26`; unfiltered id array = 26 ids; Cadete filtered list = 3 ids with the legacy first; each category returns its planned programming id; crossover dedup unchanged; unknown exercise id → `null`. |
| `infrastructure/seed-infantil-u14.test.ts` (update) | real package | total exercise count 26; the 9 Infantil ids/order/focuses, board validity, copy, `infantil-u14-base` `1.1.0`, legacy preservation and version assertions stay; the empty-category block is deleted (covered by the new test and by the application null case). |
| `domain/content-package.test.ts`, `application/content-queries.test.ts`, `index.test.ts` | unchanged | Still green; no contract, export, or use-case change. |

Expect roughly 25–40 new tests. Record exact before/after counts (baseline 114/114 across 122 suites); do not pin a number in this spec.

## Verification Plan

- `npm test` — all suites green, including the updated audit and the new seed test.
- `npm run lint` — no boundary change (no TS edits); `npm run typecheck`; `npm run verify` exit 0 with `expo-doctor` 20/20; `./init.sh` exit 0 and never starts Metro.
- Read-layer smoke via `tsx`: per category print exercise count + ids and programming id/version; assert 7/7 non-empty, Cadete shows the legacy first, total 26.
- In-memory probes on the shipped package: set `exercises.9.boardData.phases.0.positions.0.x` to `140` → expect an `exercises.9.boardData.phases.0.positions.0.x` range issue; delete one position from `exercises.9.boardData.phases.1.positions` → expect the missing-position path; confirm the untouched package still parses and no file is edited.
- Legacy byte-identity: compare `JSON.stringify` of each of the first 9 exercises and of `programming[0]` against the same records parsed from `git show feat/seed-infantil-u14:src/modules/content/infrastructure/content/content-package.json`; all 10 must match exactly and index 0 must still be `salida-3-1-presion-alta`.
- `npx expo export --platform android` succeeds; `strings` on the bundle finds several new ids and the six new Programming ids.
- Device smoke (`SM-M135F`, Expo Go 58.0.5): app boots, Explorar shows the unchanged placeholder, four tabs present, `adb logcat` free of React Native errors.
- Persistent E2E: none exists; this feature changes no route, screen, or API and is fully covered by package/read-layer tests plus probes and the device smoke.
- `init.sh` behavior unchanged: non-blocking checks only.

## Evidence To Capture

- Test/suite counts before and after, plus the audit output listing all 33 records.
- The seven per-category id lists with counts, and the six new Programming ids/versions/macrocycle shapes.
- `npm run verify` exit code and `expo-doctor` score; `./init.sh` exit code.
- Both probe issue paths/messages and the untouched-package pass.
- Confirmation that `contentVersion`, `CONTENT_PACKAGE_VERSION`, Board Data and `ContentProvenance` remain unchanged, and that `salida-3-1-presion-alta` is still index 0 and identical.
- Android export size and the new ids found in the bundle; device model, Explorar smoke result, `logcat` status.

## Evidence Interpretation Note

`feature_list.json` says "open each of the seven categories and confirm at least one exercise and one programming record exist". No browsing screen exists in this feature, so this is evidenced **structurally through the read layer** (per-category `listExercises`/`getProgramming` results), with the device smoke proving the app still boots. Screen-level confirmation belongs to `explore-by-category-screen`.

## Validator Checklist

- [x] Scope stays inside the bundled JSON, mirrored content tests and named docs; no TS, schema, port, export, UI, board, AI, or version change.
- [x] Package holds exactly 26 exercises + 7 Programming records; the 17 new ids match this spec in order; the 10 legacy records are byte-identical.
- [x] Cadete has exactly 3 exercises with the legacy record first and unchanged; it counts as one of the three.
- [x] Every new board parses at `1.0.0`, full pitch, planned phases, tokens = players, one position per token per phase, coordinates 4–96, arrows distinct.
- [x] Every new record is published `original`/`owned`/`Futsal Manager AI`, single planned category, 2 constraints, 3 cues, no `attribution`.
- [x] All seven categories have ≥3 exercises and a published Programming record with the planned id/shape.
- [x] No Chupetín-style stage or non-RFEF category id appears anywhere.
- [x] `contentVersion`/`CONTENT_PACKAGE_VERSION` and Board Data remain `1.0.0`; `infantil-u14-base` stays `1.1.0`.
- [x] Seed audit, repository and Infantil tests updated consistently; new seed test covers Scenarios 1–8.
- [x] `npm run verify`, `./init.sh`, Android export and Explorar device smoke pass; evidence recorded in `feature_list.json` and `PROGRESS.md`.
- [x] Durable docs updated as listed; task checkboxes ticked.

## Planning-Time Risks

- **Volume/edit risk.** 23 new records add roughly 1,200 JSON lines; hand-authored coordinates can be structurally valid but visually odd. Mitigation: fixed ids/metadata/phases here, coordinates 4–96, parser probes before tests, legibility deferred to `tactics-board-renderer`.
- **Small-space drills on a full pitch.** Prebenjamín/Benjamín spaces (10×10 to 20×20) must occupy a sub-region of the 2:1 board without touching the edges. Mitigation: `pitch.format: 'full'` plus `space.label` carrying the real area; keep tokens inside a coherent region.
- **Age-appropriateness is coaching judgement.** U8 without specialist keepers and 8–10 minute drills vs Senior 18–20 minute high-intensity blocks could still be wrong. Mitigation: planned loads are explicit; flag coach review in the evidence.
- **Exact-list coupling.** Three test files now encode 26 ids; any future insertion breaks them. Mitigation: one canonical list in the new seed test, package order documented in `docs/content-model.md`, and append-only authoring.
- **Audit ordering trap.** Exercises follow package order but Programming is read in `CATEGORY_IDS` order (prebenjamin, benjamin, alevin, infantil, cadete, juvenil, senior). Mitigation: the canonical 33-id list in this spec is the expected audit order.
- **Legacy Cadete ambiguity.** Re-tagging, reformatting or moving `salida-3-1-presion-alta` would violate Scenario 7. Mitigation: it counts toward Cadete's minimum; append only two new Cadete drills.
- **Cross-tag creep.** Adding a second category to a new exercise would duplicate it in filters and break the exact per-category lists. Mitigation: single-category new records; the only crossover stays the legacy record.
- **Copy drift into non-original material.** All 23 records claim `original`/`owned`. Mitigation: in-house Spanish authorship from the methodology themes, no reference-site copy, `docs/content-licensing.md` checklist.
- **Id collisions.** 17 new slugs must be globally unique and ≤60 characters. Mitigation: ids frozen here; parser rejects duplicates, tests assert the exact set.

## Implementation Notes

Recorded by the implementer on 2026-10-27.

- **Delivered.** 17 exercises appended at package indices 9–25 and 6 Programming records appended after `infantil-u14-base`; package now holds 26 exercises + 7 Programming records. The 9 Infantil exercises and `programming[0]` are byte-identical to `feat/seed-infantil-u14`, and index 0 is still `salida-3-1-presion-alta`.
- **Test volume.** `seed-remaining-categories.test.ts` yields **56 tests across 10 suites**, above this spec's rough 25–40 estimate, because the board/copy contract runs per exercise and per category. Totals moved from 114 tests / 122 suites to **170 tests / 131 suites**.
- **Programming JSON order.** Records are appended after the existing one, so package order is `infantil-u14-base`, `prebenjamin-u8-base`, `benjamin-u10-base`, `alevin-u12-base`, `cadete-u16-base`, `juvenil-u19-base`, `senior-base`. The audit still asserts `CATEGORY_IDS` order, as pinned.
- **Per-category sum.** The seven filtered lists total 27 exercises, not 26, because `salida-3-1-presion-alta` is `infantil` + `cadete`; the library itself stays 26 and no new record is multi-tagged.
- **One authoring fix.** An arrow id was authored as `perdida-balón` and rejected by the parser slug rule; it was corrected to `perdida-balon` before tests were touched.
- **Not done, by design.** No `src/**/*.ts`, route, schema, port, use-case, UI, board, AI, `init.sh`, `package.json` or `eslint.config.js` change; no version bump; no CMD Mora or `reference` content.

