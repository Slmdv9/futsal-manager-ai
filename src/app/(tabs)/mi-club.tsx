import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { SectionPlaceholder } from '@/components/navigation';
import { AppText, Card, Chip } from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function ClubScreen() {
  return (
    <SectionPlaceholder
      eyebrow="Mi Club"
      title="Mi Club"
      description="Equipos, plantillas y calendario para entrenadores."
    >
      <Card padding="lg">
        <View style={styles.cardContent}>
          <SymbolView
            name={{ ios: 'lock.fill', android: 'lock' }}
            size={28}
            tintColor={colors.primary}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Chip label="SIGUIENTE FASE" variant="press-trigger" />
          <AppText variant="headlineSm">Disponible en una próxima fase</AppText>
          <AppText variant="bodyLg" color="textVariant">
            El MVP es anónimo: no incluye cuentas, equipos, plantillas ni calendarios.
          </AppText>
          <AppText variant="bodyMd" color="textVariant">
            Cuando exista acceso con cuenta, aquí vivirán tus equipos y su planificación.
          </AppText>
        </View>
      </Card>
    </SectionPlaceholder>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
});
