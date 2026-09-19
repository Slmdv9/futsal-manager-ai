# Build Brief

## Problem

A futsal coach who runs one team has no single, trustworthy place to (a) find age-appropriate exercises for their category and (b) understand the per-category season methodology. Content is scattered, generic, and rarely visualized, so coaches spend time improvising instead of coaching.

## Current Workaround / Existing System

Notes, WhatsApp chats, PDFs, YouTube links, and memory. Roster and season planning live in spreadsheets if at all. Existing tools are either generic drill libraries or team-management apps that assume a registered squad.

## Target Users

- **Primary:** an anonymous futsal coach browsing exercises and programming for a chosen RFEF category, typically on a phone or tablet at the training session or on the pitch.
- **Secondary (next phase):** a registered coach who manages one or more teams (roster, category, season).
- Content sources and clubs (e.g. CMD Mora) act as seed content providers, not as users.

## Goals

1. Let any coach, without registering, browse a curated exercise library filtered by official RFEF category.
2. Present per-category Programming (formative stages, macrocycles, microcycles, session structure, objectives) in a readable, followable form.
3. Make every exercise easy to understand visually through a futsal Tactics Board driven by structured Board Data, with phase playback.
4. Provide grounded AI help: generate a session/task from constraints, adapt an exercise to fewer players or less space, and answer coaching doubts via a contextual chatbot.
5. Work well mobile-first (phone and tablet) on the pitch.
6. Keep AI usage bounded with a server-side daily anonymous quota, so the free experience is sustainable.

## Non-Goals

- User accounts, login, or registration (next phase).
- Team management: roster, player profiles, team category assignment (next phase).
- Coach-owned season planning/calendar UI (next phase; the MVP presents pre-built Programming).
- PDF export and shareable links (deferred).
- Generic user-generated exercise authoring (content stays curated).
- Multi-language UI (Spanish only for the MVP).
- Club/multi-coach administration and permissions.

## MVP Slice

A Spanish, mobile-first, anonymous web/app experience with four screens matching the prototype:

1. **Explore general** — category filter, weekly exercises, methodology overview, and an entry point to the AI session generator.
2. **Explore by category** — the selected category's methodology focus, key concepts, and its filtered exercise library.
3. **Exercise detail + Tactics Board** — exercise metadata, Board Data rendered with phase playback, coach cues, and the AI Variant Adapter.
4. **AI Tactical Assistant** — a grounded chatbot that answers doubts and proposes exercises from the library, with the option to open a proposal on the board.

End-to-end: an anonymous coach filters by category, opens an exercise, watches it on the board, asks the assistant for a session for their available players, and opens the result on the board — all without an account.

## Validation Plan

- Recruit a small group of real futsal coaches (at least 5, spanning formative and senior categories) and watch them complete the end-to-end slice unaided.
- Seed at least one full category's exercises and Programming (Infantil U14 recommended) plus representative exercises for the rest, so the board and AI are grounded on real content.
- Verify AI outputs are grounded: generated sessions/variants/answers must cite or draw from seeded exercises and category Programming, not invent unverified claims.
- Verify the board is correct and legible on a phone and a tablet at pitch distance.
- Measure: task completion without help, board usefulness rating, AI answer trustworthiness, and daily quota behavior under abuse.

## Success Criteria

- A coach can go from opening the app to seeing a category-relevant exercise animated on the board in under 60 seconds, without registering.
- Every AI-generated session and variant is traceable to seeded library content and the selected category.
- The board renders all seeded exercises without manual fixing (validated Board Data schema).
- AI cost per anonymous session stays within the configured daily quota; abuse attempts are blocked server-side.
- Coaches in validation report they would use the app again for their next session.

## Notes

- Project name is **Futsal Manager AI**. The prototype still uses the old working name "FutsalCoach AI" and should be relabelled.
- The app UI and content language is Spanish; project documents are in English.
- Seed content inputs: the CMD Mora season program presentation, and reference sites (adrimartinofutsal.es.tl, futsalcoach.es, keepmove.net, ejerciciosdefutbolsala.com). Licensing/attribution for these sources is unresolved (see Risks).
- Design direction and screen prototypes live under `docs/design/prototype/` and are summarized in `DESIGN.md`.
