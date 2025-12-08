import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGetAnalyticsBudgetOverviewQuery } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';

interface Props {
  selectedMonth: number;
  selectedYear: number;
}

export const BalanceSummary = ({ selectedMonth, selectedYear }: Props) => {
  const { t } = useTranslation();
  const { data } = useGetAnalyticsBudgetOverviewQuery({ month: selectedMonth, year: selectedYear });
  const { currency, locale } = useUserLocale();

  const budget = useMemo(
    () => formatCurrency(data?.totalBudget ?? 0, currency, locale),
    [data, currency, locale],
  );
  const spent = useMemo(
    () => formatCurrency(data?.totalSpent ?? 0, currency, locale),
    [data, currency, locale],
  );
  const remainder = useMemo(
    () => formatCurrency(data?.remainingBudget ?? 0, currency, locale),
    [data, currency, locale],
  );

  const remainderPercent = ((data?.remainingBudget ?? 0) / (data?.totalBudget ?? 1)) * 100;
  const remainderColor = useMemo(() => {
    if (remainderPercent > 75) return colors.primary.DEFAULT;
    if (remainderPercent >= 50) return colors.warning;
    return colors.error;
  }, [remainderPercent]);

  return (
    <View className="w-full items-center justify-center mt-2 mb-6 gap-8">
      {/* Main remainder display */}
      <View className="items-center">
        <Text className="text-sm text-neutral-500 uppercase tracking-wide mb-1">
          {t('budget_remainder')}
        </Text>
        <Text
          style={{ color: remainderColor }}
          className="text-5xl font-bold tracking-tight"
        >
          {remainder}
        </Text>
      </View>

      {/* Budget breakdown */}
      <View className="flex-row w-full justify-evenly">
        <View className="items-center px-4">
          <Text className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
            {t('budget_used')}
          </Text>
          <Text className="text-2xl font-semibold text-neutral-900">
            {spent}
          </Text>
        </View>
        <View className="w-px h-12 bg-neutral-200" />
        <View className="items-center px-4">
          <Text className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
            {t('budget_total')}
          </Text>
          <Text className="text-2xl font-semibold text-neutral-900">
            {budget}
          </Text>
        </View>
      </View>
    </View>
  );
};
