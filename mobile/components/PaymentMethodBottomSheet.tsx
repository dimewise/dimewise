import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Keyboard } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { createPaymentMethod } from '../db/repository/paymentMethod';
import { useUser } from './contexts/UserContext';
import { useRefreshKey } from './contexts/RefreshKeyContext';
import DropdownBottomSheet, { DropdownButton, DropdownOption } from './DropdownBottomSheet';

const PAYMENT_METHOD_TYPES = ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'digital_wallet', 'other'];

const formatPaymentTypeForDisplay = (type: string, t: any): string => {
  const typeMap: Record<string, string> = {
    'credit_card': t('paymentMethods.creditCard'),
    'debit_card': t('paymentMethods.debitCard'),
    'cash': t('paymentMethods.cash'),
    'bank_transfer': t('paymentMethods.bankTransfer'),
    'digital_wallet': t('paymentMethods.digitalWallet'),
    'other': t('paymentMethods.other')
  };
  return typeMap[type] || type;
};

interface PaymentMethodBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onPaymentMethodAdded?: () => void;
}

export default function PaymentMethodBottomSheet({ visible, onDismiss, onPaymentMethodAdded }: PaymentMethodBottomSheetProps) {
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

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setType('');
    setError('');
    Keyboard.dismiss();
  };

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
        type: type as 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'digital_wallet' | 'other',
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

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onDismiss();
    }
  }, [onDismiss]);

  // Backdrop component for tap-to-dismiss
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onDismiss}
      />
    ),
    [onDismiss]
  );

  // Convert payment types to dropdown options
  const paymentTypeOptions: DropdownOption[] = PAYMENT_METHOD_TYPES.map(paymentType => ({
    label: formatPaymentTypeForDisplay(paymentType, t),
    value: paymentType,
    id: paymentType
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
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <View style={{
            padding: 8,
            backgroundColor: theme.colors.surface,
          }}>
            <Text variant="headlineMedium" style={{
              marginBottom: 32,
              fontWeight: '700',
              color: theme.colors.onSurface,
              textAlign: 'center'
            }}>
              {t('paymentMethods.addPaymentMethod')}
            </Text>

            {error ? (
              <View style={{
                padding: 16,
                backgroundColor: theme.colors.errorContainer,
                borderRadius: 6,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer, fontWeight: '500' }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={{ gap: 24 }}>
              <TextInput
                label={t('paymentMethods.methodName')}
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={{ backgroundColor: theme.colors.surface }}
                outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1 }}
                contentStyle={{ fontWeight: '500' }}
              />

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
                    fontWeight: '600'
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
                    letterSpacing: 0.25
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