import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseBoardData } from '@/shared/domain';
import type { CategoryId } from '@/modules/content/domain/category';
import { getCategoryById } from '@/modules/content/domain/category';
import type { ExerciseCollection } from '@/modules/content/domain/exercise-collection';
import type { Exercise, ExerciseStatus } from '@/modules/content/domain/exercise';
import type { Programming, ProgrammingStatus } from '@/modules/content/domain/programming';
import type { ContentProvenance } from '@/modules/content/domain/provenance';
import type { ContentRepository } from '@/modules/content/domain/ports/content-repository';
import type { SessionPart } from '@/modules/content/domain/session-part';
import { getProgramming } from '@/modules/content/application/get-programming';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';
import {
  buildCategoryBrowseModel,
  formatSessionDuration,
} from '@/modules/content/presentation/view-models/category-browse-model';
import {
  METHODOLOGY_KEY_CONCEPTS_LIMIT,
  WEEKLY_EXERCISES_PER_PART,
  buildExploreGeneralModel,
  buildExploreStats,
  buildMethodologyOverview,
  buildWeeklyExercises,
  formatWeeklySelection,
} from '@/modules/content/presentation/view-models/explore-general-model';

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
  sessionPart: SessionPart = 'main',
  provenance: Partial<ContentProvenance> = {},
  collection: ExerciseCollection = 'library',
): Exercise {
  return {
    id,
    title,
    summary: 'Ejercicio de prueba.',
    focus: 'Salida de presión',
    sessionPart,
    collection,
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
  keyConcepts: string[] = ['Concepto 1', 'Concepto 2', 'Concepto 3', 'Concepto 4'],
): Programming {
  return {
    id,
    categoryId,
    version: '1.0.0',
    formativeStage: 'Etapa de prueba',
    focus: 'Foco de prueba',
    playModel: 'Modelo de juego de prueba.',
    sessionDurationMinutes: { min: 50, max: 60 },
    keyConcepts,
    objectives: ['Objetivo de prueba'],
    sessionStructure: [
      {
        part: 'main',
        title: 'Parte principal',
        description: 'Tareas de la parte principal.',
      },
    ],
    macrocycles: [],
    status,
    provenance: ownedProvenance,
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
const senior = getCategoryById('senior');
const cadete = getCategoryById('cadete');

if (!infantil || !senior || !cadete) {
  throw new Error('The bundled category reference data is missing.');
}

describe('Explore general view model', () => {
  describe('Given the bundled Infantil U14 category', () => {
    describe('When the weekly block and methodology overview are built', () => {
      it('then the weekly block holds the pinned first exercise of each session part in session order', () => {
        const model = buildExploreGeneralModel(bundledRepository, infantil);
        const browseModel = buildCategoryBrowseModel(bundledRepository, infantil);

        assert.equal(WEEKLY_EXERCISES_PER_PART, 1);
        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.exercise.id),
          [
            'activacion-con-pases-entre-lineas',
            'ataque-3-1-con-cambio-de-orientacion',
            'rondo-de-cierre-con-movilidad',
          ],
        );
        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.part),
          ['warm-up', 'main', 'cool-down'],
        );
        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.label),
          ['Calentamiento', 'Parte general', 'Vuelta a la calma'],
        );
        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.exercise.title),
          [
            'Activación con pases entre líneas',
            'Ataque 3-1 con cambio de orientación',
            'Rondo de cierre con movilidad',
          ],
        );
        assert.equal(formatWeeklySelection(model.weeklyExercises.length), '3 ejercicios');
        assert.ok(
          model.weeklyExercises.every(
            (weekly) => !browseModel.exercises.some((exercise) => exercise.id === weekly.exercise.id),
          ),
        );
      });

      it('then the methodology card maps only the published programming fields', () => {
        const model = buildExploreGeneralModel(bundledRepository, infantil);
        const programming = getProgramming(bundledRepository, 'infantil');

        assert.ok(programming);
        assert.ok(model.methodology);
        assert.equal(METHODOLOGY_KEY_CONCEPTS_LIMIT, 3);
        assert.equal(
          model.methodology.stage,
          'Etapa de asimilación táctica cognitiva',
        );
        assert.equal(model.methodology.focus, 'Foco Metodológico Infantil');
        assert.equal(model.methodology.playModel, programming.playModel);
        assert.equal(model.methodology.sessionDurationLabel, 'Sesiones de 60–75 min');
        assert.equal(model.methodology.sessionDurationLabel, formatSessionDuration(programming));
        assert.deepEqual(
          model.methodology.keyConcepts,
          programming.keyConcepts.slice(0, METHODOLOGY_KEY_CONCEPTS_LIMIT),
        );
        assert.equal(model.methodology.keyConcepts.length, 3);
        assert.equal(
          programming.keyConcepts.length > METHODOLOGY_KEY_CONCEPTS_LIMIT,
          true,
        );
      });

      it('then the source key concepts array is not mutated', () => {
        const programming = getProgramming(bundledRepository, 'infantil');

        assert.ok(programming);

        const keyConceptsBefore = [...programming.keyConcepts];
        const model = buildExploreGeneralModel(bundledRepository, infantil);

        assert.ok(model.methodology);
        assert.deepEqual(programming.keyConcepts, keyConceptsBefore);
      });
    });
  });

  describe('Given the bundled Senior category', () => {
    describe('When the general model is built after selecting Senior', () => {
      it('then the weekly picks and the methodology swap to Senior', () => {
        const model = buildExploreGeneralModel(bundledRepository, senior);

        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.exercise.id),
          [
            'activacion-con-rondo-y-cambio-de-ritmo',
            'salida-4-0-ante-defensa-en-rombo',
            'vuelta-a-la-calma-con-respiracion-guiada',
          ],
        );
        assert.equal(formatWeeklySelection(model.weeklyExercises.length), '3 ejercicios');
        assert.equal(
          model.methodology?.stage,
          'Etapa de rendimiento y gestión del modelo de juego',
        );
        assert.equal(model.methodology?.focus, 'Foco Metodológico Senior');
      });
    });
  });

  describe('Given the bundled Cadete category', () => {
    describe('When the general model is built', () => {
      it('then the dedicated weekly main pick is the set-piece pressure drill', () => {
        const model = buildExploreGeneralModel(bundledRepository, cadete);
        const mainWeekly = model.weeklyExercises.find((weekly) => weekly.part === 'main');

        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.exercise.id),
          [
            'activacion-con-triangulos-y-desmarques',
            'presion-tras-saque-de-banda',
            'circulacion-suave-con-cambios-de-lado',
          ],
        );
        assert.equal(mainWeekly?.exercise.id, 'presion-tras-saque-de-banda');
        assert.equal(mainWeekly?.exercise.categoryIds.includes('infantil'), false);
      });
    });
  });

  describe('Given the bundled content package', () => {
    describe('When the hero stats are built', () => {
      it('then they count the real read-layer records instead of the prototype numbers', () => {
        const stats = buildExploreStats(bundledRepository);

        assert.equal(stats.exerciseCount, 71);
        assert.equal(stats.categoryCount, 7);
        assert.equal(stats.openLabel, '100%');
      });
    });
  });

  describe('Given a smaller repository', () => {
    describe('When the hero stats are built', () => {
      it('then they use that repository exercise count', () => {
        const repository = createFakeRepository([
          makeExercise('uno', 'Uno', ['infantil'], 'published'),
          makeExercise('dos', 'Dos', ['infantil'], 'published', 'warm-up'),
        ]);

        const stats = buildExploreStats(repository);

        assert.equal(stats.exerciseCount, 2);
        assert.equal(stats.categoryCount, 7);
      });
    });
  });

  describe('Given no selected category', () => {
    describe('When the general model is built', () => {
      it('then the weekly block and methodology are empty while the stats stay computed', () => {
        const model = buildExploreGeneralModel(bundledRepository, null);

        assert.equal(model.stats.exerciseCount, 71);
        assert.equal(model.stats.categoryCount, 7);
        assert.deepEqual(model.weeklyExercises, []);
        assert.equal(model.methodology, null);
      });
    });
  });

  describe('Given a fake repository without a Programming record', () => {
    describe('When the general model is built', () => {
      it('then the methodology overview is null and no content is invented', () => {
        const repository = createFakeRepository([
          makeExercise('uno', 'Uno', ['infantil'], 'published', 'warm-up'),
        ]);

        const model = buildExploreGeneralModel(repository, infantil);

        assert.equal(model.methodology, null);
        assert.equal(buildMethodologyOverview(null), null);
        assert.deepEqual(model.weeklyExercises, []);
      });
    });
  });

  describe('Given a category whose exercises cover a single session part', () => {
    describe('When the weekly block is built', () => {
      it('then it returns one card and skips the empty parts instead of inventing them', () => {
        const repository = createFakeRepository([
          makeExercise('principal-1', 'Principal 1', ['infantil'], 'published', 'main', {}, 'weekly'),
          makeExercise('principal-2', 'Principal 2', ['infantil'], 'published', 'main', {}, 'weekly'),
        ]);

        const model = buildExploreGeneralModel(repository, infantil);

        assert.equal(model.weeklyExercises.length, 1);
        assert.equal(model.weeklyExercises[0].part, 'main');
        assert.equal(model.weeklyExercises[0].exercise.id, 'principal-1');
      });

      it('then the block only reads weekly records and never a library exercise', () => {
        const repository = createFakeRepository([
          makeExercise('biblioteca', 'Biblioteca', ['infantil'], 'published', 'warm-up'),
          makeExercise('semanal', 'Semanal', ['infantil'], 'published', 'main', {}, 'weekly'),
        ]);

        const model = buildExploreGeneralModel(repository, infantil);

        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.exercise.id),
          ['semanal'],
        );
        assert.ok(model.weeklyExercises.every((weekly) => weekly.exercise.collection === 'weekly'));
      });

      it('then the model always orders warm-up before main before cool-down', () => {
        const repository = createFakeRepository([
          makeExercise('vuelta', 'Vuelta', ['infantil'], 'published', 'cool-down', {}, 'weekly'),
          makeExercise('principal', 'Principal', ['infantil'], 'published', 'main', {}, 'weekly'),
          makeExercise('calentamiento', 'Calentamiento', ['infantil'], 'published', 'warm-up', {}, 'weekly'),
        ]);

        const model = buildExploreGeneralModel(repository, infantil);

        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.exercise.id),
          ['calentamiento', 'principal', 'vuelta'],
        );
        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.part),
          ['warm-up', 'main', 'cool-down'],
        );
      });

      it('then the pure builder preserves the fixed session-part order', () => {
        const exercises = [
          makeExercise('vuelta', 'Vuelta', ['infantil'], 'published', 'cool-down', {}, 'weekly'),
          makeExercise('calentamiento', 'Calentamiento', ['infantil'], 'published', 'warm-up', {}, 'weekly'),
        ];

        assert.deepEqual(
          buildWeeklyExercises(exercises).map((weekly) => weekly.exercise.id),
          ['calentamiento', 'vuelta'],
        );
      });
    });
  });

  describe('Given a repository with draft, archived, and unlicensed records', () => {
    describe('When the general model builds the weekly block', () => {
      it('then only publishable exercises reach the weekly block', () => {
        const repository = createFakeRepository([
          makeExercise('publicado', 'Publicado', ['infantil'], 'published', 'warm-up', {}, 'weekly'),
          makeExercise('borrador', 'Borrador', ['infantil'], 'draft', 'warm-up', {}, 'weekly'),
          makeExercise('archivado', 'Archivado', ['infantil'], 'archived', 'main', {}, 'weekly'),
          makeExercise('sin-licencia', 'Sin licencia', ['infantil'], 'published', 'main', {
            licenseStatus: 'unlicensed',
          }, 'weekly'),
        ]);

        const model = buildExploreGeneralModel(repository, infantil);

        assert.deepEqual(
          model.weeklyExercises.map((weekly) => weekly.exercise.id),
          ['publicado'],
        );
      });
    });
  });

  describe('Given the weekly selection formatter', () => {
    describe('When the weekly card count is formatted', () => {
      it('then it returns the plural Spanish counter', () => {
        assert.equal(formatWeeklySelection(3), '3 ejercicios');
        assert.equal(formatWeeklySelection(9), '9 ejercicios');
      });

      it('then the singular and zero copy stay pinned', () => {
        assert.equal(formatWeeklySelection(1), '1 ejercicio');
        assert.equal(formatWeeklySelection(0), '0 ejercicios');
      });
    });
  });

  describe('Given the same repository and category', () => {
    describe('When the general model is built twice', () => {
      it('then it returns the same weekly ids deterministically', () => {
        const first = buildExploreGeneralModel(bundledRepository, infantil);
        const second = buildExploreGeneralModel(bundledRepository, infantil);

        assert.deepEqual(
          first.weeklyExercises.map((weekly) => weekly.exercise.id),
          second.weeklyExercises.map((weekly) => weekly.exercise.id),
        );
        assert.deepEqual(first.methodology, second.methodology);
      });
    });
  });
});
