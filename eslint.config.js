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
        { type: 'shared', pattern: 'src/shared', partialMatch: false },
      ],
      'boundaries/files': [{ pattern: 'tests/**/*.test.ts', category: 'test' }],
    },
    rules: {
      'boundaries/dependencies': [
        2,
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'shared' } },
              disallow: { to: { element: { types: ['app', ...moduleTypes] } } },
              message: 'Shared code cannot depend on app routes or business modules.',
            },
            {
              from: { element: { types: ['app', ...moduleTypes] } },
              disallow: { to: { element: { type: 'app' } } },
              message: 'Only app routes may depend on other app routes.',
            },
            {
              from: { element: { type: 'app' } },
              disallow: { to: { element: { types: moduleLayers } } },
              message: 'Import a module through its public API: @/modules/<module>.',
            },
            {
              from: { element: { types: ['module', ...moduleLayers] } },
              disallow: { to: { element: { type: 'app' } } },
              message: 'Business modules cannot depend on app routes.',
            },
            {
              from: { element: { types: [...moduleLayers] } },
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
              disallow: {
                to: {
                  element: {
                    type: 'module',
                    captured: { module: '!{{ from.element.captured.module }}' },
                  },
                },
              },
              message: 'Domain cannot depend on another module; use a shared contract.',
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
