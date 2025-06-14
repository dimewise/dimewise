import { SQLiteDatabase } from 'expo-sqlite';
import { Currency } from './database';

export interface Settings {
  id: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

// Default settings
const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'> = {
  currency: 'USD'
};

// Get settings
export const getSettings = async (db: SQLiteDatabase): Promise<Settings> => {
  try {
    const row = await db.getFirstAsync<{
      id: number;
      currency: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM settings WHERE id = 1');

    if (!row) {
      // Create default settings if they don't exist
      await ensureSettingsExist(db);
      return getSettings(db); // Recursive call after creating settings
    }

    return {
      id: row.id,
      currency: row.currency as Currency,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    // Return defaults on error
    const now = new Date().toISOString();
    return {
      id: 1,
      currency: DEFAULT_SETTINGS.currency,
      createdAt: now,
      updatedAt: now
    };
  }
};

// Update settings
export const updateSettings = async (db: SQLiteDatabase, newSettings: Partial<Settings>): Promise<Settings> => {
  try {
    const now = new Date().toISOString();

    // Get current settings first
    const currentSettings = await getSettings(db);

    // Update only provided fields
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
      updatedAt: now
    };

    await db.runAsync(
      'UPDATE settings SET currency = ?, updated_at = ? WHERE id = 1',
      [updatedSettings.currency, now]
    );

    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Update currency setting
export const updateCurrency = async (db: SQLiteDatabase, currency: Currency): Promise<void> => {
  try {
    await updateSettings(db, { currency });
  } catch (error) {
    console.error('Error updating currency:', error);
    throw error;
  }
};

// Get current currency
export const getCurrentCurrency = async (db: SQLiteDatabase): Promise<Currency> => {
  try {
    const settings = await getSettings(db);
    return settings.currency;
  } catch (error) {
    console.error('Error getting current currency:', error);
    return DEFAULT_SETTINGS.currency;
  }
};

// Reset settings to defaults
export const resetSettings = async (db: SQLiteDatabase): Promise<Settings> => {
  try {
    const now = new Date().toISOString();

    await db.runAsync(
      'UPDATE settings SET currency = ?, updated_at = ? WHERE id = 1',
      [DEFAULT_SETTINGS.currency, now]
    );

    return {
      id: 1,
      currency: DEFAULT_SETTINGS.currency,
      createdAt: now, // This won't be accurate, but reset operation
      updatedAt: now
    };
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw error;
  }
};

// Check if settings exist
export const settingsExist = async (db: SQLiteDatabase): Promise<boolean> => {
  try {
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM settings WHERE id = 1'
    );
    return (row?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking if settings exist:', error);
    return false;
  }
};

// Ensure settings exist (create if not)
export const ensureSettingsExist = async (db: SQLiteDatabase): Promise<void> => {
  try {
    const exists = await settingsExist(db);
    if (!exists) {
      const now = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO settings (id, currency, created_at, updated_at) VALUES (1, ?, ?, ?)',
        [DEFAULT_SETTINGS.currency, now, now]
      );
      console.log('Created default settings');
    }
  } catch (error) {
    console.error('Error ensuring settings exist:', error);
  }
}; 