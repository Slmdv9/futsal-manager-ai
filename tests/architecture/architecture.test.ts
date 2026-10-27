import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const root = process.cwd();
const moduleRoot = join(root, 'src/modules');
const sharedRoot = join(root, 'src/shared');
const layers = ['domain', 'application', 'infrastructure', 'presentation'] as const;
const expectedModules = ['ai', 'board', 'club', 'content'] as const;

describe('Modular hexagonal architecture', () => {
  describe('Given the source tree', () => {
    describe('When the business modules are inspected', () => {
      it('then every module exposes the four layers and a public API', () => {
        const modules = readdirSync(moduleRoot, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .sort();

        assert.deepEqual(modules, [...expectedModules].sort());

        for (const moduleName of expectedModules) {
          const modulePath = join(moduleRoot, moduleName);

          for (const layer of layers) {
            assert.ok(
              existsSync(join(modulePath, layer)),
              `${moduleName} is missing the ${layer} layer.`,
            );
          }

          assert.ok(
            existsSync(join(modulePath, 'index.ts')),
            `${moduleName} is missing its public API.`,
          );
        }
      });
    });

    describe('When the shared tree is inspected', () => {
      it('then shared owns the Board Data kernel, theme, and UI', () => {
        assert.ok(existsSync(join(sharedRoot, 'domain/board-data')));
        assert.ok(existsSync(join(sharedRoot, 'theme/index.ts')));
        assert.ok(existsSync(join(sharedRoot, 'ui/index.ts')));
      });
    });

    describe('When the test tree is inspected', () => {
      it('then it mirrors the modules, shared areas, and architecture checks', () => {
        for (const moduleName of expectedModules) {
          assert.ok(
            existsSync(join(root, 'tests/modules', moduleName)),
            `tests/modules/${moduleName} is missing its mirrored folder.`,
          );
        }

        assert.ok(existsSync(join(root, 'tests/shared/domain')));
        assert.ok(existsSync(join(root, 'tests/shared/theme')));
        assert.ok(existsSync(join(root, 'tests/shared/ui')));
        assert.ok(existsSync(join(root, 'tests/architecture')));
      });
    });

    describe('When the legacy top-level folders are checked', () => {
      it('then components, content, and theme no longer live outside modules or shared', () => {
        assert.equal(existsSync(join(root, 'src/components')), false);
        assert.equal(existsSync(join(root, 'src/content')), false);
        assert.equal(existsSync(join(root, 'src/theme')), false);
      });
    });
  });
});
