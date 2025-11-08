import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { CategoryBreakdown } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';

interface Props {
  items: CategoryBreakdown[];
}

export const CategoryBlock = ({ items }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();

  const spentPercent = (spent: number, budget: number) =>
    budget ? Math.min((spent / budget) * 100, 100) : 0;

  const barColor = (percent: number) => {
    if (percent > 75) return colors.error; // > 75 % spent  → red
    if (percent >= 50) return colors.warning; // 50-75 % spent → amber
    return colors.primary; // < 50 % spent  → green
  };

  const badgeTextColor = (percent: number) => {
    if (percent > 75) return colors.errorTextOn;
    if (percent >= 50) return colors.warningTextOn;
    return colors.primaryTextOn;
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
          const badgeText = badgeTextColor(pct);
          return (
            <View
              key={c.category_id}
              style={{
                backgroundColor: colors.backgroundSurface,
                borderRadius: 8,
                padding: 16,
                gap: 8,
              }}
            >
              {/* Top row: Title and Percentage badge */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: colors.textPrimary,
                    flex: 1,
                  }}
                >
                  {c.category_title}
                </Text>
                <View
                  style={{
                    backgroundColor: color,
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: badgeText,
                    }}
                  >
                    {Math.round(pct)}%
                  </Text>
                </View>
              </View>

              {/* Main section: Spent and Remaining in two columns */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.disabled, marginBottom: 4 }}>
                    Spent
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {formatCurrency(c.spent, currency, locale)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.disabled, marginBottom: 4 }}>
                    Remaining
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: c.remaining > 0 ? colors.success : colors.error,
                    }}
                  >
                    {formatCurrency(c.remaining, currency, locale)}
                  </Text>
                </View>
              </View>

              {/* Budget (small, secondary) */}
              <Text style={{ fontSize: 11, color: colors.disabled }}>
                Budget: {formatCurrency(c.budget, currency, locale)}
              </Text>

              {/* Full-width progress bar */}
              <View
                style={{
                  height: 8,
                  backgroundColor: '#2A2A2A',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 4,
                    width: `${pct}%`,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
