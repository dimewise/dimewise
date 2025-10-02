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
  useGetAnalyticsCategoriesBreakdownQuery,
  useGetAnalyticsPaymentMethodsBreakdownQuery,
  useGetAnalyticsRecentTransactionsQuery,
} from '@/generated/api/api';
import {
  fakeCategoryBreakdown,
  fakePaymentMethodBreakdown,
  fakeRecentTransactions,
} from '@/utils/mocks/mockAnalyticsData';
import { fakeCategoriesBreakdown } from '@/utils/mocks/mockCategoryBreakdown';

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

  /* ----- data ----- */
  const { data: categories = [] } = useGetAnalyticsCategoriesBreakdownQuery(selectedMonthYear);
  const { data: payments = [] } = useGetAnalyticsPaymentMethodsBreakdownQuery(selectedMonthYear);
  const { data: transactions = [] } = useGetAnalyticsRecentTransactionsQuery(selectedMonthYear);

  /* ----- compose one flat array for the list ----- */
  const data = useMemo(
    () => [
      { type: 'header' }, // 0
      // { type: 'categories', data: categories }, // 1
      // { type: 'payments', data: payments }, // 2
      // { type: 'transactions', data: transactions }, // 3
      { type: 'categories', data: fakeCategoryBreakdown(5) }, // 1
      { type: 'payments', data: fakePaymentMethodBreakdown(4) }, // 2
      { type: 'transactions', data: fakeRecentTransactions(12) }, // 3
    ],
    [categories, payments, transactions],
  );

  /* ----- render item ----- */
  const renderItem = ({ item }) => {
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
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </AppLayout>
  );
}
