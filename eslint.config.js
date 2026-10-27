const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');

const moduleLayers = [
  'module-domain',
  'module-application',
  'module-infrastructure',
  'module-presentation',
];
const moduleTypes = ['module', ...moduleLayers];
const sharedTypes = ['shared', 'shared-domain', 'shared-theme', 'shared-ui'];
const moduleNames = ['content', 'board', 'ai', 'club'];
const allowedModuleDependencies = {
  content: [],
  board: [],
  ai: ['content'],
  club: [],
};

const crossModulePolicies = moduleNames.flatMap((sourceModule) =>
  moduleNames
    .filter(
      (targetModule) =>
        targetModule !== sourceModule &&
        !allowedModuleDependencies[sourceModule].includes(targetModule),
    )
    .map((targetModule) => ({
      from: {
        element: {
          types: moduleTypes,
          captured: { module: sourceModule },
        },
      },
      disallow: {
        to: { element: { type: 'module', captured: { module: targetModule } } },
      },
      message: `${sourceModule} cannot import the ${targetModule} module public API; allowed dependencies are listed in ARCHITECTURE.md.`,
    })),
);

const selfPublicImportPolicies = moduleNames.map((moduleName) => ({
  from: {
    element: { types: moduleLayers, captured: { module: moduleName } },
  },
  disallow: {
    to: { element: { type: 'module', captured: { module: moduleName } } },
  },
  message: `${moduleName} layers cannot import the ${moduleName} public API; import the owning layer directly.`,
}));

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app', partialMatch: false },
        {
          type: 'module-domain',
          pattern: 'src/modules/*/domain',
          capture: ['module'],
          partialMatch: false,
        },
        {
          type: 'module-application',
          pattern: 'src/modules/*/application',
          capture: ['module'],
          partialMatch: false,
        },
        {
          type: 'module-infrastructure',
          pattern: 'src/modules/*/infrastructure',
          capture: ['module'],
          partialMatch: false,
        },
        {
          type: 'module-presentation',
          pattern: 'src/modules/*/presentation',
          capture: ['module'],
          partialMatch: false,
        },
        {
          type: 'module',
          pattern: 'src/modules/*',
          capture: ['module'],
          partialMatch: false,
        },
        { type: 'shared-domain', pattern: 'src/shared/domain', partialMatch: false },
        { type: 'shared-theme', pattern: 'src/shared/theme', partialMatch: false },
        { type: 'shared-ui', pattern: 'src/shared/ui', partialMatch: false },
        { type: 'shared', pattern: 'src/shared', partialMatch: false },
      ],
      'boundaries/files': [
        { pattern: 'tests/**/*.test.ts', category: 'test' },
        { pattern: 'tests/**/*.test.tsx', category: 'test' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        2,
        {
          default: 'allow',
          policies: [
            {
              from: { element: { types: sharedTypes } },
              disallow: { to: { element: { types: ['app', ...moduleTypes] } } },
              message: 'Shared code cannot depend on app routes or business modules.',
            },
            {
              from: { element: { types: moduleTypes } },
              disallow: { to: { element: { type: 'app' } } },
              message: 'Business modules cannot depend on app routes.',
            },
            {
              from: { element: { type: 'app' } },
              disallow: { to: { element: { types: moduleLayers } } },
              message: 'Import a module through its public API: @/modules/<module>.',
            },
            {
              from: { element: { types: moduleLayers } },
              disallow: {
                to: {
                  element: {
                    types: moduleLayers,
                    captured: { module: '!{{ from.element.captured.module }}' },
                  },
                },
              },
              message: 'Import another module through its public API, never through its layers.',
            },
            {
              from: { element: { type: 'module' } },
              disallow: {
                to: {
                  element: {
                    types: moduleLayers,
                    captured: { module: '!{{ from.element.captured.module }}' },
                  },
                },
              },
              message: 'A module public API cannot re-export another module internals.',
            },
            {
              from: { element: { type: 'module-domain' } },
              disallow: {
                to: {
                  element: {
                    types: ['module-application', 'module-infrastructure', 'module-presentation'],
                  },
                },
              },
              message: 'Domain cannot depend on application, infrastructure, or presentation.',
            },
            {
              from: { element: { type: 'module-domain' } },
              disallow: { to: { element: { type: 'module' } } },
              message: 'Domain cannot depend on a module public API; use shared/domain.',
            },
            {
              from: { element: { types: ['module-domain', 'shared-domain'] } },
              disallow: {
                to: { element: { types: ['shared', 'shared-theme', 'shared-ui'] } },
              },
              message:
                'Domain code may only import shared/domain; shared/theme and shared/ui are outer-layer dependencies.',
            },
            {
              from: { element: { type: 'module-application' } },
              disallow: {
                to: { element: { types: ['module-infrastructure', 'module-presentation'] } },
              },
              message: 'Application cannot depend on adapters or UI.',
            },
            {
              from: { element: { type: 'module-presentation' } },
              disallow: { to: { element: { type: 'module-infrastructure' } } },
              message: 'Presentation cannot depend on infrastructure; wire adapters in app.',
            },
            ...crossModulePolicies,
            ...selfPublicImportPolicies,
            {
              from: { element: { type: '*' } },
              disallow: { to: { file: { categories: 'test' } } },
              message: 'Production code cannot import test files.',
            },
          ],
        },
      ],
    },
  },
]);
