import Octicons from '@expo/vector-icons/Octicons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textPrimary,
        tabBarStyle: {
          backgroundColor: colors.backgroundSurface,
          borderTopColor: colors.backgroundSurface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav_overview'),
          tabBarIcon: ({ color, size }) => (
            <Octicons
              name="project"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('nav_transactions'),
          tabBarIcon: ({ color, size }) => (
            <Octicons
              name="arrow-switch"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav_settings'),
          tabBarIcon: ({ color, size }) => (
            <Octicons
              name="gear"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
