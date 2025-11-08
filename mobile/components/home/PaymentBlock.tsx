import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { PaymentMethodBreakdown } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';

type Props = { items: PaymentMethodBreakdown[] };

export const PaymentBlock = ({ items }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();

  if (items.length === 0) {
    return (
      <View style={{ margin: 24, marginTop: 0 }}>
        <Text
          style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}
        >
          {t('common_payment_methods')}
        </Text>

        <View
          style={{
            backgroundColor: colors.backgroundSurface,
            borderRadius: 8,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: colors.disabled, textAlign: 'center' }}>
            {t('payment_methods_empty')}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.disabled,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {t('payment_methods_empty_hint')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ margin: 24, marginTop: 0 }}>
      <Text
        style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}
      >
        {t('common_payment_methods')}
      </Text>
      <View style={{ gap: 8 }}>
        {items.map((p) => (
          <View
            key={p.payment_method_id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.backgroundSurface,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
              {p.payment_method_title}
            </Text>
            <Text style={{ fontSize: 16, color: colors.disabled }}>
              {formatCurrency(p.total_spent, currency, locale)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
