import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getExercise } from '@/modules/content/application/get-exercise';
import type { Exercise } from '@/modules/content/domain/exercise';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';
import {
  buildExerciseDetailModel,
  type ExerciseDetailModel,
} from '@/modules/content/presentation/view-models/exercise-detail-model';

const repository = createBundledContentRepository();

function requireExercise(exerciseId: string): Exercise {
  const exercise = getExercise(repository, exerciseId);

  assert.ok(exercise, `Expected the bundled package to contain ${exerciseId}.`);

  return exercise;
}

function factValue(model: ExerciseDetailModel, label: string): string {
  const fact = model.facts.find((row) => row.label === label);

  assert.ok(fact, `Expected a ${label} fact row.`);

  return fact.value;
}

const salida = requireExercise('salida-3-1-presion-alta');

describe('Exercise detail model', () => {
  describe('Given the bundled salida-3-1-presion-alta exercise', () => {
    describe('When the model is built', () => {
      it('then the facts keep the seven pinned labels in order', () => {
        const model = buildExerciseDetailModel(salida);

        assert.deepEqual(
          model.facts.map((fact) => fact.label),
          ['Categoría', 'Tramo', 'Duración', 'Jugadores', 'Espacio', 'Intensidad', 'Estructura'],
        );
      });

      it('then every fact value uses the pinned formatting', () => {
        const model = buildExerciseDetailModel(salida);

        assert.equal(factValue(model, 'Categoría'), 'Infantil (U14) · Cadete (U16)');
        assert.equal(factValue(model, 'Tramo'), 'Parte general');
        assert.equal(factValue(model, 'Duración'), '15 min');
        assert.equal(factValue(model, 'Jugadores'), '10 jugadores · 2 porteros');
        assert.equal(factValue(model, 'Espacio'), 'Pista completa · 20 × 40 m');
        assert.equal(factValue(model, 'Intensidad'), 'Alta · 85%');
        assert.equal(
          factValue(model, 'Estructura'),
          'Bloques de 3 minutos x 4 series',
        );
      });

      it('then title, summary, objective and category labels are verbatim', () => {
        const model = buildExerciseDetailModel(salida);

        assert.equal(model.title, 'Salida 3-1 ante presión alta');
        assert.equal(
          model.summary,
          'Salida en 3-1 con fijación del cierre y cambio de orientación al ala débil.',
        );
        assert.equal(
          model.objective,
          'Superar la primera línea de presión con control orientado y liberar el carril del ala débil.',
        );
        assert.deepEqual(model.categoryLabels, ['Infantil (U14)', 'Cadete (U16)']);
        assert.equal(model.sessionPartLabel, 'Parte general');
      });

      it('then constraints and coaching cues keep their package order and copy', () => {
        const model = buildExerciseDetailModel(salida);

        assert.deepEqual(model.constraints, salida.constraints);
        assert.deepEqual(model.coachingCues, salida.coachingCues);
        assert.deepEqual(model.coachingCues, [
          'Timing de desmarque del ala',
          'Orientación de control en banda',
          'Fijación del pívot sin falta en ataque',
        ]);
      });

      it('then the phases are ordered text with no board geometry', () => {
        const model = buildExerciseDetailModel(salida);

        assert.deepEqual(
          model.phases.map((phase) => phase.order),
          [1, 2, 3],
        );
        assert.deepEqual(model.phases[0], {
          order: 1,
          title: 'Salida desde portero',
          explanation:
            'El portero inicia la salida en 3-1 y el cierre ofrece la primera línea de pase.',
        });
        for (const phase of model.phases) {
          assert.deepEqual(Object.keys(phase).sort(), ['explanation', 'order', 'title']);
        }
      });
    });
  });

  describe('Given a synthetic exercise with shuffled phases', () => {
    describe('When the model is built', () => {
      const shuffled: Exercise = {
        ...salida,
        boardData: {
          ...salida.boardData,
          phases: [
            salida.boardData.phases[2],
            salida.boardData.phases[0],
            salida.boardData.phases[1],
          ],
        },
      };

      it('then the phases sort by order, never by array position', () => {
        const model = buildExerciseDetailModel(shuffled);

        assert.deepEqual(
          model.phases.map((phase) => phase.order),
          [1, 2, 3],
        );
        assert.deepEqual(
          model.phases.map((phase) => phase.title),
          ['Salida desde portero', 'Pase al carril derecho', 'Cambio de orientación'],
        );
      });

      it('then the phase counter follows the phase count', () => {
        const noPhases = buildExerciseDetailModel({
          ...salida,
          boardData: { ...salida.boardData, phases: [] },
        });
        const onePhase = buildExerciseDetailModel({
          ...salida,
          boardData: { ...salida.boardData, phases: [salida.boardData.phases[0]] },
        });
        const manyPhases = buildExerciseDetailModel(shuffled);

        assert.equal(noPhases.phaseCountLabel, '0 fases tácticas');
        assert.equal(onePhase.phaseCountLabel, '1 fase táctica');
        assert.equal(manyPhases.phaseCountLabel, '3 fases tácticas');
      });
    });
  });

  describe('Given the bundled weekly activacion-pases-y-nombres', () => {
    describe('When the model is built', () => {
      it('then its single citation is copied and no attribution exists', () => {
        const model = buildExerciseDetailModel(
          requireExercise('activacion-pases-y-nombres'),
        );

        assert.deepEqual(model.references, [
          { label: 'Adri Martín Futsal', url: 'https://adrimartinofutsal.es.tl/' },
        ]);
        assert.equal(model.attribution, null);
      });
    });
  });

  describe('Given a bundled library exercise with no citations', () => {
    describe('When the model is built', () => {
      it('then references default to an empty array and attribution is null', () => {
        const model = buildExerciseDetailModel(salida);

        assert.deepEqual(model.references, []);
        assert.equal(model.attribution, null);
      });
    });
  });

  describe('Given a synthetic exercise with missing optional fields', () => {
    describe('When the model is built', () => {
      const minimal: Exercise = {
        ...salida,
        intensity: { level: 'low' },
        players: { total: 8, goalkeepers: 0 },
        references: undefined,
        constraints: [],
        coachingCues: [],
      };

      it('then intensity, players, references and empty lists render without throwing', () => {
        const model = buildExerciseDetailModel(minimal);

        assert.equal(factValue(model, 'Intensidad'), 'Baja');
        assert.equal(factValue(model, 'Jugadores'), '8 jugadores');
        assert.deepEqual(model.references, []);
        assert.deepEqual(model.constraints, []);
        assert.deepEqual(model.coachingCues, []);
      });
    });
  });

  describe('Given a synthetic exercise with a provenance attribution', () => {
    describe('When the model is built', () => {
      it('then the attribution is copied verbatim and references stay empty', () => {
        const model = buildExerciseDetailModel({
          ...salida,
          provenance: {
            ...salida.provenance,
            attribution: 'Material de CMD Mora utilizado con permiso del club.',
          },
        });

        assert.equal(
          model.attribution,
          'Material de CMD Mora utilizado con permiso del club.',
        );
        assert.deepEqual(model.references, []);
      });
    });
  });

  describe('Given a built model', () => {
    describe('When the input is compared and the model arrays are mutated', () => {
      it('then the exercise is unchanged and no array is shared', () => {
        const weekly = requireExercise('activacion-pases-y-nombres');
        const before = JSON.stringify(weekly);
        const model = buildExerciseDetailModel(weekly);

        assert.notEqual(model.constraints, weekly.constraints);
        assert.notEqual(model.coachingCues, weekly.coachingCues);
        assert.notEqual(model.references, weekly.references);
        assert.notEqual(model.phases, weekly.boardData.phases);

        model.constraints.push({ rule: 'Mutado', detail: 'Mutado' });
        model.coachingCues.push('Mutada');
        model.references.push({ label: 'Mutada', url: 'https://example.com/' });
        model.phases.reverse();
        model.facts.reverse();
        model.categoryLabels.reverse();

        assert.equal(JSON.stringify(weekly), before);
      });
    });
  });
});
