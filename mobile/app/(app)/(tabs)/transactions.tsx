import { useLocales } from 'expo-localization';
import { DateTime } from 'luxon';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { AppLayout } from '@/components/layouts/AppLayout';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ExpenseRow } from '@/components/transactions/ExpenseRow';
import { FilterBar } from '@/components/transactions/FilterBar';
import { useGetExpensesQuery, useLazyGetExpensesQuery } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { fakeRecentTransactions } from '@/utils/mocks/mockAnalyticsData';

export type Filter = {
  search?: string;
  categoryId?: string;
  paymentMethodId?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  verificationStatus?: 'verified' | 'unverified';
};
const LIMIT = 20;

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const locales = useLocales();
  const primaryLocale = locales[0];

  const [filter, setFilter] = useState<Filter>({});
  const openExpenseForm = () => router.push('/modals/expense-form');
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
  const { data, error, isLoading, isFetching } = useGetExpensesQuery(queryArgs, {
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
  // const expenses = useMemo(() => data?.data ?? [], [data]);
  const expenses = useMemo(() => fakeRecentTransactions(12), []);

  const ListFooter = useMemo(() => {
    if (!data?.pagination.has_next) return null;
    return (
      <Pressable
        onPress={loadMore}
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          padding: 12,
          backgroundColor: colors.backgroundSurface,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.primary, fontWeight: '600' }}>
          {isFetching ? t('transactions_loading') : t('transactions_load_more')}
        </Text>
      </Pressable>
    );
  }, [data?.pagination.has_next, isFetching, loadMore]);

  return (
    <AppLayout>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          paddingHorizontal: 24,
        }}
        edges={['top']}
      >
        <View style={{ width: '100%', paddingVertical: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary }}>
            {t('page_title_transactions')}
          </Text>
          <FilterBar
            filter={filter}
            setFilter={setFilter}
          />
        </View>
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseRow
              item={item}
              locale={primaryLocale}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={
            <View style={{ margin: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.disabled }}>{t('transactions_empty')}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        />
        <FloatingActionButton onPress={openExpenseForm} />
      </SafeAreaView>
    </AppLayout>
  );
}
