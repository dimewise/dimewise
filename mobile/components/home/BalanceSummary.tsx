import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGetAnalyticsBudgetOverviewQuery } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
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
    if (remainderPercent > 75) return colors.primary;
    if (remainderPercent >= 50) return colors.warning;
    return colors.error;
  }, [remainderPercent]);

  return (
    <View
      style={{
        width: '100%',
        gap: spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xl,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: colors.disabled }}>{t('budget_remainder')}</Text>
        <Text style={{ color: remainderColor, fontSize: 48, fontWeight: 700 }}>{remainder}</Text>
      </View>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.disabled }}>{t('budget_used')}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>{spent}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.disabled }}>{t('budget_total')}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>{budget}</Text>
        </View>
      </View>
    </View>
  );
};
