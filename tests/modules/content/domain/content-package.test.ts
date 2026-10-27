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

type MutableProvenance = {
  kind: string;
  sourceName: string;
  licenseStatus: string;
  attribution?: string;
};

type MutableExercise = {
  id: string;
  categoryIds: string[];
  players: { total: number; goalkeepers: number };
  sessionPart?: string;
  status: string;
  provenance?: MutableProvenance;
  boardData: { phases: { positions: { tokenId: string; x: number; y: number }[] }[] };
};

type MutableProgramming = {
  id: string;
  categoryId: string;
  status: string;
  provenance?: MutableProvenance;
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
      it('then it records content package version 1.1.0', () => {
        assert.equal(CONTENT_PACKAGE_VERSION, '1.1.0');
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
        assert.equal(contentPackage.exercises[0].sessionPart, 'main');
        assert.equal(contentPackage.exercises[1].sessionPart, 'cool-down');
        assert.equal(contentPackage.exercises[0].boardData.schemaVersion, '1.0.0');
        assert.equal(contentPackage.exercises[0].boardData.phases.length, 2);
      });
    });
  });

  describe('Given an exercise without a session part', () => {
    describe('When the package is parsed', () => {
      it('fails with a dot path naming exercises.0.sessionPart', () => {
        const contentPackage = cloneValidPackage();
        delete contentPackage.exercises[0].sessionPart;

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.0.sessionPart');

        assert.ok(issue, `Expected exercises.0.sessionPart in ${issuePaths(result.issues)}`);
      });
    });
  });

  describe('Given an exercise with an unknown session part', () => {
    describe('When the package is parsed', () => {
      it('fails with the three allowed values in the message', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[0].sessionPart = 'activation';

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.0.sessionPart');

        assert.ok(issue, `Expected exercises.0.sessionPart in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /"warm-up", "main", or "cool-down"/);
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

  describe('Given a published record with a non-publishable license status', () => {
    describe('When the package is parsed', () => {
      for (const licenseStatus of ['unlicensed', 'pending', 'reference-only']) {
        it(`fails for an exercise whose licenseStatus is "${licenseStatus}"`, () => {
          const contentPackage = cloneValidPackage();
          contentPackage.exercises[0].provenance = {
            kind: 'original',
            sourceName: 'Futsal Manager AI',
            licenseStatus,
          };

          const result = safeParseContentPackage(contentPackage);

          assert.equal(result.success, false);
          if (result.success) {
            return;
          }

          const issue = findIssue(result.issues, 'exercises.0.provenance.licenseStatus');

          assert.ok(
            issue,
            `Expected exercises.0.provenance.licenseStatus in ${issuePaths(result.issues)}`,
          );
          assert.match(issue.message, /requires licenseStatus "owned" or "permitted"/);
          assert.match(issue.message, new RegExp(`"${licenseStatus}" cannot be published`));
        });

        it(`fails for programming whose licenseStatus is "${licenseStatus}"`, () => {
          const contentPackage = cloneValidPackage();
          contentPackage.programming[0].provenance = {
            kind: 'original',
            sourceName: 'Futsal Manager AI',
            licenseStatus,
          };

          const result = safeParseContentPackage(contentPackage);

          assert.equal(result.success, false);
          if (result.success) {
            return;
          }

          const issue = findIssue(result.issues, 'programming.0.provenance.licenseStatus');

          assert.ok(
            issue,
            `Expected programming.0.provenance.licenseStatus in ${issuePaths(result.issues)}`,
          );
          assert.match(issue.message, new RegExp(`"${licenseStatus}" cannot be published`));
        });
      }
    });
  });

  describe('Given a record without provenance', () => {
    describe('When the package is parsed', () => {
      it('fails with a path naming the exercise provenance and a required message', () => {
        const contentPackage = cloneValidPackage();
        delete contentPackage.exercises[0].provenance;

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.0.provenance');

        assert.ok(issue, `Expected exercises.0.provenance in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /Provenance is required/);
      });

      it('fails with a path naming the programming provenance and a required message', () => {
        const contentPackage = cloneValidPackage();
        delete contentPackage.programming[0].provenance;

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'programming.0.provenance');

        assert.ok(issue, `Expected programming.0.provenance in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /Provenance is required/);
      });
    });
  });

  describe('Given a record whose provenance kind contradicts its license status', () => {
    describe('When the package is parsed', () => {
      const contradictions = [
        { kind: 'reference', licenseStatus: 'owned' },
        { kind: 'reference', licenseStatus: 'permitted' },
        { kind: 'reference', licenseStatus: 'unlicensed' },
        { kind: 'cmd-mora', licenseStatus: 'owned' },
      ];

      for (const { kind, licenseStatus } of contradictions) {
        it(`fails for kind "${kind}" with licenseStatus "${licenseStatus}"`, () => {
          const contentPackage = cloneValidPackage();
          contentPackage.exercises[1].status = 'draft';
          contentPackage.exercises[1].provenance = {
            kind,
            sourceName: 'CMD Mora',
            licenseStatus,
          };

          const result = safeParseContentPackage(contentPackage);

          assert.equal(result.success, false);
          if (result.success) {
            return;
          }

          const issue = findIssue(result.issues, 'exercises.1.provenance.licenseStatus');

          assert.ok(
            issue,
            `Expected exercises.1.provenance.licenseStatus in ${issuePaths(result.issues)}`,
          );
          assert.match(
            issue.message,
            new RegExp(`"${licenseStatus}" is not allowed for kind "${kind}"`),
          );
        });
      }

      it('accepts a draft reference record with reference-only or pending status', () => {
        for (const licenseStatus of ['reference-only', 'pending']) {
          const contentPackage = cloneValidPackage();
          contentPackage.exercises[1].status = 'draft';
          contentPackage.exercises[1].provenance = {
            kind: 'reference',
            sourceName: 'Inspiration only',
            licenseStatus,
          };

          const result = safeParseContentPackage(contentPackage);

          assert.equal(
            result.success,
            true,
            `Expected a draft reference record with "${licenseStatus}" to parse.`,
          );
        }
      });

      it('accepts a draft pending programming record', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.programming[1].status = 'draft';
        contentPackage.programming[1].provenance = {
          kind: 'original',
          sourceName: 'Futsal Manager AI',
          licenseStatus: 'pending',
        };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, true);
      });

      it('accepts a draft cmd-mora record with permitted status', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.programming[1].status = 'draft';
        contentPackage.programming[1].provenance = {
          kind: 'cmd-mora',
          sourceName: 'CMD Mora',
          licenseStatus: 'permitted',
        };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, true);
      });
    });
  });

  describe('Given a published record whose permission depends on attribution', () => {
    describe('When the package is parsed', () => {
      it('fails for a permitted exercise without attribution', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[0].provenance = {
          kind: 'original',
          sourceName: 'CMD Mora',
          licenseStatus: 'permitted',
        };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'exercises.0.provenance.attribution');

        assert.ok(
          issue,
          `Expected exercises.0.provenance.attribution in ${issuePaths(result.issues)}`,
        );
        assert.match(issue.message, /licenseStatus "permitted" requires an attribution/);
      });

      it('fails for a cmd-mora exercise without attribution', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[0].provenance = {
          kind: 'cmd-mora',
          sourceName: 'CMD Mora',
          licenseStatus: 'permitted',
        };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        assert.ok(
          findIssue(result.issues, 'exercises.0.provenance.attribution'),
          `Expected exercises.0.provenance.attribution in ${issuePaths(result.issues)}`,
        );
      });

      it('fails for a permitted programming record without attribution', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.programming[0].provenance = {
          kind: 'cmd-mora',
          sourceName: 'CMD Mora',
          licenseStatus: 'permitted',
        };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        assert.ok(
          findIssue(result.issues, 'programming.0.provenance.attribution'),
          `Expected programming.0.provenance.attribution in ${issuePaths(result.issues)}`,
        );
      });

      it('accepts the same record once attribution is present', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[0].provenance = {
          kind: 'cmd-mora',
          sourceName: 'CMD Mora',
          licenseStatus: 'permitted',
          attribution: 'CMD Mora',
        };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, true);
      });

      it('keeps a published original owned record valid without attribution', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.exercises[0].provenance = {
          kind: 'original',
          sourceName: 'Futsal Manager AI',
          licenseStatus: 'owned',
        };

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, true);
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
        assert.match(issue.message, /contentVersion must be "1\.1\.0"/);
      });

      it('rejects the previous 1.0.0 package version', () => {
        const contentPackage = cloneValidPackage();
        contentPackage.contentVersion = '1.0.0';

        const result = safeParseContentPackage(contentPackage);

        assert.equal(result.success, false);
        if (result.success) {
          return;
        }

        const issue = findIssue(result.issues, 'contentVersion');

        assert.ok(issue, `Expected contentVersion in ${issuePaths(result.issues)}`);
        assert.match(issue.message, /contentVersion must be "1\.1\.0"/);
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
