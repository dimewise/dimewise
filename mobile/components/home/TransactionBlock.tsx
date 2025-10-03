import { useLocales } from 'expo-localization';
import { DateTime } from 'luxon';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { ExpenseWithDetails } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';

type Props = { items: ExpenseWithDetails[] };

export const TransactionBlock: React.FC<Props> = ({ items }) => {
  const locales = useLocales();
  const primaryLocale = locales[0];
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <View style={{ margin: 24, marginTop: 0 }}>
        <Text
          style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}
        >
          {t('overview_recent_transactions')}
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
    <View style={{ margin: 24, marginTop: 0 }}>
      <Text
        style={{ fontSize: 24, fontWeight: '600', marginBottom: 16, color: colors.textPrimary }}
      >
        {t('overview_recent_transactions')}
      </Text>
      <View style={{ gap: 8 }}>
        {items.map((t) => (
          <View
            key={t.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.backgroundSurface,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
                {t.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.disabled }}>
                {DateTime.fromISO(t.incurred_at).toLocaleString(DateTime.DATE_MED)} ·{' '}
                {t.category.title} · {t.payment_method.title}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.textPrimary,
              }}
            >
              {formatCurrency(t.amount, t.currency, primaryLocale.languageTag)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
