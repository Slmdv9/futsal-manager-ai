import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../text';
import { colors, spacing } from '@/shared/theme';

type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
  children,
}: SectionPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText variant="labelMd" color="primary" style={styles.eyebrow}>
            {eyebrow}
          </AppText>
          <AppText variant="headlineLgMobile">{title}</AppText>
          <AppText variant="bodyLg" color="textVariant">
            {description}
          </AppText>
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  eyebrow: {
    textTransform: 'uppercase',
  },
  body: {
    gap: spacing.md,
  },
});
