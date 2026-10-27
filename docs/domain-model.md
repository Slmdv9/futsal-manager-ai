# Domain Model

## Core Concepts

- **Category** — an official RFEF age bracket (Prebenjamín U8, Benjamín U10, Alevín U12, Infantil U14, Cadete U16, Juvenil U19, Senior). Immutable reference data.
- **Exercise** — a drill with `title`, `summary`, `focus`, `sessionPart` (warm-up, main part, or cool-down), `objective`, `categoryIds`, `players` (total plus goalkeepers), `space` (label, `widthM`, `lengthM`), `durationMinutes`, `intensity` (level plus optional percent), `workStructure`, `constraints`, `coachingCues`, and Board Data.
- **Board Data** — structured, renderable description of an exercise: pitch type/aspect ratio, tokens (players, keepers), cones, arrows, labels, and an ordered list of Phases. Its versioned contract, coordinates, limits, and validation rules live in `docs/board-data-schema.md`; unvalidated Board Data must not be published or rendered.
- **Phase** — one ordered step with its own token/arrow positions and a short explanation.
- **Programming** — per-category methodology: `formativeStage`, `focus`, `playModel`, `sessionDurationMinutes`, `keyConcepts`, `objectives`, `sessionStructure` (warm-up, main, cool-down), and nested Macrocycle/Microcycle entries.
- **Content package** — one versioned JSON package (`contentVersion` `1.1.0`) holding every Exercise and Programming record, validated once on load and read through the `content` use cases; only `published` records are readable. Its contract and invariants live in `docs/content-model.md`.
- **Macrocycle / Microcycle** — nested time periods within a Season.
- **Session** — an objective plus an ordered set of exercises (warm-up, main part, cool-down). Can be authored or AI-generated.
- **AI Session Generator / AI Variant Adapter / Tactical Assistant** — AI capabilities grounded on the Exercise Library and Programming.
- **Coach** — the user. **Team** — next-phase entity owned by a registered account.

## Relationships

- A Category has many Exercises (many-to-many) and exactly one Programming.
- An Exercise has one Board Data with one or more Phases; an Exercise belongs to one or more Categories.
- A Programming contains many Macrocycles; a Macrocycle contains many Microcycles; a Microcycle references Sessions/Session templates.
- A Session (authored or AI-generated) contains ordered Exercises and an objective; an AI-generated Session is derived from a Category plus constraints.
- A Variant is an Exercise derived from a source Exercise plus a constraint; it inherits the source's Category unless overridden.
- Next phase: an Account owns many Teams; a Team has one Category, many Players, and one Season.

## States and Lifecycles

**Exercise**
- `draft` → `published` (visible in the library). MVP library is curated, so most exercises enter as `published`.
- `published` → `archived` (removed from browsing, retained for references).
- Every Exercise and Programming record carries `provenance` (`kind`, `sourceName`, `licenseStatus`, optional `attribution`). Only `owned` or `permitted` content may be published, `kind` and `licenseStatus` cannot contradict, published permission-dependent content needs an `attribution`, and the read layer exposes only published records that pass the licence gate. Policy: `docs/content-licensing.md`.

**Programming**
- Authored per Category and versioned; `draft` → `published`. MVP presents the `published` version.

**AI interaction (ephemeral in MVP)**
- `requested` → `generated` → `accepted` (opened on the board) or `discarded`. Not persisted as library content; accepted variants may be kept for the session only.

**Board playback (UI state, not persisted)**
- `idle` → `playing` (phase by phase) → `ended`; coach can step forward/back and replay ("Animar jugada").

**Category selection (UI state, session only)**
- `unselected` → `selected` (one RFEF bracket) → another `selected` replaces it; unknown ids are ignored and no "all categories" state exists. It survives navigation for the app session and resets to `unselected` on app restart; it is never persisted.

**Next phase — Team / Season**
- Team: `created` → `active` → `archived`.
- Season: `planned` → `in progress` → `completed`.

## Important Scenarios

1. **Browse by category** — coach picks Infantil (U14); the app shows that category's Programming summary and its filtered Exercise Library.
2. **Open an exercise on the board** — coach opens "Salida 3-1 contra Rombo"; the board renders Board Data and plays Fase 1 → 2 → 3 with explanations and coaching cues.
3. **Generate a session** — coach asks for a session for Infantil with 9 players and a focus; the generator returns an objective and an ordered set of exercises drawn from the library.
4. **Adapt an exercise** — coach has only 7 players; the Variant Adapter returns an adjusted exercise (e.g. 3v2 + neutral pivot) that still opens on the board.
5. **Ask the assistant** — coach asks how to beat high individual pressure in U14; the assistant diagnoses, proposes a library exercise, and offers to open it on the board.
6. **Quota reached** — an anonymous user exhausts the daily AI quota; browsing and the board keep working, AI is blocked with a clear message.

## Edge Cases

- An exercise mapped to several categories (e.g. Infantil and Cadete) must appear under both filters without duplication artifacts.
- AI output references an exercise that has since been archived — the assistant must not surface non-published content.
- Board Data references more tokens than the declared player count, or phases with missing positions — validation rejects missing or unknown token positions before publication; any legacy or corrupted payload that still reaches the board must degrade gracefully, not crash.
- A variant changes the player count, so the source exercise's Board Data may not transfer directly; the adapter must return consistent Board Data.
- Non-2:1 or unusual spaces (half court, reduced area) must still render on the board with the correct proportions.
- Offline/poor connectivity on the pitch: browsing and cached board playback should degrade better than AI features.
- Category taxonomy mismatch between seed sources (e.g. CMD Mora's "Chupetín" stage) and RFEF brackets must be mapped explicitly, never guessed at runtime.
