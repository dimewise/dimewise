import { SQLiteDatabase } from 'expo-sqlite';
import { generateId, SYSTEM_CATEGORIES, Currency } from './database';
import { toStorageUnits, fromStorageUnits } from './utils';

export interface Category {
  id: string;
  name: string;
  budget: number; // Always in display units (e.g., 1000 JPY, 10.50 USD)
  currency: Currency;
}

export interface CategoryWithSpending extends Category {
  spent: number;
  percentage: number;
}

// Get all categories
export const getCategories = async (db: SQLiteDatabase): Promise<Category[]> => {
  try {
    const rows = await db.getAllAsync<{
      id: string;
      name: string;
      budget: number;
      currency: string;
    }>('SELECT * FROM categories ORDER BY name');

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

// Get categories excluding system categories (for user selection)
export const getUserCategories = async (db: SQLiteDatabase): Promise<Category[]> => {
  try {
    const rows = await db.getAllAsync<{
      id: string;
      name: string;
      budget: number;
      currency: string;
    }>('SELECT * FROM categories WHERE id != ? ORDER BY name', [
      SYSTEM_CATEGORIES.UNCATEGORIZED
    ]);

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      budget: fromStorageUnits(row.budget, row.currency as Currency),
      currency: row.currency as Currency
    }));
  } catch (error) {
    console.error('Error getting user categories:', error);
    return [];
  }
};

// Get single category by ID
export const getCategoryById = async (db: SQLiteDatabase, categoryId: string): Promise<Category | null> => {
  try {
    const row = await db.getFirstAsync<{
      id: string;
      name: string;
      budget: number;
      currency: string;
    }>('SELECT * FROM categories WHERE id = ?', [categoryId]);

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      budget: fromStorageUnits(row.budget, row.currency as Currency),
      currency: row.currency as Currency
    };
  } catch (error) {
    console.error('Error getting category by ID:', error);
    return null;
  }
};

// Create new category
export const createCategory = async (db: SQLiteDatabase, name: string, budget: number, currency: Currency): Promise<Category> => {
  try {
    const id = generateId();
    const storageAmount = toStorageUnits(budget, currency);

    console.log(`Creating category: ${name}, ${budget} ${currency} -> ${storageAmount} storage units`);

    await db.runAsync(
      'INSERT INTO categories (id, name, budget, currency) VALUES (?, ?, ?, ?)',
      [id, name, storageAmount, currency]
    );

    return {
      id,
      name,
      budget,
      currency
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update existing category
export const updateCategory = async (db: SQLiteDatabase, category: Category): Promise<void> => {
  try {
    // Don't allow updating system categories
    if (category.id === SYSTEM_CATEGORIES.UNCATEGORIZED) {
      throw new Error('Cannot update system categories');
    }

    const storageAmount = toStorageUnits(category.budget, category.currency);

    console.log(`Updating category: ${category.name}, ${category.budget} ${category.currency} -> ${storageAmount} storage units`);

    await db.runAsync(
      'UPDATE categories SET name = ?, budget = ?, currency = ? WHERE id = ?',
      [category.name, storageAmount, category.currency, category.id]
    );
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Update category budget only
export const updateCategoryBudget = async (db: SQLiteDatabase, categoryId: string, newBudget: number, currency: Currency): Promise<void> => {
  try {
    // Don't allow updating system categories
    if (categoryId === SYSTEM_CATEGORIES.UNCATEGORIZED) {
      throw new Error('Cannot update system categories');
    }

    const storageAmount = toStorageUnits(newBudget, currency);

    await db.runAsync(
      'UPDATE categories SET budget = ?, currency = ? WHERE id = ?',
      [storageAmount, currency, categoryId]
    );
  } catch (error) {
    console.error('Error updating category budget:', error);
    throw error;
  }
};

// Delete category (reassign expenses to uncategorized)
export const deleteCategory = async (db: SQLiteDatabase, categoryId: string): Promise<void> => {
  try {
    // Don't allow deletion of system categories
    if (categoryId === SYSTEM_CATEGORIES.UNCATEGORIZED) {
      throw new Error('Cannot delete system categories');
    }

    await db.withTransactionAsync(async () => {
      // First, reassign all expenses from this category to uncategorized
      // Also store the previous category for audit trail
      await db.runAsync(
        'UPDATE expenses SET category_id = ?, previous_category_id = ? WHERE category_id = ?',
        [SYSTEM_CATEGORIES.UNCATEGORIZED, categoryId, categoryId]
      );

      // Then delete the category
      await db.runAsync('DELETE FROM categories WHERE id = ?', [categoryId]);
    });

    console.log(`Category ${categoryId} deleted and expenses reassigned to uncategorized`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Get category spending for current month
export const getCategorySpending = async (db: SQLiteDatabase, categoryId: string): Promise<number> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  try {
    const rows = await db.getAllAsync<{ amount: number; currency: string }>(
      'SELECT amount, currency FROM expenses WHERE category_id = ? AND date >= ? AND date <= ?',
      [categoryId, startOfMonth, endOfMonth]
    );

    // TODO: Convert to display currency using exchange rates
    // For now, we'll sum amounts in their original currencies
    let total = 0;
    for (const row of rows) {
      const amount = fromStorageUnits(row.amount, row.currency as Currency);
      total += amount; // This is simplified - should use exchange rates
    }

    return total;
  } catch (error) {
    console.error('Error getting category spending:', error);
    return 0;
  }
};

// Get categories with spending information
export const getCategoriesWithSpending = async (db: SQLiteDatabase): Promise<CategoryWithSpending[]> => {
  try {
    const categories = await getCategories(db);
    const categoriesWithSpending: CategoryWithSpending[] = [];

    for (const category of categories) {
      const spent = await getCategorySpending(db, category.id);
      const percentage = category.budget > 0 ? (spent / category.budget) * 100 : 0;

      categoriesWithSpending.push({
        ...category,
        spent,
        percentage: Math.min(percentage, 100) // Cap at 100%
      });
    }

    return categoriesWithSpending;
  } catch (error) {
    console.error('Error getting categories with spending:', error);
    return [];
  }
};

// Get total budget across all categories
export const getTotalBudget = async (db: SQLiteDatabase): Promise<number> => {
  try {
    const categories = await getCategories(db);

    // TODO: Convert to display currency using exchange rates
    // For now, we'll sum budgets in their original currencies
    let total = 0;
    for (const category of categories) {
      total += category.budget; // This is simplified - should use exchange rates
    }

    return total;
  } catch (error) {
    console.error('Error getting total budget:', error);
    return 0;
  }
};

// Check if category exists
export const categoryExists = async (db: SQLiteDatabase, categoryId: string): Promise<boolean> => {
  try {
    const category = await getCategoryById(db, categoryId);
    return category !== null;
  } catch (error) {
    console.error('Error checking if category exists:', error);
    return false;
  }
};

// Ensure uncategorized category exists (for system integrity)
export const ensureUncategorizedCategory = async (db: SQLiteDatabase): Promise<void> => {
  try {
    const exists = await categoryExists(db, SYSTEM_CATEGORIES.UNCATEGORIZED);
    if (!exists) {
      await db.runAsync(
        'INSERT INTO categories (id, name, budget, currency) VALUES (?, ?, ?, ?)',
        [SYSTEM_CATEGORIES.UNCATEGORIZED, 'Uncategorized', 0, 'USD']
      );
      console.log('Recreated uncategorized category');
    }
  } catch (error) {
    console.error('Error ensuring uncategorized category exists:', error);
  }
}; 