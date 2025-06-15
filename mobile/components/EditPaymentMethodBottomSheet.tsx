import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Keyboard } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme
} from 'react-native-paper';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaymentMethods } from '../storage';
import { PaymentMethod } from '../storage';

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
  onPaymentMethodUpdated
}: EditPaymentMethodBottomSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Storage hooks
  const paymentMethodOps = usePaymentMethods();

  // Bottom sheet snap points - using dynamic sizing
  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (visible && paymentMethod) {
      bottomSheetModalRef.current?.present();
      setName(paymentMethod.name);
      setType(paymentMethod.type);
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible, paymentMethod]);

  const resetForm = () => {
    setName('');
    setType('');
    setError('');
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!paymentMethod) return;

    if (!name.trim()) {
      setError('Payment method name is required');
      return;
    }

    if (!type) {
      setError('Payment method type is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        name: name.trim(),
        type: type as PaymentMethod['type'],
      };

      await paymentMethodOps.updatePaymentMethod(updatedPaymentMethod);

      onDismiss();
      onPaymentMethodUpdated?.();
    } catch (e) {
      console.error('Failed to update payment method:', e);
      setError('Failed to update payment method. Please try again.');
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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing={true}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={{
        padding: 16,
        backgroundColor: theme.colors.surface,
      }}>
        <Text variant="headlineMedium" style={{
          marginBottom: 32,
          fontWeight: '700',
          color: theme.colors.onSurface,
          textAlign: 'center'
        }}>
          Edit Payment Method
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
            outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 6 }}
            contentStyle={{ fontWeight: '500' }}
          />

          <View style={{
            padding: 16,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text variant="bodyMedium" style={{
              marginBottom: 12,
              fontWeight: '600',
              color: theme.colors.onSurfaceVariant
            }}>
              Payment Type
            </Text>
            <View style={{ gap: 8 }}>
              {PAYMENT_METHOD_TYPES.map((paymentType: string) => (
                <Button
                  key={paymentType}
                  mode={type === paymentType ? "contained" : "outlined"}
                  onPress={() => setType(paymentType)}
                  contentStyle={{
                    paddingVertical: 8,
                  }}
                  labelStyle={{
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                  style={{
                    borderRadius: 6,
                  }}
                >
                  {formatPaymentTypeForDisplay(paymentType)}
                </Button>
              ))}
            </View>
          </View>

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
                fontWeight: '600'
              }}
              style={{
                flex: 1,
                borderRadius: 25,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
} 