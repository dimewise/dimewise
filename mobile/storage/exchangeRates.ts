import { SQLiteDatabase } from 'expo-sqlite';
import { Currency } from './database';

export interface ExchangeRate {
  id: number;
  baseCurrency: Currency;
  targetCurrency: Currency;
  buyRate: number;
  sellRate: number;
  updatedAt: string;
}

// Get all exchange rates
export const getExchangeRates = async (db: SQLiteDatabase): Promise<ExchangeRate[]> => {
  try {
    const rows = await db.getAllAsync<{
      id: number;
      base_currency: string;
      target_currency: string;
      buy_rate: number;
      sell_rate: number;
      updated_at: string;
    }>('SELECT * FROM exchange_rates ORDER BY target_currency');

    return rows.map(row => ({
      id: row.id,
      baseCurrency: row.base_currency as Currency,
      targetCurrency: row.target_currency as Currency,
      buyRate: row.buy_rate,
      sellRate: row.sell_rate,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error getting exchange rates:', error);
    return [];
  }
};

// Get specific exchange rate
export const getExchangeRate = async (db: SQLiteDatabase, baseCurrency: Currency, targetCurrency: Currency): Promise<ExchangeRate | null> => {
  try {
    const row = await db.getFirstAsync<{
      id: number;
      base_currency: string;
      target_currency: string;
      buy_rate: number;
      sell_rate: number;
      updated_at: string;
    }>('SELECT * FROM exchange_rates WHERE base_currency = ? AND target_currency = ?', [baseCurrency, targetCurrency]);

    if (!row) return null;

    return {
      id: row.id,
      baseCurrency: row.base_currency as Currency,
      targetCurrency: row.target_currency as Currency,
      buyRate: row.buy_rate,
      sellRate: row.sell_rate,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return null;
  }
};

// Get exchange rate for currency (assumes USD base)
export const getExchangeRateForCurrency = async (db: SQLiteDatabase, targetCurrency: Currency): Promise<ExchangeRate | null> => {
  try {
    const row = await db.getFirstAsync<{
      id: number;
      base_currency: string;
      target_currency: string;
      buy_rate: number;
      sell_rate: number;
      updated_at: string;
    }>('SELECT * FROM exchange_rates WHERE target_currency = ? ORDER BY updated_at DESC LIMIT 1', [targetCurrency]);

    if (!row) return null;

    return {
      id: row.id,
      baseCurrency: row.base_currency as Currency,
      targetCurrency: row.target_currency as Currency,
      buyRate: row.buy_rate,
      sellRate: row.sell_rate,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error getting exchange rate for currency:', error);
    return null;
  }
};

// Update exchange rate
export const updateExchangeRate = async (db: SQLiteDatabase, baseCurrency: Currency, targetCurrency: Currency, buyRate: number, sellRate: number): Promise<void> => {
  try {
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT OR REPLACE INTO exchange_rates (base_currency, target_currency, buy_rate, sell_rate, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [baseCurrency, targetCurrency, buyRate, sellRate, now]
    );
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    throw error;
  }
};

// Bulk update exchange rates
export const updateExchangeRates = async (db: SQLiteDatabase, rates: Array<{
  baseCurrency: Currency;
  targetCurrency: Currency;
  buyRate: number;
  sellRate: number;
}>): Promise<void> => {
  try {
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      for (const rate of rates) {
        await db.runAsync(
          `INSERT OR REPLACE INTO exchange_rates (base_currency, target_currency, buy_rate, sell_rate, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [rate.baseCurrency, rate.targetCurrency, rate.buyRate, rate.sellRate, now]
        );
      }
    });

    console.log(`Updated ${rates.length} exchange rates`);
  } catch (error) {
    console.error('Error bulk updating exchange rates:', error);
    throw error;
  }
};

// Get exchange rates last update time
export const getExchangeRatesLastUpdate = async (db: SQLiteDatabase): Promise<string | null> => {
  try {
    const result = await db.getFirstAsync<{ updated_at: string }>(
      'SELECT updated_at FROM exchange_rates ORDER BY updated_at DESC LIMIT 1'
    );
    return result?.updated_at || null;
  } catch (error) {
    console.error('Error getting exchange rates last update:', error);
    return null;
  }
};

// Convert currency amounts
export const convertCurrency = async (
  db: SQLiteDatabase,
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  useBuyRate: boolean = true
): Promise<number> => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Get exchange rate
    const exchangeRate = await getExchangeRate(db, 'USD', toCurrency);
    const fromRate = await getExchangeRate(db, 'USD', fromCurrency);

    if (!exchangeRate || !fromRate) {
      console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      return amount; // Return original amount if conversion not possible
    }

    // Convert to USD first, then to target currency
    const rate = useBuyRate ? exchangeRate.buyRate : exchangeRate.sellRate;
    const fromRateValue = useBuyRate ? fromRate.buyRate : fromRate.sellRate;

    const usdAmount = amount / fromRateValue;
    const convertedAmount = usdAmount * rate;

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount; // Return original amount on error
  }
};

// Get currency conversion rate
export const getConversionRate = async (
  db: SQLiteDatabase,
  fromCurrency: Currency,
  toCurrency: Currency,
  useBuyRate: boolean = true
): Promise<number> => {
  try {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const exchangeRate = await getExchangeRate(db, 'USD', toCurrency);
    const fromRate = await getExchangeRate(db, 'USD', fromCurrency);

    if (!exchangeRate || !fromRate) {
      return 1; // Return 1:1 rate if conversion not possible
    }

    const rate = useBuyRate ? exchangeRate.buyRate : exchangeRate.sellRate;
    const fromRateValue = useBuyRate ? fromRate.buyRate : fromRate.sellRate;

    return rate / fromRateValue;
  } catch (error) {
    console.error('Error getting conversion rate:', error);
    return 1;
  }
};

// Check if exchange rates should be updated (older than 24 hours)
export const shouldUpdateExchangeRates = async (db: SQLiteDatabase): Promise<boolean> => {
  try {
    const lastUpdate = await getExchangeRatesLastUpdate(db);
    if (!lastUpdate) return true;

    const lastUpdateTime = new Date(lastUpdate);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);

    return hoursDiff > 24; // Update if older than 24 hours
  } catch (error) {
    console.error('Error checking if exchange rates should be updated:', error);
    return true;
  }
};

// Reset exchange rates to default values
export const resetExchangeRates = async (db: SQLiteDatabase): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM exchange_rates');

    // Re-insert default rates (this should match the initial schema)
    const defaultRates = [
      { base: 'USD', target: 'USD', buy: 1.0, sell: 1.0 },
      { base: 'USD', target: 'EUR', buy: 0.85, sell: 0.87 },
      { base: 'USD', target: 'GBP', buy: 0.75, sell: 0.77 },
      { base: 'USD', target: 'JPY', buy: 150.0, sell: 152.0 },
      { base: 'USD', target: 'KRW', buy: 1320.0, sell: 1340.0 },
      { base: 'USD', target: 'CAD', buy: 1.25, sell: 1.27 },
      { base: 'USD', target: 'AUD', buy: 1.35, sell: 1.37 },
      { base: 'USD', target: 'CHF', buy: 0.92, sell: 0.94 },
      { base: 'USD', target: 'CNY', buy: 7.20, sell: 7.30 },
      { base: 'USD', target: 'SEK', buy: 10.50, sell: 10.70 },
      { base: 'USD', target: 'NOK', buy: 10.20, sell: 10.40 },
      { base: 'USD', target: 'MXN', buy: 17.50, sell: 17.80 },
      { base: 'USD', target: 'NZD', buy: 1.62, sell: 1.64 },
      { base: 'USD', target: 'SGD', buy: 1.35, sell: 1.37 },
      { base: 'USD', target: 'HKD', buy: 7.80, sell: 7.82 },
      { base: 'USD', target: 'INR', buy: 83.0, sell: 84.0 },
      { base: 'USD', target: 'RUB', buy: 90.0, sell: 95.0 },
      { base: 'USD', target: 'ZAR', buy: 18.5, sell: 19.0 },
      { base: 'USD', target: 'TRY', buy: 28.0, sell: 29.0 },
      { base: 'USD', target: 'BRL', buy: 5.0, sell: 5.1 },
      { base: 'USD', target: 'PLN', buy: 4.0, sell: 4.1 },
      { base: 'USD', target: 'MYR', buy: 4.65, sell: 4.75 },
      { base: 'USD', target: 'THB', buy: 35.5, sell: 36.0 },
      { base: 'USD', target: 'VND', buy: 24500.0, sell: 24700.0 },
      { base: 'USD', target: 'IDR', buy: 15800.0, sell: 16000.0 },
      { base: 'USD', target: 'PHP', buy: 56.0, sell: 57.0 },
      { base: 'USD', target: 'TWD', buy: 31.5, sell: 32.0 },
      { base: 'USD', target: 'DKK', buy: 6.85, sell: 6.95 },
      { base: 'USD', target: 'CZK', buy: 22.5, sell: 23.0 },
      { base: 'USD', target: 'HUF', buy: 360.0, sell: 370.0 }
    ];

    await updateExchangeRates(db, defaultRates.map(rate => ({
      baseCurrency: rate.base as Currency,
      targetCurrency: rate.target as Currency,
      buyRate: rate.buy,
      sellRate: rate.sell
    })));

    console.log('Exchange rates reset to default values');
  } catch (error) {
    console.error('Error resetting exchange rates:', error);
    throw error;
  }
}; 