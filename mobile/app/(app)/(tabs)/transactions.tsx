import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { FlatList, Pressable, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { AppLayout } from '@/components/layouts/AppLayout';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ExpenseRow } from '@/components/transactions';
import { FilterBar } from '@/components/transactions/FilterBar';
import { FilterModal } from '@/components/modals/FilterModal';
import { ExpenseFormModal } from '@/components/modals/ExpenseFormModal';
import { EmptyState } from '@/components/feedback';
import { useGetExpensesQuery, useLazyGetExpensesQuery } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { useModal } from '@/hooks/ui';

export type Filter = {
  search?: string;
  categoryId?: string;
  paymentMethodId?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  verificationStatus?: 'verified' | 'unverified';
};
const LIMIT = 20;

// Memoized load more button
const LoadMoreButton = memo<{ onPress: () => void; isFetching: boolean }>(({ onPress, isFetching }) => {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} className="mx-4 mt-4 p-2.5 bg-surface rounded-lg items-center">
      <Text className="text-primary-500 font-semibold">
        {isFetching ? t('transactions_loading') : t('transactions_load_more')}
      </Text>
    </Pressable>
  );
});

LoadMoreButton.displayName = 'LoadMoreButton';

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const filterModal = useModal();
  const expenseFormModal = useModal();
  const params = useLocalSearchParams<{
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    paymentMethodId?: string;
  }>();

  const [filter, setFilter] = useState<Filter>(() => ({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    categoryId: params.categoryId,
    paymentMethodId: params.paymentMethodId,
  }));

  // Sync filter state with URL params when they change
  useEffect(() => {
    setFilter((prev) => {
      const newFilter: Filter = {
        // Preserve filters that aren't in URL params
        search: prev.search,
        verificationStatus: prev.verificationStatus,
        // Update filters from URL params (use undefined if param doesn't exist)
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        categoryId: params.categoryId,
        paymentMethodId: params.paymentMethodId,
      };
      return newFilter;
    });
  }, [params.dateFrom, params.dateTo, params.categoryId, params.paymentMethodId]);

  const queryArgs = useMemo(() => {
    const now = DateTime.now();
    return {
      limit: LIMIT,
      ...filter,
      dateFrom: filter.dateFrom ?? now.startOf('month').toISODate(),
      dateTo: filter.dateTo ?? now.endOf('month').toISODate(),
    };
  }, [filter]);

  /* ---------- query ---------- */
  const { data, error, isLoading, isFetching, refetch } = useGetExpensesQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });
  const [fetchNext] = useLazyGetExpensesQuery();

  /* ---------- pagination ---------- */
  const loadMore = useCallback(async () => {
    if (!data?.pagination.has_next) return;
    await fetchNext({
      cursor: data.pagination.next_cursor,
      ...queryArgs, // memoised args (include limit, dates, filters)
    });
  }, [data, queryArgs, fetchNext]);

  /* ---------- data ---------- */
  const expenses = useMemo(() => data?.data ?? [], [data]);

  // Memoized render item
  const renderItem = useCallback(
    ({ item }: { item: (typeof expenses)[0] }) => <ExpenseRow item={item} onUpdate={refetch} />,
    [refetch],
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: (typeof expenses)[0]) => item.id, []);

  // List footer component
  const ListFooterComponent = useMemo(() => {
    if (!data?.pagination.has_next) return null;
    return <LoadMoreButton onPress={loadMore} isFetching={isFetching} />;
  }, [data?.pagination.has_next, loadMore, isFetching]);

  // Empty state component
  const ListEmptyComponent = useMemo(
    () => <EmptyState title={t('transactions_empty')} className="mt-8" />,
    [t],
  );

  // Item separator
  const ItemSeparator = useCallback(() => <View className="h-2" />, []);

  return (
    <AppLayout>
      <SafeAreaView className="flex-1 items-center justify-start w-full px-5" edges={['top']}>
        <View className="w-full py-4">
          <Text className="text-2xl font-semibold text-white">{t('page_title_transactions')}</Text>
          <FilterBar
            filter={filter}
            setFilter={setFilter}
            onOpenFilterModal={filterModal.open}
            onFilterChange={setFilter}
          />
        </View>
        <FlatList
          data={expenses}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
          className="w-full"
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={colors.text.primary}
              colors={[colors.text.primary]}
            />
          }
        />
        <FloatingActionButton onPress={expenseFormModal.open} />

        {/* Modals */}
        <FilterModal
          visible={filterModal.isOpen}
          onClose={filterModal.close}
          onApply={setFilter}
          currentFilters={filter}
        />
        <ExpenseFormModal
          visible={expenseFormModal.isOpen}
          onClose={expenseFormModal.close}
          onSuccess={refetch}
        />
      </SafeAreaView>
    </AppLayout>
  );
}
