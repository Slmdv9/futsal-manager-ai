import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip, type ChipVariant } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import type { SessionPart } from '../../domain/session-part';
import { formatExerciseMeta } from '../view-models/category-browse-model';
import {
  formatWeeklySelection,
  type WeeklyExercise,
} from '../view-models/explore-general-model';

type WeeklyExercisesProps = {
  exercises: readonly WeeklyExercise[];
  totalCount: number;
};

const PART_CHIP_VARIANTS: Record<SessionPart, ChipVariant> = {
  'warm-up': 'press-trigger',
  main: 'defending',
  'cool-down': 'neutral',
};

export function WeeklyExercises({ exercises }: WeeklyExercisesProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="headlineSm" accessibilityRole="header">
            Ejercicios de la Semana
          </AppText>
          <AppText variant="bodySm" color="textVariant">
            Una selección fuera de la biblioteca
          </AppText>
        </View>
        <AppText variant="labelMd" color="primary">
          {formatWeeklySelection(exercises.length)}
        </AppText>
      </View>
      {exercises.length === 0 ? (
        <AppText variant="bodyMd" color="textVariant">
          Todavía no hay ejercicios para esta categoría.
        </AppText>
      ) : (
        exercises.map(({ part, label, exercise }) => (
          <Card key={exercise.id}>
            <View style={styles.cardContent}>
              <Chip label={label.toUpperCase()} variant={PART_CHIP_VARIANTS[part]} />
              <AppText variant="headlineSm" numberOfLines={2}>
                {exercise.title}
              </AppText>
              <AppText variant="bodySm" color="textVariant" numberOfLines={2}>
                {exercise.summary}
              </AppText>
              <AppText variant="labelMd" color="textVariant">
                {formatExerciseMeta(exercise)}
              </AppText>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flexShrink: 1,
    gap: spacing['2xs'],
  },
  cardContent: {
    gap: spacing.sm,
  },
});
