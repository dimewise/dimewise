import { DateTime } from 'luxon';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { LoadingState } from '@/components/feedback';
import { BalanceSummary } from '@/components/home/BalanceSummary';
import { CategoryBlock } from '@/components/home/CategoryBlock';
import { Header } from '@/components/home/Header';
import { PaymentBlock } from '@/components/home/PaymentBlock';
import { TransactionBlock } from '@/components/home/TransactionBlock';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ExpenseFormModal } from '@/components/modals/ExpenseFormModal';
import { MonthYearPicker } from '@/components/modals/MonthYearPicker';
import {
  type CategoryBreakdown,
  type ExpenseWithDetails,
  type PaymentMethodBreakdown,
  useGetAnalyticsCategoriesBreakdownQuery,
  useGetAnalyticsPaymentMethodsBreakdownQuery,
  useGetAnalyticsRecentTransactionsQuery,
} from '@/generated/api/api';
import { useModal } from '@/hooks/ui';
import { colors } from '@/theme/colors';

type HeaderItem = { type: 'header' };
type CategoryItem = { type: 'categories'; data: CategoryBreakdown[] };
type PaymentItem = { type: 'payments'; data: PaymentMethodBreakdown[] };
type TransactionItem = { type: 'transactions'; data: ExpenseWithDetails[] };
type Section = HeaderItem | CategoryItem | PaymentItem | TransactionItem;
type SelectedMonthYearType = {
  month: number;
  year: number;
};

export default function HomeScreen() {
  const now = DateTime.local();
  const [selectedMonthYear, setSelectedMonthYear] = useState<SelectedMonthYearType>({
    month: now.month,
    year: now.year,
  });

  // Use the new useModal hook for cleaner state management
  const monthPickerModal = useModal();
  const expenseFormModal = useModal();

  const {
    data: categories,
    refetch: refetchCategories,
    isLoading: isLoadingCategories,
  } = useGetAnalyticsCategoriesBreakdownQuery(selectedMonthYear);
  const {
    data: payments,
    refetch: refetchPayments,
    isLoading: isLoadingPayments,
  } = useGetAnalyticsPaymentMethodsBreakdownQuery(selectedMonthYear);
  const {
    data: transactions,
    refetch: refetchTransactions,
    isLoading: isLoadingTransactions,
  } = useGetAnalyticsRecentTransactionsQuery(selectedMonthYear);

  // Show loading state only on initial load (when all data is undefined)
  const isInitialLoading =
    isLoadingCategories &&
    isLoadingPayments &&
    isLoadingTransactions &&
    !categories &&
    !payments &&
    !transactions;

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchCategories(), refetchPayments(), refetchTransactions()]);
  }, [refetchCategories, refetchPayments, refetchTransactions]);

  const handleExpenseSuccess = useCallback(() => {
    refetchCategories();
    refetchPayments();
    refetchTransactions();
  }, [refetchCategories, refetchPayments, refetchTransactions]);

  const data: Section[] = useMemo(
    () => [
      { type: 'header' },
      { type: 'categories', data: categories ?? [] },
      { type: 'payments', data: payments ?? [] },
      { type: 'transactions', data: transactions ?? [] },
    ],
    [categories, payments, transactions],
  );

  const renderItem = useCallback(
    ({ item }: { item: Section }) => {
      switch (item.type) {
        case 'header':
          return (
            <BalanceSummary
              selectedMonth={selectedMonthYear.month}
              selectedYear={selectedMonthYear.year}
            />
          );
        case 'categories':
          return (
            <CategoryBlock
              items={item.data}
              selectedMonth={selectedMonthYear.month}
              selectedYear={selectedMonthYear.year}
            />
          );
        case 'payments':
          return (
            <PaymentBlock
              items={item.data}
              selectedMonth={selectedMonthYear.month}
              selectedYear={selectedMonthYear.year}
            />
          );
        case 'transactions':
          return (
            <TransactionBlock
              items={item.data}
              selectedMonth={selectedMonthYear.month}
              selectedYear={selectedMonthYear.year}
            />
          );
        default:
          return null;
      }
    },
    [selectedMonthYear],
  );

  if (isInitialLoading) {
    return (
      <AppLayout>
        <SafeAreaView
          className="flex-1 w-full bg-white"
          edges={['top']}
        >
          <Header
            selectedMonth={selectedMonthYear.month}
            selectedYear={selectedMonthYear.year}
            setOpen={monthPickerModal.open}
          />
          <LoadingState
            fullScreen={false}
            className="flex-1"
          />
        </SafeAreaView>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SafeAreaView
        className="flex-1 items-center justify-start w-full bg-white"
        edges={['top']}
      >
        <Header
          selectedMonth={selectedMonthYear.month}
          selectedYear={selectedMonthYear.year}
          setOpen={monthPickerModal.open}
        />
        <FlatList
          data={data}
          keyExtractor={(item, i) => item.type + i}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        />
        <FloatingActionButton onPress={expenseFormModal.open} />
        <MonthYearPicker
          visible={monthPickerModal.isVisible}
          onClose={monthPickerModal.close}
          initialMonth={selectedMonthYear.month}
          initialYear={selectedMonthYear.year}
          onChange={(m, y) => setSelectedMonthYear({ month: m, year: y })}
        />
        <ExpenseFormModal
          visible={expenseFormModal.isVisible}
          onClose={expenseFormModal.close}
          onSuccess={handleExpenseSuccess}
        />
      </SafeAreaView>
    </AppLayout>
  );
}
