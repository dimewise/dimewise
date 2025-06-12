// Re-export types and constants
export type { Currency } from './database';
export { SUPPORTED_CURRENCIES, SYSTEM_CATEGORIES, generateId } from './database';
export type { Category, CategoryWithSpending } from './categories';
export type { PaymentMethod } from './paymentMethods';
export type { Expense } from './expenses';
export type { ExchangeRate } from './exchangeRates';
export type { Settings } from './settings';

// Re-export utility functions
export * from './utils';

// Re-export provider
export { DatabaseProvider } from './provider';

// Re-export hooks (recommended approach for React components)
export * from './hooks';

// Re-export all storage functions (these will need db parameter)
export * from './categories';
export * from './paymentMethods';
export * from './expenses';
export * from './exchangeRates';
export * from './settings'; 