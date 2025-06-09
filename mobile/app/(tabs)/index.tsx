import { Button, H2, ScrollView, Text, YStack, View, XStack } from 'tamagui';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentMonthExpenses, getTotalBudget, getTotalSpent, getSettings } from '../../utils/storage';
import { Expense, Settings } from '../../utils/storage';
import { Plus } from '@tamagui/lucide-icons';
import ExpenseSheet from '../../components/ExpenseSheet';
import { MiddleDotSpacer } from 'components/MiddleDotSpacer';

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

  const handleNewExpensePress = () => {
    setShowExpenseSheet(true);
  };

  return (
    <View flex={1} bg="$background">
      <ScrollView flex={1}>
        <YStack p="$4" pt={insets.top + 16} gap="$4" flex={1}>
          <H2>Budget Overview</H2>

          <Button
            icon={<Plus />}
            onPress={handleNewExpensePress}
          >
            New Expense
          </Button>

          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <Text>No categories available for viewing...</Text>
          )}
        </YStack>
      </ScrollView>
      <YStack p="$4" borderTopWidth={1} borderColor="$borderColor" gap="$2">
        <XStack gap="$2" justify="space-between">
          <Text>Total Budget:</Text>
          <MiddleDotSpacer />
          <Text fontWeight="bold">{formatAmount(totalBudget)}</Text>
        </XStack>
        <XStack gap="$2" justify="space-between">
          <Text>Spent:</Text>
          <MiddleDotSpacer />
          <Text fontWeight="bold">{formatAmount(totalSpent)}</Text>
        </XStack>
        <XStack gap="$2" justify="space-between">
          <Text>Remaining:</Text>
          <MiddleDotSpacer />
          <Text fontWeight="bold">{formatAmount(totalBudget - totalSpent)}</Text>
        </XStack>
      </YStack>

      <ExpenseSheet
        open={showExpenseSheet}
        onOpenChange={setShowExpenseSheet}
        onExpenseAdded={handleExpenseAdded}
      />
    </View>
  );
}
