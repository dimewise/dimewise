import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { FormTextInput } from '@/components/forms/FormTextInput';
import { ModalButton } from '@/components/modals/ModalButton';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalHeader } from '@/components/modals/ModalHeader';
import {
  type CategoryCreate,
  type CategoryUpdate,
  useGetCategoriesByCategoryIdQuery,
  usePostCategoriesMutation,
  usePutCategoriesByCategoryIdMutation,
} from '@/generated/api/api';
import { postCategoryBody } from '@/generated/types/categories/categories.zod';
import { useUserLocale } from '@/hooks/useUserLocale';
import {
  currencyUsesDecimals,
  formatCurrencyForInput,
  getCurrencyPlaceholder,
  parseCurrencyInput,
} from '@/utils/currency';

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
    { categoryId: categoryId || '' },
    { skip: !categoryId || !isEdit },
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
      amount: initialAmount ? parseInt(initialAmount, 10) : 0,
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
          amount: initialAmount ? parseInt(initialAmount, 10) : 0,
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
          className="flex-1"
          contentContainerClassName="p-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5">
            <FormTextInput
              control={control}
              name="title"
              labelKey="form_category_title"
              placeholderKey="form_category_title_prompt"
              t={t}
              errors={errors}
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
                      const formattedText = `${parts[0]}.${decimalPart}`;
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
                      {t('form_budget_amount')} ({currency})
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
          </View>
        </ScrollView>

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
