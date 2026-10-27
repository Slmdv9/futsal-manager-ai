import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CATEGORY_IDS } from '@/modules/content/domain/category';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';
import {
  CONTENT_LICENSE_STATUSES,
  CONTENT_PROVENANCE_KINDS,
  isPublishableProvenance,
} from '@/modules/content/domain/provenance';

const repository = createBundledContentRepository();

const INSPIRATION_ONLY_DOMAINS = [
  'adrimartinofutsal.es.tl',
  'futsalcoach.es',
  'keepmove.net',
  'ejerciciosdefutbolsala.com',
];

const seededProgramming = CATEGORY_IDS.flatMap((categoryId) =>
  repository.getProgrammingByCategory(categoryId),
);

const seededRecords = [
  ...repository.getExercises().map((exercise) => ({
    kindOfRecord: 'exercise' as const,
    id: exercise.id,
    provenance: exercise.provenance,
    status: exercise.status,
  })),
  ...seededProgramming.map((programming) => ({
    kindOfRecord: 'programming' as const,
    id: programming.id,
    provenance: programming.provenance,
    status: programming.status,
  })),
];

describe('Seeded content provenance audit', () => {
  describe('Given the bundled content package', () => {
    describe('When every seeded record is audited', () => {
      it('then the audit sees all 50 seeded exercises and the seven Programming records', () => {
        assert.equal(repository.getExercises().length, 50);
        assert.equal(seededProgramming.length, 7);
        assert.deepEqual(
          seededRecords.map((record) => record.id),
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
            'prebenjamin-u8-base',
            'benjamin-u10-base',
            'alevin-u12-base',
            'infantil-u14-base',
            'cadete-u16-base',
            'juvenil-u19-base',
            'senior-base',
          ],
        );
        assert.equal(seededRecords.length, 57);
      });

      it('then every exercise carries one of the three allowed session parts', () => {
        for (const exercise of repository.getExercises()) {
          assert.ok(
            ['warm-up', 'main', 'cool-down'].includes(exercise.sessionPart),
            `Expected a known session part for ${exercise.id}.`,
          );
        }
      });

      it('then every record states a known kind, a source name, and a known license status', () => {
        for (const record of seededRecords) {
          assert.ok(
            CONTENT_PROVENANCE_KINDS.includes(record.provenance.kind),
            `Expected a known provenance kind for ${record.id}.`,
          );
          assert.ok(
            record.provenance.sourceName.trim().length > 0,
            `Expected a source name for ${record.id}.`,
          );
          assert.ok(
            CONTENT_LICENSE_STATUSES.includes(record.provenance.licenseStatus),
            `Expected a known license status for ${record.id}.`,
          );
        }
      });

      it('then every record is original content owned by Futsal Manager AI', () => {
        for (const record of seededRecords) {
          assert.equal(record.provenance.kind, 'original', `Expected ${record.id} to be original.`);
          assert.equal(
            record.provenance.licenseStatus,
            'owned',
            `Expected ${record.id} to be owned.`,
          );
          assert.equal(
            record.provenance.sourceName,
            'Futsal Manager AI',
            `Expected ${record.id} to credit Futsal Manager AI.`,
          );
        }
      });

      it('then every record has a publishable license status', () => {
        for (const record of seededRecords) {
          assert.equal(record.status, 'published', `Expected ${record.id} to be published.`);
          assert.ok(
            isPublishableProvenance(record.provenance),
            `Expected ${record.id} to carry a publishable license status.`,
          );
        }
      });

      it('then no record is reference-kind material', () => {
        for (const record of seededRecords) {
          assert.notEqual(
            record.provenance.kind,
            'reference',
            `Expected ${record.id} not to be reference-kind material.`,
          );
        }
      });

      it('then no record carries an attribution', () => {
        for (const record of seededRecords) {
          assert.equal(
            record.provenance.attribution,
            undefined,
            `Expected ${record.id} not to require an attribution.`,
          );
        }
      });

      it('then no source name names an inspiration-only domain', () => {
        for (const record of seededRecords) {
          const sourceName = record.provenance.sourceName.toLowerCase();

          for (const domain of INSPIRATION_ONLY_DOMAINS) {
            assert.ok(
              !sourceName.includes(domain),
              `Expected ${record.id} not to name ${domain}.`,
            );
          }
        }
      });
    });
  });
});
