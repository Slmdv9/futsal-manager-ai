# Feature Implementation Spec: Seed Infantil U14 exercises and programming

## Source Feature

- **id:** `seed-infantil-u14`
- **area:** `content`
- **status:** `accepted`
- **depends_on:** `content-model-and-store` (accepted), `board-data-schema` (accepted), `seed-content-licensing` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/seed-infantil-u14`
- **spec path:** `docs/specs/seed-infantil-u14.md`

## Goal

Turn the Infantil U14 category into the first genuinely complete slice of the Exercise Library. Today the bundled package holds three Infantil exercises and one short Infantil Programming record, authored only to prove the read layer works. After this feature an anonymous coach (once browsing screens land) can read a coherent Infantil U14 program plus a nine-exercise library whose every drill opens on the board, every record is original content owned by the team, and every `boardData` payload parses as Board Data `1.0.0`.

Concretely:

1. six new curated Infantil exercises, each with multi-phase Spanish Board Data, added to the bundled package;
2. the existing `infantil-u14-base` Programming record extended to a full-season plan (three macrocycles, two microcycles each, complete session structure) that references the same exercise themes;
3. the seed audit expectation raised from 3 exercises + 1 programming record to 9 exercises + 1 programming record;
4. a dedicated Infantil seed contract test so the category cannot regress to a thin or invalid set.

This is content authoring plus test/doc updates. No schema, port, use case, or screen changes are expected.

## Non-Goals

- Any UI: explore general, explore by category, exercise detail, filters, empty states, or attribution display.
- Board rendering, phase playback, golden board tests, or deciding the half-pitch shading rule.
- AI: retrieval, grounding, session generation, variants, chat, quota.
- The other six categories (`seed-remaining-categories`), including new `cadete`/`alevin` tags. Only the existing crossover tag `salida-3-1-presion-alta` → `cadete` stays.
- Changing `contentVersion`/`CONTENT_PACKAGE_VERSION` (`1.0.0`), Board Data `1.0.0`, `ContentProvenance`, or any JSON key. This is additive *data*, not a contract change.
- CMD Mora material (written permission is still open), `reference`-kind drafts, or new provenance kinds.
- Offline bundle gating, a DB/CMS, an authoring tool, or a persistent E2E harness.

## Job Story

When I coach an Infantil U14 (12–13 year old) team, I want a single category that is actually finished — a seasonal methodology plus a balanced set of drills for build-up, circulation, attacking rotation, defensive basculation, pressing and transition, each animated on the board — so the library feels trustworthy before the rest of the categories are filled in.

## Users And Permissions

- Anonymous coach: will eventually browse the Infantil set; no account, no quota impact.
- Content author: edits `src/modules/content/infrastructure/content/content-package.json` only, following `docs/content-licensing.md` and `docs/board-data-schema.md`.
- Validator: inspects the package, the updated audit, the new Infantil seed test, and the docs; re-runs the gate and the probes.

## Acceptance Scenarios

### Scenario 1: The Infantil library is complete and ordered

Given the bundled content package
When `listExercises(repository, { categoryId: 'infantil' })` runs
Then it returns exactly 9 published exercises, each containing `infantil` in `categoryIds`, in package declaration order:
`salida-3-1-presion-alta`, `circulacion-cierre-ala`, `presion-tras-perdida`, `rondo-4v1-orientacion`, `pase-y-va-carril-central`, `juego-posicion-3-1-pivote`, `ataque-4-0-rotaciones`, `basculacion-rombo-defensivo`, `transicion-3v2-tras-robo`.

### Scenario 2: Every seeded Infantil board is valid Board Data

Given each of the 9 Infantil exercises
When its `boardData` is re-parsed with `parseBoardData`
Then it passes, reports `schemaVersion` `1.0.0`, has 1–12 phases whose `order` equals index + 1, defines at most as many tokens as `players.total`, and has exactly one position per token in every phase.

### Scenario 3: The Infantil programming record is complete

Given the bundled package
When `getProgramming(repository, 'infantil')` runs
Then it returns `infantil-u14-base`, published, with `version` `1.1.0`, a non-empty `formativeStage`, `focus`, `playModel`, `sessionDurationMinutes` (`min` ≤ `max`, 20–180), 3–8 `keyConcepts`, 3–8 `objectives`, a `sessionStructure` containing warm-up, main and cool-down, and 3 macrocycles with 2 microcycles each and `sessionCount` ≥ 1, all copy in Spanish.

### Scenario 4: Provenance audit reflects the full seed

Given the bundled package
When the seed provenance audit runs
Then it sees 9 exercises and 1 programming record (10 records), every one `published`, `kind: 'original'`, `licenseStatus: 'owned'`, `sourceName` `Futsal Manager AI`, none `reference`, and no `sourceName` naming the four inspiration-only domains.

### Scenario 5: No other category moves

Given the bundled package after the feature
When exercises and programming are listed per category
Then `cadete` still returns exactly `salida-3-1-presion-alta`, and `prebenjamin`, `benjamin`, `alevin`, `juvenil`, and `senior` return no exercises and `getProgramming` returns `null` for each.

### Scenario 6: Existing content is preserved

Given the three pre-existing exercises and the Infantil programming id
When the package is read
Then their ids, `categoryIds`, and Board Data are unchanged, `contentVersion` and `CONTENT_PACKAGE_VERSION` are still `1.0.0`, and Board Data is still `1.0.0`.

### Scenario 7: Invalid seed data still fails loudly

Given an in-memory clone of the shipped package
When a new exercise's coordinate is moved out of 0–100, or a phase position is deleted
Then `parseContentPackage` fails with a dot path under `exercises.<i>.boardData...`, and the untouched package still parses.

### Scenario 8: The app still boots from the standard path

Given the feature is complete
When `npm run verify` and `./init.sh` run and the app is launched on the connected Android device
Then both exit 0, `expo-doctor` stays green, the Android bundle contains the new seeded ids, and Explorar renders its unchanged placeholder with no React Native errors.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, `ARCHITECTURE.md` — branch/PR workflow, accepted baseline (97/97 tests, 114 suites), this feature's verification lines, `seed-remaining-categories` dependency, and the `content` catalogue/layer rules (seeding is infrastructure data).
- `docs/content-model.md`, `docs/content-licensing.md` — field limits, package invariants and issue paths, read layer, publish gate, source register, author checklist, audit contract.
- `docs/domain-model.md`, `CONTEXT.md`, `docs/build-brief.md` — vocabulary, published lifecycle, multi-category edge case, "seed at least one full category (Infantil U14 recommended)".
- `docs/board-data-schema.md` — coordinate system, shape, limits, cross-field rules, renderer boundary.
- `docs/design/prototype/02-explore-by-category/code.html` — Infantil U14 methodology copy ("Desmarques de ruptura al espacio ciego, fijación del par defensivo y repliegue ordenado de seguridad"), `12-18 min/tarea`, and the three weekly tasks (salida de presión 3-1, circulación cierre-ala / pase y va, presión alta al rombo).
- `src/modules/content/domain/{exercise,programming,content-package}.ts` — exact limits (`durationMinutes` 5–120, `maxCategoryIds` 3, `maxConstraints` 6, `maxCoachingCues` 8; `maxKeyConcepts`/`maxObjectives` 8, `maxMacrocycles` 6, `maxMicrocycles` 8), strict objects, and Board Data re-prefixing.
- `src/modules/content/infrastructure/{bundled-content-repository.ts,content/content-package.json}` — package parsed once, 3 exercises + 1 programming record, all `original`/`owned`.
- `tests/modules/content/infrastructure/{seed-provenance,bundled-content-repository}.test.ts` — the hard-coded audit count/ids and the `>= 3` assertions that must move.
- `tests/modules/content/{domain/content-package,application/content-queries,index}.test.ts` — fixture-based clone/mutate pattern, fake repositories, public-API export list (no new exports planned).
- `package.json`, `init.sh` — `npm test` discovers `tests/**/*.test.{ts,tsx}`; `npm run verify` = lint + typecheck + test + expo-doctor; `init.sh` never starts Metro.

### Existing Patterns To Follow

- One bundled JSON package; category names never in JSON; ids stable lowercase slugs (Spanish content slugs are the existing precedent, e.g. `salida-3-1-presion-alta`).
- Spanish copy for `title`, `summary`, `focus`, `objective`, phase titles/explanations, labels, cues, and programming text; English identifiers, test names, docs, and issue messages.
- Board Data authored per phase with full token snapshots; `pitch.format: 'full'`; arrow `curve` optional; labels optional.
- Tests mirror `src` under `tests/modules/content/`, use `node:test` + Given/When/Then, import layers directly (public API re-exports `ExploreScreen`).
- Errors surface as dot paths from `parseContentPackage`; the package parser validates Board Data automatically.

### Current Gaps

- Only 3 exercises exist, all Infantil; the library has no warm-up, no pase y va, no 4-0 rotation, no defensive basculation, no transition drill.
- `infantil-u14-base` has one macrocycle and two microcycles — not a season plan.
- The seed audit is hard-coded to 3 + 1, so it will fail the moment volume grows (that failure is expected and must be updated, not bypassed).
- No test asserts Infantil completeness, Spanish copy presence, board token/player coherence, or that the programming record has every required section.

## Technical Approach

1. **Author data, not code.** All production change lands in `src/modules/content/infrastructure/content/content-package.json`. No domain/application/infrastructure TS edit, no public API export, no version bump: the contract already supports everything.
2. **Append, do not reorder.** Keep the three existing exercises first (byte-identical) and append the six new ones so package declaration order equals the canonical expected id list. `listExercises` preserves package order, so this order is part of the contract in tests and docs.
3. **Program matching the drills.** Programming copy must name the same blocks as the exercise `focus` values so the library and the plan read as one methodology: salida de presión, circulación, pase y va, juego de posición 3-1, ataque 4-0, basculación del rombo, presión tras pérdida, transición, plus the rondo warm-up.
4. **Programming record extension.** `infantil-u14-base` keeps its id (referenced by tests and docs) and bumps its own `version` to `1.1.0` (record plan version, unrelated to `contentVersion`, which stays `1.0.0`). Season shape: 3 macrocycles × 2 microcycles, `sessionCount` 4 per microcycle; session duration 60–75; session structure warm-up (rondo 4v1 + movilidad), main (4 blocks, ~35 min), cool-down (stretching + tactical questions).
5. **Board authoring rules.** All new boards use `pitch.format: 'full'` (half-pitch shading is still unpinned by `tactics-board-renderer`), coordinates kept inside 4–96 to avoid edge clipping, 2–3 phases each, one position per token per phase, arrows whose `from`/`to` differ by > 0.1, arrow/label ids unique per phase, tokens ≤ `players.total`, and no extra keys (strict schema).
6. **Tests as the seed contract.** Move the audit expectations to the canonical list, then add `seed-infantil-u14.test.ts` asserting volume, order, Board Data validity, copy completeness, programming sections, focus coverage, and the "no other category moved" guard.

### Planned Seed Volume And Ids

Final package: **9 exercises + 1 programming record = 10 records** (from 4). All `published`, `original`, `owned`, `sourceName` `Futsal Manager AI`, no `attribution`.

| # | id | focus | categoryIds | players | space (m) | min | intensity | phases | change |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `salida-3-1-presion-alta` | Salida de presión | `infantil`, `cadete` | 10 / 2 GK | Pista completa 20×40 | 15 | high 85 | 3 | unchanged |
| 2 | `circulacion-cierre-ala` | Circulación | `infantil` | 8 / 2 GK | Pista completa 20×40 | 12 | medium 65 | 2 | unchanged |
| 3 | `presion-tras-perdida` | Defensa | `infantil` | 10 / 2 GK | Medio campo 20×20 | 18 | high 90 | 2 | unchanged |
| 4 | `rondo-4v1-orientacion` | Rondo | `infantil` | 6 / 0 GK | Cuadrado de rondo 12×12 | 8 | low 45 | 2 | new |
| 5 | `pase-y-va-carril-central` | Pase y va | `infantil` | 8 / 2 GK | Pista completa 20×40 | 12 | medium 70 | 3 | new |
| 6 | `juego-posicion-3-1-pivote` | Juego de posición | `infantil` | 10 / 2 GK | Tres cuartos 20×30 | 14 | medium 75 | 3 | new |
| 7 | `ataque-4-0-rotaciones` | Ataque 4-0 | `infantil` | 10 / 2 GK | Pista completa 20×40 | 15 | high 80 | 3 | new |
| 8 | `basculacion-rombo-defensivo` | Basculación defensiva | `infantil` | 10 / 2 GK | Pista completa 20×40 | 15 | medium 70 | 3 | new |
| 9 | `transicion-3v2-tras-robo` | Transición | `infantil` | 7 / 1 GK | Medio campo 20×25 | 12 | high 85 | 2 | new |

Programming record: `infantil-u14-base`, `categoryId: infantil`, `version: 1.1.0`, `formativeStage` "Etapa de asimilación táctica cognitiva", `focus` "Foco Metodológico Infantil", 5 key concepts, 6 objectives, 3 session parts, macrocycles `macrociclo-1` (asimilación 3-1), `macrociclo-2` (circulación, pase y va y juego de posición), `macrociclo-3` (rotaciones 4-0, rombo defensivo y transición), each with `microciclo-1`/`microciclo-2` at 4 sessions.

## Expected File Changes

### `src/modules/content/infrastructure` (only production change)

- `content/content-package.json` — append 6 exercises; extend the `infantil-u14-base` programming record. `contentVersion` stays `1.0.0`.

### `src/modules/content/domain` / `application` / `index.ts`

- No change expected. If authoring reveals a real contract gap, stop and plan a separate additive contract feature with a version bump instead of widening this one.

### Tests (`tests/modules/content/infrastructure`)

- `seed-provenance.test.ts` — replace the `3`/`1` counts and the 4-id array with the canonical 9-exercise id list + 1 programming record; keep the generic provenance/kind/domain loops unchanged.
- `bundled-content-repository.test.ts` — `>= 3` → `>= 9`; the Infantil expected id array becomes the 9 ids; `cadete` expectations, the crossover dedup assertions, and the programming tests stay.
- `seed-infantil-u14.test.ts` — new: Scenarios 1, 2, 3, 5, 6 (real repository, no network).

### Docs And Harness

- `docs/content-model.md` — seed-scope line, Known Gaps (Infantil complete; other six empty), and the Programming `version` note.
- `docs/content-licensing.md` — source register row for in-house authorship updated to 9 exercises + 1 programming record; audit description.
- `ARCHITECTURE.md` — one `content` catalogue sentence naming the complete Infantil seed.
- `docs/risks-and-open-questions.md` — content-volume risk partly mitigated; "next feature" line becomes `seed-remaining-categories`.
- `src/modules/content/README.md` — seed description.
- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — status, evidence, next feature.
- This spec — task checkboxes and recorded implementation notes.

### Not Changed

- `docs/board-data-schema.md`, `DESIGN.md`, `CONTEXT.md`, `docs/build-brief.md` (no contract, visual, vocabulary, or product change), `docs/domain-model.md` (no relationship change), `init.sh`, `package.json`, `eslint.config.js`, `src/app/**`.

## Visual Design Impact

- UI involved: no. No route, screen, component, token, or copy surface changes; `DESIGN.md` is unaffected.
- Board Data added here is not yet rendered; legibility and 2:1 fidelity are `tactics-board-renderer` work.
- Device check is a regression smoke only: Explorar must still show `LA BIBLIOTECA LLEGA EN LA SIGUIENTE FASE` with a clean `logcat`.

## Durable Documentation Impact

- `ARCHITECTURE.md`: update — one catalogue line; no layer, port, or dependency change.
- `CONSTRAINTS.md`: not needed — the file does not exist.
- `AGENTS.md`: update — project status, next ready feature, Infantil seed audit mention.
- `DESIGN.md`: not needed — no visual change.
- `CONTEXT.md`: not needed — no new domain term.
- Other: `docs/content-model.md`, `docs/content-licensing.md`, `docs/risks-and-open-questions.md`, `src/modules/content/README.md`, `PROGRESS.md`, `feature_list.json`.

## Implementation Plan

1. Re-read the limits in `docs/content-model.md` / `docs/board-data-schema.md`; sketch each new drill's phases on the existing three exercises' geometry.
2. Author the six exercises in JSON (metadata + Spanish copy + Board Data), appended after the existing three.
3. Extend `infantil-u14-base` to the 3×2 season plan with matching objectives and copy; set `version` `1.1.0`.
4. Parse the edited package in isolation (`tsx` one-off import through `parseContentPackage`) and fix every dot-path issue before touching tests.
5. Update `seed-provenance.test.ts` and `bundled-content-repository.test.ts` expectations.
6. Add `seed-infantil-u14.test.ts` covering Scenarios 1, 2, 3, 5, 6.
7. Update the durable docs and harness state; tick this spec's tasks.
8. Run the full gate plus probes, Android export, and the device smoke; record evidence in `feature_list.json` and `PROGRESS.md`.

## Implementation Tasks

- [x] Add `rondo-4v1-orientacion` with 2-phase Board Data and Spanish copy.
- [x] Add `pase-y-va-carril-central` with 3-phase Board Data.
- [x] Add `juego-posicion-3-1-pivote` with 3-phase Board Data.
- [x] Add `ataque-4-0-rotaciones` with 3-phase Board Data.
- [x] Add `basculacion-rombo-defensivo` with 3-phase Board Data.
- [x] Add `transicion-3v2-tras-robo` with 2-phase Board Data.
- [x] Extend `infantil-u14-base` to 3 macrocycles × 2 microcycles with 5 key concepts, 6 objectives and warm-up/main/cool-down; `version` `1.1.0`.
- [x] Verify all six new records are `published`, `original`, `owned`, `sourceName` `Futsal Manager AI`, with no `attribution`.
- [x] Update `seed-provenance.test.ts` to 9 exercises + 1 programming record and the canonical id list.
- [x] Update `bundled-content-repository.test.ts` counts and Infantil id list.
- [x] Add `seed-infantil-u14.test.ts`.
- [x] Update `docs/content-model.md`, `docs/content-licensing.md`, `ARCHITECTURE.md`, `docs/risks-and-open-questions.md`, `src/modules/content/README.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`.
- [x] Run the gate, probes, Android export and device smoke; record evidence.

## Test Plan

| File | Type | Assertions |
| --- | --- | --- |
| `infrastructure/seed-infantil-u14.test.ts` (new) | real package | 9 Infantil exercises in order; all published and tagged `infantil`; every `boardData` re-parses at `1.0.0`; phases ordered; one position per token per phase; tokens ≤ `players.total`; `goalkeepers` ≤ `total`; Spanish copy non-empty on title/summary/focus/objective/workStructure/cues/constraints; 9 distinct `focus` values covering the planned blocks; programming record complete (5 key concepts, 6 objectives, 3 session parts, 3 macrocycles × 2 microcycles, duration bounds, semver `version`); `cadete` still exactly one exercise and the other five categories empty/`null`; the three legacy exercises unchanged in id/categoryIds/board phase count. |
| `infrastructure/seed-provenance.test.ts` (update) | real package | 10 records; canonical ids; all `published`/`original`/`owned`/`Futsal Manager AI`; none `reference`; no inspiration-only domain in `sourceName`. |
| `infrastructure/bundled-content-repository.test.ts` (update) | real package | `>= 9` published exercises; Infantil id array = 9; Board Data valid for all; cadete crossover dedup unchanged; programming lookup unchanged; unknown id → `null`. |
| `domain/content-package.test.ts`, `application/content-queries.test.ts`, `index.test.ts` | unchanged | Still green; no contract or export change. |

Expect roughly 6–10 new tests (baseline 97/97 across 114 suites). Record exact before/after counts; do not pin a number in the spec.

## Verification Plan

- `npm test` — baseline 97/97 across 114 suites; expect the updated + new files all green.
- `npm run lint` — boundaries unchanged (`content` still imports only its own layers and `shared/domain`).
- `npm run typecheck`; `npm run verify` exit 0 with `expo-doctor` 20/20; `./init.sh` exit 0 and still never starts Metro.
- Read-layer smoke via `tsx`: print the 9 Infantil ids, the exercise count, `getProgramming('infantil')` id/version/macrocycles, and the empty results for the other five categories.
- In-memory package probes (no file edits): move `exercises.3.boardData.phases.0.positions.0.x` to `140` → expect `exercises.3.boardData.phases.0.positions.0.x: Too big: expected number to be <=100`; delete a position from `exercises.4.boardData.phases.1.positions` → expect the missing-position path; confirm the untouched package still parses.
- `npx expo export --platform android` — succeeds; `strings` on the bundle finds at least three new ids and `infantil-u14-base`.
- Device smoke on `SM-M135F` (Expo Go 58.0.5): app boots, Explorar shows the unchanged placeholder, all four tabs present, `adb logcat` free of React Native errors.
- Persistent E2E: none exists and this feature changes no route, API route, or screen; `node:test` package/application/infrastructure coverage plus the parser probes and device smoke is the right level.
- `init.sh` behavior unchanged: non-blocking checks only.

## Evidence To Capture

- Test counts and suite counts before/after, plus the updated audit output listing all 10 records.
- The 9-id Infantil listing, focused `focus` values, and the programming record's version/macrocycles/sections.
- Exact issue path and message for both invalid-package probes, plus the untouched-package pass.
- `npm run verify` exit code and `expo-doctor` score; `./init.sh` exit code; Android export size and the ids found in the bundle.
- Confirmation that `contentVersion`, `CONTENT_PACKAGE_VERSION`, Board Data, and `ContentProvenance` are unchanged at `1.0.0` / same shape.
- Device model, Explorar smoke result, and `logcat` status.

## Evidence Interpretation Note

`feature_list.json` asks to "confirm the Infantil U14 programming record renders all required sections". No screen exists in this feature, so "renders" is verified as **structural completeness through the read layer** (every required section present, non-empty and within contract limits), and UI rendering is deferred to `explore-by-category-screen` / `explore-general-screen`. The validator should accept Scenario 3 as the intended evidence and record the deferred UI check.

## Validator Checklist

- [x] Scope stays inside the bundled JSON, mirrored content tests, and docs; no UI, board, AI, schema, port, export, or version change.
- [x] Package holds exactly 9 exercises + 1 programming record; the 6 new ids match this spec; the 3 legacy records are unchanged.
- [x] Every Infantil `boardData` parses at `1.0.0` with ordered phases, one position per token per phase, and tokens ≤ `players.total`.
- [x] `infantil-u14-base` is published, `version` `1.1.0`, and carries every required section (5 key concepts, 6 objectives, 3 session parts, 3 macrocycles × 2 microcycles).
- [x] Seed audit expects 9 + 1 and passes; no `reference` kind and no inspiration-only domain in any `sourceName`; every record `original`/`owned`/`Futsal Manager AI`.
- [x] No new cross-category tags: `cadete` still has exactly one exercise, and the other five categories stay empty with `getProgramming` → `null`.
- [x] Spanish copy throughout; no English UI strings, no placeholder text, no duplicate ids, slugs lowercase.
- [x] `contentVersion`/`CONTENT_PACKAGE_VERSION` and Board Data remain `1.0.0`; `ContentProvenance` keys unchanged.
- [x] Both invalid-package probes fail with the expected `exercises.<i>.boardData...` paths; the untouched package parses.
- [x] `npm run verify`, `./init.sh`, Android export and the Explorar device smoke pass; evidence recorded in `feature_list.json` and `PROGRESS.md`.
- [x] Durable docs updated as listed; task checkboxes ticked.

## Planning-Time Risks

- **Hand-authored geometry can be structurally valid but visually wrong.** Nothing validates overlap, off-pitch-looking layouts, or arrows that contradict the explanation; the board does not exist yet. Mitigation: keep coordinates 4–96, copy the existing exercises' spacing conventions, keep 2–3 phases, and treat legibility as `tactics-board-renderer` validation rather than claiming it here.
- **Half-pitch semantics are still unpinned.** `pitch.format: 'half'` shading and arrow `curve` sign are undecided. Mitigation: all new boards use `pitch.format: 'full'`; `space.label` (e.g. "Medio campo") carries the real-world area.
- **Hard-coded test expectations are order-sensitive.** `listExercises` preserves package order, so inserting a new exercise in the middle breaks the expected arrays. Mitigation: append-only authoring, one canonical id list in the tests, and the order documented in `docs/content-model.md`.
- **Volume creep.** Nine exercises is the plan; adding a tenth "while we are here" re-opens every expectation. Mitigation: freeze the list in this spec; extra drills belong to `seed-remaining-categories` follow-up.
- **U14 appropriateness is a coaching judgement, not a test.** Player counts, 60–75 min sessions, intensity percentages and drill rules could be wrong for 12–13 year olds. Mitigation: base loads on the prototype, keep high intensity to short blocks, and flag coach review in the validation-plan evidence.
- **Programming `version` vs `contentVersion` confusion.** Bumping the record to `1.1.0` while `contentVersion` stays `1.0.0` could look inconsistent. Mitigation: document the distinction in `docs/content-model.md` and the PR body.
- **Audit and content-test overlap.** Three tests will assert the same ids and counts, so one edit can require three updates. Mitigation: keep the count/order assertions in one canonical place (`seed-infantil-u14.test.ts`) and let the audit assert provenance only, with the repository test asserting read behavior.
- **Licence assumption.** Nine records all claim `original`/`owned`; if copy were lifted from a reference site this would become a legal error. Mitigation: write the drills in-house from Futsal Manager AI methodology, follow the `docs/content-licensing.md` checklist, and keep reference sites inspiration-only.

## Implementation Notes

Implemented on `feat/seed-infantil-u14`, `2026-10-27`.

- Package: nine exercises in the planned order (`salida-3-1-presion-alta`, `circulacion-cierre-ala`, `presion-tras-perdida`, `rondo-4v1-orientacion`, `pase-y-va-carril-central`, `juego-posicion-3-1-pivote`, `ataque-4-0-rotaciones`, `basculacion-rombo-defensivo`, `transicion-3v2-tras-robo`) plus `infantil-u14-base`. The three legacy records are byte-identical; the diff only adds the six new exercises and edits the Programming block.
- All six new boards use `pitch.format: 'full'`, coordinates inside 4–96, 2–3 phases, one position per token per phase, and tokens within `players.total` (5/6, 8/8, 10/10, 10/10, 10/10, 6/7).
- `infantil-u14-base` is version `1.1.0` with 5 key concepts, 6 objectives, warm-up/main/cool-down, and three macrocycles of two four-session microcycles. `contentVersion` and `CONTENT_PACKAGE_VERSION` stayed `1.0.0`; Board Data stayed `1.0.0`; `ContentProvenance` and all JSON keys are unchanged.
- A standalone `tsx` parse probe over the edited JSON reported all nine exercises and the Programming record with no issues before the test suite ran.
- `npm test`: 114/114 pass across 122 suites (baseline 97/97 across 114). The new `seed-infantil-u14.test.ts` contributes 17 tests; the updated seed audit and repository tests assert 9 + 1 records.
- `npm run lint`, `npm run typecheck`, `npm run verify` (exit 0, `expo-doctor` 20/20) and `./init.sh` (exit 0, no Metro) all pass.
- Read-layer smoke: Infantil returns the nine ids in order, total exercise count 9, `infantil-u14-base` at `1.1.0` with 3 macrocycles and warm-up/main/cool-down; `cadete` returns one exercise and `null` programming; `prebenjamin`, `benjamin`, `alevin`, `juvenil`, and `senior` return no exercises and `null` programming.
- Seed audit: nine exercises plus the Programming record, all `published` / `original` / `owned` / `Futsal Manager AI` with no `attribution`.
- In-memory probes on the shipped package: `exercises.3.boardData.phases.0.positions.0.x` with `140` fails as `exercises.3.boardData.phases.0.positions.0.x: Too big: expected number to be <=100`; deleting a position from `exercises.4.boardData.phases.1.positions` fails as `exercises.4.boardData.phases.1.positions: Missing position for token "defensor-2" in phase 2.`; the untouched package still parses.
- `npx expo export --platform android` exit 0 with a 3,647,600-byte Hermes bundle; `strings` found all six new ids and `infantil-u14-base`.
- Device smoke on `SM-M135F` (Android 14, Expo Go 58.0.5): Metro bundled 1258 modules, Explorar rendered `FUTSAL MANAGER AI`, `EN CONSTRUCCIÓN`, `La biblioteca llega en la siguiente fase`, and all four tabs; `adb logcat` showed no React Native errors or fatal exceptions.
- UI rendering of the Programming sections and board legibility are deferred: no screen or renderer exists in this feature, so Scenario 3 is evidenced structurally through the read layer as the spec allows.
