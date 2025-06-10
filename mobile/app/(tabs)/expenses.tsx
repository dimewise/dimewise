import { useEffect, useState } from 'react';
import { Button, H2, ScrollView, Text, YStack, Card, XStack, View } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getExpenses, getSettings } from '../../utils/storage';
import { Expense, Settings } from '../../utils/storage';
import { format } from 'date-fns';
import { Plus } from '@tamagui/lucide-icons';
import ExpenseSheet from '../../components/ExpenseSheet';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
      const [allExpenses, appSettings] = await Promise.all([
        getExpenses(),
        getSettings(),
      ]);

      setExpenses(allExpenses);
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)} ${settings.currency}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleExpenseAdded = () => {
    loadData(); // Refresh data when expense is added
  };

  return (
    <View flex={1} bg="$background">
      <ScrollView>
        <YStack p="$4" pt={insets.top + 16} gap="$4">
          <H2>All Expenses</H2>

          {loading ? (
            <Text>Loading expenses...</Text>
          ) : expenses.length > 0 ? (
            <YStack gap="$3">
              {expenses.map(expense => (
                <Card key={expense.id} bordered p="$3">
                  <YStack gap="$2">
                    <XStack gap="$2">
                      <Text fontWeight="bold" flex={1}>{expense.title}</Text>
                      <Text fontWeight="bold">{formatAmount(expense.amount)}</Text>
                    </XStack>

                    {expense.description ? (
                      <Text>{expense.description}</Text>
                    ) : null}
                    <Text fontSize="$1">{formatDate(expense.date)}</Text>
                  </YStack>
                </Card>
              ))}
            </YStack>
          ) : (
            <YStack gap="$3">
              <Text>No expenses yet</Text>
              <Button icon={<Plus size={16} />} onPress={() => setShowExpenseSheet(true)}>
                Add Expense
              </Button>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <YStack p="$4" borderTopWidth={1} borderColor="$borderColor">
        <Button
          icon={<Plus />}
          onPress={() => setShowExpenseSheet(true)}
          themeInverse
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