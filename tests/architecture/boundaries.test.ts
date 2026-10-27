import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint({ cwd: process.cwd() });

type Probe = {
  name: string;
  filePath: string;
  source: string;
  expected: 'pass' | 'fail';
  message?: RegExp;
};

const probes: Probe[] = [
  {
    name: 'shared code importing a business module',
    filePath: 'src/shared/ui/__probe-shared-to-module.ts',
    source: "import { ExploreScreen } from '@/modules/content';\nexport const probe = ExploreScreen;\n",
    expected: 'fail',
    message: /Shared code cannot depend on app routes or business modules/,
  },
  {
    name: 'board importing content public API',
    filePath: 'src/modules/board/presentation/screens/__probe-board-to-content.tsx',
    source: "import { ExploreScreen } from '@/modules/content';\nexport const probe = ExploreScreen;\n",
    expected: 'fail',
    message: /board cannot import the content module public API/,
  },
  {
    name: 'content application importing board public API',
    filePath: 'src/modules/content/application/__probe-content-app-to-board.ts',
    source: "import { BoardScreen } from '@/modules/board';\nexport const probe = BoardScreen;\n",
    expected: 'fail',
    message: /content cannot import the board module public API/,
  },
  {
    name: 'content domain importing its own public API',
    filePath: 'src/modules/content/domain/__probe-content-domain-to-own-public.ts',
    source: "import { ExploreScreen } from '@/modules/content';\nexport const probe = ExploreScreen;\n",
    expected: 'fail',
  },
  {
    name: 'content domain importing shared/ui',
    filePath: 'src/modules/content/domain/__probe-content-domain-to-shared-ui.ts',
    source: "import { AppText } from '@/shared/ui';\nexport const probe = AppText;\n",
    expected: 'fail',
    message: /Domain code may only import shared\/domain/,
  },
  {
    name: 'content domain importing shared/theme',
    filePath: 'src/modules/content/domain/__probe-content-domain-to-shared-theme.ts',
    source: "import { colors } from '@/shared/theme';\nexport const probe = colors;\n",
    expected: 'fail',
    message: /Domain code may only import shared\/domain/,
  },
  {
    name: 'shared domain importing shared/ui',
    filePath: 'src/shared/domain/__probe-shared-domain-to-ui.ts',
    source: "import { AppText } from '@/shared/ui';\nexport const probe = AppText;\n",
    expected: 'fail',
    message: /Domain code may only import shared\/domain/,
  },
  {
    name: 'ai importing board public API',
    filePath: 'src/modules/ai/application/__probe-ai-to-board.ts',
    source: "import { BoardScreen } from '@/modules/board';\nexport const probe = BoardScreen;\n",
    expected: 'fail',
    message: /ai cannot import the board module public API/,
  },
  {
    name: 'club importing ai public API',
    filePath: 'src/modules/club/application/__probe-club-to-ai.ts',
    source: "import { AssistantScreen } from '@/modules/ai';\nexport const probe = AssistantScreen;\n",
    expected: 'fail',
    message: /club cannot import the ai module public API/,
  },
  {
    name: 'ai application importing content public API',
    filePath: 'src/modules/ai/application/__probe-ai-to-content.ts',
    source: "import { ExploreScreen } from '@/modules/content';\nexport const probe = ExploreScreen;\n",
    expected: 'pass',
  },
  {
    name: 'board presentation importing shared/ui',
    filePath: 'src/modules/board/presentation/screens/__probe-board-to-shared-ui.tsx',
    source: "import { AppText } from '@/shared/ui';\nexport const probe = AppText;\n",
    expected: 'pass',
  },
  {
    name: 'app route importing a module public API',
    filePath: 'src/app/__probe-app-to-module.tsx',
    source: "import { ExploreScreen } from '@/modules/content';\nexport const probe = ExploreScreen;\n",
    expected: 'pass',
  },
];

async function lint(probe: Probe) {
  const [result] = await eslint.lintText(probe.source, {
    filePath: probe.filePath,
    warnIgnored: false,
  });
  return result?.messages ?? [];
}

describe('Given the ESLint architecture boundaries', () => {
  describe('When production code imports across module or shared layers', () => {
    it('then allowed imports pass and forbidden imports fail with an architecture message', async () => {
      for (const probe of probes) {
        const messages = await lint(probe);
        const errors = messages.filter((message) => message.severity === 2);
        const boundaryErrors = errors.filter((message) => message.ruleId === 'boundaries/dependencies');

        if (probe.expected === 'pass') {
          assert.equal(
            errors.length,
            0,
            `${probe.name} should pass but produced: ${JSON.stringify(errors.map((m) => m.message))}`,
          );
          continue;
        }

        assert.ok(
          boundaryErrors.length > 0,
          `${probe.name} should fail the boundaries rule but produced: ${JSON.stringify(messages.map((m) => `${m.ruleId}: ${m.message}`))}`,
        );

        if (probe.message) {
          assert.ok(
            boundaryErrors.some((message) => probe.message!.test(message.message)),
            `${probe.name} should mention ${probe.message} but produced: ${JSON.stringify(boundaryErrors.map((m) => m.message))}`,
          );
        }
      }
    });
  });
});
