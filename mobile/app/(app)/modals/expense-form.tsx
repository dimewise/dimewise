import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { DateTime } from 'luxon';
import { AppLayout } from '@/components/layouts/AppLayout';
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
import { sharedStyles } from '@/theme/stylesheets';
import { useUserLocale } from '@/hooks/useUserLocale';
import { 
  currencyUsesDecimals, 
  parseCurrencyInput, 
  formatCurrencyForInput,
  getCurrencyPlaceholder 
} from '@/utils/currency';

// Use the generated zod schema directly
type FormData = z.infer<typeof postExpenseBody>;

export default function ExpenseFormModal() {
  const router = useRouter();
  const { expenseId } = useLocalSearchParams<{ expenseId?: string }>();
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();
  const [displayValue, setDisplayValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedField, setExpandedField] = useState<string | null>(null);
  
  const isEditMode = !!expenseId;
  
  // API hooks
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery({ includeDeleted: false });
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useGetPaymentMethodsQuery({ includeDeleted: false });
  const [createExpense, { isLoading: isCreating }] = usePostExpensesMutation();
  const [updateExpense, { isLoading: isUpdating }] = usePutExpensesByExpenseIdMutation();
  
  // Fetch existing expense data for edit mode
  const { data: existingExpense, isLoading: isLoadingExpense } = useGetExpensesByExpenseIdQuery(
    { expenseId: expenseId! },
    { skip: !isEditMode }
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

  // Prefill form when existing expense data is loaded
  useEffect(() => {
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
    }
  }, [existingExpense, reset, currency]);

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
      
      router.back();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    }
  });

  const onCancel = () => {
    router.back();
  };

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
    const category = categories?.find(cat => cat.id === watch('category_id'));
    return category?.title || t('form_select_category');
  };

  const getSelectedPaymentMethodTitle = () => {
    const method = paymentMethods?.find(method => method.id === watch('payment_method_id'));
    return method?.title || t('form_select_payment_method');
  };


  return (
    <AppLayout>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={() => setExpandedField(null)}>
          <View style={styles.content}>
            <Text style={styles.title}>
              {isEditMode ? t('settings_edit_expense') : t('settings_add_new_expense')}
            </Text>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEventThrottle={16}
              bounces={true}
              alwaysBounceVertical={false}
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
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
                    <Text style={{ color: colors.error }}>{String(errors.incurred_at?.message ?? '')}</Text>
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
                    <Text style={{ color: colors.error }}>{String(errors.category_id?.message ?? '')}</Text>
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
                    <Text style={styles.collapsibleLabel}>{t('form_expense_payment_method')}</Text>
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
                          label={paymentMethodsLoading ? t('form_loading') : t('form_select_payment_method')}
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
                    <Text style={{ color: colors.error }}>{String(errors.payment_method_id?.message ?? '')}</Text>
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
                    // For non-decimal currencies (JPY, KRW, etc.), just allow natural number input
                    setDisplayValue(text);
                    const numValue = text ? parseFloat(text) : 0;
                    onChange(numValue);
                    return;
                  }
                  
                  // For decimal currencies, handle decimal formatting
                  // Remove any non-numeric characters except decimal point
                  const cleanText = text.replace(/[^0-9.]/g, '');
                  
                  // Handle decimal point logic
                  if (cleanText.includes('.')) {
                    const parts = cleanText.split('.');
                    if (parts.length <= 2) {
                      // Allow up to 2 decimal places
                      const decimalPart = parts[1] ? parts[1].substring(0, 2) : '';
                      const formattedText = parts[0] + '.' + decimalPart;
                      setDisplayValue(formattedText);
                      const numValue = formattedText ? parseFloat(formattedText) : 0;
                      onChange(numValue);
                    }
                  } else {
                    // No decimal point, just numbers
                    setDisplayValue(cleanText);
                    const numValue = cleanText ? parseFloat(cleanText) : 0;
                    onChange(numValue);
                  }
                };
                
                const handleBlur = () => {
                  onBlur();
                };
                
                return (
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                      {t('form_expense_amount')} ({currency})
                    </Text>
                    <TextInput
                      style={[sharedStyles.input, errors?.amount && sharedStyles.inputError]}
                      keyboardType="numeric"
                      placeholder={getCurrencyPlaceholder(currency)}
                      value={displayValue}
                      onChangeText={handleTextChange}
                      onBlur={handleBlur}
                      placeholderTextColor={colors.disabled}
                    />
                    {errors?.amount && (
                      <Text style={{ color: colors.error }}>{String(errors.amount?.message ?? '')}</Text>
                    )}
                  </View>
                );
              }}
            />

                        
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    {t('form_expense_description')}
                  </Text>
                  <TextInput
                    style={[
                      sharedStyles.input, 
                      errors?.description && sharedStyles.inputError,
                      { minHeight: 80, textAlignVertical: 'top' }
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
                    <Text style={{ color: colors.error }}>{String(errors.description?.message ?? '')}</Text>
                  )}
                </View>
              )}
            />

            </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Pressable onPress={onCancel} style={[styles.cancelButton, (isCreating || isUpdating || isLoadingExpense) && styles.disabledButton]} disabled={isCreating || isUpdating || isLoadingExpense}>
                <Text style={[styles.cancelButtonText, (isCreating || isUpdating || isLoadingExpense) && styles.disabledButtonText]}>{t('form_cancel')}</Text>
              </Pressable>
              <Pressable onPress={onSubmit} style={[styles.saveButton, (isCreating || isUpdating || isLoadingExpense) && styles.disabledButton]} disabled={isCreating || isUpdating || isLoadingExpense}>
                <Text style={[styles.saveButtonText, (isCreating || isUpdating || isLoadingExpense) && styles.disabledButtonText]}>
                  {isLoadingExpense ? t('form_loading') : (isCreating || isUpdating) ? '...' : t('form_save')}
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDefault,
    width: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    gap: 20,
    paddingBottom: 20,
    minHeight: '100%',
  },
  pickerContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerWrapper: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textPrimary,
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
  collapsibleContainer: {
    gap: 8,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  collapsibleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  collapsibleValue: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  placeholderText: {
    color: colors.disabled,
  },
  datePicker: {
    height: 200,
    backgroundColor: colors.backgroundSurface,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    // Keep original text colors but with reduced opacity
  },
});
