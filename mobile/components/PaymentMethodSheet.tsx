import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { Button, Input, Text, YStack, XStack, Sheet, Select, Adapt } from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { usePaymentMethods, generateId } from '../storage';
import { PaymentMethod } from '../storage';
import { ChevronDown } from '@tamagui/lucide-icons';

interface PaymentMethodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentMethodAdded?: () => void;
}

const PAYMENT_METHOD_TYPES = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'other', label: 'Other' },
] as const;

export default function PaymentMethodSheet({ open, onOpenChange, onPaymentMethodAdded }: PaymentMethodSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethod['type']>('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToastController();

  // Storage hooks
  const paymentMethodOps = usePaymentMethods();

  useEffect(() => {
    if (open) {
      // Reset form when opening
      setName('');
      setType('credit_card');
      setError('');
    } else {
      // Reset focus/keyboard when sheet closes
      Keyboard.dismiss();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Payment method name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newPaymentMethod: PaymentMethod = {
        id: generateId(),
        name: name.trim(),
        type,
      };

      await paymentMethodOps.createPaymentMethod(newPaymentMethod.name, newPaymentMethod.type);

      toast.show('Payment method added successfully!', {
        message: 'Your payment method has been saved.',
      });

      onOpenChange(false);
      onPaymentMethodAdded?.();
    } catch (e) {
      console.error('Failed to save payment method:', e);
      setError('Failed to save payment method. Please try again.');
      toast.show('Error', {
        message: 'Failed to save payment method. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="fit"
      dismissOnSnapToBottom
      moveOnKeyboardChange={true}
      zIndex={100000}
    >
      <Sheet.Overlay
        opacity={0.8}
        animation="200ms"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame pt="$5" pb="$8" px="$4" gap="$4" bg="$black2">
        <Text fontSize="$6" fontWeight="bold">
          Add Payment Method
        </Text>

        {error ? (
          <Text color="$red10">
            {error}
          </Text>
        ) : null}

        <YStack gap="$3">
          <Input
            placeholder="Payment method name (e.g. EPOS Credit Card)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Select value={type} onValueChange={(value) => setType(value as PaymentMethod['type'])} onOpenChange={() => Keyboard.dismiss()}>
            <Select.Trigger iconAfter={<ChevronDown />}>
              <Select.Value placeholder="Select type">
                {PAYMENT_METHOD_TYPES.find(t => t.value === type)?.label}
              </Select.Value>
            </Select.Trigger>

            <Adapt when="maxMd" platform="touch">
              <Sheet native={false} modal dismissOnSnapToBottom animation="medium" zIndex={300000} snapPointsMode="fit">
                <Sheet.Frame bg="$black2" pt="$5" pb="$8" px="$4" gap="$4">
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay
                  opacity={0.8}
                  animation="200ms"
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                />
              </Sheet>
            </Adapt>

            <Select.Content zIndex={400000}>
              <Select.Viewport>
                <Select.Group>
                  {PAYMENT_METHOD_TYPES.map((pmType, index) => (
                    <Select.Item key={pmType.value} index={index} value={pmType.value} bg="$black2">
                      <Select.ItemText fontSize="$5">{pmType.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select>

          <XStack gap="$3" justify="flex-end">
            <Button variant="outlined" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              themeInverse
              disabled={loading}
              onPress={handleSubmit}
            >
              {loading ? 'Saving...' : 'Add Payment Method'}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
} 