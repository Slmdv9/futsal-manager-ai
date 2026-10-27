# Feature Implementation Spec: Define and validate the Board Data schema

> Path note: `modular-hexagonal-architecture` moved the contract to `src/shared/domain/board-data` and the tests/fixtures to `tests/shared/domain/board-data`. Paths below reflect the current tree.

## Source Feature

- `id`: `board-data-schema`
- `area`: `content`
- `depends_on`: `bootstrap-app-shell`
- `status`: `not_started`
- `source`: `feature_list.json`

## Goal

Freeze a versioned, renderable Board Data contract for futsal exercises and ship a runtime validator with actionable errors. The schema must describe pitch format, player and keeper tokens, static cones, per-phase positions, ball position, arrows, and labels while keeping the board a pure renderer of structured data.

This feature establishes the content contract only. It does not draw the board, implement playback, seed the library, or call AI.

## Non-Goals

- SVG rendering, pitch markings, playback controls, or golden playback tests (`tactics-board-renderer`, `board-phase-playback`, `board-golden-tests`).
- Seeded exercises, category data, programming, or licensing metadata (`seed-*`, `content-model-and-store`).
- AI prompts, structured-output retries, or the LLM gateway.
- A visual Board Data editor or authoring UI.
- Colors, fonts, shadows, or other visual styling inside Board Data; the renderer owns presentation.
- Schema migrations or backward compatibility beyond rejecting unknown versions.

## Job Story

When I add or generate an exercise,
I want Board Data to validate against one versioned contract with clear field errors,
so I can trust that the tactics board will receive complete, renderable data and reject anything invalid before publication.

## Users And Permissions

- Content author: authors JSON and runs validation locally; invalid data must fail with a field path.
- App or API developer: calls the parser before publishing or rendering; no end-user permission applies.
- AI service (later): must emit the same shape and be validated server-side before a result is shown.

## Acceptance Scenarios

### Scenario 1: Valid multi-phase data passes

Given a v1.0.0 fixture with three ordered phases and complete token positions
When the validator parses it
Then it returns typed Board Data with the same phase order, token ids, arrows, cones, and labels.

### Scenario 2: Missing phase coordinate fails clearly

Given a fixture where one token has no position in phase 2
When the validator parses it
Then validation fails and the error names `phases.1.positions` plus the missing token id.

### Scenario 3: Unknown token type fails clearly

Given a fixture with a token `kind` outside `player` and `keeper`
When the validator parses it
Then validation fails and the error names the token array index and `kind`.

### Scenario 4: Version is recorded and enforced

Given the repository
When a developer inspects the schema and documentation
Then `1.0.0` is the only accepted version, and a fixture with another version fails with a version error.

### Scenario 5: Unknown fields are rejected

Given a fixture with an extra property not in the contract
When the validator parses it
Then strict validation fails instead of silently ignoring the property.

### Scenario 6: Standard verification covers the contract

Given a clean checkout
When a developer runs `./init.sh`
Then the schema tests execute as part of `npm run verify` and no dev server starts.

## Repository Research

### Files Inspected

- `AGENTS.md` — Board Data must be validated; unvalidated data must not be published; verify gate and device rules.
- `PROGRESS.md` — accepted baseline and next feature.
- `feature_list.json` — selected feature, dependent board features, and verification criteria.
- `CONTEXT.md` — canonical Board Data, Phase, Tactics Board, and Exercise terms.
- `docs/domain-model.md` — Board Data fields, phase ordering, and half-court/missing-position edge cases.
- `docs/technical-discovery.md` — versioned JSON, SVG keyframes, build-time validation, golden tests.
- `docs/risks-and-open-questions.md` — the exact schema fields/validation/versioning are an open question this feature resolves.
- `docs/design/prototype/03-exercise-detail-board/code.html` — phase positions, ball, curved arrows, cones, labels, home/away tokens, and keeper treatment.
- `DESIGN.md` — board must stay 2:1; tokens are circular with mono labels; renderer owns color and styling.
- `package.json` — no schema library, test runner, or Node types are installed; `verify` is lint + typecheck + expo-doctor.
- `src/app/*`, `src/modules/*`, `src/shared/*` — no existing content layer or schema module.

### Existing Patterns To Follow

- Code identifiers and durable docs in English; exercise content and UI copy in Spanish.
- Pure domain modules live under `src/` and use strict TypeScript.
- Token-driven UI only; no literal styling in content.
- `npm run verify` is the single gate and is executed by `./init.sh`.

### Current Gaps

- There is no Board Data type, schema, validator, fixture, or schema documentation.
- There is no test command or test runner. Node 22.22 can execute TypeScript test files; `tsx` will be used as the TypeScript loader so imports stay extensionless.
- `@types/node` and a schema library are not installed.
- The prototype is 4:3 and half-pitch; the contract must normalize to the required 2:1 board.

## Technical Approach

1. Add `zod@^4.6.7` as a runtime dependency for strict parsing and future JSON Schema generation, plus `@types/node` and `tsx` as dev dependencies for tests.
2. Define `BOARD_DATA_SCHEMA_VERSION = '1.0.0'` and a strict Zod schema with cross-field refinements in `src/shared/domain/board-data/schema.ts`.
3. Model coordinates as normalized numbers from `0` to `100` on a full 2:1 pitch: `x` runs left goal line to right goal line, `y` runs top touchline to bottom touchline. Half-pitch exercises keep the same full-pitch coordinate space and mark `pitch.format: 'half'`; the renderer decides how to shade the inactive half without changing the 2:1 ratio.
4. Define token metadata once at board level and require exactly one position for every token in every phase. This guarantees interpolation safety and catches missing phase coordinates.
5. Keep cones static at board level; keep ball position, arrows, and labels per phase. Arrows carry `kind` and `team` semantics, a start/end point, and a signed perpendicular `curve` offset; the renderer maps them to DESIGN.md colors and dash styles.
6. Export `parseBoardData` and `safeParseBoardData` with a `BoardDataValidationIssue` path/message format. Wrap Zod issues so callers never depend on library internals.
7. Add fixtures for one valid prototype-derived exercise and targeted invalid cases, then test with `node:test` through `tsx`. Add `npm test` to `npm run verify` so the contract is exercised by `./init.sh`.
8. Document the contract, coordinate rules, limits, versioning policy, and validation command in `docs/board-data-schema.md`.

### Schema Shape

```ts
type BoardData = {
  schemaVersion: '1.0.0';
  pitch: { format: 'full' | 'half' };
  tokens: TokenDefinition[]; // id, kind, team, label
  cones: Cone[]; // static id, x, y
  phases: Phase[];
};

type Phase = {
  id: string;
  order: number; // 1..n, matching array position
  title: string;
  explanation: string;
  positions: { tokenId: string; x: number; y: number }[];
  ball: { x: number; y: number } | null;
  arrows: Arrow[];
  labels: BoardLabel[];
};
```

Limits: 1–24 tokens, 1–12 phases, 0–30 cones, 0–30 arrows and 0–12 labels per phase. IDs are lowercase slugs, unique within their scope; token labels are 1–3 trimmed characters; text fields have explicit maximum lengths.

Cross-field rules: every token has exactly one position per phase; no unknown or duplicate token ids; phase `order` equals its array index + 1; token, phase, cone, arrow, and label ids are unique; arrow start and end differ.

## Expected File Changes

- `package.json` — add `zod`, test/verify scripts, and dev dependencies.
- `package-lock.json` — lock the new dependencies.
- `src/shared/domain/board-data/schema.ts` — create; version, Zod schema, types, refinements.
- `src/shared/domain/board-data/index.ts` — create; parse/safe-parse wrappers and error formatting.
- `tests/shared/domain/board-data/board-data.test.ts` — create; valid and invalid fixture tests.
- `tests/shared/domain/board-data/fixtures/valid-multi-phase.json` — create; prototype-derived three-phase exercise.
- `tests/shared/domain/board-data/fixtures/invalid-missing-position.json` — create; phase 2 omits a token position.
- `tests/shared/domain/board-data/fixtures/invalid-unknown-kind.json` — create; token kind is not `player` or `keeper`.
- `tests/shared/domain/board-data/fixtures/invalid-unknown-version.json` — create; unsupported `schemaVersion`.
- `tests/shared/domain/board-data/fixtures/invalid-strict-field.json` — create; unexpected property.
- `docs/board-data-schema.md` — create; durable schema contract and versioning policy.
- `docs/specs/board-data-schema.md` — this spec.
- `docs/domain-model.md` — update; link Board Data to the versioned schema.
- `docs/risks-and-open-questions.md` — update; mark the schema question resolved.
- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — update status, verification path, and evidence.

## Visual Design Impact

- UI involved: no.
- Design source: not applicable; Board Data stores semantics only.
- Screens or states affected: none. The later renderer consumes this contract.
- New design artifact required: no.
- The coordinate system and 2:1 invariant follow `DESIGN.md`, but no screen is built here.

## Durable Documentation Impact

- `ARCHITECTURE.md`: not needed — this is a data contract, not a new runtime surface or dependency direction.
- `CONSTRAINTS.md`: not needed — the schema document and the existing AGENTS.md publication rule carry the requirements.
- `AGENTS.md`: update — verification now includes schema tests, project status and next feature change, and the schema doc joins the read-on-demand list.
- Other docs: `docs/board-data-schema.md` (create), `docs/domain-model.md` and `docs/risks-and-open-questions.md` (update).

## Implementation Plan

1. Install dependencies and add the test/verify scripts.
2. Implement the schema, refinements, types, and parser wrappers.
3. Add fixtures and tests; make `npm test` pass and include it in `npm run verify`.
4. Document the contract and versioning, update durable docs and harness state, then run `./init.sh`.

## Implementation Tasks

- [x] Install `zod`, `@types/node`, and `tsx`; add `test`/`test` scripts and include the schema tests in `verify`.
- [x] Implement `BOARD_DATA_SCHEMA_VERSION`, strict Zod schema, inferred types, and identifier/text limits.
- [x] Add cross-field refinements for token completeness, uniqueness, phase order, and arrow endpoints.
- [x] Implement `parseBoardData`, `safeParseBoardData`, `BoardDataValidationError`, and issue path formatting.
- [x] Create the valid three-phase fixture and the four invalid fixtures.
- [x] Add `node:test` coverage for valid parsing and each invalid case, including clear paths and messages.
- [x] Write `docs/board-data-schema.md` with coordinates, fields, limits, rules, and versioning policy.
- [x] Update `docs/domain-model.md`, `docs/risks-and-open-questions.md`, `AGENTS.md`, `PROGRESS.md`, and `feature_list.json`.
- [x] Run `npm run verify`, `./init.sh`, and an Android export smoke check.

## Verification Plan

- `npm test` — all schema tests pass and invalid fixtures fail for the intended reason.
- `npm run verify` — ESLint, `tsc --noEmit`, schema tests, and `expo-doctor` 20/20 pass.
- `./init.sh` — exits 0, runs the full gate including schema tests, and does not start Metro.
- `npx expo export --platform android` — still bundles after the dependency/config changes.
- Inspect validator error output for the missing-position fixture and confirm it names the phase, the positions array, and the missing token id.
- No device verification is required because this feature adds no screen or user-visible behavior.
- No persistent E2E harness exists, and this is a pure data contract; unit tests are the correct coverage level. Add E2E when the renderer and playback exist.

## Evidence To Capture

- `npm test` output with pass/fail counts.
- `npm run verify` output and exit code.
- `./init.sh` exit code.
- Android export result.
- Exact error path/message for the missing-position and unknown-kind fixtures.
- Confirmation that `schemaVersion` `1.0.0` is recorded in code and docs.

## Validator Checklist

- [ ] Implementation stays within this feature's scope.
- [ ] Acceptance scenarios pass.
- [ ] Verification evidence is present.
- [ ] Persistent E2E coverage was added/updated when the feature has an observable user/API flow and an E2E harness exists, or the spec explains why it is not needed.
- [ ] `feature_list.json` and `PROGRESS.md` were updated correctly.
- [ ] No unrelated product behavior or extra feature work was added.
