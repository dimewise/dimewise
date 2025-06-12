import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { Button, Input, Text, YStack, XStack, Sheet } from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { useCategories, validateCurrencyInput, SYSTEM_CATEGORIES } from '../storage';
import { Category } from '../storage';
import { useCurrency } from '../utils/CurrencyContext';

interface EditCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onCategoryUpdated?: () => void;
}

export default function EditCategorySheet({ open, onOpenChange, category, onCategoryUpdated }: EditCategorySheetProps) {
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToastController();
  const { currency } = useCurrency();

  // Storage hooks
  const categoryOps = useCategories();

  useEffect(() => {
    if (open && category) {
      // Check if trying to edit a system category
      if (category.id === SYSTEM_CATEGORIES.UNCATEGORIZED) {
        toast.show('Error', {
          message: 'System categories cannot be edited.',
          type: 'error',
        });
        onOpenChange(false);
        return;
      }

      // Set the current budget value when opening
      setBudget(category.budget.toString());
      setError('');
    } else {
      // Reset focus/keyboard when sheet closes
      Keyboard.dismiss();
    }
  }, [open, category]);

  const handleSubmit = async () => {
    if (!category) return;

    // Extra safety check
    if (category.id === SYSTEM_CATEGORIES.UNCATEGORIZED) {
      setError('System categories cannot be edited.');
      return;
    }

    // Use currency-aware validation
    const validation = validateCurrencyInput(budget, currency);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await categoryOps.updateCategoryBudget(category.id, Number(budget), currency);

      toast.show('Category updated successfully!', {
        message: 'Budget has been updated.',
      });

      onOpenChange(false);
      onCategoryUpdated?.();
    } catch (e) {
      console.error('Failed to update category:', e);
      setError('Failed to update category. Please try again.');
      toast.show('Error', {
        message: 'Failed to update category. Please try again.',
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
          Edit Category
        </Text>

        {category && (
          <Text fontSize="$4" opacity={0.7}>
            {category.name}
          </Text>
        )}

        {error ? (
          <Text color="$red10">
            {error}
          </Text>
        ) : null}

        <YStack gap="$3">
          <Input
            placeholder={currency === 'JPY' || currency === 'KRW' ?
              `Monthly budget (no decimals for ${currency})` :
              `Monthly budget (e.g. 1000.00 for ${currency})`}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />

          <XStack gap="$3" justify="flex-end">
            <Button variant="outlined" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              themeInverse
              disabled={loading}
              onPress={handleSubmit}
            >
              {loading ? 'Updating...' : 'Update Budget'}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
} 