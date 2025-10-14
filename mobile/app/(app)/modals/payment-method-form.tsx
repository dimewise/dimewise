import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { FormTextInput } from '@/components/forms/FormTextInput';
import {
  useGetPaymentMethodsByPaymentMethodIdQuery,
  usePostPaymentMethodsMutation,
  usePutPaymentMethodsByPaymentMethodIdMutation,
  type PaymentMethodCreate,
  type PaymentMethodUpdate,
  type PaymentMethodType,
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

export default function PaymentMethodFormModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; title?: string; method_type?: PaymentMethodType }>();
  
  const isEdit = !!params.id;
  const paymentMethodId = params.id;

  // API hooks
  const { data: existingPaymentMethod } = useGetPaymentMethodsByPaymentMethodIdQuery(
    { paymentMethodId: paymentMethodId! },
    { skip: !isEdit }
  );
  const [createPaymentMethod, { isLoading: isCreating }] = usePostPaymentMethodsMutation();
  const [updatePaymentMethod, { isLoading: isUpdating }] = usePutPaymentMethodsByPaymentMethodIdMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(postPaymentMethodBody),
    defaultValues: {
      title: params.title || '',
      method_type: (params.method_type as PaymentMethodType) || 'other',
    },
  });

  // Reset form when existing payment method data loads
  useEffect(() => {
    if (existingPaymentMethod) {
      reset({
        title: existingPaymentMethod.title,
        method_type: existingPaymentMethod.method_type,
      });
    }
  }, [existingPaymentMethod, reset]);

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
      
      router.back();
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Error', 'Failed to save payment method. Please try again.');
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
            {isEdit ? t('settings_edit_payment_method') : t('settings_add_new_payment_method')}
          </Text>

          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="title"
              labelKey="form_payment_method_title"
              placeholderKey="form_payment_method_title_prompt"
              colors={colors}
              t={t}
              errors={errors}
              animateView
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
  methodTypeContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerContainer: {
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
