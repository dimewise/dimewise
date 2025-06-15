import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Keyboard } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Menu,
  Surface,
  Divider
} from 'react-native-paper';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategories, useExpenses, usePaymentMethods, validateCurrencyInput } from '../storage';
import { Category, PaymentMethod } from '../storage';
import { useCurrency } from '../utils/CurrencyContext';

interface ExpenseBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onExpenseAdded?: () => void;
}

export default function ExpenseBottomSheet({ visible, onDismiss, onExpenseAdded }: ExpenseBottomSheetProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPaymentMethodMenu, setShowPaymentMethodMenu] = useState(false);

  const theme = useTheme();
  const { currency } = useCurrency();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Storage hooks
  const categoryOps = useCategories();
  const expenseOps = useExpenses();
  const paymentMethodOps = usePaymentMethods();

  // Bottom sheet snap points - using dynamic sizing
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
      loadData();
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [cats, payMethods] = await Promise.all([
        categoryOps.getCategories(),
        paymentMethodOps.getPaymentMethods(),
      ]);
      setCategories(cats);
      setPaymentMethods(payMethods);
    } catch (e) {
      console.error('Failed to load data:', e);
      setError('Failed to load data. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setCategoryId('');
    setPaymentMethodId('');
    setError('');
    setShowCategoryMenu(false);
    setShowPaymentMethodMenu(false);
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const validation = validateCurrencyInput(amount, currency);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid amount');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    if (!paymentMethodId) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await expenseOps.createExpense(
        title.trim(),
        description.trim(),
        Number(amount),
        currency,
        categoryId,
        paymentMethodId,
        new Date().toISOString()
      );

      onDismiss();
      onExpenseAdded?.();
    } catch (e) {
      console.error('Failed to save expense:', e);
      setError('Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onDismiss();
    }
  }, [onDismiss]);

  // Backdrop component for tap-to-dismiss
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onDismiss}
      />
    ),
    [onDismiss]
  );

  const selectedCategory = categories.find(cat => cat.id === categoryId);
  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);

  const renderCategoryMenu = () => (
    <Menu
      visible={showCategoryMenu}
      onDismiss={() => setShowCategoryMenu(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setShowCategoryMenu(true)}
          contentStyle={{
            justifyContent: 'flex-start',
            paddingVertical: 12,
            paddingHorizontal: 20,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}
          style={{
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}
        >
          {selectedCategory ? selectedCategory.name : 'Select Category'}
        </Button>
      }
    >
      {categories.map((category) => (
        <Menu.Item
          key={category.id}
          onPress={() => {
            setCategoryId(category.id);
            setShowCategoryMenu(false);
          }}
          title={category.name}
        />
      ))}
    </Menu>
  );

  const renderPaymentMethodMenu = () => (
    <Menu
      visible={showPaymentMethodMenu}
      onDismiss={() => setShowPaymentMethodMenu(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setShowPaymentMethodMenu(true)}
          contentStyle={{
            justifyContent: 'flex-start',
            paddingVertical: 12,
            paddingHorizontal: 20,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}
          style={{
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}
        >
          {selectedPaymentMethod ? selectedPaymentMethod.name : 'Select Payment Method'}
        </Button>
      }
    >
      {paymentMethods.map((paymentMethod) => (
        <Menu.Item
          key={paymentMethod.id}
          onPress={() => {
            setPaymentMethodId(paymentMethod.id);
            setShowPaymentMethodMenu(false);
          }}
          title={paymentMethod.name}
        />
      ))}
    </Menu>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <View style={{
            padding: 8,
            backgroundColor: theme.colors.surface,
          }}>
            <Text variant="headlineMedium" style={{
              marginBottom: 32,
              fontWeight: '700',
              color: theme.colors.onSurface,
              textAlign: 'center'
            }}>
              New Expense
            </Text>

            {error ? (
              <View style={{
                padding: 16,
                backgroundColor: theme.colors.errorContainer,
                borderRadius: 6,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer, fontWeight: '500' }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={{ gap: 24 }}>
              <TextInput
                label="Title"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                style={{ backgroundColor: theme.colors.surface }}
                outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 6 }}
                contentStyle={{ fontWeight: '500' }}
              />

              <TextInput
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={{ backgroundColor: theme.colors.surface }}
                outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 6 }}
                contentStyle={{ fontWeight: '500' }}
              />

              <TextInput
                label={`Amount (${currency})`}
                value={amount}
                onChangeText={setAmount}
                mode="outlined"
                keyboardType="numeric"
                style={{ backgroundColor: theme.colors.surface }}
                outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 6 }}
                contentStyle={{ fontWeight: '600', fontSize: 16 }}
              />

              <View style={{ gap: 16 }}>
                {renderCategoryMenu()}
                {renderPaymentMethodMenu()}
              </View>

              <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  contentStyle={{
                    paddingVertical: 8,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 0.25
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  contentStyle={{
                    paddingVertical: 8,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 0.25
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  Save Expense
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
} 