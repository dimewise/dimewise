import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateCategory } from '../db/repository/category';
import type { Category } from '../db/schema';
import { validateCurrencyInput } from '../db/utils';
import { useRefreshKey } from './contexts/RefreshKeyContext';
import { useUser } from './contexts/UserContext';

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
  onCategoryUpdated,
}: EditCategoryBottomSheetProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const { t } = useTranslation();
  const { userSetting } = useUser();
  const { triggerRefresh } = useRefreshKey();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const currency = userSetting?.currency || 'USD';

  const resetForm = useCallback(() => {
    setName('');
    setBudget('');
    setError('');
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (visible && category) {
      bottomSheetModalRef.current?.present();
      setName(category.name);
      setBudget(category.budget.toString());
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible, category, resetForm]);

  const handleSubmit = async () => {
    if (!category) return;

    if (!name.trim()) {
      setError(t('forms.categoryNameRequired'));
      return;
    }

    const validation = validateCurrencyInput(budget, currency);
    if (!validation.isValid) {
      setError(validation.error || t('forms.enterValidBudgetAmount'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updates = {
        name: name.trim(),
        budget: Number(budget),
        currency: currency,
      };

      await updateCategory(category.id, updates);

      onDismiss();
      onCategoryUpdated?.();
      triggerRefresh('categories');
    } catch (e) {
      console.error('Failed to update category:', e);
      setError(t('forms.updateCategoryError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  // Backdrop component for tap-to-dismiss
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onDismiss}
      />
    ),
    [onDismiss],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={false}
      >
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <View
            style={{
              padding: 8,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Text
              variant="headlineMedium"
              style={{
                marginBottom: 32,
                fontWeight: '700',
                color: theme.colors.onSurface,
                textAlign: 'center',
              }}
            >
              {t('categories.editCategory')}
            </Text>

            {error ? (
              <View
                style={{
                  padding: 16,
                  backgroundColor: theme.colors.errorContainer,
                  borderRadius: 6,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onErrorContainer,
                    fontWeight: '500',
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={{ gap: 24 }}>
              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    marginBottom: 8,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                  }}
                >
                  {t('forms.categoryName')}
                </Text>
                <BottomSheetTextInput
                  value={name}
                  onChangeText={setName}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                    borderWidth: 1,
                    borderRadius: 6,
                    padding: 16,
                    fontSize: 16,
                    fontWeight: '500',
                    color: theme.colors.onSurface,
                  }}
                  placeholder={t('forms.categoryName')}
                />
              </View>

              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    marginBottom: 8,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: '600',
                  }}
                >
                  {t('forms.budgetAmount', { currency })}
                </Text>
                <BottomSheetTextInput
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                    borderWidth: 1,
                    borderRadius: 6,
                    padding: 16,
                    fontSize: 18,
                    fontWeight: '600',
                    color: theme.colors.onSurface,
                  }}
                  placeholder={t('forms.budgetAmount', { currency })}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                  }}
                >
                  {t('actions.cancel')}
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
                    fontWeight: '600',
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
                  {t('actions.saveChanges')}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
