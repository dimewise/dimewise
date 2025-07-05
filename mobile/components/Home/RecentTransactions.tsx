import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { getExpensesInRangeByUserId } from '../../db/repository/expense';
import type { Expense } from '../../db/schema';
import { useUserData } from '../../hooks/useAsyncData';
import { getMonthRange } from '../../utils/datetime';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { useUser } from '../contexts/UserContext';
import { LoadingErrorFallback } from '../ErrorBoundary';
import ExpenseList from '../ExpenseList';

interface Props {
  onPress: (expense: Expense) => void;
}

export const RecentTransactions = ({ onPress }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUser();
  const { refreshKeys } = useRefreshKey();

  // Use the new data loading hook with proper error handling
  const {
    data: expenses,
    loading,
    error,
    refetch,
  } = useUserData(
    (userId) => {
      const { from, to } = getMonthRange(new Date());
      return getExpensesInRangeByUserId(userId, from, to, 10);
    },
    user?.id,
    [refreshKeys.expenses],
  );

  if (loading) {
    return (
      <View>
        <Text
          variant="headlineMedium"
          style={{
            marginBottom: 24,
            fontWeight: '700',
            color: theme.colors.onBackground,
          }}
        >
          {t('home.recentTransactions')}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('status.loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text
          variant="headlineMedium"
          style={{
            marginBottom: 24,
            fontWeight: '700',
            color: theme.colors.onBackground,
          }}
        >
          {t('home.recentTransactions')}
        </Text>
        <LoadingErrorFallback onRetry={refetch} />
      </View>
    );
  }

  return (
    <View>
      <Text
        variant="headlineMedium"
        style={{
          marginBottom: 24,
          fontWeight: '700',
          color: theme.colors.onBackground,
        }}
      >
        {t('home.recentTransactions')}
      </Text>
      <ExpenseList expenses={expenses || []} hideDescription onPress={onPress} />
    </View>
  );
};
