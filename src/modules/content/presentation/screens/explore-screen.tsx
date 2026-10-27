import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, SectionPlaceholder } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import { listCategories } from '../../application/list-categories';
import type { ContentRepository } from '../../domain/ports/content-repository';
import { CategoryFilterBar } from '../components/category-filter-bar';
import { ExerciseLibraryList } from '../components/exercise-library-list';
import { ProgrammingSummaryCard } from '../components/programming-summary-card';
import { useCategorySelection } from '../state/category-selection-provider';
import { buildCategoryBrowseModel } from '../view-models/category-browse-model';

type ExploreScreenProps = {
  repository: ContentRepository;
};

export function ExploreScreen({ repository }: ExploreScreenProps) {
  const { selectedCategory, selectCategory } = useCategorySelection();
  const categories = listCategories();
  const browseModel = selectedCategory
    ? buildCategoryBrowseModel(repository, selectedCategory)
    : null;

  return (
    <SectionPlaceholder
      eyebrow="Futsal Manager AI"
      title="Explorar"
      description="Programación semanal y ejercicios por categoría para tus sesiones."
    >
      <View style={styles.content}>
        <CategoryFilterBar
          categories={categories}
          selectedCategoryId={selectedCategory?.id ?? null}
          onSelect={selectCategory}
        />
        {browseModel ? (
          <>
            <ProgrammingSummaryCard
              category={browseModel.category}
              programming={browseModel.programming}
            />
            <ExerciseLibraryList exercises={browseModel.exercises} />
          </>
        ) : (
          <View style={styles.prompt}>
            <AppText variant="headlineSm">Elige una categoría</AppText>
            <AppText variant="bodyMd" color="textVariant">
              Selecciona un tramo RFEF para ver su programación y su biblioteca de
              ejercicios.
            </AppText>
          </View>
        )}
      </View>
      <Link href="/design-system" asChild>
        <AppButton label="Ver sistema de diseño" variant="secondary" fullWidth />
      </Link>
    </SectionPlaceholder>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  prompt: {
    gap: spacing.sm,
  },
});
