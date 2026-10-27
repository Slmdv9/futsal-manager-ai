import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BOARD_DATA_SCHEMA_VERSION, parseBoardData } from '@/shared/domain';
import { getExercise } from '@/modules/content/application/get-exercise';
import { getProgramming } from '@/modules/content/application/get-programming';
import { listExercises } from '@/modules/content/application/list-exercises';
import { CONTENT_PACKAGE_VERSION } from '@/modules/content/domain/content-package';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';

const repository = createBundledContentRepository();

describe('Bundled content repository', () => {
  describe('Given the bundled content package', () => {
    describe('When the repository is created', () => {
      it('then the package version is the supported one', () => {
        assert.equal(CONTENT_PACKAGE_VERSION, '1.0.0');
      });

      it('then it exposes the seeded published exercises', () => {
        const exercises = listExercises(repository);

        assert.ok(exercises.length >= 9);
        assert.deepEqual(
          exercises.map((exercise) => exercise.id),
          [
            'salida-3-1-presion-alta',
            'circulacion-cierre-ala',
            'presion-tras-perdida',
            'rondo-4v1-orientacion',
            'pase-y-va-carril-central',
            'juego-posicion-3-1-pivote',
            'ataque-4-0-rotaciones',
            'basculacion-rombo-defensivo',
            'transicion-3v2-tras-robo',
          ],
        );
        assert.ok(exercises.every((exercise) => exercise.status === 'published'));
      });

      it('then every seeded exercise carries Board Data valid at 1.0.0', () => {
        const exercises = repository.getExercises();

        assert.ok(exercises.length >= 9);
        for (const exercise of exercises) {
          assert.equal(exercise.boardData.schemaVersion, BOARD_DATA_SCHEMA_VERSION);

          const reparsed = parseBoardData(exercise.boardData);

          assert.ok(reparsed.phases.length >= 1);
        }
      });
    });
  });

  describe('Given a seeded exercise tagged Infantil and Cadete', () => {
    describe('When exercises are listed for each category', () => {
      it('then it appears exactly once under each category', () => {
        const infantil = listExercises(repository, { categoryId: 'infantil' });
        const cadete = listExercises(repository, { categoryId: 'cadete' });

        assert.equal(
          infantil.filter((exercise) => exercise.id === 'salida-3-1-presion-alta').length,
          1,
        );
        assert.equal(
          cadete.filter((exercise) => exercise.id === 'salida-3-1-presion-alta').length,
          1,
        );
        assert.deepEqual(
          cadete.map((exercise) => exercise.id),
          ['salida-3-1-presion-alta'],
        );
        assert.equal(new Set(infantil.map((exercise) => exercise.id)).size, infantil.length);
      });

      it('then an unfiltered listing keeps it once', () => {
        const exercises = listExercises(repository);
        const matches = exercises.filter(
          (exercise) => exercise.id === 'salida-3-1-presion-alta',
        );

        assert.equal(matches.length, 1);
        assert.deepEqual(matches[0].categoryIds, ['infantil', 'cadete']);
      });
    });
  });

  describe('Given the seeded Infantil programming', () => {
    describe('When programming is requested', () => {
      it('then the published record is returned', () => {
        const programming = getProgramming(repository, 'infantil');

        assert.equal(programming?.id, 'infantil-u14-base');
        assert.equal(programming?.categoryId, 'infantil');
        assert.equal(programming?.status, 'published');
      });

      it('then a category without a record returns null', () => {
        assert.equal(getProgramming(repository, 'cadete'), null);
        assert.equal(getProgramming(repository, 'senior'), null);
      });
    });
  });

  describe('Given a seeded exercise looked up by id', () => {
    describe('When the exercise is published', () => {
      it('then it is returned and an unknown id returns null', () => {
        assert.equal(getExercise(repository, 'presion-tras-perdida')?.id, 'presion-tras-perdida');
        assert.equal(getExercise(repository, 'no-existe'), null);
      });
    });
  });
});
