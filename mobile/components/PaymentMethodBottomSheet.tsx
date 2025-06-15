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
      <BottomSheetView style={{
        padding: 32,
        paddingBottom: 24,
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
              {PAYMENT_METHOD_TYPES.map((paymentType) => (
                <View
                  key={paymentType}
                  style={{
                    padding: 16,
                    backgroundColor: type === paymentType ?
                      theme.colors.primaryContainer : theme.colors.surface,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: type === paymentType ?
                      theme.colors.primary : theme.colors.outline,
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    style={{
                      fontWeight: '600',
                      color: type === paymentType ?
                        theme.colors.onPrimaryContainer : theme.colors.onSurface
                    }}
                    onPress={() => setType(paymentType)}
                  >
                    {paymentType}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{
              flex: 1,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 25,
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '600'
                }}
                onPress={onDismiss}
              >
                Cancel
              </Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: theme.colors.primary,
              borderRadius: 6,
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.primary,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.onPrimary,
                  fontWeight: '600',
                  letterSpacing: 0.25
                }}
                onPress={handleSubmit}
              >
                Add Method
              </Text>
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
} 