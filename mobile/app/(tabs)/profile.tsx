import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Surface,
  List,
  Menu
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCategories, usePaymentMethods, SUPPORTED_CURRENCIES, SYSTEM_CATEGORIES, formatAmount } from '../../storage';
import { Category, Currency, PaymentMethod } from '../../storage';
import { useCurrency } from '../../utils/CurrencyContext';
import CategoryBottomSheet from '../../components/CategoryBottomSheet';
import EditCategoryBottomSheet from '../../components/EditCategoryBottomSheet';
import PaymentMethodBottomSheet from '../../components/PaymentMethodBottomSheet';

export default function ProfileScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showEditCategorySheet, setShowEditCategorySheet] = useState(false);
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('JPY');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
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
                <View style={{
                  backgroundColor: theme.colors.primaryContainer,
                  borderRadius: 4,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onPrimaryContainer,
                      fontWeight: '600',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                    onPress={() => {
                      setEditingCategory(category);
                      setShowEditCategorySheet(true);
                    }}
                  >
                    Edit
                  </Text>
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

        <View style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 6,
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: 'center',
          marginTop: 32,
          borderWidth: 1,
          borderColor: theme.colors.primary,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '600',
              letterSpacing: 0.25
            }}
            onPress={() => setShowCategorySheet(true)}
          >
            New Category
          </Text>
        </View>

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
                    {method.type}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 4,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: '600',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    Edit
                  </Text>
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

        <View style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 6,
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: 'center',
          marginTop: 32,
          borderWidth: 1,
          borderColor: theme.colors.primary,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '600',
              letterSpacing: 0.25
            }}
            onPress={() => setShowPaymentMethodSheet(true)}
          >
            New Payment Method
          </Text>
        </View>
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
    </SafeAreaView>
  );
} 