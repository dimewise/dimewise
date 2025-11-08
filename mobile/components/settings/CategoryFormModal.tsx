import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { useUserLocale } from '@/hooks/useUserLocale';
import {
  currencyUsesDecimals,
  parseCurrencyInput,
  formatCurrencyForInput,
  getCurrencyPlaceholder,
} from '@/utils/currency';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalHeader } from '@/components/modals/ModalHeader';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalButton } from '@/components/modals/ModalButton';

type FormData = {
  title: string;
  amount: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  categoryId?: string;
  initialTitle?: string;
  initialAmount?: string;
  onSuccess?: () => void;
};

export const CategoryFormModal = ({
  visible,
  onClose,
  categoryId,
  initialTitle,
  initialAmount,
  onSuccess,
}: Props) => {
  const { t } = useTranslation();
  const { currency } = useUserLocale();
  const [displayValue, setDisplayValue] = useState('');

  const isEdit = !!categoryId;

  // API hooks
  const { data: existingCategory } = useGetCategoriesByCategoryIdQuery(
    { categoryId: categoryId! },
    { skip: !isEdit },
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
      title: initialTitle || '',
      amount: initialAmount ? parseInt(initialAmount) : 0,
    },
  });

  // Reset form when existing category data loads or modal opens
  useEffect(() => {
    if (visible) {
      if (existingCategory) {
        const amount = formatCurrencyForInput(existingCategory.amount, currency);
        reset({
          title: existingCategory.title,
          amount: amount,
        });
        setDisplayValue(amount.toString());
      } else if (initialTitle || initialAmount) {
        reset({
          title: initialTitle || '',
          amount: initialAmount ? parseInt(initialAmount) : 0,
        });
        setDisplayValue(initialAmount || '');
      } else {
        reset({
          title: '',
          amount: 0,
        });
        setDisplayValue('');
      }
    }
  }, [visible, existingCategory, currency, reset, initialTitle, initialAmount]);

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

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category. Please try again.');
    }
  });

  const isLoading = isCreating || isUpdating;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalHeader
          title={isEdit ? t('settings_edit_category') : t('settings_add_new_category')}
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
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
                      {t('form_budget_amount')} ({currency})
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
                      <Text style={styles.errorText}>{String(errors.amount?.message ?? '')}</Text>
                    )}
                  </View>
                );
              }}
            />
          </View>
        </ScrollView>

        <ModalFooter>
          <ModalButton onPress={onClose} variant="cancel" disabled={isLoading}>
            {t('form_cancel')}
          </ModalButton>
          <ModalButton onPress={onSubmit} variant="primary" disabled={isLoading}>
            {isLoading ? '...' : t('form_save')}
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
});

