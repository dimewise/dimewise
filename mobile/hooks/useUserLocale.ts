import { useGetUsersMeQuery } from '@/generated/api/api';
import { getLocaleFromLanguage } from '@/utils/localization/currencies';

/**
 * Custom hook that returns user's locale preferences
 * Provides currency, language, and locale string based on user's settings (not device)
 */
export const useUserLocale = () => {
  const { data: user } = useGetUsersMeQuery();

  return {
    currency: user?.currency || 'USD',
    language: user?.preferred_language || 'en',
    locale: getLocaleFromLanguage(user?.preferred_language || 'en'),
  };
};
