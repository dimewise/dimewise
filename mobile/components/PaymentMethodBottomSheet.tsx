import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Keyboard } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Surface,
  Divider
} from 'react-native-paper';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaymentMethods } from '../storage';
import DropdownBottomSheet, { DropdownButton, DropdownOption } from './DropdownBottomSheet';

const PAYMENT_METHOD_TYPES = ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'digital_wallet', 'other'];

const formatPaymentTypeForDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'cash': 'Cash',
    'bank_transfer': 'Bank Transfer',
    'digital_wallet': 'Digital Wallet',
    'other': 'Other'
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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Storage hooks
  const paymentMethodOps = usePaymentMethods();

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
    if (!name.trim()) {
      setError('Payment method name is required');
      return;
    }

    if (!type) {
      setError('Please select a payment method type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await paymentMethodOps.createPaymentMethod(name.trim(), type);

      onDismiss();
      onPaymentMethodAdded?.();
    } catch (e) {
      console.error('Failed to save payment method:', e);
      setError('Failed to save payment method. Please try again.');
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
    label: formatPaymentTypeForDisplay(paymentType),
    value: paymentType,
    id: paymentType
  }));

  const renderTypeDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowTypeDropdown(true)}
        selectedValue={type}
        options={paymentTypeOptions}
        placeholder="Select Payment Type"
        label="Payment Type"
      />
      <DropdownBottomSheet
        visible={showTypeDropdown}
        onDismiss={() => setShowTypeDropdown(false)}
        options={paymentTypeOptions}
        onSelect={(value) => setType(value)}
        selectedValue={type}
        title="Select Payment Type"
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
              New Payment Method
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
                label="Payment Method Name"
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
                    paddingVertical: 8,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600'
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 25,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  contentStyle={{
                    paddingVertical: 8,
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
                  Add Method
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
} 