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
  'listLibraryExercises',
  'listWeeklyHighlights',
  'EXERCISE_COLLECTIONS',
  'ExerciseCollection',
  'ExerciseReference',
  'getExercise',
  'getProgramming',
  'createBundledContentRepository',
  'buildBoardHref',
  'buildBoardExerciseTarget',
  'BoardExerciseTargetData',
  'buildExerciseDetailHref',
  'buildExerciseDetailModel',
  'ExerciseDetailHref',
  'ExerciseDetailModel',
  'ExerciseDetailPhase',
  'ExerciseDetailRow',
  'ExerciseDetailScreen',
  'PUBLISHABLE_LICENSE_STATUSES',
  'PublishableLicenseStatus',
  'isPublishableProvenance',
  'requiresAttribution',
  'isLicenseStatusAllowedForKind',
  'isPublishableExercise',
  'isPublishableProgramming',
  'ExploreScreen',
  'CategorySelectionProvider',
  'useCategorySelection',
  'buildCategoryBrowseModel',
  'formatCategoryLabel',
  'formatExerciseMeta',
  'formatSessionDuration',
  'formatExerciseCount',
  'formatSessionPartLabel',
  'groupExercisesBySessionPart',
  'SessionPartGroup',
  'SESSION_PARTS',
  'selectCategory',
  'INITIAL_CATEGORY_SELECTION',
  'buildExploreGeneralModel',
  'buildExploreStats',
  'buildWeeklyExercises',
  'buildMethodologyOverview',
  'formatWeeklySelection',
  'WEEKLY_EXERCISES_PER_PART',
  'METHODOLOGY_KEY_CONCEPTS_LIMIT',
  'ExploreGeneralModel',
  'WeeklyExercise',
  'MethodologyOverview',
  'ExploreStats',
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
