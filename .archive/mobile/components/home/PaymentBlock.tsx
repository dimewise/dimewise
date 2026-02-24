import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { PaymentMethodBreakdown } from '@/generated/api/api';
import { useUserLocale } from '@/hooks/useUserLocale';
import { formatCurrency } from '@/utils/localization/currencies';

type Props = {
  items: PaymentMethodBreakdown[];
  selectedMonth: number;
  selectedYear: number;
};

export const PaymentBlock = ({ items, selectedMonth, selectedYear }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <View className="px-4 mb-6">
        <Text className="text-xl font-semibold text-neutral-900 mb-3">
          {t('common_payment_methods')}
        </Text>
        <Card>
          <View className="py-6 items-center">
            <Text className="text-sm text-neutral-500 text-center">
              {t('payment_methods_empty')}
            </Text>
            <Text className="text-xs text-neutral-400 mt-1 text-center">
              {t('payment_methods_empty_hint')}
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <Text className="text-xl font-semibold text-neutral-900 mb-3">
        {t('common_payment_methods')}
      </Text>

      <Card padding="none">
        {items.map((p, index) => {
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
              `/(tabs)/transactions?paymentMethodId=${p.payment_method_id}&dateFrom=${startDate}&dateTo=${endDate}`,
            );
          };

          return (
            <View key={p.payment_method_id}>
              {index > 0 && <View className="h-px bg-neutral-100 mx-4" />}
              <Pressable
                onPress={handlePress}
                className="flex-row justify-between items-center px-4 py-3.5 active:bg-neutral-50"
              >
                <Text className="text-base font-medium text-neutral-900">
                  {p.payment_method_title}
                </Text>
                <Text className="text-base text-neutral-500 tabular-nums">
                  {formatCurrency(p.total_spent, currency, locale)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </Card>
    </View>
  );
};
