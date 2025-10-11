import type { CurrencyType, SupportedLanguage } from '@/generated/api/api';

export const SUPPORT_MAIL = 'support@dimewise.app';
export const SOCIAL_AUTHS = ['facebook', 'google', 'apple', 'line'] as const;
export type SocialAuthType = (typeof SOCIAL_AUTHS)[number];
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
