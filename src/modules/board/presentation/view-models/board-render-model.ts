import type { BoardData } from '@/shared/domain';

export type BoardRenderPoint = { x: number; y: number };

export type BoardRenderToken = {
  id: string;
  kind: 'player' | 'keeper';
  team: 'home' | 'away' | 'neutral';
  label: string;
  point: BoardRenderPoint;
};

export type BoardRenderCone = { id: string; point: BoardRenderPoint };

export type BoardRenderBall = {
  point: BoardRenderPoint;
  badge: BoardRenderPoint;
  attachedTokenId: string | null;
};

export type BoardRenderArrow = {
  id: string;
  kind: 'run' | 'pass' | 'press' | 'cover';
  team: 'home' | 'away' | 'neutral';
  path: string;
  head: [BoardRenderPoint, BoardRenderPoint, BoardRenderPoint];
};

export type BoardRenderLabel = {
  id: string;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  lines: string[];
};

export type BoardRenderModel = {
  viewBox: string;
  field: { x: number; y: number; width: number; height: number };
  phaseIndex: number;
  phaseNumber: number;
  phaseCount: number;
  phaseTitle: string;
  phaseExplanation: string;
  phaseLabel: string;
  tokens: BoardRenderToken[];
  cones: BoardRenderCone[];
  ball: BoardRenderBall | null;
  arrows: BoardRenderArrow[];
  labels: BoardRenderLabel[];
  inactiveHalf: { x: number; y: number; width: number; height: number } | null;
  counts: { tokens: number; cones: number; arrows: number; labels: number };
  accessibilityLabel: string;
};

export const BOARD_VIEW_BOX: { width: number; height: number } = { width: 1000, height: 500 };

export const BOARD_FIELD: { x: number; y: number; width: number; height: number } = {
  x: 20,
  y: 10,
  width: 960,
  height: 480,
};

export const TOKEN_BODY_RADIUS = 48;
export const TOKEN_RING_RADIUS = 56;
export const TOKEN_KEEPER_RING_WIDTH = 3;
export const TOKEN_LABEL_FONT_SIZE = 30;
export const TOKEN_LABEL_BASELINE_OFFSET = 10;
export const CONE_APEX_OFFSET = 14;
export const CONE_BASE_HALF_WIDTH = 12;
export const CONE_BASE_OFFSET = 10;
export const BALL_RADIUS = 12;
export const BALL_DOT_RADIUS = 3;
export const BALL_BADGE_GAP = 2;
export const ARROW_CURVE_SCALE = 0.5;
export const ARROW_HEAD_LENGTH = 22;
export const ARROW_HEAD_WIDTH = 16;
export const ARROW_STROKE_WIDTH = 4;
export const LABEL_MAX_LINE_CHARS = 28;
export const LABEL_MAX_LINES = 3;
export const LABEL_FONT_SIZE = 30;
export const LABEL_LINE_HEIGHT = 34;
export const INACTIVE_HALF_OPACITY = 0.55;

const BALL_COINCIDENCE_TOLERANCE = 0.5;
const BALL_BADGE_DIRECTION: BoardRenderPoint = { x: 0.6, y: 0.8 };
const HALFWAY_X = 50;

function mapPoint(point: BoardRenderPoint): BoardRenderPoint {
  return {
    x: BOARD_FIELD.x + (point.x / 100) * BOARD_FIELD.width,
    y: BOARD_FIELD.y + (point.y / 100) * BOARD_FIELD.height,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalize(x: number, y: number): BoardRenderPoint | null {
  const length = Math.hypot(x, y);

  if (length === 0) {
    return null;
  }

  return { x: x / length, y: y / length };
}

function resolvePhaseIndex(phaseIndex: number | undefined, phaseCount: number): number {
  const finiteIndex = Number.isFinite(phaseIndex) ? Math.trunc(phaseIndex as number) : 0;

  return Math.min(Math.max(finiteIndex, 0), phaseCount - 1);
}

function hardSplitWord(word: string): string[] {
  if (word.length <= LABEL_MAX_LINE_CHARS) {
    return [word];
  }

  const chunks: string[] = [];

  for (let index = 0; index < word.length; index += LABEL_MAX_LINE_CHARS) {
    chunks.push(word.slice(index, index + LABEL_MAX_LINE_CHARS));
  }

  return chunks;
}

function wrapLabel(text: string): string[] {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(hardSplitWord);
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    if (current === '') {
      current = word;
      return;
    }

    if (current.length + 1 + word.length <= LABEL_MAX_LINE_CHARS) {
      current = `${current} ${word}`;
      return;
    }

    lines.push(current);
    current = word;
  });

  if (current !== '') {
    lines.push(current);
  }

  if (lines.length <= LABEL_MAX_LINES) {
    return lines;
  }

  const visibleLines = lines.slice(0, LABEL_MAX_LINES);
  const lastLine = visibleLines[LABEL_MAX_LINES - 1];

  visibleLines[LABEL_MAX_LINES - 1] = `${lastLine
    .slice(0, LABEL_MAX_LINE_CHARS - 1)
    .trimEnd()}…`;

  return visibleLines;
}

function computeInactiveHalf(
  boardData: BoardData,
  phaseIndex: number,
): { x: number; y: number; width: number; height: number } | null {
  if (boardData.pitch.format !== 'half') {
    return null;
  }

  const phase = boardData.phases[phaseIndex];
  const xs = [
    ...phase.positions.map((position) => position.x),
    ...boardData.cones.map((cone) => cone.x),
    ...(phase.ball ? [phase.ball.x] : []),
    ...phase.arrows.flatMap((arrow) => [arrow.from.x, arrow.to.x]),
    ...phase.labels.map((label) => label.x),
  ];

  if (xs.length === 0) {
    return null;
  }

  const halfWidth = BOARD_FIELD.width / 2;

  if (xs.every((x) => x < HALFWAY_X)) {
    return {
      x: BOARD_FIELD.x + halfWidth,
      y: BOARD_FIELD.y,
      width: halfWidth,
      height: BOARD_FIELD.height,
    };
  }

  if (xs.every((x) => x >= HALFWAY_X)) {
    return {
      x: BOARD_FIELD.x,
      y: BOARD_FIELD.y,
      width: halfWidth,
      height: BOARD_FIELD.height,
    };
  }

  return null;
}

function buildArrow(
  arrow: BoardData['phases'][number]['arrows'][number],
): BoardRenderArrow {
  const from = mapPoint(arrow.from);
  const to = mapPoint(arrow.to);
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const chord = { x: to.x - from.x, y: to.y - from.y };
  const chordLength = Math.hypot(chord.x, chord.y);
  const control =
    chordLength === 0
      ? mid
      : {
          x:
            mid.x +
            (-chord.y / chordLength) * (arrow.curve / 100) * chordLength * ARROW_CURVE_SCALE,
          y:
            mid.y +
            (chord.x / chordLength) * (arrow.curve / 100) * chordLength * ARROW_CURVE_SCALE,
        };
  const tangent =
    normalize(to.x - control.x, to.y - control.y) ??
    normalize(chord.x, chord.y) ?? { x: 1, y: 0 };
  const perpendicular = { x: -tangent.y, y: tangent.x };
  const headBase = {
    x: to.x - tangent.x * ARROW_HEAD_LENGTH,
    y: to.y - tangent.y * ARROW_HEAD_LENGTH,
  };
  const halfWidth = ARROW_HEAD_WIDTH / 2;

  return {
    id: arrow.id,
    kind: arrow.kind,
    team: arrow.team,
    path: `M ${round2(from.x)} ${round2(from.y)} Q ${round2(control.x)} ${round2(
      control.y,
    )} ${round2(to.x)} ${round2(to.y)}`,
    head: [
      { x: to.x, y: to.y },
      {
        x: headBase.x + perpendicular.x * halfWidth,
        y: headBase.y + perpendicular.y * halfWidth,
      },
      {
        x: headBase.x - perpendicular.x * halfWidth,
        y: headBase.y - perpendicular.y * halfWidth,
      },
    ],
  };
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function buildBoardRenderModel(
  boardData: BoardData,
  phaseIndex = 0,
): BoardRenderModel {
  const resolvedPhaseIndex = resolvePhaseIndex(phaseIndex, boardData.phases.length);
  const phase = boardData.phases[resolvedPhaseIndex];
  const positionsByTokenId = new Map(
    phase.positions.map((position) => [position.tokenId, position]),
  );

  const tokens = boardData.tokens.flatMap<BoardRenderToken>((token) => {
    const position = positionsByTokenId.get(token.id);

    if (!position) {
      return [];
    }

    return [
      {
        id: token.id,
        kind: token.kind,
        team: token.team,
        label: token.label,
        point: mapPoint(position),
      },
    ];
  });

  const cones = boardData.cones.map<BoardRenderCone>((cone) => ({
    id: cone.id,
    point: mapPoint(cone),
  }));

  const arrows = phase.arrows.map(buildArrow);

  const labels = phase.labels.map<BoardRenderLabel>((label) => {
    const point = mapPoint(label);

    return {
      id: label.id,
      x: point.x,
      y: point.y,
      anchor: label.align === 'left' ? 'start' : label.align === 'right' ? 'end' : 'middle',
      lines: wrapLabel(label.text),
    };
  });

  const ballPoint = phase.ball ? mapPoint(phase.ball) : null;
  const ballCarrier =
    ballPoint === null
      ? undefined
      : tokens.find(
          (token) =>
            Math.hypot(token.point.x - ballPoint.x, token.point.y - ballPoint.y) <=
            BALL_COINCIDENCE_TOLERANCE,
        );
  const ball: BoardRenderBall | null = ballPoint
    ? {
        point: ballPoint,
        badge: ballCarrier
          ? {
              x:
                ballCarrier.point.x +
                BALL_BADGE_DIRECTION.x *
                  (TOKEN_RING_RADIUS + BALL_BADGE_GAP + BALL_RADIUS),
              y:
                ballCarrier.point.y +
                BALL_BADGE_DIRECTION.y *
                  (TOKEN_RING_RADIUS + BALL_BADGE_GAP + BALL_RADIUS),
            }
          : { x: ballPoint.x, y: ballPoint.y },
        attachedTokenId: ballCarrier ? ballCarrier.id : null,
      }
    : null;

  const phaseCount = boardData.phases.length;
  const phaseLabel = `FASE ${phase.order} DE ${phaseCount}`;
  const accessibilityLabel = `Tablero táctico. Fase ${phase.order} de ${phaseCount}: ${
    phase.title
  }. ${pluralize(tokens.length, 'ficha', 'fichas')}, ${pluralize(
    cones.length,
    'cono',
    'conos',
  )}, ${pluralize(arrows.length, 'flecha', 'flechas')}.`;

  return {
    viewBox: `0 0 ${BOARD_VIEW_BOX.width} ${BOARD_VIEW_BOX.height}`,
    field: { ...BOARD_FIELD },
    phaseIndex: resolvedPhaseIndex,
    phaseNumber: phase.order,
    phaseCount,
    phaseTitle: phase.title,
    phaseExplanation: phase.explanation,
    phaseLabel,
    tokens,
    cones,
    ball,
    arrows,
    labels,
    inactiveHalf: computeInactiveHalf(boardData, resolvedPhaseIndex),
    counts: {
      tokens: tokens.length,
      cones: cones.length,
      arrows: arrows.length,
      labels: labels.length,
    },
    accessibilityLabel,
  };
}
