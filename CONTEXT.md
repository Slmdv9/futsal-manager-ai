# Context

Shared vocabulary for the Futsal Manager AI project. This file is a glossary only: no plans, tasks, or implementation details.

## Glossary

### Coach (Entrenador)
Primary user of the MVP. Any futsal coach who consults exercises and programming for a category. Owns a team only in the next phase, not in the MVP.

### Category (Categoría)
An official RFEF age bracket used to filter exercises and programming. Canonical set: Prebenjamín (U8), Benjamín (U10), Alevín (U12), Infantil (U14), Cadete (U16), Juvenil (U19), Senior. Always refers to an age bracket, never to a skill tier.

### Exercise (Ejercicio)
A single training drill with an objective, category(ies), dimensions, number of players, materials, duration, intensity, coaching cues, and a board representation. The atomic unit of the library.

### Board Data
The structured, renderable representation of an exercise: pitch type, player/keeper tokens, cones, arrows, labels, and an ordered list of phases. Authored or AI-generated, then rendered by the Tactics Board.

### Tactics Board (Pizarra)
The interactive 2:1 futsal-pitch surface that draws Board Data and plays it back phase by phase ("Fase 1 / 2 / 3", "Animar jugada"). The board is a renderer; it does not invent content.

### Phase (Fase)
One ordered step of an exercise on the board, with its own token/arrow positions and a short explanation. Exercises may have one or many phases.

### Exercise Library (Biblioteca de ejercicios)
The curated, category-filterable catalog of exercises that powers browsing and grounds the AI. Seeded from curated sources, not generated on demand.

### Programming (Programación)
The per-category methodology and season plan: formative stages, macrocycles, microcycles, session structure, and objectives. Presented as the "category program" a coach reads and follows.

### Season (Temporada)
The full competitive cycle, split into macrocycles (periods) and microcycles (fortnights), in the next phase a coach can plan it for their own team.

### Session (Sesión)
A training session with an objective and an ordered set of exercises, following the standard structure: warm-up, main part, cool-down. May be authored or AI-generated.

### Macrocycle
A large season period (e.g. Oct–Dec) with its own focus. Part of Programming.

### Microcycle
A fortnightly block within a macrocycle, containing guidance for around four sessions. Part of Programming.

### AI Session Generator
AI feature that produces a session or task from a category plus coach constraints (player count, space, focus).

### AI Variant Adapter
AI feature that adapts an existing exercise to a constraint, e.g. fewer players or reduced space, returning an adjusted exercise.

### Tactical Assistant (Asistente IA)
The grounded chatbot. Answers coaching doubts and proposes exercises from the library. In the MVP its context is the selected category and current exercise/program, not a team.

### Anonymous Access (Acceso Libre)
Using the app without an account. In the MVP this covers all browsing, the board, and a daily quota of AI features.

### Team (Equipo)
A club squad with a category, roster, and season. A next-phase concept; not part of the MVP. One account will be able to own several teams.

## Rejected / Ambiguous Terms

### Programación
Ambiguous: in software it means code. In this project always use `Programming` (the per-category season/methodology plan), never "programación" for software. Write code terms in English.

### Categoría
Ambiguous: could mean skill level. Always use `Category` and mean the official RFEF age bracket. For skill use `Level` if such a concept is ever introduced.

### Tarea
Used interchangeably with `Ejercicio` in source material (e.g. "Tareas RFEF"). Prefer `Exercise` in code and UI; keep "tarea" only where reproducing external source names.
