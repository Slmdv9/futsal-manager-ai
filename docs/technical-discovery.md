# Technical Discovery

## Product Surface

Mobile-first is the priority (phone and tablet carried to training sessions), with responsive tablet/desktop layouts as a secondary benefit. The prototype defines four screens and a 2:1 pitch board. Final surface/stack was deliberately deferred until after this brief.

## Candidate Stack

Not yet decided. Candidates considered:

- **Next.js (React) full-stack**, responsive/PWA, server layer calls the LLM — recommended if the team is web-oriented; fastest path to the board + chat + grounded AI.
- **Separate API (Node/NestJS or FastAPI) + SPA** — clearer separation, more setup.
- **Flutter mobile app** — best native mobile feel on pitch, higher cost to build the interactive board and web presence.

Decision is deferred; see `risks-and-open-questions.md` (Implementation-Time).

## Data and Storage

- Curated seed content: Exercises (with Board Data) and per-Category Programming. Read-heavy, low write volume in the MVP.
- Exercise Library and Programming can be stored as structured records or versioned content files; Board Data is a JSON-like document validated against a fixed schema.
- No user accounts or personal data in the MVP, which keeps privacy scope small. Anonymous quota state must be stored server-side (by IP/device signal), not only client-side.
- Accepted AI sessions/variants are ephemeral in the MVP unless the coach exports them (deferred).

## Integrations

- **LLM API** for the session generator, variant adapter, and chatbot.
- Grounding layer that feeds selected Category, Programming, and retrieved Exercises into the LLM prompts (retrieval over the seeded library).
- Board renderer consumes Board Data; AI features must emit Board Data, not images.

## Authentication and Authorization

- MVP: none. All browsing and the board are anonymous; AI is anonymous but quota-limited server-side.
- Next phase: account + optional "Gestionar mi propio equipo" flow; one account may own several teams.

## Deployment and Operations

- Depends on the stack decision. Prefer a managed host with serverless functions for the AI endpoints and static/edge serving for the board.
- The LLM API key must live server-side only; never expose it to the client.
- Operational ownership: the project owner operates and maintains the app on day one. The system must prevent the two most likely mistakes: exposing the LLM key / burning quota (server-side key + quota) and serving unvalidated Board Data (schema check before publish).

## Testing and Verification

- Board Data schema validation as a first-class test: every seeded exercise must validate and render.
- Golden-file tests for board playback (phase positions and order) to catch regressions.
- AI grounding tests: outputs must reference seeded exercises/categories; adversarial prompts must not fabricate library content.
- Quota tests: verify the daily limit is enforced server-side and resets correctly.
- Manual device testing on a real phone and tablet for pitch-distance legibility.

## Observability

- Log AI requests with category, feature, latency, token/cost estimate, and outcome (grounded vs not), without storing sensitive free text beyond what is needed.
- Track quota hits and abuse patterns.
- Track board render failures and schema violations in production.

## Constraints

- Board must preserve a 2:1 futsal pitch aspect ratio regardless of viewport.
- App UI and content in Spanish; project documents in English.
- Anonymous AI must stay within a sustainable daily quota.
- Seed content licensing/attribution for external reference sites is unresolved and may constrain what can be shipped.
