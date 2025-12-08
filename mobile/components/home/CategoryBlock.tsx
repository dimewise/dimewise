import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { CategoryBreakdown } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';
import { Card } from '@/components/ui/Card';

interface Props {
  items: CategoryBreakdown[];
  selectedMonth: number;
  selectedYear: number;
}

export const CategoryBlock = ({ items, selectedMonth, selectedYear }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();
  const router = useRouter();

  const spentPercent = (spent: number, budget: number) =>
    budget ? Math.min((spent / budget) * 100, 100) : 0;

  const getStatusColor = (percent: number) => {
    if (percent > 75) return { bar: colors.error, text: colors.error };
    if (percent >= 50) return { bar: colors.warning, text: colors.warning };
    return { bar: colors.primary.DEFAULT, text: colors.primary.DEFAULT };
  };

  if (items.length === 0) {
    return (
      <View className="px-4 mb-6">
        <Text className="text-xl font-semibold text-neutral-900 mb-3">
          {t('common_categories')}
        </Text>
        <Card>
          <View className="py-6 items-center">
            <Text className="text-sm text-neutral-500 text-center">
              {t('categories_empty')}
            </Text>
            <Text className="text-xs text-neutral-400 mt-1 text-center">
              {t('categories_empty_hint')}
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <Text className="text-xl font-semibold text-neutral-900 mb-3">
        {t('common_categories')}
      </Text>
      
      <View className="gap-3">
        {items.map((c) => {
          const pct = spentPercent(c.spent, c.budget);
          const status = getStatusColor(pct);

          const handlePress = () => {
            const startDate = DateTime.fromObject({
              year: selectedYear,
              month: selectedMonth,
              day: 1,
            })
              .startOf('month')
              .toISODate();
            const endDate = DateTime.fromObject({
              year: selectedYear,
              month: selectedMonth,
              day: 1,
            })
              .endOf('month')
              .toISODate();

            router.push(
              `/(tabs)/transactions?categoryId=${c.category_id}&dateFrom=${startDate}&dateTo=${endDate}`,
            );
          };

          return (
            <Pressable
              key={c.category_id}
              onPress={handlePress}
              className="active:opacity-70"
            >
              <Card padding="md">
                {/* Header: Title and Percentage */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base font-medium text-neutral-900 flex-1">
                    {c.category_title}
                  </Text>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${status.bar}15` }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: status.bar }}
                    >
                      {Math.round(pct)}%
                    </Text>
                  </View>
                </View>

                {/* Amounts Row */}
                <View className="flex-row gap-4 mb-3">
                  <View className="flex-1">
                    <Text className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                      {t('category_spent')}
                    </Text>
                    <Text className="text-lg font-semibold text-neutral-900">
                      {formatCurrency(c.spent, currency, locale)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                      {t('category_remaining')}
                    </Text>
                    <Text
                      className="text-lg font-semibold"
                      style={{ color: c.remaining > 0 ? colors.success : colors.error }}
                    >
                      {formatCurrency(c.remaining, currency, locale)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: status.bar,
                      width: `${pct}%`,
                    }}
                  />
                </View>

                {/* Budget Footer */}
                <Text className="text-xs text-neutral-400 mt-2">
                  {t('category_budget')}: {formatCurrency(c.budget, currency, locale)}
                </Text>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
