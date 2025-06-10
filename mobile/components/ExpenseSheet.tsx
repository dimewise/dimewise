import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { Button, Form, Input, Select, Text, TextArea, YStack, XStack, Sheet, Adapt } from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { getCategories, saveExpense, generateId, getSettings, validateCurrencyInput } from '../utils/storage';
import { Category, Settings } from '../utils/storage';
import { ChevronDown } from '@tamagui/lucide-icons';

interface ExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded?: () => void;
}

export default function ExpenseSheet({ open, onOpenChange, onExpenseAdded }: ExpenseSheetProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: 'JPY' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToastController();

  useEffect(() => {
    if (open) {
      loadData();
      // Reset form when opening
      setTitle('');
      setDescription('');
      setAmount('');
      setCategoryId('');
      setError('');
    } else {
      // Reset focus/keyboard when sheet closes
      Keyboard.dismiss();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [cats, appSettings] = await Promise.all([
        getCategories(),
        getSettings(),
      ]);
      setCategories(cats);
      setSettings(appSettings);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      setError('Failed to load data. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    // Use currency-aware validation
    const validation = validateCurrencyInput(amount, settings.currency);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid amount');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await saveExpense({
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount), // Will be converted to base units in saveExpense
        categoryId,
        date: new Date().toISOString(),
      }, settings.currency);

      toast.show('Expense added successfully!', {
        message: 'Your expense has been saved.',
      });

      onOpenChange(false);
      onExpenseAdded?.();
    } catch (e) {
      console.error('Failed to save expense:', e);
      setError('Failed to save expense. Please try again.');
      toast.show('Error', {
        message: 'Failed to save expense. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    < Sheet
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
          New Expense
        </Text>

        {error ? (
          <Text color="$red10">
            {error}
          </Text>
        ) : null}

        <Form onSubmit={handleSubmit}>
          <YStack gap="$3">
            <Input
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
            />

            <TextArea
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              autoCapitalize="sentences"
            />

            <Input
              placeholder={settings.currency === 'JPY' || settings.currency === 'KRW' ?
                `Amount (no decimals for ${settings.currency})` :
                `Amount (e.g. 10.50 for ${settings.currency})`}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Select value={categoryId} onValueChange={setCategoryId}>
              <Select.Trigger iconAfter={<ChevronDown />}>
                <Select.Value placeholder="Select category" />
              </Select.Trigger>

              <Adapt when="maxMd" platform="touch">
                <Sheet native={false} modal dismissOnSnapToBottom animation="medium">
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

              <Select.Content zIndex={200000}>
                <Select.Viewport>
                  <Select.Group>
                    {categories.length > 0 ? categories.map((category, index) => (
                      <Select.Item key={category.id} index={index} value={category.id} bg={"$black2"}>
                        <Select.ItemText fontSize="$5">{category.name}</Select.ItemText>
                      </Select.Item>
                    )) : (
                      <Select.Item key="no-categories" index={0} value="no-categories">
                        <Select.ItemText>No categories found. Please add categories in the Profile tab.</Select.ItemText>
                      </Select.Item>
                    )}
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
                disabled={loading || categories.length === 0}
                onPress={handleSubmit}
              >
                {loading ? 'Saving...' : 'Save Expense'}
              </Button>
            </XStack>
          </YStack>
        </Form>
      </Sheet.Frame>
    </Sheet >
  );
} 