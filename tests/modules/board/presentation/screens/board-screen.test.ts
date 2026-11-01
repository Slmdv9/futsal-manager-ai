import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const boardPresentationRoot = new URL(
  '../../../../../src/modules/board/presentation/',
  import.meta.url,
);
const boardIndexSource = readFileSync(
  new URL('../../../../../src/modules/board/index.ts', import.meta.url),
  'utf8',
);
const boardExerciseTargetSource = readFileSync(
  new URL('board-exercise-target.ts', boardPresentationRoot),
  'utf8',
);
const boardScreenSource = readFileSync(
  new URL('screens/board-screen.tsx', boardPresentationRoot),
  'utf8',
);

function expectationIndex(source: string, value: string): number {
  const index = source.indexOf(value);

  assert.notEqual(index, -1, `Expected the source to contain ${value}.`);

  return index;
}

describe('Board screen', () => {
  describe('Given the board exercise target type', () => {
    describe('When its shape is inspected', () => {
      it('then it is still a type-only contract with id, title, summary and Board Data', () => {
        assert.match(
          boardExerciseTargetSource,
          /import type \{ BoardData \} from '@\/shared\/domain';/,
        );
        assert.match(
          boardExerciseTargetSource,
          /export type BoardExerciseTarget = \{\s*id: string;\s*title: string;\s*summary: string;\s*boardData: BoardData;\s*\};/,
        );
        assert.equal(
          (boardExerciseTargetSource.match(/^ {2}\w+:/gm) ?? []).length,
          4,
        );
        assert.doesNotMatch(boardExerciseTargetSource, /\bfunction\b|\bconst\b/);
      });
    });

    describe('When the screen props are inspected', () => {
      it('then BoardScreen still accepts an optional nullable exercise target', () => {
        assert.match(
          boardScreenSource,
          /type BoardScreenProps = \{\s*exercise\?: BoardExerciseTarget \| null;\s*\};/,
        );
        assert.match(
          boardScreenSource,
          /export function BoardScreen\(\{ exercise \}: BoardScreenProps\)/,
        );
      });
    });
  });

  describe('Given a selected exercise target', () => {
    describe('When the selected card renders', () => {
      it('then it keeps chip, title and summary and drops the old next-phase note', () => {
        assert.match(boardScreenSource, /<Chip label="SELECCIONADO" variant="press-trigger" \/>/);

        const order = ['<Chip label="SELECCIONADO"', '{exercise.title}', '{exercise.summary}'].map(
          (value) => expectationIndex(boardScreenSource, value),
        );

        assert.deepEqual(
          [...order].sort((left, right) => left - right),
          order,
        );

        assert.doesNotMatch(
          boardScreenSource,
          /El tablero animado 2:1 llegará en la próxima fase\./,
        );
        assert.doesNotMatch(boardScreenSource, /El tablero aún no está conectado/);
        assert.doesNotMatch(
          boardScreenSource,
          /La reproducción por fases y las fichas de jugadores se añadirán/,
        );
        assert.doesNotMatch(boardScreenSource, /SIGUIENTE FASE/);
      });
    });

    describe('When the board card is inspected', () => {
      it('then one TacticsBoard renders the target Board Data inside a compact card below the selected card', () => {
        assert.equal(
          (boardScreenSource.match(/<TacticsBoard boardData=\{exercise\.boardData\} \/>/g) ?? [])
            .length,
          1,
        );
        assert.equal((boardScreenSource.match(/<Card padding="sm">/g) ?? []).length, 1);

        const order = [
          '<Chip label="SELECCIONADO"',
          '{exercise.summary}',
          '<Card padding="sm">',
          '<TacticsBoard boardData={exercise.boardData} />',
        ].map((value) => expectationIndex(boardScreenSource, value));

        assert.deepEqual(
          [...order].sort((left, right) => left - right),
          order,
        );
      });
    });

    describe('When the phase block is read', () => {
      it('then it labels the phase, explains it and notes that playback arrives next', () => {
        assert.match(
          boardScreenSource,
          /const model = buildBoardRenderModel\(exercise\.boardData\);/,
        );
        assert.match(
          boardScreenSource,
          /<Chip label=\{model\.phaseLabel\} variant="defending" \/>/,
        );
        assert.match(boardScreenSource, /\{model\.phaseTitle\}/);
        assert.match(boardScreenSource, /\{model\.phaseExplanation\}/);

        const order = [
          '<TacticsBoard boardData={exercise.boardData} />',
          '<Chip label={model.phaseLabel} variant="defending" />',
          '{model.phaseTitle}',
          '{model.phaseExplanation}',
          'La reproducción por fases llegará en la próxima fase.',
        ].map((value) => expectationIndex(boardScreenSource, value));

        assert.deepEqual(
          [...order].sort((left, right) => left - right),
          order,
        );
      });
    });
  });

  describe('Given no target', () => {
    describe('When the empty state renders', () => {
      it('then it guides the coach to Explorar and draws no board', () => {
        const fallbackBranch = boardScreenSource.slice(boardScreenSource.indexOf(') : ('));

        assert.match(boardScreenSource, /<Chip label="SIN EJERCICIO" variant="neutral" \/>/);
        assert.match(boardScreenSource, /Todavía no hay un ejercicio seleccionado/);
        assert.match(
          boardScreenSource,
          /Abre un ejercicio desde Explorar y pulsa Abrir en Pizarra para verlo aquí\./,
        );
        assert.doesNotMatch(fallbackBranch, /<TacticsBoard/);
        assert.equal((boardScreenSource.match(/\{exercise \? \(/g) ?? []).length, 1);
      });
    });
  });

  describe('Given the board screen source', () => {
    describe('When it is scanned for coupling and playback controls', () => {
      it('then it keeps the Pizarra header and stays free of content, players and interaction', () => {
        assert.match(boardScreenSource, /<SectionPlaceholder\s+eyebrow="Pizarra"\s+title="Pizarra"/);
        assert.match(boardScreenSource, /Ejercicios animados sobre el tablero táctico 2:1\./);
        assert.doesNotMatch(boardScreenSource, /@\/modules\/content/);
        assert.doesNotMatch(boardScreenSource, /\bplayers\b|\bgoalkeepers\b/);
        assert.doesNotMatch(
          boardScreenSource,
          /onPress|Pressable|useState|useEffect|Animar|Animated|Reanimated|setTimeout|setInterval/,
        );
        assert.doesNotMatch(boardScreenSource, /react-native-svg/);
      });
    });
  });

  describe('Given the board public API', () => {
    describe('When the existing exports are read', () => {
      it('then BoardScreen and the BoardExerciseTarget type keep their exact lines', () => {
        assert.match(
          boardIndexSource,
          /export \{ BoardScreen \} from '\.\/presentation\/screens\/board-screen';/,
        );
        assert.match(
          boardIndexSource,
          /export type \{ BoardExerciseTarget \} from '\.\/presentation\/board-exercise-target';/,
        );
      });
    });

    describe('When the renderer exports are read', () => {
      it('then TacticsBoard, the builder, the viewBox and the render types are public', () => {
        assert.match(
          boardIndexSource,
          /export \{ TacticsBoard \} from '\.\/presentation\/components\/tactics-board';/,
        );
        assert.match(
          boardIndexSource,
          /export type \{ TacticsBoardProps \} from '\.\/presentation\/components\/tactics-board';/,
        );
        assert.match(
          boardIndexSource,
          /export \{\s*BOARD_VIEW_BOX,\s*buildBoardRenderModel,\s*\} from '\.\/presentation\/view-models\/board-render-model';/,
        );

        [
          'BoardRenderArrow',
          'BoardRenderBall',
          'BoardRenderCone',
          'BoardRenderLabel',
          'BoardRenderModel',
          'BoardRenderPoint',
          'BoardRenderToken',
        ].forEach((typeName) => {
          assert.match(boardIndexSource, new RegExp(`\\b${typeName}\\b`));
        });
      });
    });
  });
});
