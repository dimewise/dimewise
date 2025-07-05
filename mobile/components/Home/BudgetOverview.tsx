import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { getCategoriesBudgetSumByUserId } from '../../db/repository/category';
import { getMonthlyExpenseSumByUserId } from '../../db/repository/expense';
import { formatAmount } from '../../db/utils';
import { getMonthRange } from '../../utils/datetime';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { useUser } from '../contexts/UserContext';

export const BudgetOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, userSetting } = useUser();
  const { refreshKeys } = useRefreshKey();
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKeys are intentionally used to trigger re-fetching
  useEffect(() => {
    if (!user?.id) return;

    try {
      // Get total budget sum
      const budgetSum = getCategoriesBudgetSumByUserId(user.id);
      setTotalBudget(budgetSum);

      // Get total spent in month
      const { from, to } = getMonthRange(new Date());
      const totalSpent = getMonthlyExpenseSumByUserId(user.id, from, to);
      setTotalSpent(totalSpent);
    } catch (error) {
      console.error('Error fetching budget overview data:', error);
      setTotalBudget(0);
      setTotalSpent(0);
    }
  }, [user?.id, refreshKeys.categories, refreshKeys.expenses]);

  const { remainder, percentUsed } = useMemo(() => {
    const remainder = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
    return { remainder, percentUsed: Number(percentUsed.toFixed(2)) };
  }, [totalBudget, totalSpent]);

  return (
    <View style={{ marginBottom: 32 }}>
      <View style={{ paddingVertical: 32 }}>
        {/* Header */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <Text
            variant="headlineSmall"
            style={{
              fontWeight: '800',
              color: theme.colors.onSurface,
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            {t('expenses.monthlyBudget')}
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              fontWeight: '500',
              opacity: 0.8,
            }}
          >
            {new Date().toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Progress Section */}
        <View style={{ marginBottom: 28 }}>
          {/* Custom Progress Bar Container */}
          <View
            style={{
              height: 16,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 16,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Progress Fill */}
            <View
              style={{
                height: '100%',
                width: `${Math.min(percentUsed, 100)}%`,
                backgroundColor:
                  percentUsed >= 95 ? '#FF4444' : percentUsed >= 80 ? '#FF8800' : '#00BF63',
                borderRadius: 8,
                shadowColor:
                  percentUsed >= 95 ? '#FF4444' : percentUsed >= 80 ? '#FF8800' : '#00BF63',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
              }}
            />
          </View>

          {/* Percentage Display */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 36,
                fontWeight: '900',
                color: percentUsed >= 90 ? '#FF4444' : theme.colors.onSurface,
                letterSpacing: -1,
                textAlign: 'center',
              }}
            >
              {percentUsed.toFixed(0)}%
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.onSurfaceVariant,
                marginLeft: 4,
                marginTop: 8,
              }}
            >
              {t('status.used')}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 8,
            marginBottom: 20,
          }}
        >
          {/* Spent */}
          <View
            style={{
              alignItems: 'center',
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FF6B6B',
                  marginRight: 8,
                }}
              />
              <Text
                variant="labelMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {t('expenses.spent')}
              </Text>
            </View>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: '700',
                color: theme.colors.onSurface,
              }}
            >
              {formatAmount(totalSpent, userSetting?.currency || 'USD')}
            </Text>
          </View>
          <Divider />
          {/* remainder */}
          <View
            style={{
              alignItems: 'center',
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: remainder >= 0 ? '#00BF63' : '#FF4444',
                  marginRight: 8,
                }}
              />
              <Text
                variant="labelMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {remainder >= 0 ? t('home.left') : t('home.over')}
              </Text>
            </View>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: '700',
                color: remainder >= 0 ? theme.colors.onSurface : '#FF4444',
              }}
            >
              {formatAmount(Math.abs(remainder), userSetting?.currency || 'USD')}
            </Text>
          </View>
        </View>

        {/* Status Message */}
        <View
          style={{
            padding: 16,
            backgroundColor:
              percentUsed >= 90 ? '#FFF5F5' : percentUsed >= 75 ? '#FFF8F0' : '#F0FFF4',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: percentUsed >= 90 ? '#FFE5E5' : percentUsed >= 75 ? '#FFF0E0' : '#E5FFE5',
            alignItems: 'center',
          }}
        >
          <Text
            variant="bodyMedium"
            style={{
              color: percentUsed >= 90 ? '#D32F2F' : percentUsed >= 75 ? '#F57C00' : '#2E7D32',
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {percentUsed >= 95
              ? t('home.budgetExceeded')
              : percentUsed >= 85
                ? t('home.nearingLimit')
                : percentUsed >= 60
                  ? t('home.onTrack')
                  : t('home.greatProgress')}
          </Text>
        </View>
      </View>
    </View>
  );
};
