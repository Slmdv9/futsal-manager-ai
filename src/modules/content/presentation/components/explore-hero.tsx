import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip } from '@/shared/ui';
import { colors, radius, spacing } from '@/shared/theme';
import type { ExploreStats } from '../view-models/explore-general-model';

type ExploreHeroProps = {
  stats: ExploreStats;
};

export function ExploreHero({ stats }: ExploreHeroProps) {
  return (
    <Card elevated>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <View
              style={styles.dot}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <AppText variant="headlineSm" style={styles.title} accessibilityRole="header">
              Acceso Libre para Entrenadores
            </AppText>
          </View>
          <Chip label="SIN REGISTRO PREVIO" variant="press-trigger" />
        </View>
        <AppText variant="bodyMd" color="textVariant">
          Consulta ejercicios oficiales RFEF, marcos metodológicos por edades y
          programación curada para tus sesiones.
        </AppText>
        <View style={styles.stats}>
          <Stat
            value={`${stats.exerciseCount}`}
            label="Ejercicios"
            accessibilityLabel={`${stats.exerciseCount} ejercicios`}
            color="primary"
          />
          <Stat
            value={`${stats.categoryCount}`}
            label="Categorías"
            accessibilityLabel={`${stats.categoryCount} categorías`}
            color="secondary"
          />
          <Stat
            value={stats.openLabel}
            label="Abierto"
            accessibilityLabel={`${stats.openLabel} abierto`}
            color="tertiary"
          />
        </View>
      </View>
    </Card>
  );
}

type StatProps = {
  value: string;
  label: string;
  accessibilityLabel: string;
  color: 'primary' | 'secondary' | 'tertiary';
};

function Stat({ value, label, accessibilityLabel, color }: StatProps) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={accessibilityLabel}>
      <AppText variant="headlineSm" color={color}>
        {value}
      </AppText>
      <AppText variant="labelSm" color="textVariant">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  title: {
    flexShrink: 1,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['2xs'],
  },
});
