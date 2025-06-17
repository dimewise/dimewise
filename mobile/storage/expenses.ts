import { SQLiteDatabase } from 'expo-sqlite';
import { generateId, Currency } from './database';
import { toStorageUnits, fromStorageUnits } from './utils';

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number; // Always in display units (e.g., 1000 JPY, 10.50 USD)
  currency: Currency;
  categoryId: string;
  paymentMethodId: string;
  date: string; // ISO string
  isVerified: boolean;
  verifiedAt?: string; // ISO string
  previousCategoryId?: string; // For audit trail
  createdAt?: string;
  updatedAt?: string;
}

// Get all expenses
export const getExpenses = async (db: SQLiteDatabase): Promise<Expense[]> => {
  try {
    const rows = await db.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      category_id: string;
      payment_method_id: string;
      previous_category_id: string | null;
      date: string;
      is_verified: number;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM expenses ORDER BY date DESC');

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: fromStorageUnits(row.amount, row.currency as Currency),
      currency: row.currency as Currency,
      categoryId: row.category_id,
      paymentMethodId: row.payment_method_id,
      previousCategoryId: row.previous_category_id || undefined,
      date: row.date,
      isVerified: Boolean(row.is_verified),
      verifiedAt: row.verified_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

// Get single expense by ID
export const getExpenseById = async (db: SQLiteDatabase, expenseId: string): Promise<Expense | null> => {
  try {
    const row = await db.getFirstAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      category_id: string;
      payment_method_id: string;
      previous_category_id: string | null;
      date: string;
      is_verified: number;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM expenses WHERE id = ?', [expenseId]);

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      amount: fromStorageUnits(row.amount, row.currency as Currency),
      currency: row.currency as Currency,
      categoryId: row.category_id,
      paymentMethodId: row.payment_method_id,
      previousCategoryId: row.previous_category_id || undefined,
      date: row.date,
      isVerified: Boolean(row.is_verified),
      verifiedAt: row.verified_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error getting expense by ID:', error);
    return null;
  }
};

// Create new expense
export const createExpense = async (
  db: SQLiteDatabase,
  title: string,
  description: string,
  amount: number,
  currency: Currency,
  categoryId: string,
  paymentMethodId: string,
  date: string
): Promise<Expense> => {
  try {
    const id = generateId();
    const storageAmount = toStorageUnits(amount, currency);
    const now = new Date().toISOString();

    console.log(`Creating expense: ${title}, ${amount} ${currency} -> ${storageAmount} storage units`);

    await db.runAsync(
      `INSERT INTO expenses (id, title, description, amount, currency, category_id, payment_method_id, date, is_verified, verified_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, storageAmount, currency, categoryId, paymentMethodId, date, 0, null, now, now]
    );

    return {
      id,
      title,
      description,
      amount,
      currency,
      categoryId,
      paymentMethodId,
      date,
      isVerified: false,
      verifiedAt: undefined,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

// Update existing expense
export const updateExpense = async (db: SQLiteDatabase, expense: Expense): Promise<void> => {
  try {
    const storageAmount = toStorageUnits(expense.amount, expense.currency);
    const now = new Date().toISOString();

    console.log(`Updating expense: ${expense.title}, ${expense.amount} ${expense.currency} -> ${storageAmount} storage units`);

    await db.runAsync(
      `UPDATE expenses SET title = ?, description = ?, amount = ?, currency = ?, category_id = ?, payment_method_id = ?, date = ?, is_verified = ?, verified_at = ?, updated_at = ?
       WHERE id = ?`,
      [expense.title, expense.description, storageAmount, expense.currency, expense.categoryId, expense.paymentMethodId, expense.date, expense.isVerified ? 1 : 0, expense.verifiedAt || null, now, expense.id]
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

// Verify expense
export const verifyExpense = async (db: SQLiteDatabase, expenseId: string): Promise<void> => {
  try {
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE expenses SET is_verified = 1, verified_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, expenseId]
    );

    console.log(`Expense ${expenseId} verified at ${now}`);
  } catch (error) {
    console.error('Error verifying expense:', error);
    throw error;
  }
};

// Unverify expense
export const unverifyExpense = async (db: SQLiteDatabase, expenseId: string): Promise<void> => {
  try {
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE expenses SET is_verified = 0, verified_at = NULL, updated_at = ? WHERE id = ?`,
      [now, expenseId]
    );

    console.log(`Expense ${expenseId} unverified`);
  } catch (error) {
    console.error('Error unverifying expense:', error);
    throw error;
  }
};

// Delete expense
export const deleteExpense = async (db: SQLiteDatabase, expenseId: string): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
    console.log(`Expense ${expenseId} deleted`);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Get expenses by category
export const getExpensesByCategory = async (db: SQLiteDatabase, categoryId: string): Promise<Expense[]> => {
  try {
    const rows = await db.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      category_id: string;
      payment_method_id: string;
      previous_category_id: string | null;
      date: string;
      is_verified: number;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM expenses WHERE category_id = ? ORDER BY date DESC', [categoryId]);

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: fromStorageUnits(row.amount, row.currency as Currency),
      currency: row.currency as Currency,
      categoryId: row.category_id,
      paymentMethodId: row.payment_method_id,
      previousCategoryId: row.previous_category_id || undefined,
      date: row.date,
      isVerified: Boolean(row.is_verified),
      verifiedAt: row.verified_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    return [];
  }
};

// Get expenses by payment method
export const getExpensesByPaymentMethod = async (db: SQLiteDatabase, paymentMethodId: string): Promise<Expense[]> => {
  try {
    const rows = await db.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      category_id: string;
      payment_method_id: string;
      previous_category_id: string | null;
      date: string;
      is_verified: number;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM expenses WHERE payment_method_id = ? ORDER BY date DESC', [paymentMethodId]);

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: fromStorageUnits(row.amount, row.currency as Currency),
      currency: row.currency as Currency,
      categoryId: row.category_id,
      paymentMethodId: row.payment_method_id,
      previousCategoryId: row.previous_category_id || undefined,
      date: row.date,
      isVerified: Boolean(row.is_verified),
      verifiedAt: row.verified_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error getting expenses by payment method:', error);
    return [];
  }
};

// Get current month expenses
export const getCurrentMonthExpenses = async (db: SQLiteDatabase): Promise<Expense[]> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const rows = await db.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      category_id: string;
      payment_method_id: string;
      previous_category_id: string | null;
      date: string;
      is_verified: number;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT * FROM expenses WHERE date(date) BETWEEN ? AND ? ORDER BY date DESC',
      [startOfMonth, endOfMonth]
    );

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: fromStorageUnits(row.amount, row.currency as Currency),
      currency: row.currency as Currency,
      categoryId: row.category_id,
      paymentMethodId: row.payment_method_id,
      previousCategoryId: row.previous_category_id || undefined,
      date: row.date,
      isVerified: Boolean(row.is_verified),
      verifiedAt: row.verified_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error getting current month expenses:', error);
    return [];
  }
};

// Get expenses by date range
export const getExpensesByDateRange = async (db: SQLiteDatabase, startDate: string, endDate: string): Promise<Expense[]> => {
  try {
    const rows = await db.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      category_id: string;
      payment_method_id: string;
      previous_category_id: string | null;
      date: string;
      is_verified: number;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT * FROM expenses WHERE date(date) BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: fromStorageUnits(row.amount, row.currency as Currency),
      currency: row.currency as Currency,
      categoryId: row.category_id,
      paymentMethodId: row.payment_method_id,
      previousCategoryId: row.previous_category_id || undefined,
      date: row.date,
      isVerified: Boolean(row.is_verified),
      verifiedAt: row.verified_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error getting expenses by date range:', error);
    return [];
  }
};

// Get total spent
export const getTotalSpent = async (db: SQLiteDatabase): Promise<number> => {
  try {
    const result = await db.getFirstAsync<{ total: number | null }>(
      'SELECT SUM(amount) as total FROM expenses'
    );
    return result?.total ?? 0;
  } catch (error) {
    console.error('Error getting total spent:', error);
    return 0;
  }
};

// Search expenses
export const searchExpenses = async (db: SQLiteDatabase, query: string): Promise<Expense[]> => {
  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    const rows = await db.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      category_id: string;
      payment_method_id: string;
      previous_category_id: string | null;
      date: string;
      is_verified: number;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT * FROM expenses WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? ORDER BY date DESC',
      [searchTerm, searchTerm]
    );

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: fromStorageUnits(row.amount, row.currency as Currency),
      currency: row.currency as Currency,
      categoryId: row.category_id,
      paymentMethodId: row.payment_method_id,
      previousCategoryId: row.previous_category_id || undefined,
      date: row.date,
      isVerified: Boolean(row.is_verified),
      verifiedAt: row.verified_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error searching expenses:', error);
    return [];
  }
};

// Check if expense exists
export const expenseExists = async (db: SQLiteDatabase, expenseId: string): Promise<boolean> => {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM expenses WHERE id = ?',
      [expenseId]
    );
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('Error checking expense existence:', error);
    return false;
  }
};

// Save expense (create or update)
export const saveExpense = async (db: SQLiteDatabase, expense: Expense): Promise<void> => {
  try {
    const exists = await expenseExists(db, expense.id);
    if (exists) {
      await updateExpense(db, expense);
    } else {
      // This is a bit tricky since createExpense expects individual parameters
      // For now, we'll use updateExpense approach
      const storageAmount = toStorageUnits(expense.amount, expense.currency);
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO expenses (id, title, description, amount, currency, category_id, payment_method_id, date, is_verified, verified_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [expense.id, expense.title, expense.description, storageAmount, expense.currency, expense.categoryId, expense.paymentMethodId, expense.date, expense.isVerified ? 1 : 0, expense.verifiedAt || null, expense.createdAt || now, now]
      );
    }
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
}; 