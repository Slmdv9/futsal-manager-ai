import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppInput, AppText, Card, Chip, type ChipVariant } from '@/components/ui';
import {
  colors,
  radius,
  spacing,
  typography,
  type ColorToken,
  type RadiusToken,
  type SpacingToken,
  type TypographyVariant,
} from '@/theme';

const palette = Object.entries(colors) as [ColorToken, string][];
const typeVariants = Object.keys(typography) as TypographyVariant[];
const spacingTokens = Object.entries(spacing) as [SpacingToken, number][];
const radii = Object.keys(radius) as RadiusToken[];

const typeSamples: Partial<Record<TypographyVariant, string>> = {
  displayLg: 'Intensidad táctica',
  displayLgMobile: 'Intensidad táctica',
  headlineLg: 'Programación semanal',
  headlineLgMobile: 'Programación semanal',
  headlineMd: 'Presión tras pérdida',
  headlineSm: 'Bloque defensivo 3-1',
  bodyLg: 'Ejercicio para mejorar la salida de presión con apoyos interiores.',
  bodyLgMedium: 'Ejercicio para mejorar la salida de presión con apoyos interiores.',
  bodyMd: 'Trabajo de circulación rápida y cambios de orientación.',
  bodyMdMedium: 'Trabajo de circulación rápida y cambios de orientación.',
  bodySm: 'Ajusta la distancia entre líneas y el timing de la presión.',
  labelLg: '12 MIN · 8 JUGADORES',
  labelMd: 'PREBENJAMÍN · U8',
  labelSm: 'FASE 02',
};

const chipSamples: { variant: ChipVariant; label: string }[] = [
  { variant: 'neutral', label: 'General' },
  { variant: 'defending', label: 'Defensa' },
  { variant: 'press-trigger', label: 'Presión' },
  { variant: 'tactical-alert', label: 'Alerta táctica' },
];

export default function DesignSystemScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="headlineLgMobile">Sistema de diseño</AppText>
          <AppText variant="bodyMd" color="textVariant">
            Tokens y componentes base de Futsal Manager AI. Esta pantalla existe para verificar el
            diseño en dispositivo.
          </AppText>
          <Link href="/" asChild>
            <AppButton label="Volver al inicio" variant="secondary" />
          </Link>
        </View>

        <Section title="Paleta" description="Cada color y su token semántico.">
          {palette.map(([token, value]) => (
            <View key={token} style={styles.paletteRow}>
              <View style={[styles.swatch, { backgroundColor: value }]} />
              <AppText variant="labelMd" style={styles.paletteName}>
                {token}
              </AppText>
              <AppText variant="labelSm" color="textVariant">
                {value}
              </AppText>
            </View>
          ))}
        </Section>

        <Section title="Tipografía" description="Space Grotesk, Hanken Grotesk y JetBrains Mono.">
          {typeVariants.map((variant) => (
            <View key={variant} style={styles.typeRow}>
              <AppText variant="labelSm" color="textVariant">
                {variant}
              </AppText>
              <AppText variant={variant}>{sampleText(variant)}</AppText>
            </View>
          ))}
        </Section>

        <Section title="Espaciado" description="Escala base de 4 px con paso principal de 8 px.">
          {spacingTokens.map(([name, value]) => (
            <View key={name} style={styles.scaleRow}>
              <AppText variant="labelSm" color="textVariant" style={styles.scaleLabel}>
                {name}
              </AppText>
              <View style={[styles.spacingBar, { width: value }]} />
              <AppText variant="labelSm" color="textVariant">
                {value}
              </AppText>
            </View>
          ))}
        </Section>

        <Section title="Radios" contentStyle={styles.radiusRow}>
          {radii.map((radiusKey) => (
            <View key={radiusKey} style={styles.radiusItem}>
              <View
                style={[
                  styles.radiusBox,
                  { borderRadius: radius[radiusKey] },
                  radiusKey === 'full' && styles.radiusCircle,
                ]}
              />
              <AppText variant="labelSm" color="textVariant">
                {radiusKey}
              </AppText>
            </View>
          ))}
        </Section>

        <Section title="Botones" description="Acción principal, IA, secundaria y deshabilitada.">
          <View style={styles.wrap}>
            <AppButton label="Acción principal" variant="primary" />
            <AppButton label="Asistente IA" variant="ai" />
            <AppButton label="Acción secundaria" variant="secondary" />
            <AppButton label="No disponible" variant="disabled" />
          </View>
        </Section>

        <Section title="Tarjetas" description="Superficie blanca, borde fino y elevación suave.">
          <Card>
            <AppText variant="headlineSm">Ejercicio base</AppText>
            <AppText variant="bodyMd" color="textVariant" style={styles.cardBody}>
              Rondo 4v2 con salida por banda y cambio de orientación.
            </AppText>
          </Card>
          <Card elevated>
            <AppText variant="headlineSm">Variante IA</AppText>
            <AppText variant="bodyMd" color="textVariant" style={styles.cardBody}>
              La variante adapta la presión y mantiene la estructura del ejercicio.
            </AppText>
          </Card>
        </Section>

        <Section title="Etiquetas" description="Chips de estado con tipografía mono.">
          <View style={styles.wrap}>
            {chipSamples.map((chip) => (
              <Chip key={chip.variant} variant={chip.variant} label={chip.label} />
            ))}
          </View>
        </Section>

        <Section
          title="Entradas"
          description="Toca un campo para ver el borde y el anillo de foco."
        >
          <AppInput label="Categoría" placeholder="Prebenjamín · U8" />
          <AppInput
            label="Nombre del ejercicio"
            placeholder="Salida de presión 3-1"
            error="Este campo es obligatorio"
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function sampleText(variant: TypographyVariant) {
  return typeSamples[variant] ?? 'Futsal Manager AI';
}

function Section({
  title,
  description,
  children,
  contentStyle,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="headlineMd">{title}</AppText>
        {description ? (
          <AppText variant="bodySm" color="textVariant">
            {description}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.sectionContent, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.margin,
    paddingBottom: spacing['2xl'],
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    gap: spacing['2xs'],
  },
  sectionContent: {
    gap: spacing.md,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  paletteName: {
    flex: 1,
  },
  typeRow: {
    gap: spacing['2xs'],
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scaleLabel: {
    width: 56,
  },
  spacingBar: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  radiusItem: {
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  radiusBox: {
    width: 48,
    height: 48,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  radiusCircle: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primaryFixedDim,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardBody: {
    marginTop: spacing.xs,
  },
});
