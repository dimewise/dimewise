import { useLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { CategoryBreakdown } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';

interface Props {
  items: CategoryBreakdown[];
}

export const CategoryBlock = ({ items }: Props) => {
  const locales = useLocales();
  const primaryLocale = locales[0];
  const { t } = useTranslation();

  const spentPercent = (spent: number, budget: number) =>
    budget ? Math.min((spent / budget) * 100, 100) : 0;

  const barColor = (percent: number) => {
    if (percent > 75) return colors.error; // > 75 % spent  → red
    if (percent >= 50) return colors.warning; // 50-75 % spent → amber
    return colors.primary; // < 50 % spent  → green
  };

  if (items.length === 0) {
    return (
      <View style={{ margin: 24 }}>
        <Text
          style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}
        >
          {t('common_categories')}
        </Text>

        {/* gentle placeholder */}
        <View
          style={{
            backgroundColor: colors.backgroundSurface,
            borderRadius: 8,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: colors.disabled, textAlign: 'center' }}>
            {t('categories_empty')}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.disabled,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {t('categories_empty_hint')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ margin: 24 }}>
      <Text
        style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}
      >
        {t('common_categories')}
      </Text>
      <View style={{ gap: 8 }}>
        {items.map((c) => {
          const pct = spentPercent(c.spent, c.budget);
          const color = barColor(pct);
          return (
            <View
              key={c.category_id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.backgroundSurface,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
                  {c.category_title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.disabled }}>
                  {formatCurrency(c.spent, c.currency, primaryLocale.languageTag)}
                </Text>
              </View>

              {/* tinted progress bar */}
              <View style={{ width: 80, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 }}>
                <View
                  style={{
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 4,
                    width: `${pct}%`,
                  }}
                />
              </View>
              <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '600', color }}>
                {Math.round(pct)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
