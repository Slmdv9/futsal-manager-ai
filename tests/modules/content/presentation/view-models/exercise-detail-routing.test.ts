import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildExerciseDetailHref } from '@/modules/content/presentation/view-models/exercise-detail-routing';

describe('Exercise detail routing', () => {
  describe('Given an exercise id', () => {
    describe('When buildExerciseDetailHref runs', () => {
      it('then it returns the literal detail pathname and the raw id', () => {
        const href = buildExerciseDetailHref('salida-3-1-presion-alta');

        assert.deepEqual(Object.keys(href).sort(), ['params', 'pathname']);
        assert.equal(href.pathname, '/ejercicios/[exerciseId]');
        assert.deepEqual(href.params, { exerciseId: 'salida-3-1-presion-alta' });
        assert.doesNotMatch(JSON.stringify(href), /\?|&/);
      });
    });

    describe('When the id has URL-reserved characters', () => {
      it('then the helper adds no encoding and the id round-trips', () => {
        const id = 'rondo 4v1/orientación';
        const href = buildExerciseDetailHref(id);

        assert.equal(href.params.exerciseId, id);
        assert.doesNotMatch(href.params.exerciseId, /%/);
        assert.equal(decodeURIComponent(encodeURIComponent(href.params.exerciseId)), id);
      });
    });
  });

  describe('Given the built href', () => {
    describe('When the pathname is inspected', () => {
      it('then it is the exact typed route literal', () => {
        const href = buildExerciseDetailHref('pase-y-va-carril-central');

        assert.equal(href.pathname, '/ejercicios/[exerciseId]');
        assert.doesNotMatch(href.pathname, /\/$|\?|&/);
        assert.equal(href.pathname, '/ejercicios/[exerciseId]');
      });
    });
  });
});
