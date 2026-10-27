import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { BOARD_DATA_SCHEMA_VERSION, parseBoardData } from '@/shared/domain';
import { getProgramming } from '@/modules/content/application/get-programming';
import { listExercises } from '@/modules/content/application/list-exercises';
import { CONTENT_PACKAGE_VERSION } from '@/modules/content/domain/content-package';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';

const repository = createBundledContentRepository();

const INFANTIL_EXERCISE_IDS = [
  'salida-3-1-presion-alta',
  'circulacion-cierre-ala',
  'presion-tras-perdida',
  'rondo-4v1-orientacion',
  'pase-y-va-carril-central',
  'juego-posicion-3-1-pivote',
  'ataque-4-0-rotaciones',
  'basculacion-rombo-defensivo',
  'transicion-3v2-tras-robo',
];

const INFANTIL_FOCUS_VALUES = [
  'Salida de presión',
  'Circulación',
  'Defensa',
  'Rondo',
  'Pase y va',
  'Juego de posición',
  'Ataque 4-0',
  'Basculación defensiva',
  'Transición',
];

const LEGACY_BOARDS = [
  { id: 'salida-3-1-presion-alta', categoryIds: ['infantil', 'cadete'], phases: 3 },
  { id: 'circulacion-cierre-ala', categoryIds: ['infantil'], phases: 2 },
  { id: 'presion-tras-perdida', categoryIds: ['infantil'], phases: 2 },
];

const PLACEHOLDER_PATTERN = /^(todo|tbd|pendiente|xxx)$/i;

const infantilExercises = listExercises(repository, { categoryId: 'infantil' });

function readBundledPackage(): { contentVersion: string } {
  const packageUrl = new URL(
    '../../../../src/modules/content/infrastructure/content/content-package.json',
    import.meta.url,
  );

  return JSON.parse(readFileSync(packageUrl, 'utf8')) as { contentVersion: string };
}

function assertSpanishCopy(label: string, value: string): void {
  assert.ok(value.trim().length > 0, `Expected ${label} to carry Spanish copy.`);
  assert.ok(!PLACEHOLDER_PATTERN.test(value.trim()), `Expected ${label} not to be a placeholder.`);
}

describe('Infantil U14 seed', () => {
  describe('Given the bundled content package', () => {
    describe('When the Infantil exercises are listed', () => {
      it('then it returns the nine published exercises in package order', () => {
        assert.deepEqual(
          infantilExercises.map((exercise) => exercise.id),
          INFANTIL_EXERCISE_IDS,
        );
        assert.equal(new Set(infantilExercises.map((exercise) => exercise.id)).size, 9);
        assert.equal(listExercises(repository).length, 50);
      });

      it('then it groups as two warm-up, five main-part, and two cool-down exercises', () => {
        const sessionPartIds = (part: string) =>
          infantilExercises
            .filter((exercise) => exercise.sessionPart === part)
            .map((exercise) => exercise.id);

        assert.deepEqual(sessionPartIds('warm-up'), [
          'pase-y-va-carril-central',
          'juego-posicion-3-1-pivote',
        ]);
        assert.deepEqual(sessionPartIds('main'), [
          'salida-3-1-presion-alta',
          'presion-tras-perdida',
          'ataque-4-0-rotaciones',
          'basculacion-rombo-defensivo',
          'transicion-3v2-tras-robo',
        ]);
        assert.deepEqual(sessionPartIds('cool-down'), [
          'circulacion-cierre-ala',
          'rondo-4v1-orientacion',
        ]);
      });

      it('then every exercise is published and tagged Infantil', () => {
        for (const exercise of infantilExercises) {
          assert.equal(exercise.status, 'published', `Expected ${exercise.id} to be published.`);
          assert.ok(
            exercise.categoryIds.includes('infantil'),
            `Expected ${exercise.id} to be tagged Infantil.`,
          );
        }
      });

      it('then every exercise declares a distinct planned focus', () => {
        assert.equal(new Set(infantilExercises.map((exercise) => exercise.focus)).size, 9);
        assert.deepEqual(
          infantilExercises.map((exercise) => exercise.focus),
          INFANTIL_FOCUS_VALUES,
        );
      });
    });

    describe('When every Infantil Board Data is re-parsed', () => {
      for (const exercise of infantilExercises) {
        it(`then the board for ${exercise.id} is valid Board Data`, () => {
          const board = parseBoardData(exercise.boardData);

          assert.equal(exercise.boardData.schemaVersion, BOARD_DATA_SCHEMA_VERSION);
          assert.equal(board.schemaVersion, BOARD_DATA_SCHEMA_VERSION);
          assert.ok(board.phases.length >= 1 && board.phases.length <= 12);
          assert.ok(board.tokens.length <= exercise.players.total);
          assert.ok(exercise.players.goalkeepers <= exercise.players.total);

          board.phases.forEach((phase, index) => {
            assert.equal(phase.order, index + 1, `Expected ordered phases for ${exercise.id}.`);

            const positionedTokenIds = new Set(phase.positions.map((position) => position.tokenId));

            assert.equal(
              positionedTokenIds.size,
              board.tokens.length,
              `Expected one position per token in ${exercise.id} phase ${phase.order}.`,
            );
            for (const token of board.tokens) {
              assert.ok(
                positionedTokenIds.has(token.id),
                `Expected a position for token "${token.id}" in ${exercise.id} phase ${phase.order}.`,
              );
            }
          });
        });
      }
    });

    describe('When every Infantil exercise is read for copy', () => {
      it('then each record carries complete Spanish copy', () => {
        for (const exercise of infantilExercises) {
          assertSpanishCopy(`${exercise.id}.title`, exercise.title);
          assertSpanishCopy(`${exercise.id}.summary`, exercise.summary);
          assertSpanishCopy(`${exercise.id}.focus`, exercise.focus);
          assertSpanishCopy(`${exercise.id}.objective`, exercise.objective);
          assertSpanishCopy(`${exercise.id}.workStructure`, exercise.workStructure);
          assertSpanishCopy(`${exercise.id}.space.label`, exercise.space.label);

          assert.ok(exercise.coachingCues.length >= 1, `Expected cues for ${exercise.id}.`);
          for (const cue of exercise.coachingCues) {
            assertSpanishCopy(`${exercise.id}.coachingCues`, cue);
          }

          assert.ok(exercise.constraints.length >= 1, `Expected constraints for ${exercise.id}.`);
          for (const constraint of exercise.constraints) {
            assertSpanishCopy(`${exercise.id}.constraints.rule`, constraint.rule);
            assertSpanishCopy(`${exercise.id}.constraints.detail`, constraint.detail);
          }

          for (const phase of exercise.boardData.phases) {
            assertSpanishCopy(`${exercise.id}.phases.${phase.order}.title`, phase.title);
            assertSpanishCopy(`${exercise.id}.phases.${phase.order}.explanation`, phase.explanation);
          }
        }
      });
    });

    describe('When the Infantil programming record is read', () => {
      it('then it is the complete published season plan', () => {
        const programming = getProgramming(repository, 'infantil');

        assert.ok(programming, 'Expected a published Infantil programming record.');
        if (!programming) {
          return;
        }

        assert.equal(programming.id, 'infantil-u14-base');
        assert.equal(programming.categoryId, 'infantil');
        assert.equal(programming.status, 'published');
        assert.equal(programming.version, '1.1.0');
        assert.match(programming.version, /^\d+\.\d+\.\d+$/);

        assertSpanishCopy('programming.formativeStage', programming.formativeStage);
        assertSpanishCopy('programming.focus', programming.focus);
        assertSpanishCopy('programming.playModel', programming.playModel);

        assert.ok(programming.sessionDurationMinutes.min >= 20);
        assert.ok(programming.sessionDurationMinutes.max <= 180);
        assert.ok(programming.sessionDurationMinutes.max >= programming.sessionDurationMinutes.min);

        assert.equal(programming.keyConcepts.length, 5);
        assert.equal(programming.objectives.length, 6);
        for (const concept of programming.keyConcepts) {
          assertSpanishCopy('programming.keyConcepts', concept);
        }
        for (const objective of programming.objectives) {
          assertSpanishCopy('programming.objectives', objective);
        }

        assert.deepEqual(
          programming.sessionStructure.map((entry) => entry.part),
          ['warm-up', 'main', 'cool-down'],
        );
        for (const entry of programming.sessionStructure) {
          assertSpanishCopy(`programming.sessionStructure.${entry.part}.title`, entry.title);
          assertSpanishCopy(`programming.sessionStructure.${entry.part}.description`, entry.description);
        }

        assert.equal(programming.macrocycles.length, 3);
        programming.macrocycles.forEach((macrocycle, macrocycleIndex) => {
          assert.equal(macrocycle.id, `macrociclo-${macrocycleIndex + 1}`);
          assertSpanishCopy(`programming.${macrocycle.id}.label`, macrocycle.label);
          assertSpanishCopy(`programming.${macrocycle.id}.focus`, macrocycle.focus);
          assert.equal(macrocycle.microcycles.length, 2);

          macrocycle.microcycles.forEach((microcycle, microcycleIndex) => {
            assert.equal(microcycle.id, `microciclo-${microcycleIndex + 1}`);
            assertSpanishCopy(`programming.${microcycle.id}.label`, microcycle.label);
            assertSpanishCopy(`programming.${microcycle.id}.focus`, microcycle.focus);
            assert.ok(microcycle.sessionCount >= 1);
          });
        });
      });
    });

    describe('When the legacy seeded records are read', () => {
      it('then their ids, categories, and boards are unchanged', () => {
        for (const legacy of LEGACY_BOARDS) {
          const exercise = repository.getExerciseById(legacy.id);

          assert.ok(exercise, `Expected the legacy exercise ${legacy.id} to remain seeded.`);
          if (!exercise) {
            continue;
          }

          assert.deepEqual(exercise.categoryIds, legacy.categoryIds);
          assert.equal(exercise.boardData.phases.length, legacy.phases);
        }
      });

      it('then the package moves to 1.1.0 while Board Data and the Infantil plan stay pinned', () => {
        assert.equal(CONTENT_PACKAGE_VERSION, '1.1.0');
        assert.equal(readBundledPackage().contentVersion, '1.1.0');
        assert.equal(BOARD_DATA_SCHEMA_VERSION, '1.0.0');
        for (const exercise of repository.getExercises()) {
          assert.equal(exercise.boardData.schemaVersion, '1.0.0');
        }
      });
    });
  });
});
