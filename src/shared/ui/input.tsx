import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/shared/theme';
import { AppText } from './text';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function AppInput({
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...rest
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = error !== undefined;

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      {label ? (
        <AppText variant="labelMd" color="textVariant">
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.ring,
          { borderColor: hasError ? colors.errorContainer : focused ? colors.primaryFixed : 'transparent' },
        ]}
      >
        <TextInput
          {...rest}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            typography.bodyLg,
            styles.input,
            {
              borderColor: hasError ? colors.error : focused ? colors.primary : colors.inputBorder,
              color: colors.text,
            },
            style,
          ]}
        />
      </View>
      {hasError ? (
        <AppText variant="bodySm" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 3,
    borderRadius: radius.md,
  },
  input: {
    minHeight: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
