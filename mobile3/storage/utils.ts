import { Currency, SUPPORTED_CURRENCIES } from './database';

// Currency formatting configuration
export const CURRENCY_CONFIG: Record<Currency, { symbol: string; name: string; decimalPlaces: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  KRW: { symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimalPlaces: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2 },
  MXN: { symbol: '$', name: 'Mexican Peso', decimalPlaces: 2 },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  RUB: { symbol: '₽', name: 'Russian Ruble', decimalPlaces: 2 },
  ZAR: { symbol: 'R', name: 'South African Rand', decimalPlaces: 2 },
  TRY: { symbol: '₺', name: 'Turkish Lira', decimalPlaces: 2 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
  PLN: { symbol: 'zł', name: 'Polish Zloty', decimalPlaces: 2 },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimalPlaces: 2 },
  THB: { symbol: '฿', name: 'Thai Baht', decimalPlaces: 2 },
  VND: { symbol: '₫', name: 'Vietnamese Dong', decimalPlaces: 0 },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimalPlaces: 0 },
  PHP: { symbol: '₱', name: 'Philippine Peso', decimalPlaces: 2 },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar', decimalPlaces: 2 },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2 },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', decimalPlaces: 2 },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimalPlaces: 0 }
};

/**
 * Convert display amount to storage units (integers)
 * For currencies with decimals: multiply by 10^decimalPlaces (e.g., $10.50 -> 1050 cents)
 * For whole number currencies: store as-is (e.g., ¥1000 -> 1000)
 */
export const toStorageUnits = (displayAmount: number, currency: Currency): number => {
  if (!displayAmount || isNaN(displayAmount) || !isFinite(displayAmount)) {
    return 0;
  }

  const config = CURRENCY_CONFIG[currency];
  if (config.decimalPlaces === 0) {
    // JPY, KRW, VND, IDR, HUF: store as-is (whole numbers)
    return Math.round(displayAmount);
  } else {
    // USD, EUR, etc: convert to smallest unit and store as integer
    return Math.round(displayAmount * Math.pow(10, config.decimalPlaces));
  }
};

/**
 * Convert storage units (integers) back to display amounts
 */
export const fromStorageUnits = (storageAmount: number, currency: Currency): number => {
  if (!storageAmount || isNaN(storageAmount) || !isFinite(storageAmount)) {
    return 0;
  }

  // Ensure we have an integer from storage
  const integerAmount = Math.round(storageAmount);

  const config = CURRENCY_CONFIG[currency];
  if (config.decimalPlaces === 0) {
    // JPY, KRW, VND, IDR, HUF: return as-is
    return integerAmount;
  } else {
    // USD, EUR, etc: convert from smallest unit
    return integerAmount / Math.pow(10, config.decimalPlaces);
  }
};

/**
 * Cross-currency conversion using exchange rates
 * This will be used with actual exchange rates from the database
 */
export const convertCurrencyWithRate = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const convertedAmount = amount * exchangeRate;
  const toConfig = CURRENCY_CONFIG[toCurrency];

  if (toConfig.decimalPlaces === 0) {
    return Math.round(convertedAmount);
  } else {
    return Math.round(convertedAmount * Math.pow(10, toConfig.decimalPlaces)) /
      Math.pow(10, toConfig.decimalPlaces);
  }
};

/**
 * Format amount with currency symbol and proper decimal places
 */
export const formatAmount = (amount: number, currency: Currency): string => {
  const config = CURRENCY_CONFIG[currency];

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);

    return `${config.symbol}${formatted}`;
  } catch (error) {
    console.error('Error formatting amount:', error);
    return `${config.symbol}${amount.toFixed(config.decimalPlaces)}`;
  }
};

/**
 * Format amount with currency code suffix (for lists/tables)
 */
export const formatAmountWithCode = (amount: number, currency: Currency): string => {
  const config = CURRENCY_CONFIG[currency];

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);

    return `${formatted} ${currency}`;
  } catch (error) {
    console.error('Error formatting amount:', error);
    return `${amount.toFixed(config.decimalPlaces)} ${currency}`;
  }
};

/**
 * Validate currency input from user
 */
export const validateCurrencyInput = (input: string, currency: Currency): { isValid: boolean; error?: string } => {
  const cleanInput = input.replace(/[^\d.-]/g, '');
  const number = parseFloat(cleanInput);

  if (isNaN(number)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (number < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  if (number === 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  const config = CURRENCY_CONFIG[currency];
  if (config.decimalPlaces === 0) {
    if (number % 1 !== 0) {
      return { isValid: false, error: `${currency} amounts cannot have decimal places` };
    }
  } else {
    const decimalPart = cleanInput.split('.')[1];
    if (decimalPart && decimalPart.length > config.decimalPlaces) {
      return { isValid: false, error: `${currency} amounts can have at most ${config.decimalPlaces} decimal places` };
    }
  }

  if (number > 1000000000) {
    return { isValid: false, error: 'Amount is too large' };
  }

  return { isValid: true };
};

/**
 * Parse currency input string to number
 */
export const parseCurrencyInput = (input: string): number => {
  const cleanInput = input.replace(/[^\d.-]/g, '');
  return parseFloat(cleanInput) || 0;
};

/**
 * Check if currency is supported
 */
export const isSupportedCurrency = (currency: string): currency is Currency => {
  return SUPPORTED_CURRENCIES.includes(currency as Currency);
};

/**
 * Get currency display name
 */
export const getCurrencyName = (currency: Currency): string => {
  return CURRENCY_CONFIG[currency].name;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCY_CONFIG[currency].symbol;
};

/**
 * Get currency decimal places
 */
export const getCurrencyDecimalPlaces = (currency: Currency): number => {
  return CURRENCY_CONFIG[currency].decimalPlaces;
}; 