import React, { createContext, useContext, useEffect, useState } from 'react';
import { Currency, Language, useSettings } from '../storage';
import { useTranslation } from 'react-i18next';
import { getDeviceLanguage } from './i18n';

interface UserSettingsContextType {
  currency: Currency;
  language: Language;
  setCurrency: (currency: Currency) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  updateSettings: (settings: { currency?: Currency; language?: Language }) => Promise<void>;
  refreshKey: number; // Used to force re-renders when settings change
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [language, setLanguageState] = useState<Language>('en');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Storage hooks
  const settingsOps = useSettings();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Only run once on mount
    if (isInitialized) return;

    // Load initial settings
    const loadSettings = async () => {
      try {
        const settings = await settingsOps.getSettings();
        setCurrencyState(settings.currency);

        // Detect device language only if no preference is stored (first time use)
        let effectiveLanguage = settings.preferredLanguage;
        if (settings.preferredLanguage === 'en') {
          const deviceLanguage = getDeviceLanguage() as Language;
          if (deviceLanguage !== 'en') {
            // Silently set device language preference
            await settingsOps.updateLanguage(deviceLanguage);
            effectiveLanguage = deviceLanguage;
          }
        }

        setLanguageState(effectiveLanguage);

        // Only change language if it's different from current
        if (i18n.language !== effectiveLanguage) {
          await i18n.changeLanguage(effectiveLanguage);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading settings:', error);
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, [settingsOps, i18n]); // Removed isInitialized from dependencies

  const setCurrency = async (newCurrency: Currency) => {
    try {
      // Save the new currency setting
      await settingsOps.updateCurrency(newCurrency);

      // Update local state
      setCurrencyState(newCurrency);

      // Increment refresh key to force all consuming components to re-render
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving currency setting:', error);
      throw error;
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      // Save the new language setting
      await settingsOps.updateLanguage(newLanguage);

      // Update local state
      setLanguageState(newLanguage);

      // Update i18n language only if it's different
      if (i18n.language !== newLanguage) {
        await i18n.changeLanguage(newLanguage);
      }

      // Increment refresh key to force all consuming components to re-render
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving language setting:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: { currency?: Currency; language?: Language }) => {
    try {
      const settingsToUpdate: any = {};

      if (newSettings.currency) {
        settingsToUpdate.currency = newSettings.currency;
      }

      if (newSettings.language) {
        settingsToUpdate.preferredLanguage = newSettings.language;
      }

      // Save settings to database
      await settingsOps.updateSettings(settingsToUpdate);

      // Update local state
      if (newSettings.currency) {
        setCurrencyState(newSettings.currency);
      }

      if (newSettings.language) {
        setLanguageState(newSettings.language);
        // Update i18n language only if it's different
        if (i18n.language !== newSettings.language) {
          await i18n.changeLanguage(newSettings.language);
        }
      }

      // Increment refresh key to force all consuming components to re-render
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return (
    <UserSettingsContext.Provider value={{
      currency,
      language,
      setCurrency,
      setLanguage,
      updateSettings,
      refreshKey
    }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = (): UserSettingsContextType => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

// Legacy hooks for backward compatibility
export const useCurrency = () => {
  const { currency, setCurrency, refreshKey } = useUserSettings();
  return { currency, setCurrency, refreshKey };
};

export const useCurrencyRefresh = () => {
  const { refreshKey } = useUserSettings();
  return refreshKey;
}; 