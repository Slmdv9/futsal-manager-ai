# Board module

Owns the tactics board renderer and phase playback. It is a pure renderer of the shared Board Data contract; it never invents content.

## Layers

- `domain`: playback state, phase selection, and board geometry rules. Still empty; `board-phase-playback` fills it.
- `application`: board use cases that turn Board Data into the current frame. Still empty.
- `infrastructure`: no adapter is expected; rendering belongs to presentation.
- `presentation`: the 2:1 SVG board, tokens, arrows, cones, labels, playback controls, and the Pizarra screen.

## Presentation files

- `view-models/board-render-model.ts`: the pure `buildBoardRenderModel(boardData, phaseIndex)` view model. No React, no SVG, no theme, no `content`; it imports only the `BoardData` type from `@/shared/domain`. It maps one phase onto a fixed `1000 × 500` viewBox with a `20, 10, 960, 480` field, clamps the phase index, offsets a carrier ball badge, computes the inactive half shade, wraps label text, and returns fresh arrays without mutating the input.
- `components/tactics-board.tsx`: the only file in this module that imports `react-native-svg`. `TacticsBoard({ boardData, phaseIndex = 0 })` draws a `width: '100%'` / `aspectRatio: 2` wrapper, one `accessible` `accessibilityRole="image"` node with the Spanish label, then the field, inactive-half shade, markings, cones, arrows, tokens and keepers, ball badge and labels.
- `screens/board-screen.tsx`: `BoardScreen({ exercise })` keeps the `Pizarra` header, shows the `SELECCIONADO` card and the board card (`TacticsBoard`, `FASE n DE N` chip, phase title and explanation, playback note) when a target arrives, and the `SIN EJERCICIO` guidance card otherwise.
- `board-exercise-target.ts`: the type-only input contract.

## Renderer constants

Pinned in `board-render-model.ts` (viewBox units, `1 unit = board width / 1000`):

| Constant | Value |
| --- | --- |
| `BOARD_VIEW_BOX` | `1000 × 500` (2:1) |
| `BOARD_FIELD` | `x 20, y 10, w 960, h 480` (2:1) |
| Mapping | `x = 20 + (nx / 100) * 960`, `y = 10 + (ny / 100) * 480` |
| Token body / ring | `48` / `56` |
| Cone | apex `(cx, cy − 14)`, base `(cx ± 12, cy + 10)` |
| Ball | radius `12`, centre dot `3`, badge tangent to the carrier at `56 + 2 + 12` |
| Arrow | control offset `(curve / 100) × chordLength × 0.5`; head `22 × 16`; stroke `4` |
| Arrow dashes | run solid, pass `[12, 8]`, press `[2, 8]` round cap, cover `[22, 8]` |
| Labels | `28` characters per line, `3` lines, font `30`, line height `34` |
| Half shade | `surfaceContainerHigh` at `0.55`, only for `pitch.format: 'half'` when every element and cone is on one side |

Every team signal is shape-plus-colour: home is a carbon solid ring, away a cyan dashed ring, neutral a white token with a carbon ring, and a keeper adds a contrasting 40-unit inner ring using its label colour inside the 48-unit body (3-unit stroke). The outer ring remains 56 units.

## Shared contract

`src/shared/domain/board-data` owns the versioned Board Data schema and parser because content and AI also produce or consume it.

## Public API

`src/modules/board/index.ts` exports:

- `BoardScreen` and `type BoardExerciseTarget`.
- `TacticsBoard` and `type TacticsBoardProps`.
- `buildBoardRenderModel` and `BOARD_VIEW_BOX`.
- The render types `BoardRenderModel`, `BoardRenderToken`, `BoardRenderCone`, `BoardRenderBall`, `BoardRenderArrow`, `BoardRenderLabel` and `BoardRenderPoint`.

`board` never imports `content`. The composition root maps a publishable `Exercise` with the `content` helper `buildBoardExerciseTarget` and passes the result to `BoardScreen exercise={…}`. Phase playback is the next feature: the screen renders one phase (default the first) and says playback arrives later.

## Tests

Mirror the source path under `tests/modules/board/`. Board Data contract tests live under `tests/shared/domain/board-data/`.

- `presentation/view-models/board-render-model.test.ts` imports the model directly and covers geometry, the seeded board, every phase of all 71 bundled boards, clamping, purity, half shading, label wrapping and arrow heads.
- `presentation/components/tactics-board.test.ts` asserts the component source (single `react-native-svg` importer, 2:1 wrapper, one accessible image, markings, tokens, arrows, no interaction).
- `presentation/screens/board-screen.test.ts` guards the target shape, the selected card, the board card and phase block, the `SIN EJERCICIO` fallback, and the public API.

Node's `node:test` cannot load `react-native-svg`, so component and screen tests read source text and never import `@/modules/board` or `react-native-svg`.
