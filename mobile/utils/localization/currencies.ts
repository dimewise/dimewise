import type { SupportedLanguage } from '@/generated/api/api';

/**
 * Maps supported language codes to locale strings for number formatting
 */
export const getLocaleFromLanguage = (language: SupportedLanguage): string => {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    ja: 'ja-JP',
  };
  return localeMap[language] || 'en-US';
};

/**
 * Formats a monetary value (in cents) as a currency string
 * @param value - Amount in cents (for most currencies) or base units (for JPY/KRW)
 * @param currency - Currency code (e.g., 'USD', 'JPY')
 * @param locale - Locale string for formatting (e.g., 'en-US', 'ja-JP')
 */
export const formatCurrency = (
  value: number,
  currency: string,
  locale: string = 'en-US',
): string => {
  // Determine decimal places: 0 for JPY, 2 for USD, etc.
  // Most international currencies use 2, but JPY uses 0.
  const fractionDigits = ['JPY', 'KRW'].includes(currency) ? 0 : 2;
  // Divide value by 100 if necessary—USD is commonly stored in cents.
  const number = fractionDigits === 0 ? value : value / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(number);
};

/**
 * Parses user input (in currency units like dollars) and converts to cents for API
 * @param input - User input string or number (e.g., "1000" or "1000.50")
 * @param currency - Currency code to determine if conversion is needed
 * @returns Amount in cents (or base units for JPY/KRW)
 */
export const parseCurrencyInput = (input: string | number, currency: string): number => {
  const numValue = typeof input === 'string' ? parseFloat(input) : input;

  if (Number.isNaN(numValue)) {
    return 0;
  }

  // JPY and KRW don't use fractional units
  const fractionDigits = ['JPY', 'KRW'].includes(currency) ? 0 : 2;

  if (fractionDigits === 0) {
    return Math.round(numValue);
  }

  // Convert dollars to cents
  return Math.round(numValue * 100);
};

/**
 * Converts cents to currency units (dollars) for display in forms
 * @param cents - Amount in cents
 * @param currency - Currency code
 * @returns Amount in currency units
 */
export const centsToUnits = (cents: number, currency: string): string => {
  const fractionDigits = ['JPY', 'KRW'].includes(currency) ? 0 : 2;

  if (fractionDigits === 0) {
    return cents.toString();
  }

  return (cents / 100).toFixed(2);
};
