import { useEffect, useState, useCallback } from 'react';
import { Button, H2, Input, ScrollView, Text, YStack, XStack, View, H3, H4, Select, Adapt, Sheet } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useToastController } from '@tamagui/toast';
import { getCategories, deleteCategory, SUPPORTED_CURRENCIES, formatAmount, getPaymentMethods, deletePaymentMethod, resetDatabase } from '../../utils/storage';
import { Category, Currency, PaymentMethod } from '../../utils/storage';
import { Trash, Plus, ChevronDown, Edit3 } from '@tamagui/lucide-icons';
import CategorySheet from '../../components/CategorySheet';
import EditCategorySheet from '../../components/EditCategorySheet';
import PaymentMethodSheet from '../../components/PaymentMethodSheet';
import { useCurrency } from '../../utils/CurrencyContext';

export default function ProfileScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showEditCategorySheet, setShowEditCategorySheet] = useState(false);
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('JPY');
  const insets = useSafeAreaInsets();
  const toast = useToastController();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    // Sync selected currency with context
    setSelectedCurrency(currency);
  }, [currency]);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when page comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [allCategories, allPaymentMethods] = await Promise.all([
        getCategories(),
        getPaymentMethods(),
      ]);
      setCategories(allCategories);
      setPaymentMethods(allPaymentMethods);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    loadData(); // Refresh data when category is added
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategorySheet(true);
  };

  const handleCategoryUpdated = () => {
    loadData(); // Refresh data when category is updated
  };

  const handlePaymentMethodAdded = () => {
    loadData(); // Refresh data when payment method is added
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      await deletePaymentMethod(paymentMethodId);
      toast.show('Payment method deleted successfully!', {
        message: 'Your payment method has been removed.',
      });
      // Refresh payment methods
      loadData();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.show('Error', {
        message: 'Failed to delete payment method. Please try again.',
        type: 'error',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast.show('Category deleted successfully!', {
        message: 'Your category has been removed.',
      });
      // Refresh categories
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.show('Error', {
        message: 'Failed to delete category. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedCurrency) {
      setError('Currency is required');
      return;
    }

    try {
      await setCurrency(selectedCurrency);
      setError('');
      toast.show('Settings saved successfully!', {
        message: 'Your currency has been updated.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
      toast.show('Error', {
        message: 'Failed to save settings. Please try again.',
        type: 'error',
      });
    }
  };

  // DEVELOPMENT ONLY - Comment out for production
  const handleResetDatabase = async () => {
    try {
      await resetDatabase();
      toast.show('Database reset successfully!', {
        message: 'All data has been cleared and fresh database created.',
      });
      // Refresh all data
      loadData();
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.show('Error', {
        message: 'Failed to reset database. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <View flex={1} bg="$background">
      <YStack p="$4" pt={insets.top + 16}>
        <H3 fontWeight="600">Profile</H3>
      </YStack>
      <ScrollView flex={1}>
        <YStack p="$4" gap="$7">
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              <YStack gap="$4">
                <H4>Settings</H4>

                {error ? <Text color="$red10">{error}</Text> : null}

                <Text>Currency</Text>
                <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as Currency)}>
                  <Select.Trigger iconAfter={<ChevronDown />}>
                    <Select.Value placeholder="Select currency">
                      {selectedCurrency || "Select currency"}
                    </Select.Value>
                  </Select.Trigger>

                  <Adapt when="maxMd" platform="touch">
                    <Sheet native={false} modal dismissOnSnapToBottom animation="medium" zIndex={300000}>
                      <Sheet.Frame bg="$black2" pt="$5" pb="$8" px="$4" gap="$4">
                        <Sheet.ScrollView>
                          <Adapt.Contents />
                        </Sheet.ScrollView>
                      </Sheet.Frame>
                      <Sheet.Overlay
                        opacity={0.8}
                        animation="200ms"
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                      />
                    </Sheet>
                  </Adapt>

                  <Select.Content zIndex={400000}>
                    <Select.Viewport>
                      <Select.Group>
                        {SUPPORTED_CURRENCIES.map((curr, index) => (
                          <Select.Item key={curr} index={index} value={curr} bg="$black2">
                            <Select.ItemText fontSize="$5">{curr}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Viewport>
                  </Select.Content>
                </Select>
                <Button onPress={handleSaveSettings}>
                  Save Settings
                </Button>

                {/* DEVELOPMENT ONLY - Comment out for production */}
                <Button variant="outlined" color="$red10" onPress={handleResetDatabase}>
                  Reset Database (DEV)
                </Button>
              </YStack>
              <YStack gap="$4">
                <XStack justify="space-between" verticalAlign="center" >
                  <H4>Categories</H4>
                  <Button icon={<Plus size={16} />} onPress={() => setShowCategorySheet(true)}>
                    Add Category
                  </Button>
                </XStack>
                {categories.length > 0 ? (
                  <YStack gap="$3">
                    {categories.map(category => (
                      <XStack key={category.id} gap="$3">
                        <YStack flex={1}>
                          <Text fontWeight="bold">{category.name}</Text>
                          <Text>{formatAmount(category.budget, currency)}</Text>
                        </YStack>
                        <XStack gap="$2">
                          <Button
                            size="$2"
                            circular
                            onPress={() => handleEditCategory(category)}
                            icon={<Edit3 size={16} />}
                            variant="outlined"
                          />
                          <Button
                            size="$2"
                            circular
                            onPress={() => handleDeleteCategory(category.id)}
                            icon={<Trash size={16} />}
                          />
                        </XStack>
                      </XStack>
                    ))}
                  </YStack>
                ) : (
                  <Text>No categories yet. Add your first one above.</Text>
                )}
              </YStack>
              <YStack gap="$4">
                <XStack justify="space-between" verticalAlign="center" >
                  <H4>Payment Methods</H4>
                  <Button icon={<Plus size={16} />} onPress={() => setShowPaymentMethodSheet(true)}>
                    Add Method
                  </Button>
                </XStack>
                {paymentMethods.length > 0 ? (
                  <YStack gap="$3">
                    {paymentMethods.map(paymentMethod => (
                      <XStack key={paymentMethod.id} gap="$3">
                        <YStack flex={1}>
                          <Text fontWeight="bold">{paymentMethod.name}</Text>
                          <Text opacity={0.7}>
                            {paymentMethod.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                        </YStack>
                        <Button
                          size="$2"
                          circular
                          onPress={() => handleDeletePaymentMethod(paymentMethod.id)}
                          icon={<Trash size={16} />}
                        />
                      </XStack>
                    ))}
                  </YStack>
                ) : (
                  <Text>No payment methods yet. Add your first one above.</Text>
                )}
              </YStack>
            </>
          )}
        </YStack>
      </ScrollView>
      <CategorySheet
        open={showCategorySheet}
        onOpenChange={setShowCategorySheet}
        onCategoryAdded={handleCategoryAdded}
      />
      <EditCategorySheet
        open={showEditCategorySheet}
        onOpenChange={setShowEditCategorySheet}
        category={editingCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />
      <PaymentMethodSheet
        open={showPaymentMethodSheet}
        onOpenChange={setShowPaymentMethodSheet}
        onPaymentMethodAdded={handlePaymentMethodAdded}
      />
    </View>
  );
} 