import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getExercise } from '@/modules/content/application/get-exercise';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';
import {
  buildBoardExerciseTarget,
  buildBoardHref,
} from '@/modules/content/presentation/view-models/board-routing';

const repository = createBundledContentRepository();

describe('Board routing helpers', () => {
  describe('Given a library exercise id', () => {
    describe('When buildBoardHref runs', () => {
      it('then it returns the literal Pizarra pathname and the raw id', () => {
        const href = buildBoardHref('salida-3-1-presion-alta');

        assert.deepEqual(Object.keys(href).sort(), ['params', 'pathname']);
        assert.equal(href.pathname, '/pizarra');
        assert.deepEqual(href.params, { exerciseId: 'salida-3-1-presion-alta' });
        assert.doesNotMatch(JSON.stringify(href), /\?|&/);
      });
    });

    describe('When the id is a plain slug', () => {
      it('then it is not pre-encoded', () => {
        const href = buildBoardHref('pase-y-va-carril-central');

        assert.equal(href.params.exerciseId, 'pase-y-va-carril-central');
        assert.doesNotMatch(href.params.exerciseId, /%/);
      });
    });
  });

  describe('Given an id with URL-reserved characters', () => {
    describe('When the param is encoded and decoded once', () => {
      it('then it round-trips to the original id', () => {
        const id = 'rondo 4v1/orientación';
        const href = buildBoardHref(id);

        assert.equal(href.params.exerciseId, id);
        assert.equal(decodeURIComponent(encodeURIComponent(href.params.exerciseId)), id);
      });
    });
  });

  describe('Given the bundled salida-3-1-presion-alta exercise', () => {
    describe('When buildBoardExerciseTarget runs', () => {
      it('then it copies exactly id, title, summary and boardData', () => {
        const exercise = getExercise(repository, 'salida-3-1-presion-alta');

        assert.ok(exercise);
        const target = buildBoardExerciseTarget(exercise);

        assert.deepEqual(target, {
          id: exercise.id,
          title: exercise.title,
          summary: exercise.summary,
          boardData: exercise.boardData,
        });
        assert.equal(target.title, 'Salida 3-1 ante presión alta');
        assert.equal(
          target.summary,
          'Salida en 3-1 con fijación del cierre y cambio de orientación al ala débil.',
        );
      });

      it('then boardData keeps its reference and the source is not mutated', () => {
        const exercise = getExercise(repository, 'salida-3-1-presion-alta');

        assert.ok(exercise);
        const boardDataBefore = JSON.stringify(exercise.boardData);
        const target = buildBoardExerciseTarget(exercise);

        assert.equal(target.boardData, exercise.boardData);
        assert.notEqual(target as unknown, exercise);
        assert.equal(JSON.stringify(exercise.boardData), boardDataBefore);
      });

      it('then no content-only field is carried into the target', () => {
        const exercise = getExercise(repository, 'salida-3-1-presion-alta');

        assert.ok(exercise);
        const target = buildBoardExerciseTarget(exercise);
        const keys = Object.keys(target).sort();

        assert.deepEqual(keys, ['boardData', 'id', 'summary', 'title']);
        for (const field of [
          'provenance',
          'references',
          'collection',
          'categoryIds',
          'sessionPart',
        ]) {
          assert.equal(field in target, false);
        }
      });
    });
  });
});
