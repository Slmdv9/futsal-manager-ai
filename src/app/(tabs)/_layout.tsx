import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon } from '@/shared/ui';
import { colors, spacing, typography } from '@/shared/theme';

const TAB_CONTENT_HEIGHT = 64;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textVariant,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: TAB_CONTENT_HEIGHT + insets.bottom,
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
        },
        tabBarLabelStyle: typography.labelMd,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarAccessibilityLabel: 'Explorar',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ios="soccerball" android="sports_soccer" />
          ),
        }}
      />
      <Tabs.Screen
        name="pizarra"
        options={{
          title: 'Pizarra',
          tabBarAccessibilityLabel: 'Pizarra',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ios="pencil.and.outline" android="draw" />
          ),
        }}
      />
      <Tabs.Screen
        name="asistente"
        options={{
          title: 'Asistente IA',
          tabBarAccessibilityLabel: 'Asistente IA',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ios="brain.head.profile" android="smart_toy" badge="ai" />
          ),
        }}
      />
      <Tabs.Screen
        name="mi-club"
        options={{
          title: 'Mi Club',
          tabBarAccessibilityLabel: 'Mi Club, disponible en una próxima fase',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              ios="shield.lefthalf.filled"
              android="shield_person"
              badge="lock"
            />
          ),
        }}
      />
    </Tabs>
  );
}
