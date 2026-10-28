import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const presentationRoot = new URL(
  '../../../../../src/modules/content/presentation/',
  import.meta.url,
);

function readPresentationFile(relativePath: string): string {
  return readFileSync(new URL(relativePath, presentationRoot), 'utf8');
}

const exploreScreenSource = readPresentationFile('screens/explore-screen.tsx');
const aiSessionEntryCardSource = readPresentationFile(
  'components/ai-session-entry-card.tsx',
);
const exploreHeroSource = readPresentationFile('components/explore-hero.tsx');
const methodologyOverviewCardSource = readPresentationFile(
  'components/methodology-overview-card.tsx',
);
const weeklyExercisesSource = readPresentationFile('components/weekly-exercises.tsx');
const categoryFilterBarSource = readPresentationFile('components/category-filter-bar.tsx');
const exerciseLibraryListSource = readPresentationFile(
  'components/exercise-library-list.tsx',
);
const exploreGeneralModelSource = readPresentationFile(
  'view-models/explore-general-model.ts',
);

const newOrChangedSources = [
  exploreScreenSource,
  aiSessionEntryCardSource,
  exploreHeroSource,
  methodologyOverviewCardSource,
  weeklyExercisesSource,
  categoryFilterBarSource,
  exerciseLibraryListSource,
  exploreGeneralModelSource,
];

function expectationIndex(source: string, value: string): number {
  const index = source.indexOf(value);

  assert.notEqual(index, -1, `Expected the source to contain ${value}.`);

  return index;
}

describe('Explore general screen structure', () => {
  describe('Given the Explorar screen source', () => {
    describe('When the JSX composition is inspected', () => {
      it('then it renders the hero, filter, AI card, methodology, weekly block, and library in prototype order', () => {
        const order = [
          '<ExploreHero',
          '<CategoryFilterBar',
          '<AiSessionEntryCard',
          '<MethodologyOverviewCard',
          '<WeeklyExercises',
          '<ExerciseLibraryList',
        ].map((tag) => expectationIndex(exploreScreenSource, tag));

        assert.deepEqual(
          [...order].sort((left, right) => left - right),
          order,
        );
      });

      it('then it retires ProgrammingSummaryCard and keeps the gallery link last', () => {
        assert.doesNotMatch(exploreScreenSource, /ProgrammingSummaryCard/);
        assert.doesNotMatch(exploreScreenSource, /programming-summary-card/);
        assert.match(exploreScreenSource, /href="\/design-system"/);
        assert.match(exploreScreenSource, /Ver sistema de diseño/);
        assert.equal(
          exploreScreenSource.indexOf('Ver sistema de diseño') >
            exploreScreenSource.indexOf('<ExerciseLibraryList'),
          true,
        );
      });

      it('then it keeps the accepted selection provider and prompt state', () => {
        assert.match(exploreScreenSource, /useCategorySelection\(\)/);
        assert.match(exploreScreenSource, /<CategoryFilterBar/);
        assert.match(exploreScreenSource, /Elige una categoría/);
        assert.match(
          exploreScreenSource,
          /Selecciona un tramo RFEF para ver su programación y su biblioteca de\s+ejercicios\./,
        );
        assert.doesNotMatch(exploreScreenSource, /SectionPlaceholder/);
        assert.match(exploreScreenSource, /SafeAreaView/);
      });
    });
  });

  describe('Given the AI session entry card source', () => {
    describe('When the action and placeholders are inspected', () => {
      it('then it links to the existing assistant tab through the pinned copy', () => {
        assert.match(aiSessionEntryCardSource, /href="\/asistente"/);
        assert.match(aiSessionEntryCardSource, /Abrir Asistente IA/);
        assert.match(aiSessionEntryCardSource, /PRÓXIMAMENTE/);
        assert.match(aiSessionEntryCardSource, /Pídele una sesión a la IA/);
        assert.match(aiSessionEntryCardSource, /Generador táctico en tiempo real/);
        assert.match(aiSessionEntryCardSource, /fullWidth/);
        assert.match(aiSessionEntryCardSource, /variant="ai"/);
      });

      it('then it contains no input, generate control, or AI module import', () => {
        assert.doesNotMatch(aiSessionEntryCardSource, /AppInput/);
        assert.doesNotMatch(aiSessionEntryCardSource, /Generar/);
        assert.doesNotMatch(aiSessionEntryCardSource, /modules\/ai/);
        assert.doesNotMatch(aiSessionEntryCardSource, /fetch\(/);
      });
    });
  });

  describe('Given the hero, methodology, and weekly sources', () => {
    describe('When the pinned Spanish copy and derived fields are inspected', () => {
      it('then the hero uses the anonymous framing and real stat labels', () => {
        assert.match(exploreHeroSource, /Acceso Libre para Entrenadores/);
        assert.match(exploreHeroSource, /SIN REGISTRO PREVIO/);
        assert.match(exploreHeroSource, /Ejercicios/);
        assert.match(exploreHeroSource, /Categorías/);
        assert.match(exploreHeroSource, /Abierto/);
        assert.doesNotMatch(exploreHeroSource, /180\+/);
      });

      it('then the filter label matches the prototype', () => {
        assert.match(categoryFilterBarSource, /CATEGORÍA \/ RANGO DE EDAD/);
        assert.doesNotMatch(categoryFilterBarSource, /Todas las Categorías/);
      });

      it('then the methodology card maps the programming fields and pinned empty states', () => {
        assert.match(methodologyOverviewCardSource, /methodology\.stage/);
        assert.match(methodologyOverviewCardSource, /methodology\.focus/);
        assert.match(methodologyOverviewCardSource, /methodology\.playModel/);
        assert.match(methodologyOverviewCardSource, /methodology\.sessionDurationLabel/);
        assert.match(methodologyOverviewCardSource, /Conceptos clave/);
        assert.match(
          methodologyOverviewCardSource,
          /La metodología de esta categoría estará disponible pronto\./,
        );
        assert.match(
          methodologyOverviewCardSource,
          /Elige una categoría para ver la metodología de su etapa\./,
        );
      });

      it('then the weekly block pins the library-independent subtitle and counter', () => {
        assert.match(weeklyExercisesSource, /Ejercicios de la Semana/);
        assert.match(weeklyExercisesSource, /Una selección fuera de la biblioteca/);
        assert.match(
          weeklyExercisesSource,
          /Todavía no hay ejercicios para esta categoría\./,
        );
        assert.match(weeklyExercisesSource, /formatWeeklySelection\(exercises\.length\)/);
        assert.doesNotMatch(weeklyExercisesSource, /formatWeeklySelection\([^)]*,/);
        assert.doesNotMatch(weeklyExercisesSource, /totalCount\b(?!:)/);
        assert.doesNotMatch(weeklyExercisesSource, /Ver Todos/);
      });

      it('then the library keeps the header role and the session groupings', () => {
        assert.match(exerciseLibraryListSource, /accessibilityRole="header"/);
        assert.match(exerciseLibraryListSource, /group\.label\.toUpperCase\(\)/);
        assert.match(exerciseLibraryListSource, /Sin ejercicios en este tramo\./);
      });
    });
  });

  describe('Given every new or changed presentation source', () => {
    describe('When they are scanned for forbidden content', () => {
      it('then there is no literal colour, infrastructure import, or dead prototype control', () => {
        for (const source of newOrChangedSources) {
          assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b/);
          assert.doesNotMatch(source, /content\/infrastructure/);
          assert.doesNotMatch(source, /Ver Pizarra Táctica/);
          assert.doesNotMatch(source, /Todas las Categorías/);
          assert.doesNotMatch(source, /Ver Todos/);
          assert.doesNotMatch(source, /180\+/);
        }
      });
    });
  });
});
