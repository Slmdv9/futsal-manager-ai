import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from './text';

type FilterChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  selected: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

export function FilterChip({
  label,
  selected,
  accessibilityLabel,
  style,
  ...rest
}: FilterChipProps) {
  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
        style,
      ]}
    >
      {selected ? (
        <AppText variant="labelMd" color="onPrimary">
          ✓
        </AppText>
      ) : null}
      <AppText
        variant="labelMd"
        color={selected ? 'onPrimary' : 'text'}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
  },
  pressed: {
    opacity: 0.88,
  },
});
