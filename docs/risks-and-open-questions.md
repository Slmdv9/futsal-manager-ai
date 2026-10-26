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

## Blocking Next Phase

None. The stack, Board Data approach, and content licensing are resolved, so the first feature (`bootstrap-app-shell`) can start.

## Implementation-Time Questions

- Exact Board Data schema fields, validation rules, and schema versioning details.
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

## Research Tasks

- Confirm CMD Mora's permission in writing and record it with the seeded content.
- Confirm DevExpert Inference production pricing, rate limits, and structured-output support for `chat`.
- Prototype the Board Data schema against 5–10 real exercises of varying complexity to confirm it is expressive enough for SVG keyframes.
- Estimate LLM cost per typical session/variant/chat and confirm the 5/day quota is sustainable.
- Test pitch-distance legibility of the board on a real iOS/Android phone and tablet.
