# Technical Discovery

## Product Surface

A native mobile app built with React Native and Expo, targeting phones and tablets carried to training sessions. Web is not a target for the MVP. The prototype defines four screens and a 2:1 pitch board.

## Chosen Stack

- **React Native + Expo** with Expo Router for navigation.
- **Modular hexagonal architecture**: business modules under `src/modules` with `domain`, `application`, `infrastructure`, and `presentation` layers, shared code under `src/shared`, and boundary rules enforced by `eslint-plugin-boundaries`. See `ARCHITECTURE.md`.
- **`react-native-svg`** for the tactics board, rendering full token/arrow/cone positions per phase and interpolating between phases.
- **Expo Router API routes** deployed on **EAS Hosting** for the server-side LLM gateway and quota enforcement.
- **TypeScript** across app and API routes.
- **Versioned JSON content package** in the repo, validated at build time and shared by the app bundle and the API.

## Commands

- Install: `npm install`
- Verify: `npm run verify` (ESLint with architecture boundaries, `tsc --noEmit`, all tests discovered from `tests/**/*.test.{ts,tsx}`, and `expo-doctor`) — also executed by `./init.sh`
- Test: `npm test` (Node's `node:test` through `tsx`; tests mirror `src` under `tests/modules`, `tests/shared`, and `tests/architecture`)
- Test in watch mode: `npm run test:watch`
- Start: `npm start` (Expo dev server; `init.sh` never starts it)
- Bundle smoke: `npx expo export --platform android --output-dir dist`
- Native Android debug build: `npm run android` (`expo run:android`)
- Physical device loop: see `docs/device-development-workflow.md`

## Data and Storage

- Curated seed content lives as versioned JSON in the repo: Exercises (with Board Data) and per-Category Programming. It is validated against the Board Data schema at build time and shared by the app bundle and the API. No database in the MVP.
- Content scope: Infantil U14 fully seeded (programming plus library), and a minimum of three exercises plus a programming record for each of the other six RFEF categories.
- No user accounts or personal data in the MVP, which keeps privacy scope small. Anonymous quota state (5 AI requests per day) is keyed by Expo installation ID plus a hashed IP and stored server-side, never only client-side.
- Content and board playback work offline from the bundled JSON. AI-generated sessions and variants are persisted locally on the device so a coach can reopen them without connectivity.

## Integrations

- **DevExpert Inference API**, OpenAI-compatible (`DEVEXPERT_API_KEY`, base URL from their docs, model `chat` for all three features). A `transcribe` model exists for voice, but voice input is deferred beyond the MVP.
- Grounding layer that feeds selected Category, Programming, and retrieved Exercises into the LLM prompts (retrieval over the seeded library).
- Board renderer consumes Board Data via `react-native-svg`; AI features must emit Board Data, not images.

## Authentication and Authorization

- MVP: none. All browsing and the board are anonymous; AI is anonymous but quota-limited server-side.
- Next phase: account + optional "Gestionar mi propio equipo" flow; one account may own several teams.

## Deployment and Operations

- Expo Router API routes on EAS Hosting serve the LLM gateway and quota checks. The app ships as native iOS/Android builds via EAS.
- `DEVEXPERT_API_KEY` lives server-side only in EAS environment variables; never expose it to the client.
- Operational ownership: the project owner operates and maintains the app on day one. The system must prevent the two most likely mistakes: exposing the LLM key / burning quota (server-side key + quota) and serving unvalidated Board Data (schema check before publish).

## Testing and Verification

- Board Data schema validation as a first-class test: every seeded exercise must validate and render.
- Golden-file tests for board playback (phase positions and order) to catch regressions.
- AI grounding tests: outputs must reference seeded exercises/categories; adversarial prompts must not fabricate library content.
- Quota tests: verify the 5/day limit is enforced server-side by installation ID plus hashed IP and resets correctly.
- Offline tests: confirm bundled content and board playback work with no connectivity, and that locally saved AI results reopen after an app restart.
- Manual device testing on a real iOS/Android phone and tablet for pitch-distance legibility.

## Observability

- Log AI requests with category, feature, latency, token/cost estimate, and outcome (grounded vs not), without storing sensitive free text beyond what is needed.
- Track quota hits and abuse patterns.
- Track board render failures and schema violations in production.

## Constraints

- React Native/Expo on iOS and Android; no web target in the MVP.
- Board must preserve a 2:1 futsal pitch aspect ratio regardless of viewport.
- App UI and content in Spanish; project documents in English.
- Anonymous AI is capped at 5 requests per day per installation ID plus hashed IP.
- Seed content is original plus CMD Mora material used with club permission; the external reference sites are inspiration only, not redistribution sources.
- Voice input is out of the MVP.
