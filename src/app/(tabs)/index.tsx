import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SectionPlaceholder } from '@/components/navigation';
import { AppButton, AppText, Card, Chip } from '@/components/ui';
import { spacing } from '@/theme';

export default function ExploreScreen() {
  return (
    <SectionPlaceholder
      eyebrow="Futsal Manager AI"
      title="Explorar"
      description="Programación semanal y ejercicios por categoría para tus sesiones."
    >
      <Card>
        <View style={styles.cardContent}>
          <Chip label="EN CONSTRUCCIÓN" variant="press-trigger" />
          <AppText variant="headlineSm">La biblioteca llega en la siguiente fase</AppText>
          <AppText variant="bodyMd" color="textVariant">
            El filtro por categoría, la programación y los ejercicios se conectarán al contenido
            curado.
          </AppText>
        </View>
      </Card>
      <Link href="/design-system" asChild>
        <AppButton label="Ver sistema de diseño" variant="secondary" fullWidth />
      </Link>
    </SectionPlaceholder>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.sm,
  },
});
