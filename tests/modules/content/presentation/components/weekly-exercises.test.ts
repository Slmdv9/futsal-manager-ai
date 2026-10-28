import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const presentationRoot = new URL(
  '../../../../../src/modules/content/presentation/',
  import.meta.url,
);

const weeklyExercisesSource = readFileSync(
  new URL('components/weekly-exercises.tsx', presentationRoot),
  'utf8',
);

describe('Weekly exercises cards', () => {
  describe('Given a weekly highlight card', () => {
    describe('When the detail entry is inspected', () => {
      it('then one ExerciseDetailLink wraps title, summary and meta', () => {
        assert.equal(
          (weeklyExercisesSource.match(/<ExerciseDetailLink/g) ?? []).length,
          1,
        );
        assert.match(
          weeklyExercisesSource,
          /<ExerciseDetailLink\s+exerciseId=\{exercise\.id\}\s+title=\{exercise\.title\}\s*>/,
        );
        assert.match(weeklyExercisesSource, /\{exercise\.title\}/);
        assert.match(weeklyExercisesSource, /\{exercise\.summary\}/);
        assert.match(weeklyExercisesSource, /formatExerciseMeta\(exercise\)/);
      });
    });

    describe('When the card is scanned for a board action', () => {
      it('then the session-part chip stays outside the pressable', () => {
        assert.equal(
          weeklyExercisesSource.indexOf('<Chip') <
            weeklyExercisesSource.indexOf('<ExerciseDetailLink'),
          true,
        );
      });

      it('then the weekly card remains board-free', () => {
        assert.doesNotMatch(weeklyExercisesSource, /Abrir en Pizarra/);
        assert.doesNotMatch(weeklyExercisesSource, /buildBoardHref/);
        assert.doesNotMatch(weeklyExercisesSource, /\bLink\b/);
        assert.doesNotMatch(weeklyExercisesSource, /@\/modules\/board/);
      });
    });
  });

  describe('Given the weekly highlights block', () => {
    describe('When the pinned copy is inspected', () => {
      it('then headings, counter, empty state and line limits are unchanged', () => {
        assert.match(weeklyExercisesSource, /Ejercicios de la Semana/);
        assert.match(weeklyExercisesSource, /Una selección fuera de la biblioteca/);
        assert.match(weeklyExercisesSource, /formatWeeklySelection\(exercises\.length\)/);
        assert.match(
          weeklyExercisesSource,
          /Todavía no hay ejercicios para esta categoría\./,
        );
        assert.equal(
          (weeklyExercisesSource.match(/numberOfLines=\{2\}/g) ?? []).length,
          2,
        );
      });
    });
  });
});
