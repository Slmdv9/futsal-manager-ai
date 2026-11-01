import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText, FilterChip } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import type { Category, CategoryId } from '../../domain/category';
import { formatCategoryLabel } from '../view-models/category-browse-model';

type CategoryFilterBarProps = {
  categories: readonly Category[];
  selectedCategoryId: CategoryId | null;
  onSelect: (categoryId: CategoryId) => void;
};

export function CategoryFilterBar({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryFilterBarProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="labelMd" color="primary" style={styles.label}>
        CATEGORÍA / RANGO DE EDAD
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroller}
      >
        {categories.map((category) => {
          const label = formatCategoryLabel(category);

          return (
            <FilterChip
              key={category.id}
              label={label}
              selected={selectedCategoryId === category.id}
              accessibilityLabel={`Categoría ${label}`}
              onPress={() => onSelect(category.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    textTransform: 'uppercase',
  },
  scroller: {
    marginHorizontal: -spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
});
