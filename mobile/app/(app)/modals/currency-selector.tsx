import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useGetUsersMeQuery, usePutUsersMeMutation } from '@/generated/api/api';
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
      Alert.alert(t('currency_change_title'), t('currency_change_message'), [
        { text: t('currency_change_cancel'), style: 'cancel' },
        {
          text: t('currency_change_continue'),
          style: 'destructive',
          onPress: async () => {
            await performCurrencyUpdate();
          },
        },
      ]);
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
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings_select_currency')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={onCancel}
          style={[styles.cancelButton, isLoading && styles.disabledButton]}
          disabled={isLoading}
        >
          <Text style={[styles.cancelButtonText, isLoading && styles.disabledButtonText]}>
            {t('form_cancel')}
          </Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.disabledButtonText]}>
            {isLoading ? '...' : t('form_save')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDefault,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSurface,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    overflow: 'hidden',
    margin: 24,
  },
  picker: {
    height: 200,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.backgroundDefault,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    // Keep original text colors but with reduced opacity
  },
});
