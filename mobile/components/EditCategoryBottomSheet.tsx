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
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={{
        padding: 16,
      }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <View style={{
            padding: 8,
            backgroundColor: theme.colors.surface,
          }}>
            <Text variant="headlineMedium" style={{
              marginBottom: 32,
              fontWeight: '700',
              color: theme.colors.onSurface,
              textAlign: 'center'
            }}>
              Edit Category
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
                label="Category Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={{ backgroundColor: theme.colors.surface }}
                outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 6 }}
                contentStyle={{ fontWeight: '500' }}
              />

              <TextInput
                label={`Budget Amount (${currency})`}
                value={budget}
                onChangeText={setBudget}
                mode="outlined"
                keyboardType="numeric"
                style={{ backgroundColor: theme.colors.surface }}
                outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1 }}
                contentStyle={{ fontWeight: '600', fontSize: 16 }}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600'
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600'
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
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
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
} 