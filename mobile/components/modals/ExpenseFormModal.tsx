import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { DateTime } from 'luxon';
import { FormTextInput } from '@/components/forms/FormTextInput';
import {
  useGetCategoriesQuery,
  useGetPaymentMethodsQuery,
  usePostExpensesMutation,
  useGetExpensesByExpenseIdQuery,
  usePutExpensesByExpenseIdMutation,
  type ExpenseCreate,
  type ExpenseUpdate,
} from '@/generated/api/api';
import { postExpenseBody } from '@/generated/types/expenses/expenses.zod';
import { z } from 'zod';
import { colors } from '@/theme/colors';
import { useUserLocale } from '@/hooks/useUserLocale';
import {
  currencyUsesDecimals,
  parseCurrencyInput,
  formatCurrencyForInput,
  getCurrencyPlaceholder,
} from '@/utils/currency';
import { ModalContainer } from './ModalContainer';
import { ModalHeader } from './ModalHeader';
import { ModalFooter } from './ModalFooter';
import { ModalButton } from './ModalButton';

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
        />

        <TouchableWithoutFeedback onPress={() => setExpandedField(null)}>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              <FormTextInput
                control={control}
                name="title"
                labelKey="form_expense_title"
                placeholderKey="form_expense_title_prompt"
                colors={colors}
                t={t}
                errors={errors}
                animateView
              />

              <Controller
                control={control}
                name="incurred_at"
                render={({ field: { value } }) => (
                  <View style={styles.collapsibleContainer}>
                    <Pressable
                      style={styles.collapsibleHeader}
                      onPress={() => toggleField('date')}
                    >
                      <Text style={styles.collapsibleLabel}>{t('form_expense_date')}</Text>
                      <Text style={styles.collapsibleValue}>{formatDate(value)}</Text>
                    </Pressable>
                    {expandedField === 'date' && (
                      <View style={styles.pickerWrapper}>
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display="spinner"
                          onChange={onDateChange}
                          style={styles.datePicker}
                          textColor={colors.textPrimary}
                          themeVariant="dark"
                          locale={locale}
                        />
                      </View>
                    )}
                    {errors?.incurred_at && (
                      <Text style={styles.errorText}>
                        {String(errors.incurred_at?.message ?? '')}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Category - Collapsible */}
              <Controller
                control={control}
                name="category_id"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.collapsibleContainer}>
                    <Pressable
                      style={styles.collapsibleHeader}
                      onPress={() => toggleField('category')}
                    >
                      <Text style={styles.collapsibleLabel}>{t('form_expense_category')}</Text>
                      <Text style={[styles.collapsibleValue, !value && styles.placeholderText]}>
                        {getSelectedCategoryTitle()}
                      </Text>
                    </Pressable>
                    {expandedField === 'category' && (
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={value}
                          onValueChange={onChange}
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item
                            label={categoriesLoading ? t('form_loading') : t('form_select_category')}
                            value=""
                            color={colors.disabled}
                          />
                          {categories?.map((category) => (
                            <Picker.Item
                              key={category.id}
                              label={category.title}
                              value={category.id}
                              color={colors.textPrimary}
                            />
                          ))}
                        </Picker>
                      </View>
                    )}
                    {errors?.category_id && (
                      <Text style={styles.errorText}>
                        {String(errors.category_id?.message ?? '')}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Payment Method - Collapsible */}
              <Controller
                control={control}
                name="payment_method_id"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.collapsibleContainer}>
                    <Pressable
                      style={styles.collapsibleHeader}
                      onPress={() => toggleField('payment_method')}
                    >
                      <Text style={styles.collapsibleLabel}>
                        {t('form_expense_payment_method')}
                      </Text>
                      <Text style={[styles.collapsibleValue, !value && styles.placeholderText]}>
                        {getSelectedPaymentMethodTitle()}
                      </Text>
                    </Pressable>
                    {expandedField === 'payment_method' && (
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={value}
                          onValueChange={onChange}
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item
                            label={
                              paymentMethodsLoading
                                ? t('form_loading')
                                : t('form_select_payment_method')
                            }
                            value=""
                            color={colors.disabled}
                          />
                          {paymentMethods?.map((method) => (
                            <Picker.Item
                              key={method.id}
                              label={method.title}
                              value={method.id}
                              color={colors.textPrimary}
                            />
                          ))}
                        </Picker>
                      </View>
                    )}
                    {errors?.payment_method_id && (
                      <Text style={styles.errorText}>
                        {String(errors.payment_method_id?.message ?? '')}
                      </Text>
                    )}
                  </View>
                )}
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
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>
                        {t('form_expense_amount')} ({currency})
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors?.amount && { borderWidth: 1, borderColor: colors.error },
                        ]}
                        keyboardType="numeric"
                        placeholder={getCurrencyPlaceholder(currency)}
                        value={displayValue}
                        onChangeText={handleTextChange}
                        onBlur={onBlur}
                        placeholderTextColor={colors.disabled}
                      />
                      {errors?.amount && (
                        <Text style={styles.errorText}>
                          {String(errors.amount?.message ?? '')}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('form_expense_description')}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors?.description && { borderWidth: 1, borderColor: colors.error },
                        { minHeight: 80, textAlignVertical: 'top' },
                      ]}
                      placeholder={t('form_expense_description_prompt')}
                      placeholderTextColor={colors.disabled}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value || ''}
                      multiline
                      numberOfLines={3}
                    />
                    {errors?.description && (
                      <Text style={styles.errorText}>
                        {String(errors.description?.message ?? '')}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <ModalFooter>
          <ModalButton onPress={onClose} variant="cancel" disabled={isLoading}>
            {t('form_cancel')}
          </ModalButton>
          <ModalButton onPress={onSubmit} variant="primary" disabled={isLoading}>
            {isLoadingExpense
              ? t('form_loading')
              : isCreating || isUpdating
                ? '...'
                : t('form_save')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  collapsibleContainer: {
    gap: 8,
  },
  collapsibleHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    borderWidth: 0,
  },
  collapsibleLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  collapsibleValue: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right' as const,
  },
  placeholderText: {
    color: colors.disabled,
  },
  pickerWrapper: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    borderWidth: 0,
    overflow: 'hidden',
    minHeight: 200,
  },
  picker: {
    height: 50,
    color: colors.textPrimary,
  },
  pickerItem: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  datePicker: {
    height: 200,
    backgroundColor: colors.backgroundSurface,
  },
});

