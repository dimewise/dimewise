import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../assets/lang/en.json';
import ja from '../assets/lang/ja.json';

// Get device locale and normalize to our supported codes
const getDeviceLanguage = (): string => {
  const deviceLocale = Localization.locale;
  const languageCode = deviceLocale.split('-')[0]; // Get 'en' from 'en-US'

  // Check if we support this language, otherwise fall back to English
  const supportedLanguages = ['en', 'ja'];
  return supportedLanguages.includes(languageCode) ? languageCode : 'en';
};

const resources = {
  en: {
    translation: en,
  },
  ja: {
    translation: ja,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(), // Initial language from device
  fallbackLng: 'en', // Fallback to English

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

export default i18n;
export { getDeviceLanguage };
