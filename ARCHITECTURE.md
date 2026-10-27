# Architecture

Futsal Manager AI is a **modular monolith**: one Expo app, one repository, and a small set of business modules. Each module is a hexagonal slice with its own domain, application, infrastructure, and presentation layers. `shared` holds the contracts and UI that more than one module needs.

This document is the source of truth for code organization, dependency direction, module public APIs, and the test layout. `DESIGN.md` owns visual direction; `docs/domain-model.md` owns domain vocabulary and relationships.

## Principles

1. **Module boundaries follow business capabilities**, not technical folders. `content`, `board`, `ai`, and `club` are the current capabilities.
2. **Each module owns its rules and its UI.** A module exposes a public API and hides its internals.
3. **Domain and application code are platform-agnostic.** React Native, Expo Router, SVG, HTTP, and device storage live at the edges.
4. **Dependencies point inward.** Presentation depends on application, application depends on domain, and infrastructure implements ports defined by the inner layers. Domain never imports an outer layer.
5. **Modules talk through public APIs or shared contracts**, never through deep imports.
6. **`shared` never imports `app` or a business module.** Shared code is the bottom of the dependency graph.
7. **Expo Router files are the composition root.** Routes stay thin: they render a module screen and, later, wire adapters.
8. **Only split a module when the capability has its own language, rules, lifecycle, and UI.** Do not create a module per screen or per technical folder.
9. **Offline-first content and board.** Curated content and Board Data are bundled and validated; AI is the only server-dependent capability.

## Directory Map

```text
src/
  app/                              # Expo Router routes and composition root
    (tabs)/
      index.tsx                     # Explorar -> content public API
      pizarra.tsx                   # Pizarra -> board public API
      asistente.tsx                 # Asistente IA -> ai public API
      mi-club.tsx                   # Mi Club -> club public API
      _layout.tsx                   # Tabs configuration
    _layout.tsx                     # Fonts, splash, root stack
    design-system.tsx               # Development gallery
  modules/
    content/
      domain/
      application/
      infrastructure/
      presentation/
        screens/
      index.ts                      # Public API
      README.md
    board/
      domain/
      application/
      infrastructure/
      presentation/
        screens/
      index.ts
      README.md
    ai/
      domain/
      application/
      infrastructure/
      presentation/
        screens/
      index.ts
      README.md
    club/
      domain/
      application/
      infrastructure/
      presentation/
        screens/
      index.ts
      README.md
  shared/
    domain/
      board-data/                   # Versioned shared kernel
    theme/                          # Design tokens and fonts
    ui/                             # Design-system primitives and layout
tests/
  modules/
    <module>/                       # Mirrors src/modules/<module>
  shared/
    domain/board-data/              # Mirrors the shared kernel
  architecture/                     # Cross-cutting structure checks
```

Every module keeps the same four layer folders. A layer can start empty while a capability is still a placeholder; `.gitkeep` marks an intentionally empty layer. Add code to the layer when the capability needs it. The module `README.md` states which layers are active and which features fill them.

## Layers

| Layer | Responsibility | May depend on |
| --- | --- | --- |
| `domain` | Entities, value objects, domain services, invariants, and **ports** (repository, gateway, store, clock). | Same module `domain`; `shared/domain`. |
| `application` | Use cases that orchestrate domain objects and ports. Returns domain objects or read models, never React types. | Same module `domain`; `shared`; allowed module public APIs. |
| `infrastructure` | Adapters that implement ports: bundled JSON, device storage, HTTP clients, Expo APIs, server-side gateways. | Same module `domain` and `application`; `shared`. |
| `presentation` | Screens, components, hooks, view models, and navigation wiring. | Same module `domain` and `application`; `shared/ui`; `shared/theme`; allowed module public APIs. |
| `index.ts` | The module **public API**. Export only what other modules or routes should use. | Its own layers and shared types. |

### Ports and adapters

- A port is a TypeScript interface in `domain/ports` (or next to the use case when it is use-case-specific).
- An adapter is a class or factory in `infrastructure/adapters` that implements a port.
- Presentation never constructs an HTTP client, storage adapter, or JSON reader. The composition root or a module-level container wires them.
- External systems are always behind a port: content repository, LLM gateway, AI result store, quota store, clock, and installation ID provider.
- Adapters translate transport errors into typed application errors at the boundary. Domain code does not know about HTTP status codes, Zod issue shapes, AsyncStorage keys, or Expo APIs.

### What belongs in `shared`

`shared` is for code that is genuinely cross-module and has no business owner. It is not a dumping ground for "helpers".

- `shared/domain/board-data` — the versioned Board Data schema, parser, types, and limits. Content, board, and AI all exchange Board Data, so it is a **shared kernel**, not a private contract of one module.
- `shared/theme` — `DESIGN.md` tokens, fonts, spacing, radius, and typed token names.
- `shared/ui` — design-system primitives, layout scaffolds, and navigation icons. It never imports a business module.
- Future `shared/testing` — pure test builders and fakes that do not depend on Node APIs. Node-only fixtures stay under `tests/`.

Do not add a generic `shared/utils` folder. If a function has a business rule, it belongs to a module domain. If it is platform plumbing, it belongs to an adapter.

## Dependency Graph

```text
src/app (composition root)
  -> src/modules/<module> public API
  -> src/shared/*

src/modules/<module>
  -> its own layers
  -> src/shared/*
  -> allowed module public APIs

src/shared
  -> src/shared/*
```

Forbidden directions:

- `shared` -> `app` or `shared` -> `modules`
- `modules` -> `app`
- `app` -> a module's internal layer
- a module -> another module's internal layer
- `domain` -> `application`, `infrastructure`, or `presentation`
- `domain` -> another module's public API
- `application` -> `infrastructure` or `presentation`
- `presentation` -> `infrastructure`
- production code -> test files

### Allowed module dependencies

| Module | May import the public API of |
| --- | --- |
| `content` | none |
| `board` | none |
| `ai` | `content` |
| `club` | none |

All modules may import `shared`. The only planned cross-module dependency is `ai -> content`, because grounded AI needs the published exercise library and programming. If a new cross-module dependency is needed, add it to this table and to the ESLint policy in the same change.

## Module Catalog

### `content`

Owns the Exercise Library, Category reference data, Programming, the content read layer, and the Explorar/exercise-detail screens. The next feature, `content-model-and-store`, fills the domain, application, and infrastructure layers. Board Data comes from the shared kernel.

### `board`

Owns the tactics board renderer and phase playback. It is a pure renderer: it draws the shared Board Data and never invents content. `tactics-board-renderer` fills the presentation layer; `board-phase-playback` adds playback state to the domain/application layers. No infrastructure adapter is expected unless board persistence is introduced.

### `ai`

Owns the grounded session generator, variant adapter, tactical assistant, grounding policy, and anonymous quota. The LLM gateway is a server-side adapter. AI output is validated against the shared Board Data contract before it is shown, saved, or opened on the board. This module may import the `content` public API for retrieval.

### `club`

Owns the next-phase team, roster, and season surface. The MVP is anonymous, so only the locked Mi Club presentation exists. Domain and application layers stay empty until the account phase.

## Composition Root

`src/app` is the only place where routing and dependency wiring meet:

- `_layout.tsx` loads fonts, hides the splash screen, and configures the root stack.
- `(tabs)/_layout.tsx` configures the four tabs with `shared/ui` and `shared/theme`.
- Each route file imports a screen from a module public API and default-exports it. Route files contain no business logic.
- The `/design-system` route is a development gallery. It imports shared UI and theme only.
- When a module needs an adapter, the composition root (or a small module-level container) creates it and passes it to the screen or a provider. Do not add a dependency-injection framework for the current scale.

Future Expo Router API routes live under `src/app/api/...`. They are server-side infrastructure adapters: they may import module application/domain code and must never import presentation or expose secrets.

## Import Rules

Use the `@/` alias for cross-folder imports:

- Cross-module: `@/modules/<module>` only.
- Shared: `@/shared/domain`, `@/shared/theme`, `@/shared/ui`.
- Inside a module: relative imports are preferred.
- Tests may import module internals to unit-test a layer; contract tests should import the public API.

`eslint-plugin-boundaries` enforces the rules above as part of `npm run lint`, and therefore as part of `npm run verify` and `./init.sh`. The configuration lives in `eslint.config.js`.

## Testing

Tests mirror the source tree:

```text
tests/
  modules/
    <module>/
      domain/...
      application/...
      infrastructure/...
      presentation/...
  shared/
    domain/...
    theme/...
    ui/...
  architecture/
```

- One test file per unit or cohesive behavior.
- Name files `*.test.ts` or `*.test.tsx`.
- Domain, application, and adapter tests use Node's built-in `node:test` through `tsx`. UI tests add React Native Testing Library when the first interactive screen lands.
- Keep fixtures next to the test that owns them.
- Do not use the network in unit tests. Use fakes for ports.
- Add a contract test for every module public API that another module consumes.
- Add golden tests for board phase playback under `tests/modules/board/`.
- Add grounding and adversarial tests under `tests/modules/ai/`.
- `tests/architecture` holds cross-cutting structural checks that do not belong to one module.

### Given / When / Then

Every behavior test states the context, the action, and the expected outcome. Use `describe` for Given/When and `it` for Then:

```ts
describe('Given a valid three-phase board', () => {
  describe('When it is parsed', () => {
    it('then it preserves the ordered phases', () => {
      // arrange, act, assert
    });
  });
});
```

The test name should read as a complete rule, not as a function name. Keep the arrange/act/assert sections obvious even when they are short.

## Adding A Module

1. Confirm the capability is a business capability with its own vocabulary, rules, and lifecycle. If not, add code to an existing module.
2. Create `src/modules/<module>/` with the four layer folders and an `index.ts` public API. Use `.gitkeep` only for layers that are intentionally empty.
3. Add a module `README.md` with responsibility, active layers, public API, allowed dependencies, and test location.
4. Implement the domain first: entities, value objects, invariants, and ports. Do not import React Native or Expo there.
5. Add use cases in `application`, adapters in `infrastructure`, and screens in `presentation`.
6. Add a thin route under `src/app` if the module is user-visible.
7. Mirror every source file in `tests/modules/<module>/` and write Given/When/Then tests.
8. Update the module catalog, allowed dependency table, and ESLint policy if the dependency graph changes.
9. Run `npm run verify` and `./init.sh`; verify user-visible changes on the connected Android device.

## Adding A Layer Or A Port

- Add the port to the inner layer that owns the rule. Do not define a port in `infrastructure`.
- Add the adapter in `infrastructure/adapters` and a contract test with a fake or a local fixture.
- Wire the adapter at the composition root, not inside a presentation component.
- Keep the port interface small and expressed in domain language, not transport language.

## Naming

- Files: `kebab-case.ts` and `kebab-case.tsx`.
- Components and types: `PascalCase`.
- Functions and variables: `camelCase`.
- Use cases: `verb-noun.ts` exporting `verbNoun` (for example, `list-exercises-by-category.ts`).
- Ports: `*-repository.ts`, `*-gateway.ts`, `*-store.ts`, `*-provider.ts`.
- Adapters: `*-adapter.ts` or a descriptive implementation name.
- Spanish for UI copy and exercise content; English for identifiers, tests, and repository documents.

## Data Flows

**Browse an exercise**

`app/(tabs)/index.tsx` -> `content` screen -> `content` use case -> `ContentRepository` port -> bundled JSON adapter -> shared `parseBoardData`.

**Render a board**

`app/(tabs)/pizarra.tsx` -> `board` screen -> board playback state -> shared `BoardData` -> SVG primitives. The board never fetches or invents content.

**Ask the assistant**

`app/(tabs)/asistente.tsx` -> `ai` screen -> `ai` use case -> `ContentRepository`/retrieval + `LlmGateway` -> server-side Expo Router API route -> DevExpert Inference. The response is validated, grounded, and saved locally before it is reopened.

## Non-Goals

- Micro-frontends, module federation, or a monorepo split.
- A generic dependency-injection framework.
- A module per screen or per technical layer.
- Global `services/`, `helpers/`, or `utils/` folders.
- Moving Expo Router routes out of `src/app`.
- Team, roster, and season domain models before the account phase.

## Verification

- `npm run lint` includes the boundary checks.
- `npm test` discovers every `tests/**/*.test.ts` and `tests/**/*.test.tsx`.
- `npm run verify` runs lint, typecheck, tests, and `expo-doctor`.
- `./init.sh` is the standard startup gate and never starts Metro.
- User-visible changes are checked on the connected Android device following `docs/device-development-workflow.md`.
