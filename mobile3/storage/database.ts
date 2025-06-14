import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'dimewise.db';
const DATABASE_VERSION = 1;

// Supported currencies - expanded list including MYR and other major currencies
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK',
  'NOK', 'MXN', 'NZD', 'SGD', 'HKD', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL',
  'PLN', 'MYR', 'THB', 'VND', 'IDR', 'PHP', 'TWD', 'DKK', 'CZK', 'HUF'
] as const;

export type Currency = typeof SUPPORTED_CURRENCIES[number];

// System category IDs
export const SYSTEM_CATEGORIES = {
  UNCATEGORIZED: 'system-uncategorized'
} as const;

// Database migration function for SQLiteProvider
export const migrateDbIfNeeded = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('Checking database migrations...');

  // Enable foreign keys and WAL mode OUTSIDE of transaction
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  console.log(`Current database version: ${currentVersion}, target version: ${DATABASE_VERSION}`);

  if (currentVersion >= DATABASE_VERSION) {
    console.log('Database is up to date');
    return;
  }

  // Run migrations within a transaction for safety
  await db.withTransactionAsync(async () => {
    console.log('Running database migrations...');

    if (currentVersion === 0) {
      console.log('Creating initial database schema...');
      await createInitialSchema(db);
    }

    // Add future migrations here as version increments
    // if (currentVersion === 1) {
    //   await migrationV1toV2(db);
    // }

    // Update database version
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log(`Database migrated to version ${DATABASE_VERSION}`);
  });
};

const createInitialSchema = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  await database.execAsync(`
    -- Categories table
    CREATE TABLE categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      budget INTEGER NOT NULL CHECK (budget >= 0),
      currency TEXT NOT NULL CHECK (currency IN ('${SUPPORTED_CURRENCIES.join("','")}'))
    );

    -- Payment methods table
    CREATE TABLE payment_methods (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'cash', 'bank_transfer', 'digital_wallet', 'other'))
    );

    -- Expenses table
    CREATE TABLE expenses (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount INTEGER NOT NULL CHECK (amount > 0),
      currency TEXT NOT NULL CHECK (currency IN ('${SUPPORTED_CURRENCIES.join("','")}')),
      category_id TEXT NOT NULL,
      payment_method_id TEXT,
      previous_category_id TEXT, -- For audit trail when category is deleted
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id) ON DELETE SET NULL,
      FOREIGN KEY (previous_category_id) REFERENCES categories (id) ON DELETE SET NULL
    );

    -- Exchange rates table (USD as base currency)
    CREATE TABLE exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base_currency TEXT NOT NULL DEFAULT 'USD',
      target_currency TEXT NOT NULL CHECK (target_currency IN ('${SUPPORTED_CURRENCIES.join("','")}')),
      buy_rate REAL NOT NULL CHECK (buy_rate > 0),
      sell_rate REAL NOT NULL CHECK (sell_rate > 0),
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(base_currency, target_currency)
    );

    -- Settings table
    CREATE TABLE settings (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      currency TEXT NOT NULL CHECK (currency IN ('${SUPPORTED_CURRENCIES.join("','")}')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX idx_expenses_category_id ON expenses(category_id);
    CREATE INDEX idx_expenses_payment_method_id ON expenses(payment_method_id);
    CREATE INDEX idx_expenses_date ON expenses(date);
    CREATE INDEX idx_exchange_rates_target ON exchange_rates(target_currency);
    CREATE INDEX idx_exchange_rates_updated ON exchange_rates(updated_at);

    -- Insert system data
    INSERT INTO categories (id, name, budget, currency) VALUES 
      ('${SYSTEM_CATEGORIES.UNCATEGORIZED}', 'Uncategorized', 0, 'USD');
    
    INSERT INTO payment_methods (id, name, type) VALUES 
      ('default-cash', 'Cash', 'cash');
    
    INSERT INTO settings (id, currency) VALUES (1, 'USD');

    -- Insert initial exchange rates (as of 2024 - approximate rates)
    INSERT INTO exchange_rates (base_currency, target_currency, buy_rate, sell_rate) VALUES
      ('USD', 'USD', 1.0, 1.0),
      ('USD', 'EUR', 0.85, 0.87),
      ('USD', 'GBP', 0.75, 0.77),
      ('USD', 'JPY', 150.0, 152.0),
      ('USD', 'KRW', 1320.0, 1340.0),
      ('USD', 'CAD', 1.25, 1.27),
      ('USD', 'AUD', 1.35, 1.37),
      ('USD', 'CHF', 0.92, 0.94),
      ('USD', 'CNY', 7.20, 7.30),
      ('USD', 'SEK', 10.50, 10.70),
      ('USD', 'NOK', 10.20, 10.40),
      ('USD', 'MXN', 17.50, 17.80),
      ('USD', 'NZD', 1.62, 1.64),
      ('USD', 'SGD', 1.35, 1.37),
      ('USD', 'HKD', 7.80, 7.82),
      ('USD', 'INR', 83.0, 84.0),
      ('USD', 'RUB', 90.0, 95.0),
      ('USD', 'ZAR', 18.5, 19.0),
      ('USD', 'TRY', 28.0, 29.0),
      ('USD', 'BRL', 5.0, 5.1),
      ('USD', 'PLN', 4.0, 4.1),
      ('USD', 'MYR', 4.65, 4.75),
      ('USD', 'THB', 35.5, 36.0),
      ('USD', 'VND', 24500.0, 24700.0),
      ('USD', 'IDR', 15800.0, 16000.0),
      ('USD', 'PHP', 56.0, 57.0),
      ('USD', 'TWD', 31.5, 32.0),
      ('USD', 'DKK', 6.85, 6.95),
      ('USD', 'CZK', 22.5, 23.0),
      ('USD', 'HUF', 360.0, 370.0);
  `);

  console.log('Initial database schema created successfully');
};

// Utility function to generate UUID-like IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Database constants for usage
export { DATABASE_NAME }; 