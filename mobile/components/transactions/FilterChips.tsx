import { DateTime } from 'luxon';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import type { Filter } from '@/app/(app)/(tabs)/transactions';

type Props = {
  filters: Filter;
  onRemoveFilter: (filterKey: keyof Filter) => void;
  onClearAll: () => void;
  categories?: Array<{ id: string; title: string }>;
  paymentMethods?: Array<{ id: string; title: string }>;
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
      chips.push({
        key: 'categoryId',
        label: t('transactions_filter_category'),
        value: category?.title || 'Unknown Category',
      });
    }

    if (filters.paymentMethodId) {
      const method = paymentMethods?.find((method) => method.id === filters.paymentMethodId);
      chips.push({
        key: 'paymentMethodId',
        label: t('transactions_filter_payment_method'),
        value: method?.title || 'Unknown Method',
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
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>

      {chips.length > 1 && (
        <Pressable
          onPress={onClearAll}
          style={styles.clearAllButton}
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
    gap: 8,
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginRight: 6,
  },
  removeButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.textPrimary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  removeButtonText: {
    fontSize: 12,
    color: colors.backgroundDefault,
    fontWeight: 'bold' as const,
  },
  clearAllButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllButtonText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600' as const,
  },
};
