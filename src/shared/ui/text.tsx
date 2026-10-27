import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, typography, type ColorToken, type TypographyVariant } from '@/shared/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: TextStyle['textAlign'];
};

export function AppText({
  variant = 'bodyMd',
  color = 'text',
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
    />
  );
}
