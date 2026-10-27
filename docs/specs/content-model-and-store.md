# Feature Implementation Spec: Add exercise, category, and programming data model

## Source Feature

- **id:** `content-model-and-store`
- **area:** `content`
- **status:** `not_started`
- **depends_on:** `bootstrap-app-shell`, `modular-hexagonal-architecture`
- **source:** `feature_list.json`

## Goal

Give the app one validated content source and one read layer: canonical RFEF `Category` reference data, an `Exercise` model carrying shared Board Data, a per-category `Programming` model, and a bundled-JSON repository behind a port. Content is parsed once, every exercise's Board Data is validated with `parseBoardData`, and browsing never returns draft or archived records.

The feature builds the model, invariants, port, adapter, use cases, and a minimal seed package. It does not author the real library, enforce licensing, or render content.

## Non-Goals

- Full seed content (`seed-infantil-u14`, `seed-remaining-categories`).
- Licensing enforcement and attribution display (`seed-content-licensing`); provenance fields are only reserved here.
- Category filter UI/state (`category-filter`), Explorar screens, and exercise detail; the Explorar placeholder stays unchanged.
- Board rendering or playback.
- Build-time gating, airplane-mode proof, and version policy beyond `1.0.0` (`offline-content-bundle`).
- AI retrieval, prompts, or gateway work.
- A content editor, database, remote CMS, migrations, or user-generated exercises.
- New UI copy, colors, fonts, or components.

## Job Story

When I add or browse curated exercises and per-category programming, I want them to come from one versioned, validated package behind a small read API, so the library, the board, and later the AI all read the same trustworthy content instead of duplicating or inventing it.

## Users And Permissions

- Anonymous coach (later screens): reads published exercises and programming for a category; no account involved.
- Content author: edits the bundled JSON; invalid category ids, invalid Board Data, or duplicate ids fail with a field path.
- App/API developer and the `ai` module: consume the `content` public API (published-only), never module internals.

## Acceptance Scenarios

### Scenario 1: Seeded content loads through the read layer

Given the bundled content package
When a developer creates the bundled repository and lists exercises
Then every published exercise is returned with parsed Board Data and the same data is reachable through the `content` public API.

### Scenario 2: A two-category exercise appears under both without duplication

Given a published exercise tagged `infantil` and `cadete`
When exercises are listed for `infantil` and then for `cadete`
Then the exercise appears exactly once in each result and never twice in the same result.

### Scenario 3: All seven RFEF categories exist as reference data

Given the domain category reference data
When a developer lists categories
Then exactly seven exist in RFEF order (`prebenjamin`, `benjamin`, `alevin`, `infantil`, `cadete`, `juvenil`, `senior`) with Spanish names, U-age labels, and no skill tier or Chupetín-style stage.

### Scenario 4: Programming is one published record per category

Given the content package
When programming is requested for a category with a published record
Then exactly one record is returned; for a category without one, the read layer returns `null` rather than inventing content.
When the package holds two published programming records for the same category, parsing fails with a path naming the category.

### Scenario 5: Unpublished content never reaches browsing

Given exercises and programming in `draft` or `archived` status
When browsing use cases run
Then only `published` records are returned, and an archived exercise is absent when looked up by id.

### Scenario 6: Invalid content is rejected with an actionable path

Given a package with an unknown category id, a duplicated exercise id, an empty `categoryIds`, or an exercise whose Board Data fails `parseBoardData`
When the package is parsed
Then parsing fails and issues report dot paths such as `exercises.1.categoryIds.0` or `exercises.0.boardData.phases.1.positions`.

### Scenario 7: The package version is recorded and enforced

Given the repository
When a developer inspects the package and domain constants
Then `CONTENT_PACKAGE_VERSION` and the JSON `contentVersion` are `1.0.0`, and any other version fails validation.

### Scenario 8: The standard gate covers the content package

Given a clean checkout
When `./init.sh` runs
Then content model and seeded-package tests execute inside `npm run verify`, and no dev server starts.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — workflow, accepted baseline, selected feature, and the dependent `seed-*`, `category-filter`, `offline-content-bundle`, and `grounding-retrieval` features.
- `CONTEXT.md`, `docs/domain-model.md` — canonical RFEF `Category`, `Exercise`, `Programming`, Board Data, published/archived lifecycle, one Programming per Category, and taxonomy-drift risk.
- `docs/technical-discovery.md` — versioned JSON validated at build time, no database, offline-first content.
- `docs/board-data-schema.md`, `src/shared/domain/board-data/*` — `parseBoardData`, issue paths, and `BoardData` types to reuse.
- `ARCHITECTURE.md` — `content` ownership, layer rules, `ContentRepository` port, bundled-JSON adapter, and the browse data flow.
- `src/modules/content/*`, `tests/shared/domain/board-data/*`, `tests/architecture/*` — only the Explorar screen and public API exist; domain/application/infrastructure are empty.
- `docs/design/prototype/*` — field vocabulary: focus, categories, duration, players plus keepers, space in metres, intensity, restrictions, coaching cues, formative stage, key concepts, session length range.
- `package.json`, `tsconfig.json`, `eslint.config.js` — `resolveJsonModule: true`, `npm test` discovery, and the boundary allowlist.

### Existing Patterns To Follow

- Domain is platform-free; Board Data enters through `@/shared/domain` and is always validated.
- Ports live in `domain`, adapters in `infrastructure`, and wiring at the composition root or a module factory.
- Public API is `src/modules/content/index.ts`; routes and other modules never deep-import layers.
- Tests mirror `src` under `tests/modules/content/...` with Given/When/Then names.
- Spanish for content and UI copy; English for identifiers, types, and documents.

### Current Gaps

- No category reference data, exercise/programming types, content package, parser, repository, or read layer.
- No invariant catches unknown categories, duplicated ids, or multiple published Programming records per category.
- No provenance fields, so `seed-content-licensing` would otherwise rewrite every record.
- No content test suite or seeded-package validation.

## Technical Approach

1. **Categories are domain reference data, not JSON.** `CATEGORIES` is a frozen, ordered constant in `domain/category.ts`. The package references ids and parsing rejects unknown ones, so names are not duplicated.
2. **One bundled, versioned package.** `src/modules/content/infrastructure/content/content-package.json` holds `{ contentVersion, exercises, programming }`, imported once by the adapter, parsed once, and indexed. `CONTENT_PACKAGE_VERSION` mirrors `contentVersion`.
3. **Domain owns contract and invariants; the adapter only loads JSON.** `domain/content-package.ts` declares types, strict Zod schema, `parseContentPackage`/`safeParseContentPackage`, and `ContentValidationError` with dot paths like the Board Data style. Nested `boardData` is validated by `parseBoardData`, with issues re-prefixed under `exercises.<i>.boardData.`.
4. **A small port plus use cases.** `domain/ports/content-repository.ts` exposes raw package reads; `application` use cases apply published-only and deduplication rules. No React Native, Expo, storage, or HTTP in domain/application.
5. **Provenance reserved now, enforced later.** Every record carries `provenance`; seeded records are original with `licenseStatus: 'owned'`. Blocking unpublished provenance, attribution UI, and the validation gate belong to `seed-content-licensing`.
6. **Minimal real seed.** The package ships 2–3 original exercises (one tagged `infantil` + `cadete`, Board Data derived from the existing valid fixture) and one published Infantil programming record. Full library and per-category programming are the `seed-*` features.

### Content Model Shape

```ts
type CategoryId = 'prebenjamin' | 'benjamin' | 'alevin' | 'infantil' | 'cadete' | 'juvenil' | 'senior';
type Category = { id: CategoryId; name: string; ageLabel: string;
  ageRange: { min: number; max: number } | null; order: number };
type Exercise = { id: string; title: string; summary: string; focus: string;
  categoryIds: CategoryId[]; objective: string;
  players: { total: number; goalkeepers: number };
  space: { label: string; widthM: number; lengthM: number };
  durationMinutes: number; intensity: { level: 'low' | 'medium' | 'high'; percent?: number };
  workStructure: string; constraints: { rule: string; detail: string }[];
  coachingCues: string[]; boardData: BoardData;
  status: 'draft' | 'published' | 'archived'; provenance: ContentProvenance };
type Programming = { id: string; categoryId: CategoryId; version: string;
  formativeStage: string; focus: string; playModel: string;
  sessionDurationMinutes: { min: number; max: number };
  keyConcepts: string[]; objectives: string[];
  sessionStructure: { part: 'warm-up' | 'main' | 'cool-down'; title: string; description: string }[];
  macrocycles: { id: string; label: string; focus: string;
    microcycles: { id: string; label: string; focus: string; sessionCount: number }[] }[];
  status: 'draft' | 'published'; provenance: ContentProvenance };
type ContentProvenance = { kind: 'original' | 'cmd-mora' | 'reference'; sourceName: string;
  licenseStatus: 'owned' | 'permitted' | 'reference-only' | 'pending' | 'unlicensed'; attribution?: string };
```

Package rules: `contentVersion` is `1.0.0`; exercise and programming ids unique; at most one `published` programming per `categoryId`; `categoryIds` non-empty, unique, all known; `players.total >= players.goalkeepers`; bounded durations; slug/text limits; unknown keys rejected; every `boardData` passes `parseBoardData`. Readers expose only `published` records.

## Expected File Changes

### `src/modules/content/domain`

- `category.ts` — `CategoryId`, `CATEGORY_IDS`, `CATEGORIES`, `isCategoryId`, `getCategoryById`.
- `exercise.ts`, `programming.ts`, `provenance.ts` — entities, status helpers, and provenance types.
- `content-package.ts` — `CONTENT_PACKAGE_VERSION`, `ContentPackage`, strict schema, parser/safe-parser, `ContentValidationError`, issue paths.
- `ports/content-repository.ts` — `ContentRepository` (`getExercises`, `getExerciseById`, `getProgrammingByCategory`).

### `src/modules/content/application`

- `list-categories.ts`, `list-exercises.ts` (optional `categoryId`, published-only, deduplicated), `get-exercise.ts`, `get-programming.ts` (published-only, single record or `null`).

### `src/modules/content/infrastructure`

- `content/content-package.json` — the versioned seed package.
- `bundled-content-repository.ts` — imports JSON as `unknown`, parses once, builds id/category indexes, exports `createBundledContentRepository()`.

### Public API And Tests

- `src/modules/content/index.ts`, `src/modules/content/README.md` — export categories, types, parser, port, use cases, and the factory; update active layers and test location.
- `tests/modules/content/domain/categories.test.ts` — seven RFEF brackets, order, Spanish names, no skill tiers.
- `tests/modules/content/domain/content-package.test.ts` — valid package, unknown category, duplicate ids, empty `categoryIds`, invalid Board Data, duplicate published programming, wrong version; fixtures beside the test.
- `tests/modules/content/application/content-queries.test.ts` — fake repository; published-only, deduplication, missing programming returns `null`, archived lookup returns `null`.
- `tests/modules/content/infrastructure/bundled-content-repository.test.ts` — real package loads, every exercise validates, dual-category exercise under both filters, Infantil programming reachable.

### Docs And Harness

- `docs/content-model.md` — create; durable contract for categories, fields, invariants, provenance, version, validation.
- `ARCHITECTURE.md`, `docs/domain-model.md`, `docs/technical-discovery.md` — update content catalog, browse flow, field-level names, and package path.
- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — status, evidence, verification, next feature.
- `docs/specs/content-model-and-store.md` — this spec.

## Visual Design Impact

- UI involved: no; `DESIGN.md` is unaffected and no screen or state changes.
- The Explorar placeholder stays until `explore-general-screen`; no new design artifact is required.
- No device scenario is added, but confirm Explorar still renders after the change.

## Durable Documentation Impact

- `ARCHITECTURE.md`: update — content ownership, package path, factory wiring, and browse flow; no dependency-graph change.
- `CONSTRAINTS.md`: not needed — the file does not exist; rules live in `AGENTS.md`, `docs/content-model.md`, and `ARCHITECTURE.md`.
- `AGENTS.md`: update — project status, next ready feature, and `docs/content-model.md` on the read list.
- `DESIGN.md`: not needed — no visual change.
- Other: create `docs/content-model.md`; update `docs/domain-model.md`, `docs/technical-discovery.md`, `PROGRESS.md`, `feature_list.json`, `src/modules/content/README.md`.

## Implementation Plan

1. Add domain model: category reference data, exercise, programming, provenance, package schema, parser, port.
2. Author the minimal package and implement the bundled adapter with indexes and factory.
3. Add application use cases with published-only and deduplication rules.
4. Export the public API and update the module README.
5. Add the four mirrored suites; prove invalid packages fail with actionable paths.
6. Write `docs/content-model.md` and update durable docs and harness.
7. Run `npm test`, `npm run verify`, `./init.sh`, Android export, and the Explorar device smoke.

## Implementation Tasks

- [ ] Add `CATEGORIES` with seven RFEF brackets, ids, U-age labels, ordering, and lookup helpers.
- [ ] Define `Exercise`, `Programming`, `ContentProvenance`, and published-status helpers.
- [ ] Implement the strict package schema, parser/safe-parser, error type, and cross-field rules, delegating Board Data to `parseBoardData`.
- [ ] Declare the `ContentRepository` port.
- [ ] Author `content-package.json` with 2–3 original exercises (one dual-category) and one published Infantil programming record.
- [ ] Implement `createBundledContentRepository` with id/category indexes and one-time parsing.
- [ ] Implement the four use cases with published-only filtering and no duplicates.
- [ ] Export the public API and update the module README.
- [ ] Add the four mirrored suites and fixtures.
- [ ] Write `docs/content-model.md`; update the durable docs and harness state.
- [ ] Run `npm run verify`, `./init.sh`, Android export, and the Explorar device check.

## Verification Plan

- `npm test` — existing Board Data/architecture tests plus new content suites pass.
- Seed validation probe — corrupt one seeded category id and one Board Data coordinate; confirm failure paths `exercises.<i>...`, then revert.
- `npm run typecheck` — the JSON import and package types compile.
- `npm run lint` — boundaries hold: `content` imports only `shared/domain` and its own layers.
- `npm run verify` — lint, typecheck, all tests, `expo-doctor` 20/20.
- `./init.sh` — exits 0, runs the gate including content tests, does not start Metro.
- `npx expo export --platform android` — bundled JSON still bundles.
- Read-layer smoke — a `tsx` check prints seven category ids, exercise count, the dual-category result, and the Infantil programming id.
- Device check — Explorar unchanged on the Galaxy M13 and the app still starts.
- Persistent E2E: none exists and this feature adds no user flow, route, or API; `node:test` domain/application/adapter coverage is correct until the renderer, screens, and API routes land.
- `init.sh` behavior unchanged: non-blocking checks only, never starts a server.

## Evidence To Capture

- `npm test` pass/fail and suite counts before and after.
- Exact validation paths for the corrupted-category and invalid-Board-Data probes.
- `npm run verify` exit code and `expo-doctor` score; `./init.sh` exit code.
- Android export result and bundle size.
- Read-layer smoke output: seven category ids, exercise count, dual-category result, Infantil programming id.
- Confirmation that `contentVersion` and `CONTENT_PACKAGE_VERSION` are both `1.0.0`.
- Device model plus confirmation that Explorar is unchanged.

## Implementation Notes

- `node:test` cannot load React Native, and the `content` public API re-exports `ExploreScreen`. Node tests therefore import the owning layers directly (`domain/...`, `application/...`, `infrastructure/...`); `tests/modules/content/index.test.ts` asserts the public API still exports categories, the parser, the port, the use cases, the factory, and the screen, and the Explorar device smoke proves the route loads that barrel in the real runtime. This convention is recorded in `ARCHITECTURE.md`.
- The package parser validates structure first (with `boardData` as `unknown`), then runs `parseBoardData` per exercise and re-prefixes issues under `exercises.<i>.boardData.`, so a single parse reports structural and Board Data problems together.
- Seed scope stayed at the spec's minimum: three original exercises (one `infantil` + `cadete`) and one published Infantil Programming record. Published-only filtering is proven with fake repositories rather than by seeding draft or archived records.

## Validator Checklist

- [ ] Scope stays within model, invariants, package, port, adapter, use cases, tests, and docs.
- [ ] All eight acceptance scenarios pass with evidence.
- [ ] Every seeded exercise's Board Data is validated through `parseBoardData`; only published records are readable.
- [ ] The seven RFEF categories are the only categories; no skill tier or Chupetín stage appears.
- [ ] A two-category exercise appears once under each category and never twice in one result.
- [ ] `npm run verify` and `./init.sh` pass, the Android export succeeds, and Explorar is unchanged on device.
- [ ] E2E coverage was added or the justification still holds.
- [ ] `docs/content-model.md` exists and `ARCHITECTURE.md`, `docs/domain-model.md`, `docs/technical-discovery.md`, `AGENTS.md`, `PROGRESS.md`, and `feature_list.json` are updated.
- [ ] No unrelated UI, seeding volume, licensing enforcement, or AI work was added.

## Planning-Time Risks

- **Package location vs API reuse.** `docs/technical-discovery.md` says the package is shared by the app and the API, but the JSON sits in module infrastructure. Mitigation: the read layer is reachable from any server route via the public API; if the raw package must be shared, move it to a versioned root package in `offline-content-bundle` without changing the port or use cases.
- **Field set may need revision.** Exercise metadata is inferred from the prototype and may be incomplete for real seeding. Mitigation: keep the shape minimal, treat `contentVersion` as the additive lever.
- **Provenance split.** Reserving provenance without enforcement means an unlicensed record could be published until `seed-content-licensing` lands. Mitigation: seed only `original` + `owned` records and make enforcement the next feature's explicit rule.
- **Category taxonomy drift.** Mitigation: categories exist only as the canonical RFEF constant; validation rejects unknown ids and later seed features map source stages explicitly.
- **JSON import typing.** `resolveJsonModule` gives literal types, so parsing must receive `unknown` or invalid data can slip past the compiler; the validation test is the real gate.
- **Single-file growth.** One JSON package will grow large with merge-conflict risk; acceptable at MVP scale, split in `offline-content-bundle` if painful.
- **Programming over-modeling.** Macrocycles/microcycles are the least-evidenced part of the prototype; keep them nested and minimal and revisit before `seed-infantil-u14`.
- **Dead read layer.** No screen consumes it yet, so wiring could be forgotten; `explore-general-screen` and `category-filter` are the named consumers of the public API.
