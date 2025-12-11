import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { z } from 'zod';
import { FormTextInput } from '@/components/forms/FormTextInput';
import {
  type ExpenseCreate,
  type ExpenseUpdate,
  useGetCategoriesQuery,
  useGetExpensesByExpenseIdQuery,
  useGetPaymentMethodsQuery,
  usePostExpensesMutation,
  usePutExpensesByExpenseIdMutation,
} from '@/generated/api/api';
import { postExpenseBody } from '@/generated/types/expenses/expenses.zod';
import { useUserLocale } from '@/hooks/useUserLocale';
import { colors } from '@/theme/colors';
import {
  currencyUsesDecimals,
  formatCurrencyForInput,
  getCurrencyPlaceholder,
  parseCurrencyInput,
} from '@/utils/currency';
import { ModalButton } from './ModalButton';
import { ModalContainer } from './ModalContainer';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';

// Use the generated zod schema directly
type FormData = z.infer<typeof postExpenseBody>;

type Props = {
  visible: boolean;
  onClose: () => void;
  expenseId?: string;
  onSuccess?: () => void;
};

export const ExpenseFormModal = ({ visible, onClose, expenseId, onSuccess }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();
  const [displayValue, setDisplayValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const isEditMode = !!expenseId;

  // API hooks
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery({
    includeDeleted: false,
  });
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useGetPaymentMethodsQuery({
    includeDeleted: false,
  });
  const [createExpense, { isLoading: isCreating }] = usePostExpensesMutation();
  const [updateExpense, { isLoading: isUpdating }] = usePutExpensesByExpenseIdMutation();

  // Fetch existing expense data for edit mode
  const { data: existingExpense, isLoading: isLoadingExpense } = useGetExpensesByExpenseIdQuery(
    { expenseId: expenseId! },
    { skip: !isEditMode },
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(postExpenseBody),
    defaultValues: {
      title: '',
      description: null,
      amount: 0,
      category_id: '',
      payment_method_id: '',
      incurred_at: new Date().toISOString(),
    },
  });

  // Prefill form when existing expense data is loaded or modal opens
  useEffect(() => {
    if (visible) {
      if (existingExpense) {
        const expense = existingExpense;
        reset({
          title: expense.title,
          description: expense.description || null,
          amount: expense.amount,
          category_id: expense.category_id,
          payment_method_id: expense.payment_method_id,
          incurred_at: expense.incurred_at,
        });
        setSelectedDate(DateTime.fromISO(expense.incurred_at).toJSDate());
        setDisplayValue(formatCurrencyForInput(expense.amount, currency).toString());
      } else {
        reset({
          title: '',
          description: null,
          amount: 0,
          category_id: '',
          payment_method_id: '',
          incurred_at: new Date().toISOString(),
        });
        setSelectedDate(new Date());
        setDisplayValue('');
      }
      setExpandedField(null);
    }
  }, [visible, existingExpense, reset, currency]);

  const watchedDate = watch('incurred_at');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const amountToSave = parseCurrencyInput(data.amount.toString(), currency);

      if (isEditMode && expenseId) {
        const updateData: ExpenseUpdate = {
          title: data.title,
          description: data.description || null,
          amount: amountToSave,
          category_id: data.category_id,
          payment_method_id: data.payment_method_id,
          incurred_at: data.incurred_at,
        };

        await updateExpense({ expenseId, expenseUpdate: updateData }).unwrap();
      } else {
        const createData: ExpenseCreate = {
          title: data.title,
          description: data.description || null,
          amount: amountToSave,
          category_id: data.category_id,
          payment_method_id: data.payment_method_id,
          incurred_at: data.incurred_at,
        };

        await createExpense({ expenseCreate: createData }).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    }
  });

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Use native toISOString() for proper zod.iso.datetime format
      const isoString = selectedDate.toISOString();
      setValue('incurred_at', isoString);
    }
  };

  const toggleField = (fieldName: string) => {
    setExpandedField(expandedField === fieldName ? null : fieldName);
  };

  const formatDate = (dateString: string) => {
    return DateTime.fromISO(dateString).setLocale(locale).toLocaleString(DateTime.DATE_MED);
  };

  const getSelectedCategoryTitle = () => {
    const category = categories?.find((cat) => cat.id === watch('category_id'));
    return category?.title || t('form_select_category');
  };

  const getSelectedPaymentMethodTitle = () => {
    const method = paymentMethods?.find((method) => method.id === watch('payment_method_id'));
    return method?.title || t('form_select_payment_method');
  };

  const isLoading = isCreating || isUpdating || isLoadingExpense;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalHeader
          title={isEditMode ? t('settings_edit_expense') : t('settings_add_new_expense')}
          onClose={onClose}
        />

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerClassName="p-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={20}
        >
          <Pressable
            className="gap-5"
            onPress={() => setExpandedField(null)}
          >
            {/* Title */}
            <FormTextInput
              control={control}
              name="title"
              labelKey="form_expense_title"
              placeholderKey="form_expense_title_prompt"
              t={t}
              errors={errors}
            />

            {/* Amount */}
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur } }) => {
                const handleTextChange = (text: string) => {
                  if (!currencyUsesDecimals(currency)) {
                    setDisplayValue(text);
                    const numValue = text ? parseFloat(text) : 0;
                    onChange(numValue);
                    return;
                  }

                  const cleanText = text.replace(/[^0-9.]/g, '');

                  if (cleanText.includes('.')) {
                    const parts = cleanText.split('.');
                    if (parts.length <= 2) {
                      const decimalPart = parts[1] ? parts[1].substring(0, 2) : '';
                      const formattedText = parts[0] + '.' + decimalPart;
                      setDisplayValue(formattedText);
                      const numValue = formattedText ? parseFloat(formattedText) : 0;
                      onChange(numValue);
                    }
                  } else {
                    setDisplayValue(cleanText);
                    const numValue = cleanText ? parseFloat(cleanText) : 0;
                    onChange(numValue);
                  }
                };

                return (
                  <View className="gap-2">
                    <Text className="text-sm font-medium text-neutral-500">
                      {t('form_expense_amount')} ({currency})
                    </Text>
                    <TextInput
                      className={`bg-neutral-100 rounded-xl px-4 h-12 text-base text-neutral-900 ${
                        errors?.amount ? 'border border-red-500' : ''
                      }`}
                      keyboardType="numeric"
                      placeholder={getCurrencyPlaceholder(currency)}
                      value={displayValue}
                      onChangeText={handleTextChange}
                      onBlur={onBlur}
                      placeholderTextColor="#A3A3A3"
                    />
                    {errors?.amount && (
                      <Text className="text-sm text-red-500">
                        {String(errors.amount?.message ?? '')}
                      </Text>
                    )}
                  </View>
                );
              }}
            />

            {/* Date */}
            <Controller
              control={control}
              name="incurred_at"
              render={({ field: { value } }) => (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-neutral-500">
                    {t('form_expense_date')}
                  </Text>
                  <Pressable
                    className="flex-row justify-between items-center bg-neutral-100 rounded-xl px-4 h-12"
                    onPress={() => toggleField('date')}
                  >
                    <Text className="text-base text-neutral-900">{formatDate(value)}</Text>
                  </Pressable>
                  {expandedField === 'date' && (
                    <View className="bg-neutral-100 rounded-xl overflow-hidden">
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={onDateChange}
                        style={{ height: 200 }}
                        textColor={colors.neutral[900]}
                        themeVariant="light"
                        locale={locale}
                      />
                    </View>
                  )}
                  {errors?.incurred_at && (
                    <Text className="text-sm text-red-500">
                      {String(errors.incurred_at?.message ?? '')}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Category */}
            <Controller
              control={control}
              name="category_id"
              render={({ field: { onChange, value } }) => (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-neutral-500">
                    {t('form_expense_category')}
                  </Text>
                  <Pressable
                    className="flex-row justify-between items-center bg-neutral-100 rounded-xl px-4 h-12"
                    onPress={() => toggleField('category')}
                  >
                    <Text
                      className={`text-base ${value ? 'text-neutral-900' : 'text-neutral-400'}`}
                    >
                      {getSelectedCategoryTitle()}
                    </Text>
                  </Pressable>
                  {expandedField === 'category' && (
                    <View className="bg-neutral-100 rounded-xl overflow-hidden min-h-[200px]">
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={{ height: 200 }}
                        itemStyle={{ color: colors.neutral[900], fontSize: 16 }}
                      >
                        <Picker.Item
                          label={categoriesLoading ? t('form_loading') : t('form_select_category')}
                          value=""
                          color="#A3A3A3"
                        />
                        {categories?.map((category) => (
                          <Picker.Item
                            key={category.id}
                            label={category.title}
                            value={category.id}
                            color={colors.neutral[900]}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                  {errors?.category_id && (
                    <Text className="text-sm text-red-500">
                      {String(errors.category_id?.message ?? '')}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Payment Method */}
            <Controller
              control={control}
              name="payment_method_id"
              render={({ field: { onChange, value } }) => (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-neutral-500">
                    {t('form_expense_payment_method')}
                  </Text>
                  <Pressable
                    className="flex-row justify-between items-center bg-neutral-100 rounded-xl px-4 h-12"
                    onPress={() => toggleField('payment_method')}
                  >
                    <Text
                      className={`text-base ${value ? 'text-neutral-900' : 'text-neutral-400'}`}
                    >
                      {getSelectedPaymentMethodTitle()}
                    </Text>
                  </Pressable>
                  {expandedField === 'payment_method' && (
                    <View className="bg-neutral-100 rounded-xl overflow-hidden min-h-[200px]">
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={{ height: 200 }}
                        itemStyle={{ color: colors.neutral[900], fontSize: 16 }}
                      >
                        <Picker.Item
                          label={
                            paymentMethodsLoading
                              ? t('form_loading')
                              : t('form_select_payment_method')
                          }
                          value=""
                          color="#A3A3A3"
                        />
                        {paymentMethods?.map((method) => (
                          <Picker.Item
                            key={method.id}
                            label={method.title}
                            value={method.id}
                            color={colors.neutral[900]}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                  {errors?.payment_method_id && (
                    <Text className="text-sm text-red-500">
                      {String(errors.payment_method_id?.message ?? '')}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Description (Optional) */}
            <FormTextInput
              control={control}
              name="description"
              labelKey="form_expense_description"
              placeholderKey="form_expense_description_prompt"
              t={t}
              errors={errors}
              multiline
              numberOfLines={3}
            />
          </Pressable>
        </KeyboardAwareScrollView>

        <ModalFooter>
          <ModalButton
            onPress={onClose}
            variant="cancel"
            disabled={isLoading}
          >
            {t('form_cancel')}
          </ModalButton>
          <ModalButton
            onPress={onSubmit}
            variant="primary"
            loading={isLoading}
          >
            {t('form_save')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
