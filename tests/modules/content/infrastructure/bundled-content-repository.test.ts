import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BOARD_DATA_SCHEMA_VERSION, parseBoardData } from '@/shared/domain';
import { getExercise } from '@/modules/content/application/get-exercise';
import { getProgramming } from '@/modules/content/application/get-programming';
import { listExercises } from '@/modules/content/application/list-exercises';
import { listLibraryExercises } from '@/modules/content/application/list-library-exercises';
import { listWeeklyHighlights } from '@/modules/content/application/list-weekly-highlights';
import { CONTENT_PACKAGE_VERSION } from '@/modules/content/domain/content-package';
import { CATEGORY_IDS } from '@/modules/content/domain/category';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';

const repository = createBundledContentRepository();

describe('Bundled content repository', () => {
  describe('Given the bundled content package', () => {
    describe('When the repository is created', () => {
      it('then the package version is the supported one', () => {
        assert.equal(CONTENT_PACKAGE_VERSION, '1.2.0');
      });

      it('then it exposes the seeded published exercises', () => {
        const exercises = listExercises(repository);

        assert.ok(exercises.length >= 50);
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
            'juego-4v4-dos-porterias',
            'conduccion-y-pase-en-cuadrado',
            'rondo-libre-3v1',
            'vuelta-a-la-calma-con-balon',
            'juego-posicion-3v3-apoyos',
            'salida-3v1-desde-portero',
            'rondo-4v0-control-orientado',
            'circulacion-suave-y-movilidad',
            'rondo-5v1-activacion',
            'pase-y-control-en-movimiento',
            'conservacion-suave-4v0',
            'rondo-final-4v1',
            'rondo-4v2-activacion',
            'movilidad-y-pases-largos',
            'conservacion-5v2-baja-intensidad',
            'estiramientos-guiados-con-balon',
            'rondo-4v2-con-salida',
            'activacion-con-duelos-1v1',
            'conservacion-6v3-baja-intensidad',
            'rondo-final-y-movilidad',
            'rondo-5v2-activacion',
            'activacion-con-movilidad-y-pases',
            'conservacion-6v2-baja-intensidad',
            'vuelta-a-la-calma-y-analisis',
            'activacion-pases-y-nombres',
            'juego-cuatro-esquinas',
            'rondo-tranquilo-en-circulo',
            'pase-y-movimiento-en-triangulo',
            'juego-4v4-con-portero-apoyo',
            'circulacion-tranquila-en-parejas',
            'activacion-3v1-con-pared',
            'salida-de-presion-3v2-con-pivote',
            'conservacion-suave-en-dos-zonas',
            'activacion-con-pases-entre-lineas',
            'ataque-3-1-con-cambio-de-orientacion',
            'rondo-de-cierre-con-movilidad',
            'activacion-con-triangulos-y-desmarques',
            'presion-tras-saque-de-banda',
            'circulacion-suave-con-cambios-de-lado',
            'activacion-con-salida-de-presion-4v2',
            'ataque-4-0-con-rotacion-de-alas',
            'conservacion-lenta-con-apoyos',
            'activacion-con-rondo-y-cambio-de-ritmo',
            'salida-4-0-ante-defensa-en-rombo',
            'vuelta-a-la-calma-con-respiracion-guiada',
          ],
        );
        assert.equal(exercises.length, 71);
        assert.ok(exercises.every((exercise) => exercise.status === 'published'));
      });

      it('then every RFEF category exposes its planned library and weekly counts', () => {
        const expectedLibraryCounts = {
          prebenjamin: 7,
          benjamin: 7,
          alevin: 7,
          infantil: 9,
          cadete: 7,
          juvenil: 7,
          senior: 7,
        } as const;

        for (const categoryId of CATEGORY_IDS) {
          const libraryExercises = listLibraryExercises(repository, categoryId);
          const weeklyExercises = listWeeklyHighlights(repository, categoryId);

          assert.equal(
            libraryExercises.length,
            expectedLibraryCounts[categoryId],
            `Expected ${categoryId} to expose its planned library count.`,
          );
          assert.equal(
            weeklyExercises.length,
            3,
            `Expected ${categoryId} to expose its three weekly highlights.`,
          );
          assert.ok(
            libraryExercises.every((exercise) => exercise.collection === 'library'),
            `Expected ${categoryId} library records to stay in the library collection.`,
          );
          assert.ok(
            weeklyExercises.every((exercise) => exercise.collection === 'weekly'),
            `Expected ${categoryId} weekly records to stay in the weekly collection.`,
          );
        }
      });

      it('then the package splits into fifty library exercises and twenty-one weekly highlights', () => {
        const libraryExercises = listLibraryExercises(repository);
        const weeklyExercises = listWeeklyHighlights(repository);

        assert.equal(libraryExercises.length, 50);
        assert.equal(weeklyExercises.length, 21);
        assert.equal(libraryExercises.length + weeklyExercises.length, 71);
        assert.equal(
          libraryExercises.some((libraryExercise) =>
            weeklyExercises.some((weeklyExercise) => weeklyExercise.id === libraryExercise.id),
          ),
          false,
        );
      });

      it('then every seeded exercise carries Board Data valid at 1.0.0', () => {
        const exercises = repository.getExercises();

        assert.ok(exercises.length >= 50);
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
        const infantil = listLibraryExercises(repository, 'infantil');
        const cadete = listLibraryExercises(repository, 'cadete');

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
            'rondo-4v2-activacion',
            'movilidad-y-pases-largos',
            'conservacion-5v2-baja-intensidad',
            'estiramientos-guiados-con-balon',
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
