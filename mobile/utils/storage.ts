import * as SQLite from 'expo-sqlite';

// Currency enum - major currencies in alphabetical order
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK',
  'NOK', 'MXN', 'NZD', 'SGD', 'HKD', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'PLN'
] as const;

export type Currency = typeof SUPPORTED_CURRENCIES[number];

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
  PLN: { symbol: 'zł', name: 'Polish Zloty', decimalPlaces: 2 }
};

// For display conversion when currencies don't match (keeping for backward compatibility)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  JPY: 110,
  KRW: 1200,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  SEK: 8.75,
  NOK: 8.65,
  MXN: 17.25,
  NZD: 1.42,
  SGD: 1.35,
  HKD: 7.80,
  INR: 74.50,
  RUB: 73.25,
  ZAR: 14.75,
  TRY: 8.45,
  BRL: 5.15,
  PLN: 3.85
};

// Data models
export interface Category {
  id: string;
  name: string;
  budget: number; // Always in display units (e.g., 1000 JPY, 10.50 USD)
  currency: Currency;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'digital_wallet' | 'other';
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number; // Always in display units (e.g., 1000 JPY, 10.50 USD)
  currency: Currency;
  categoryId: string;
  paymentMethodId: string;
  date: string; // ISO string
}

export interface CategoryWithSpending extends Category {
  spent: number;
  percentage: number;
}

export interface Settings {
  currency: Currency;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  currency: 'JPY'
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
      db = await SQLite.openDatabaseAsync('dimewise.db');

      // Enable foreign keys and create tables
      await db.execAsync(`
        PRAGMA foreign_keys = ON;
        
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          budget INTEGER NOT NULL,
          currency TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS payment_methods (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'cash', 'bank_transfer', 'digital_wallet', 'other'))
        );
        
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          amount INTEGER NOT NULL,
          currency TEXT NOT NULL,
          categoryId TEXT NOT NULL,
          paymentMethodId TEXT,
          date TEXT NOT NULL,
          FOREIGN KEY (categoryId) REFERENCES categories (id) ON DELETE CASCADE,
          FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY NOT NULL,
          currency TEXT NOT NULL CHECK (currency IN ('${SUPPORTED_CURRENCIES.join("','")}'))
        );
        
        INSERT OR IGNORE INTO settings (id, currency) VALUES (1, '${DEFAULT_SETTINGS.currency}');
        
        -- Seed default payment method
        INSERT OR IGNORE INTO payment_methods (id, name, type) VALUES ('default-cash', 'Cash', 'cash');
      `);

      // Handle database migrations for existing installations
      try {
        // Check if paymentMethodId column exists in expenses table
        const tableInfo = await db.getAllAsync("PRAGMA table_info(expenses)");
        const hasPaymentMethodId = tableInfo.some((column: any) => column.name === 'paymentMethodId');

        if (!hasPaymentMethodId) {
          console.log('Adding paymentMethodId column to expenses table');
          await db.execAsync(`
            ALTER TABLE expenses ADD COLUMN paymentMethodId TEXT;
            -- Update existing expenses to use the default cash payment method
            UPDATE expenses SET paymentMethodId = 'default-cash' WHERE paymentMethodId IS NULL;
          `);
        }
      } catch (migrationError) {
        console.error('Migration error:', migrationError);
        // Don't throw here - let the app continue, the column might already exist
      }

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

// Clean monetary conversion functions - INTEGERS ONLY
const toStorageUnits = (displayAmount: number, currency: Currency): number => {
  if (!displayAmount || isNaN(displayAmount) || !isFinite(displayAmount)) {
    return 0;
  }

  const config = CURRENCY_CONFIG[currency];
  if (config.decimalPlaces === 0) {
    // JPY, KRW: store as-is (whole numbers)
    return Math.round(displayAmount);
  } else {
    // USD, EUR: convert to cents and store as integer
    return Math.round(displayAmount * Math.pow(10, config.decimalPlaces));
  }
};

const fromStorageUnits = (storageAmount: number, currency: Currency): number => {
  if (!storageAmount || isNaN(storageAmount) || !isFinite(storageAmount)) {
    return 0;
  }

  // Ensure we have an integer from storage
  const integerAmount = Math.round(storageAmount);

  const config = CURRENCY_CONFIG[currency];
  if (config.decimalPlaces === 0) {
    // JPY, KRW: return as-is
    return integerAmount;
  } else {
    // USD, EUR: convert from cents
    return integerAmount / Math.pow(10, config.decimalPlaces);
  }
};

// Cross-currency conversion for display totals only
const convertForDisplay = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;

  const toConfig = CURRENCY_CONFIG[toCurrency];
  if (toConfig.decimalPlaces === 0) {
    return Math.round(convertedAmount);
  } else {
    return Math.round(convertedAmount * Math.pow(10, toConfig.decimalPlaces)) / Math.pow(10, toConfig.decimalPlaces);
  }
};

// Category operations
export const getCategories = async (): Promise<Category[]> => {
  try {
    const database = await ensureDbInitialized();
    const rows = await database.getAllAsync<{ id: string, name: string, budget: number, currency: string }>('SELECT * FROM categories ORDER BY name');

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      budget: fromStorageUnits(row.budget, row.currency as Currency),
      currency: row.currency as Currency
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const saveCategory = async (category: Category): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    const storageAmount = toStorageUnits(category.budget, category.currency);

    console.log(`Saving category: ${category.name}, ${category.budget} ${category.currency} -> ${storageAmount} storage units`);

    await database.runAsync(
      'INSERT OR REPLACE INTO categories (id, name, budget, currency) VALUES (?, ?, ?, ?)',
      [category.id, category.name, storageAmount, category.currency]
    );
  } catch (error) {
    console.error('Error saving category:', error);
    throw error;
  }
};

export const updateCategoryBudget = async (categoryId: string, newBudget: number, currency: Currency): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    const storageAmount = toStorageUnits(newBudget, currency);

    await database.runAsync(
      'UPDATE categories SET budget = ?, currency = ? WHERE id = ?',
      [storageAmount, currency, categoryId]
    );
  } catch (error) {
    console.error('Error updating category budget:', error);
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

// Payment method operations
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const database = await ensureDbInitialized();
    return await database.getAllAsync<PaymentMethod>('SELECT * FROM payment_methods ORDER BY name');
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
};

export const savePaymentMethod = async (paymentMethod: PaymentMethod): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    await database.runAsync(
      'INSERT OR REPLACE INTO payment_methods (id, name, type) VALUES (?, ?, ?)',
      [paymentMethod.id, paymentMethod.name, paymentMethod.type]
    );
  } catch (error) {
    console.error('Error saving payment method:', error);
  }
};

export const deletePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    await database.runAsync('DELETE FROM payment_methods WHERE id = ?', [paymentMethodId]);
  } catch (error) {
    console.error('Error deleting payment method:', error);
  }
};

// Expense operations
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const database = await ensureDbInitialized();
    const rows = await database.getAllAsync<{ id: string, title: string, description: string, amount: number, currency: string, categoryId: string, paymentMethodId: string | null, date: string }>('SELECT * FROM expenses ORDER BY date DESC');

    return rows
      .filter(row => row.paymentMethodId !== null)
      .map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        amount: fromStorageUnits(row.amount, row.currency as Currency),
        currency: row.currency as Currency,
        categoryId: row.categoryId,
        paymentMethodId: row.paymentMethodId as string,
        date: row.date
      }));
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

export const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    const database = await ensureDbInitialized();
    const storageAmount = toStorageUnits(expense.amount, expense.currency);

    console.log(`Saving expense: ${expense.title}, ${expense.amount} ${expense.currency} -> ${storageAmount} storage units`);

    await database.runAsync(
      `INSERT OR REPLACE INTO expenses (id, title, description, amount, currency, categoryId, paymentMethodId, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [expense.id, expense.title, expense.description, storageAmount, expense.currency, expense.categoryId, expense.paymentMethodId, expense.date]
    );
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
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
    return result || DEFAULT_SETTINGS;
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
    const rows = await database.getAllAsync<{ id: string, title: string, description: string, amount: number, currency: string, categoryId: string, paymentMethodId: string | null, date: string }>(
      'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [startOfMonth, endOfMonth]
    );

    return rows
      .filter(row => row.paymentMethodId !== null)
      .map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        amount: fromStorageUnits(row.amount, row.currency as Currency),
        currency: row.currency as Currency,
        categoryId: row.categoryId,
        paymentMethodId: row.paymentMethodId as string,
        date: row.date
      }));
  } catch (error) {
    console.error('Error getting current month expenses:', error);
    return [];
  }
};

export const getTotalBudget = async (): Promise<number> => {
  try {
    const categories = await getCategories();
    const settings = await getSettings();

    let total = 0;
    for (const category of categories) {
      if (category.currency === settings.currency) {
        total += category.budget;
      } else {
        total += convertForDisplay(category.budget, category.currency, settings.currency);
      }
    }
    return total;
  } catch (error) {
    console.error('Error getting total budget:', error);
    return 0;
  }
};

export const getTotalSpent = async (): Promise<number> => {
  try {
    const expenses = await getCurrentMonthExpenses();
    const settings = await getSettings();

    let total = 0;
    for (const expense of expenses) {
      if (expense.currency === settings.currency) {
        total += expense.amount;
      } else {
        total += convertForDisplay(expense.amount, expense.currency, settings.currency);
      }
    }
    return total;
  } catch (error) {
    console.error('Error getting total spent:', error);
    return 0;
  }
};

export const getExpensesByCategory = async (categoryId: string): Promise<Expense[]> => {
  try {
    const database = await ensureDbInitialized();
    const rows = await database.getAllAsync<{ id: string, title: string, description: string, amount: number, currency: string, categoryId: string, paymentMethodId: string | null, date: string }>(
      'SELECT * FROM expenses WHERE categoryId = ? ORDER BY date DESC',
      [categoryId]
    );

    return rows
      .filter(row => row.paymentMethodId !== null)
      .map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        amount: fromStorageUnits(row.amount, row.currency as Currency),
        currency: row.currency as Currency,
        categoryId: row.categoryId,
        paymentMethodId: row.paymentMethodId as string,
        date: row.date
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
    const rows = await database.getAllAsync<{ amount: number, currency: string }>(
      'SELECT amount, currency FROM expenses WHERE categoryId = ? AND date >= ? AND date <= ?',
      [categoryId, startOfMonth, endOfMonth]
    );
    const settings = await getSettings();

    let total = 0;
    for (const row of rows) {
      const amount = fromStorageUnits(row.amount, row.currency as Currency);
      if (row.currency === settings.currency) {
        total += amount;
      } else {
        total += convertForDisplay(amount, row.currency as Currency, settings.currency);
      }
    }
    return total;
  } catch (error) {
    console.error('Error getting category spending:', error);
    return 0;
  }
};

// Legacy compatibility functions
export const toBaseUnits = (displayAmount: number, currency: Currency): number => {
  return toStorageUnits(displayAmount, currency);
};

export const fromBaseUnits = (baseAmount: number, currency: Currency): number => {
  return fromStorageUnits(baseAmount, currency);
};

// Input validation
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

// Amount formatting with currency code suffix
export const formatAmount = (amount: number, currency: Currency): string => {
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

export const getPaymentMethodById = async (paymentMethodId: string): Promise<PaymentMethod | null> => {
  try {
    const database = await ensureDbInitialized();
    const paymentMethod = await database.getFirstAsync<PaymentMethod>(
      'SELECT * FROM payment_methods WHERE id = ?',
      [paymentMethodId]
    );
    return paymentMethod || null;
  } catch (error) {
    console.error('Error getting payment method:', error);
    return null;
  }
};

export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database reset...');

    if (!db) {
      await initDatabase();
    }

    if (!db) {
      throw new Error('Failed to initialize database');
    }

    console.log('Dropping existing tables...');
    try {
      await db.runAsync('DROP TABLE IF EXISTS expenses');
      await db.runAsync('DROP TABLE IF EXISTS categories');
      await db.runAsync('DROP TABLE IF EXISTS payment_methods');
      await db.runAsync('DROP TABLE IF EXISTS settings');
      console.log('All tables dropped successfully');
    } catch (dropError) {
      console.warn('Some tables may not exist, continuing...', dropError);
    }

    try {
      await db.closeAsync();
      console.log('Database connection closed');
    } catch (closeError) {
      console.warn('Error closing database:', closeError);
    }

    db = null;
    initPromise = null;
    console.log('Reinitializing database...');
    await initDatabase();

    console.log('Database reset and reinitialized successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};
