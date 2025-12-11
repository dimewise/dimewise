import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormTextInput } from '@/components/forms/FormTextInput';
import { ModalButton } from '@/components/modals/ModalButton';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalHeader } from '@/components/modals/ModalHeader';
import {
  type PaymentMethodCreate,
  type PaymentMethodType,
  type PaymentMethodUpdate,
  useGetPaymentMethodsByPaymentMethodIdQuery,
  usePostPaymentMethodsMutation,
  usePutPaymentMethodsByPaymentMethodIdMutation,
} from '@/generated/api/api';
import { postPaymentMethodBody } from '@/generated/types/payment-methods/payment-methods.zod';
import { colors } from '@/theme/colors';

const PAYMENT_METHOD_TYPES: { value: PaymentMethodType; labelKey: string }[] = [
  { value: 'credit_card', labelKey: 'payment_method_credit_card' },
  { value: 'debit_card', labelKey: 'payment_method_debit_card' },
  { value: 'cash', labelKey: 'payment_method_cash' },
  { value: 'bank_transfer', labelKey: 'payment_method_bank_transfer' },
  { value: 'digital_wallet', labelKey: 'payment_method_digital_wallet' },
  { value: 'other', labelKey: 'payment_method_other' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  paymentMethodId?: string;
  initialTitle?: string;
  initialMethodType?: PaymentMethodType;
  onSuccess?: () => void;
};

export const PaymentMethodFormModal = ({
  visible,
  onClose,
  paymentMethodId,
  initialTitle,
  initialMethodType,
  onSuccess,
}: Props) => {
  const { t } = useTranslation();
  const isEdit = !!paymentMethodId;

  // API hooks
  const { data: existingPaymentMethod } = useGetPaymentMethodsByPaymentMethodIdQuery(
    { paymentMethodId: paymentMethodId! },
    { skip: !isEdit },
  );
  const [createPaymentMethod, { isLoading: isCreating }] = usePostPaymentMethodsMutation();
  const [updatePaymentMethod, { isLoading: isUpdating }] =
    usePutPaymentMethodsByPaymentMethodIdMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(postPaymentMethodBody),
    defaultValues: {
      title: initialTitle || '',
      method_type: initialMethodType || 'other',
    },
  });

  // Reset form when existing payment method data loads or modal opens
  useEffect(() => {
    if (visible) {
      if (existingPaymentMethod) {
        reset({
          title: existingPaymentMethod.title,
          method_type: existingPaymentMethod.method_type,
        });
      } else if (initialTitle || initialMethodType) {
        reset({
          title: initialTitle || '',
          method_type: initialMethodType || 'other',
        });
      } else {
        reset({
          title: '',
          method_type: 'other',
        });
      }
    }
  }, [visible, existingPaymentMethod, reset, initialTitle, initialMethodType]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && paymentMethodId) {
        const updateData: PaymentMethodUpdate = {
          title: data.title,
          method_type: data.method_type,
        };
        await updatePaymentMethod({ paymentMethodId, paymentMethodUpdate: updateData }).unwrap();
      } else {
        const createData: PaymentMethodCreate = {
          title: data.title,
          method_type: data.method_type,
        };
        await createPaymentMethod({ paymentMethodCreate: createData }).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Error', 'Failed to save payment method. Please try again.');
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
          title={isEdit ? t('settings_edit_payment_method') : t('settings_add_new_payment_method')}
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="title"
              labelKey="form_payment_method_title"
              placeholderKey="form_payment_method_title_prompt"
              t={t}
              errors={errors}
            />

            <Controller
              control={control}
              name="method_type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.methodTypeContainer}>
                  <Text style={styles.label}>{t('form_payment_method_type')}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {PAYMENT_METHOD_TYPES.map((type) => (
                        <Picker.Item
                          key={type.value}
                          label={t(type.labelKey)}
                          value={type.value}
                          color={colors.textPrimary}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
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

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 20,
  },
  methodTypeContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  pickerContainer: {
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
});
