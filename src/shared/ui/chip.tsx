import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, spacing, type ColorToken } from '@/shared/theme';
import { AppText } from './text';

export type ChipVariant = 'neutral' | 'defending' | 'press-trigger' | 'tactical-alert';

type ChipProps = ViewProps & {
  label: string;
  variant?: ChipVariant;
};

const chipTokens: Record<
  ChipVariant,
  { backgroundColor: ColorToken; borderColor: ColorToken; color: ColorToken }
> = {
  neutral: {
    backgroundColor: 'surfaceContainer',
    borderColor: 'surfaceContainer',
    color: 'textVariant',
  },
  defending: {
    backgroundColor: 'surfaceContainerLow',
    borderColor: 'outlineVariant',
    color: 'text',
  },
  'press-trigger': {
    backgroundColor: 'primaryFixed',
    borderColor: 'primaryFixedDim',
    color: 'onPrimaryFixed',
  },
  'tactical-alert': {
    backgroundColor: 'secondaryFixed',
    borderColor: 'secondaryFixedDim',
    color: 'onSecondaryFixed',
  },
};

export function Chip({ label, variant = 'neutral', style, ...rest }: ChipProps) {
  const token = chipTokens[variant];

  return (
    <View
      {...rest}
      style={[
        styles.base,
        {
          backgroundColor: colors[token.backgroundColor],
          borderColor: colors[token.borderColor],
        },
        style,
      ]}
    >
      <AppText variant="labelMd" color={token.color}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
