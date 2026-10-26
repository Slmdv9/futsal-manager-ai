import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';

type TabIconProps = {
  focused: boolean;
  ios: SFSymbol;
  android: AndroidSymbol;
  badge?: 'ai' | 'lock';
};

export function TabIcon({ focused, ios, android, badge }: TabIconProps) {
  const tintColor = focused ? colors.primary : colors.textVariant;

  return (
    <View style={styles.wrapper}>
      <SymbolView
        name={{ ios, android }}
        size={22}
        tintColor={tintColor}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      {badge === 'ai' ? <View style={styles.aiDot} /> : null}
      {badge === 'lock' ? (
        <SymbolView
          name={{ ios: 'lock.fill', android: 'lock' }}
          size={11}
          tintColor={colors.outline}
          style={styles.lock}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiDot: {
    position: 'absolute',
    top: -spacing['2xs'],
    right: -spacing.xs,
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.secondary,
  },
  lock: {
    position: 'absolute',
    right: -spacing.xs,
    bottom: -spacing['2xs'],
  },
});
