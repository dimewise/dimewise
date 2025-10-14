import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../../assets/lang/en.json';
import ja from '../../assets/lang/ja.json';

const SUPPORTED_LANGUAGES = ['en', 'ja'];

// Get device locale and normalize to our supported language codes
export const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  const deviceLocale = locales[0]?.languageTag || 'en'; // Get first locale, fallback to 'en'
  const languageCode = deviceLocale.split('-')[0]; // Get 'en' from 'en-US'

  // Check if we support this language, otherwise fall back to English
  return SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'en';
};

export const resources = {
  en: { translation: en },
  ja: { translation: ja },
};

// Construct i18n instance
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // Debug in development
  debug: __DEV__,

  // React i18next configuration
  react: {
    useSuspense: false,
  },
});

/**
 * Syncs i18n language with user's preferred language from backend
 * Call this when user data is loaded or when user changes language preference
 */
export const syncLanguageWithUser = (language: string) => {
  if (SUPPORTED_LANGUAGES.includes(language) && i18n.language !== language) {
    i18n.changeLanguage(language);
  }
};

export default i18n;
