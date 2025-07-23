import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Keyboard, Platform, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateExpenseById } from '../../db/mutation/expense';
import { getCategoriesByUserId } from '../../db/repository/category';
import { getExpenseFullById } from '../../db/repository/expense';
import { getPaymentMethodsByUserId } from '../../db/repository/paymentMethod';
import type { Category, Expense, PaymentMethod } from '../../db/schema';
import { validateCurrencyInput } from '../../db/utils';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { useUser } from '../contexts/UserContext';
import { BSTextInput } from './BottomSheetTextInput';
import DropdownBottomSheet, { DropdownButton, type DropdownOption } from './DropdownBottomSheet';

interface EditExpenseBottomSheetProps {
  visible: boolean;
  expenseId: string | null;
  onDismiss: () => void;
  onCancel?: () => void;
  onExpenseUpdated?: () => void;
}

export default function EditExpenseBottomSheet({
  visible,
  expenseId,
  onDismiss,
  onCancel,
  onExpenseUpdated,
}: EditExpenseBottomSheetProps) {
  const [targetExpense, setTargetExpense] = useState<Expense | null>(null);
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
  const { t } = useTranslation();
  const { user, userSetting } = useUser();
  const { refreshKeys, triggerRefresh } = useRefreshKey();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const populateForm = useCallback(() => {
    if (targetExpense) {
      setTitle(targetExpense.title);
      setDescription(targetExpense.description || '');
      setAmount(targetExpense.amount.toString());
      setCategoryId(targetExpense.categoryId ?? '');
      setPaymentMethodId(targetExpense.paymentMethodId ?? '');
      setDate(new Date(targetExpense.incurredAt));
    }
  }, [targetExpense]);

  const resetForm = useCallback(() => {
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
  }, []);

  useEffect(() => {
    if (visible && expenseId) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      if (!visible) {
        resetForm();
      }
    }
  }, [visible, expenseId, resetForm]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKeys are intentionally used to trigger re-fetching
  useEffect(() => {
    if (!user || !expenseId) return;

    const targetExpense = getExpenseFullById(expenseId);
    setTargetExpense(targetExpense);

    const categories = getCategoriesByUserId(user.id);
    setCategories(categories);

    const paymentMethods = getPaymentMethodsByUserId(user.id);
    setPaymentMethods(paymentMethods);
  }, [user, expenseId, refreshKeys.categories, refreshKeys.paymentMethods]);

  // Separate effect to populate form after data is loaded
  useEffect(() => {
    if (visible && expenseId && categories.length > 0 && paymentMethods.length > 0) {
      populateForm();
    }
  }, [visible, expenseId, categories, paymentMethods, populateForm]);

  const handleSubmit = async () => {
    if (!targetExpense) return;

    if (!title.trim()) {
      setError(t('forms.titleRequired'));
      return;
    }

    const validation = validateCurrencyInput(amount, userSetting?.currency ?? 'USD');
    if (!validation.isValid) {
      setError(validation.error || t('forms.validAmountRequired'));
      return;
    }

    if (!categoryId) {
      setError(t('forms.categoryRequired'));
      return;
    }

    if (!paymentMethodId) {
      setError(t('forms.paymentMethodRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedExpense: Expense = {
        ...targetExpense,
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        categoryId,
        paymentMethodId,
        incurredAt: date.toISOString(),
      };

      await updateExpenseById(updatedExpense);

      onDismiss();
      onExpenseUpdated?.();
      triggerRefresh('expenses');
    } catch (e) {
      console.error('Failed to update expense:', e);
      setError(t('forms.updateExpenseError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onDismiss}
      />
    ),
    [onDismiss],
  );

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
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
      day: 'numeric',
    });
  };

  // Convert categories to dropdown options (excluding uncategorized)
  const categoryOptions: DropdownOption[] = categories.map((category) => ({
    label: category.name,
    value: category.id,
    id: category.id,
  }));

  const renderCategoryDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowCategoryDropdown(true)}
        selectedValue={categoryId}
        options={categoryOptions}
        placeholder={t('forms.selectCategory')}
        label={t('expenses.category')}
      />
      <DropdownBottomSheet
        visible={showCategoryDropdown}
        onDismiss={() => setShowCategoryDropdown(false)}
        options={categoryOptions}
        onSelect={(value) => setCategoryId(value)}
        selectedValue={categoryId}
        title={t('forms.selectCategory')}
      />
    </>
  );

  // Convert payment methods to dropdown options
  const paymentMethodOptions: DropdownOption[] = paymentMethods.map((paymentMethod) => ({
    label: paymentMethod.name,
    value: paymentMethod.id,
    id: paymentMethod.id,
  }));

  const renderPaymentMethodDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowPaymentMethodDropdown(true)}
        selectedValue={paymentMethodId}
        options={paymentMethodOptions}
        placeholder={t('forms.selectPaymentMethod')}
        label={t('expenses.paymentMethod')}
      />
      <DropdownBottomSheet
        visible={showPaymentMethodDropdown}
        onDismiss={() => setShowPaymentMethodDropdown(false)}
        options={paymentMethodOptions}
        onSelect={(value) => setPaymentMethodId(value)}
        selectedValue={paymentMethodId}
        title={t('forms.selectPaymentMethod')}
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
          justifyContent: 'flex-start',
        }}
        labelStyle={{
          fontSize: 16,
          fontWeight: '500',
          textAlign: 'left',
        }}
        style={{
          borderRadius: 6,
          borderColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
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

  if (!targetExpense) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
      maxDynamicContentSize={Dimensions.get('window').height * 0.9}
      enableContentPanningGesture
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="never"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={false}
      >
        <SafeAreaView
          edges={['bottom']}
          style={{ flex: 1 }}
        >
          <View
            style={{
              padding: 8,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Text
              variant="headlineMedium"
              style={{
                marginBottom: 32,
                fontWeight: '700',
                color: theme.colors.onSurface,
                textAlign: 'center',
              }}
            >
              {t('expenses.editExpense')}
            </Text>

            {error ? (
              <View
                style={{
                  padding: 16,
                  backgroundColor: theme.colors.errorContainer,
                  borderRadius: 6,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onErrorContainer,
                    fontWeight: '500',
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={{ gap: 24 }}>
              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    marginBottom: 8,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                  }}
                >
                  {t('forms.title')}
                </Text>
                <BSTextInput
                  defaultValue={title}
                  onChangeText={setTitle}
                  placeholder={t('forms.title')}
                />
              </View>

              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    marginBottom: 8,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                  }}
                >
                  {t('forms.descriptionOptional')}
                </Text>
                <BSTextInput
                  defaultValue={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  placeholder={t('forms.descriptionOptional')}
                />
              </View>

              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    marginBottom: 8,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                  }}
                >
                  {t('forms.amountCurrency', {
                    currency: userSetting?.currency ?? 'USD',
                  })}
                </Text>
                <BSTextInput
                  defaultValue={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder={t('forms.amountCurrency', {
                    currency: userSetting?.currency ?? 'USD',
                  })}
                />
              </View>

              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    marginBottom: 8,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                  }}
                >
                  {t('expenses.date')}
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
                  onPress={onCancel || onDismiss}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 0.25,
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                  }}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 0.25,
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
                  {t('actions.saveChanges')}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
