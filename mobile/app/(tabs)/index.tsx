import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  useTheme,
  Surface,
  Divider,
  Button,
  FAB
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) {
      return theme.colors.error;
    } else if (percentage >= 75) {
      return theme.colors.onSurfaceVariant;
    } else {
      return theme.colors.primary;
    }
  };

  const handleExpenseAdded = () => {
    loadData();
  };

  const renderCategory = (category: CategoryWithSpending) => {
    const isUncategorized = category.id === SYSTEM_CATEGORIES.UNCATEGORIZED;

    if (isUncategorized) {
      return (
        <View key={category.id} style={{
          marginVertical: 4,
          padding: 24,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onSurface }}>{category.name}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
              {formatAmountLocal(category.spent)}
            </Text>
          </View>
        </View>
      );
    }

    const spentFormatted = formatAmountLocal(category.spent);
    const budgetFormatted = formatAmountLocal(category.budget);
    const remaining = category.budget - category.spent;
    const overBudget = category.spent - category.budget;
    const remainingFormatted = remaining >= 0 ? formatAmountLocal(remaining) : null;
    const overBudgetFormatted = remaining < 0 ? formatAmountLocal(overBudget) : null;

    return (
      <View key={category.id} style={{
        marginVertical: 4,
        padding: 24,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}>
        <View style={{ gap: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onSurface }}>{category.name}</Text>
            <Text
              variant="bodyMedium"
              style={{
                fontWeight: '600',
                color: category.percentage >= 90 ? theme.colors.error :
                  category.percentage >= 75 ? theme.colors.onSurfaceVariant :
                    theme.colors.onSurface
              }}
            >
              {spentFormatted} / {budgetFormatted}
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <View style={{
              height: 6,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <View style={{
                height: '100%',
                width: `${Math.min(category.percentage, 100)}%`,
                backgroundColor: category.percentage >= 90 ? theme.colors.error :
                  category.percentage >= 75 ? theme.colors.onSurfaceVariant :
                    theme.colors.primary,
                borderRadius: 3,
              }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                {category.percentage.toFixed(1)}% used
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  fontWeight: '600',
                  color: remaining >= 0 ? theme.colors.onSurfaceVariant : theme.colors.error
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
      </View>
    );
  };

  const remaining = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Hero Section - Budget Overview */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ paddingVertical: 32 }}>
            {/* Header */}
            <View style={{
              alignItems: 'center',
              marginBottom: 32
            }}>
              <Text variant="headlineSmall" style={{
                fontWeight: '800',
                color: theme.colors.onSurface,
                letterSpacing: -0.5,
                marginBottom: 4
              }}>
                Monthly Budget
              </Text>
              <Text variant="bodyMedium" style={{
                color: theme.colors.onSurfaceVariant,
                fontWeight: '500',
                opacity: 0.8
              }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>

            {/* Progress Section */}
            <View style={{ marginBottom: 28 }}>
              {/* Custom Progress Bar Container */}
              <View style={{
                height: 16,
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 16,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}>
                {/* Progress Fill */}
                <View style={{
                  height: '100%',
                  width: `${Math.min(budgetPercentage, 100)}%`,
                  backgroundColor: budgetPercentage >= 95 ? '#FF4444' :
                    budgetPercentage >= 80 ? '#FF8800' :
                      '#00BF63',
                  borderRadius: 8,
                  shadowColor: budgetPercentage >= 95 ? '#FF4444' :
                    budgetPercentage >= 80 ? '#FF8800' :
                      '#00BF63',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 2,
                }} />
              </View>

              {/* Percentage Display */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4
              }}>
                <Text style={{
                  fontSize: 36,
                  fontWeight: '900',
                  color: budgetPercentage >= 90 ? '#FF4444' : theme.colors.onSurface,
                  letterSpacing: -1,
                  textAlign: 'center'
                }}>
                  {budgetPercentage.toFixed(0)}%
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.onSurfaceVariant,
                  marginLeft: 4,
                  marginTop: 8
                }}>
                  used
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 8,
              marginBottom: 20
            }}>
              {/* Spent */}
              <View style={{
                alignItems: 'center',
                flex: 1
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FF6B6B',
                    marginRight: 8
                  }} />
                  <Text variant="labelMedium" style={{
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Spent
                  </Text>
                </View>
                <Text variant="titleMedium" style={{
                  fontWeight: '700',
                  color: theme.colors.onSurface
                }}>
                  {formatAmountLocal(totalSpent)}
                </Text>
              </View>

              {/* Divider */}
              <View style={{
                width: 1,
                height: 32,
                backgroundColor: theme.colors.outline,
                opacity: 0.3,
                marginHorizontal: 16
              }} />

              {/* Remaining */}
              <View style={{
                alignItems: 'center',
                flex: 1
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: remaining >= 0 ? '#00BF63' : '#FF4444',
                    marginRight: 8
                  }} />
                  <Text variant="labelMedium" style={{
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    {remaining >= 0 ? 'Left' : 'Over'}
                  </Text>
                </View>
                <Text variant="titleMedium" style={{
                  fontWeight: '700',
                  color: remaining >= 0 ? theme.colors.onSurface : '#FF4444'
                }}>
                  {formatAmountLocal(Math.abs(remaining))}
                </Text>
              </View>
            </View>

            {/* Status Message */}
            <View style={{
              padding: 16,
              backgroundColor: budgetPercentage >= 90 ? '#FFF5F5' :
                budgetPercentage >= 75 ? '#FFF8F0' :
                  '#F0FFF4',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: budgetPercentage >= 90 ? '#FFE5E5' :
                budgetPercentage >= 75 ? '#FFF0E0' :
                  '#E5FFE5',
              alignItems: 'center'
            }}>
              <Text variant="bodyMedium" style={{
                color: budgetPercentage >= 90 ? '#D32F2F' :
                  budgetPercentage >= 75 ? '#F57C00' :
                    '#2E7D32',
                fontWeight: '600',
                textAlign: 'center',
                lineHeight: 20
              }}>
                {budgetPercentage >= 95 ? ' Budget exceeded! Consider reviewing expenses.' :
                  budgetPercentage >= 85 ? 'Nearing budget limit. Monitor spending.' :
                    budgetPercentage >= 60 ? 'On track with your budget.' :
                      'Great! You have plenty of budget remaining.'}
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={{
            padding: 32,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading...</Text>
          </View>
        ) : categories.length > 0 ? (
          <>
            <Text variant="headlineMedium" style={{ marginBottom: 24, fontWeight: '700', color: theme.colors.onBackground }}>Budget Categories</Text>
            {categories.map(renderCategory)}

            {expenses.length > 0 && (
              <>
                <View style={{ marginVertical: 32, height: 1, backgroundColor: theme.colors.outline }} />
                <Text variant="headlineMedium" style={{ marginBottom: 24, fontWeight: '700', color: theme.colors.onBackground }}>Recent Expenses</Text>
                {expenses.map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <View key={expense.id} style={{
                      marginVertical: 4,
                      padding: 24,
                      backgroundColor: theme.colors.surface,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.outline,
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <View style={{ flex: 1, marginRight: 20 }}>
                          <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 6, color: theme.colors.onSurface }}>{expense.title}</Text>
                          {expense.description && (
                            <Text
                              variant="bodySmall"
                              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12, lineHeight: 20 }}
                            >
                              {expense.description}
                            </Text>
                          )}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <View style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              backgroundColor: theme.colors.primaryContainer,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderColor: theme.colors.outline,
                            }}>
                              <Text variant="bodySmall" style={{
                                color: theme.colors.onPrimaryContainer,
                                fontWeight: '500',
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                              }}>
                                {category?.name || 'Unknown'}
                              </Text>
                            </View>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                              {new Date(expense.date).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                          {formatAmountLocal(expense.amount)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </>
        ) : (
          <View style={{
            padding: 48,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16, fontWeight: '600', color: theme.colors.onSurface }}>
              No budget categories found
            </Text>
            <Text variant="bodyMedium" style={{
              textAlign: 'center',
              color: theme.colors.onSurfaceVariant,
              lineHeight: 24,
            }}>
              Set up budget categories in your profile to start tracking expenses.
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label="New Expense"
        onPress={() => setShowExpenseSheet(true)}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      />

      <ExpenseBottomSheet
        visible={showExpenseSheet}
        onDismiss={() => setShowExpenseSheet(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </SafeAreaView>
  );
} 