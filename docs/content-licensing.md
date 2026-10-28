# Content Licensing And Provenance

The durable licensing policy for the bundled Exercise Library and Programming. Every Exercise and Programming record declares where it came from and under what permission it may ship. The policy is enforced in code, not just written down: the package parser refuses to publish unlicensed material and the read layer filters any record that slips past it.

The concrete `ContentProvenance` shape, the package contract, and the validation order live in `docs/content-model.md`. This document owns the policy, the source register, and the author checklist.

## Policy

1. Every Exercise and Programming record carries `provenance` with `kind`, `sourceName`, and `licenseStatus`.
2. Only `owned` and `permitted` license statuses may be published. Draft and archived records may hold any status.
3. `kind` and `licenseStatus` cannot contradict each other.
4. Published content whose permission depends on credit (`licenseStatus: 'permitted'` or `kind: 'cmd-mora'`) must carry an `attribution`.
5. The read layer returns only records that are both `published` and publishable, so a repository that bypasses the parser still cannot leak unlicensed content into browsing or later AI grounding.
6. The app ships no third-party material without recorded permission. External reference sites are inspiration only, never redistribution sources.
7. `Exercise.references` is an inspiration citation, not provenance: it grants no rights, is never used in place of `provenance`, and cannot publish otherwise unlicensed material.

### Rule Table

| Status | Draft / archived exercise | Published exercise | Published programming |
| --- | --- | --- | --- |
| `owned` | allowed | allowed | allowed |
| `permitted` | allowed | allowed, `attribution` required | allowed, `attribution` required |
| `pending` | allowed | rejected | rejected |
| `unlicensed` | allowed | rejected | rejected |
| `reference-only` | allowed | rejected | rejected |

### Kind And Status Compatibility

| `kind` | Meaning | Allowed `licenseStatus` |
| --- | --- | --- |
| `original` | Written by the team for Futsal Manager AI | any status (still obeys the publish gate) |
| `cmd-mora` | CMD Mora club material used with permission | `permitted` only |
| `reference` | Inspiration-only source; never redistributable | `reference-only` or `pending` only |

`reference` can never be claimed as `owned` or `permitted`, and `cmd-mora` is always `permitted`. Because `reference` and `pending` cannot be published, reference material can only live in the package as an unpublished draft.

### License Status Meanings

- `owned` — the team holds the rights; no attribution obligation.
- `permitted` — a third party granted permission to use and redistribute the material, with credit.
- `reference-only` — consulted for inspiration only; must not be redistributed.
- `pending` — provenance or permission is not settled yet; may not be published.
- `unlicensed` — no usage right recorded; may not be published.

## Attribution Rule

`requiresAttribution(provenance)` is true when `licenseStatus === 'permitted'` or `kind === 'cmd-mora'`. A published record that satisfies it and omits `attribution` fails validation.

Attribution *display* is shipped: the exercise detail screen renders `provenance.attribution` verbatim under `Atribución` when present. The policy guarantees the value exists.

## Enforcement Points

The policy lives in `src/modules/content/domain/provenance.ts`; the package schema and the tests both derive their expectations from it, so they cannot drift.

| Check | Where | Issue path | Message shape |
| --- | --- | --- | --- |
| Missing provenance block | `provenanceSchema` in `content-package.ts` | `exercises.<i>.provenance` / `programming.<i>.provenance` | `Provenance is required on every Exercise and Programming record.` |
| Published with a non-publishable status | package `superRefine`, rule R1 | `exercises.<i>.provenance.licenseStatus` / `programming.<i>.provenance.licenseStatus` | `Published content requires licenseStatus "owned" or "permitted"; "unlicensed" cannot be published.` |
| Permission-dependent record without attribution | package `superRefine`, rule R2 | `exercises.<i>.provenance.attribution` / `programming.<i>.provenance.attribution` | `Published content with licenseStatus "permitted" requires an attribution naming the credited source.` |
| Kind/status contradiction (drafts included) | package `superRefine`, rule R3 | `exercises.<i>.provenance.licenseStatus` / `programming.<i>.provenance.licenseStatus` | `License status "owned" is not allowed for kind "reference"; use "reference-only" or "pending".` |
| Published but unlicensed at read time | `isPublishableExercise` / `isPublishableProgramming` in the domain, used by `listExercises`, `getExercise`, `getProgramming` | no issue; the record is skipped and lookups return `null` | — |

Parsing issues surface through `safeParseContentPackage` / `ContentValidationError` with dot paths, the same style as Board Data issues.

`isPublishedExercise` and `isPublishedProgramming` remain status-only predicates for authoring and tooling. They are never a visibility rule: use the publishable predicates for anything the app shows or AI grounds on.

## Source Register

Record every source the library draws on. Update this table before adding material that mentions a new source.

| Source | Kind | License status | May ship? | Notes |
| --- | --- | --- | --- | --- |
| Futsal Manager AI (in-house authorship) | `original` | `owned` | yes | Seed: 50 library exercises, 21 weekly highlights and seven Programming records. |
| CMD Mora season programme (club presentation) | `cmd-mora` | `permitted` | yes, with attribution, once written permission is recorded | Attribution names CMD Mora. Not seeded yet; `pending` until the permission is documented. |
| `adrimartinofutsal.es.tl` | `reference` | `reference-only` | no | Inspiration for exercise ideas, warm-ups and goalkeepers; cited by five weekly highlights. |
| `futsalcoach.es` | `reference` | `reference-only` | no | Inspiration only; currently uncited by the seed. |
| `keepmove.net` | `reference` | `reference-only` | no | Inspiration for categorised resources and planning; cited by five weekly highlights. |
| `ejerciciosdefutbolsala.com` | `reference` | `reference-only` | no | Inspiration for systems, set pieces and goalkeepers; cited by five weekly highlights. |
| `editorial.uefa.com` (UEFA futsal coaching manual) | `reference` | `reference-only` | no | Inspiration for periodisation and playing principles; cited by six weekly highlights. |

The seed audit test (`tests/modules/content/infrastructure/seed-provenance.test.ts`) audits all 78 seeded records — 71 exercises plus seven Programming records — at their canonical ids and asserts that no record is `reference`, that every record is `original` / `owned` / `Futsal Manager AI`, that no record carries `attribution`, and that no `sourceName` names one of the five inspiration-only sources. It also asserts that only weekly records carry `references`, exactly one citation each, and that every citation is a public http(s) URL with one of the four citation labels. Keep that list in sync when the seed grows or a new source is considered.

## Reference Citation Rule

`Exercise.references` stores an **inspiration citation**, not provenance and not a licence:

- A reference is a `{ label, url }` pointer to the public resource that inspired an original exercise; it grants no redistribution right and never satisfies the publish gate.
- References must never appear in `provenance.sourceName` or `provenance.attribution`, and a cited source is still `reference-only` in the source register.
- The weekly seed carries exactly one citation per record, with an absolute public http(s) URL; the parser allows up to three and rejects non-http(s) URLs.
- The exercise detail screen displays the citation under `Inspirado en` with its label, public URL and the original-content disclaimer; it must not imply endorsement or copied expression. The 21 weekly records are original authorship and passed a technical originality check during validation (no 5- or 6-word overlap and no identical titles against the four cited sources); this is not a legal opinion, so a human review is still advisable before public release.

## Author Checklist

Before adding or changing content in `content-package.json`:

- [ ] The material is either written by us, or covered by a recorded permission; inspiration-only sources never enter the package.
- [ ] `provenance.kind`, `provenance.sourceName`, and `provenance.licenseStatus` are present and consistent with the table above.
- [ ] CMD Mora material is `kind: 'cmd-mora'` with `licenseStatus: 'permitted'` and an `attribution` naming the club.
- [ ] Published records use `owned` or `permitted`; anything unsettled stays `draft`.
- [ ] The source register above lists the source.
- [ ] The exercise is original expression; a `references` citation is added for the public inspiration source when one exists, and the URL is absolute http(s).
- [ ] `references` is not used as provenance: `provenance.kind`/`licenseStatus` still reflect the real rights, and a citation never unlocks publication.
- [ ] Every exercise `boardData` is valid Board Data `1.0.0` (`parseBoardData` runs inside the package parser).
- [ ] `npm test` passes, including the seed audit, and `npm run verify` is clean.

## Escape Hatch

A genuinely licensed third-party source that we may redistribute does not fit the current `kind` values (`original`, `cmd-mora`, `reference`). Adding one is an additive contract change: add the `kind` (and status, if needed) to `domain/provenance.ts`, extend the kind/status table, bump `CONTENT_PACKAGE_VERSION` and the JSON `contentVersion` together, and record the permission. Never repurpose `reference` or `pending` to mean "allowed after all".

## Open Task

CMD Mora's permission is a recorded decision but not yet documented in writing. Keep it open in `docs/risks-and-open-questions.md`, keep CMD Mora material `pending` (thus unpublished) until the permission is recorded, and credit the club in `attribution` when it ships.

## Related

- `docs/content-model.md` — `ContentProvenance` shape, package invariants, validation order.
- `docs/domain-model.md` — published lifecycle and the provenance rule in domain language.
- `docs/risks-and-open-questions.md` — legal/IP risk and the written-permission research task.
- `docs/build-brief.md` — product-level constraint that external sites are inspiration only.
