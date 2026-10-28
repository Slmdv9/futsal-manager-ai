import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const routeSource = readFileSync(
  new URL('../../../../src/app/ejercicios/[exerciseId].tsx', import.meta.url),
  'utf8',
);

const rootLayoutSource = readFileSync(
  new URL('../../../../src/app/_layout.tsx', import.meta.url),
  'utf8',
);

describe('Exercise detail route wiring', () => {
  describe('Given the exercise detail route', () => {
    describe('When it resolves the exercise parameter', () => {
      it('then it normalizes exerciseId and resolves it through getExercise', () => {
        assert.match(
          routeSource,
          /useLocalSearchParams<\{ exerciseId\?: string \| string\[\] \}>\(\)/,
        );
        assert.match(routeSource, /params\.exerciseId/);
        assert.match(
          routeSource,
          /Array\.isArray\(params\.exerciseId\) \? params\.exerciseId\[0\] : params\.exerciseId/,
        );
        assert.match(routeSource, /getExercise\(repository, exerciseId\)/);
      });

      it('then it passes the publishable exercise or null to the screen', () => {
        assert.match(
          routeSource,
          /const exercise = exerciseId \? getExercise\(repository, exerciseId\) : null/,
        );
        assert.match(
          routeSource,
          /<ExerciseDetailScreen exercise=\{exercise\} \/>/,
        );
      });
    });

    describe('When its imports and behavior are inspected', () => {
      it('then it uses only the content public API and the bundled repository factory', () => {
        assert.match(
          routeSource,
          /import\s*\{[^}]*ExerciseDetailScreen[^}]*createBundledContentRepository[^}]*getExercise[^}]*\}\s*from\s*'@\/modules\/content';/,
        );
        assert.match(routeSource, /const repository = createBundledContentRepository\(\)/);
        assert.doesNotMatch(routeSource, /@\/modules\/content\//);
        assert.doesNotMatch(routeSource, /fetch\(/);
        assert.doesNotMatch(routeSource, /\.json['"]/);
        assert.doesNotMatch(routeSource, /isPublishableExercise/);
        assert.doesNotMatch(routeSource, /parseContentPackage|parseBoardData/);
      });
    });
  });

  describe('Given the root layout', () => {
    describe('When the root Stack is inspected', () => {
      it('then it registers the exercise detail route inside the root stack', () => {
        assert.match(
          rootLayoutSource,
          /<Stack\.Screen name="ejercicios\/\[exerciseId\]" \/>/,
        );
        assert.equal(
          rootLayoutSource.indexOf('<Stack.Screen name="ejercicios/[exerciseId]" />') >
            rootLayoutSource.indexOf('<Stack screenOptions={{ headerShown: false }}>'),
          true,
        );
        assert.equal(
          rootLayoutSource.indexOf('<Stack.Screen name="ejercicios/[exerciseId]" />') <
            rootLayoutSource.indexOf('<Stack.Screen name="design-system" />'),
          true,
        );
      });
    });
  });
});
