import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import { buildExerciseDetailHref } from '../view-models/exercise-detail-routing';

type ExerciseDetailLinkProps = {
  exerciseId: string;
  title: string;
  children: ReactNode;
};

export function ExerciseDetailLink({
  exerciseId,
  title,
  children,
}: ExerciseDetailLinkProps) {
  return (
    <Link href={buildExerciseDetailHref(exerciseId)} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Ver detalle de ${title}`}
        accessibilityHint="Abre la ficha completa de este ejercicio"
        style={styles.pressable}
      >
        {children}
        <AppText variant="labelMd" color="primary">
          Ver detalle
        </AppText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 44,
    gap: spacing.sm,
    width: '100%',
  },
});
