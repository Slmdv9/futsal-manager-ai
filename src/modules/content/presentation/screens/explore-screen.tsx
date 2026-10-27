import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppText, Card } from '@/shared/ui';
import { colors, radius, spacing } from '@/shared/theme';
import { listCategories } from '../../application/list-categories';
import type { ContentRepository } from '../../domain/ports/content-repository';
import { AiSessionEntryCard } from '../components/ai-session-entry-card';
import { CategoryFilterBar } from '../components/category-filter-bar';
import { ExerciseLibraryList } from '../components/exercise-library-list';
import { ExploreHero } from '../components/explore-hero';
import { MethodologyOverviewCard } from '../components/methodology-overview-card';
import { WeeklyExercises } from '../components/weekly-exercises';
import { useCategorySelection } from '../state/category-selection-provider';
import { buildCategoryBrowseModel } from '../view-models/category-browse-model';
import { buildExploreGeneralModel } from '../view-models/explore-general-model';

type ExploreScreenProps = {
  repository: ContentRepository;
};

export function ExploreScreen({ repository }: ExploreScreenProps) {
  const { selectedCategory, selectCategory } = useCategorySelection();
  const categories = listCategories();
  const generalModel = buildExploreGeneralModel(repository, selectedCategory);
  const browseModel = selectedCategory
    ? buildCategoryBrowseModel(repository, selectedCategory)
    : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.appBar}>
          <View style={styles.brandMark}>
            <AppText variant="labelMd" color="onPrimary">
              FM
            </AppText>
          </View>
          <AppText variant="headlineSm" accessibilityRole="header">
            Futsal Manager AI
          </AppText>
        </View>
        <ExploreHero stats={generalModel.stats} />
        <CategoryFilterBar
          categories={categories}
          selectedCategoryId={selectedCategory?.id ?? null}
          onSelect={selectCategory}
        />
        <AiSessionEntryCard />
        {browseModel ? (
          <>
            <MethodologyOverviewCard
              category={browseModel.category}
              methodology={generalModel.methodology}
            />
            <WeeklyExercises
              exercises={generalModel.weeklyExercises}
              totalCount={browseModel.exercises.length}
            />
            <ExerciseLibraryList groups={browseModel.sessionParts} />
          </>
        ) : (
          <Card>
            <View style={styles.prompt}>
              <AppText variant="headlineSm" accessibilityRole="header">
                Elige una categoría
              </AppText>
              <AppText variant="bodyMd" color="textVariant">
                Selecciona un tramo RFEF para ver su programación y su biblioteca de
                ejercicios.
              </AppText>
            </View>
          </Card>
        )}
        <Link href="/design-system" asChild>
          <AppButton label="Ver sistema de diseño" variant="secondary" fullWidth />
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  prompt: {
    gap: spacing.sm,
  },
});
