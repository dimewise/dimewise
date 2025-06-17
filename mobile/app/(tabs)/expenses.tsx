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
import ExpenseListItem from '../../components/ExpenseListItem';
import ExpenseDetailBottomSheet from '../../components/ExpenseDetailBottomSheet';
import EditExpenseBottomSheet from '../../components/EditExpenseBottomSheet';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);
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
      // Close bottom sheets when navigating to this tab
      setShowExpenseSheet(false);
      setShowDetailSheet(false);
      setShowEditSheet(false);
      setSelectedExpense(null);
      setIsTransitioningToEdit(false);
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

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetailSheet(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setIsTransitioningToEdit(true);
    setShowDetailSheet(false);
    setShowEditSheet(true);
  };

  const handleExpenseUpdated = () => {
    loadData();
    setShowEditSheet(false);
    setSelectedExpense(null);
    setIsTransitioningToEdit(false);
  };

  const handleExpenseDeleted = () => {
    loadData();
    setShowDetailSheet(false);
    setSelectedExpense(null);
  };

  const handleExpenseVerificationUpdated = async () => {
    await loadData(); // Reload data to get updated verification status

    // Update the selectedExpense with fresh data
    if (selectedExpense) {
      const updatedExpenses = await expenseOps.getExpenses();
      const freshExpense = updatedExpenses.find(e => e.id === selectedExpense.id);
      if (freshExpense) {
        setSelectedExpense(freshExpense);
      }
    }
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
          ) : filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => {
              const category = categories.find(c => c.id === expense.categoryId);
              const paymentMethod = paymentMethods.find(p => p.id === expense.paymentMethodId);

              return (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  category={category}
                  paymentMethod={paymentMethod}
                  onPress={handleExpensePress}
                />
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
                {searchQuery || selectedCategory ? 'No matching expenses found' : 'No expenses found'}
              </Text>
              <Text variant="bodyMedium" style={{
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                lineHeight: 24,
              }}>
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start tracking your expenses by adding your first expense.'
                }
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
      </SafeAreaView>

      <ExpenseBottomSheet
        visible={showExpenseSheet}
        onDismiss={() => setShowExpenseSheet(false)}
        onExpenseAdded={handleExpenseAdded}
      />

      <ExpenseDetailBottomSheet
        visible={showDetailSheet}
        expense={selectedExpense}
        category={selectedExpense ? categories.find(c => c.id === selectedExpense.categoryId) : undefined}
        paymentMethod={selectedExpense ? paymentMethods.find(p => p.id === selectedExpense.paymentMethodId) : undefined}
        onDismiss={() => {
          setShowDetailSheet(false);
          if (!isTransitioningToEdit) {
            setSelectedExpense(null);
          }
        }}
        onEdit={handleEditExpense}
        onDeleted={handleExpenseDeleted}
        onExpenseUpdated={handleExpenseVerificationUpdated}
      />

      <EditExpenseBottomSheet
        visible={showEditSheet}
        expense={selectedExpense}
        onDismiss={() => {
          setShowEditSheet(false);
          setSelectedExpense(null);
          setIsTransitioningToEdit(false);
        }}
        onCancel={() => {
          setShowEditSheet(false);
          setShowDetailSheet(true);
        }}
        onExpenseUpdated={handleExpenseUpdated}
      />
    </View>
  );
} 