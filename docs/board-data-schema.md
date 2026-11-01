# Board Data Schema

Versioned, renderable contract for an exercise's tactics board. Board Data is authored or AI-generated, validated with `parseBoardData`, and drawn by the Tactics Board. The board is a renderer: it never invents tokens, positions, arrows, or labels.

- Current version: **`1.0.0`** (`BOARD_DATA_SCHEMA_VERSION`).
- Implementation: `src/shared/domain/board-data/schema.ts` (contract) and `src/shared/domain/board-data/index.ts` (validation API).
- Fixtures: `tests/shared/domain/board-data/fixtures/`.
- Tests: `tests/shared/domain/board-data/board-data.test.ts`.
- Module ownership: Board Data is a shared kernel in `src/shared/domain/board-data` because the `content`, `board`, and `ai` modules all exchange it. See `ARCHITECTURE.md`.

## Coordinate System

- One normalized space for every pitch: `x` and `y` are numbers from `0` to `100`.
- `x` runs from the left goal line (`0`) to the right goal line (`100`).
- `y` runs from the top touchline (`0`) to the bottom touchline (`100`).
- The space always represents a full 2:1 futsal pitch. `pitch.format` is `'full'` or `'half'`.
- Half-pitch exercises keep the same full-pitch coordinates and mark `pitch.format: 'half'`; the renderer decides how to shade the inactive half without changing the 2:1 ratio.
- Coordinates are percentages, not pixels, so the same data renders on phone, tablet, and web.

## Shape

```ts
type BoardData = {
  schemaVersion: '1.0.0';
  pitch: { format: 'full' | 'half' };
  tokens: TokenDefinition[];
  cones: Cone[];
  phases: Phase[];
};

type TokenDefinition = {
  id: string; // lowercase slug
  kind: 'player' | 'keeper';
  team: 'home' | 'away' | 'neutral';
  label: string; // 1-3 characters, no spaces
};

type Cone = { id: string; x: number; y: number };

type Phase = {
  id: string;
  order: number; // 1-based, equals array index + 1
  title: string;
  explanation: string;
  positions: { tokenId: string; x: number; y: number }[];
  ball: { x: number; y: number } | null;
  arrows: Arrow[];
  labels: BoardLabel[];
};

type Arrow = {
  id: string;
  kind: 'run' | 'pass' | 'press' | 'cover';
  team: 'home' | 'away' | 'neutral';
  from: { x: number; y: number };
  to: { x: number; y: number };
  curve: number; // -100..100 signed perpendicular offset, defaults to 0
};

type BoardLabel = {
  id: string;
  text: string;
  x: number;
  y: number;
  align: 'left' | 'center' | 'right'; // defaults to 'center'
};
```

Token metadata and cones are defined once at board level. Phases hold only what changes: positions, ball, arrows, and labels. `curve` and `align` may be omitted in authored JSON; validation applies their defaults.

## Limits

| Element | Rule |
| --- | --- |
| Tokens | 1–24 per board |
| Phases | 1–12 per board |
| Cones | 0–30 per board |
| Arrows | 0–30 per phase |
| Labels | 0–12 per phase |
| IDs | Lowercase slug, 1–40 characters: `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| Token label | 1–3 non-space characters |
| Phase title | 1–60 trimmed characters |
| Phase explanation | 1–500 trimmed characters |
| Label text | 1–80 trimmed characters |
| Arrow curve | -100 to 100 |

## Cross-Field Rules

- Every token defined at board level has **exactly one** position in **every** phase.
- A phase position cannot reference an undefined token or repeat a token.
- Token ids, cone ids, and phase ids are unique. Arrow ids are unique within a phase; label ids are unique within a phase.
- `phase.order` equals the phase's array index + 1, so phase order is explicit and stable.
- An arrow's `from` and `to` points must differ (`> 0.1` normalized distance).
- All object levels are strict: properties not in this contract are rejected instead of silently ignored.

## Validation API

```ts
import {
  parseBoardData,
  safeParseBoardData,
  BoardDataValidationError,
  type BoardDataValidationIssue,
} from '@/content/board-data';
import rawExercise from './exercise.json';

const board = parseBoardData(rawExercise); // throws BoardDataValidationError
const result = safeParseBoardData(rawExercise); // discriminated result

if (!result.success) {
  result.issues.forEach((issue: BoardDataValidationIssue) => {
    console.error(`${issue.path}: ${issue.message}`);
  });
}
```

- `parseBoardData(input: unknown): BoardData` throws `BoardDataValidationError` with an `issues` array.
- `safeParseBoardData(input: unknown): BoardDataParseResult` never throws for invalid data.
- Issue paths use dot notation (`phases.1.positions`, `tokens.0.kind`) and `(root)` for a board-level error. Messages are user-facing English text for developers; UI copy stays Spanish.
- Invalid data must not be published, bundled as an exercise, or rendered.

Example failure:

```text
Invalid Board Data — phases.1.positions: Missing position for token "ala-izquierda" in phase 2.
```

## Versioning

- `1.0.0` is the only accepted value of `schemaVersion`; any other value fails validation with a version error at path `schemaVersion`.
- A breaking change (renamed/removed fields, changed semantics, new required data) bumps the major version and requires new fixtures, tests, and this document.
- A backward-compatible addition (for example a new optional field with a default) bumps the minor version and updates the literal so every consumer is explicit about the version it accepts.
- There are no runtime migrations in the MVP. Content is migrated in the repository and revalidated before publication.
- AI output must use the same version and pass the same parser before it is shown or saved.

## Verification

```bash
npm test          # schema contract tests
npm run verify    # ESLint, tsc --noEmit, schema tests, expo-doctor
./init.sh         # standard gate; does not start a dev server
```

The fixtures cover:

- `valid-multi-phase.json` — prototype-derived three-phase exercise; parses with defaults applied.
- `invalid-missing-position.json` — phase 2 omits `ala-izquierda`; fails at `phases.1.positions`.
- `invalid-unknown-kind.json` — token kind `coach`; fails at `tokens.0.kind`.
- `invalid-unknown-version.json` — `schemaVersion: "2.0.0"`; fails at `schemaVersion`.
- `invalid-strict-field.json` — unexpected root `notes`; strict validation fails.

## Renderer Boundary

- Board Data stores semantics only. Colors, fonts, stroke widths, dash patterns, marker shapes, shadows, and phase-transition timing belong to the renderer and `DESIGN.md`.
- The implemented renderer is `src/modules/board/presentation/view-models/board-render-model.ts` (pure mapping: `buildBoardRenderModel`) plus `src/modules/board/presentation/components/tactics-board.tsx` (`TacticsBoard`, the only `react-native-svg` importer in the `board` module).
- **Viewport and mapping.** The SVG viewBox is a fixed `1000 × 500` (exactly 2:1) and the field occupies `{ x: 20, y: 10, width: 960, height: 480 }` (also 2:1). Mapping is proportional and never clamped: `x = 20 + (nx / 100) * 960`, `y = 10 + (ny / 100) * 480`. The wrapper uses `width: '100%'` with `aspectRatio: 2` and the SVG uses `preserveAspectRatio="xMidYMid meet"`, so the pitch keeps 2:1 on any viewport with no fixed pixel height.
- **One phase per render.** The renderer draws exactly that phase's positions, ball, arrows and labels plus the board-level tokens and cones. A token without a position is skipped, never invented, and no player or keeper is derived from the exercise's `players`/`goalkeepers`.
- **Arrows.** `from`, `to` and the chord midpoint are mapped points. The quadratic control point is `mid + normal * (curve / 100) * chordLength * 0.5` with normal `(-dy / L, dx / L)`: `curve: 0` is a straight line, positive values bend to the right of the `from → to` direction in screen coordinates and negative values bend the other way. The filled arrowhead is placed on the end tangent (22 long, 16 wide), and `run`/`pass`/`press`/`cover` differ by dash pattern as well as colour.
- **Half boards.** When `pitch.format` is `half` and every element of the rendered phase (positions, ball, arrow ends, labels) plus every cone sits at `x < 50`, the renderer shades the right half; when all sit at `x >= 50` it shades the left half. Any element straddling the halfway line — or any `full` board — leaves the pitch unshaded. Shading never changes the 2:1 ratio and never moves data.
- **Ball badge.** The ball is drawn at its exact mapped point. Every seeded phase places the ball exactly on a token centre, so the visible badge is offset to sit tangent at that token's lower-right instead of covering the mono label; `ball.point` stays exact and no token moves.
- **Labels.** Greedy word wrap at 28 characters and 3 lines, with a trailing `…` when content is dropped and hard splits for words longer than 28. `align` maps to `start`/`middle`/`end` at the mapped point.
- **No interpolation yet.** `board-phase-playback` owns interpolation between phase positions in `order` and must not infer missing positions.
- Later features (`board-phase-playback`, `board-golden-tests`) consume this contract and add golden coverage for positions and order; `exercise-preview-board-thumbnail` reuses `TacticsBoard` at card sizes.
