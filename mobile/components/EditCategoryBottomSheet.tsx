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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Storage hooks
  const categoryOps = useCategories();

  // Bottom sheet snap points - using dynamic sizing
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    if (visible && category) {
      bottomSheetModalRef.current?.present();
      setName(category.name);
      setBudget(category.budget.toString());
    } else {
      bottomSheetModalRef.current?.dismiss();
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
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={{ padding: 16, paddingBottom: 16 }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={{ marginBottom: 24, fontWeight: '600' }}>
            Edit Category
          </Text>

          {error ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.error, marginBottom: 16 }}>
              {error}
            </Text>
          ) : null}

          <View style={{ gap: 16 }}>
            <TextInput
              label="Category Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              placeholder="Enter category name"
            />

            <TextInput
              label={`Budget Amount (${currency})`}
              value={budget}
              onChangeText={setBudget}
              mode="outlined"
              placeholder="0.00"
              keyboardType="numeric"
            />

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
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheetModal>
  );
} 