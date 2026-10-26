import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppText } from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <AppText variant="headlineLgMobile" color="primary" align="center">
          Futsal Manager AI
        </AppText>
        <AppText variant="bodyLg" color="text" align="center">
          Pizarras, ejercicios y programación para entrenadores de fútbol sala.
        </AppText>
        <AppText variant="labelMd" color="textVariant" align="center" style={styles.status}>
          Aplicación en construcción
        </AppText>
        <Link href="/design-system" asChild>
          <AppButton label="Ver sistema de diseño" variant="secondary" />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  status: {
    textTransform: 'uppercase',
  },
});
