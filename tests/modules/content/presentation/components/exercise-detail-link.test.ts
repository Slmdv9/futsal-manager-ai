import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const presentationRoot = new URL(
  '../../../../../src/modules/content/presentation/',
  import.meta.url,
);

const exerciseDetailLinkSource = readFileSync(
  new URL('components/exercise-detail-link.tsx', presentationRoot),
  'utf8',
);

describe('Exercise detail link', () => {
  describe('Given the reusable card link source', () => {
    describe('When the link wrapper is inspected', () => {
      it('then it wraps one Pressable in a typed Link with asChild', () => {
        assert.equal(
          (
            exerciseDetailLinkSource.match(
              /<Link href=\{buildExerciseDetailHref\(exerciseId\)\} asChild>/g,
            ) ?? []
          ).length,
          1,
        );
        assert.match(
          exerciseDetailLinkSource,
          /<Link href=\{buildExerciseDetailHref\(exerciseId\)\} asChild>\s*<Pressable/,
        );
      });

      it('then the Pressable is an accessible link with the pinned copy', () => {
        assert.match(exerciseDetailLinkSource, /accessibilityRole="link"/);
        assert.match(
          exerciseDetailLinkSource,
          /accessibilityLabel=\{`Ver detalle de \$\{title\}`\}/,
        );
        assert.match(
          exerciseDetailLinkSource,
          /accessibilityHint="Abre la ficha completa de este ejercicio"/,
        );
      });

      it('then the visible Ver detalle label follows the card children', () => {
        assert.equal(
          exerciseDetailLinkSource.indexOf('{children}') <
            exerciseDetailLinkSource.lastIndexOf('Ver detalle'),
          true,
        );
      });
    });

    describe('When the tap target style is inspected', () => {
      it('then it pins the 44 dp target, the gap and the full width', () => {
        assert.match(exerciseDetailLinkSource, /minHeight: 44/);
        assert.match(exerciseDetailLinkSource, /gap: spacing\.sm/);
        assert.match(exerciseDetailLinkSource, /width: '100%'/);
      });
    });

    describe('When the source is scanned for out-of-scope behavior', () => {
      it('then it contains no board action, hex colour or infrastructure import', () => {
        assert.doesNotMatch(exerciseDetailLinkSource, /Abrir en Pizarra/);
        assert.doesNotMatch(exerciseDetailLinkSource, /buildBoardHref/);
        assert.doesNotMatch(exerciseDetailLinkSource, /@\/modules\/board/);
        assert.doesNotMatch(exerciseDetailLinkSource, /#[0-9a-fA-F]{3,8}\b/);
        assert.doesNotMatch(exerciseDetailLinkSource, /content\/infrastructure/);
      });
    });
  });
});
