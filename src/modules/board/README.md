# Board module

Owns the tactics board renderer and phase playback. It is a pure renderer of the shared Board Data contract; it never invents content.

## Layers

- `domain`: playback state, phase selection, and board geometry rules. Added with `board-phase-playback`.
- `application`: board use cases that turn Board Data into the current frame.
- `infrastructure`: no adapter is expected; rendering belongs to presentation.
- `presentation`: the 2:1 SVG board, tokens, arrows, cones, labels, and playback controls. Today it holds the target contract and the selected-exercise card; `tactics-board-renderer` owns the drawing.

## Shared contract

`src/shared/domain/board-data` owns the versioned Board Data schema and parser because content and AI also produce or consume it.

## Input contract

`presentation/board-exercise-target.ts` declares the type-only `BoardExerciseTarget` (`id`, `title`, `summary`, `boardData: BoardData`). The composition root maps a publishable content `Exercise` with the `content` public helper `buildBoardExerciseTarget` and passes the result to `BoardScreen exercise={…}`; `board` never imports `content`. With a target the screen renders a `SELECCIONADO` chip, the title, the summary, and the note `El tablero animado 2:1 llegará en la próxima fase.` inside the `Pizarra` header. With no target (`undefined`/`null`, an unknown id, or an unpublishable exercise) it keeps the accepted `SIGUIENTE FASE` fallback. Nothing reads `boardData` until `tactics-board-renderer`.

## Public API

`src/modules/board/index.ts` exports `BoardScreen` and `type BoardExerciseTarget`.

## Tests

Mirror the source path under `tests/modules/board/`. Board Data contract tests live under `tests/shared/domain/board-data/`. `presentation/screens/board-screen.test.ts` guards the target shape, the selected card, the fallback copy, and the absence of pitch/SVG drawing or a `content` import.
