import { StyleSheet, View } from 'react-native';
import { AppText, Card } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import type { Category } from '../../domain/category';
import type { Programming } from '../../domain/programming';
import {
  formatCategoryLabel,
  formatSessionDuration,
} from '../view-models/category-browse-model';

type ProgrammingSummaryCardProps = {
  category: Category;
  programming: Programming | null;
};

export function ProgrammingSummaryCard({
  category,
  programming,
}: ProgrammingSummaryCardProps) {
  return (
    <Card>
      <View style={styles.content}>
        <AppText variant="labelMd" color="primary">
          {`Programación · ${formatCategoryLabel(category)}`}
        </AppText>
        {programming ? (
          <>
            <AppText variant="headlineSm">{programming.focus}</AppText>
            <AppText variant="bodyLg" color="textVariant">
              {programming.formativeStage}
            </AppText>
            <AppText variant="labelMd" color="textVariant">
              {formatSessionDuration(programming)}
            </AppText>
          </>
        ) : (
          <AppText variant="bodyMd" color="textVariant">
            La programación de esta categoría estará disponible pronto.
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
});
