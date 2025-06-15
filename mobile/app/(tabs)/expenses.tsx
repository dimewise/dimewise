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
import { useExpenses, useCategories, formatAmount } from '../../storage';
import { Expense, Category } from '../../storage';
import { useCurrency, useCurrencyRefresh } from '../../utils/CurrencyContext';
import ExpenseBottomSheet from '../../components/ExpenseBottomSheet';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
      const [allExpenses, allCategories] = await Promise.all([
        expenseOps.getExpenses(),
        categoryOps.getCategories(),
      ]);

      setExpenses(allExpenses);
      setCategories(allCategories);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }} edges={['top']}>
        <Surface style={{
          paddingTop: 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: theme.colors.surface
        }} elevation={1}>
          <Text variant="headlineSmall" style={{ fontWeight: '600', marginBottom: 16 }}>
            Expenses
          </Text>
          <Searchbar
            placeholder="Search expenses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 2 }}
          />
        </Surface>

        <View style={{ paddingHorizontal: 16, paddingBottom: 16, backgroundColor: theme.colors.background }}>
          {categories.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text variant="labelLarge">Filter by category:</Text>
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

        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
          {loading ? (
            <Surface style={{ padding: 16, alignItems: 'center' }}>
              <Text>Loading...</Text>
            </Surface>
          ) : filteredExpenses.length > 0 ? (
            <>
              <Text variant="bodyMedium" style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: 16
              }}>
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
              </Text>
              {filteredExpenses.map((expense) => (
                <Card key={expense.id} style={{ marginVertical: 4 }}>
                  <Card.Content>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8
                    }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text variant="titleMedium">{expense.title}</Text>
                        {expense.description && (
                          <Text
                            variant="bodySmall"
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              marginTop: 4
                            }}
                          >
                            {expense.description}
                          </Text>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {getCategoryName(expense.categoryId)}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {formatDate(expense.date)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                          {formatAmountLocal(expense.amount)}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </>
          ) : (
            <Surface style={{ padding: 24, alignItems: 'center' }}>
              <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
                {searchQuery || selectedCategory ? 'No matching expenses found' : 'No expenses found'}
              </Text>
              <Text variant="bodyMedium" style={{
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                marginBottom: 24
              }}>
                {searchQuery || selectedCategory ?
                  'Try adjusting your search or filter criteria.' :
                  'Start by adding your first expense.'
                }
              </Text>
            </Surface>
          )}
        </ScrollView>

        {/* Add Expense Button - Fixed Bottom Section */}
        <SafeAreaView style={{ backgroundColor: theme.colors.surface }} edges={['bottom']}>
          <Surface style={{
            padding: 16,
            backgroundColor: theme.colors.surface,
            elevation: 8,
          }}>
            <Button
              mode="contained"
              onPress={() => setShowExpenseSheet(true)}
            >
              Add Expense
            </Button>
          </Surface>
        </SafeAreaView>
      </SafeAreaView>

      <ExpenseBottomSheet
        visible={showExpenseSheet}
        onDismiss={() => setShowExpenseSheet(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </View>
  );
} 