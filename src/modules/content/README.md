# Content module

Owns Category reference data, Exercise, Programming, and the read layer that powers browsing. Board Data is a shared kernel in `src/shared/domain/board-data` because content, board, and AI all exchange it.

## Layers

- `domain`: Category, Exercise, Programming, content rules, and the content repository port. Added with `content-model-and-store`.
- `application`: use cases such as listing categories, filtering exercises, and loading programming.
- `infrastructure`: bundled JSON adapters and content validation.
- `presentation`: Explorar and exercise-detail screens.

## Public API

`src/modules/content/index.ts`. Other modules and routes must not import this module's internals directly.

## Tests

Mirror the source path under `tests/modules/content/`.
