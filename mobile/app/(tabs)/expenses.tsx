import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Chip, FAB, Searchbar, Text, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditExpenseBottomSheet from '../../components/BottomSheets/EditExpenseBottomSheet';
import ExpenseBottomSheet from '../../components/BottomSheets/ExpenseBottomSheet';
import ExpenseDetailBottomSheet from '../../components/BottomSheets/ExpenseDetailBottomSheet';
import ExpenseFilterBottomSheet, { ExpenseFilters } from '../../components/BottomSheets/ExpenseFilterBottomSheet';
import { useRefreshKey } from '../../components/contexts/RefreshKeyContext';
import { useUser } from '../../components/contexts/UserContext';
import ErrorBoundary, { ExpensesErrorFallback } from '../../components/ErrorBoundary';
import ExpenseListItem from '../../components/ExpenseListItem';
import { getCategoriesByUserId } from '../../db/repository/category';
import { getExpensesWithDetailsByUserId, getExpensesWithDetailsByUserIdWithFilters } from '../../db/repository/expense';
import { getPaymentMethodsByUserId } from '../../db/repository/paymentMethod';
import type { ExpenseWithDetails } from '../../db/repository/types';
import type { Expense } from '../../db/schema';
import { useMultipleAsyncData } from '../../hooks/useAsyncData';
import { formatDateWithLocale } from '../../utils/datetime';

export default function ExpensesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ExpenseFilters>({});

  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useUser();
  const { refreshKeys, triggerRefresh } = useRefreshKey();
  const timeoutRef = useRef<number | null>(null);

  // Load all data using our optimized hook - expenses now include category/payment method data
  const { data, loading, error, refetch } = useMultipleAsyncData(
    {
      expenses: () => (user?.id ? getExpensesWithDetailsByUserIdWithFilters(user.id, {
        ...activeFilters,
        searchQuery: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
      }) : Promise.resolve([])),
      categories: () => (user?.id ? getCategoriesByUserId(user.id) : Promise.resolve([])),
      paymentMethods: () => (user?.id ? getPaymentMethodsByUserId(user.id) : Promise.resolve([])),
    },
    {
      immediate: !!user?.id,
      deps: [user?.id, refreshKeys.expenses, refreshKeys.categories, refreshKeys.paymentMethods, activeFilters, searchQuery, selectedCategory],
    },
  );

  // Expenses are now filtered at the database level
  const filteredExpenses = useMemo(() => {
    return (data?.expenses as ExpenseWithDetails[]) || [];
  }, [data?.expenses]);

  useFocusEffect(
    useCallback(() => {
      // Close bottom sheets when navigating to this tab
      setShowExpenseSheet(false);
      setShowDetailSheet(false);
      setShowEditSheet(false);
      setShowFilterSheet(false);
      setSelectedExpense(null);
      setIsTransitioningToEdit(false);

      // Reset filters when navigating away
      setActiveFilters({});
      setSelectedCategory(null);

      // Cleanup timeout on unmount
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []),
  );

  const handleExpenseAdded = () => {
    triggerRefresh('expenses');
  };

  const handleExpensePress = useCallback(
    (expense: Expense) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If detail sheet is already supposed to be open but user clicked again,
      // it means there's a display issue - force reset and reopen
      if (showDetailSheet) {
        setShowDetailSheet(false);
        setSelectedExpense(null);
        timeoutRef.current = setTimeout(() => {
          setSelectedExpense(expense);
          setShowDetailSheet(true);
        }, 100);
        return;
      }

      // If any other bottom sheet is currently open, add a small delay to avoid animation conflicts
      if (showExpenseSheet || showEditSheet) {
        timeoutRef.current = setTimeout(() => {
          setSelectedExpense(expense);
          setShowDetailSheet(true);
        }, 300);
      } else {
        setSelectedExpense(expense);
        setShowDetailSheet(true);
      }
    },
    [showDetailSheet, showExpenseSheet, showEditSheet],
  );

  const handleEditExpense = (_expense: Expense) => {
    setIsTransitioningToEdit(true);
    setShowDetailSheet(false);
    setShowEditSheet(true);
  };

  const handleExpenseUpdated = () => {
    triggerRefresh('expenses');
    setShowEditSheet(false);
    setSelectedExpense(null);
    setIsTransitioningToEdit(false);
  };

  const handleExpenseDeleted = () => {
    triggerRefresh('expenses');
    setShowDetailSheet(false);
    setSelectedExpense(null);
  };

  const handleApplyFilters = (filters: ExpenseFilters) => {
    setActiveFilters(filters);
    // Reset the old category filter since it's now handled in the filter sheet
    setSelectedCategory(null);
  };

  // Error fallback with retry
  if (error) {
    return (
      <ExpensesErrorFallback
        onRetry={() => {
          refetch();
        }}
      />
    );
  }

  return (
    <ErrorBoundary
      fallback={<ExpensesErrorFallback onRetry={refetch} />}
      onError={(error, errorInfo) => {
        console.error('Expenses page error:', error, errorInfo);
      }}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          edges={['top']}
        >
          {/* SEARCH HEADER */}
          <View
            style={{
              paddingTop: 16,
              paddingHorizontal: 24,
              paddingBottom: 16,
              backgroundColor: theme.colors.background,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text
                variant="headlineMedium"
                style={{
                  fontWeight: '700',
                  color: theme.colors.onBackground,
                }}
              >
                {t('expenses.title')}
              </Text>
              <IconButton
                icon="filter-variant"
                size={24}
                onPress={() => setShowFilterSheet(true)}
                iconColor={theme.colors.onBackground}
              />
            </View>
            <Searchbar
              placeholder={t('common.search')}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
            />
          </View>

          {/* ACTIVE FILTERS */}
          {(activeFilters.dateRange || activeFilters.verificationStatus || activeFilters.categoryId || selectedCategory) && (
            <View
              style={{
                paddingHorizontal: 24,
                paddingBottom: 16,
                backgroundColor: theme.colors.background,
              }}
            >
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="labelLarge"
                    style={{
                      color: theme.colors.onBackground,
                      fontWeight: '600',
                    }}
                  >
                    {t('common.filter')}:
                  </Text>
                  <Chip
                    onPress={() => {
                      setActiveFilters({});
                      setSelectedCategory(null);
                    }}
                    style={{ backgroundColor: theme.colors.errorContainer }}
                    textStyle={{ color: theme.colors.onErrorContainer }}
                  >
                    {t('expenses.filters.clearAll')}
                  </Chip>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {/* Date Range Filter */}
                  {activeFilters.dateRange && (
                    <Chip
                      selected
                      onPress={() => setShowFilterSheet(true)}
                    >
                      {`${formatDateWithLocale(new Date(activeFilters.dateRange.from), 'en')} - ${formatDateWithLocale(new Date(activeFilters.dateRange.to), 'en')}`}
                    </Chip>
                  )}

                  {/* Verification Status Filter */}
                  {activeFilters.verificationStatus && (
                    <Chip
                      selected
                      onPress={() => setShowFilterSheet(true)}
                    >
                      {activeFilters.verificationStatus === 'verified' ? t('expenses.filters.verified') : t('expenses.filters.unverified')}
                    </Chip>
                  )}

                  {/* Category Filter */}
                  {(activeFilters.categoryId || selectedCategory) && (
                    <Chip
                      selected
                      onPress={() => setShowFilterSheet(true)}
                    >
                      {data?.categories?.find(cat => cat.id === (activeFilters.categoryId || selectedCategory))?.name || 'Unknown Category'}
                    </Chip>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* EXPENSE LIST */}
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>{t('common.loadingExpenses')}</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 100,
                paddingHorizontal: 24,
              }}
            >
              {filteredExpenses.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text
                    variant="bodyLarge"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {searchQuery || selectedCategory
                      ? t('expenses.noMatchingExpenses')
                      : t('expenses.noExpensesYet')}
                  </Text>
                </View>
              ) : (
                filteredExpenses.map((expense: ExpenseWithDetails) => (
                  <ExpenseListItem
                    key={expense.id}
                    expense={expense}
                    category={expense.category}
                    paymentMethod={expense.paymentMethod}
                    onPress={() => handleExpensePress(expense)}
                  />
                ))
              )}
            </ScrollView>
          )}

          {/* FLOATING ACTION BUTTON */}
          <FAB
            icon="plus"
            label={t('expenses.newExpense')}
            onPress={() => {
              setShowExpenseSheet(true);
            }}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
            }}
          />

          {/* BOTTOM SHEETS */}
          <ExpenseBottomSheet
            visible={showExpenseSheet}
            onDismiss={() => {
              setShowExpenseSheet(false);
              handleExpenseAdded();
            }}
          />
          <ExpenseDetailBottomSheet
            visible={showDetailSheet}
            expenseId={selectedExpense?.id || null}
            onDismiss={() => {
              setShowDetailSheet(false);
              if (!isTransitioningToEdit) {
                setSelectedExpense(null);
              }
            }}
            onEdit={handleEditExpense}
            onDeleted={handleExpenseDeleted}
          />
          <EditExpenseBottomSheet
            visible={showEditSheet}
            expenseId={selectedExpense?.id || null}
            onDismiss={() => {
              setShowEditSheet(false);
              setSelectedExpense(null);
              setIsTransitioningToEdit(false);
            }}
            onExpenseUpdated={handleExpenseUpdated}
          />
          <ExpenseFilterBottomSheet
            visible={showFilterSheet}
            onDismiss={() => setShowFilterSheet(false)}
            onApplyFilters={handleApplyFilters}
            currentFilters={activeFilters}
          />
        </SafeAreaView>
      </View>
    </ErrorBoundary>
  );
}
