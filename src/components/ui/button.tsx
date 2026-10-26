import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, type ColorToken } from '@/theme';
import { AppText } from './text';

export type ButtonVariant = 'primary' | 'ai' | 'secondary' | 'disabled';

type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const backgrounds: Record<ButtonVariant, string> = {
  primary: colors.primary,
  ai: colors.secondary,
  secondary: colors.surface,
  disabled: colors.surfaceContainer,
};

const labelColors: Record<ButtonVariant, ColorToken> = {
  primary: 'onPrimary',
  ai: 'onSecondary',
  secondary: 'text',
  disabled: 'outline',
};

export function AppButton({
  label,
  variant = 'primary',
  fullWidth = false,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled === true || variant === 'disabled';

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: backgrounds[variant] },
        variant === 'secondary' && styles.secondary,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      <AppText variant="bodyMdMedium" color={labelColors[variant]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondary: {
    borderColor: colors.outlineVariant,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.88,
  },
});
