import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { ExpenseRow } from '@/components/transactions';
import { Card } from '@/components/ui/Card';
import type { ExpenseWithDetails } from '@/generated/api/api';

type Props = {
  items: ExpenseWithDetails[];
  selectedMonth: number;
  selectedYear: number;
};

export const TransactionBlock: React.FC<Props> = ({ items, selectedMonth, selectedYear }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSeeMore = () => {
    const startDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 })
      .startOf('month')
      .toISODate();
    const endDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 })
      .endOf('month')
      .toISODate();

    router.push(`/(tabs)/transactions?dateFrom=${startDate}&dateTo=${endDate}`);
  };

  if (items.length === 0) {
    return (
      <View className="px-4 mb-6">
        <Text className="text-xl font-semibold text-neutral-900 mb-3">
          {t('overview_recent_transactions')}
        </Text>
        <Card>
          <View className="py-6 items-center">
            <Text className="text-sm text-neutral-500 text-center">
              {t('overview_recent_transactions_empty')}
            </Text>
            <Text className="text-xs text-neutral-400 mt-1 text-center">
              {t('overview_recent_transactions_empty_hint')}
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xl font-semibold text-neutral-900">
          {t('overview_recent_transactions')}
        </Text>
        <Pressable
          onPress={handleSeeMore}
          className="px-2 py-1"
        >
          <Text className="text-sm font-medium text-primary-600">{t('common_see_more')}</Text>
        </Pressable>
      </View>

      <View className="gap-2">
        {items.map((item) => (
          <ExpenseRow
            key={item.id}
            item={item}
          />
        ))}
      </View>
    </View>
  );
};
