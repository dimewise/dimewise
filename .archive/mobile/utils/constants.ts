import type { CurrencyType, SupportedLanguage } from '@/generated/api/api';

export const SUPPORT_MAIL = 'support@dimewise.app';
export const WEB_BASE_URL = 'https://www.dimewise.app';
export const SOCIAL_AUTHS = ['facebook', 'google', 'apple', 'line'] as const;
export type SocialAuthType = (typeof SOCIAL_AUTHS)[number];

/**
 * Get localized web URL for privacy policy or terms & conditions
 * @param path - 'privacy-policy' or 'terms-and-conditions'
 * @param locale - Language code ('en' or 'ja'), defaults to 'en'
 * @returns Full URL to the web page
 */
export const getLegalPageUrl = (
  path: 'privacy-policy' | 'terms-and-conditions',
  locale: string = 'en',
): string => {
  const supportedLocales = ['en', 'ja'];
  const lang = supportedLocales.includes(locale) ? locale : 'en';
  return `${WEB_BASE_URL}/${lang}/${path}`;
};
export const CURRENCIES: CurrencyType[] = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'KRW',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'SEK',
  'NOK',
  'MXN',
  'NZD',
  'SGD',
  'HKD',
  'INR',
  'RUB',
  'ZAR',
  'TRY',
  'BRL',
  'PLN',
  'MYR',
  'THB',
  'VND',
  'IDR',
  'PHP',
  'TWD',
  'DKK',
  'CZK',
  'HUF',
] as const;
export const LANGUAGES: SupportedLanguage[] = ['en', 'ja'] as const;
