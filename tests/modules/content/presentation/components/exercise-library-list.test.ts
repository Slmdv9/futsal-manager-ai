import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const presentationRoot = new URL(
  '../../../../../src/modules/content/presentation/',
  import.meta.url,
);

function readPresentationFile(relativePath: string): string {
  return readFileSync(new URL(relativePath, presentationRoot), 'utf8');
}

const exerciseLibraryListSource = readPresentationFile(
  'components/exercise-library-list.tsx',
);
const weeklyExercisesSource = readPresentationFile('components/weekly-exercises.tsx');

function expectationIndex(source: string, value: string): number {
  const index = source.indexOf(value);

  assert.notEqual(index, -1, `Expected the source to contain ${value}.`);

  return index;
}

describe('Exercise library board action', () => {
  describe('Given a library exercise card', () => {
    describe('When the card action is inspected', () => {
      it('then each card wraps a secondary full-width Abrir en Pizarra button in a Link', () => {
        assert.equal(
          (exerciseLibraryListSource.match(/<Link href=\{buildBoardHref\(exercise\.id\)\} asChild>/g) ?? [])
            .length,
          1,
        );
        assert.equal(
          (exerciseLibraryListSource.match(/label="Abrir en Pizarra"/g) ?? []).length,
          1,
        );
        assert.match(
          exerciseLibraryListSource,
          /<Link href=\{buildBoardHref\(exercise\.id\)\} asChild>\s*<AppButton\s+label="Abrir en Pizarra"\s+variant="secondary"\s+fullWidth\s+style=\{styles\.boardAction\}/,
        );
        assert.match(exerciseLibraryListSource, /\/>\s*<\/Link>/);
      });

      it('then it carries the exercise-specific accessibility copy and the 48 dp target', () => {
        assert.match(
          exerciseLibraryListSource,
          /accessibilityLabel=\{`Abrir \$\{exercise\.title\} en la Pizarra`\}/,
        );
        assert.match(
          exerciseLibraryListSource,
          /accessibilityHint="Abre la pestaña Pizarra con este ejercicio seleccionado"/,
        );
        assert.match(exerciseLibraryListSource, /minHeight: spacing\.xl \+ spacing\.md/);
      });
    });

    describe('When the card order and list copy are inspected', () => {
      it('then the action follows title, summary and meta with the accepted headings and counts', () => {
        const order = [
          '{exercise.title}',
          '{exercise.summary}',
          'formatExerciseMeta(exercise)',
          'Abrir en Pizarra',
        ].map((value) => expectationIndex(exerciseLibraryListSource, value));

        assert.deepEqual(
          [...order].sort((left, right) => left - right),
          order,
        );
        assert.match(exerciseLibraryListSource, /group\.label\.toUpperCase\(\)/);
        assert.match(exerciseLibraryListSource, /formatExerciseCount\(total\)/);
        assert.match(exerciseLibraryListSource, /formatExerciseCount\(group\.exercises\.length\)/);
        assert.match(
          exerciseLibraryListSource,
          /Todavía no hay ejercicios para esta categoría\./,
        );
        assert.match(exerciseLibraryListSource, /Sin ejercicios en este tramo\./);
      });
    });
  });

  describe('Given the weekly highlights block', () => {
    describe('When it is scanned for the library action', () => {
      it('then no weekly card exposes Abrir en Pizarra, a board href or a Link', () => {
        assert.doesNotMatch(weeklyExercisesSource, /Abrir en Pizarra/);
        assert.doesNotMatch(weeklyExercisesSource, /buildBoardHref/);
        assert.doesNotMatch(weeklyExercisesSource, /\bLink\b/);
      });
    });
  });
});
