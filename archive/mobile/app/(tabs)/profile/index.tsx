import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBoundary from '../../../components/ErrorBoundary';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      // Any cleanup when focusing on this tab can go here
    }, []),
  );

  const handleNavigateToSettings = () => {
    router.push('/(tabs)/profile/settings');
  };

  const handleNavigateToBudgetCategories = () => {
    router.push('/(tabs)/profile/budget-categories');
  };

  const handleNavigateToPaymentMethods = () => {
    router.push('/(tabs)/profile/payment-methods');
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Profile screen error:', error, errorInfo);
      }}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          edges={['top']}
        >
          <View
            style={{
              paddingTop: 16,
              paddingHorizontal: 24,
              paddingBottom: 16,
              backgroundColor: theme.colors.background,
            }}
          >
            <Text
              variant="headlineMedium"
              style={{
                fontWeight: '700',
                color: theme.colors.onBackground,
              }}
            >
              {t('navigation.profile')}
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                marginHorizontal: 24,
                backgroundColor: theme.colors.surface,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                overflow: 'hidden',
                marginTop: 8,
              }}
            >
              <List.Item
                title={t('navigation.settings')}
                description={t('settings.currencyAndPreferences')}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="cog"
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                  />
                )}
                onPress={handleNavigateToSettings}
                style={{
                  backgroundColor: theme.colors.surface,
                  paddingVertical: 8,
                }}
                titleStyle={{
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}
                descriptionStyle={{
                  color: theme.colors.onSurfaceVariant,
                }}
              />

              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.outline,
                  marginHorizontal: 16,
                }}
              />

              <List.Item
                title={t('navigation.categories')}
                description={t('categories.manageCategoriesAndBudgets')}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="wallet"
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                  />
                )}
                onPress={handleNavigateToBudgetCategories}
                style={{
                  backgroundColor: theme.colors.surface,
                  paddingVertical: 8,
                }}
                titleStyle={{
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}
                descriptionStyle={{
                  color: theme.colors.onSurfaceVariant,
                }}
              />

              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.outline,
                  marginHorizontal: 16,
                }}
              />

              <List.Item
                title={t('paymentMethods.title')}
                description={t('paymentMethods.managePaymentSources')}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="credit-card"
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                  />
                )}
                onPress={handleNavigateToPaymentMethods}
                style={{
                  backgroundColor: theme.colors.surface,
                  paddingVertical: 8,
                }}
                titleStyle={{
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}
                descriptionStyle={{
                  color: theme.colors.onSurfaceVariant,
                }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ErrorBoundary>
  );
}
