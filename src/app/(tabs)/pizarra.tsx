import { StyleSheet, View } from 'react-native';
import { SectionPlaceholder } from '@/components/navigation';
import { AppText, Card, Chip } from '@/components/ui';
import { spacing } from '@/theme';

export default function BoardScreen() {
  return (
    <SectionPlaceholder
      eyebrow="Pizarra"
      title="Pizarra"
      description="Ejercicios animados sobre el tablero táctico 2:1."
    >
      <Card>
        <View style={styles.cardContent}>
          <Chip label="SIGUIENTE FASE" variant="neutral" />
          <AppText variant="headlineSm">El tablero aún no está conectado</AppText>
          <AppText variant="bodyMd" color="textVariant">
            La reproducción por fases y las fichas de jugadores se añadirán cuando exista Board Data
            validado.
          </AppText>
        </View>
      </Card>
    </SectionPlaceholder>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.sm,
  },
});
