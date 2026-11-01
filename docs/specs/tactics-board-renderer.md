# Feature Implementation Spec: Render Board Data on a 2:1 tactics board

## Source Feature

- **id:** `tactics-board-renderer`
- **area:** `board`
- **status:** `accepted` (independent final validator acceptance, 2026-11-01, against maintenance base `04fd30a`)
- **depends_on:** `board-data-schema` (accepted), `design-system-tokens` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/tactics-board-renderer` (based on `chore/expo-sdk-alignment` @ `04fd30a`; working tree carries one deferred `feature_list.json` entry, `exercise-card-detail-affordance`, which this feature must keep and must not implement)
- **spec path:** `docs/specs/tactics-board-renderer.md`
- **reference:** `docs/design/prototype/03-exercise-detail-board/code.html` (dark 4:3 half court, absolutely positioned divs — **layout reference only, do not copy**), `DESIGN.md` Components ("interactive pitch board") and Core Screens item 3
- **baseline (verified before planning):** `./init.sh` exit 0, **417 tests / 306 suites**, `expo-doctor` 20/20; `contentVersion`/`CONTENT_PACKAGE_VERSION` `1.2.0` (71 exercises: 50 `library` + 21 `weekly`), `infantil-u14-base` `1.1.0`, Board Data `1.0.0`
- **size check:** correctly sized. One pure view model, one component, one screen rewrite, one dependency, tests, docs. No new module, layer, port, content field, schema version, colour or cross-module import. No split needed.

## Goal

Draw an exercise's validated Board Data as a light, high-contrast 2:1 futsal pitch inside the `Pizarra` tab: pitch markings, cones, the ball, team-distinct circular tokens with mono labels and keeper rings, kind-coded directional arrows, and wrapped text labels — exactly the data received and nothing invented. A coach who taps `Abrir en Pizarra` on a library card finally sees the drill, not a placeholder.

The renderer is extracted as `TacticsBoard({ boardData, phaseIndex })` so `exercise-preview-board-thumbnail` can reuse it at card sizes without new geometry. Phase **playback** stays out of scope: the board renders one phase (default the first) and the screen says playback is the next phase.

**Job story:** when a drill looks interesting in Explorar, I want to see it drawn on the pitch so I can judge the shape, the material and the movement before I run it — without leaving the app or reading coordinates.

## Non-Goals

- No phase playback, phase selector, animation, replay, reduced-motion work or `Animar Jugada` (`board-phase-playback` owns them); no `useState`, `Pressable`, gesture, timer or `Animated`/Reanimated in `board`.
- No thumbnails, list previews, AI, session generator, share, favourites or the prototype's analytics bento (`exercise-preview-board-thumbnail` and later features).
- No content, package, parser, read-layer, seed, `contentVersion`/`CONTENT_PACKAGE_VERSION` or Board Data `1.0.0` change. No new exercise, and **no seeded half-pitch board**.
- No derived players/keepers/positions: the renderer draws the tokens it is given and never reads `players`, `goalkeepers`, `Exercise` or `content`.
- No new module, layer, port, cross-module import, allowed-dependency change, `shared/ui` primitive, colour, font, shadow, radius or spacing token.
- No `src/shared/**`, source changes under `src/modules/{content,ai,club}/**`, `src/app/**`, `eslint.config.js`, `app.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md` change. `react-native-svg` is the only dependency change.
- No React Native Testing Library or E2E harness; `node:test` plus the device smoke stay the agreed coverage level.

## Acceptance Scenarios

### Scenario 1: A targeted board draws its first phase (feature_list #1)

Given `salida-3-1-presion-alta` opened through a library card's `Abrir en Pizarra` (`/pizarra?exerciseId=salida-3-1-presion-alta`)
When `BoardScreen` renders
Then the unchanged `Pizarra` header is followed by the `SELECCIONADO` card (title + summary, no "next phase board" note) and then a board card containing the pitch, the `FASE 1 DE 3` chip, `Salida desde portero`, its explanation, and `La reproducción por fases llegará en la próxima fase.`
And the pitch draws phase 1's 9 tokens (2 keepers; 5 home, 4 away), its 3 cones, a ball at `por-local`, its 2 arrows (`pase-portero-cierre` straight, `desmarque-ala-derecha` curved −12) and its 1 label `Salida en 3-1`, matching the JSON.

### Scenario 2: The pitch is 2:1 on any viewport (feature_list #2)

Given the board card on `SM-M135F`
When the wrapper bounds are measured (`uiautomator`, `content-desc`)
Then width ÷ height = 2.0 ± 0.02
And after changing the viewport (tablet-like `wm size`; rotation is blocked by `app.json` `orientation: portrait`) the re-measured ratio is still 2.0 ± 0.02, with no fixed pixel height and no letterboxing.

### Scenario 3: Renderer is a faithful, data-driven renderer

Given any phase of any of the 71 seeded boards
When `buildBoardRenderModel` runs and `TacticsBoard` draws it
Then every drawn token, keeper, cone, arrow and label comes from that board's own data, every token id exists in `boardData.tokens`, no token is added or removed, and no position is derived from the exercise's `players`/`goalkeepers`
And the five legacy boards that carry fewer tokens than players (`salida-3-1-presion-alta`, `circulacion-cierre-ala`, `presion-tras-perdida`, `rondo-4v1-orientacion`, `transicion-3v2-tras-robo`) render exactly their 9/6/6/5/6 tokens.

### Scenario 4: Every phase builds (model coverage)

Given all 71 seeded boards and all 168 phases
When every phase is built with an explicit index
Then no call throws, `phaseIndex` equals the requested in-range index, `phaseLabel` reads `FASE n DE N`, and every token keeps one mapped centre inside the field rectangle.

### Scenario 5: Arrows encode direction and kind

Given an arrow with `curve: 0`
When the model builds it
Then its quadratic control point equals the chord midpoint (a straight line)
And given arrows with `curve: ±c`, their control points sit on opposite sides of the chord at equal distance, the arrowhead tip sits exactly on the mapped `to` point, and the head base is offset `ARROW_HEAD_LENGTH` back along the end tangent (not along the chord)
And `run`/`pass`/`press`/`cover` differ by dash pattern (solid / dashed / dotted / long-dash) and the head is a filled shape, never colour alone.

### Scenario 6: Labels wrap and anchor

Given label text up to the 80-character contract limit
When it is wrapped
Then it becomes at most 3 lines of at most 28 characters each, never splitting mid-word unless a single word exceeds 28 characters, and the third line ends with `…` when content is dropped
And `align: 'left' | 'center' | 'right'` maps to `textAnchor: 'start' | 'middle' | 'end'` at the mapped `x`.

### Scenario 7: Phase index is clamped, input is untouched

Given `phaseIndex` of `-1`, `99`, `NaN`, `1.9`, `undefined` or a valid index
When the model is built
Then it resolves to `0`, the last index, `0`, `1`, `0` and the requested index respectively
And the input `BoardData` (tokens, cones, phases, positions, arrows, labels, nested points) is byte-identical afterwards, with no shared array references.

### Scenario 8: Half-pitch degrades gracefully (feature_list #3)

Given a `pitch.format: 'half'` board whose tokens, ball, arrows, labels and cones all sit at `x < 50`
When the model builds
Then `inactiveHalf` is the right half of the field and the component shades it
And when every element sits at `x >= 50`, the inactive half is the left half
And when any element straddles the halfway line, `inactiveHalf` is `null` (no shading)
And a `full` board never shades, even if all its elements happen to sit in one half.

### Scenario 9: No target shows selection guidance, not a build excuse

Given `/pizarra` with no `exerciseId`, an unknown id, or an unpublished exercise
When `BoardScreen` renders
Then it shows `SIN EJERCICIO`, `Todavía no hay un ejercicio seleccionado` and `Abre un ejercicio desde Explorar y pulsa Abrir en Pizarra para verlo aquí.`
And it renders no `<TacticsBoard>`, no board data, no pitch and no empty board card.

### Scenario 10: Accessibility

Given any rendered board
When a screen reader focuses it
Then the board is exactly one `accessibilityRole="image"` element whose Spanish label reads `Tablero táctico. Fase {order} de {count}: {title}. {tokens} fichas, {cones} conos, {arrows} flechas.` (singular `1 ficha` / `1 cono` / `1 flecha`), individual SVG nodes are not focus targets, and home/away/keeper are distinguishable by ring shape and label, not by colour alone.

### Scenario 11: No forbidden change

Given the finished feature
When the diff and the gate run
Then `react-native-svg` is the only dependency change; `board` imports no `@/modules/content`; only `tactics-board.tsx` imports `react-native-svg`; no literal hex colour, `players`/`goalkeepers`, `onPress`, `useState` or `Animar` appears under `src/modules/board`; content/package/schema/shared/app/ai/club, `eslint.config.js`, `app.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md` and `docs/domain-model.md` are untouched; server and AI quota are unaffected.

## Contracts And Constants

### Renderer model (pure presentation view model, no React, no SVG, no `content`)

`src/modules/board/presentation/view-models/board-render-model.ts`

```ts
export type BoardRenderPoint = { x: number; y: number };
export type BoardRenderToken = {
  id: string; kind: 'player' | 'keeper'; team: 'home' | 'away' | 'neutral';
  label: string; point: BoardRenderPoint;
};
export type BoardRenderCone = { id: string; point: BoardRenderPoint };
export type BoardRenderBall = {
  point: BoardRenderPoint;             // exact mapped data point
  badge: BoardRenderPoint;             // drawn centre (offset only when attached to a token)
  attachedTokenId: string | null;
};
export type BoardRenderArrow = {
  id: string; kind: 'run' | 'pass' | 'press' | 'cover'; team: 'home' | 'away' | 'neutral';
  path: string;                         // `M x y Q cx cy x y`, rounded to 2 decimals
  head: [BoardRenderPoint, BoardRenderPoint, BoardRenderPoint]; // tip, side A, side B
};
export type BoardRenderLabel = {
  id: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; lines: string[];
};
export type BoardRenderModel = {
  viewBox: string;                      // '0 0 1000 500'
  field: { x: number; y: number; width: number; height: number };
  phaseIndex: number; phaseNumber: number; phaseCount: number;
  phaseTitle: string; phaseExplanation: string; phaseLabel: string; // 'FASE 2 DE 3'
  tokens: BoardRenderToken[]; cones: BoardRenderCone[]; ball: BoardRenderBall | null;
  arrows: BoardRenderArrow[]; labels: BoardRenderLabel[];
  inactiveHalf: { x: number; y: number; width: number; height: number } | null;
  counts: { tokens: number; cones: number; arrows: number; labels: number };
  accessibilityLabel: string;
};

export function buildBoardRenderModel(boardData: BoardData, phaseIndex = 0): BoardRenderModel;
export const BOARD_VIEW_BOX: { width: number; height: number };   // 1000 x 500
export const BOARD_FIELD: { x: number; y: number; width: number; height: number }; // 20, 10, 960, 480
```

Pinned constants (viewBox units; `1 unit = board width / 1000`):

| Constant | Value | Note |
| --- | --- | --- |
| `BOARD_VIEW_BOX` | `1000 × 500` | exactly 2:1 |
| `BOARD_FIELD` | `x 20, y 10, w 960, h 480` | exactly 2:1; 20 horizontal / 10 vertical margin |
| Mapping | `x = 20 + (nx / 100) * 960`, `y = 10 + (ny / 100) * 480` | proportional, no clamping |
| `TOKEN_BODY_RADIUS` / `TOKEN_RING_RADIUS` | `48` / `56` | ring diameter 112 ≈ 35.8 dp on a 320 dp board = DESIGN's ~36 px |
| `TOKEN_LABEL_FONT_SIZE` / baseline offset | `30` / `+10` | JetBrains Mono semibold, centred |
| `CONE_SIZE` | apex `(cx, cy − 14)`, base `(cx − 12, cy + 10)`, `(cx + 12, cy + 10)` | filled triangle |
| `BALL_RADIUS` / dot radius | `12` / `3` | light fill, dark stroke, centre dot |
| `BALL_BADGE_GAP` | `2` | badge tangent to the carrier token |
| `ARROW_CURVE_SCALE` | `0.5` | control offset = `(curve / 100) * chordLength * 0.5` |
| `ARROW_HEAD_LENGTH` / `ARROW_HEAD_WIDTH` | `22` / `16` | filled, no SVG marker |
| `ARROW_STROKE_WIDTH` | `4` | |
| Dash patterns | run `solid`, pass `[12, 8]`, press `[2, 8]` (round cap), cover `[22, 8]` | |
| `LABEL_MAX_LINE_CHARS` / `LABEL_MAX_LINES` | `28` / `3` | |
| `LABEL_FONT_SIZE` / `LABEL_LINE_HEIGHT` | `30` / `34` | first baseline at mapped `y` |

Pinned rules:

- **Geometry.** `from`/`to`/`mid` are mapped points. `normal = (−dy / L, dx / L)`, `control = mid + normal * (curve / 100) * L * 0.5`; `curve: 0` ⇒ control equals mid. End tangent `d = normalize(to − control)` (fallback `normalize(to − from)` when degenerate); `head = [to, to − d*22 ± perp(d)*8]`. Path is the full quadratic `M from Q control to`; the filled head covers the stroke end.
- **Tokens** follow `boardData.tokens` order and look each position up in the current phase by `tokenId`. A missing position (only possible with unvalidated data) is skipped, never invented.
- **Ball badge.** `ball.point` is the exact mapped point. When that point coincides (≤ 0.5 units) with a token centre, `attachedTokenId` is that token and `badge = tokenCentre + unit(0.6, 0.8) * (TOKEN_RING_RADIUS + BALL_BADGE_GAP + BALL_RADIUS)`, i.e. tangent to the token's lower-right, so the disc does not erase the mono label (all 168 seeded phases place the ball exactly on a token). No token or position moves.
- **Half shade.** `inactiveHalf` is computed for every phase plus cones: all `x < 50` ⇒ shade the right half (`x 500, w 480`); all `x >= 50` ⇒ shade the left half (`x 20, w 480`); any straddle ⇒ `null`; `full` ⇒ always `null`. Shade fill `colors.surfaceContainerHigh` at `fillOpacity 0.55`, drawn above the field fill and below the markings.
- **Labels.** Greedy word wrap at 28 characters; words longer than 28 are hard-split; more than 3 lines ⇒ keep 3 and cut the third to 27 characters + `…`. `x`/`y` are the mapped point (block top, `textAnchor` per `align`).
- **Clamping.** `Number.isFinite(index) ? Math.trunc(index) : 0`, then clamp to `[0, phases.length − 1]`.
- **Counts and copy.** `phaseLabel = \`FASE ${phase.order} DE ${phases.length}\``; `accessibilityLabel = \`Tablero táctico. Fase ${phase.order} de ${phases.length}: ${phase.title}. ${tokens} fichas, ${cones} conos, ${arrows} flechas.\`` with singular forms at 1.
- **Purity.** No mutation of `BoardData`, fresh arrays on every call, no sorting of input, no `react-native`, no `react-native-svg`, no theme import, no `content` import.

### Component

`src/modules/board/presentation/components/tactics-board.tsx` — the **only** file under `src/modules/board` allowed to import `react-native-svg`.

```tsx
export type TacticsBoardProps = { boardData: BoardData; phaseIndex?: number };
export function TacticsBoard({ boardData, phaseIndex = 0 }: TacticsBoardProps);
```

- `<View style={{ width: '100%', aspectRatio: 2 }} accessible accessibilityRole="image" accessibilityLabel={model.accessibilityLabel}>` wrapping `<Svg width="100%" height="100%" viewBox={model.viewBox} preserveAspectRatio="xMidYMid meet">`. No fixed height, no measured width, no `useWindowDimensions`.
- Draw order: field rect (`surfaceContainerLow` fill, `outline` stroke) → inactive-half shade → markings (`outline`/`outlineVariant`) → cones → arrows → tokens (body, ring, keeper inner ring, label) → ball badge → labels.
- Markings: boundary, halfway line, centre circle (r 80) + spot, two 6 m arcs (r 120) + 6 m marks at `(140, 250)` / `(860, 250)`, two goals outside the goal lines, four corner arcs (r 22).
- Token styling: home body `colors.text` + solid ring `colors.text` + label `colors.onPrimary`; away body `colors.secondary` + **dashed** ring `colors.secondary` (`strokeDasharray [10, 6]`) + label `colors.onSecondary`; neutral body `colors.surface` with `colors.text` 2-unit stroke + solid ring `colors.text` + label `colors.text`; keeper adds a separate contrasting inner ring at `TOKEN_BODY_RADIUS − 8` (40), width 3, using the team label colour (`onPrimary` / `onSecondary` / `text`) rather than the outer ring colour. The 40 + 1.5 outer edge stays inside the 48-unit body with a visible gap.
- Cones: filled `colors.primary` triangle. Arrows: `colors.primary` (home), `colors.secondary` (away), `colors.textVariant` (neutral); `fill="none"` path + filled head polygon; dash/cap per kind.
- Ball: `colors.surface` fill, `colors.text` stroke (3), centre dot `colors.text` (r 3). Labels: `colors.text`.
- No literal hex, no `players`/`goalkeepers`, no `content`, no interaction, no animation, no `onPress`, no `accessibilityLabel` on SVG nodes.

### Screen

`src/modules/board/presentation/screens/board-screen.tsx` (still `BoardScreen({ exercise })`, no new props, no `content` import). Keep one `SectionPlaceholder` and put the targeted content in a small file-local component so the model is only built when a target exists (no nullable model in the JSX):

```tsx
function BoardTargetContent({ exercise }: { exercise: BoardExerciseTarget }) {
  const model = buildBoardRenderModel(exercise.boardData);
  return (<> …two cards… </>);
}

export function BoardScreen({ exercise }: BoardScreenProps) {
  return (
    <SectionPlaceholder eyebrow="Pizarra" title="Pizarra"
      description="Ejercicios animados sobre el tablero táctico 2:1.">
      {exercise ? <BoardTargetContent exercise={exercise} /> : ( …empty-state card… )}
    </SectionPlaceholder>
  );
}
```

Composition:

```
Card                              → Chip "SELECCIONADO" (press-trigger) + title (headlineSm, header role) + summary
Card padding="sm"                 → <TacticsBoard boardData={exercise.boardData} />
                                    + Chip model.phaseLabel (defending)
                                    + model.phaseTitle (headlineSm, header role)
                                    + model.phaseExplanation
                                    + playback note
empty state (Card)                → Chip "SIN EJERCICIO" (neutral)
                                    + "Todavía no hay un ejercicio seleccionado"
                                    + "Abre un ejercicio desde Explorar y pulsa Abrir en Pizarra para verlo aquí."
```

- Board card text block: `gap: spacing.sm`, `paddingTop: spacing.md`, `paddingHorizontal: spacing.sm`, `paddingBottom: spacing.sm`; the card's `sm` padding keeps the pitch wide (board width ≈ 320 dp on a 384 dp screen, so a 112-unit token ≈ 36 dp).
- Copy pins: `SELECCIONADO`, `FASE {order} DE {count}`, `La reproducción por fases llegará en la próxima fase.`, `SIN EJERCICIO`, `Todavía no hay un ejercicio seleccionado`, `Abre un ejercicio desde Explorar y pulsa Abrir en Pizarra para verlo aquí.`
- Removed pins: `El tablero animado 2:1 llegará en la próxima fase.`, `El tablero aún no está conectado`, `La reproducción por fases y las fichas de jugadores se añadirán cuando exista Board Data validado.`, the `SIGUIENTE FASE` chip (the board now exists; the empty state is about selection).
- Unchanged: header, `src/app/(tabs)/pizarra.tsx`, tab/back behaviour, target resolution, fallback for unknown/unpublished ids.

### Public API (`src/modules/board/index.ts`)

Add `TacticsBoard`, `buildBoardRenderModel`, `BOARD_VIEW_BOX`, and the types `TacticsBoardProps`, `BoardRenderModel`, `BoardRenderToken`, `BoardRenderCone`, `BoardRenderBall`, `BoardRenderArrow`, `BoardRenderLabel`, `BoardRenderPoint`; keep `BoardScreen` and `BoardExerciseTarget`. Existing exports keep their exact lines (the screen test asserts them).

## Expected Files By Module And Layer

| Module | Layer | File | Change |
| --- | --- | --- | --- |
| `board` | presentation / view models | `presentation/view-models/board-render-model.ts` | **new** pure model + constants |
| `board` | presentation / components | `presentation/components/tactics-board.tsx` | **new** `TacticsBoard` (only `react-native-svg` importer) |
| `board` | presentation / screens | `presentation/screens/board-screen.tsx` | modify: board card + new fallback copy |
| `board` | public API | `index.ts` | modify: export renderer, builder, types |
| `board` | docs | `README.md` | modify: active presentation files, renderer contract |
| tests | board | `tests/modules/board/presentation/view-models/board-render-model.test.ts` | **new** (18 cases) |
| tests | board | `tests/modules/board/presentation/components/tactics-board.test.ts` | **new** (8 cases, source text) |
| tests | board | `tests/modules/board/presentation/screens/board-screen.test.ts` | modify: 6 → 9 cases (replace the "no SVG/pitch" asserts deliberately) |
| root | dependencies | `package.json`, `package-lock.json` | add `react-native-svg` `15.16.0` via `npx expo install react-native-svg` |
| docs | — | `ARCHITECTURE.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, `docs/board-data-schema.md`, `docs/risks-and-open-questions.md` | update (see below) |

Untouched: `src/modules/board/{domain,application,infrastructure}` (`.gitkeep` stays), `src/app/**`, content source except its README, `src/modules/ai/**`, `src/modules/club/**`, `src/shared/**`, `tests/architecture/**`, `eslint.config.js`, `app.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md`.

## Visual Design Impact

- UI involved: yes. Source: `DESIGN.md` (Colours, Components "interactive pitch board", Layout, Accessibility) plus the prototype layout only.
- Screens: `Pizarra` selected state (new board card), `Pizarra` empty state (new copy).
- Light field (`surfaceContainerLow`) with high-contrast markings (`outline`/`outlineVariant`), carbon/cyan tokens with mono labels, emerald/cyan dashed arrows, 2:1 everywhere, crisp 12-unit field radius, no new colours, no dark court, no heavy shadows. Keeper = double ring, away = dashed ring.
- No new design artifact required; the accepted `DESIGN.md` already describes the board's visual rules.

## Durable Documentation Impact

- `ARCHITECTURE.md`: **update** — `board` catalog (render model + component + screen composition), directory map (`presentation/components`, `presentation/view-models`), "Render a board" data flow (`BoardScreen` → model → SVG), note that `board/domain`/`board/application` stay empty until playback.
- `AGENTS.md`: **update** — project-status paragraph and the board verification rule (renderer draws only given tokens; node tests cannot import SVG).
- `src/modules/board/README.md`: **update** — layers, files, public API, renderer constants summary, tests.
- `docs/board-data-schema.md`: **update** — Renderer Boundary becomes the implemented mapping (viewBox/field, sign of `curve`, half-shade rule, ball badge, no interpolation); later features drop `tactics-board-renderer`.
- `docs/risks-and-open-questions.md`: **update** — mark hand-authored-geometry review as done for the renderer/one phase, record the remaining board risks (see below).
- `PROGRESS.md`, `feature_list.json`, this spec: **update** with evidence and status.
- `docs/technical-discovery.md`: **not needed** — it already pins `react-native-svg`; no statement becomes false.
- `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md`: **not needed** — no token, term or entity changes. `CONSTRAINTS.md` does not exist.

## Test Plan (exact counts)

Baseline **417 tests / 306 suites**. Target **446 tests / ~341 suites** (+29 tests, +35 suites, 0 fail). Tests are fixed at 446; suites are `node:test` `describe` blocks, so 341 was estimated from Given/When/Then nesting — the shipped tree reports **446 tests / 359 suites** and the 29 cases are 1:1 (precedent: `exercise-detail-screen` planned 305 and shipped 306).

| File | Tests | Suites |
| --- | --- | --- |
| `presentation/view-models/board-render-model.test.ts` (**new**) | 18 | 22 |
| `presentation/components/tactics-board.test.ts` (**new**) | 8 | 10 |
| `presentation/screens/board-screen.test.ts` (modified) | 9 (was 6) | 13 (was 10) |

Node's `node:test` cannot load `react-native-svg`, so model tests import `@/modules/board/presentation/view-models/board-render-model` directly, component and screen tests read source text (`readFileSync`), and `src/modules/board/index.ts` is asserted by text. Never import `@/modules/board` from a node test.

### Given / When / Then cases

`board-render-model.test.ts`

1. Given the constants / When read / Then `viewBox` is `'0 0 1000 500'` and `field` is `{20, 10, 960, 480}`, both exactly 2:1.
2. Given points `(0,0)`, `(100,100)`, `(50,50)` / When mapped / Then `(20,10)`, `(980,490)`, `(500,250)`.
3. Given seeded `salida-3-1-presion-alta` phase 1 / When built / Then its 9 tokens keep ids/kinds/teams/labels in `boardData.tokens` order and `por-local` maps to `(96.8, 250)`.
4. Given the same phase / When built / Then 3 cones are mapped (`cono-banda-derecha` → `(404, 34)`), `ball.attachedTokenId` is `'por-local'`, 2 arrows and 1 label are returned.
5. Given the same phase / When arrows are read / Then `pase-portero-cierre` has a control point equal to its chord midpoint, and `desmarque-ala-derecha` (curve −12) has its control on the opposite perpendicular side to the same arrow with `+12`.
6. Given phases 2 and 3 / When built by index / Then `phaseLabel` is `FASE 2 DE 3` / `FASE 3 DE 3`, titles and explanations are verbatim, and arrowheads sit with the tip on the mapped `to`.
7. Given every phase of every one of the 71 bundled boards / When built / Then all 168 calls succeed, every token id exists in that board's `tokens`, and each token centre is inside the field rect.
8. Given phase 1 of `salida-3-1-presion-alta` / When read / Then `counts` is `{9, 3, 2, 1}` and `accessibilityLabel` is exactly `Tablero táctico. Fase 1 de 3: Salida desde portero. 9 fichas, 3 conos, 2 flechas.`
9. Given a synthetic phase with 1 token/cone/arrow / When built / Then `accessibilityLabel` uses `1 ficha`, `1 cono`, `1 flecha`.
10. Given `phaseIndex` values `-1`, `99`, `NaN`, `1.9`, `undefined`, `2` / When built / Then resolved index is `0`, `2`, `0`, `1`, `0`, `2`.
11. Given a deep-cloned board / When built and the model arrays are mutated / Then the original `BoardData` is unchanged and no array/object reference is shared.
12. Given a synthetic `half` board with everything at `x < 50` / When built / Then `inactiveHalf` is `{x: 500, y: 10, width: 480, height: 480}`.
13. Given a synthetic `half` board with everything at `x >= 50` / When built / Then `inactiveHalf` is `{x: 20, y: 10, width: 480, height: 480}`.
14. Given a synthetic `half` board with one cone or label on the other half / When built / Then `inactiveHalf` is `null`.
15. Given a `full` board whose elements all sit on one half / When built / Then `inactiveHalf` is `null`.
16. Given an 80-character label / When wrapped / Then `lines.length <= 3`, every line `<= 28` characters, the last line ends with `…`, and a single 80-character word is hard-split.
17. Given short labels with `align` left/center/right and a word longer than 28 / When built / Then anchors are `start`/`middle`/`end`, `y` is the mapped point, and the long word splits without a hyphen.
18. Given a `null` ball, a ball away from every token, and `curve` at `±100` / When built / Then `ball` is `null`, a free ball's `badge` equals its `point` with `attachedTokenId: null`, and the extreme control offset equals `0.5 × chordLength` on either side.

`tactics-board.test.ts` (source text)

1. Props are `{ boardData: BoardData; phaseIndex?: number }` with default `0` and the component calls `buildBoardRenderModel(boardData, phaseIndex)`.
2. Only `tactics-board.tsx` imports `react-native-svg` (scan `src/modules/board/**`); it imports only the primitives it draws (`Svg`, `Circle`, `Path`, `Rect`, `Text`, plus `Line`/`G` if used) and `@/shared/theme`.
3. `<Svg>` gets `viewBox={model.viewBox}`, `preserveAspectRatio="xMidYMid meet"`, `width="100%"`, `height="100%"`; the wrapper pins `width: '100%'`, `aspectRatio: 2` and no numeric `height`.
4. The wrapper is `accessible`, `accessibilityRole="image"`, `accessibilityLabel={model.accessibilityLabel}` and there is exactly one `accessible` node.
5. Markings exist: field `Rect`, halfway line, centre circle/spot, two 6 m arcs + marks, two goals, four corner arcs — all from `colors.*`, with no literal hex or `#` colour anywhere in the file.
6. Tokens render body + ring + keeper inner ring + mono `Text`; home `colors.text`/`onPrimary`, away `colors.secondary` with `strokeDasharray` on the ring, neutral `surface`/`text`.
7. Cones, arrows (`strokeDasharray` for pass/press/cover, filled head) and the ball badge render from model fields; labels render `model.labels` lines with the pinned anchor.
8. No `content` import, no `players`/`goalkeepers`, no `onPress`/`Pressable`/`useState`/`Animar`/`Animated`, no `accessibilityLabel` on SVG nodes.

`board-screen.test.ts` (deliberately rewritten)

1. Given the target type / Then `BoardExerciseTarget` is unchanged (type-only, 4 fields).
2. Given the screen props / Then `BoardScreen` still accepts `{ exercise?: BoardExerciseTarget | null }`.
3. Given a target / Then the `SELECCIONADO` card keeps chip → title → summary and no longer contains the removed next-phase note.
4. Given a target / When the board card is inspected / Then `<TacticsBoard boardData={exercise.boardData} />` appears once, after the selected card, inside a `Card padding="sm"`.
5. Given a target / When the phase block is read / Then it renders `{model.phaseLabel}` in a `defending` chip, `{model.phaseTitle}`, `{model.phaseExplanation}` and `La reproducción por fases llegará en la próxima fase.`, built from `buildBoardRenderModel(exercise.boardData)`.
6. Given no target / Then `SIN EJERCICIO` + the two pinned sentences render and `<TacticsBoard` is absent.
7. Given the board module sources / Then `board-screen.tsx` imports no `@/modules/content`, has no `players`/`goalkeepers`, no playback control, and the header/pinned description survive.
8. Given the public API / Then `BoardScreen` and `BoardExerciseTarget` keep their exact export lines.
9. Given the public API / Then `TacticsBoard`, `buildBoardRenderModel` and the render types are exported.

`tests/architecture/{architecture,boundaries}.test.ts` must pass **unedited**.

## Verification Plan

- `npx expo install react-native-svg` → `package.json` gets `"react-native-svg": "15.16.0"`; confirm `node_modules/react-native-svg/package.json` version and that no other dependency changed.
- `npm test` → 446 pass / 0 fail, ~341 suites; `npm run lint`, `npm run typecheck`, `npm run verify` (expo-doctor 20/20), `./init.sh` exit 0 without Metro.
- Scans: `rg 'react-native-svg' src` → only `board/presentation/components/tactics-board.tsx`; `rg '@/modules/content' src/modules/board` → empty; `rg -n '#[0-9a-fA-F]{3,8}' src/modules/board` → empty; `rg 'players|goalkeepers|onPress|useState|Animar|Animated' src/modules/board` → empty; `git diff --stat` limited to the files above.
- `npx expo export --platform android` succeeds and a byte scan finds `FASE 1 DE 3`, `La reproducción por fases llegará en la próxima fase.`, `SIN EJERCICIO`, `Todavía no hay un ejercicio seleccionado`.
- `SM-M135F` smoke (`docs/device-development-workflow.md`), Expo Go 58 (bundled `react-native-svg`):
  1. Explorar → Cadete → `PARTE GENERAL` → `Abrir en Pizarra` on `Salida 3-1 ante presión alta`; screenshot the board and compare against the JSON: 9 tokens (2 keepers, dashed away rings), 3 cones, ball badge on the portero, 2 arrows (one straight pass, one curved run), 1 label `Salida en 3-1`, `FASE 1 DE 3` + phase title/explanation + playback note, and no old note.
  2. `adb shell uiautomator dump` → find the node whose `content-desc` starts with `Tablero táctico. Fase 1 de 3:` and assert `bounds` width ÷ height ≈ 2.0.
  3. `adb shell wm size 1200x1920` (rotation is blocked: `app.json` orientation is `portrait`) → re-dump, ratio still ≈ 2.0; then `wm size reset`.
  4. Open a second exercise from Explorar (`Pase y va al carril central` or `Circulación rápida cierre-ala`) and confirm the whole board and phase block replace the first (tokens, cones, arrow count, label, `FASE 1 DE N`).
  5. `/--/pizarra` (and `?exerciseId=no-existe`) shows the new fallback copy with no board; tab re-entry still keeps the last target (accepted behaviour).
  6. 320 dp (`wm size 900x1800`) at `font_scale 1.3`: board still 2:1, chip/title/explanation wrap, no horizontal overflow, no node wider than 900 px.
  7. Restore `wm size reset`, `wm density reset`, `font_scale 1.0`; relaunch; `adb logcat -d -t 1500` has 0 error/exception/fatal matches.
- Half format is **not** seeded: shading is proven by synthetic model + component tests and cannot be device-checked without inventing content (do not add a half exercise).

## Evidence To Capture

- Exact test/suite counts and per-file counts; `npm run verify` and `./init.sh` exit codes; `expo-doctor` score.
- `react-native-svg` version in `package.json` and `node_modules`; `package-lock.json` diff is limited to that dependency.
- Scan outputs, `git diff --stat`, unchanged versions (`1.2.0`, `1.1.0`, Board Data `1.0.0`).
- Android export size/hash and the pinned-string byte scan.
- Device: board screenshot/`uiautomator` `content-desc` + bounds for both viewports (ratio ≈ 2.0), second-exercise replacement, fallback copy, 320 dp/1.3 reflow, restored device, clean `logcat`.

## Implementation Tasks

- [x] Run `./init.sh` and confirm the 417/306 baseline before editing.
- [x] Install `react-native-svg` with `npx expo install`; confirm `15.16.0` and no other dependency change.
- [x] Write `board-render-model.ts` with constants, mapping, arrows, labels, half shade, clamping, ball badge, counts and the a11y label.
- [x] Write the model tests and get the 18 cases green before touching the component.
- [x] Write `tactics-board.tsx` (pitch, tokens, keepers, cones, arrows, ball, labels, one accessible wrapper, tokens only).
- [x] Write the component source tests (single `react-native-svg` importer, 2:1 wrapper, accessibility, no interaction).
- [x] Rewrite `board-screen.tsx` with the board card, phase block and new fallback; remove the three stale copy pins.
- [x] Rewrite `board-screen.test.ts` (6 → 9 cases), replacing the "no SVG/pitch" assertion with the new board-card guard.
- [x] Export the renderer, builder, constants and types from `src/modules/board/index.ts`; assert the barrel by text.
- [x] Update `ARCHITECTURE.md`, `src/modules/board/README.md`, `docs/board-data-schema.md`, `docs/risks-and-open-questions.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json` and this spec.
- [x] Run the full verification plan, the scans, the export and the `SM-M135F` smoke; record evidence.

## Historical Implementation Evidence (2026-10-28; superseded by repair verification below)

- **Tests:** `npm test` → 446/446 tests in 359 suites, 0 failures (baseline 417/306). Per file: `board-render-model.test.ts` 18 tests in 35 suites, `tactics-board.test.ts` 8 in 13, `board-screen.test.ts` 9 in 15 (was 6 in 10). The 29 new cases match the plan 1:1; the suite overshoot is `node:test` Given/When/Then `describe` nesting, not extra cases. `tests/architecture/**` was not edited and passes.
- **Gate:** `npm run lint`, `npm run typecheck`, `npm run verify` (exit 0, `expo-doctor` 20/20) and `./init.sh` (exit 0, no Metro) after the final edits.
- **Dependency:** `npx expo install react-native-svg` pinned `15.16.0` in `package.json` and `node_modules`; the `package-lock.json` diff is limited to `react-native-svg` and its 12 transitive packages.
- **Model:** the model is pure (only the `BoardData` type import), returns copied arrays, clamps `-1`/`99`/`NaN`/`1.9`/`undefined` to `0`/last/`0`/`1`/`0`, maps `(0,0)/(100,100)/(50,50)` to `(20,10)/(980,490)/(500,250)`, keeps the arrowhead tip on the mapped `to`, wraps to ≤ 3 lines of ≤ 28 characters with `…`, shades only a `half` board whose elements and cones all sit on one side, and builds all 71 boards / 168 phases without throwing. A deep-clone probe confirms the input is byte-identical afterwards with no shared references.
- **Renderer:** `tactics-board.tsx` is the only file under `src/modules/board` importing `react-native-svg` (and the only TypeScript file in `src` that does); it uses one `accessible` `accessibilityRole="image"` wrapper with `width: '100%'` / `aspectRatio: 2` and no numeric height, a 100%/100% `Svg` with `viewBox` and `preserveAspectRatio="xMidYMid meet"`, and only theme colours (no literal hex). It has no `content`, `players`/`goalkeepers`, `onPress`, `Pressable`, `useState` or animation.
- **Screen:** `BoardScreen` keeps its header, `BoardExerciseTarget` contract and route wiring; it renders the `SELECCIONADO` card, a `Card padding="sm"` with `TacticsBoard`, the `FASE n DE N` chip, the phase title/explanation and the playback note, or the `SIN EJERCICIO` fallback with both pinned sentences. The three removed notes and the `SIGUIENTE FASE` chip are gone. `src/app/(tabs)/pizarra.tsx` is unchanged.
- **Scans:** the only TypeScript file under `src` importing `react-native-svg` is `tactics-board.tsx` (the module README names it in prose); no `@/modules/content`, literal hex, `players|goalkeepers|onPress|useState|Animar|Animated` under `src/modules/board`; content/package/schema/shared/app/ai/club, `eslint.config.js`, `app.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md` and `docs/domain-model.md` untouched; versions remain `1.2.0`/`1.1.0`/Board Data `1.0.0`.
- **Export:** `npx expo export --platform android` wrote `entry-76d63a708712535644bce100a08f20c8.hbc` (4,066,013 bytes, sha256 `21eeedfb8ea75a0b1d503392f986d9e53095b6bed394b5c2f1f224ae9185b13a`); a UTF-8/UTF-16LE byte scan finds `SIN EJERCICIO`, `Salida en 3-1`, `La reproducción por fases llegará en la próxima fase.`, `Todavía no hay un ejercicio seleccionado` and the `FASE `/` DE ` template pieces. The full `FASE 1 DE 3` is composed at runtime and is not a bundle literal; it is proven on device.
- **Device (`SM-M135F`, Android 14, 450 dpi, Expo Go 58):** Cadete → `PARTE GENERAL` → `Abrir en Pizarra` on `Salida 3-1 ante presión alta` draws 9 tokens (2 keepers), 3 cones, the ball badge on `por-local`, 2 arrows (one straight pass, one curved run) and the label `Salida en 3-1`, matching the JSON, followed by `FASE 1 DE 3`, `Salida desde portero`, the explanation and the playback note. `content-desc` is `Tablero táctico. Fase 1 de 3: Salida desde portero. 9 fichas, 3 conos, 2 flechas.`; wrapper bounds are 894×448 (ratio 1.9955) at 1080×2408 and 1014×508 (ratio 1.9961) at `wm size 1200x1920`. `Pase y va al carril central` fully replaces the board and phase block (8 tokens, 2 cones, 2 arrows, `Pase del cierre al pívot`); `/--/pizarra` and `?exerciseId=no-existe` show the fallback with no board. At 320 dp (`wm size 900x1800`) / `font_scale 1.3` the board is 714×358 (ratio 1.9944), text wraps and nothing overflows. The device was restored (`1080x2408`, 450 dpi, `font_scale 1.0`) and relaunched, and `adb logcat -d -t 1500` has 0 error/exception/FATAL matches.
- **Not device-checkable:** no half-pitch board is seeded, so the inactive-half shade rests on synthetic model tests and the component source guard (do not add a half exercise). There is no RN component-test runner or E2E harness; component/screen coverage is source text plus the model tests plus this smoke. iOS, a real tablet and landscape remain unverified because `app.json` is portrait-only. Two content-geometry overlaps observed on device (`cono-salida` on the first drill's pass arrow, `desmarque-cierre` on the second drill's pass start) are recorded as content authoring, not renderer bugs.
- **Deferred entry:** `exercise-card-detail-affordance` stays in `feature_list.json` as `not_started` and was not implemented. No commit was created.
- **Independent validation:** pending.

## Validator Checklist

### SDK integration verification (2026-11-01; current)

- User authorized the separate maintenance phase. `feat/tactics-board-renderer` is now based on `chore/expo-sdk-alignment` @ `04fd30a` (`build: align Expo 58 SDK patch dependencies`), with renderer work restored. The maintenance commit carries the 11 SDK patch updates; renderer diff against this base still adds only `react-native-svg` 15.16.0 and its transitives. No further dependency edits were made in this integration pass.
- The historical doctor blocker below is resolved, not suppressed: after lock integration and `npm ci`, `./init.sh` exits 0 with lint/typecheck, 446/446 tests in 359 suites (0 skipped), doctor 20/20, and no Metro startup. Both the supplied `sdk-integrated-verify.log` and a fresh `renderer-sdk-final-init.log` under the approved temporary directory record this. Focused board tests rerun: 35/35 in 63 suites.
- Android export exits 0: `entry-534d047d00fedd8242abc67b94bd0356.hbc`, 4,071,826 bytes, SHA-256 `6cde8d8516481a36e029167a9f1156d1eece72c81716a561cc92d5eb05ae9ce2`; byte scan finds fallback, playback note and runtime phase template pieces. Installed Expo is 58.0.22, RN 0.88.1, SVG 15.16.0.
- Current `npm audit --json`: 26 moderate, 0 high, 0 critical, 0 low advisories. No audit fixes in this pass. Earlier high-severity counts are historical.
- Integration device smoke on `SM-M135F`, Android 14, Expo Go 58.0.5, fresh cache-cleared Metro from the original repo: `salida-3-1-presion-alta` visibly shows contrasting inner rings for both keepers and the expected 9-token/3-cone/2-arrow board and phase copy. Wrapper is 894×448 (ratio 1.9955) at 1080×2408, and 1014×508 (ratio 1.9961) at simulated 1200×1920. `pase-y-va-carril-central` replaces the title/board/phase label (8 tokens, 2 cones, 2 arrows); no-param and unknown-id routes both show `SIN EJERCICIO` with no board. 320 dp/1.3 was not repeated in this integration pass; the earlier evidence remains historical.
- Final independent validation returned `accept` on 2026-11-01: `./init.sh` exit 0, 446 tests / 359 suites, doctor 20/20; focused board tests 35/63; Android export 4,071,827 bytes; scope/import/lock and diff checks passed. Final validator did not repeat device smoke; integrated device observations above are implementer evidence supplemented by earlier independent device checks. Next is `exercise-preview-board-thumbnail`; card affordance remains deferred. Native rebuild, iOS and physical tablet remain unverified.
- Device restored and checked at 1080×2408 / 450 dpi / font scale 1.0; last 2,000 log lines have 0 ReactNativeJS error/exception or FATAL matches. Integration Metro stopped. Backup stash preserved. No commits or pushes in this integration pass.

### Historical repair verification (2026-11-01, before authorized SDK alignment)

- Keeper regression repaired: radius 40 (`TOKEN_BODY_RADIUS - 8`), width 3, team label-colour stroke (`onPrimary`, `onSecondary`, `text`). The previous radius 48 / team outer-ring stroke coincided with the body edge and was invisible for home/away. The existing component case now pins the keeper guard, centre, inset radius and contrasting stroke and rejects the previous radius expression; counts remain 446/359. Device screenshot confirms both home and away keeper inner rings are visible.
- At the pre-maintenance repair, focused board tests: 35/35 tests, 63 suites; full gates: lint and typecheck pass, 446/446 tests in 359 suites, but `npm run verify` and `./init.sh` both exit 1 at doctor 19/20. The 2026-10-28 green gate evidence above is historical, not a claim that the pre-maintenance repair gate was green.
- Diagnosis: all 11 flagged packages match package declarations, lockfile and installed versions; installed Expo's `bundledNativeModules.json` agrees. Remote `https://api.expo.dev/v2/sdks/58.0.0/native-modules` and `/v2/versions/latest` instead match doctor's newer expectations. CLI `getCombinedKnownVersionsAsync` prefers remote metadata over bundled metadata. SVG remains 15.16.0 everywhere. A deterministic lock reinstall would restore the same flagged versions, so no reinstall or dependency upgrade was attempted. The exact mismatch table and maintenance options are in `PROGRESS.md`. No exclusions, offline bypass or unrelated dependency changes were made.
- Android export succeeds: `entry-8ff612890922cc32690d49caa51fd587.hbc`, 4,066,033 bytes, sha256 `a69e1d8b581463586c9efbd8fcdbf94e035789f5606370140359ffb345a74aa5`; fallback, playback note and runtime phase template pieces found in UTF-8/UTF-16LE byte scan.
- Durable docs correct the static-renderer/playback boundary, pending acceptance, feature-list order (thumbnail before playback) and the exact seeded clipping case. `exercise-card-detail-affordance` remains deferred and untouched. Content source, seed positions and mapping are unchanged; the content README documentation correction is the sole exception to the original content-module no-change scope.
- Status remains `passing` by explicit repair instruction, not accepted and not a full-green gate at that pre-maintenance point. Independent validator must rerun after these repairs; SDK maintenance needs separate user authorization.

- [x] `TacticsBoard` renders exactly the received Board Data (no invented token, cone, arrow, label, position or phase) and is reusable with only `boardData` + `phaseIndex`.
- [x] The model is pure, clamps the phase, never mutates, and matches every pinned constant/formula.
- [x] 2:1 holds on device at two viewports; no fixed height.
- [x] Copy pins match: `FASE n DE N`, playback note, `SIN EJERCICIO`, both fallback sentences; the removed notes are gone.
- [x] One accessible image wrapper with the pinned Spanish label; no colour-only home/away/keeper signal.
- [x] `react-native-svg` is the only dependency change relative to maintenance base; only `tactics-board.tsx` imports it; no `content`/`players`/interaction/animation/hex.
- [x] 446 tests / 359 suites, lint, typecheck, verify, `./init.sh`, export, scans green; architecture tests unedited.
- [x] Docs updated as listed; `DESIGN.md`/`CONTEXT.md`/`docs/domain-model.md` untouched.
- [x] The deferred `exercise-card-detail-affordance` entry survives and is not implemented.

## Planning-Time Risks

- **Ball co-location (measured, all 168 phases).** Every seeded ball sits exactly on a token centre, so a disc drawn at the raw point erases the mono label. This spec pins a deterministic badge offset (tangent lower-right) and keeps `ball.point` exact; a validator that reads "never moves the ball" strictly must accept the documented badge convention, or the feature must accept a covered shirt number.
- **Edge overflow.** Tokens/cones/labels on the touchline (`y = 0/100`, `x = 0/100`) can extend past the 20/10-unit viewBox margin and be clipped; even seeded centres inside 5–95 can clip: `presion-tras-saque-de-banda` phases 1–2 token `r1` maps to y = 48.4; its radius-56 outer ring reaches y = −7.6 (−8.6 including the 2-unit stroke), outside the viewBox. This is a known seed/display limitation, not a claim of fully visible seeded rings. No clamping is added (that would move data).
- **Seed facts differ from an earlier planning assumption.** Measured in this tree: 4–10 tokens per board (519 players + 38 keepers), 0–8 cones (27 boards with none), 1–3 arrows per phase (399 total, 61 with `curve`), 67 labels (53 centre / 9 right / 5 left), 168/168 phases with a ball. Any assumption of 5–14 tokens or 0–3 cones is wrong for this tree; use the measured numbers.
- **`react-native-svg` inside Expo Go.** It is bundled in Expo Go 58 (`15.16.0`) and already pinned by `docs/device-development-workflow.md` and `docs/technical-discovery.md`, and the app had never imported it before this feature. Resolved for the shipped renderer: the device smoke rendered the pitch, tokens, cones, arrows, ball badge and labels; the arrow dash patterns are visible but not pixel-audited.
- **No RN component-test runner or E2E harness.** Component/screen coverage is source-text assertions plus the model tests plus the manual smoke; visual regressions (stroke widths, overlap, clipping) are only caught by eye.
- **Half format unseeded.** The graceful half-court degradation (feature_list #3) can only be proven synthetically; do not add a seeded half board in this feature.
- **Legacy boards with fewer tokens than players** (5 boards) will look like they are missing players; the renderer must keep drawing exactly its tokens, and that remains a content risk, not a renderer bug.
- **iPad/iOS and landscape** are unverified: `app.json` is portrait-only, so the 2:1 proof uses `wm size` on the one Android phone.
- **Legibility of hand-authored geometry** (cramped small-space drills, two tokens 2 units apart in `salida-3-2-cambio-ala`) is now visible for the first time; review the smoke screenshot and record any content-geometry follow-up rather than "fixing" data in the renderer.
