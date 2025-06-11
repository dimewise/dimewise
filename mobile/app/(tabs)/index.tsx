import { Button, H2, ScrollView, Text, YStack, View, XStack, H3 } from 'tamagui';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentMonthExpenses, getTotalBudget, getTotalSpent, formatAmount } from '../../utils/storage';
import { Expense } from '../../utils/storage';
import { Plus } from '@tamagui/lucide-icons';
import ExpenseSheet from '../../components/ExpenseSheet';
import { MiddleDotSpacer } from 'components/MiddleDotSpacer';
import { useCurrency, useCurrencyRefresh } from '../../utils/CurrencyContext';

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);
  const insets = useSafeAreaInsets();
  const { currency } = useCurrency();
  const refreshKey = useCurrencyRefresh();

  useEffect(() => {
    loadData();
  }, [refreshKey]); // Re-load data when currency changes

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentExpenses, budget, spent] = await Promise.all([
        getCurrentMonthExpenses(),
        getTotalBudget(),
        getTotalSpent(),
      ]);

      setExpenses(currentExpenses.slice(0, 5)); // Show only 5 most recent expenses
      setTotalBudget(budget);
      setTotalSpent(spent);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmountLocal = (amount: number) => {
    return formatAmount(amount, currency);
  };

  const handleExpenseAdded = () => {
    loadData(); // Refresh data when expense is added
  };

  const handleNewExpensePress = () => {
    setShowExpenseSheet(true);
  };

  return (
    <View flex={1} bg="$background">
      <YStack p="$4" pt={insets.top + 16}>
        <H3 fontWeight="600">Budget Overview</H3>
      </YStack>
      <ScrollView flex={1}>
        <YStack p="$4" gap="$4">
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <Text>No categories available for viewing...</Text>
          )}
        </YStack>
      </ScrollView>
      <YStack p="$4" borderTopWidth={1} borderColor="$borderColor" gap="$3">
        <XStack gap="$2" justify="space-between">
          <Text>Total Budget:</Text>
          <MiddleDotSpacer />
          <Text fontWeight="bold">{formatAmountLocal(totalBudget)}</Text>
        </XStack>
        <XStack gap="$2" justify="space-between">
          <Text>Spent:</Text>
          <MiddleDotSpacer />
          <Text fontWeight="bold">{formatAmountLocal(totalSpent)}</Text>
        </XStack>
        <XStack gap="$2" justify="space-between">
          <Text>Remaining:</Text>
          <MiddleDotSpacer />
          <Text fontWeight="bold">{formatAmountLocal(totalBudget - totalSpent)}</Text>
        </XStack>
        <Button
          icon={<Plus />}
          onPress={handleNewExpensePress}
          themeInverse
          mt="$2"
        >
          New Expense
        </Button>
      </YStack>
      <ExpenseSheet
        open={showExpenseSheet}
        onOpenChange={setShowExpenseSheet}
        onExpenseAdded={handleExpenseAdded}
      />
    </View>
  );
}
