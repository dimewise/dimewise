import { DateTime } from 'luxon';
import { Text, View } from 'react-native';
import type { ExpenseWithDetails } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';

type Props = { item: ExpenseWithDetails };

export const ExpenseRow = ({ item }: Props) => {
  const { locale } = useUserLocale();
  return (
    <View
      style={{
        backgroundColor: colors.backgroundSurface,
        marginBottom: 8,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.disabled, marginTop: 2 }}>
            {item.category.title} · {item.payment_method.title} ·{' '}
            {DateTime.fromISO(item.incurred_at).toLocaleString(DateTime.DATE_MED)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.textPrimary,
          }}
        >
          {formatCurrency(item.amount, item.currency, locale.languageTag)}
        </Text>
      </View>
    </View>
  );
};
