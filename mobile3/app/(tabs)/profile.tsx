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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Surface style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: '600' }}>Profile</Text>
      </Surface>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <Surface style={{ padding: 16, alignItems: 'center' }}>
            <Text>Loading...</Text>
          </Surface>
        ) : (
          <>
            {/* Settings Section */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleLarge" style={{ marginBottom: 16 }}>Settings</Text>

                <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Currency</Text>
                {renderCurrencyMenu()}

                {selectedCurrency !== currency && (
                  <Button
                    mode="contained"
                    onPress={handleSaveSettings}
                    style={{ marginTop: 16 }}
                  >
                    Save Settings
                  </Button>
                )}
              </Card.Content>
            </Card>

            {/* Categories Section */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text variant="titleLarge">Categories</Text>
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={() => setShowCategorySheet(true)}
                    compact
                  >
                    Add
                  </Button>
                </View>

                {categories.length > 0 ? (
                  categories.map((category) => (
                    <List.Item
                      key={category.id}
                      title={category.name}
                      description={`Budget: ${formatAmount(category.budget, currency)}`}
                      left={props => <List.Icon {...props} icon="tag" />}
                      right={props => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Button
                            onPress={() => handleEditCategory(category)}
                            icon="pencil"
                            compact
                            mode="text"
                          >
                            Edit
                          </Button>
                          <Button
                            onPress={() => handleDeleteCategory(category.id)}
                            icon="delete"
                            compact
                            mode="text"
                            textColor={theme.colors.error}
                          >
                            Delete
                          </Button>
                        </View>
                      )}
                    />
                  ))
                ) : (
                  <Surface style={{ padding: 16, alignItems: 'center' }}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      No categories yet. Add your first category to get started.
                    </Text>
                  </Surface>
                )}
              </Card.Content>
            </Card>

            {/* Payment Methods Section */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text variant="titleLarge">Payment Methods</Text>
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={() => setShowPaymentMethodSheet(true)}
                    compact
                  >
                    Add
                  </Button>
                </View>

                {paymentMethods.length > 0 ? (
                  paymentMethods.map((paymentMethod) => (
                    <List.Item
                      key={paymentMethod.id}
                      title={paymentMethod.name}
                      description={paymentMethod.type}
                      left={props => <List.Icon {...props} icon="credit-card" />}
                      right={props => (
                        <Button
                          onPress={() => handleDeletePaymentMethod(paymentMethod.id)}
                          icon="delete"
                          compact
                          mode="text"
                          textColor={theme.colors.error}
                        >
                          Delete
                        </Button>
                      )}
                    />
                  ))
                ) : (
                  <Surface style={{ padding: 16, alignItems: 'center' }}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      No payment methods yet. Add your first payment method to get started.
                    </Text>
                  </Surface>
                )}
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>

      <CategoryBottomSheet
        visible={showCategorySheet}
        onDismiss={() => setShowCategorySheet(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      <EditCategoryBottomSheet
        visible={showEditCategorySheet}
        onDismiss={() => setShowEditCategorySheet(false)}
        category={editingCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <PaymentMethodBottomSheet
        visible={showPaymentMethodSheet}
        onDismiss={() => setShowPaymentMethodSheet(false)}
        onPaymentMethodAdded={handlePaymentMethodAdded}
      />
    </View>
  );
} 