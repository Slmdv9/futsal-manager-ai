# Risks and Open Questions

## Resolved Decisions

- **2026-10-26 — Stack.** React Native + Expo with Expo Router, `react-native-svg` for the board, and Expo Router API routes on EAS Hosting.
- **2026-10-26 — Board rendering.** SVG with full keyframe positions per phase, interpolated between phases.
- **2026-10-26 — Seed content licensing.** Original content plus CMD Mora material used with the club's permission; the external reference sites are inspiration only, not redistribution sources. Enforced in code by `seed-content-licensing`: policy, source register, and author checklist in `docs/content-licensing.md`.
- **2026-10-26 — AI provider.** DevExpert Inference (OpenAI-compatible API, `DEVEXPERT_API_KEY`), model `chat` for session generator, variant adapter, and chatbot. Voice via `transcribe` is deferred.
- **2026-10-26 — Content storage.** Versioned JSON in the repo, validated at build time and shared by the app bundle and the API. No database in the MVP.
- **2026-10-26 — Anonymous quota.** 5 AI requests per day, keyed by Expo installation ID plus hashed IP, enforced server-side.
- **2026-10-26 — Offline.** Bundled content and board playback work offline; AI-generated sessions and variants are saved locally on the device.
- **2026-10-26 — Seed scope.** Infantil U14 fully seeded; minimum three exercises plus programming for each of the other six categories. Implemented on `2026-10-27` by `seed-remaining-categories`; the coach then asked for a full training-session shape, delivered by `seed-session-structure`: 50 exercises and seven Programming records, all `original`/`owned`, grouped as 2/3/2 per non-Infantil category and 2/5/2 for Infantil.
- **2026-10-26 — Board Data schema.** Frozen at v1.0.0 in `docs/board-data-schema.md`: normalized 0–100 coordinates on a full 2:1 pitch, board-level tokens and static cones, per-phase positions/ball/arrows/labels, exactly one position per token per phase, strict unknown-key rejection, and a literal `schemaVersion`. Runtime validation ships with the contract; unknown versions are rejected and there are no MVP migrations.

## Blocking Next Phase

None. The stack, Board Data schema, and content licensing are resolved, the licence gate is implemented, all seven RFEF categories are session-shaped, and the general Explorar screen is implemented; the next feature ready to start is `explore-by-category-screen`. The coach's request to show the board drawing in exercise cards is captured by `exercise-preview-board-thumbnail`, deferred behind `tactics-board-renderer`.

## Implementation-Time Questions

- Retrieval approach: embeddings vs keyword search over a small curated library.
- Whether DevExpert `chat` reliably produces valid structured JSON for sessions and variants, or whether those two features need `chat-pro`.
- Quota edge cases: shared club/school networks, timezone used for the daily reset, and what happens if the installation ID changes.
- How Phase explanations and coaching cues are authored: manually, AI-drafted then reviewed, or both.
- Whether an AI-assisted variant becomes part of a session or always stays standalone.
- Where locally saved AI results live and how the coach clears them.
- Chat placement on mobile: full screen tab vs bottom sheet over the board.
- Category selection is intentionally session-only; if coaches expect it to survive an app restart, `local-ai-results-persistence` or a settings feature owns that storage decision.
- There is no week, session or scheduler model, no clock port, and no persistence for a rotating plan. Explorar's "Ejercicios de la Semana" block is a deterministic curated slice (one exercise per session part, first in package order); a real scheduling feature must replace the rule and the copy.
- The Explorar AI entry is a navigation link to the existing Asistente IA tab, which still renders its `PRÓXIMAMENTE` placeholder until `ai-session-generator-ui` lands; the link passes no category context because nothing consumes it yet.
- The repository still has no React Native component-test runner. The general Explorar screen is covered by pure view-model tests, a source-structure guard, the composition-wiring test, and the device smoke; adopting a Jest-based RNTL runner is its own feature-sized decision before more interactive screens land.

## Later / Not MVP

- Accounts, login, and the "Gestionar mi propio equipo" flow.
- Team management: multiple teams per account, roster/player profiles (minimal sports profile agreed: name/nickname, number, position, status; guardians' contact data deliberately excluded).
- Coach-owned Season planning with a session calendar and objectives.
- PDF export and shareable links.
- Voice input for the chatbot and session prompts (`transcribe`).
- Player-level training/attendance tracking, match-day management.
- Multi-language UI and multi-club administration.

## Assumptions

- Coaches will use the app on a phone/tablet, sometimes on the pitch, so mobile legibility, offline access, and fast load matter more than desktop density.
- A curated seed library is higher quality and lower risk than AI-generated content, and the AI can be grounded on it.
- Anonymous browsing is acceptable as the default acquisition experience and reduces privacy/compliance scope.
- The prototype's four screens are the correct MVP surface; "Mi Club" is a locked next-phase entry point.
- DevExpert Inference exposes the same API contract in production as in the provided example, and its cost/latency are acceptable for the quota.

## Risks

- **"Semana" copy without a scheduler.** Explorar labels the block `Ejercicios de la Semana`, but there is no week, calendar, clock port or persisted rotation state. The slice is deterministic (first exercise per session part, in package order), so the label could imply a scheduling feature that does not exist. Mitigation: the subtitle states the rule, the counter shows `3 de N`, and a future scheduling feature owns week rolls, recency and persistence.
- **AI entry point visibility.** The AI session card sits below the customer-facing hero and the category filter; on short screens a long fold could push the card out of the first view. Mitigation: keep the hero compact, avoid an extra page title, and check the rendered layout on the Android device; if it fails, move the AI card above the filter row.
- **Content quality and freshness.** The next visible step is `explore-by-category-screen`, but the current library is a fixed seed; a missing or stale exercise/category will surface directly in the weekly slice without any fallback beyond the empty copy. Mitigation: keep the publishable-only read layer authoritative, and treat content updates as a content-package change.
- **Generated session placeholder.** The AI card points at the Asistente IA tab, which is still a `PRÓXIMAMENTE` placeholder; a coach could interpret the card as a working generator. Mitigation: the card copy explicitly says generation arrives in the next phase, and `ai-session-generator-ui` will replace the placeholder.
- **Content quality/volume.** The library is the product's core value; a thin or low-quality seed makes the AI and the board feel generic. Mitigation: every RFEF category is now session-shaped with seven exercises and a Programming record (50 exercises, seven records), split 2 warm-up / 3 main / 2 cool-down except Infantil's 2/5/2, so Explorar reads like a session. Coach review of load, intensity, and age-appropriateness — especially U8 without specialist keepers versus Senior high-intensity blocks — is still pending. Board legibility of the hand-authored geometry is unverified until `tactics-board-renderer`.
- **Infantil U14 session-part assignment.** Keeping all nine Infantil drills forces 2 warm-up / 5 main / 2 cool-down instead of the 2/3/2 used elsewhere; `juego-posicion-3-1-pivote` (14 min, medium 75) opens the session and the two lowest-load drills close it. It is the only assignment that keeps two drills in each end without adding or deleting content. Open for coach review; changing it is a data-only edit to `sessionPart`.
- **Small-space geometry on the full board.** Prebenjamín and Benjamín drills use 10×10 to 20×20 spaces drawn inside the full 2:1 pitch. Coordinates are parser-valid but not visually reviewed, so the drills may render cramped or off-centre. Mitigation: keep every geometry inside a coherent sub-region, and review legibility in `tactics-board-renderer`.
- **Legacy boards carry fewer tokens than players.** Five frozen legacy boards predate the session-structure authoring rule: `salida-3-1-presion-alta` seeds 9 tokens / 2 keepers for 10 players / 2 goalkeepers, `circulacion-cierre-ala` 6 / 1 for 8 / 2, `presion-tras-perdida` 6 / 1 for 10 / 2, `rondo-4v1-orientacion` 5 / 0 for 6 / 0, and `transicion-3v2-tras-robo` 6 / 1 for 7 / 1. Board Data `1.0.0` and `parseBoardData` accept them, and only the 24 new boards are asserted to have `tokens` = `players.total` with keeper count = `players.goalkeepers`. Mitigation: `tactics-board-renderer` draws the tokens it is given and must not derive player or keeper counts from `players`; re-authoring the five legacy boards would be a separate content change.
- **AI hallucination.** The board, session generator, and chatbot can produce plausible but invented tactics. Mitigation: mandatory grounding, cite source exercises, validate Board Data schema, and show provenance.
- **Anonymous AI cost/abuse.** A 5/day quota plus installation ID and hashed IP reduces abuse, but shared networks and reset tricks remain. Mitigation: server-side key, rate limiting, per-request caps, logging.
- **Structured-output reliability.** DevExpert `chat` may return JSON that fails Board Data validation. Mitigation: strict JSON schema prompts, server-side validation, retry/fallback, and escalate to `chat-pro` if needed.
- **Board rendering complexity.** SVG interpolation across phases, tokens, and arrows is non-trivial on React Native. Mitigation: freeze the schema early and cover it with golden tests.
- **Offline/local persistence bugs.** Locally saved AI results can go stale or corrupt. Mitigation: version the local record format and test reopen-after-restart.
- **Category taxonomy drift.** RFEF brackets vs school-stage content (Chupetín) can misclassify exercises. Mitigation: explicit mapping table, no runtime guessing.
- **Legal/IP on source material.** Original content and CMD Mora permission still need to be documented in writing. Mitigation: the licence policy is now enforced in code — parsing rejects publishing `pending`/`unlicensed`/`reference-only` material and rejects `kind`/`licenseStatus` contradictions, published permission-dependent content needs attribution, and the read layer filters unlicensed records (`docs/content-licensing.md`). External reference sites stay inspiration only. Remaining gap: written confirmation from CMD Mora.
- **Product naming.** "Futsal Manager AI" is the chosen name. Remaining mitigation: a basic trademark/domain check and consistent relabelling of prototype screens.
- **DevExpert dependency.** A single inference provider is a single point of failure. Mitigation: keep the gateway provider-agnostic so an OpenAI-compatible fallback can be added.
- **Expo tooling advisories.** `npm audit` currently reports four high-severity transitive advisories in `node-forge` and the `zod` nested under Expo CLI/code-signing tooling. The direct `zod@4.6.7` used by the Board Data runtime schema is outside the vulnerable range. The nested Expo CLI copy has no non-breaking fix; `node-forge` has a non-breaking `npm audit fix` available. Mitigation: keep the Expo CLI on the build-time path only, rerun the audit on dependency changes, and upgrade when Expo ships a compatible release.
- **Explorar builds the browse model twice.** `ExploreScreen` calls `buildCategoryBrowseModel` and `buildExploreGeneralModel` also builds it internally, so a selected render performs two in-memory builds. Harmless at 50 records, but if the browse model later gains cost or state, pass a single shared model. Recorded by the `explore-general-screen` validator as an optional, non-blocking refactor.
- **32-bit Android test device.** The connected Galaxy M13 reports only `armeabi-v7a`. Expo Go 58.0.5 and the native debug build work, but the build emits Google Play's 64-bit warning because it packages only 32-bit native libraries. Mitigation: add a 64-bit Android phone or tablet to `mobile-device-verification`, and make release builds include `arm64-v8a`.

## Research Tasks

- Confirm CMD Mora's permission in writing and record it with the seeded content. Until then CMD Mora material stays `pending` (unpublishable) and no CMD Mora record is seeded; the rule is in `docs/content-licensing.md`.
- Confirm DevExpert Inference production pricing, rate limits, and structured-output support for `chat`.
- Prototype the Board Data schema against 5–10 real exercises of varying complexity to confirm it is expressive enough for SVG keyframes.
- Estimate LLM cost per typical session/variant/chat and confirm the 5/day quota is sustainable.
- Test pitch-distance legibility of the board on a real iOS/Android phone and tablet.
