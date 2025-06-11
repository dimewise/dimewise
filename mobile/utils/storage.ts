import * as SQLite from 'expo-sqlite';

// Currency enum - major currencies in alphabetical order
export const SUPPORTED_CURRENCIES = [
  'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD', 'INR', 'JPY',
  'KRW', 'MXN', 'NOK', 'NZD', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'
] as const;

export type Currency = typeof SUPPORTED_CURRENCIES[number];

// Currency formatting configuration
export const CURRENCY_CONFIG: Record<Currency, {
  hasDecimals: boolean;
  symbol?: string;
  decimalPlaces: number;
}> = {
  AUD: { hasDecimals: true, symbol: 'A$', decimalPlaces: 2 },
  BRL: { hasDecimals: true, symbol: 'R$', decimalPlaces: 2 },
  CAD: { hasDecimals: true, symbol: 'C$', decimalPlaces: 2 },
  CHF: { hasDecimals: true, decimalPlaces: 2 },
  CNY: { hasDecimals: true, symbol: '¥', decimalPlaces: 2 },
  EUR: { hasDecimals: true, symbol: '€', decimalPlaces: 2 },
  GBP: { hasDecimals: true, symbol: '£', decimalPlaces: 2 },
  HKD: { hasDecimals: true, symbol: 'HK$', decimalPlaces: 2 },
  INR: { hasDecimals: true, symbol: '₹', decimalPlaces: 2 },
  JPY: { hasDecimals: false, symbol: '¥', decimalPlaces: 0 },
  KRW: { hasDecimals: false, symbol: '₩', decimalPlaces: 0 },
  MXN: { hasDecimals: true, symbol: '$', decimalPlaces: 2 },
  NOK: { hasDecimals: true, decimalPlaces: 2 },
  NZD: { hasDecimals: true, symbol: 'NZ$', decimalPlaces: 2 },
  RUB: { hasDecimals: true, symbol: '₽', decimalPlaces: 2 },
  SEK: { hasDecimals: true, decimalPlaces: 2 },
  SGD: { hasDecimals: true, symbol: 'S$', decimalPlaces: 2 },
  THB: { hasDecimals: true, symbol: '฿', decimalPlaces: 2 },
  TRY: { hasDecimals: true, symbol: '₺', decimalPlaces: 2 },
  USD: { hasDecimals: true, symbol: '$', decimalPlaces: 2 },
  ZAR: { hasDecimals: true, symbol: 'R', decimalPlaces: 2 },
};

// Simplified currency exchange rates (in a real app, fetch from API)
// All rates are relative to USD (1 USD = X currency)
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.00,
  EUR: 0.92,
  JPY: 149.50,
  GBP: 0.79,
  AUD: 1.52,
  CAD: 1.35,
  CHF: 0.88,
  CNY: 7.24,
  SEK: 10.87,
  NZD: 1.64,
  NOK: 10.75,
  KRW: 1327.50,
  INR: 83.25,
  BRL: 4.95,
  RUB: 92.50,
  ZAR: 18.75,
  TRY: 28.50,
  MXN: 17.25,
  SGD: 1.34,
  HKD: 7.82,
  THB: 35.75,
};

// Data models
export interface Category {
  id: string;
  name: string;
  budget: number; // Always stored in USD cents, converted for display
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number; // Always stored in USD cents, converted for display
  categoryId: string;
  date: string; // ISO string
}

export interface Settings {
  currency: Currency;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  currency: 'JPY',
};

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      console.log('Initializing database...');
      // Open database
      db = await SQLite.openDatabaseAsync('budgetApp.db');

      // Enable foreign keys and create tables
      await db.execAsync(`
        PRAGMA foreign_keys = ON;
        
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          budget INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          amount INTEGER NOT NULL,
          categoryId TEXT NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY (categoryId) REFERENCES categories (id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY NOT NULL,
          currency TEXT NOT NULL CHECK (currency IN ('${SUPPORTED_CURRENCIES.join("','")}'))
        );
        
        INSERT OR IGNORE INTO settings (id, currency) VALUES (1, '${DEFAULT_SETTINGS.currency}');
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  })();

  return initPromise;
};

// Ensure database is initialized before using it
const ensureDbInitialized = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    await initDatabase();
  }
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// Currency conversion functions
export const convertFromUSDCents = (usdCents: number, toCurrency: Currency): number => {
  const usdAmount = usdCents / 100; // Convert cents to dollars
  const rate = EXCHANGE_RATES[toCurrency];
  const convertedAmount = usdAmount * rate;

  const config = CURRENCY_CONFIG[toCurrency];
  if (config.decimalPlaces === 0) {
    return Math.round(convertedAmount);
  } else {
    return Math.round(convertedAmount * Math.pow(10, config.decimalPlaces)) / Math.pow(10, config.decimalPlaces);
  }
};

export const convertToUSDCents = (amount: number, fromCurrency: Currency): number => {
  const rate = EXCHANGE_RATES[fromCurrency];
  const usdAmount = amount / rate;
  return Math.round(usdAmount * 100); // Convert to cents and round
};

// Category operations
export const getCategories = async (): Promise<Category[]> => {
  try {
    const database = await ensureDbInitialized();
    const categories = await database.getAllAsync<{ id: string, name: string, budget: number }>('SELECT * FROM categories ORDER BY name');
    const settings = await getSettings();

    // Convert USD cents to display currency
    return categories.map(category => ({
      ...category,
      budget: convertFromUSDCents(category.budget, settings.currency)
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const saveCategory = async (category: Category, inputCurrency: Currency): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    // Convert input amount to USD cents for storage
    const budgetInUSDCents = convertToUSDCents(category.budget, inputCurrency);
    await database.runAsync(
      'INSERT OR REPLACE INTO categories (id, name, budget) VALUES (?, ?, ?)',
      [category.id, category.name, budgetInUSDCents]
    );
  } catch (error) {
    console.error('Error saving category:', error);
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    await database.runAsync('DELETE FROM categories WHERE id = ?', [categoryId]);
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

// Expense operations
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const database = await ensureDbInitialized();
    const expenses = await database.getAllAsync<{ id: string, title: string, description: string, amount: number, categoryId: string, date: string }>('SELECT * FROM expenses ORDER BY date DESC');
    const settings = await getSettings();

    // Convert USD cents to display currency
    return expenses.map(expense => ({
      ...expense,
      amount: convertFromUSDCents(expense.amount, settings.currency)
    }));
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

export const saveExpense = async (expense: Expense, inputCurrency: Currency): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    // Convert input amount to USD cents for storage
    const amountInUSDCents = convertToUSDCents(expense.amount, inputCurrency);
    await database.runAsync(
      `INSERT OR REPLACE INTO expenses (id, title, description, amount, categoryId, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [expense.id, expense.title, expense.description, amountInUSDCents, expense.categoryId, expense.date]
    );
  } catch (error) {
    console.error('Error saving expense:', error);
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    await database.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
};

// Settings operations
export const getSettings = async (): Promise<Settings> => {
  try {
    const database = await ensureDbInitialized();
    const result = await database.getFirstAsync<Settings>('SELECT currency FROM settings WHERE id = 1');
    if (result) {
      return result;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    await database.runAsync('UPDATE settings SET currency = ? WHERE id = 1', [settings.currency]);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Helper functions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getCurrentMonthExpenses = async (): Promise<Expense[]> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  try {
    const database = await ensureDbInitialized();
    const expenses = await database.getAllAsync<{ id: string, title: string, description: string, amount: number, categoryId: string, date: string }>(
      'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [startOfMonth, endOfMonth]
    );
    const settings = await getSettings();

    // Convert USD cents to display currency
    return expenses.map(expense => ({
      ...expense,
      amount: convertFromUSDCents(expense.amount, settings.currency)
    }));
  } catch (error) {
    console.error('Error getting current month expenses:', error);
    return [];
  }
};

export const getTotalBudget = async (): Promise<number> => {
  try {
    const database = await ensureDbInitialized();
    const result = await database.getFirstAsync<{ total: number }>('SELECT SUM(budget) as total FROM categories');
    const settings = await getSettings();

    const totalInUSDCents = result?.total || 0;
    return convertFromUSDCents(totalInUSDCents, settings.currency);
  } catch (error) {
    console.error('Error getting total budget:', error);
    return 0;
  }
};

export const getTotalSpent = async (): Promise<number> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  try {
    const database = await ensureDbInitialized();
    const result = await database.getFirstAsync<{ total: number }>(
      'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ?',
      [startOfMonth, endOfMonth]
    );
    const settings = await getSettings();

    const totalInUSDCents = result?.total || 0;
    return convertFromUSDCents(totalInUSDCents, settings.currency);
  } catch (error) {
    console.error('Error getting total spent:', error);
    return 0;
  }
};

export const getExpensesByCategory = async (categoryId: string): Promise<Expense[]> => {
  try {
    const database = await ensureDbInitialized();
    const expenses = await database.getAllAsync<{ id: string, title: string, description: string, amount: number, categoryId: string, date: string }>(
      'SELECT * FROM expenses WHERE categoryId = ? ORDER BY date DESC',
      [categoryId]
    );
    const settings = await getSettings();

    // Convert USD cents to display currency
    return expenses.map(expense => ({
      ...expense,
      amount: convertFromUSDCents(expense.amount, settings.currency)
    }));
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    return [];
  }
};

export const getCategorySpending = async (categoryId: string): Promise<number> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  try {
    const database = await ensureDbInitialized();
    const result = await database.getFirstAsync<{ total: number }>(
      'SELECT SUM(amount) as total FROM expenses WHERE categoryId = ? AND date >= ? AND date <= ?',
      [categoryId, startOfMonth, endOfMonth]
    );
    const settings = await getSettings();

    const totalInUSDCents = result?.total || 0;
    return convertFromUSDCents(totalInUSDCents, settings.currency);
  } catch (error) {
    console.error('Error getting category spending:', error);
    return 0;
  }
};

// Legacy functions - keeping for backward compatibility but they now work with the new system
export const toBaseUnits = (displayAmount: number, currency: Currency): number => {
  // Convert to USD cents for storage
  return convertToUSDCents(displayAmount, currency);
};

export const fromBaseUnits = (baseAmount: number, currency: Currency): number => {
  // Convert from USD cents to display currency
  return convertFromUSDCents(baseAmount, currency);
};

// Currency-aware input validation
export const validateCurrencyInput = (input: string, currency: Currency): { isValid: boolean; error?: string } => {
  if (!input.trim()) {
    return { isValid: false, error: 'Amount is required' };
  }

  const config = CURRENCY_CONFIG[currency];

  // Check for valid number format based on currency
  let regex: RegExp;
  if (config.decimalPlaces === 0) {
    // JPY, KRW - only allow whole numbers
    regex = /^\d+$/;
    if (!regex.test(input)) {
      return { isValid: false, error: `${currency} does not support decimal places` };
    }
  } else {
    // USD, EUR, etc - allow up to specified decimal places
    regex = new RegExp(`^\\d+(\\.\\d{1,${config.decimalPlaces}})?$`);
    if (!regex.test(input)) {
      return { isValid: false, error: `Please enter a valid amount (up to ${config.decimalPlaces} decimal places)` };
    }
  }

  const numValue = Number(input);
  if (isNaN(numValue) || numValue <= 0) {
    return { isValid: false, error: 'Please enter a positive amount' };
  }

  // Check reasonable limits
  const maxValue = config.decimalPlaces === 0 ? 999999999 : 9999999.99;
  if (numValue > maxValue) {
    return { isValid: false, error: 'Amount is too large' };
  }

  return { isValid: true };
};

// Currency formatting utility
export const formatAmount = (amount: number, currency: Currency): string => {
  const config = CURRENCY_CONFIG[currency];

  // Format number with comma separators and appropriate decimal places
  const formattedNumber = amount.toLocaleString('en-US', {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  });

  // Always return with 3-letter currency code
  return `${formattedNumber} ${currency}`;
}; 