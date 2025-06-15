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
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCategories, validateCurrencyInput } from '../storage';
import { Category } from '../storage';
import { useCurrency } from '../utils/CurrencyContext';

interface EditCategoryBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  category: Category | null;
  onCategoryUpdated?: () => void;
}

export default function EditCategoryBottomSheet({
  visible,
  onDismiss,
  category,
  onCategoryUpdated
}: EditCategoryBottomSheetProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const { currency } = useCurrency();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Storage hooks
  const categoryOps = useCategories();

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (visible && category) {
      bottomSheetRef.current?.expand();
      setName(category.name);
      setBudget(category.budget.toString());
    } else {
      bottomSheetRef.current?.close();
      resetForm();
    }
  }, [visible, category]);

  const resetForm = () => {
    setName('');
    setBudget('');
    setError('');
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!category) return;

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const validation = validateCurrencyInput(budget, currency);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedCategory: Category = {
        ...category,
        name: name.trim(),
        budget: Number(budget),
        currency: currency,
      };

      await categoryOps.updateCategory(updatedCategory);

      onDismiss();
      onCategoryUpdated?.();
    } catch (e) {
      console.error('Failed to update category:', e);
      setError('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onDismiss();
    }
  }, [onDismiss]);

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
          Edit Category
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
            label="Category Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
          />

          <TextInput
            label={`Budget Amount (${currency})`}
            value={budget}
            onChangeText={setBudget}
            mode="outlined"
            keyboardType="numeric"
          />

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
              Update Category
            </Button>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
} 