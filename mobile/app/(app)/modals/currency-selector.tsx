import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import {
  useGetUsersMeQuery,
  usePutUsersMeMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { CURRENCIES } from '@/utils/constants';
import { useState } from 'react';

export default function CurrencySelectorModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: user } = useGetUsersMeQuery();
  const [updateUser, { isLoading }] = usePutUsersMeMutation();
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency ?? 'USD');

  const onSave = async () => {
    if (!user) return;
    
    // Show destructive action alert if currency is changing
    if (selectedCurrency !== user.currency) {
      Alert.alert(
        t('currency_change_title'),
        t('currency_change_message'),
        [
          { text: t('currency_change_cancel'), style: 'cancel' },
          { 
            text: t('currency_change_continue'), 
            style: 'destructive',
            onPress: async () => {
              await performCurrencyUpdate();
            }
          },
        ]
      );
    } else {
      // No change, just close
      router.back();
    }
  };

  const performCurrencyUpdate = async () => {
    if (!user) return;
    
    try {
      await updateUser({
        userUpdate: {
          currency: selectedCurrency as any,
          preferred_language: user.preferred_language,
        },
      }).unwrap();
      router.back();
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('Error', 'Failed to update currency. Please try again.');
    }
  };

  const onCancel = () => {
    router.back();
  };

  return (
    <AppLayout>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('settings_select_currency')}</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCurrency}
              onValueChange={setSelectedCurrency}
              style={styles.picker}
            >
              {CURRENCIES.map((currency) => (
                <Picker.Item
                  key={currency}
                  label={currency}
                  value={currency}
                  color={colors.textPrimary}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable onPress={onCancel} style={[styles.cancelButton, isLoading && styles.disabledButton]} disabled={isLoading}>
              <Text style={[styles.cancelButtonText, isLoading && styles.disabledButtonText]}>{t('form_cancel')}</Text>
            </Pressable>
            <Pressable onPress={onSave} style={[styles.saveButton, isLoading && styles.disabledButton]} disabled={isLoading}>
              <Text style={[styles.saveButtonText, isLoading && styles.disabledButtonText]}>
                {isLoading ? '...' : t('form_save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDefault,
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  pickerContainer: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    overflow: 'hidden',
    marginBottom: 32,
  },
  picker: {
    height: 200,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    // Keep original text colors but with reduced opacity
  },
});
