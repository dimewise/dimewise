import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Menu,
  Dialog,
  Portal
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCategories, usePaymentMethods, SUPPORTED_CURRENCIES, SYSTEM_CATEGORIES, formatAmount } from '../../storage';
import { Category, Currency, PaymentMethod } from '../../storage';
import { useCurrency } from '../../utils/CurrencyContext';
import CategoryBottomSheet from '../../components/CategoryBottomSheet';
import EditCategoryBottomSheet from '../../components/EditCategoryBottomSheet';
import PaymentMethodBottomSheet from '../../components/PaymentMethodBottomSheet';
import EditPaymentMethodBottomSheet from '../../components/EditPaymentMethodBottomSheet';

const formatPaymentTypeForDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'cash': 'Cash',
    'bank_transfer': 'Bank Transfer',
    'digital_wallet': 'Digital Wallet',
    'other': 'Other'
  };
  return typeMap[type] || type;
};

export default function ProfileScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showEditCategorySheet, setShowEditCategorySheet] = useState(false);
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);
  const [showEditPaymentMethodSheet, setShowEditPaymentMethodSheet] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('JPY');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'paymentMethod', id: string, name: string } | null>(null);
  const theme = useTheme();
  const { currency, setCurrency } = useCurrency();

  // Storage hooks
  const categoryOps = useCategories();
  const paymentMethodOps = usePaymentMethods();

  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Close all bottom sheets when navigating to this tab
      setShowCategorySheet(false);
      setShowEditCategorySheet(false);
      setShowPaymentMethodSheet(false);
      setShowCurrencyMenu(false);
      setShowEditPaymentMethodSheet(false);
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [allCategories, allPaymentMethods] = await Promise.all([
        categoryOps.getCategories(),
        paymentMethodOps.getPaymentMethods(),
      ]);

      const userCategories = allCategories.filter(category =>
        category.id !== SYSTEM_CATEGORIES.UNCATEGORIZED
      );

      setCategories(userCategories);
      setPaymentMethods(allPaymentMethods);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    loadData();
  };

  const handleEditCategory = (category: Category) => {
    if (category.id === SYSTEM_CATEGORIES.UNCATEGORIZED) {
      return;
    }
    setEditingCategory(category);
    setShowEditCategorySheet(true);
  };

  const handleCategoryUpdated = () => {
    loadData();
  };

  const handlePaymentMethodAdded = () => {
    loadData();
  };

  const handlePaymentMethodUpdated = () => {
    loadData();
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      await paymentMethodOps.deletePaymentMethod(paymentMethodId);
      loadData();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (categoryId === SYSTEM_CATEGORIES.UNCATEGORIZED) {
      return;
    }

    try {
      await categoryOps.deleteCategory(categoryId);
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedCurrency) {
      return;
    }

    try {
      await setCurrency(selectedCurrency);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'category') {
        await handleDeleteCategory(itemToDelete.id);
      } else {
        await handleDeletePaymentMethod(itemToDelete.id);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const showDeleteConfirmation = (type: 'category' | 'paymentMethod', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setShowDeleteDialog(true);
  };

  const renderCurrencyMenu = () => (
    <Menu
      visible={showCurrencyMenu}
      onDismiss={() => setShowCurrencyMenu(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setShowCurrencyMenu(true)}
          contentStyle={{ justifyContent: 'flex-start' }}
        >
          {selectedCurrency || "Select currency"}
        </Button>
      }
    >
      {SUPPORTED_CURRENCIES.map((curr) => (
        <Menu.Item
          key={curr}
          onPress={() => {
            setSelectedCurrency(curr);
            setShowCurrencyMenu(false);
          }}
          title={curr}
        />
      ))}
    </Menu>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 24, paddingBottom: 200 }}>
        <Text variant="headlineMedium" style={{ marginBottom: 32, fontWeight: '700', color: theme.colors.onBackground }}>Budget Categories</Text>

        {loading ? (
          <View style={{
            padding: 32,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading categories...</Text>
          </View>
        ) : categories.length > 0 ? (
          categories.map((category) => (
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
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 6, color: theme.colors.onSurface }}>{category.name}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                    Budget: {formatAmount(category.budget, currency)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => {
                      setEditingCategory(category);
                      setShowEditCategorySheet(true);
                    }}
                    labelStyle={{
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                    contentStyle={{
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                    }}
                    style={{
                      borderRadius: 4,
                      minWidth: 60,
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => showDeleteConfirmation('category', category.id, category.name)}
                    labelStyle={{
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      color: theme.colors.error
                    }}
                    contentStyle={{
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                    }}
                    style={{
                      borderRadius: 4,
                      minWidth: 60,
                      borderColor: theme.colors.error,
                    }}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            </View>
          ))
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
              No categories found
            </Text>
            <Text variant="bodyMedium" style={{
              textAlign: 'center',
              color: theme.colors.onSurfaceVariant,
              lineHeight: 24,
            }}>
              Create your first budget category to start tracking expenses.
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={() => setShowCategorySheet(true)}
          contentStyle={{
            paddingVertical: 8,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.25
          }}
          style={{
            borderRadius: 6,
            marginTop: 32,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          New Category
        </Button>

        <View style={{ marginVertical: 40, height: 1, backgroundColor: theme.colors.outline }} />

        <Text variant="headlineMedium" style={{ marginBottom: 32, fontWeight: '700', color: theme.colors.onBackground }}>Payment Methods</Text>

        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <View key={method.id} style={{
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
                alignItems: 'center'
              }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 6, color: theme.colors.onSurface }}>{method.name}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                    {formatPaymentTypeForDisplay(method.type)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => {
                      setEditingPaymentMethod(method);
                      setShowEditPaymentMethodSheet(true);
                    }}
                    labelStyle={{
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                    contentStyle={{
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                    }}
                    style={{
                      borderRadius: 4,
                      minWidth: 60,
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => showDeleteConfirmation('paymentMethod', method.id, method.name)}
                    labelStyle={{
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      color: theme.colors.error
                    }}
                    contentStyle={{
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                    }}
                    style={{
                      borderRadius: 4,
                      minWidth: 60,
                      borderColor: theme.colors.error,
                    }}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            </View>
          ))
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
              No payment methods found
            </Text>
            <Text variant="bodyMedium" style={{
              textAlign: 'center',
              color: theme.colors.onSurfaceVariant,
              lineHeight: 24,
            }}>
              Add payment methods to track where your money comes from.
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={() => setShowPaymentMethodSheet(true)}
          contentStyle={{
            paddingVertical: 8,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.25
          }}
          style={{
            borderRadius: 6,
            marginTop: 32,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          New Payment Method
        </Button>
      </ScrollView>

      <CategoryBottomSheet
        visible={showCategorySheet}
        onDismiss={() => setShowCategorySheet(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      <EditCategoryBottomSheet
        visible={showEditCategorySheet}
        onDismiss={() => {
          setShowEditCategorySheet(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <PaymentMethodBottomSheet
        visible={showPaymentMethodSheet}
        onDismiss={() => setShowPaymentMethodSheet(false)}
        onPaymentMethodAdded={handlePaymentMethodAdded}
      />

      <EditPaymentMethodBottomSheet
        visible={showEditPaymentMethodSheet}
        onDismiss={() => {
          setShowEditPaymentMethodSheet(false);
          setEditingPaymentMethod(null);
        }}
        paymentMethod={editingPaymentMethod}
        onPaymentMethodUpdated={handlePaymentMethodUpdated}
      />

      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
          }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Confirm Delete
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              onPress={handleConfirmDelete}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
} 