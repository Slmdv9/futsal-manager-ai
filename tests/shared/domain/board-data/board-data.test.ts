import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  BOARD_DATA_SCHEMA_VERSION,
  BoardDataValidationError,
  parseBoardData,
  safeParseBoardData,
} from '@/shared/domain';

type MutableFixture = {
  schemaVersion: string;
  pitch: { format: string };
  tokens: { id: string; kind: string; team: string; label: string }[];
  cones: { id: string; x: number; y: number }[];
  phases: {
    id: string;
    order: number;
    title: string;
    explanation: string;
    positions: { tokenId: string; x: number; y: number }[];
    ball: { x: number; y: number } | null;
    arrows: { id: string; kind: string }[];
    labels: { id: string; text: string; align?: string }[];
  }[];
};

const validBoard = loadFixture('valid-multi-phase.json');

function loadFixture(name: string): unknown {
  const fixtureUrl = new URL(`./fixtures/${name}`, import.meta.url);
  return JSON.parse(readFileSync(fixtureUrl, 'utf8')) as unknown;
}

function cloneValidFixture(): MutableFixture {
  return JSON.parse(JSON.stringify(validBoard)) as MutableFixture;
}

describe('Board Data validation', () => {
  describe('Given the supported Board Data version', () => {
    describe('When the contract constant is inspected', () => {
      it('then it records schema version 1.0.0', () => {
        assert.equal(BOARD_DATA_SCHEMA_VERSION, '1.0.0');
      });
    });
  });

  describe('Given a valid three-phase board', () => {
    describe('When it is parsed', () => {
      it('then it preserves the schema version, pitch, tokens, cones, phases, ball, arrows, and labels', () => {
        const board = parseBoardData(validBoard);

        assert.equal(board.schemaVersion, BOARD_DATA_SCHEMA_VERSION);
        assert.equal(board.pitch.format, 'full');
        assert.equal(board.tokens.length, 9);
        assert.deepEqual(
          board.cones.map((cone) => cone.id),
          ['cono-salida', 'cono-banda-derecha', 'cono-banda-izquierda'],
        );
        assert.deepEqual(
          board.phases.map((phase) => phase.id),
          ['salida', 'carril-derecho', 'cambio-orientacion'],
        );
        assert.deepEqual(
          board.phases.map((phase) => phase.order),
          [1, 2, 3],
        );
        assert.deepEqual(board.phases[0].ball, { x: 8, y: 50 });
        assert.equal(board.phases[2].arrows[0].kind, 'pass');
        assert.equal(board.phases[1].labels[0].text, 'Presión al carril derecho');
        assert.equal(board.phases[1].labels[0].align, 'left');
      });

      it('then it applies the documented defaults for arrow curve and label alignment', () => {
        const board = parseBoardData(validBoard);

        assert.equal(board.phases[0].arrows[0].curve, 0);
        assert.equal(board.phases[0].labels[0].align, 'center');
      });

      it('then every token has exactly one position in every phase', () => {
        const board = parseBoardData(validBoard);

        for (const phase of board.phases) {
          assert.equal(phase.positions.length, board.tokens.length);
          assert.equal(
            new Set(phase.positions.map((position) => position.tokenId)).size,
            board.tokens.length,
          );
        }
      });
    });
  });

  describe('Given a board that marks a half-pitch format', () => {
    describe('When it is parsed', () => {
      it('then it accepts the same normalized coordinate space', () => {
        const fixture = cloneValidFixture();
        fixture.pitch.format = 'half';

        const board = parseBoardData(fixture);

        assert.equal(board.pitch.format, 'half');
      });
    });
  });

  describe('Given a phase that omits a token position', () => {
    describe('When the board is validated', () => {
      it('then it reports the phase positions path and the missing token id', () => {
        const result = safeParseBoardData(loadFixture('invalid-missing-position.json'));

        if (result.success) {
          assert.fail('Expected the missing-position fixture to fail validation.');
        }

        const issue = result.issues.find(
          (candidate) =>
            candidate.path === 'phases.1.positions' &&
            candidate.message.includes('ala-izquierda'),
        );

        assert.ok(issue, JSON.stringify(result.issues, null, 2));
      });
    });
  });

  describe('Given a token with an unknown kind', () => {
    describe('When the board is validated', () => {
      it('then it reports the token index and the kind field', () => {
        const result = safeParseBoardData(loadFixture('invalid-unknown-kind.json'));

        if (result.success) {
          assert.fail('Expected the unknown-kind fixture to fail validation.');
        }

        const issue = result.issues.find(
          (candidate) =>
            candidate.path === 'tokens.0.kind' &&
            candidate.message.includes('"player"') &&
            candidate.message.includes('"keeper"'),
        );

        assert.ok(issue, JSON.stringify(result.issues, null, 2));
      });
    });
  });

  describe('Given an unsupported schema version', () => {
    describe('When the board is validated', () => {
      it('then it reports the schemaVersion path with the supported version', () => {
        const result = safeParseBoardData(loadFixture('invalid-unknown-version.json'));

        if (result.success) {
          assert.fail('Expected the unknown-version fixture to fail validation.');
        }

        const issue = result.issues.find(
          (candidate) =>
            candidate.path === 'schemaVersion' &&
            candidate.message.includes(BOARD_DATA_SCHEMA_VERSION),
        );

        assert.ok(issue, JSON.stringify(result.issues, null, 2));
      });
    });
  });

  describe('Given a payload with an unexpected field', () => {
    describe('When the board is validated', () => {
      it('then it rejects the field instead of ignoring it', () => {
        const result = safeParseBoardData(loadFixture('invalid-strict-field.json'));

        if (result.success) {
          assert.fail('Expected the strict-field fixture to fail validation.');
        }

        const issue = result.issues.find((candidate) => candidate.message.includes('notes'));

        assert.ok(issue, JSON.stringify(result.issues, null, 2));
      });
    });
  });

  describe('Given phases whose order does not match their array position', () => {
    describe('When the board is validated', () => {
      it('then it reports the order field for the misordered phase', () => {
        const fixture = cloneValidFixture();
        fixture.phases[1].order = 5;

        const result = safeParseBoardData(fixture);

        if (result.success) {
          assert.fail('Expected an out-of-order phase to fail validation.');
        }

        assert.ok(
          result.issues.some((issue) => issue.path === 'phases.1.order'),
          JSON.stringify(result.issues, null, 2),
        );
      });
    });
  });

  describe('Given a position for a token that is not defined', () => {
    describe('When the board is validated', () => {
      it('then it reports the unknown token id at its position path', () => {
        const fixture = cloneValidFixture();
        fixture.phases[0].positions[0].tokenId = 'token-fantasma';

        const result = safeParseBoardData(fixture);

        if (result.success) {
          assert.fail('Expected an unknown token position to fail validation.');
        }

        assert.ok(
          result.issues.some(
            (issue) =>
              issue.path === 'phases.0.positions.0.tokenId' &&
              issue.message.includes('token-fantasma'),
          ),
          JSON.stringify(result.issues, null, 2),
        );
      });
    });
  });

  describe('Given invalid Board Data and a parser that throws', () => {
    describe('When parseBoardData is called', () => {
      it('then it throws BoardDataValidationError with formatted issues', () => {
        assert.throws(
          () => parseBoardData(loadFixture('invalid-missing-position.json')),
          (error: unknown) => {
            assert.ok(error instanceof BoardDataValidationError);
            assert.ok(error.issues.length > 0);
            assert.match(error.message, /Invalid Board Data/);
            assert.match(error.message, /phases\.1\.positions/);
            return true;
          },
        );
      });
    });
  });
});
