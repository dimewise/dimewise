import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceSummary } from '@/components/home/BalanceSummary';
import { CategoryBlock } from '@/components/home/CategoryBlock';
import { PaymentBlock } from '@/components/home/PaymentBlock';
import { TransactionBlock } from '@/components/home/TransactionBlock';
import { AppLayout } from '@/components/layouts/AppLayout';
import {
  type CategoryBreakdown,
  type ExpenseWithDetails,
  type PaymentMethodBreakdown,
  useGetAnalyticsCategoriesBreakdownQuery,
  useGetAnalyticsPaymentMethodsBreakdownQuery,
  useGetAnalyticsRecentTransactionsQuery,
} from '@/generated/api/api';

// import {
//   fakeCategoryBreakdown,
//   fakePaymentMethodBreakdown,
//   fakeRecentTransactions,
// } from '@/utils/mocks/mockAnalyticsData';

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

  const { data: categories = [] } = useGetAnalyticsCategoriesBreakdownQuery(selectedMonthYear);
  const { data: payments = [] } = useGetAnalyticsPaymentMethodsBreakdownQuery(selectedMonthYear);
  const { data: transactions = [] } = useGetAnalyticsRecentTransactionsQuery(selectedMonthYear);

  const data: Section[] = useMemo(
    () => [
      { type: 'header' }, // 0
      { type: 'categories', data: categories }, // 1
      { type: 'payments', data: payments }, // 2
      { type: 'transactions', data: transactions }, // 3
      // { type: 'categories', data: fakeCategoryBreakdown(5) }, // 1
      // { type: 'payments', data: fakePaymentMethodBreakdown(4) }, // 2
      // { type: 'transactions', data: fakeRecentTransactions(12) }, // 3
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
        <FlatList
          data={data}
          keyExtractor={(item, i) => item.type + i}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        />
      </SafeAreaView>
    </AppLayout>
  );
}
