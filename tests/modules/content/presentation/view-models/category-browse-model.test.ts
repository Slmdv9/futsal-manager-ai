import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseBoardData } from '@/shared/domain';
import type { CategoryId } from '@/modules/content/domain/category';
import { getCategoryById } from '@/modules/content/domain/category';
import type { Exercise, ExerciseStatus } from '@/modules/content/domain/exercise';
import type { Programming, ProgrammingStatus } from '@/modules/content/domain/programming';
import type { ContentProvenance } from '@/modules/content/domain/provenance';
import type { ContentRepository } from '@/modules/content/domain/ports/content-repository';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';
import {
  buildCategoryBrowseModel,
  formatCategoryLabel,
  formatExerciseCount,
  formatExerciseMeta,
  formatSessionDuration,
} from '@/modules/content/presentation/view-models/category-browse-model';

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
  title: string,
  categoryIds: CategoryId[],
  status: ExerciseStatus,
  provenance: Partial<ContentProvenance> = {},
): Exercise {
  return {
    id,
    title,
    summary: 'Ejercicio de prueba.',
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

const bundledRepository = createBundledContentRepository();
const infantil = getCategoryById('infantil');

if (!infantil) {
  throw new Error('The Infantil category reference data is missing.');
}

describe('Category browse view model', () => {
  describe('Given the bundled Infantil U14 category', () => {
    describe('When the browse model is built', () => {
      it('then it returns the Infantil programming record and nine exercises in package order', () => {
        const model = buildCategoryBrowseModel(bundledRepository, infantil);

        assert.equal(model.category.id, 'infantil');
        assert.equal(model.programming?.id, 'infantil-u14-base');
        assert.equal(model.programming?.focus, 'Foco Metodológico Infantil');
        assert.equal(
          model.programming?.formativeStage,
          'Etapa de asimilación táctica cognitiva',
        );
        assert.deepEqual(
          model.exercises.map((exercise) => exercise.id),
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
      });
    });
  });

  describe('Given the bundled Senior category', () => {
    describe('When the browse model is built', () => {
      it('then it swaps to the Senior programming record and Senior-only exercises', () => {
        const senior = getCategoryById('senior');

        assert.ok(senior);

        const model = buildCategoryBrowseModel(bundledRepository, senior);

        assert.equal(model.programming?.id, 'senior-base');
        assert.equal(model.programming?.focus, 'Foco Metodológico Senior');
        assert.deepEqual(
          model.exercises.map((exercise) => exercise.id),
          [
            'salida-3-2-cambio-ala',
            'defensa-3-1-presion-cierre',
            'transicion-5v4-carril-central',
          ],
        );
        assert.ok(
          model.exercises.every((exercise) => !exercise.categoryIds.includes('infantil')),
        );
      });
    });
  });

  describe('Given an exercise tagged Infantil and Cadete', () => {
    describe('When the Cadete and Infantil browse models are built', () => {
      it('then the exercise appears once in each list and first where package order says so', () => {
        const cadete = getCategoryById('cadete');

        assert.ok(cadete);

        const cadeteModel = buildCategoryBrowseModel(bundledRepository, cadete);
        const infantilModel = buildCategoryBrowseModel(bundledRepository, infantil);

        assert.equal(cadeteModel.exercises[0].id, 'salida-3-1-presion-alta');
        assert.equal(
          infantilModel.exercises.filter(
            (exercise) => exercise.id === 'salida-3-1-presion-alta',
          ).length,
          1,
        );
        assert.equal(
          cadeteModel.exercises.filter(
            (exercise) => exercise.id === 'salida-3-1-presion-alta',
          ).length,
          1,
        );
      });
    });
  });

  describe('Given a repository whose category has no Programming record', () => {
    describe('When the browse model is built', () => {
      it('then programming is null while the exercises are still listed', () => {
        const repository = createFakeRepository([
          makeExercise('salida-3-1', 'Salida 3-1 ante presión alta', ['infantil'], 'published'),
        ]);

        const model = buildCategoryBrowseModel(repository, infantil);

        assert.equal(model.programming, null);
        assert.deepEqual(
          model.exercises.map((exercise) => exercise.id),
          ['salida-3-1'],
        );
      });
    });
  });

  describe('Given a repository that returns draft, archived, and unlicensed records', () => {
    describe('When the browse model is built', () => {
      it('then the read-layer visibility rules keep them out of the model', () => {
        const repository = createFakeRepository([
          makeExercise('publicado', 'Publicado', ['infantil'], 'published'),
          makeExercise('borrador', 'Borrador', ['infantil'], 'draft'),
          makeExercise('archivado', 'Archivado', ['infantil'], 'archived'),
          makeExercise('sin-licencia', 'Sin licencia', ['infantil'], 'published', {
            licenseStatus: 'unlicensed',
          }),
        ]);

        const model = buildCategoryBrowseModel(repository, infantil);

        assert.deepEqual(
          model.exercises.map((exercise) => exercise.id),
          ['publicado'],
        );
      });
    });
  });

  describe('Given the browse view model formatters', () => {
    describe('When category labels, exercise metadata, session durations, and counts are formatted', () => {
      it('then they produce the pinned Spanish copy', () => {
        const senior = getCategoryById('senior');

        assert.ok(senior);

        const infantilModel = buildCategoryBrowseModel(bundledRepository, infantil);
        const seniorModel = buildCategoryBrowseModel(bundledRepository, senior);

        assert.equal(formatCategoryLabel(infantil), 'Infantil (U14)');
        assert.equal(formatCategoryLabel(senior), 'Senior (+18)');
        assert.equal(
          formatExerciseMeta(infantilModel.exercises[0]),
          '15 min · 10 jugadores · Intensidad alta',
        );
        assert.equal(
          infantilModel.programming
            ? formatSessionDuration(infantilModel.programming)
            : null,
          'Sesiones de 60–75 min',
        );
        assert.equal(
          seniorModel.programming ? formatSessionDuration(seniorModel.programming) : null,
          'Sesiones de 75–90 min',
        );
        assert.equal(formatExerciseCount(9), '9 ejercicios');
        assert.equal(formatExerciseCount(1), '1 ejercicio');
        assert.equal(formatExerciseCount(0), '0 ejercicios');
      });
    });
  });
});
