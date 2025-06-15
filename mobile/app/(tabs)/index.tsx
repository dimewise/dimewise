import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  useTheme,
  Surface,
  Divider,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useExpenses, useCategories, formatAmount, SYSTEM_CATEGORIES } from '../../storage';
import { Expense, Category } from '../../storage';
import { useCurrency, useCurrencyRefresh } from '../../utils/CurrencyContext';
import ExpenseBottomSheet from '../../components/ExpenseBottomSheet';

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
  const theme = useTheme();
  const { currency } = useCurrency();
  const refreshKey = useCurrencyRefresh();

  // Storage hooks
  const expenseOps = useExpenses();
  const categoryOps = useCategories();

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Close bottom sheet when navigating to this tab
      setShowExpenseSheet(false);
    }, [refreshKey])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentExpenses, budget, spent, allCategories] = await Promise.all([
        expenseOps.getCurrentMonthExpenses(),
        categoryOps.getTotalBudget(),
        expenseOps.getTotalSpent(),
        categoryOps.getCategories(),
      ]);

      const categoriesWithSpending = await Promise.all(
        allCategories.map(async (category) => {
          const categorySpent = await categoryOps.getCategorySpending(category.id);
          const percentage = category.budget > 0 ? (categorySpent / category.budget) * 100 : 0;
          return {
            ...category,
            spent: categorySpent,
            percentage: Math.min(percentage, 100),
          };
        })
      );

      const filteredCategories = categoriesWithSpending.filter(category => {
        if (category.id === SYSTEM_CATEGORIES.UNCATEGORIZED) {
          return category.spent > 0;
        }
        return true;
      });

      setExpenses(currentExpenses.slice(0, 5));
      setCategories(filteredCategories);
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
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 75) return theme.colors.tertiary;
    if (percentage >= 50) return theme.colors.primary;
    return theme.colors.secondary;
  };

  const handleExpenseAdded = () => {
    loadData();
  };

  const renderCategory = (category: CategoryWithSpending) => {
    const isUncategorized = category.id === SYSTEM_CATEGORIES.UNCATEGORIZED;

    if (isUncategorized) {
      return (
        <Card key={category.id} style={{ marginVertical: 4 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="titleMedium">{category.name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatAmountLocal(category.spent)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    const spentFormatted = formatAmountLocal(category.spent);
    const budgetFormatted = formatAmountLocal(category.budget);
    const remaining = category.budget - category.spent;
    const overBudget = category.spent - category.budget;
    const remainingFormatted = remaining >= 0 ? formatAmountLocal(remaining) : null;
    const overBudgetFormatted = remaining < 0 ? formatAmountLocal(overBudget) : null;

    return (
      <Card key={category.id} style={{ marginVertical: 4 }}>
        <Card.Content>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="titleMedium">{category.name}</Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: category.percentage >= 90 ? theme.colors.error :
                    category.percentage >= 75 ? theme.colors.tertiary :
                      theme.colors.secondary
                }}
              >
                {spentFormatted} / {budgetFormatted}
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <ProgressBar
                progress={category.percentage / 100}
                color={getProgressColor(category.percentage)}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {category.percentage.toFixed(1)}% used
                </Text>
                <Text
                  variant="bodySmall"
                  style={{
                    color: remaining >= 0 ? theme.colors.secondary : theme.colors.error
                  }}
                >
                  {remaining >= 0 ?
                    `${remainingFormatted} remaining` :
                    `${overBudgetFormatted} over budget`
                  }
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const remaining = totalBudget - totalSpent;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }} edges={['top', 'left', 'right']}>
      <Surface style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: theme.colors.surface }}>
        <Text variant="headlineSmall" style={{ fontWeight: '600' }}>Budget Overview</Text>
      </Surface>

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 200 }}>
        {loading ? (
          <Surface style={{ padding: 16, alignItems: 'center' }}>
            <Text>Loading...</Text>
          </Surface>
        ) : categories.length > 0 ? (
          <>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>Category Breakdown</Text>
            {categories.map(renderCategory)}

            {expenses.length > 0 && (
              <>
                <Divider style={{ marginVertical: 16 }} />
                <Text variant="titleLarge" style={{ marginBottom: 16 }}>Recent Expenses</Text>
                {expenses.map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <Card key={expense.id} style={{ marginVertical: 4 }}>
                      <Card.Content>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <View style={{ flex: 1, marginRight: 12 }}>
                            <Text variant="titleMedium">{expense.title}</Text>
                            {expense.description && (
                              <Text
                                variant="bodySmall"
                                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                              >
                                {expense.description}
                              </Text>
                            )}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {category?.name || 'Unknown'}
                              </Text>
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {new Date(expense.date).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                          <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                            {formatAmountLocal(expense.amount)}
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
                  );
                })}
              </>
            )}
          </>
        ) : (
          <Surface style={{ padding: 24, alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
              No budget categories found
            </Text>
            <Text variant="bodyMedium" style={{
              textAlign: 'center',
              color: theme.colors.onSurfaceVariant,
              marginBottom: 24
            }}>
              Set up budget categories in your profile to start tracking expenses.
            </Text>
          </Surface>
        )}
      </ScrollView>

      {/* Budget Summary - Fixed Bottom Section */}
      <Surface style={{
        padding: 16,
        backgroundColor: theme.colors.surface,
        elevation: 8,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Budget
            </Text>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              {formatAmountLocal(totalBudget)}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Spent
            </Text>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              {formatAmountLocal(totalSpent)}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Remaining
            </Text>
            <Text variant="titleMedium" style={{
              fontWeight: '600',
              color: remaining >= 0 ? theme.colors.secondary : theme.colors.error
            }}>
              {formatAmountLocal(remaining)}
            </Text>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={() => setShowExpenseSheet(true)}
          style={{ marginTop: 8 }}
        >
          New Expense
        </Button>
      </Surface>

      <ExpenseBottomSheet
        visible={showExpenseSheet}
        onDismiss={() => setShowExpenseSheet(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </SafeAreaView>
  );
} 