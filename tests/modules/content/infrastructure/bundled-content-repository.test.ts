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

        assert.ok(exercises.length >= 26);
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
            'conduccion-entre-conos',
            'pases-por-parejas',
            'juego-3v3-conos-porteria',
            'rondo-4v1-dos-toques',
            'pase-y-va-cambio-orientacion',
            'salida-portero-3v2',
            'conservacion-4v2-carriles',
            'reaccion-tras-perdida-3v2',
            'ataque-3v2-banda',
            'juego-posicion-4v4-comodines',
            'basculacion-bloque-1-2-1',
            'salida-4v3-con-portero',
            'transicion-4v3-tras-robo',
            'presion-alta-4v4',
            'salida-3-2-cambio-ala',
            'defensa-3-1-presion-cierre',
            'transicion-5v4-carril-central',
          ],
        );
        assert.ok(exercises.every((exercise) => exercise.status === 'published'));
      });

      it('then every seeded exercise carries Board Data valid at 1.0.0', () => {
        const exercises = repository.getExercises();

        assert.ok(exercises.length >= 26);
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
          [
            'salida-3-1-presion-alta',
            'juego-posicion-4v4-comodines',
            'basculacion-bloque-1-2-1',
          ],
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

  describe('Given the seeded programming', () => {
    describe('When programming is requested for each category', () => {
      it('then every category returns its planned published record', () => {
        const expectedProgrammingByCategory = {
          prebenjamin: 'prebenjamin-u8-base',
          benjamin: 'benjamin-u10-base',
          alevin: 'alevin-u12-base',
          infantil: 'infantil-u14-base',
          cadete: 'cadete-u16-base',
          juvenil: 'juvenil-u19-base',
          senior: 'senior-base',
        } as const;

        for (const [categoryId, programmingId] of Object.entries(
          expectedProgrammingByCategory,
        )) {
          const programming = getProgramming(
            repository,
            categoryId as keyof typeof expectedProgrammingByCategory,
          );

          assert.equal(programming?.id, programmingId);
          assert.equal(programming?.categoryId, categoryId);
          assert.equal(programming?.status, 'published');
        }
      });

      it('then an unknown category returns null', () => {
        assert.equal(getProgramming(repository, 'sin-categoria' as never), null);
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
