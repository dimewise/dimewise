import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { Button, Input, Text, YStack, XStack, Sheet } from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { saveCategory, generateId, getSettings, validateCurrencyInput } from '../utils/storage';
import { Category, Settings } from '../utils/storage';

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded?: () => void;
}

export default function CategorySheet({ open, onOpenChange, onCategoryAdded }: CategorySheetProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [settings, setSettings] = useState<Settings>({ currency: 'JPY' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToastController();

  useEffect(() => {
    if (open) {
      loadSettings();
      // Reset form when opening
      setName('');
      setBudget('');
      setError('');
    } else {
      // Reset focus/keyboard when sheet closes
      Keyboard.dismiss();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const appSettings = await getSettings();
      setSettings(appSettings);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    // Use currency-aware validation
    const validation = validateCurrencyInput(budget, settings.currency);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newCategory: Category = {
        id: generateId(),
        name: name.trim(),
        budget: Number(budget), // Will be converted to base units in saveCategory
      };

      await saveCategory(newCategory, settings.currency);

      toast.show('Category added successfully!', {
        message: 'Your category has been saved.',
      });

      onOpenChange(false);
      onCategoryAdded?.();
    } catch (e) {
      console.error('Failed to save category:', e);
      setError('Failed to save category. Please try again.');
      toast.show('Error', {
        message: 'Failed to save category. Please try again.',
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
          Add Category
        </Text>

        {error ? (
          <Text color="$red10">
            {error}
          </Text>
        ) : null}

        <YStack gap="$3">
          <Input
            placeholder="Category name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Input
            placeholder={settings.currency === 'JPY' || settings.currency === 'KRW' ?
              `Monthly budget (no decimals for ${settings.currency})` :
              `Monthly budget (e.g. 1000.00 for ${settings.currency})`}
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
              {loading ? 'Saving...' : 'Add Category'}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
} 