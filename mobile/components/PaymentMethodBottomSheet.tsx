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
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaymentMethods } from '../storage';

const PAYMENT_METHOD_TYPES = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Digital Wallet', 'Other'];

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
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const theme = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Storage hooks
  const paymentMethodOps = usePaymentMethods();

  // Bottom sheet snap points - using dynamic sizing
  const snapPoints = useMemo(() => ['40%'], []);

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
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={{ padding: 16, paddingBottom: 16 }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={{ marginBottom: 24, fontWeight: '600' }}>
            Add Payment Method
          </Text>

          {error ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.error, marginBottom: 16 }}>
              {error}
            </Text>
          ) : null}

          <View style={{ gap: 16 }}>
            <TextInput
              label="Payment Method Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              placeholder="e.g., Credit Card, Cash, Bank Transfer"
            />

            <View style={{ gap: 8 }}>
              <Text variant="bodyMedium">Type</Text>
              {renderTypeMenu()}
            </View>

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
                Add Method
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheetModal>
  );
} 