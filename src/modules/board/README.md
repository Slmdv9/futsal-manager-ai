# Board module

Owns the tactics board renderer and phase playback. It is a pure renderer of the shared Board Data contract; it never invents content.

## Layers

- `domain`: playback state, phase selection, and board geometry rules. Added with `tactics-board-renderer` and `board-phase-playback`.
- `application`: board use cases that turn Board Data into the current frame.
- `infrastructure`: no adapter is expected; rendering belongs to presentation.
- `presentation`: the 2:1 SVG board, tokens, arrows, cones, labels, and playback controls.

## Shared contract

`src/shared/domain/board-data` owns the versioned Board Data schema and parser because content and AI also produce or consume it.

## Public API

`src/modules/board/index.ts`.

## Tests

Mirror the source path under `tests/modules/board/`. Board Data contract tests live under `tests/shared/domain/board-data/`.
