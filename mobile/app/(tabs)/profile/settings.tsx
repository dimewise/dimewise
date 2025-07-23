import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropdownBottomSheet, {
  DropdownButton,
  type DropdownOption,
} from '../../../components/BottomSheets/DropdownBottomSheet';
import { useRefreshKey } from '../../../components/contexts/RefreshKeyContext';
import { useUser } from '../../../components/contexts/UserContext';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { upsertUserSetting } from '../../../db/repository/userSetting';
import {
  type CurrencyType,
  type LanguageType,
  SUPPORTED_CURRENCIES,
  SUPPORTED_LANGUAGES,
} from '../../../db/schema';
import i18n from '../../../utils/i18n';

export default function SettingsScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('en');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, userSetting, refreshUser } = useUser();
  const { triggerRefresh } = useRefreshKey();

  useEffect(() => {
    if (userSetting) {
      setSelectedCurrency(userSetting.currency);
      setSelectedLanguage(userSetting.preferredLanguage || 'en');
    }
  }, [userSetting]);

  const handleSaveSettings = async () => {
    if (!user || !selectedCurrency || !selectedLanguage) {
      return;
    }

    setLoading(true);
    try {
      await upsertUserSetting(user.id, {
        currency: selectedCurrency,
        preferredLanguage: selectedLanguage,
      });

      // Change the app language immediately
      await i18n.changeLanguage(selectedLanguage);

      // Refresh user data to get the updated settings
      await refreshUser();
      triggerRefresh('settings');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert currencies to dropdown options
  const currencyOptions: DropdownOption[] = SUPPORTED_CURRENCIES.map((curr) => ({
    label: curr,
    value: curr,
    id: curr,
  }));

  // Language display mapping
  const languageLabels: Record<LanguageType, string> = {
    en: 'English',
    ja: '日本語',
  };

  // Convert languages to dropdown options
  const languageOptions: DropdownOption[] = SUPPORTED_LANGUAGES.map((lang) => ({
    label: languageLabels[lang],
    value: lang,
    id: lang,
  }));

  const renderLanguageDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowLanguageDropdown(true)}
        selectedValue={selectedLanguage}
        options={languageOptions}
        placeholder={t('settings.selectLanguage')}
        label={t('settings.language')}
      />
      <DropdownBottomSheet
        visible={showLanguageDropdown}
        onDismiss={() => setShowLanguageDropdown(false)}
        options={languageOptions}
        onSelect={(value) => setSelectedLanguage(value as LanguageType)}
        selectedValue={selectedLanguage}
        title={t('settings.selectLanguage')}
      />
    </>
  );

  const renderCurrencyDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowCurrencyDropdown(true)}
        selectedValue={selectedCurrency}
        options={currencyOptions}
        placeholder={t('settings.selectCurrency')}
        label={t('settings.currency')}
      />
      <DropdownBottomSheet
        visible={showCurrencyDropdown}
        onDismiss={() => setShowCurrencyDropdown(false)}
        options={currencyOptions}
        onSelect={(value) => setSelectedCurrency(value as CurrencyType)}
        selectedValue={selectedCurrency}
        title={t('settings.selectCurrency')}
      />
    </>
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Settings screen error:', error, errorInfo);
      }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={[]}
      >
        <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title={t('settings.title')}
            titleStyle={{ fontWeight: '700' }}
          />
        </Appbar.Header>

        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          contentContainerStyle={{ padding: 24 }}
        >
          {/* Language Settings Section */}
          <View
            style={{
              padding: 24,
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              marginBottom: 16,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text
              variant="titleMedium"
              style={{
                fontWeight: '600',
                marginBottom: 16,
                color: theme.colors.onSurface,
              }}
            >
              {t('settings.language')}
            </Text>
            <View style={{ gap: 16 }}>{renderLanguageDropdown()}</View>
          </View>

          {/* Currency Settings Section */}
          <View
            style={{
              padding: 24,
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              marginBottom: 16,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text
              variant="titleMedium"
              style={{
                fontWeight: '600',
                marginBottom: 16,
                color: theme.colors.onSurface,
              }}
            >
              {t('settings.defaultCurrency')}
            </Text>
            <View style={{ gap: 16 }}>{renderCurrencyDropdown()}</View>
          </View>

          {/* Save Settings Button */}
          <View style={{ marginBottom: 16 }}>
            <Button
              mode="contained"
              onPress={handleSaveSettings}
              loading={loading}
              disabled={
                loading ||
                (selectedCurrency === userSetting?.currency &&
                  selectedLanguage === (userSetting?.preferredLanguage || 'en'))
              }
              contentStyle={{
                paddingVertical: 12,
              }}
              labelStyle={{
                fontSize: 16,
                fontWeight: '600',
                letterSpacing: 0.25,
              }}
              style={{
                borderRadius: 8,
              }}
            >
              {loading
                ? t('common.loading')
                : selectedCurrency === userSetting?.currency &&
                    selectedLanguage === (userSetting?.preferredLanguage || 'en')
                  ? t('settings.settingsUpdated')
                  : t('settings.saveSettings')}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
