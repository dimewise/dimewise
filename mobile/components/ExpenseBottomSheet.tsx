import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Keyboard, Platform, Dimensions } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Surface,
  Divider
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownBottomSheet, { DropdownButton, DropdownOption } from './DropdownBottomSheet';
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
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);

  const theme = useTheme();
  const { currency } = useCurrency();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Storage hooks
  const categoryOps = useCategories();
  const expenseOps = useExpenses();
  const paymentMethodOps = usePaymentMethods();

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
    setDate(new Date());
    setError('');
    setShowCategoryDropdown(false);
    setShowPaymentMethodDropdown(false);
    setShowDatePicker(false);
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
        date.toISOString()
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker);
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const selectedCategory = categories.find(cat => cat.id === categoryId);
  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);

  // Convert categories to dropdown options
  const categoryOptions: DropdownOption[] = categories.map(category => ({
    label: category.name,
    value: category.id,
    id: category.id
  }));

  const renderCategoryDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowCategoryDropdown(true)}
        selectedValue={categoryId}
        options={categoryOptions}
        placeholder="Select Category"
        label="Category"
      />
      <DropdownBottomSheet
        visible={showCategoryDropdown}
        onDismiss={() => setShowCategoryDropdown(false)}
        options={categoryOptions}
        onSelect={(value) => setCategoryId(value)}
        selectedValue={categoryId}
        title="Select Category"
      />
    </>
  );

  // Convert payment methods to dropdown options
  const paymentMethodOptions: DropdownOption[] = paymentMethods.map(paymentMethod => ({
    label: paymentMethod.name,
    value: paymentMethod.id,
    id: paymentMethod.id
  }));

  const renderPaymentMethodDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowPaymentMethodDropdown(true)}
        selectedValue={paymentMethodId}
        options={paymentMethodOptions}
        placeholder="Select Payment Method"
        label="Payment Method"
      />
      <DropdownBottomSheet
        visible={showPaymentMethodDropdown}
        onDismiss={() => setShowPaymentMethodDropdown(false)}
        options={paymentMethodOptions}
        onSelect={(value) => setPaymentMethodId(value)}
        selectedValue={paymentMethodId}
        title="Select Payment Method"
      />
    </>
  );

  const renderDatePicker = () => (
    <>
      <Button
        mode="outlined"
        onPress={handleDatePickerToggle}
        contentStyle={{
          paddingVertical: 4,
          justifyContent: 'flex-start'
        }}
        labelStyle={{
          fontSize: 16,
          fontWeight: '500',
          textAlign: 'left'
        }}
        style={{
          borderRadius: 6,
          borderColor: theme.colors.outline,
          backgroundColor: theme.colors.surface
        }}
      >
        {formatDateForDisplay(date)}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
      maxDynamicContentSize={Dimensions.get('window').height * 0.85}
      enableContentPanningGesture
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

              <View>
                <Text variant="labelLarge" style={{
                  marginBottom: 8,
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '600'
                }}>
                  Date
                </Text>
                {renderDatePicker()}
              </View>

              <View style={{ gap: 16 }}>
                {renderCategoryDropdown()}
                {renderPaymentMethodDropdown()}
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