/**
 * Currency utility functions for handling different currency types
 * Some currencies don't use decimal places (like JPY, KRW, VND, etc.)
 */

export type CurrencyType =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'CHF'
  | 'CNY'
  | 'SEK'
  | 'NOK'
  | 'MXN'
  | 'NZD'
  | 'SGD'
  | 'HKD'
  | 'INR'
  | 'RUB'
  | 'ZAR'
  | 'TRY'
  | 'BRL'
  | 'PLN'
  | 'MYR'
  | 'THB'
  | 'DKK'
  | 'CZK'
  | 'HUF'
  | 'JPY'
  | 'KRW'
  | 'VND'
  | 'IDR'
  | 'PHP'
  | 'TWD';

// Currencies that don't use decimal places (no cents)
const NO_DECIMAL_CURRENCIES: CurrencyType[] = [
  'JPY', // Japanese Yen
  'KRW', // South Korean Won
  'VND', // Vietnamese Dong
  'IDR', // Indonesian Rupiah
  'PHP', // Philippine Peso
  'TWD', // Taiwan Dollar
];

/**
 * Check if a currency uses decimal places (cents)
 */
export const currencyUsesDecimals = (currency: CurrencyType): boolean => {
  return !NO_DECIMAL_CURRENCIES.includes(currency);
};

/**
 * Get the number of decimal places for a currency
 */
export const getCurrencyDecimalPlaces = (currency: CurrencyType): number => {
  return currencyUsesDecimals(currency) ? 2 : 0;
};

/**
 * Convert user input to storage value (cents for decimal currencies, units for non-decimal)
 */
export const parseCurrencyInput = (input: string, currency: CurrencyType): number => {
  const numValue = parseFloat(input) || 0;
  return currencyUsesDecimals(currency) ? Math.round(numValue * 100) : Math.round(numValue);
};

/**
 * Convert storage value to display value
 */
export const formatCurrencyForDisplay = (value: number, currency: CurrencyType): string => {
  if (currencyUsesDecimals(currency)) {
    return (value / 100).toFixed(2);
  }
  return value.toString();
};

/**
 * Convert storage value to user input value (for forms)
 */
export const formatCurrencyForInput = (value: number, currency: CurrencyType): number => {
  if (currencyUsesDecimals(currency)) {
    return value / 100;
  }
  return value;
};

/**
 * Get placeholder text for currency input
 */
export const getCurrencyPlaceholder = (currency: CurrencyType): string => {
  return currencyUsesDecimals(currency) ? '1000.00' : '1000';
};

/**
 * Validate currency input
 */
export const validateCurrencyInput = (input: string, currency: CurrencyType): boolean => {
  const numValue = parseFloat(input);
  if (isNaN(numValue) || numValue < 0) return false;

  if (currencyUsesDecimals(currency)) {
    // For decimal currencies, allow up to 2 decimal places
    const parts = input.split('.');
    return parts.length <= 2 && (!parts[1] || parts[1].length <= 2);
  }

  // For non-decimal currencies, no decimal point allowed
  return !input.includes('.');
};
