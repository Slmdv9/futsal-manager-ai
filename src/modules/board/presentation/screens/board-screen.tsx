import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip, SectionPlaceholder } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import type { BoardExerciseTarget } from '../board-exercise-target';

type BoardScreenProps = {
  exercise?: BoardExerciseTarget | null;
};

export function BoardScreen({ exercise }: BoardScreenProps) {
  return (
    <SectionPlaceholder
      eyebrow="Pizarra"
      title="Pizarra"
      description="Ejercicios animados sobre el tablero táctico 2:1."
    >
      {exercise ? (
        <Card>
          <View style={styles.cardContent}>
            <Chip label="SELECCIONADO" variant="press-trigger" />
            <AppText variant="headlineSm" accessibilityRole="header">
              {exercise.title}
            </AppText>
            <AppText variant="bodyMd" color="textVariant">
              {exercise.summary}
            </AppText>
            <AppText variant="bodyMd" color="textVariant">
              El tablero animado 2:1 llegará en la próxima fase.
            </AppText>
          </View>
        </Card>
      ) : (
        <Card>
          <View style={styles.cardContent}>
            <Chip label="SIGUIENTE FASE" variant="neutral" />
            <AppText variant="headlineSm">El tablero aún no está conectado</AppText>
            <AppText variant="bodyMd" color="textVariant">
              La reproducción por fases y las fichas de jugadores se añadirán cuando exista Board Data
              validado.
            </AppText>
          </View>
        </Card>
      )}
    </SectionPlaceholder>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.sm,
  },
});
