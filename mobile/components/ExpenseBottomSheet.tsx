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
          contentStyle={{ justifyContent: 'flex-start' }}
        >
          {selectedCategory ? selectedCategory.name : "Select category"}
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
          contentStyle={{ justifyContent: 'flex-start' }}
        >
          {selectedPaymentMethod ? selectedPaymentMethod.name : "Select payment method"}
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
          <Text variant="headlineSmall" style={{ marginBottom: 24, fontWeight: '600' }}>
            Add New Expense
          </Text>

          {error ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.error, marginBottom: 16 }}>
              {error}
            </Text>
          ) : null}

          <View style={{ gap: 16 }}>
            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              placeholder="Enter expense title"
            />

            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              placeholder="Enter description"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label={`Amount (${currency})`}
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              placeholder="0.00"
              keyboardType="numeric"
            />

            <View style={{ gap: 8 }}>
              <Text variant="bodyMedium">Category</Text>
              {renderCategoryMenu()}
            </View>

            <View style={{ gap: 8 }}>
              <Text variant="bodyMedium">Payment Method</Text>
              {renderPaymentMethodMenu()}
            </View>

            <Divider style={{ marginVertical: 8 }} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={{ flex: 1 }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={{ flex: 1 }}
                loading={loading}
                disabled={loading}
              >
                Add Expense
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
} 