import { DateTime } from 'luxon';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import type { Filter } from '@/app/(app)/(tabs)/transactions';

type Props = {
  filters: Filter;
  onRemoveFilter: (filterKey: keyof Filter) => void;
  onClearAll: () => void;
  categories?: Array<{ id: string; title: string; deleted_at?: string | null }>;
  paymentMethods?: Array<{ id: string; title: string; deleted_at?: string | null }>;
};

type FilterChip = {
  key: keyof Filter;
  label: string;
  value: string;
};

export const FilterChips = ({
  filters,
  onRemoveFilter,
  onClearAll,
  categories,
  paymentMethods,
}: Props) => {
  const { t } = useTranslation();

  const getFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (filters.categoryId) {
      const category = categories?.find((cat) => cat.id === filters.categoryId);
      const isDeleted = !!category?.deleted_at;
      chips.push({
        key: 'categoryId',
        label: t('transactions_filter_category'),
        value: category?.title 
          ? (isDeleted ? `${category.title} (${t('common_deleted')})` : category.title)
          : t('common_unknown', 'Unknown'),
      });
    }

    if (filters.paymentMethodId) {
      const method = paymentMethods?.find((method) => method.id === filters.paymentMethodId);
      const isDeleted = !!method?.deleted_at;
      chips.push({
        key: 'paymentMethodId',
        label: t('transactions_filter_payment_method'),
        value: method?.title 
          ? (isDeleted ? `${method.title} (${t('common_deleted')})` : method.title)
          : t('common_unknown', 'Unknown'),
      });
    }

    if (filters.dateFrom) {
      chips.push({
        key: 'dateFrom',
        label: t('transactions_filter_date_from'),
        value: DateTime.fromISO(filters.dateFrom).toLocaleString(DateTime.DATE_SHORT),
      });
    }

    if (filters.dateTo) {
      chips.push({
        key: 'dateTo',
        label: t('transactions_filter_date_to'),
        value: DateTime.fromISO(filters.dateTo).toLocaleString(DateTime.DATE_SHORT),
      });
    }

    if (filters.verificationStatus) {
      const statusLabel =
        filters.verificationStatus === 'verified'
          ? t('transactions_filter_verified')
          : t('transactions_filter_unverified');
      chips.push({
        key: 'verificationStatus',
        label: t('transactions_filter_verification_status'),
        value: statusLabel,
      });
    }

    return chips;
  };

  const chips = getFilterChips();

  if (chips.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {chips.map((chip) => (
          <View
            key={chip.key}
            style={styles.chip}
          >
            <Text style={styles.chipText}>
              {chip.label}: {chip.value}
            </Text>
            <Pressable
              onPress={() => onRemoveFilter(chip.key)}
              style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.removeButtonPressed,
              ]}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>

      {chips.length > 1 && (
        <Pressable
          onPress={onClearAll}
          style={({ pressed }) => [
            styles.clearAllButton,
            pressed && styles.clearAllButtonPressed,
          ]}
        >
          <Text style={styles.clearAllButtonText}>{t('transactions_filter_clear_all')}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  chipsContainer: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
    flex: 1,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.backgroundSurface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 0,
  },
  chipText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginRight: 8,
  },
  removeButton: {
    width: 18,
    height: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  removeButtonPressed: {
    opacity: 0.6,
  },
  removeButtonText: {
    fontSize: 18,
    color: colors.disabled,
    fontWeight: '300' as const,
    lineHeight: 18,
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  clearAllButtonPressed: {
    opacity: 0.6,
  },
  clearAllButtonText: {
    fontSize: 13,
    color: colors.disabled,
    fontWeight: '500' as const,
  },
};
