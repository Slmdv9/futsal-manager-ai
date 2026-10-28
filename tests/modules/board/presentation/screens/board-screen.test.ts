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

describe('Board screen target contract', () => {
  describe('Given the board exercise target type', () => {
    describe('When its shape is inspected', () => {
      it('then it is a type-only contract with id, title, summary and Board Data', () => {
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
      it('then BoardScreen accepts an optional nullable exercise target', () => {
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
    describe('When the screen renders', () => {
      it('then it shows the SELECCIONADO chip, title, summary and the next-phase note inside the Pizarra header', () => {
        assert.match(boardScreenSource, /<SectionPlaceholder\s+eyebrow="Pizarra"\s+title="Pizarra"/);
        assert.match(boardScreenSource, /Ejercicios animados sobre el tablero táctico 2:1\./);
        assert.match(boardScreenSource, /<Chip label="SELECCIONADO" variant="press-trigger" \/>/);

        const order = [
          '<Chip label="SELECCIONADO"',
          '{exercise.title}',
          '{exercise.summary}',
          'El tablero animado 2:1 llegará en la próxima fase.',
        ].map((value) => expectationIndex(boardScreenSource, value));

        assert.deepEqual(
          [...order].sort((left, right) => left - right),
          order,
        );
      });
    });
  });

  describe('Given no target', () => {
    describe('When the screen renders the fallback', () => {
      it('then the accepted fallback card and header copy remain', () => {
        assert.match(boardScreenSource, /<Chip label="SIGUIENTE FASE" variant="neutral" \/>/);
        assert.match(boardScreenSource, /El tablero aún no está conectado/);
        assert.match(
          boardScreenSource,
          /La reproducción por fases y las fichas de jugadores se añadirán cuando exista Board Data\s+validado\./,
        );
        assert.match(boardScreenSource, /Ejercicios animados sobre el tablero táctico 2:1\./);
        assert.equal(
          (boardScreenSource.match(/\{exercise \? \(/g) ?? []).length,
          1,
        );
      });
    });
  });

  describe('Given the board module sources', () => {
    describe('When they are scanned for rendering and content coupling', () => {
      it('then no pitch, phase, arrow or SVG is drawn and content is not imported', () => {
        assert.doesNotMatch(
          boardScreenSource,
          /react-native-svg|\bSvg\b|\bCircle\b|\bArrow\b|pitch|\bphases\b|boardData\.phases/,
        );
        assert.doesNotMatch(boardScreenSource, /@\/modules\/content/);
        assert.doesNotMatch(boardExerciseTargetSource, /@\/modules\/content/);
      });

      it('then the public API exposes BoardScreen and the BoardExerciseTarget type', () => {
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
  });
});
