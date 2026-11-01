# Feature Implementation Spec: Record provenance and licensing for seed content

## Source Feature

- **id:** `seed-content-licensing`
- **area:** `content`
- **status:** `accepted`
- **depends_on:** `content-model-and-store` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/seed-content-licensing` (stacked on the accepted `feat/content-model-and-store` work)

## Goal

Make provenance a rule instead of a note. `ContentProvenance` already exists on every `Exercise` and `Programming` record and the seed package is `original` / `owned`, but nothing stops an author from setting `status: 'published'` on `unlicensed`, `pending`, or `reference-only` material.

This feature enforces the licensing policy inside the `content` module:

1. parsing rejects a package where a published record is not `owned` or `permitted`;
2. parsing rejects kind/status contradictions (`reference` material can never be claimed as owned/permitted, CMD Mora material is always `permitted`);
3. parsing rejects published `permitted` / `cmd-mora` records that omit attribution;
4. the read layer refuses publishable-looking but unlicensed records even if a repository bypasses the package parser;
5. the seeded package is audited by a test, and the policy plus source register is written down in `docs/content-licensing.md`.

## Non-Goals

- Authoring new exercises or programming (`seed-infantil-u14`, `seed-remaining-categories`).
- Displaying attribution in any screen (`exercise-detail-screen`); this feature only makes the metadata enforceable and exposes a helper.
- Adding provenance fields, a source URL field, or a permission-file field. The `ContentProvenance` shape and `contentVersion` `1.0.0` stay unchanged.
- Legal review, contracts, or scraping the reference sites. Reference sites stay inspiration only.
- Board rendering, AI grounding, retrieval filtering, offline gating, category filter UI, or any route/screen change.
- A content editor, CMS, database, or publish workflow outside the bundled JSON.
- Changing `init.sh` behavior or adding an E2E harness.

## Job Story

When I add curated material to the bundled library, I want the build and the read layer to refuse anything we do not own or are not permitted to use, and to record who to credit, so the shipped app never redistributes third-party content and the club that granted permission gets credited when its material is used.

## Users And Permissions

- Anonymous coach: unaffected browsing behavior; never sees unlicensed or reference-only content.
- Content author: edits `content-package.json`; a publishable record must state `kind`, `sourceName`, and a permitted `licenseStatus`, plus `attribution` when permission depends on credit.
- Club content provider (CMD Mora): material is `cmd-mora` / `permitted` with attribution; inspiration-only sources never enter the package.
- Validator: can inspect the package, the rule tests, and `docs/content-licensing.md` and re-run the probe.

## Acceptance Scenarios

### Scenario 1: Every seeded record carries complete provenance

Given the bundled content package
When the repository exposes its exercises and programming
Then every record has a non-empty `kind`, `sourceName`, and `licenseStatus`, and each seeded record is `original` / `owned` with `sourceName` `Futsal Manager AI`.

### Scenario 2: Publishing without a permitted license status is blocked

Given a package where a record has `status: 'published'` and `licenseStatus` of `unlicensed`, `pending`, or `reference-only`
When the package is parsed
Then parsing fails with an issue at `exercises.<i>.provenance.licenseStatus` (or `programming.<i>.provenance.licenseStatus`) and a message naming the offending status.

### Scenario 3: Missing provenance fails with an actionable path

Given a package where an exercise or programming record has no `provenance`
When the package is parsed
Then parsing fails with an issue at `exercises.<i>.provenance` (or `programming.<i>.provenance`) whose message states that provenance is required.

### Scenario 4: Kind and license status cannot contradict each other

Given a record whose `kind` is `reference` or `cmd-mora`
When the package is parsed
Then `reference` requires `licenseStatus` `reference-only` or `pending`, `cmd-mora` requires `permitted`, and any other combination fails at `...provenance.licenseStatus`.

### Scenario 5: Permission-dependent content must be attributed

Given a published record with `licenseStatus: 'permitted'` or `kind: 'cmd-mora'` and no `attribution`
When the package is parsed
Then parsing fails at `...provenance.attribution`; the same record with an `attribution` parses, and a published `original` / `owned` record still parses without one.

### Scenario 6: The read layer never returns unlicensed content

Given a repository that returns a `published` exercise or programming record whose provenance is `unlicensed`, `pending`, or `reference-only`
When `listExercises`, `getExercise`, or `getProgramming` runs
Then that record is skipped and `getExercise`/`getProgramming` return `null`, with no exception thrown.

### Scenario 7: Inspiration-only sources never reach the library

Given the seeded package and the recorded source register
When the seed audit runs
Then no seeded record is `kind: 'reference'`, no seeded `sourceName` names `adrimartinofutsal.es.tl`, `futsalcoach.es`, `keepmove.net`, or `ejerciciosdefutbolsala.com`, and no seeded record lacks a publishable status.

### Scenario 8: Existing behavior is preserved

Given the accepted `content-model-and-store` baseline
When the feature is complete
Then the three seeded exercises and the Infantil programming record are still readable, every `boardData` still validates at `1.0.0`, `CONTENT_PACKAGE_VERSION` is still `1.0.0`, and `npm run verify` plus `./init.sh` pass.

## Repository Research

### Files Inspected

- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — workflow, accepted baseline, and this feature's verification lines; dependents are `seed-infantil-u14` and onward.
- `docs/content-model.md` — `ContentProvenance` shape, the "recorded but not yet enforced" gap, package invariants, issue-path style, and "publish only `owned`/`permitted` once `seed-content-licensing` lands".
- `docs/domain-model.md`, `CONTEXT.md` — provenance recorded on every Exercise/Programming record; published lifecycle. `CONTEXT.md` has no provenance entry yet.
- `docs/risks-and-open-questions.md`, `docs/build-brief.md` — resolved licensing decision (original plus CMD Mora with club permission; reference sites inspiration only), the legal/IP risk, and the open written-permission task.
- `ARCHITECTURE.md` — `content` module catalogue, layer rules, and "licensing enforcement … separate feature".
- `src/modules/content/domain/{provenance,content-package,exercise,programming}.ts` — provenance enums, strict `provenanceSchema`, `superRefine` cross-field rules, dot-path issues, and status-only predicates with no license awareness.
- `src/modules/content/application/{list-exercises,get-exercise,get-programming}.ts` — published-only filters that a license check must join.
- `src/modules/content/infrastructure/{bundled-content-repository.ts,content/content-package.json}` — JSON parsed once; three exercises and one programming record, all `original` / `owned`, `sourceName` `Futsal Manager AI`.
- `tests/modules/content/{domain/content-package,application/content-queries,infrastructure/bundled-content-repository,index}.test.ts` — existing fixtures, clone-and-mutate pattern, fake repository builders, and the public-API source assertion.
- `package.json`, `init.sh` — `npm test` discovery, `npm run verify` gate, non-blocking `init.sh`.

### Existing Patterns To Follow

- Domain stays platform-free; provenance rules and predicates belong in `domain/provenance.ts`, cross-field package rules in `domain/content-package.ts`.
- Issues use dot paths and surface through `safeParseContentPackage` / `ContentValidationError`, matching Board Data style.
- Use cases own visibility rules; repositories stay raw.
- Tests mirror `src` under `tests/modules/content/`, use `node:test` with Given/When/Then, and import layers directly because the public API re-exports `ExploreScreen`.
- Spanish for content copy, English for identifiers, docs, and issue messages.

### Current Gaps

- `licenseStatus` is a free-form enum with no consequence: `unlicensed` + `published` parses today.
- `attribution` is optional with no rule, so club material could ship uncredited.
- `isPublishedExercise` / `isPublishedProgramming` ignore provenance, so a non-bundled repository could leak unlicensed records into browsing and later AI grounding.
- No durable licensing document, source register, or seed audit test exists.

## Technical Approach

1. **Policy lives in the domain.** Extend `domain/provenance.ts` with:
   - `PUBLISHABLE_LICENSE_STATUSES = ['owned', 'permitted'] as const` and a `PublishableLicenseStatus` type;
   - `isPublishableProvenance(provenance)` — true only for those statuses;
   - `requiresAttribution(provenance)` — true when `licenseStatus === 'permitted'` or `kind === 'cmd-mora'`;
   - kind/status compatibility expressed through a small lookup or `isLicenseStatusAllowedForKind(kind, licenseStatus)` so the schema and the tests share one rule.
2. **Publish gate in the package contract.** Inside the existing `superRefine` in `domain/content-package.ts`, add per-record checks in this order, all as `ContentValidationIssue`s:
   - R1 published ⇒ `isPublishableProvenance(provenance)`, path `exercises.<i>.provenance.licenseStatus` / `programming.<i>.provenance.licenseStatus`;
   - R2 published and `requiresAttribution(provenance)` ⇒ `attribution` present, path `...provenance.attribution`;
   - R3 kind/status compatibility for every record (draft included), path `...provenance.licenseStatus`;
   - R4 give `provenanceSchema` a `z.strictObject(..., { error: 'Provenance is required on every Exercise and Programming record.' })`-style message so a missing block reads clearly at `...provenance` (verify the Zod v4 option name against the installed `zod@4.6.x` and fall back to the default message if it is not accepted).
   - Rule text must name the offending status, e.g. `Published content requires licenseStatus "owned" or "permitted"; "unlicensed" cannot be published.`
3. **Read layer defense in depth.** Add `isPublishableExercise(exercise)` and `isPublishableProgramming(programming)` (status published **and** `isPublishableProvenance`) next to the existing status helpers, and use them in `listExercises`, `getExercise`, and `getProgramming`. Keep the existing `isPublishedExercise` / `isPublishedProgramming` exports for status-only checks; no call site in this feature should use them for visibility.
4. **No data migration.** The seeded package already satisfies the rules, so `contentVersion`/`CONTENT_PACKAGE_VERSION` stay `1.0.0`. Only the rule set is tightened; the JSON shape is unchanged.
5. **Public API and docs.** Export the new constants, types, and predicates from `src/modules/content/index.ts`; document the policy, the issue paths, and the source register in a new `docs/content-licensing.md`; reconcile the "not yet enforced" gaps in `docs/content-model.md`.
6. **Audit the real package in tests.** A dedicated infrastructure test loads `createBundledContentRepository()` and asserts Scenario 1 and 7 over the shipped records, so a future seed feature cannot add a `reference` or unlicensed record unnoticed.

### Rule Table

| Status | Draft/archived exercise | Published exercise | Published programming |
| --- | --- | --- | --- |
| `owned` | allowed | allowed | allowed |
| `permitted` | allowed | allowed, `attribution` required | allowed, `attribution` required |
| `pending` | allowed | rejected | rejected |
| `unlicensed` | allowed | rejected | rejected |
| `reference-only` | allowed | rejected | rejected |

`kind: 'cmd-mora'` ⇒ `permitted`; `kind: 'reference'` ⇒ `reference-only` or `pending`; `kind: 'original'` accepts any status but still obeys the publish gate.

## Expected File Changes

### `src/modules/content/domain`

- `provenance.ts` — `PUBLISHABLE_LICENSE_STATUSES`, `PublishableLicenseStatus`, `isPublishableProvenance`, `requiresAttribution`, and the kind/status compatibility helper.
- `content-package.ts` — publish gate, attribution rule, kind/status rule, and the missing-provenance message inside the existing schema/`superRefine`.
- `exercise.ts`, `programming.ts` — `isPublishableExercise`, `isPublishableProgramming`.

### `src/modules/content/application`

- `list-exercises.ts`, `get-exercise.ts`, `get-programming.ts` — switch the visibility check to the publishable predicates.

### `src/modules/content` (public API and module docs)

- `index.ts` — export the new constants, helpers, and predicates.
- `README.md` — state the licensing gate, the read-layer rule, and where the policy is documented.
- `infrastructure/content/content-package.json` — unchanged unless a record is found to violate the new rules (it currently does not).

### Tests (`tests/modules/content`)

- `domain/provenance.test.ts` — new: publishable statuses, attribution requirement, kind/status compatibility.
- `domain/content-package.test.ts` — update: published + `unlicensed`/`pending`/`reference-only` fails for exercises and programming; missing provenance path; `reference` + `owned` and `cmd-mora` + `owned` rejected; published `permitted` without attribution rejected, with attribution accepted; draft `pending` still accepted; existing scenarios still pass. `domain/fixtures/valid-content-package.json` already satisfies the new rules and stays unchanged; new cases clone and mutate it.
- `application/content-queries.test.ts` — update: fake repositories returning published-but-unlicensed exercise and programming records are filtered out and lookups return `null`.
- `infrastructure/seed-provenance.test.ts` — new: audit the real bundled package (Scenarios 1 and 7).
- `index.test.ts` — update: the required public-API export list includes the new names.

### Docs And Harness

- `docs/content-licensing.md` — create: policy, status meanings, the four reference domains as inspiration only, CMD Mora permission and attribution rule, source register, author checklist, issue paths, and the still-open written-permission task.
- `docs/content-model.md` — update: enforced rules, issue paths, provenance section, "Adding Or Changing Content" steps, Known Gaps.
- `ARCHITECTURE.md` — update: one line in the `content` catalogue naming the licensing gate; no dependency-graph change.
- `docs/domain-model.md` — update: published provenance rule.
- `docs/risks-and-open-questions.md` — update: legal/IP mitigation now enforced, remaining written-permission research task, stale "next feature" line.
- `docs/build-brief.md` — update: point line 67 at `docs/content-licensing.md`.
- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — status, evidence, next feature.
- `docs/specs/seed-content-licensing.md` — this spec; tick tasks and record implementation notes.

## Visual Design Impact

- UI involved: no. `DESIGN.md` is unaffected; no new copy, color, font, or component.
- The Explorar placeholder stays as-is; attribution rendering is deferred to `exercise-detail-screen`.
- No device scenario is added; confirm the app still boots and Explorar renders unchanged on the Galaxy M13.

## Durable Documentation Impact

- `ARCHITECTURE.md`: update — content module catalogue mentions the licensing gate; no layer, port, or dependency change.
- `CONSTRAINTS.md`: not needed — the file does not exist; policy lives in `docs/content-licensing.md` and `docs/content-model.md`.
- `AGENTS.md`: update — project status, next feature, and `docs/content-licensing.md` on the read-first list; content verification bullet mentions the license gate.
- `DESIGN.md`: not needed — no visual change.
- `CONTEXT.md`: not needed — no new domain term; `ContentProvenance` stays an implementation-level contract owned by `docs/content-model.md`.
- Other: create `docs/content-licensing.md`; update `docs/content-model.md`, `docs/domain-model.md`, `docs/risks-and-open-questions.md`, `docs/build-brief.md`, `src/modules/content/README.md`, `PROGRESS.md`, `feature_list.json`.

## Implementation Plan

1. Add the provenance policy helpers and the kind/status compatibility table in `domain/provenance.ts`.
2. Wire the publish gate, attribution rule, kind/status rule, and missing-provenance message into `domain/content-package.ts`.
3. Add `isPublishableExercise` / `isPublishableProgramming` and use them in the three read use cases.
4. Export the new surface from `index.ts` and update the module README.
5. Add and update the five test files; prove each rule with a clone-and-mutate case and audit the real package.
6. Write `docs/content-licensing.md`; update the durable docs and harness state.
7. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run verify`, `./init.sh`, the Android export, an invalid-package probe, and the exploratory device smoke.

## Implementation Tasks

- [x] Add `PUBLISHABLE_LICENSE_STATUSES`, `isPublishableProvenance`, `requiresAttribution`, and the kind/status compatibility helper.
- [x] Enforce the publish gate, attribution rule, kind/status rule, and clear missing-provenance message in `content-package.ts`.
- [x] Add and apply the publishable predicates in the read use cases.
- [x] Export the new public API surface and update the module README.
- [x] Add `tests/modules/content/domain/provenance.test.ts` and extend `content-package.test.ts`.
- [x] Extend `content-queries.test.ts` with published-but-unlicensed fake records.
- [x] Add `tests/modules/content/infrastructure/seed-provenance.test.ts` auditing the shipped package.
- [x] Update `tests/modules/content/index.test.ts` with the new exports.
- [x] Write `docs/content-licensing.md` with the policy, source register, and author checklist.
- [x] Update `docs/content-model.md`, `ARCHITECTURE.md`, `docs/domain-model.md`, `docs/risks-and-open-questions.md`, `docs/build-brief.md`, `AGENTS.md`, `PROGRESS.md`, and `feature_list.json`.
- [x] Run the full gate, the invalid-package probes, the Android export, and the Explorar device smoke; record evidence.

## Verification Plan

- `npm test` — 55/55 across 86 suites today; expect the same suites plus the new ones, all passing.
- Domain probes on an in-memory clone of the shipped package (no file edits): set `exercises[0].provenance.licenseStatus` to `unlicensed`, delete `exercises[0].provenance`, and publish a `permitted` record without `attribution`; confirm the three issue paths and messages, then confirm the untouched package still parses.
- `npm run lint` — boundaries unchanged: `content` still imports only its own layers and `shared/domain`.
- `npm run typecheck`; `npm run verify` exit 0 with `expo-doctor` 20/20; `./init.sh` exit 0 and still never starts Metro.
- `npx expo export --platform android` — the bundled package still ships and the bundle contains the seeded ids.
- Seed audit output — list the provenance of all four seeded records and confirm ownership.
- Device smoke on `SM-M135F` — the app boots and Explorar renders the unchanged placeholder with no React Native errors in `logcat`.
- Persistent E2E: none exists, and this feature changes no route, API route, or screen; `node:test` domain/application/infrastructure coverage plus the seed audit is the correct level, with the device smoke guarding the route.
- `init.sh` behavior unchanged: non-blocking checks only.

## Evidence To Capture

- Test counts before and after (`55/55` across `86` suites baseline).
- Exact issue paths and messages for the four probes (unlicensed publish, missing provenance, permitted without attribution, `reference` + `owned`), plus confirmation that a draft record with `pending` provenance still parses.
- Seed audit output: `original` / `owned` for all three exercises and the Infantil programming record.
- `npm run verify` exit code and `expo-doctor` score; `./init.sh` exit code; Android export size.
- `contentVersion`, `CONTENT_PACKAGE_VERSION`, and Board Data still `1.0.0`; device model and the Explorar smoke result.

## Implementation Notes

- Keep the policy in one place: the schema and the unit tests should both derive expectations from the exported helpers so parser and tests cannot drift.
- `ContentProvenance` shape, JSON keys, and the package version are unchanged; only validation strictness changes. If a field must be added, bump `CONTENT_PACKAGE_VERSION` and the JSON `contentVersion` together and document it.
- Attribution *display* stays out of scope; `requiresAttribution` plus the enforced `attribution` value is what `exercise-detail-screen` renders later. Reconcile `docs/content-model.md`'s "showing attribution belongs to `seed-content-licensing`" line so the durable docs do not promise UI here.

## Validator Checklist

- [x] Scope stays inside `content` domain/application/infrastructure/API, mirrored tests, and docs; no UI, AI, board, or new seed volume.
- [x] All eight acceptance scenarios pass with recorded evidence.
- [x] Publishing `unlicensed`/`pending`/`reference-only` content fails at `...provenance.licenseStatus` for both exercises and programming.
- [x] Missing provenance fails with a clear path; `reference` and `cmd-mora` kind contradictions are rejected.
- [x] Published `permitted`/`cmd-mora` content without `attribution` is rejected.
- [x] The read layer filters published-but-unlicensed records from a non-bundled repository.
- [x] No seeded record is `reference` or names one of the four inspiration-only domains.
- [x] `npm run verify` and `./init.sh` pass, the Android export succeeds, and Explorar is unchanged on device.
- [x] `docs/content-licensing.md` exists and the durable docs listed above are updated, with the CMD Mora written-permission task still tracked.
- [x] `contentVersion` and `CONTENT_PACKAGE_VERSION` are still `1.0.0`, and Board Data is still `1.0.0`.
- [x] Task checkboxes are ticked and evidence recorded in `feature_list.json` and `PROGRESS.md`.

## Planning-Time Risks

- **Policy is not proof.** The gate records and enforces declared licensing; it cannot verify that CMD Mora's permission exists in writing. Mitigation: keep the written-permission research task open in `docs/risks-and-open-questions.md`, keep `pending` unpublishable, and refuse to seed CMD Mora material until the permission is documented.
- **`reference` kind becomes unpublishable by design.** A future genuinely licensed third-party source would need a new kind or status. Mitigation: document the escape hatch (additive contract change with a version bump) in `docs/content-licensing.md`.
- **Two similar predicates.** `isPublishedExercise` (status only) and `isPublishableExercise` (status plus license) could be confused by future code, especially AI grounding. Mitigation: use cases use the publishable predicate, README/docs state the rule, and grounding work must go through the read layer.
- **Attribution copy is undefined.** No screen consumes `attribution` yet, so wording and placement are unverified. Mitigation: enforce the value now and leave Spanish copy to `exercise-detail-screen`.
- **Reference-domain list drift.** The four inspiration domains live in the audit test and docs, not in domain code. Mitigation: the audit test is the guard; extend the list when a new source is considered.
- **Error-message churn.** Zod's custom `error` option on object schemas differs across versions. Mitigation: check the installed `zod@4.6.x` API and accept the default message if the custom one is unsupported, as long as the path is `...provenance`.

## Implementation Notes (Recorded)

- The installed `zod@4.6.7` accepts `z.strictObject(shape, { error })`, so a missing provenance block reports `Provenance is required on every Exercise and Programming record.` at `exercises.<i>.provenance` / `programming.<i>.provenance` with no fallback needed.
- Policy lives in `domain/provenance.ts`: `PUBLISHABLE_LICENSE_STATUSES` (`['owned', 'permitted']`), `LICENSE_STATUSES_BY_PROVENANCE_KIND` (the single kind/status table used by both the schema and the tests), `isLicenseStatusAllowedForKind`, `isPublishableProvenance`, and `requiresAttribution` (`licenseStatus === 'permitted' || kind === 'cmd-mora'`).
- `content-package.ts` builds every licence message from those helpers, so the parser and the unit tests cannot drift. Rule order inside the existing `superRefine` is R1 publish gate, R2 attribution, R3 kind/status. Both records are checked, and the programming provenance check runs before the draft early-return so drafts are checked for kind/status too.
- Read layer: `isPublishableExercise` / `isPublishableProgramming` are the visibility rule in `listExercises`, `getExercise`, and `getProgramming`. `isPublishedExercise` / `isPublishedProgramming` remain exported status-only helpers.
- `ContentProvenance`, the JSON keys, `contentVersion`, `CONTENT_PACKAGE_VERSION`, and Board Data all stay `1.0.0`; no seed record changed.
- Tests were added at domain, application, and infrastructure level plus the public API surface check. There is no persistent E2E harness and the feature changes no route, API route, or screen, so the device smoke guards the Explorar route.
