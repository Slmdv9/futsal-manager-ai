import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, Card } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import { buildBoardHref } from '../view-models/board-routing';
import {
  formatExerciseCount,
  formatExerciseMeta,
  type SessionPartGroup,
} from '../view-models/category-browse-model';
import { ExerciseDetailLink } from './exercise-detail-link';

type ExerciseLibraryListProps = {
  groups: readonly SessionPartGroup[];
};

export function ExerciseLibraryList({ groups }: ExerciseLibraryListProps) {
  const total = groups.reduce((count, group) => count + group.exercises.length, 0);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <AppText variant="headlineSm" accessibilityRole="header">
          Biblioteca de ejercicios
        </AppText>
        <AppText variant="labelMd" color="textVariant">
          {formatExerciseCount(total)}
        </AppText>
      </View>
      {total === 0 ? (
        <AppText variant="bodyMd" color="textVariant">
          Todavía no hay ejercicios para esta categoría.
        </AppText>
      ) : (
        groups.map((group) => (
          <View key={group.part} style={styles.group}>
            <View style={styles.groupHeader}>
              <AppText variant="labelLg" color="primary">
                {group.label.toUpperCase()}
              </AppText>
              <AppText variant="labelMd" color="textVariant">
                {formatExerciseCount(group.exercises.length)}
              </AppText>
            </View>
            {group.exercises.length === 0 ? (
              <AppText variant="bodyMd" color="textVariant">
                Sin ejercicios en este tramo.
              </AppText>
            ) : (
              group.exercises.map((exercise) => (
                <Card key={exercise.id}>
                  <View style={styles.cardContent}>
                    <ExerciseDetailLink
                      exerciseId={exercise.id}
                      title={exercise.title}
                    >
                      <AppText variant="headlineSm">{exercise.title}</AppText>
                      <AppText variant="bodyMd" color="textVariant">
                        {exercise.summary}
                      </AppText>
                      <AppText variant="labelMd" color="textVariant">
                        {formatExerciseMeta(exercise)}
                      </AppText>
                    </ExerciseDetailLink>
                    <Link href={buildBoardHref(exercise.id)} asChild>
                      <AppButton
                        label="Abrir en Pizarra"
                        variant="secondary"
                        fullWidth
                        style={styles.boardAction}
                        accessibilityLabel={`Abrir ${exercise.title} en la Pizarra`}
                        accessibilityHint="Abre la pestaña Pizarra con este ejercicio seleccionado"
                      />
                    </Link>
                  </View>
                </Card>
              ))
            )}
          </View>
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
  group: {
    gap: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardContent: {
    gap: spacing.sm,
  },
  boardAction: {
    minHeight: spacing.xl + spacing.md,
  },
});
