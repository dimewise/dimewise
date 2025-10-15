import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { FormTextInput } from '@/components/forms/FormTextInput';
import {
  useGetCategoriesByCategoryIdQuery,
  usePostCategoriesMutation,
  usePutCategoriesByCategoryIdMutation,
  type CategoryCreate,
  type CategoryUpdate,
} from '@/generated/api/api';
import { postCategoryBody } from '@/generated/types/categories/categories.zod';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';
import { useUserLocale } from '@/hooks/useUserLocale';
import { 
  currencyUsesDecimals, 
  parseCurrencyInput, 
  formatCurrencyForInput, 
  formatCurrencyForDisplay,
  getCurrencyPlaceholder 
} from '@/utils/currency';

type FormData = {
  title: string;
  amount: number;
};

export default function CategoryFormModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; title?: string; amount?: string }>();
  const { currency } = useUserLocale();
  const [displayValue, setDisplayValue] = useState('');
  
  const isEdit = !!params.id;
  const categoryId = params.id;

  // API hooks
  const { data: existingCategory } = useGetCategoriesByCategoryIdQuery(
    { categoryId: categoryId! },
    { skip: !isEdit }
  );
  const [createCategory, { isLoading: isCreating }] = usePostCategoriesMutation();
  const [updateCategory, { isLoading: isUpdating }] = usePutCategoriesByCategoryIdMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(postCategoryBody),
    defaultValues: {
      title: params.title || '',
      amount: params.amount ? parseInt(params.amount) : 0,
    },
  });

  // Reset form when existing category data loads
  useEffect(() => {
    if (existingCategory) {
      const amount = formatCurrencyForInput(existingCategory.amount, currency);
      reset({
        title: existingCategory.title,
        amount: amount,
      });
      setDisplayValue(amount.toString());
    }
  }, [existingCategory, currency, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const amountToSave = parseCurrencyInput(data.amount.toString(), currency);
      
      if (isEdit && categoryId) {
        const updateData: CategoryUpdate = {
          title: data.title,
          amount: amountToSave,
        };
        await updateCategory({ categoryId, categoryUpdate: updateData }).unwrap();
      } else {
        const createData: CategoryCreate = {
          title: data.title,
          amount: amountToSave,
        };
        await createCategory({ categoryCreate: createData }).unwrap();
      }
      
      router.back();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category. Please try again.');
    }
  });

  const onCancel = () => {
    router.back();
  };

  const isLoading = isCreating || isUpdating;

  return (
    <AppLayout>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEdit ? t('settings_edit_category') : t('settings_add_new_category')}
          </Text>

          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="title"
              labelKey="form_category_title"
              placeholderKey="form_category_title_prompt"
              colors={colors}
              t={t}
              errors={errors}
              animateView
            />
            
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
                      onChange(numValue); // Store display value
                    }
                  } else {
                    // No decimal point, just numbers
                    setDisplayValue(cleanText);
                    const numValue = cleanText ? parseFloat(cleanText) : 0;
                    onChange(numValue); // Store display value
                  }
                };
                
                const handleBlur = () => {
                  onBlur();
                };
                
                return (
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                      {t('form_budget_amount')} ({currency})
                    </Text>
                    <TextInput
                      style={[sharedStyles.input, errors?.amount && sharedStyles.inputError]}
                      keyboardType="numeric"
                      placeholder={getCurrencyPlaceholder(currency)}
                      value={displayValue}
                      onChangeText={handleTextChange}
                      onBlur={handleBlur}
                      placeholderTextColor={colors.textPrimary}
                    />
                    {errors?.amount && (
                      <Text style={{ color: colors.error }}>{String(errors.amount?.message ?? '')}</Text>
                    )}
                  </View>
                );
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable onPress={onCancel} style={[styles.cancelButton, isLoading && styles.disabledButton]} disabled={isLoading}>
              <Text style={[styles.cancelButtonText, isLoading && styles.disabledButtonText]}>{t('form_cancel')}</Text>
            </Pressable>
            <Pressable onPress={onSubmit} style={[styles.saveButton, isLoading && styles.disabledButton]} disabled={isLoading}>
              <Text style={[styles.saveButtonText, isLoading && styles.disabledButtonText]}>
                {isLoading ? '...' : t('form_save')}
              </Text>
            </Pressable>
          </View>
        </View>
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
  form: {
    gap: 20,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
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
