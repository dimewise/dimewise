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
import { useCurrency } from '../utils/CurrencyContext';

interface CategoryBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onCategoryAdded?: () => void;
}

export default function CategoryBottomSheet({ visible, onDismiss, onCategoryAdded }: CategoryBottomSheetProps) {
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
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setBudget('');
    setError('');
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
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
      await categoryOps.createCategory(
        name.trim(),
        Number(budget),
        currency
      );

      onDismiss();
      onCategoryAdded?.();
    } catch (e) {
      console.error('Failed to save category:', e);
      setError('Failed to save category. Please try again.');
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
      <BottomSheetView style={{ padding: 32, paddingBottom: 24, backgroundColor: theme.colors.surface }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={{
            marginBottom: 32,
            fontWeight: '700',
            color: theme.colors.onSurface,
            textAlign: 'center'
          }}>
            New Category
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
              outlineStyle={{ borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 6 }}
              contentStyle={{ fontWeight: '600', fontSize: 16 }}
            />

            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
              <View style={{
                flex: 1,
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 6,
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
                    fontWeight: '600',
                    letterSpacing: 0.25
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
                  Add Category
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheetModal>
  );
} 