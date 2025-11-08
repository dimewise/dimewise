import { DateTime } from 'luxon';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { ExpenseWithDetails } from '@/generated/api/api';
import { ExpenseRow } from '@/components/ExpenseRow';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type Props = {
  items: ExpenseWithDetails[];
  selectedMonth: number; // 1-based month (1-12)
  selectedYear: number;
};

export const TransactionBlock: React.FC<Props> = ({ items, selectedMonth, selectedYear }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSeeMore = () => {
    // Calculate date range for the selected month/year
    const startDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 })
      .startOf('month')
      .toISODate();
    const endDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 })
      .endOf('month')
      .toISODate();

    // Navigate to transactions page with date filters
    router.push(`/(tabs)/transactions?dateFrom=${startDate}&dateTo=${endDate}`);
  };

  if (items.length === 0) {
    return (
      <View style={{ margin: spacing.lg, marginTop: 0 }}>
        <Text
          style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md }}
        >
          {t('overview_recent_transactions')}
        </Text>

        <View
          style={{
            backgroundColor: colors.backgroundSurface,
            borderRadius: 8,
            padding: spacing.lg,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: colors.disabled, textAlign: 'center' }}>
            {t('overview_recent_transactions_empty')}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.disabled,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {t('overview_recent_transactions_empty_hint')}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={{ margin: spacing.lg, marginTop: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Text
          style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary }}
        >
          {t('overview_recent_transactions')}
        </Text>
        <Pressable onPress={handleSeeMore}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.primary,
            }}
          >
            {t('common_see_more')}
          </Text>
        </Pressable>
      </View>
      <View style={{ gap: spacing.sm }}>
        {items.map((item) => (
          <ExpenseRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};
