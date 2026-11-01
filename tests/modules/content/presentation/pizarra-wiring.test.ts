import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const pizarraRouteSource = readFileSync(
  new URL('../../../../src/app/(tabs)/pizarra.tsx', import.meta.url),
  'utf8',
);

describe('Pizarra route wiring', () => {
  describe('Given the Pizarra route', () => {
    describe('When it resolves the exercise parameter', () => {
      it('then it reads exerciseId with useLocalSearchParams and resolves it through getExercise', () => {
        assert.match(
          pizarraRouteSource,
          /useLocalSearchParams<\{ exerciseId\?: string \| string\[\] \}>\(\)/,
        );
        assert.match(pizarraRouteSource, /params\.exerciseId/);
        assert.match(
          pizarraRouteSource,
          /Array\.isArray\(params\.exerciseId\) \? params\.exerciseId\[0\] : params\.exerciseId/,
        );
        assert.match(pizarraRouteSource, /getExercise\(repository, exerciseId\)/);
      });

      it('then it passes the mapped target to BoardScreen and falls back to null', () => {
        assert.match(
          pizarraRouteSource,
          /<BoardScreen exercise=\{exercise \? buildBoardExerciseTarget\(exercise\) : null\} \/>/,
        );
      });
    });

    describe('When its imports and behavior are inspected', () => {
      it('then it uses only the board and content public APIs and the bundled repository factory', () => {
        assert.match(
          pizarraRouteSource,
          /import\s*\{\s*BoardScreen\s*\}\s*from\s*'@\/modules\/board';/,
        );
        assert.match(
          pizarraRouteSource,
          /import\s*\{[^}]*buildBoardExerciseTarget[^}]*createBundledContentRepository[^}]*getExercise[^}]*\}\s*from\s*'@\/modules\/content';/,
        );
        assert.match(
          pizarraRouteSource,
          /const repository = createBundledContentRepository\(\)/,
        );
        assert.doesNotMatch(pizarraRouteSource, /@\/modules\/(content|board)\//);
      });

      it('then it never fetches, reads JSON or adds a business rule', () => {
        assert.doesNotMatch(pizarraRouteSource, /fetch\(/);
        assert.doesNotMatch(pizarraRouteSource, /\.json['"]/);
        assert.doesNotMatch(pizarraRouteSource, /isPublishableExercise/);
        assert.doesNotMatch(pizarraRouteSource, /parseContentPackage|parseBoardData/);
        assert.doesNotMatch(pizarraRouteSource, /\.filter\(|\.map\(/);
      });
    });
  });
});
