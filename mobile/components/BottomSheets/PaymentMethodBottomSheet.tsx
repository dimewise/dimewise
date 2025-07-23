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
import { createPaymentMethod } from '../../db/repository/paymentMethod';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { useUser } from '../contexts/UserContext';
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

interface PaymentMethodBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onPaymentMethodAdded?: () => void;
}

export default function PaymentMethodBottomSheet({
  visible,
  onDismiss,
  onPaymentMethodAdded,
}: PaymentMethodBottomSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useUser();
  const { triggerRefresh } = useRefreshKey();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const resetForm = useCallback(() => {
    setName('');
    setType('');
    setError('');
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

  const handleSubmit = async () => {
    if (!user) return;

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
      const paymentMethodData = {
        name: name.trim(),
        type: type as
          | 'credit_card'
          | 'debit_card'
          | 'cash'
          | 'bank_transfer'
          | 'digital_wallet'
          | 'other',
        userId: user.id,
      };

      await createPaymentMethod(paymentMethodData);

      onDismiss();
      onPaymentMethodAdded?.();
      triggerRefresh('paymentMethods');
    } catch (e) {
      console.error('Failed to save payment method:', e);
      setError(t('forms.savePaymentMethodError'));
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
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
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
              {t('paymentMethods.addPaymentMethod')}
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
                  {t('paymentMethods.addPaymentMethod')}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
