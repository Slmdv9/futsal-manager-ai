import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const publicApiSource = readFileSync(
  new URL('../../../src/modules/content/index.ts', import.meta.url),
  'utf8',
);

const requiredPublicApiExports = [
  'CATEGORIES',
  'CATEGORY_IDS',
  'getCategoryById',
  'isCategoryId',
  'parseContentPackage',
  'safeParseContentPackage',
  'ContentValidationError',
  'CONTENT_PACKAGE_VERSION',
  'ContentRepository',
  'listCategories',
  'listExercises',
  'getExercise',
  'getProgramming',
  'createBundledContentRepository',
  'ExploreScreen',
];

describe('Content public API', () => {
  describe('Given the content module public API', () => {
    describe('When a route or another module imports @/modules/content', () => {
      it('then it exposes the categories, parser, port, use cases, factory, and Explorar screen', () => {
        for (const exportName of requiredPublicApiExports) {
          assert.match(
            publicApiSource,
            new RegExp(`\\b${exportName}\\b`),
            `Expected the content public API to export ${exportName}.`,
          );
        }
      });
    });
  });
});
