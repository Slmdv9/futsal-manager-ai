import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, elevation, radius, spacing, type SpacingToken } from '@/theme';

type CardProps = ViewProps & {
  elevated?: boolean;
  padding?: SpacingToken;
};

export function Card({ elevated = false, padding = 'md', style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        { padding: spacing[padding] },
        elevated ? elevation.raised : elevation.card,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
  },
});
