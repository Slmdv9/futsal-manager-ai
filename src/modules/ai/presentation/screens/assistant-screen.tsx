import { StyleSheet, View } from 'react-native';
import { AppText, Card, Chip, SectionPlaceholder } from '@/shared/ui';
import { spacing } from '@/shared/theme';

export function AssistantScreen() {
  return (
    <SectionPlaceholder
      eyebrow="Asistente IA"
      title="Asistente IA"
      description="Respuestas de entrenamiento basadas en la biblioteca curada."
    >
      <Card>
        <View style={styles.cardContent}>
          <Chip label="PRÓXIMAMENTE" variant="tactical-alert" />
          <AppText variant="headlineSm">Conversación con contexto táctico</AppText>
          <AppText variant="bodyMd" color="textVariant">
            El asistente responderá con ejercicios publicados y evitará inventar contenido.
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
