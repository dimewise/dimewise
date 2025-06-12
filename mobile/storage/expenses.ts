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
      `INSERT INTO expenses (id, title, description, amount, currency, category_id, payment_method_id, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, storageAmount, currency, categoryId, paymentMethodId, date, now, now]
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
      `UPDATE expenses SET title = ?, description = ?, amount = ?, currency = ?, category_id = ?, payment_method_id = ?, date = ?, updated_at = ?
       WHERE id = ?`,
      [expense.title, expense.description, storageAmount, expense.currency, expense.categoryId, expense.paymentMethodId, expense.date, now, expense.id]
    );
  } catch (error) {
    console.error('Error updating expense:', error);
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
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

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
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC', [startOfMonth, endOfMonth]);

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
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC', [startDate, endDate]);

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
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error getting expenses by date range:', error);
    return [];
  }
};

// Get total spent (current month)
export const getTotalSpent = async (db: SQLiteDatabase): Promise<number> => {
  try {
    const expenses = await getCurrentMonthExpenses(db);

    // TODO: Convert to display currency using exchange rates
    // For now, we'll sum amounts in their original currencies
    let total = 0;
    for (const expense of expenses) {
      total += expense.amount; // This is simplified - should use exchange rates
    }

    return total;
  } catch (error) {
    console.error('Error getting total spent:', error);
    return 0;
  }
};

// Search expenses by title or description
export const searchExpenses = async (db: SQLiteDatabase, query: string): Promise<Expense[]> => {
  try {
    const searchTerm = `%${query}%`;
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
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM expenses WHERE title LIKE ? OR description LIKE ? ORDER BY date DESC', [searchTerm, searchTerm]);

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
    const expense = await getExpenseById(db, expenseId);
    return expense !== null;
  } catch (error) {
    console.error('Error checking if expense exists:', error);
    return false;
  }
};

// Legacy compatibility function
export const saveExpense = async (db: SQLiteDatabase, expense: Expense): Promise<void> => {
  const exists = await expenseExists(db, expense.id);
  if (exists) {
    await updateExpense(db, expense);
  } else {
    await createExpense(
      db,
      expense.title,
      expense.description,
      expense.amount,
      expense.currency,
      expense.categoryId,
      expense.paymentMethodId,
      expense.date
    );
  }
}; 