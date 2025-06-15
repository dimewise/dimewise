import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Keyboard } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Surface,
  Divider,
  Menu
} from 'react-native-paper';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { usePaymentMethods } from '../storage';

interface PaymentMethodBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onPaymentMethodAdded?: () => void;
}

const PAYMENT_METHOD_TYPES = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'Digital Wallet',
  'Check',
  'Other'
];

export default function PaymentMethodBottomSheet({
  visible,
  onDismiss,
  onPaymentMethodAdded
}: PaymentMethodBottomSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Storage hooks
  const paymentMethodOps = usePaymentMethods();

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
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
      await paymentMethodOps.createPaymentMethod(
        name.trim(),
        type
      );

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

  const renderTypeMenu = () => (
    <Menu
      visible={showTypeMenu}
      onDismiss={() => setShowTypeMenu(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setShowTypeMenu(true)}
          contentStyle={{ justifyContent: 'flex-start' }}
        >
          {type || "Select type"}
        </Button>
      }
    >
      {PAYMENT_METHOD_TYPES.map((methodType) => (
        <Menu.Item
          key={methodType}
          onPress={() => {
            setType(methodType);
            setShowTypeMenu(false);
          }}
          title={methodType}
        />
      ))}
    </Menu>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 24, fontWeight: '600' }}>
          New Payment Method
        </Text>

        {error ? (
          <Surface style={{
            padding: 12,
            marginBottom: 16,
            backgroundColor: theme.colors.errorContainer,
            borderRadius: 8
          }}>
            <Text style={{ color: theme.colors.onErrorContainer }}>
              {error}
            </Text>
          </Surface>
        ) : null}

        <View style={{ gap: 16 }}>
          <TextInput
            label="Payment Method Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            placeholder="e.g., My Credit Card, Cash Wallet"
          />

          <View>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Type</Text>
            {renderTypeMenu()}
          </View>

          <Divider style={{ marginVertical: 8 }} />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={{ flex: 1 }}
              loading={loading}
              disabled={loading}
            >
              Add Payment Method
            </Button>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
} 