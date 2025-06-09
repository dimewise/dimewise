import { Button, H2, ScrollView, Text, YStack, View } from 'tamagui';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentMonthExpenses, getTotalBudget, getTotalSpent, getSettings } from '../../utils/storage';
import { Expense, Settings } from '../../utils/storage';
import { Plus } from '@tamagui/lucide-icons';
import ExpenseSheet from '../../components/ExpenseSheet';

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [settings, setSettings] = useState<Settings>({ currency: 'USD' });
  const [loading, setLoading] = useState(true);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentExpenses, budget, spent, appSettings] = await Promise.all([
        getCurrentMonthExpenses(),
        getTotalBudget(),
        getTotalSpent(),
        getSettings(),
      ]);

      setExpenses(currentExpenses.slice(0, 5)); // Show only 5 most recent expenses
      setTotalBudget(budget);
      setTotalSpent(spent);
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)} ${settings.currency}`;
  };

  const handleExpenseAdded = () => {
    loadData(); // Refresh data when expense is added
  };

  return (
    <View flex={1} bg="$background">
      <ScrollView>
        <YStack p="$4" pt={insets.top + 16} space="$4">
          <H2>Budget Overview</H2>

          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              <Text>
                Total Budget: {formatAmount(totalBudget)}
              </Text>
              <Text>
                Spent: {formatAmount(totalSpent)}
              </Text>
              <Text>
                Remaining: {formatAmount(totalBudget - totalSpent)}
              </Text>

              <Button icon={<Plus />} mt="$4" onPress={() => setShowExpenseSheet(true)}>
                New Expense
              </Button>
            </>
          )}
        </YStack>
      </ScrollView>

      <ExpenseSheet
        open={showExpenseSheet}
        onOpenChange={setShowExpenseSheet}
        onExpenseAdded={handleExpenseAdded}
      />
    </View>
  );
}
