import { Button, H2, ScrollView, Text, YStack, View, XStack, H3, H4, Card, Progress } from 'tamagui';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { getCurrentMonthExpenses, getTotalBudget, getTotalSpent, formatAmount, getCategories, getCategorySpending } from '../../utils/storage';
import { Expense, Category } from '../../utils/storage';
import { Plus } from '@tamagui/lucide-icons';
import ExpenseSheet from '../../components/ExpenseSheet';
import { MiddleDotSpacer } from 'components/MiddleDotSpacer';
import { useCurrency, useCurrencyRefresh } from '../../utils/CurrencyContext';

interface CategoryWithSpending extends Category {
  spent: number;
  percentage: number;
}

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryWithSpending[]>([]);
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

  // Reload data when page comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [refreshKey])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentExpenses, budget, spent, allCategories] = await Promise.all([
        getCurrentMonthExpenses(),
        getTotalBudget(),
        getTotalSpent(),
        getCategories(),
      ]);

      // Load spending data for each category
      const categoriesWithSpending = await Promise.all(
        allCategories.map(async (category) => {
          const categorySpent = await getCategorySpending(category.id);
          const percentage = category.budget > 0 ? (categorySpent / category.budget) * 100 : 0;
          return {
            ...category,
            spent: categorySpent,
            percentage: Math.min(percentage, 100), // Cap at 100% for display
          };
        })
      );

      setExpenses(currentExpenses.slice(0, 5)); // Show only 5 most recent expenses
      setCategories(categoriesWithSpending);
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

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '$red10';
    if (percentage >= 75) return '$orange10';
    if (percentage >= 50) return '$yellow10';
    return '$green10';
  };

  const getProgressBgColor = (percentage: number): string => {
    if (percentage >= 90) return '$red2';
    if (percentage >= 75) return '$orange2';
    if (percentage >= 50) return '$yellow2';
    return '$green2';
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
          ) : categories.length > 0 ? (
            <>
              <H4>Category Breakdown</H4>
              <YStack gap="$3">
                {categories.map((category) => (
                  <Card key={category.id} bordered p="$4" bg="$background">
                    <YStack gap="$3">
                      {/* Header with category name and amounts */}
                      <XStack justify="space-between">
                        <Text fontSize="$5" fontWeight="600">{category.name}</Text>
                        <Text
                          fontSize="$4"
                          fontWeight="500"
                          style={{ color: category.percentage >= 90 ? '#ff4444' : category.percentage >= 75 ? '#ff8800' : '#44aa44' }}
                        >
                          {formatAmountLocal(category.spent)} / {formatAmountLocal(category.budget)}
                        </Text>
                      </XStack>

                      {/* Progress bar */}
                      <YStack gap="$2">
                        <Progress value={category.percentage}>
                          <Progress.Indicator animation="bouncy" />
                        </Progress>

                        {/* Percentage and status */}
                        <XStack justify="space-between">
                          <Text fontSize="$3" opacity={0.7}>
                            {category.percentage.toFixed(1)}% used
                          </Text>
                          <Text
                            fontSize="$3"
                            fontWeight="500"
                            style={{ color: category.percentage >= 90 ? '#ff4444' : category.percentage >= 75 ? '#ff8800' : '#44aa44' }}
                          >
                            {category.budget - category.spent >= 0 ?
                              `${formatAmountLocal(category.budget - category.spent)} remaining` :
                              `${formatAmountLocal(category.spent - category.budget)} over budget`
                            }
                          </Text>
                        </XStack>
                      </YStack>
                    </YStack>
                  </Card>
                ))}
              </YStack>
            </>
          ) : (
            <YStack gap="$3" py="$8">
              <Text opacity={0.7}>No categories yet</Text>
              <Text opacity={0.5}>
                Add categories in the Profile tab to see your budget breakdown
              </Text>
            </YStack>
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
