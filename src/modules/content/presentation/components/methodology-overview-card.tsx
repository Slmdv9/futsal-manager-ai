import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import type { Category } from '../../domain/category';
import { formatCategoryLabel } from '../view-models/category-browse-model';
import type { MethodologyOverview } from '../view-models/explore-general-model';

type MethodologyOverviewCardProps = {
  category: Category | null;
  methodology: MethodologyOverview | null;
};

export function MethodologyOverviewCard({
  category,
  methodology,
}: MethodologyOverviewCardProps) {
  if (!category) {
    return (
      <Card>
        <AppText variant="bodyMd" color="textVariant">
          Elige una categoría para ver la metodología de su etapa.
        </AppText>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.content}>
        <Chip label={formatCategoryLabel(category)} variant="neutral" />
        {methodology ? (
          <>
            <AppText variant="headlineSm" accessibilityRole="header">
              {methodology.stage}
            </AppText>
            <AppText variant="bodyMd" color="textVariant">
              {`Foco: ${methodology.focus}`}
            </AppText>
            <AppText variant="bodySm" color="textVariant">
              {methodology.playModel}
            </AppText>
            <AppText variant="labelMd" color="textVariant">
              {methodology.sessionDurationLabel}
            </AppText>
            <View style={styles.concepts}>
              <AppText variant="labelMd" color="primary">
                Conceptos clave
              </AppText>
              <View style={styles.chips}>
                {methodology.keyConcepts.map((concept) => (
                  <Chip key={concept} label={concept} variant="neutral" />
                ))}
              </View>
            </View>
          </>
        ) : (
          <AppText variant="bodyMd" color="textVariant">
            La metodología de esta categoría estará disponible pronto.
          </AppText>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  concepts: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
