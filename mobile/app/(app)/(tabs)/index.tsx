import { DateTime } from 'luxon';
import { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceSummary } from '@/components/home/BalanceSummary';
import { AppLayout } from '@/components/layouts/AppLayout';
import { colors } from '@/theme/colors';

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

  return (
    <AppLayout>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
        edges={['top', 'bottom']}
      >
        <BalanceSummary
          selectedMonth={selectedMonthYear.month}
          selectedYear={selectedMonthYear.year}
        />
        <Text style={{ color: colors.textPrimary }}>Hello there</Text>
      </SafeAreaView>
    </AppLayout>
  );
}
