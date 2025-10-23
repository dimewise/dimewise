import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DateTime } from 'luxon';
import { useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BalanceSummary } from '@/components/home/BalanceSummary';
import { CategoryBlock } from '@/components/home/CategoryBlock';
import { Header } from '@/components/home/Header';
import { MonthYearPicker } from '@/components/home/MonthYearPicker';
import { PaymentBlock } from '@/components/home/PaymentBlock';
import { TransactionBlock } from '@/components/home/TransactionBlock';
import { AppLayout } from '@/components/layouts/AppLayout';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import {
  type CategoryBreakdown,
  type ExpenseWithDetails,
  type PaymentMethodBreakdown,
  useGetAnalyticsCategoriesBreakdownQuery,
  useGetAnalyticsPaymentMethodsBreakdownQuery,
  useGetAnalyticsRecentTransactionsQuery,
} from '@/generated/api/api';
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
  const router = useRouter();
  const now = DateTime.local();
  const [selectedMonthYear, setSelectedMonthYear] = useState<SelectedMonthYearType>({
    month: now.month,
    year: now.year,
  });
  const sheetRef = useRef<BottomSheetModal>(null);

  const openPicker = () => sheetRef.current?.present();
  const openExpenseForm = () => router.push('/modals/expense-form');

  const handleRefresh = async () => {
    await Promise.all([
      refetchCategories(),
      refetchPayments(),
      refetchTransactions(),
    ]);
  };

  const { data: categories, refetch: refetchCategories } = useGetAnalyticsCategoriesBreakdownQuery(selectedMonthYear);
  const { data: payments, refetch: refetchPayments } = useGetAnalyticsPaymentMethodsBreakdownQuery(selectedMonthYear);
  const { data: transactions, refetch: refetchTransactions } = useGetAnalyticsRecentTransactionsQuery(selectedMonthYear);

  const data: Section[] = useMemo(
    () => [
      { type: 'header' }, // 0
      { type: 'categories', data: categories ?? [] }, // 1
      { type: 'payments', data: payments ?? [] }, // 2
      { type: 'transactions', data: transactions ?? [] }, // 3
    ],
    [categories, payments, transactions],
  );

  const renderItem = ({ item }: { item: Section }) => {
    switch (item.type) {
      case 'header':
        return (
          <BalanceSummary
            selectedMonth={selectedMonthYear.month}
            selectedYear={selectedMonthYear.year}
          />
        );
      case 'categories':
        return <CategoryBlock items={item.data} />;
      case 'payments':
        return <PaymentBlock items={item.data} />;
      case 'transactions':
        return <TransactionBlock items={item.data} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
        }}
        edges={['top']}
      >
        <Header
          selectedMonth={selectedMonthYear.month}
          selectedYear={selectedMonthYear.year}
          setOpen={openPicker}
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
              tintColor={colors.textPrimary}
              colors={[colors.textPrimary]}
            />
          }
        />
        <FloatingActionButton onPress={openExpenseForm} />
        <MonthYearPicker
          ref={sheetRef}
          initialMonth={selectedMonthYear.month}
          initialYear={selectedMonthYear.year}
          onChange={(m, y) => setSelectedMonthYear({ month: m, year: y })}
        />
      </SafeAreaView>
    </AppLayout>
  );
}
