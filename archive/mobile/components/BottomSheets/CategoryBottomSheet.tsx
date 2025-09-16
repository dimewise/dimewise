import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createCategory } from '../../db/mutation/category';
import { validateCurrencyInput } from '../../db/utils';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { useUser } from '../contexts/UserContext';
import { BSTextInput } from './BottomSheetTextInput';

interface CategoryBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onCategoryAdded?: () => void;
}

export default function CategoryBottomSheet({
  visible,
  onDismiss,
  onCategoryAdded,
}: CategoryBottomSheetProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const { t } = useTranslation();
  const { user, userSetting } = useUser();
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
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    }
  }, [visible, resetForm]);

  const handleSubmit = async () => {
    if (!user) return;

    if (!name.trim()) {
      setError(t('forms.categoryNameRequired'));
      return;
    }

    const validation = validateCurrencyInput(budget, 'budget', currency);
    if (!validation.isValid) {
      setError(validation.error || t('forms.enterValidBudgetAmount'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const categoryData = {
        name: name.trim(),
        budget: Number(budget),
        currency: currency,
        userId: user.id,
      };

      await createCategory(categoryData);

      onDismiss();
      onCategoryAdded?.();
      triggerRefresh('categories');
    } catch (e) {
      console.error('Failed to save category:', e);
      setError(t('forms.saveCategoryError'));
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
        keyboardShouldPersistTaps="never"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={false}
      >
        <SafeAreaView
          edges={['bottom']}
          style={{ flex: 1 }}
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
            {t('categories.newCategory')}
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
              <BSTextInput
                onChangeText={setName}
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
              <BSTextInput
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholder={t('forms.budgetAmount', { currency })}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                contentStyle={{
                  paddingVertical: 4,
                }}
                labelStyle={{
                  fontSize: 16,
                  fontWeight: '600',
                  letterSpacing: 0.25,
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
                  letterSpacing: 0.25,
                }}
                style={{
                  flex: 1,
                  borderRadius: 6,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {t('categories.addCategory')}
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
