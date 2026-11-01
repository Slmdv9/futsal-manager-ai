import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip, SectionPlaceholder } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import type { BoardExerciseTarget } from '../board-exercise-target';
import { TacticsBoard } from '../components/tactics-board';
import { buildBoardRenderModel } from '../view-models/board-render-model';

type BoardScreenProps = {
  exercise?: BoardExerciseTarget | null;
};

function BoardTargetContent({ exercise }: { exercise: BoardExerciseTarget }) {
  const model = buildBoardRenderModel(exercise.boardData);

  return (
    <>
      <Card>
        <View style={styles.cardContent}>
          <Chip label="SELECCIONADO" variant="press-trigger" />
          <AppText variant="headlineSm" accessibilityRole="header">
            {exercise.title}
          </AppText>
          <AppText variant="bodyMd" color="textVariant">
            {exercise.summary}
          </AppText>
        </View>
      </Card>
      <Card padding="sm">
        <TacticsBoard boardData={exercise.boardData} />
        <View style={styles.boardText}>
          <Chip label={model.phaseLabel} variant="defending" />
          <AppText variant="headlineSm" accessibilityRole="header">
            {model.phaseTitle}
          </AppText>
          <AppText variant="bodyMd" color="textVariant">
            {model.phaseExplanation}
          </AppText>
          <AppText variant="bodyMd" color="textVariant">
            La reproducción por fases llegará en la próxima fase.
          </AppText>
        </View>
      </Card>
    </>
  );
}

export function BoardScreen({ exercise }: BoardScreenProps) {
  return (
    <SectionPlaceholder
      eyebrow="Pizarra"
      title="Pizarra"
      description="Ejercicios animados sobre el tablero táctico 2:1."
    >
      {exercise ? (
        <BoardTargetContent exercise={exercise} />
      ) : (
        <Card>
          <View style={styles.cardContent}>
            <Chip label="SIN EJERCICIO" variant="neutral" />
            <AppText variant="headlineSm">Todavía no hay un ejercicio seleccionado</AppText>
            <AppText variant="bodyMd" color="textVariant">
              Abre un ejercicio desde Explorar y pulsa Abrir en Pizarra para verlo aquí.
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
  boardText: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
