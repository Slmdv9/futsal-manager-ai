import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, Card, Chip } from '@/shared/ui';
import { colors, radius, spacing } from '@/shared/theme';

export function AiSessionEntryCard() {
  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View
              style={styles.badge}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <AppText variant="labelSm" color="onSecondaryFixed">
                IA
              </AppText>
            </View>
            <View style={styles.titleBlock}>
              <AppText variant="headlineSm" accessibilityRole="header">
                Pídele una sesión a la IA
              </AppText>
              <AppText variant="labelSm" color="textVariant">
                Generador táctico en tiempo real
              </AppText>
            </View>
          </View>
          <Chip label="PRÓXIMAMENTE" variant="tactical-alert" />
        </View>
        <AppText variant="bodyMd" color="textVariant">
          La generación de sesiones con IA llega en la próxima fase. Mientras tanto, toda
          la biblioteca curada está disponible sin conexión.
        </AppText>
        <Link href="/asistente" asChild>
          <AppButton
            label="Abrir Asistente IA"
            variant="ai"
            fullWidth
            style={styles.cta}
            accessibilityLabel="Abrir Asistente IA"
            accessibilityHint="Abre la pestaña Asistente IA, disponible en una próxima fase"
          />
        </Link>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.sm,
  },
  badge: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryFixed,
  },
  titleBlock: {
    flexShrink: 1,
    gap: spacing['2xs'],
  },
  cta: {
    minHeight: spacing.xl + spacing.md,
  },
});
