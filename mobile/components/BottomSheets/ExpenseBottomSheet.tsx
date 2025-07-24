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
import { createExpense } from '../../db/mutation/expense';
import { getCategoriesByUserId } from '../../db/repository/category';
import { getPaymentMethodsByUserId } from '../../db/repository/paymentMethod';
import type { Category, NewExpense, PaymentMethod } from '../../db/schema';
import { generatedUUID, validateCurrencyInput } from '../../db/utils';
import { formatDateWithLocale } from '../../utils/datetime';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { useUser } from '../contexts/UserContext';
import { BSTextInput } from './BottomSheetTextInput';
import DropdownBottomSheet, { DropdownButton, type DropdownOption } from './DropdownBottomSheet';

interface ExpenseBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function ExpenseBottomSheet({ visible, onDismiss }: ExpenseBottomSheetProps) {
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
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible, resetForm]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKeys are intentionally used to trigger re-fetching
  useEffect(() => {
    if (!user) return;

    const categories = getCategoriesByUserId(user.id);
    setCategories(categories);

    const paymentMethods = getPaymentMethodsByUserId(user.id);
    setPaymentMethods(paymentMethods);
  }, [user, refreshKeys.categories, refreshKeys.paymentMethods]);

  const handleSubmit = async () => {
    if (!user) return;

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

    const newExpense: NewExpense = {
      id: generatedUUID(),
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      currency: userSetting?.currency ?? 'USD',
      categoryId: categoryId,
      paymentMethodId: paymentMethodId,
      incurredAt: date.toISOString(),
      userId: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    try {
      await createExpense(newExpense);

      onDismiss();
      triggerRefresh('expenses');
    } catch (e) {
      console.error('Failed to save expense:', e);
      setError(t('status.error'));
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

  // Backdrop component for tap-to-dismiss
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
        {formatDateWithLocale(date, userSetting?.preferredLanguage || 'en')}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          locale={userSetting?.preferredLanguage || 'en'}
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
              {t('expenses.newExpense')}
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
                  value={amount}
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
                  onPress={onDismiss}
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
                  {t('expenses.addExpense')}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
