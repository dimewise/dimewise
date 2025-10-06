import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import type { Filter } from '@/app/(app)/(tabs)/transactions';
import { useDebounce } from '@/hooks/useDebounce';
import { colors } from '@/theme/colors';

type Props = {
  filter: Filter;
  setFilter: (f: Filter) => void;
};

export const FilterBar = ({ filter, setFilter }: Props) => {
  const [search, setSearch] = useState(filter.search ?? '');
  const debouncedSearch = useDebounce(search, 400);

  /* only sync to parent when debounced value changes */
  useEffect(() => {
    setFilter((prev) => {
      if (debouncedSearch) return { ...prev, search: debouncedSearch };
      const { search: _, ...rest } = prev;
      return rest;
    });
  }, [debouncedSearch, setFilter]);

  return (
    <View style={{ paddingVertical: 16, gap: 8 }}>
      <TextInput
        placeholder="Search transactions…"
        value={search}
        onChangeText={setSearch}
        style={{
          height: 40,
          backgroundColor: colors.backgroundSurface,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14,
          color: colors.textPrimary,
        }}
      />
      {/* Add category / payment-method / date pickers here when you need them */}
    </View>
  );
};
