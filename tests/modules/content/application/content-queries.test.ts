import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseBoardData } from '@/shared/domain';
import { getExercise } from '@/modules/content/application/get-exercise';
import { getProgramming } from '@/modules/content/application/get-programming';
import { listCategories } from '@/modules/content/application/list-categories';
import { listExercises } from '@/modules/content/application/list-exercises';
import type { CategoryId } from '@/modules/content/domain/category';
import type { ContentRepository } from '@/modules/content/domain/ports/content-repository';
import type { Exercise, ExerciseStatus } from '@/modules/content/domain/exercise';
import type { Programming, ProgrammingStatus } from '@/modules/content/domain/programming';
import type { ContentProvenance } from '@/modules/content/domain/provenance';

const ownedProvenance: ContentProvenance = {
  kind: 'original',
  sourceName: 'Futsal Manager AI',
  licenseStatus: 'owned',
};

const minimalBoardData = parseBoardData({
  schemaVersion: '1.0.0',
  pitch: { format: 'full' },
  tokens: [{ id: 'cierre', kind: 'player', team: 'home', label: 'CIE' }],
  cones: [],
  phases: [
    {
      id: 'fase-1',
      order: 1,
      title: 'Fase 1',
      explanation: 'El cierre recibe del portero.',
      positions: [{ tokenId: 'cierre', x: 20, y: 50 }],
      ball: { x: 20, y: 50 },
      arrows: [],
      labels: [],
    },
  ],
});

function makeExercise(
  id: string,
  categoryIds: CategoryId[],
  status: ExerciseStatus,
  provenance: Partial<ContentProvenance> = {},
): Exercise {
  return {
    id,
    title: 'Salida 3-1 ante presión alta',
    summary: 'Salida en 3-1 con fijación del cierre.',
    focus: 'Salida de presión',
    categoryIds,
    objective: 'Superar la primera línea de presión.',
    players: { total: 8, goalkeepers: 2 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 15,
    intensity: { level: 'high', percent: 85 },
    workStructure: 'Bloques de 3 minutos x 4 series',
    constraints: [],
    coachingCues: ['Timing de desmarque del ala'],
    boardData: minimalBoardData,
    status,
    provenance: { ...ownedProvenance, ...provenance },
  };
}

function makeProgramming(
  id: string,
  categoryId: CategoryId,
  status: ProgrammingStatus,
  provenance: Partial<ContentProvenance> = {},
): Programming {
  return {
    id,
    categoryId,
    version: '1.0.0',
    formativeStage: 'Etapa de asimilación táctica cognitiva',
    focus: 'Foco metodológico',
    playModel: 'Iniciación dinámica a sistemas base 3-1.',
    sessionDurationMinutes: { min: 60, max: 75 },
    keyConcepts: ['Desmarques de ruptura al espacio ciego'],
    objectives: ['Consolidar la salida 3-1'],
    sessionStructure: [
      {
        part: 'main',
        title: 'Salida 3-1',
        description: 'Tareas de salida de presión durante 35 minutos.',
      },
    ],
    macrocycles: [
      {
        id: 'macrociclo-1',
        label: 'Macrociclo 1',
        focus: 'Asimilación de la salida 3-1',
        microcycles: [
          {
            id: 'microciclo-1',
            label: 'Microciclo 1',
            focus: 'Salida de presión',
            sessionCount: 4,
          },
        ],
      },
    ],
    status,
    provenance: { ...ownedProvenance, ...provenance },
  };
}

function createFakeRepository(
  exercises: Exercise[],
  programming: Programming[] = [],
): ContentRepository {
  return {
    getExercises: () => exercises,
    getExerciseById: (exerciseId) =>
      exercises.find((exercise) => exercise.id === exerciseId),
    getProgrammingByCategory: (categoryId) =>
      programming.filter((record) => record.categoryId === categoryId),
  };
}

describe('Content read use cases', () => {
  describe('Given published, draft, and archived exercises', () => {
    describe('When exercises are listed', () => {
      it('then only published exercises are returned', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', ['infantil'], 'published'),
          makeExercise('borrador-infantil', ['infantil'], 'draft'),
          makeExercise('salida-antigua', ['infantil'], 'archived'),
        ]);

        const exercises = listExercises(repository);

        assert.deepEqual(
          exercises.map((exercise) => exercise.id),
          ['salida-3-1'],
        );
        assert.ok(exercises.every((exercise) => exercise.status === 'published'));
      });
    });
  });

  describe('Given a published exercise tagged to two categories', () => {
    describe('When exercises are listed for each category', () => {
      it('then it appears once under each category and never twice in one result', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', ['infantil', 'cadete'], 'published'),
          makeExercise('circulacion-ala', ['infantil'], 'published'),
          makeExercise('presion-tras-perdida', ['infantil'], 'published'),
        ]);

        const infantil = listExercises(repository, { categoryId: 'infantil' });
        const cadete = listExercises(repository, { categoryId: 'cadete' });

        assert.deepEqual(infantil.map((exercise) => exercise.id), [
          'salida-3-1',
          'circulacion-ala',
          'presion-tras-perdida',
        ]);
        assert.deepEqual(
          cadete.map((exercise) => exercise.id),
          ['salida-3-1'],
        );
        assert.equal(
          infantil.filter((exercise) => exercise.id === 'salida-3-1').length,
          1,
        );
      });
    });
  });

  describe('Given a repository that returns the same exercise twice', () => {
    describe('When exercises are listed', () => {
      it('then the read layer deduplicates by exercise id', () => {
        const exercise = makeExercise('salida-3-1', ['infantil'], 'published');
        const repository = createFakeRepository([exercise, exercise]);

        const exercises = listExercises(repository, { categoryId: 'infantil' });

        assert.equal(exercises.length, 1);
      });
    });
  });

  describe('Given a category without exercises', () => {
    describe('When exercises are listed for that category', () => {
      it('then the filter returns an empty list instead of inventing exercises', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', ['infantil'], 'published'),
        ]);

        assert.deepEqual(listExercises(repository, { categoryId: 'senior' }), []);
      });
    });
  });

  describe('Given an exercise looked up by id', () => {
    describe('When the exercise is published, archived, or unknown', () => {
      it('then only the published exercise is returned', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', ['infantil'], 'published'),
          makeExercise('salida-antigua', ['infantil'], 'archived'),
        ]);

        assert.equal(getExercise(repository, 'salida-3-1')?.id, 'salida-3-1');
        assert.equal(getExercise(repository, 'salida-antigua'), null);
        assert.equal(getExercise(repository, 'no-existe'), null);
      });
    });
  });

  describe('Given programming records for a category', () => {
    describe('When programming is requested', () => {
      it('then the published record is returned', () => {
        const repository = createFakeRepository(
          [],
          [makeProgramming('infantil-u14-base', 'infantil', 'published')],
        );

        assert.equal(getProgramming(repository, 'infantil')?.id, 'infantil-u14-base');
      });

      it('then a draft-only category returns null', () => {
        const repository = createFakeRepository(
          [],
          [makeProgramming('cadete-u16-base', 'cadete', 'draft')],
        );

        assert.equal(getProgramming(repository, 'cadete'), null);
      });

      it('then a category without a record returns null', () => {
        const repository = createFakeRepository(
          [],
          [makeProgramming('infantil-u14-base', 'infantil', 'published')],
        );

        assert.equal(getProgramming(repository, 'senior'), null);
      });

      it('then a draft record never overrides the published one', () => {
        const repository = createFakeRepository(
          [],
          [
            makeProgramming('infantil-u14-draft', 'infantil', 'draft'),
            makeProgramming('infantil-u14-base', 'infantil', 'published'),
          ],
        );

        assert.equal(getProgramming(repository, 'infantil')?.id, 'infantil-u14-base');
      });
    });
  });

  describe('Given a repository that returns published exercises without a publishable license', () => {
    describe('When exercises are listed', () => {
      it('then unlicensed, pending, and reference-only records are skipped', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', ['infantil'], 'published'),
          makeExercise('sin-licencia', ['infantil'], 'published', {
            licenseStatus: 'unlicensed',
          }),
          makeExercise('pendiente', ['infantil'], 'published', { licenseStatus: 'pending' }),
          makeExercise('inspiracion', ['infantil'], 'published', {
            kind: 'reference',
            licenseStatus: 'reference-only',
          }),
        ]);

        const exercises = listExercises(repository);

        assert.deepEqual(
          exercises.map((exercise) => exercise.id),
          ['salida-3-1'],
        );
      });

      it('then an unlicensed record never displaces a licensed one for the same id', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', ['infantil'], 'published', { licenseStatus: 'pending' }),
          makeExercise('salida-3-1', ['infantil'], 'published'),
        ]);

        const exercises = listExercises(repository);

        assert.deepEqual(
          exercises.map((exercise) => exercise.id),
          ['salida-3-1'],
        );
        assert.equal(exercises[0].provenance.licenseStatus, 'owned');
      });

      it('then permitted cmd-mora-style content stays readable when attributed', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', ['infantil'], 'published', {
            kind: 'cmd-mora',
            sourceName: 'CMD Mora',
            licenseStatus: 'permitted',
            attribution: 'CMD Mora',
          }),
        ]);

        assert.deepEqual(
          listExercises(repository).map((exercise) => exercise.id),
          ['salida-3-1'],
        );
      });
    });
  });

  describe('Given an unlicensed exercise looked up by id', () => {
    describe('When the exercise is requested', () => {
      it('then the lookup returns null without throwing', () => {
        const repository = createFakeRepository([
          makeExercise('sin-licencia', ['infantil'], 'published', {
            licenseStatus: 'unlicensed',
          }),
        ]);

        assert.equal(getExercise(repository, 'sin-licencia'), null);
      });
    });
  });

  describe('Given a repository that returns published programming without a publishable license', () => {
    describe('When programming is requested', () => {
      it('then a pending record returns null', () => {
        const repository = createFakeRepository(
          [],
          [
            makeProgramming('infantil-u14-base', 'infantil', 'published', {
              licenseStatus: 'pending',
            }),
          ],
        );

        assert.equal(getProgramming(repository, 'infantil'), null);
      });

      it('then a reference-only record returns null', () => {
        const repository = createFakeRepository(
          [],
          [
            makeProgramming('infantil-u14-base', 'infantil', 'published', {
              kind: 'reference',
              licenseStatus: 'reference-only',
            }),
          ],
        );

        assert.equal(getProgramming(repository, 'infantil'), null);
      });

      it('then an unpublishable record never shadows the licensed one', () => {
        const repository = createFakeRepository(
          [],
          [
            makeProgramming('infantil-u14-sin-licencia', 'infantil', 'published', {
              licenseStatus: 'unlicensed',
            }),
            makeProgramming('infantil-u14-base', 'infantil', 'published'),
          ],
        );

        assert.equal(getProgramming(repository, 'infantil')?.id, 'infantil-u14-base');
      });

      it('then permitted programming with attribution is still returned', () => {
        const repository = createFakeRepository(
          [],
          [
            makeProgramming('infantil-u14-base', 'infantil', 'published', {
              kind: 'cmd-mora',
              sourceName: 'CMD Mora',
              licenseStatus: 'permitted',
              attribution: 'CMD Mora',
            }),
          ],
        );

        assert.equal(getProgramming(repository, 'infantil')?.id, 'infantil-u14-base');
      });
    });
  });

  describe('Given the RFEF category reference data', () => {
    describe('When categories are listed', () => {
      it('then the use case exposes the seven canonical categories', () => {
        const categories = listCategories();

        assert.equal(categories.length, 7);
        assert.equal(categories[0].id, 'prebenjamin');
        assert.equal(categories[6].id, 'senior');
      });
    });
  });
});
