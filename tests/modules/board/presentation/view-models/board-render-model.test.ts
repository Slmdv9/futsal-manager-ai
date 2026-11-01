import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listExercises } from '@/modules/content/application/list-exercises';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';
import { parseBoardData, type BoardData } from '@/shared/domain';
import {
  BOARD_VIEW_BOX,
  buildBoardRenderModel,
  type BoardRenderPoint,
} from '@/modules/board/presentation/view-models/board-render-model';

type ArrowInput = {
  id: string;
  kind: 'run' | 'pass' | 'press' | 'cover';
  team: 'home' | 'away' | 'neutral';
  from: BoardRenderPoint;
  to: BoardRenderPoint;
  curve?: number;
};

type LabelInput = {
  id: string;
  text: string;
  x: number;
  y: number;
  align?: 'left' | 'center' | 'right';
};

type BoardOptions = {
  format?: 'full' | 'half';
  tokens?: BoardData['tokens'];
  positions?: { tokenId: string; x: number; y: number }[];
  cones?: BoardData['cones'];
  ball?: BoardRenderPoint | null;
  arrows?: ArrowInput[];
  labels?: LabelInput[];
};

const DEFAULT_TOKEN = { id: 'uno', kind: 'player', team: 'home', label: 'UNO' } as const;
const SALIDA_ID = 'salida-3-1-presion-alta';

function makeBoard(options: BoardOptions = {}): BoardData {
  return parseBoardData({
    schemaVersion: '1.0.0',
    pitch: { format: options.format ?? 'full' },
    tokens: options.tokens ?? [DEFAULT_TOKEN],
    cones: options.cones ?? [],
    phases: [
      {
        id: 'fase-1',
        order: 1,
        title: 'Fase uno',
        explanation: 'Explicación de la fase uno.',
        positions: options.positions ?? [{ tokenId: 'uno', x: 50, y: 50 }],
        ball: options.ball ?? null,
        arrows: options.arrows ?? [],
        labels: options.labels ?? [],
      },
    ],
  });
}

function seededBoard(exerciseId: string): BoardData {
  const exercise = listExercises(createBundledContentRepository()).find(
    (candidate) => candidate.id === exerciseId,
  );

  assert.ok(exercise, `Expected the bundled seed to contain ${exerciseId}.`);

  return exercise.boardData;
}

function cloneBoard(board: BoardData): BoardData {
  return JSON.parse(JSON.stringify(board)) as BoardData;
}

function mapNormalized(point: BoardRenderPoint): BoardRenderPoint {
  return { x: 20 + (point.x / 100) * 960, y: 10 + (point.y / 100) * 480 };
}

function readArrowPath(path: string): {
  from: BoardRenderPoint;
  control: BoardRenderPoint;
  to: BoardRenderPoint;
} {
  const numbers = (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

  assert.equal(numbers.length, 6, `Expected six path numbers in "${path}".`);

  return {
    from: { x: numbers[0], y: numbers[1] },
    control: { x: numbers[2], y: numbers[3] },
    to: { x: numbers[4], y: numbers[5] },
  };
}

function offsetFromMid(
  path: string,
): { mid: BoardRenderPoint; offset: BoardRenderPoint; length: number } {
  const { from, control, to } = readArrowPath(path);
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  return {
    mid,
    offset: { x: control.x - mid.x, y: control.y - mid.y },
    length: Math.hypot(to.x - from.x, to.y - from.y),
  };
}

describe('Board render model', () => {
  describe('Given the pinned renderer constants', () => {
    describe('When a board is built', () => {
      it('then the viewBox and the field are exactly 2:1', () => {
        const model = buildBoardRenderModel(makeBoard());

        assert.deepEqual(BOARD_VIEW_BOX, { width: 1000, height: 500 });
        assert.equal(model.viewBox, '0 0 1000 500');
        assert.deepEqual(model.field, { x: 20, y: 10, width: 960, height: 480 });
        assert.equal(BOARD_VIEW_BOX.width / BOARD_VIEW_BOX.height, 2);
        assert.equal(model.field.width / model.field.height, 2);
      });
    });
  });

  describe('Given normalized coordinates', () => {
    describe('When three tokens are mapped', () => {
      it('then the mapping is proportional across the field rectangle', () => {
        const board = makeBoard({
          tokens: [
            { id: 'uno', kind: 'player', team: 'home', label: 'UNO' },
            { id: 'dos', kind: 'player', team: 'home', label: 'DOS' },
            { id: 'tres', kind: 'player', team: 'home', label: 'TRE' },
          ],
          positions: [
            { tokenId: 'uno', x: 0, y: 0 },
            { tokenId: 'dos', x: 100, y: 100 },
            { tokenId: 'tres', x: 50, y: 50 },
          ],
        });

        const model = buildBoardRenderModel(board);

        assert.deepEqual(model.tokens[0].point, { x: 20, y: 10 });
        assert.deepEqual(model.tokens[1].point, { x: 980, y: 490 });
        assert.deepEqual(model.tokens[2].point, { x: 500, y: 250 });
      });
    });
  });

  describe('Given the seeded salida-3-1-presion-alta board', () => {
    describe('When phase 1 is built', () => {
      it('then its 9 tokens keep the board order, kinds, teams and labels', () => {
        const board = seededBoard(SALIDA_ID);
        const model = buildBoardRenderModel(board);

        assert.equal(model.tokens.length, 9);
        assert.deepEqual(
          model.tokens.map((token) => token.id),
          board.tokens.map((token) => token.id),
        );
        assert.deepEqual(
          model.tokens.map((token) => [token.kind, token.team, token.label]),
          board.tokens.map((token) => [token.kind, token.team, token.label]),
        );
        assert.equal(
          model.tokens.filter((token) => token.kind === 'keeper').length,
          2,
        );
        assert.equal(model.tokens.filter((token) => token.team === 'home').length, 5);
        assert.equal(model.tokens.filter((token) => token.team === 'away').length, 4);
        assert.deepEqual(
          model.tokens.find((token) => token.id === 'por-local')?.point,
          { x: 96.8, y: 250 },
        );
      });

      it('then its 3 cones, attached ball, 2 arrows and 1 label come from that phase', () => {
        const board = seededBoard(SALIDA_ID);
        const model = buildBoardRenderModel(board);
        const phase = board.phases[0];

        assert.equal(model.cones.length, 3);
        assert.deepEqual(
          model.cones.map((cone) => cone.id),
          board.cones.map((cone) => cone.id),
        );
        assert.deepEqual(
          model.cones.find((cone) => cone.id === 'cono-banda-derecha')?.point,
          { x: 404, y: 34 },
        );

        assert.ok(model.ball);
        assert.equal(model.ball.attachedTokenId, 'por-local');
        assert.deepEqual(model.ball.point, { x: 96.8, y: 250 });
        assert.deepEqual(model.ball.badge, { x: 138.8, y: 306 });

        assert.equal(model.arrows.length, phase.arrows.length);
        assert.equal(model.arrows.length, 2);
        assert.equal(model.labels.length, 1);
        assert.equal(model.labels[0].lines.join(' '), 'Salida en 3-1');
      });
    });
  });

  describe('Given arrow geometry', () => {
    describe('When a straight and a curved arrow are built', () => {
      it('then curve 0 keeps the control on the chord midpoint and curve -12 mirrors +12', () => {
        const board = seededBoard(SALIDA_ID);
        const straight = buildBoardRenderModel(board).arrows.find(
          (arrow) => arrow.id === 'pase-portero-cierre',
        );
        const curved = buildBoardRenderModel(board).arrows.find(
          (arrow) => arrow.id === 'desmarque-ala-derecha',
        );
        const mirroredBoard = cloneBoard(board);

        mirroredBoard.phases[0].arrows[1].curve = 12;

        const mirrored = buildBoardRenderModel(mirroredBoard).arrows.find(
          (arrow) => arrow.id === 'desmarque-ala-derecha',
        );

        assert.ok(straight);
        assert.ok(curved);
        assert.ok(mirrored);

        const straightGeometry = offsetFromMid(straight.path);

        assert.deepEqual(straightGeometry.offset, { x: 0, y: 0 });

        const curvedGeometry = offsetFromMid(curved.path);
        const mirroredGeometry = offsetFromMid(mirrored.path);

        assert.ok(Math.abs(curvedGeometry.offset.x) > 1);
        assert.ok(Math.abs(curvedGeometry.offset.y) > 1);
        assert.ok(Math.abs(curvedGeometry.offset.x + mirroredGeometry.offset.x) < 0.02);
        assert.ok(Math.abs(curvedGeometry.offset.y + mirroredGeometry.offset.y) < 0.02);
      });
    });
  });

  describe('Given the seeded salida-3-1-presion-alta later phases', () => {
    describe('When phases 2 and 3 are built by index', () => {
      it('then the copy is verbatim and every arrowhead tip sits on the mapped end', () => {
        const board = seededBoard(SALIDA_ID);
        const second = buildBoardRenderModel(board, 1);
        const third = buildBoardRenderModel(board, 2);

        assert.equal(second.phaseLabel, 'FASE 2 DE 3');
        assert.equal(second.phaseTitle, 'Pase al carril derecho');
        assert.equal(
          second.phaseExplanation,
          'El cierre conecta con el ala derecha mientras la defensa rival ajusta la presión.',
        );
        assert.equal(third.phaseLabel, 'FASE 3 DE 3');
        assert.equal(third.phaseTitle, 'Cambio de orientación');
        assert.equal(
          third.phaseExplanation,
          'El balón cambia de orientación para liberar al ala izquierda en el último carril.',
        );

        [second, third].forEach((model, offset) => {
          const phase = board.phases[offset + 1];

          model.arrows.forEach((arrow, index) => {
            assert.deepEqual(arrow.head[0], mapNormalized(phase.arrows[index].to));
            assert.equal(arrow.head.length, 3);
          });
        });
      });
    });
  });

  describe('Given every phase of every bundled board', () => {
    describe('When every phase is built', () => {
      it('then all 168 phases succeed with only declared tokens inside the field', () => {
        const exercises = listExercises(createBundledContentRepository());
        const totalPhases = exercises.reduce(
          (total, exercise) => total + exercise.boardData.phases.length,
          0,
        );
        const { x, y, width, height } = { x: 20, y: 10, width: 960, height: 480 };
        let builtPhases = 0;

        assert.equal(exercises.length, 71);
        assert.equal(totalPhases, 168);

        exercises.forEach((exercise) => {
          const board = exercise.boardData;
          const tokenIds = new Set(board.tokens.map((token) => token.id));

          board.phases.forEach((_phase, phaseIndex) => {
            const model = buildBoardRenderModel(board, phaseIndex);

            builtPhases += 1;
            assert.equal(model.phaseIndex, phaseIndex);
            assert.equal(model.phaseLabel, `FASE ${phaseIndex + 1} DE ${board.phases.length}`);
            assert.equal(model.tokens.length, board.tokens.length);

            model.tokens.forEach((token) => {
              assert.ok(tokenIds.has(token.id));
              assert.ok(token.point.x >= x && token.point.x <= x + width);
              assert.ok(token.point.y >= y && token.point.y <= y + height);
            });
          });
        });

        assert.equal(builtPhases, 168);
      });
    });
  });

  describe('Given the seeded first phase counts', () => {
    describe('When the counts and accessibility label are read', () => {
      it('then they match the drawn phase exactly', () => {
        const model = buildBoardRenderModel(seededBoard(SALIDA_ID));

        assert.deepEqual(model.counts, { tokens: 9, cones: 3, arrows: 2, labels: 1 });
        assert.equal(
          model.accessibilityLabel,
          'Tablero táctico. Fase 1 de 3: Salida desde portero. 9 fichas, 3 conos, 2 flechas.',
        );
      });
    });
  });

  describe('Given a phase with one token, one cone and one arrow', () => {
    describe('When the accessibility label is read', () => {
      it('then every count uses its singular form', () => {
        const model = buildBoardRenderModel(
          makeBoard({
            cones: [{ id: 'cono', x: 10, y: 10 }],
            arrows: [
              {
                id: 'pase',
                kind: 'pass',
                team: 'home',
                from: { x: 10, y: 10 },
                to: { x: 40, y: 40 },
              },
            ],
          }),
        );

        assert.match(model.accessibilityLabel, /1 ficha, 1 cono, 1 flecha\.$/);
        assert.equal(
          model.accessibilityLabel,
          'Tablero táctico. Fase 1 de 1: Fase uno. 1 ficha, 1 cono, 1 flecha.',
        );
      });
    });
  });

  describe('Given a phase index outside the phase range', () => {
    describe('When the model resolves it', () => {
      it('then invalid and fractional indexes are truncated and clamped', () => {
        const board = seededBoard(SALIDA_ID);
        const expected: [number | undefined, number][] = [
          [-1, 0],
          [99, 2],
          [NaN, 0],
          [1.9, 1],
          [undefined, 0],
          [2, 2],
        ];

        expected.forEach(([requested, resolved]) => {
          assert.equal(buildBoardRenderModel(board, requested).phaseIndex, resolved);
        });
      });
    });
  });

  describe('Given a built model', () => {
    describe('When the model is mutated', () => {
      it('then the Board Data stays byte-identical and no reference is shared', () => {
        const board = seededBoard(SALIDA_ID);
        const snapshot = JSON.stringify(board);
        const phase = board.phases[0];
        const model = buildBoardRenderModel(board);

        assert.notStrictEqual(model.tokens, board.tokens);
        assert.notStrictEqual(model.cones, board.cones);
        assert.notStrictEqual(model.arrows[0], phase.arrows[0]);
        assert.notStrictEqual(model.labels[0], phase.labels[0]);
        assert.notStrictEqual(model.ball, phase.ball);

        model.tokens[0].point.x = -1;
        model.tokens.push({ ...model.tokens[0] });
        model.cones.length = 0;
        model.arrows[0].head[0].y = -1;
        model.labels[0].lines.push('extra');
        if (model.ball) {
          model.ball.badge.x = -1;
        }

        assert.equal(JSON.stringify(board), snapshot);
      });
    });
  });

  describe('Given a half board with every element on the left', () => {
    describe('When the model builds it', () => {
      it('then the inactive half is the right half of the field', () => {
        const model = buildBoardRenderModel(
          makeBoard({
            format: 'half',
            positions: [{ tokenId: 'uno', x: 10, y: 50 }],
            cones: [{ id: 'cono', x: 20, y: 20 }],
            ball: { x: 30, y: 30 },
            arrows: [
              {
                id: 'pase',
                kind: 'pass',
                team: 'home',
                from: { x: 10, y: 10 },
                to: { x: 20, y: 20 },
              },
            ],
            labels: [{ id: 'etiqueta', text: 'Salida', x: 5, y: 5 }],
          }),
        );

        assert.deepEqual(model.inactiveHalf, { x: 500, y: 10, width: 480, height: 480 });
      });
    });
  });

  describe('Given a half board with every element on the right', () => {
    describe('When the model builds it', () => {
      it('then the inactive half is the left half of the field', () => {
        const model = buildBoardRenderModel(
          makeBoard({
            format: 'half',
            positions: [{ tokenId: 'uno', x: 60, y: 50 }],
            cones: [{ id: 'cono', x: 50, y: 20 }],
            ball: { x: 80, y: 30 },
            labels: [{ id: 'etiqueta', text: 'Salida', x: 90, y: 5 }],
          }),
        );

        assert.deepEqual(model.inactiveHalf, { x: 20, y: 10, width: 480, height: 480 });
      });
    });
  });

  describe('Given a half board with an element across the halfway line', () => {
    describe('When the model builds it', () => {
      it('then no half is shaded', () => {
        const straddlingCone = buildBoardRenderModel(
          makeBoard({
            format: 'half',
            positions: [{ tokenId: 'uno', x: 10, y: 50 }],
            cones: [{ id: 'cono', x: 70, y: 20 }],
          }),
        );
        const straddlingLabel = buildBoardRenderModel(
          makeBoard({
            format: 'half',
            positions: [{ tokenId: 'uno', x: 80, y: 50 }],
            labels: [{ id: 'etiqueta', text: 'Salida', x: 20, y: 5 }],
          }),
        );

        assert.equal(straddlingCone.inactiveHalf, null);
        assert.equal(straddlingLabel.inactiveHalf, null);
      });
    });
  });

  describe('Given a full board with every element on one half', () => {
    describe('When the model builds it', () => {
      it('then a full pitch is never shaded', () => {
        const model = buildBoardRenderModel(
          makeBoard({
            format: 'full',
            positions: [{ tokenId: 'uno', x: 10, y: 50 }],
            cones: [{ id: 'cono', x: 20, y: 20 }],
          }),
        );

        assert.equal(model.inactiveHalf, null);
      });
    });
  });

  describe('Given label text at the 80-character limit', () => {
    describe('When it is wrapped', () => {
      it('then it fits three lines of 28 characters and drops content with an ellipsis', () => {
        const model = buildBoardRenderModel(
          makeBoard({
            labels: [
              {
                id: 'etiqueta-larga',
                text: 'Salida desde portero con presión alta y cambio de orientación al carril central.',
                x: 20,
                y: 8,
              },
              { id: 'palabra-larga', text: 'a'.repeat(80), x: 20, y: 40 },
            ],
          }),
        );

        const wrapped = model.labels[0].lines;
        const hardSplit = model.labels[1].lines;

        assert.ok(wrapped.length <= 3);
        wrapped.forEach((line) => assert.ok(line.length <= 28));
        assert.ok(wrapped[wrapped.length - 1].endsWith('…'));

        assert.ok(hardSplit.length <= 3);
        hardSplit.forEach((line) => assert.ok(line.length <= 28));
        assert.equal(hardSplit.join(''), 'a'.repeat(80));
      });
    });
  });

  describe('Given short labels with every alignment', () => {
    describe('When they are built', () => {
      it('then each anchor and y baseline is mapped and long words split without a hyphen', () => {
        const model = buildBoardRenderModel(
          makeBoard({
            labels: [
              { id: 'izquierda', text: 'Salida', x: 10, y: 20, align: 'left' },
              { id: 'centro', text: 'Presión', x: 50, y: 40, align: 'center' },
              { id: 'derecha', text: 'Cierre', x: 90, y: 60, align: 'right' },
              {
                id: 'palabra-larga',
                text: 'Contraatacarderechoconcincojugadores',
                x: 10,
                y: 80,
              },
            ],
          }),
        );

        assert.equal(model.labels[0].anchor, 'start');
        assert.equal(model.labels[1].anchor, 'middle');
        assert.equal(model.labels[2].anchor, 'end');
        assert.equal(model.labels[0].y, 10 + (20 / 100) * 480);
        assert.equal(model.labels[1].y, 10 + (40 / 100) * 480);
        assert.equal(model.labels[2].y, 10 + (60 / 100) * 480);

        const longWordLines = model.labels[3].lines;

        assert.ok(longWordLines.length > 1);
        longWordLines.forEach((line) => {
          assert.ok(line.length <= 28);
          assert.equal(line.includes('-'), false);
        });
        assert.equal(longWordLines.join(''), 'Contraatacarderechoconcincojugadores');
      });
    });
  });

  describe('Given a missing ball, a free ball and extreme curves', () => {
    describe('When the model builds them', () => {
      it('then the ball stays null or exact and extreme control offsets reach half the chord', () => {
        const withoutBall = buildBoardRenderModel(
          makeBoard({ positions: [{ tokenId: 'uno', x: 50, y: 50 }] }),
        );
        const freeBall = buildBoardRenderModel(
          makeBoard({
            positions: [{ tokenId: 'uno', x: 10, y: 10 }],
            ball: { x: 60, y: 60 },
          }),
        );
        const forward = buildBoardRenderModel(
          makeBoard({
            arrows: [
              {
                id: 'curva',
                kind: 'cover',
                team: 'neutral',
                from: { x: 10, y: 10 },
                to: { x: 50, y: 50 },
                curve: 100,
              },
            ],
          }),
        ).arrows[0];
        const backward = buildBoardRenderModel(
          makeBoard({
            arrows: [
              {
                id: 'curva',
                kind: 'cover',
                team: 'neutral',
                from: { x: 10, y: 10 },
                to: { x: 50, y: 50 },
                curve: -100,
              },
            ],
          }),
        ).arrows[0];

        assert.equal(withoutBall.ball, null);
        assert.deepEqual(freeBall.ball?.point, mapNormalized({ x: 60, y: 60 }));
        assert.deepEqual(freeBall.ball?.badge, mapNormalized({ x: 60, y: 60 }));
        assert.equal(freeBall.ball?.attachedTokenId, null);

        const forwardGeometry = offsetFromMid(forward.path);
        const backwardGeometry = offsetFromMid(backward.path);

        assert.ok(
          Math.abs(
            Math.hypot(forwardGeometry.offset.x, forwardGeometry.offset.y) -
              forwardGeometry.length * 0.5,
          ) < 0.02,
        );
        assert.ok(
          Math.abs(
            Math.hypot(backwardGeometry.offset.x, backwardGeometry.offset.y) -
              backwardGeometry.length * 0.5,
          ) < 0.02,
        );
        assert.ok(Math.abs(forwardGeometry.offset.x + backwardGeometry.offset.x) < 0.02);
        assert.ok(Math.abs(forwardGeometry.offset.y + backwardGeometry.offset.y) < 0.02);
      });
    });
  });
});
