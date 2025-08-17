import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type { TFunction } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updatePaymentMethod } from '../../db/mutation/paymentMethod';
import type { PaymentMethod } from '../../db/schema';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { BSTextInput } from './BottomSheetTextInput';
import DropdownBottomSheet, { DropdownButton, type DropdownOption } from './DropdownBottomSheet';

const PAYMENT_METHOD_TYPES = [
  'credit_card',
  'debit_card',
  'cash',
  'bank_transfer',
  'digital_wallet',
  'other',
];

const formatPaymentTypeForDisplay = (
  type: string,
  t: TFunction<'translation', undefined>,
): string => {
  const typeMap: Record<string, string> = {
    credit_card: t('paymentMethods.creditCard'),
    debit_card: t('paymentMethods.debitCard'),
    cash: t('paymentMethods.cash'),
    bank_transfer: t('paymentMethods.bankTransfer'),
    digital_wallet: t('paymentMethods.digitalWallet'),
    other: t('paymentMethods.other'),
  };
  return typeMap[type] || type;
};

interface EditPaymentMethodBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  paymentMethod: PaymentMethod | null;
  onPaymentMethodUpdated?: () => void;
}

export default function EditPaymentMethodBottomSheet({
  visible,
  onDismiss,
  paymentMethod,
  onPaymentMethodUpdated,
}: EditPaymentMethodBottomSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const theme = useTheme();
  const { t } = useTranslation();
  const { triggerRefresh } = useRefreshKey();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const resetForm = useCallback(() => {
    setName('');
    setType('');
    setError('');
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (visible && paymentMethod) {
      bottomSheetModalRef.current?.present();
      setName(paymentMethod.name);
      setType(paymentMethod.type);
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible, paymentMethod, resetForm]);

  const handleSubmit = async () => {
    if (!paymentMethod) return;

    if (!name.trim()) {
      setError(t('forms.paymentMethodNameRequired'));
      return;
    }

    if (!type) {
      setError(t('forms.paymentMethodTypeRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updates = {
        name: name.trim(),
        type: type as
          | 'credit_card'
          | 'debit_card'
          | 'cash'
          | 'bank_transfer'
          | 'digital_wallet'
          | 'other',
      };

      await updatePaymentMethod(paymentMethod.id, updates);

      onDismiss();
      onPaymentMethodUpdated?.();
      triggerRefresh('paymentMethods');
    } catch (e) {
      console.error('Failed to update payment method:', e);
      setError(t('forms.updatePaymentMethodError'));
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

  // Convert payment types to dropdown options
  const paymentTypeOptions: DropdownOption[] = PAYMENT_METHOD_TYPES.map((paymentType) => ({
    label: formatPaymentTypeForDisplay(paymentType, t),
    value: paymentType,
    id: paymentType,
  }));

  const renderTypeDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowTypeDropdown(true)}
        selectedValue={type}
        options={paymentTypeOptions}
        placeholder={t('forms.selectPaymentType')}
        label={t('forms.paymentType')}
      />
      <DropdownBottomSheet
        visible={showTypeDropdown}
        onDismiss={() => setShowTypeDropdown(false)}
        options={paymentTypeOptions}
        onSelect={(value) => setType(value)}
        selectedValue={type}
        title={t('forms.selectPaymentType')}
      />
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
              {t('paymentMethods.editPaymentMethod')}
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
                  {t('paymentMethods.methodName')}
                </Text>
                <BSTextInput
                  defaultValue={name}
                  onChangeText={setName}
                  placeholder={t('paymentMethods.methodName')}
                />
              </View>

              {renderTypeDropdown()}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
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
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {t('common.save')}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
