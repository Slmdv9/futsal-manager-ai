import { Link, useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppText, Card, Chip } from '@/shared/ui';
import { colors, spacing } from '@/shared/theme';
import type { Exercise } from '../../domain/exercise';
import { buildExerciseDetailModel } from '../view-models/exercise-detail-model';

export function ExerciseDetailScreen({ exercise }: { exercise: Exercise | null }) {
  const router = useRouter();
  const model = exercise ? buildExerciseDetailModel(exercise) : null;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            accessibilityRole="link"
            accessibilityLabel="Volver a Explorar"
            accessibilityHint="Vuelve a la pantalla de Explorar"
            style={styles.backControl}
          >
            <AppText variant="labelMd" color="primary">
              Volver a Explorar
            </AppText>
          </Pressable>
          <AppText variant="labelMd" color="textVariant">
            Detalle de ejercicio
          </AppText>
        </View>
        {model ? (
          <>
            <Card>
              <View style={styles.cardContent}>
                <View style={styles.chips}>
                  {model.categoryLabels.map((categoryLabel) => (
                    <Chip
                      key={categoryLabel}
                      label={categoryLabel}
                      variant="press-trigger"
                    />
                  ))}
                  <Chip
                    label={model.sessionPartLabel.toUpperCase()}
                    variant="defending"
                  />
                </View>
                <AppText variant="headlineSm" accessibilityRole="header">
                  {model.title}
                </AppText>
                <AppText variant="bodyLg" color="textVariant">
                  {model.summary}
                </AppText>
                <View style={styles.objective}>
                  <AppText variant="labelMd" color="textVariant">
                    Objetivo
                  </AppText>
                  <AppText variant="bodyLg">{model.objective}</AppText>
                </View>
              </View>
            </Card>
            <Card>
              <View style={styles.cardContent}>
                <AppText variant="headlineSm" accessibilityRole="header">
                  Ficha del ejercicio
                </AppText>
                {model.facts.map((fact, index) => (
                  <View
                    key={fact.label}
                    style={[styles.factRow, index > 0 ? styles.factDivider : null]}
                  >
                    <AppText variant="labelMd" color="textVariant">
                      {fact.label}
                    </AppText>
                    <AppText variant="bodyLg">{fact.value}</AppText>
                  </View>
                ))}
              </View>
            </Card>
            {model.constraints.length > 0 ? (
              <Card>
                <View style={styles.cardContent}>
                  <AppText variant="headlineSm" accessibilityRole="header">
                    Restricciones
                  </AppText>
                  <View style={styles.list}>
                    {model.constraints.map((constraint, index) => (
                      <View key={`${constraint.rule}-${index}`} style={styles.listItem}>
                        <AppText variant="labelLg" color="primary">
                          {constraint.rule}
                        </AppText>
                        <AppText variant="bodyLg" color="textVariant">
                          {constraint.detail}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </View>
              </Card>
            ) : null}
            <Card>
              <View style={styles.cardContent}>
                <AppText variant="headlineSm" accessibilityRole="header">
                  Paso a paso
                </AppText>
                <AppText variant="labelMd" color="primary">
                  {model.phaseCountLabel}
                </AppText>
                <View style={styles.list}>
                  {model.phases.map((phase) => (
                    <View key={phase.order} style={styles.listItem}>
                      <AppText variant="labelLg" color="primary">
                        Fase {phase.order}
                      </AppText>
                      <AppText variant="bodyLgMedium">{phase.title}</AppText>
                      <AppText variant="bodyLg" color="textVariant">
                        {phase.explanation}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
            {model.coachingCues.length > 0 ? (
              <Card>
                <View style={styles.cardContent}>
                  <AppText variant="headlineSm" accessibilityRole="header">
                    Consignas para el entrenador
                  </AppText>
                  <View style={styles.list}>
                    {model.coachingCues.map((cue, index) => (
                      <View key={`${cue}-${index}`} style={styles.cue}>
                        <AppText variant="bodyLg" color="primary">
                          •
                        </AppText>
                        <AppText variant="bodyLg" style={styles.cueText}>
                          {cue}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </View>
              </Card>
            ) : null}
            {model.references.length > 0 ? (
              <Card>
                <View style={styles.cardContent}>
                  <AppText variant="headlineSm" accessibilityRole="header">
                    Inspirado en
                  </AppText>
                  {model.references.map((reference) => (
                    <Pressable
                      key={reference.url}
                      onPress={() => {
                        Linking.openURL(reference.url).catch(() => {});
                      }}
                      accessibilityRole="link"
                      accessibilityLabel={`Abrir ${reference.label}`}
                      style={styles.reference}
                    >
                      <AppText variant="bodyLgMedium">{reference.label}</AppText>
                      <AppText variant="labelMd" color="secondary">
                        {reference.url}
                      </AppText>
                    </Pressable>
                  ))}
                  <AppText variant="bodySm" color="textVariant">
                    Ejercicio original de Futsal Manager AI. La fuente se cita únicamente como inspiración.
                  </AppText>
                </View>
              </Card>
            ) : null}
            {model.attribution !== null ? (
              <Card>
                <View style={styles.cardContent}>
                  <AppText variant="headlineSm" accessibilityRole="header">
                    Atribución
                  </AppText>
                  <AppText variant="bodyLg">{model.attribution}</AppText>
                </View>
              </Card>
            ) : null}
          </>
        ) : (
          <Card>
            <View style={styles.notFound}>
              <AppText variant="headlineSm" accessibilityRole="header">
                Ejercicio no encontrado
              </AppText>
              <AppText variant="bodyLg" color="textVariant">
                Este ejercicio no está disponible. Puede que todavía no esté
                publicado o que el enlace ya no exista.
              </AppText>
              <Link href="/" asChild>
                <AppButton
                  label="Volver a Explorar"
                  variant="secondary"
                  fullWidth
                />
              </Link>
            </View>
          </Card>
        )}
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
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  backControl: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  cardContent: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  objective: {
    gap: spacing['2xs'],
  },
  factRow: {
    gap: spacing['2xs'],
  },
  factDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainer,
    paddingTop: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  listItem: {
    gap: spacing['2xs'],
  },
  cue: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cueText: {
    flexShrink: 1,
  },
  reference: {
    minHeight: 44,
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingVertical: spacing.md,
  },
  notFound: {
    gap: spacing.md,
  },
});
