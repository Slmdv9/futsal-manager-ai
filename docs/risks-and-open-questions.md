# Risks and Open Questions

## Resolved Decisions

- **2026-10-26 — Stack.** React Native + Expo with Expo Router, `react-native-svg` for the board, and Expo Router API routes on EAS Hosting.
- **2026-10-26 — Board rendering.** SVG with full keyframe positions per phase, interpolated between phases.
- **2026-10-26 — Seed content licensing.** Original content plus CMD Mora material used with the club's permission; the external reference sites are inspiration only, not redistribution sources.
- **2026-10-26 — AI provider.** DevExpert Inference (OpenAI-compatible API, `DEVEXPERT_API_KEY`), model `chat` for session generator, variant adapter, and chatbot. Voice via `transcribe` is deferred.
- **2026-10-26 — Content storage.** Versioned JSON in the repo, validated at build time and shared by the app bundle and the API. No database in the MVP.
- **2026-10-26 — Anonymous quota.** 5 AI requests per day, keyed by Expo installation ID plus hashed IP, enforced server-side.
- **2026-10-26 — Offline.** Bundled content and board playback work offline; AI-generated sessions and variants are saved locally on the device.
- **2026-10-26 — Seed scope.** Infantil U14 fully seeded; minimum three exercises plus programming for each of the other six categories.
- **2026-10-26 — Board Data schema.** Frozen at v1.0.0 in `docs/board-data-schema.md`: normalized 0–100 coordinates on a full 2:1 pitch, board-level tokens and static cones, per-phase positions/ball/arrows/labels, exactly one position per token per phase, strict unknown-key rejection, and a literal `schemaVersion`. Runtime validation ships with the contract; unknown versions are rejected and there are no MVP migrations.

## Blocking Next Phase

None. The stack, Board Data schema, and content licensing are resolved; the next feature ready to start is `content-model-and-store`.

## Implementation-Time Questions

- Retrieval approach: embeddings vs keyword search over a small curated library.
- Whether DevExpert `chat` reliably produces valid structured JSON for sessions and variants, or whether those two features need `chat-pro`.
- Quota edge cases: shared club/school networks, timezone used for the daily reset, and what happens if the installation ID changes.
- How Phase explanations and coaching cues are authored: manually, AI-drafted then reviewed, or both.
- Whether an AI-assisted variant becomes part of a session or always stays standalone.
- Where locally saved AI results live and how the coach clears them.
- Chat placement on mobile: full screen tab vs bottom sheet over the board.

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

- **Content quality/volume.** The library is the product's core value; a thin or low-quality seed makes the AI and the board feel generic. Mitigation: seed Infantil U14 deeply, then validate with real coaches.
- **AI hallucination.** The board, session generator, and chatbot can produce plausible but invented tactics. Mitigation: mandatory grounding, cite source exercises, validate Board Data schema, and show provenance.
- **Anonymous AI cost/abuse.** A 5/day quota plus installation ID and hashed IP reduces abuse, but shared networks and reset tricks remain. Mitigation: server-side key, rate limiting, per-request caps, logging.
- **Structured-output reliability.** DevExpert `chat` may return JSON that fails Board Data validation. Mitigation: strict JSON schema prompts, server-side validation, retry/fallback, and escalate to `chat-pro` if needed.
- **Board rendering complexity.** SVG interpolation across phases, tokens, and arrows is non-trivial on React Native. Mitigation: freeze the schema early and cover it with golden tests.
- **Offline/local persistence bugs.** Locally saved AI results can go stale or corrupt. Mitigation: version the local record format and test reopen-after-restart.
- **Category taxonomy drift.** RFEF brackets vs school-stage content (Chupetín) can misclassify exercises. Mitigation: explicit mapping table, no runtime guessing.
- **Legal/IP on source material.** Original content and CMD Mora permission still need to be documented. Mitigation: record source and license metadata on every record and keep external reference sites as inspiration only.
- **Product naming.** "Futsal Manager AI" is the chosen name. Remaining mitigation: a basic trademark/domain check and consistent relabelling of prototype screens.
- **DevExpert dependency.** A single inference provider is a single point of failure. Mitigation: keep the gateway provider-agnostic so an OpenAI-compatible fallback can be added.
- **Expo tooling advisories.** `npm audit` currently reports four high-severity transitive advisories in `node-forge` and the `zod` nested under Expo CLI/code-signing tooling. The direct `zod@4.6.7` used by the Board Data runtime schema is outside the vulnerable range. The nested Expo CLI copy has no non-breaking fix; `node-forge` has a non-breaking `npm audit fix` available. Mitigation: keep the Expo CLI on the build-time path only, rerun the audit on dependency changes, and upgrade when Expo ships a compatible release.
- **32-bit Android test device.** The connected Galaxy M13 reports only `armeabi-v7a`. Expo Go 58.0.5 and the native debug build work, but the build emits Google Play's 64-bit warning because it packages only 32-bit native libraries. Mitigation: add a 64-bit Android phone or tablet to `mobile-device-verification`, and make release builds include `arm64-v8a`.

## Research Tasks

- Confirm CMD Mora's permission in writing and record it with the seeded content.
- Confirm DevExpert Inference production pricing, rate limits, and structured-output support for `chat`.
- Prototype the Board Data schema against 5–10 real exercises of varying complexity to confirm it is expressive enough for SVG keyframes.
- Estimate LLM cost per typical session/variant/chat and confirm the 5/day quota is sustainable.
- Test pitch-distance legibility of the board on a real iOS/Android phone and tablet.
