import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  CONTENT_PACKAGE_VERSION,
  ContentValidationError,
  parseContentPackage,
  safeParseContentPackage,
  type ContentValidationIssue,
} from '@/modules/content/domain/content-package';

type MutableExercise = {
  id: string;
  categoryIds: string[];
  players: { total: number; goalkeepers: number };
  boardData: { phases: { positions: { tokenId: string; x: number; y: number }[] }[] };
};

type MutableProgramming = {
  id: string;
  categoryId: string;
  status: string;
};

type MutablePackage = {
  contentVersion: string;
  exercises: MutableExercise[];
  programming: MutableProgramming[];
};

const validPackage = loadFixture('valid-content-package.json');

function loadFixture(name: string): unknown {
  const fixtureUrl = new URL(`./fixtures/${name}`, import.meta.url);
  return JSON.parse(readFileSync(fixtureUrl, 'utf8')) as unknown;
}

function cloneValidPackage(): MutablePackage {
  return JSON.parse(JSON.stringify(validPackage)) as MutablePackage;
}

function issuePaths(issues: ContentValidationIssue[]): string[] {
  return issues.map((issue) => issue.path);
}

function findIssue(
  issues: ContentValidationIssue[],
  path: string,
): ContentValidationIssue | undefined {
  return issues.find((issue) => issue.path === path);
}

describe('Content package validation', () => {
  describe('Given the supported content package version', () => {
    describe('When the contract constant is read', () => {
      it('then it records content package version 1.0.0', () => {
        assert.equal(CONTENT_PACKAGE_VERSION, '1.0.0');
      });
    });
  });

  describe('Given a valid content package', () => {
    describe('When it is parsed', () => {
      it('returns the recorded version, exercises, and programming', () => {
        const contentPackage = parseContentPackage(validPackage);

        assert.equal(contentPackage.contentVersion, CONTENT_PACKAGE_VERSION);
        assert.deepEqual(
          contentPackage.exercises.map((exercise) => exercise.id),
          ['salida-3-1', 'circulacion-cierre-ala'],
        );
        assert.deepEqual(
          contentPackage.programming.map((programming) => programming.id),
          ['infantil-u14-base', 'cadete-u16-base'],
        );
        assert.deepEqual(contentPackage.exercises[1].categoryIds, ['infantil', 'cadete']);
        assert.equal(contentPackage.exercises[0].boardData.schemaVersion, '1.0.0');
        assert.equal(contentPackage.exercises[0].boardData.phases.length, 2);
      });
    });
  });

  describe('Given a package with an unknown category id', () => {
    describe('When it is parsed', () => {
      it('fails with a dot path naming the offending category id', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[1].categoryIds[0] = 'chupetin';

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.1.categoryIds.0');

        assert.ok(issue, `Expected exercises.1.categoryIds.0 in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /Unknown category id/);
      });
    });
  });

  describe('Given a package with a duplicated exercise id', () => {
    describe('When it is parsed', () => {
      it('fails with a dot path naming the duplicate', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[1].id = contentPackage.exercises[0].id;

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.1.id');

        assert.ok(issue, `Expected exercises.1.id in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /Duplicate exercise id "salida-3-1"/);
      });
    });
  });

  describe('Given an exercise with an empty categoryIds list', () => {
    describe('When the package is parsed', () => {
      it('fails with a dot path naming the exercise categoryIds', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[1].categoryIds = [];

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        assert.ok(
          findIssue(result.issues, 'exercises.1.categoryIds'),
          `Expected exercises.1.categoryIds in ${issuePaths(result.issues)}`,
        );
      });
    });
  });

  describe('Given an exercise with a repeated category id', () => {
    describe('When the package is parsed', () => {
      it('fails with a dot path naming the repeated category index', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[1].categoryIds = ['infantil', 'infantil'];

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.1.categoryIds.1');

        assert.ok(issue, `Expected exercises.1.categoryIds.1 in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /Duplicate category id "infantil"/);
      });
    });
  });

  describe('Given an exercise whose Board Data is invalid', () => {
    describe('When the package is parsed', () => {
      it('fails with the issue re-prefixed under the exercise Board Data path', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[0].boardData.phases[1].positions.pop();

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.0.boardData.phases.1.positions');

        assert.ok(
          issue,
          `Expected exercises.0.boardData.phases.1.positions in ${issuePaths(result.issues)}`,
        );
        assert.match(issue.message, /Missing position for token/);
      });
    });
  });

  describe('Given two published programming records for one category', () => {
    describe('When the package is parsed', () => {
      it('fails with a path naming the category', () => {
        const contentPackage = cloneValidPackage();
        const published = contentPackage.programming[0];
        contentPackage.programming.push({
          ...published,
          id: 'infantil-u14-base-v2',
          status: 'published',
        });

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'programming.2.categoryId');

        assert.ok(issue, `Expected programming.2.categoryId in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /"infantil"/);
      });

      it('accepts one published and one draft record for the same category', () => {
        const contentPackage = cloneValidPackage();
        const published = contentPackage.programming[0];
        contentPackage.programming.push({
          ...published,
          id: 'infantil-u14-draft',
          status: 'draft',
        });

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, true);
      });
    });
  });

  describe('Given an exercise whose goalkeepers exceed the player total', () => {
    describe('When the package is parsed', () => {
      it('fails with a dot path naming the players total', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[0].players = { total: 2, goalkeepers: 3 };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        assert.ok(
          findIssue(result.issues, 'exercises.0.players.total'),
          `Expected exercises.0.players.total in ${issuePaths(result.issues)}`,
        );
      });
    });
  });

  describe('Given a package with another content version', () => {
    describe('When it is parsed', () => {
      it('fails with a path naming contentVersion', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.contentVersion = '2.0.0';

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'contentVersion');

        assert.ok(issue, `Expected contentVersion in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /contentVersion must be "1\.0\.0"/);
      });
    });
  });

  describe('Given a package with an unexpected key', () => {
    describe('When it is parsed', () => {
      it('fails instead of silently accepting the extra field', () => {
        const contentPackage = cloneValidPackage() as MutablePackage & {
          exercises: (MutableExercise & { notes: string })[];
        };
        contentPackage.exercises[0].notes = 'not part of the contract';

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        assert.ok(
          result.issues.some((issue) => issue.path.startsWith('exercises.0')),
          `Expected an issues path under exercises.0 in ${issuePaths(result.issues)}`,
        );
      });
    });
  });

  describe('Given an invalid package', () => {
    describe('When the throwing parser is used', () => {
      it('then it raises a ContentValidationError carrying every formatted issue', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[1].categoryIds[0] = 'chupetin';

        assert.throws(
          () => parseContentPackage(contentPackage),
          (error: unknown) => {
            assert.ok(error instanceof ContentValidationError);
            assert.equal(error.name, 'ContentValidationError');
            assert.ok(
              error.issues.some((issue) => issue.path === 'exercises.1.categoryIds.0'),
            );
            assert.match(error.message, /^Invalid content package — /);
            assert.match(error.message, /exercises\.1\.categoryIds\.0: /);
            return true;
          },
        );
      });
    });
  });
});
