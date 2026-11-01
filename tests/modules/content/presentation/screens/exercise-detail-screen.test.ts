import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const presentationRoot = new URL(
  '../../../../../src/modules/content/presentation/',
  import.meta.url,
);

const exerciseDetailScreenSource = readFileSync(
  new URL('screens/exercise-detail-screen.tsx', presentationRoot),
  'utf8',
);

function expectationIndex(source: string, value: string): number {
  const index = source.indexOf(value);

  assert.notEqual(index, -1, `Expected the source to contain ${value}.`);

  return index;
}

describe('Exercise detail screen structure', () => {
  describe('Given the detail screen source', () => {
    describe('When the section composition is inspected', () => {
      it('then the top bar and sections keep the pinned order', () => {
        const order = [
          'Volver a Explorar',
          'Detalle de ejercicio',
          'Objetivo',
          'Ficha del ejercicio',
          'Restricciones',
          'Paso a paso',
          'Consignas para el entrenador',
          'Inspirado en',
          'Atribución',
        ].map((value) => expectationIndex(exerciseDetailScreenSource, value));

        assert.deepEqual(
          [...order].sort((left, right) => left - right),
          order,
        );
      });
    });

    describe('When the fact rows and phases are inspected', () => {
      it('then the seven fact rows render from model.facts without re-derivation', () => {
        assert.match(exerciseDetailScreenSource, /model\.facts\.map\(/);
        assert.match(exerciseDetailScreenSource, /\{fact\.label\}/);
        assert.match(exerciseDetailScreenSource, /\{fact\.value\}/);
        assert.doesNotMatch(exerciseDetailScreenSource, /format[A-Z]\w*\(/);
      });

      it('then the phases render number, title and explanation in model order', () => {
        assert.match(exerciseDetailScreenSource, /model\.phases\.map\(/);
        assert.match(exerciseDetailScreenSource, /\{phase\.order\}/);
        assert.match(exerciseDetailScreenSource, /\{phase\.title\}/);
        assert.match(exerciseDetailScreenSource, /\{phase\.explanation\}/);
        assert.doesNotMatch(exerciseDetailScreenSource, /positions/);
        assert.doesNotMatch(exerciseDetailScreenSource, /\bball\b/);
        assert.doesNotMatch(exerciseDetailScreenSource, /arrows/);
        assert.doesNotMatch(exerciseDetailScreenSource, /\blabels\b/);
      });
    });

    describe('When the conditional sections are inspected', () => {
      it('then every optional card sits behind its non-empty guard', () => {
        assert.match(exerciseDetailScreenSource, /model\.constraints\.length > 0 \?/);
        assert.match(exerciseDetailScreenSource, /model\.coachingCues\.length > 0 \?/);
        assert.match(exerciseDetailScreenSource, /model\.references\.length > 0 \?/);
        assert.match(exerciseDetailScreenSource, /model\.attribution !== null \?/);
      });
    });

    describe('When the reference row is inspected', () => {
      it('then it opens the URL safely as an accessible 44 dp link with the disclaimer', () => {
        assert.match(
          exerciseDetailScreenSource,
          /Linking\.openURL\(reference\.url\)\.catch\(\(\) => \{\}\)/,
        );
        assert.match(exerciseDetailScreenSource, /accessibilityRole="link"/);
        assert.match(
          exerciseDetailScreenSource,
          /accessibilityLabel=\{`Abrir \$\{reference\.label\}`\}/,
        );
        assert.match(exerciseDetailScreenSource, /minHeight: 44/);
        assert.match(
          exerciseDetailScreenSource,
          /Ejercicio original de Futsal Manager AI\. La fuente se cita únicamente como inspiración\./,
        );
      });
    });

    describe('When the back control is inspected', () => {
      it('then it returns or replaces with Explorar and keeps the 44 dp accessible target', () => {
        assert.match(exerciseDetailScreenSource, /router\.canGoBack\(\)/);
        assert.match(exerciseDetailScreenSource, /router\.back\(\)/);
        assert.match(exerciseDetailScreenSource, /router\.replace\('\/'\)/);
        assert.match(exerciseDetailScreenSource, /accessibilityLabel="Volver a Explorar"/);
        assert.match(
          exerciseDetailScreenSource,
          /accessibilityHint="Vuelve a la pantalla de Explorar"/,
        );
        assert.match(exerciseDetailScreenSource, /minHeight: 44/);
      });
    });

    describe('When the not-found branch is inspected', () => {
      it('then it pins the empty state copy and the Explorar action', () => {
        assert.match(exerciseDetailScreenSource, /Ejercicio no encontrado/);
        assert.match(
          exerciseDetailScreenSource,
          /Este ejercicio no está disponible\. Puede que todavía no esté\s+publicado o que el enlace ya no exista\./,
        );
        assert.match(exerciseDetailScreenSource, /<Link href="\/" asChild>/);
        assert.match(exerciseDetailScreenSource, /label="Volver a Explorar"/);
        assert.match(exerciseDetailScreenSource, /variant="secondary"/);
        assert.match(exerciseDetailScreenSource, /fullWidth/);
      });
    });

    describe('When the source is scanned for out-of-scope behavior', () => {
      it('then there is no board, AI, fetch, hex colour or infrastructure reference', () => {
        assert.doesNotMatch(exerciseDetailScreenSource, /@\/modules\/board/);
        assert.doesNotMatch(exerciseDetailScreenSource, /react-native-svg/);
        assert.doesNotMatch(exerciseDetailScreenSource, /\bSvg\b/);
        assert.doesNotMatch(exerciseDetailScreenSource, /pitch/i);
        assert.doesNotMatch(exerciseDetailScreenSource, /boardData/);
        assert.doesNotMatch(exerciseDetailScreenSource, /@\/modules\/ai/);
        assert.doesNotMatch(exerciseDetailScreenSource, /fetch\(/);
        assert.doesNotMatch(exerciseDetailScreenSource, /#[0-9a-fA-F]{3,8}\b/);
        assert.doesNotMatch(exerciseDetailScreenSource, /content\/infrastructure/);
      });
    });
  });
});
