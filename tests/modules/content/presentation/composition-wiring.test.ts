import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const rootLayoutSource = readFileSync(
  new URL('../../../../src/app/_layout.tsx', import.meta.url),
  'utf8',
);
const exploreRouteSource = readFileSync(
  new URL('../../../../src/app/(tabs)/index.tsx', import.meta.url),
  'utf8',
);

describe('Category filter composition wiring', () => {
  describe('Given the root layout', () => {
    describe('When the app renders the stack', () => {
      it('then it mounts CategorySelectionProvider imported from the content public API', () => {
        assert.match(
          rootLayoutSource,
          /import\s*\{[^}]*CategorySelectionProvider[^}]*\}\s*from\s*'@\/modules\/content'/,
        );
        assert.match(
          rootLayoutSource,
          /<CategorySelectionProvider>[\s\S]*<Stack[\s\S]*<\/Stack>[\s\S]*<\/CategorySelectionProvider>/,
        );
      });
    });
  });

  describe('Given the Explorar route', () => {
    describe('When the route renders', () => {
      it('then it creates the bundled repository from the content public API and passes it to ExploreScreen', () => {
        assert.match(
          exploreRouteSource,
          /import\s*\{[^}]*createBundledContentRepository[^}]*\}\s*from\s*'@\/modules\/content'/,
        );
        assert.match(
          exploreRouteSource,
          /const\s+repository\s*=\s*createBundledContentRepository\(\)/,
        );
        assert.match(
          exploreRouteSource,
          /<ExploreScreen\s+repository=\{repository\}\s*\/>/,
        );
      });

      it('then the route references no module internal path or JSON file', () => {
        assert.doesNotMatch(exploreRouteSource, /@\/modules\/content\//);
        assert.doesNotMatch(exploreRouteSource, /\.json['"]/);
      });
    });
  });
});
