import { Ionicons } from '@expo/vector-icons';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import type { Filter } from '@/app/(app)/(tabs)/transactions';
import { useGetCategoriesQuery, useGetPaymentMethodsQuery } from '@/generated/api/api';
import { useDebounce } from '@/hooks/useDebounce';
import { colors } from '@/theme/colors';
import { FilterChips } from './FilterChips';

type Props = {
  filter: Filter;
  setFilter: Dispatch<SetStateAction<Filter>>;
  onOpenFilterModal: () => void;
  onFilterChange?: (filters: Filter) => void;
};

export const FilterBar = ({ filter, setFilter, onOpenFilterModal, onFilterChange }: Props) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filter.search ?? '');
  const debouncedSearch = useDebounce(search, 400);

  // Fetch categories and payment methods for filter chips
  // Include deleted ones so we can show the names of deleted items that are still in the filter
  const { data: categories } = useGetCategoriesQuery({ includeDeleted: true });
  const { data: paymentMethods } = useGetPaymentMethodsQuery({ includeDeleted: true });

  /* only sync to parent when debounced value changes */
  useEffect(() => {
    setFilter((prev) => {
      if (debouncedSearch) return { ...prev, search: debouncedSearch };
      const { search: _, ...rest } = prev;
      return rest;
    });
  }, [debouncedSearch]);

  const removeFilter = (filterKey: keyof Filter) => {
    const newFilter = { ...filter };
    delete newFilter[filterKey];
    setFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  const clearAllFilters = () => {
    setSearch('');
    setFilter({});
    onFilterChange?.({});
  };

  return (
    <View style={{ paddingVertical: 16, gap: 12 }}>
      {/* Search Bar + Filter Button Row */}
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <TextInput
          placeholder={t('transactions_search_placeholder')}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.disabled}
          style={{
            flex: 1,
            height: 40,
            backgroundColor: colors.backgroundSurface,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 14,
            color: colors.textPrimary,
          }}
        />
        <Pressable
          onPress={onOpenFilterModal}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            backgroundColor: colors.backgroundSurface,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons
            name="filter"
            size={20}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Filter Chips */}
      <FilterChips
        filters={filter}
        onRemoveFilter={removeFilter}
        onClearAll={clearAllFilters}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    </View>
  );
};
