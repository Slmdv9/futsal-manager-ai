# Risks and Open Questions

## Blocking Next Phase

- **Seed content licensing/attribution.** Exercises and programming drawn from adrimartinofutsal.es.tl, futsalcoach.es, keepmove.net, ejerciciosdefutbolsala.com, and the CMD Mora presentation may not be redistributable. Decide what is original, what is licensed, and what is referenced-only before seeding the library.
- **Board Data schema.** The AI features depend on a stable Board Data contract (tokens, cones, arrows, phases). This must be defined before implementation.
- **Stack decision.** Mobile app vs responsive web, and the AI backend, shape everything. Must be chosen before build starts.

## Implementation-Time Questions

- Which Category ships fully seeded first (proposal: Infantil U14), and what is the minimum seeded set for the rest?
- What exact daily anonymous AI quota, and by what signal (IP, device fingerprint, signed cookie)? How to handle shared networks at a club or school.
- Which LLM provider/model and retrieval approach (embeddings vs keyword over a small curated set)?
- Content format and source of truth: DB records, versioned JSON, or a headless CMS?
- How are Phase explanations and coaching cues authored: manually, AI-drafted then reviewed, or both?
- Offline behavior on the pitch: what is cached (library pages, board playback) vs what requires connectivity (AI)?
- Does the "AI-assisted" variant become part of a session, or is it always ephemeral?

## Later / Not MVP

- Accounts, login, and the "Gestionar mi propio equipo" flow.
- Team management: multiple teams per account, roster/player profiles (minimal sports profile agreed: name/nickname, number, position, status; guardians' contact data deliberately excluded).
- Coach-owned Season planning with a session calendar and objectives.
- PDF export and shareable links.
- Player-level training/attendance tracking, match-day management.
- Multi-language UI and multi-club administration.

## Assumptions

- Coaches will use the app on a phone/tablet, sometimes on the pitch, so mobile legibility and fast load matter more than desktop density.
- A curated seed library is higher quality and lower risk than AI-generated content, and the AI can be grounded on it.
- Anonymous browsing is acceptable as the default acquisition experience and reduces privacy/compliance scope.
- The prototype's four screens are the correct MVP surface; "Mi Club" is a locked next-phase entry point.

## Risks

- **Content quality/volume.** The library is the product's core value; a thin or low-quality seed makes the AI and the board feel generic. Mitigation: seed one category deeply first and validate with real coaches.
- **AI hallucination.** The board, session generator, and chatbot can produce plausible but invented tactics. Mitigation: mandatory grounding, cite source exercises, validate Board Data schema, and show provenance.
- **Anonymous AI cost/abuse.** A quota helps, but a leaked endpoint or shared network can still burn budget. Mitigation: server-side key, rate limiting, per-request caps, logging.
- **Board rendering complexity.** Interactive phase playback with arrows/cones across pitch types is non-trivial. Mitigation: freeze the schema early with golden tests.
- **Category taxonomy drift.** RFEF brackets vs school-stage content (Chupetín) can misclassify exercises. Mitigation: explicit mapping table, no runtime guessing.
- **Legal/IP on source material.** Redistribution of third-party exercises/programs without rights. Mitigation: resolve licensing before seeding.
- **Product naming.** The project is now "Futsal Manager AI", avoiding the earlier clash with futsalcoach.es. Remaining mitigation: a basic trademark/domain check for "Futsal Manager AI" and consistent relabelling of prototype screens.

## Research Tasks

- Audit each reference site and the CMD Mora presentation for reusable vs reference-only content and required attribution.
- Review 2–3 existing futsal coaching apps (including futsalcoach.es) for feature gaps and board UX.
- Prototype the Board Data schema against 5–10 real exercises of varying complexity to confirm it is expressive enough.
- Estimate LLM cost per typical session/variant/chat and calibrate the daily quota from it.
- Test pitch-distance legibility of the prototype's board on a real phone and tablet.
