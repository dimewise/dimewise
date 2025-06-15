import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Surface,
  Searchbar,
  FAB,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useExpenses, useCategories, usePaymentMethods, formatAmount } from '../../storage';
import { Expense, Category, PaymentMethod } from '../../storage';
import { useCurrency, useCurrencyRefresh } from '../../utils/CurrencyContext';
import ExpenseBottomSheet from '../../components/ExpenseBottomSheet';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);
  const theme = useTheme();
  const { currency } = useCurrency();
  const refreshKey = useCurrencyRefresh();

  // Storage hooks
  const expenseOps = useExpenses();
  const categoryOps = useCategories();
  const paymentMethodOps = usePaymentMethods();

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
      const [allExpenses, allCategories, allPaymentMethods] = await Promise.all([
        expenseOps.getExpenses(),
        categoryOps.getCategories(),
        paymentMethodOps.getPaymentMethods(),
      ]);

      setExpenses(allExpenses);
      setCategories(allCategories);
      setPaymentMethods(allPaymentMethods);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    loadData();
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchQuery ||
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || expense.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatAmountLocal = (amount: number) => {
    return formatAmount(amount, currency);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={{
          paddingTop: 16,
          paddingHorizontal: 24,
          paddingBottom: 16,
          backgroundColor: theme.colors.background
        }}>
          <Text variant="headlineMedium" style={{ fontWeight: '700', marginBottom: 16, color: theme.colors.onBackground }}>
            Expenses
          </Text>
          <Searchbar
            placeholder="Search expenses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.outline }}
          />
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 16, backgroundColor: theme.colors.background }}>
          {categories.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text variant="labelLarge" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>Filter by category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
                  <Chip
                    selected={selectedCategory === null}
                    onPress={() => setSelectedCategory(null)}
                  >
                    All
                  </Chip>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      selected={selectedCategory === category.id}
                      onPress={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                    >
                      {category.name}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 24, paddingBottom: 200 }}>
          {loading ? (
            <View style={{
              padding: 32,
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading expenses...</Text>
            </View>
          ) : expenses.length > 0 ? (
            expenses.map((expense) => {
              const category = categories.find(c => c.id === expense.categoryId);
              const paymentMethod = paymentMethods.find(p => p.id === expense.paymentMethodId);

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
                          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16, lineHeight: 20 }}
                        >
                          {expense.description}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
                        {paymentMethod && (
                          <View style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: theme.colors.surfaceVariant,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: theme.colors.outline,
                          }}>
                            <Text variant="bodySmall" style={{
                              color: theme.colors.onSurfaceVariant,
                              fontWeight: '500',
                              fontSize: 11,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5
                            }}>
                              {paymentMethod.name}
                            </Text>
                          </View>
                        )}
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
            })
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
                No expenses found
              </Text>
              <Text variant="bodyMedium" style={{
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                lineHeight: 24,
              }}>
                Start tracking your expenses by adding your first expense.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <View style={{
          position: 'absolute',
          bottom: 100,
          right: 24,
          backgroundColor: theme.colors.primary,
          borderRadius: 6,
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderWidth: 1,
          borderColor: theme.colors.primary,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '600',
              letterSpacing: 0.25
            }}
            onPress={() => setShowExpenseSheet(true)}
          >
            Add Expense
          </Text>
        </View>
      </SafeAreaView>

      <ExpenseBottomSheet
        visible={showExpenseSheet}
        onDismiss={() => setShowExpenseSheet(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </View>
  );
} 