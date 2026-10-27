import { StyleSheet, View } from 'react-native';
import { AppText, Card } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import type { Exercise } from '../../domain/exercise';
import {
  formatExerciseCount,
  formatExerciseMeta,
} from '../view-models/category-browse-model';

type ExerciseLibraryListProps = {
  exercises: readonly Exercise[];
};

export function ExerciseLibraryList({ exercises }: ExerciseLibraryListProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <AppText variant="headlineSm">Biblioteca de ejercicios</AppText>
        <AppText variant="labelMd" color="textVariant">
          {formatExerciseCount(exercises.length)}
        </AppText>
      </View>
      {exercises.length === 0 ? (
        <AppText variant="bodyMd" color="textVariant">
          Todavía no hay ejercicios para esta categoría.
        </AppText>
      ) : (
        exercises.map((exercise) => (
          <Card key={exercise.id}>
            <View style={styles.cardContent}>
              <AppText variant="headlineSm">{exercise.title}</AppText>
              <AppText variant="bodyMd" color="textVariant">
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardContent: {
    gap: spacing.sm,
  },
});
