import { useLocales } from 'expo-localization';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useGetAnalyticsBudgetOverviewQuery } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';

interface Props {
  selectedMonth: number;
  selectedYear: number;
}

export const BalanceSummary = ({ selectedMonth, selectedYear }: Props) => {
  const { data } = useGetAnalyticsBudgetOverviewQuery({ month: selectedMonth, year: selectedYear });
  const locales = useLocales();
  const primaryLocale = locales[0];

  const budget = useMemo(
    () =>
      formatCurrency(data?.totalBudget ?? 0, data?.currency ?? 'USD', primaryLocale.languageTag),
    [data, primaryLocale],
  );
  const spent = useMemo(
    () => formatCurrency(data?.totalSpent ?? 0, data?.currency ?? 'USD', primaryLocale.languageTag),
    [data, primaryLocale],
  );
  const remainder = useMemo(
    () =>
      formatCurrency(
        data?.remainingBudget ?? 0,
        data?.currency ?? 'USD',
        primaryLocale.languageTag,
      ),
    [data, primaryLocale],
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
        gap: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: colors.disabled }}>Remainder</Text>
        <Text style={{ color: remainderColor, fontSize: 48, fontWeight: 700 }}>{remainder}</Text>
      </View>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.disabled }}>Used</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>{spent}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.disabled }}>Total Budget</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>{budget}</Text>
        </View>
      </View>
      <View
        style={{
          height: 8,
          width: '100%',
          backgroundColor: remainderColor,
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${100 - remainderPercent}%`,
            backgroundColor: colors.secondary,
            borderRadius: 99,
          }}
        />
      </View>
    </View>
  );
};
