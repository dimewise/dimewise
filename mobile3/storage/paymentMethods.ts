import { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from './database';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'digital_wallet' | 'other';
}

// Get all payment methods
export const getPaymentMethods = async (db: SQLiteDatabase): Promise<PaymentMethod[]> => {
  try {
    const rows = await db.getAllAsync<PaymentMethod>('SELECT * FROM payment_methods ORDER BY name');
    return rows;
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
};

// Get single payment method by ID
export const getPaymentMethodById = async (db: SQLiteDatabase, paymentMethodId: string): Promise<PaymentMethod | null> => {
  try {
    const row = await db.getFirstAsync<PaymentMethod>(
      'SELECT * FROM payment_methods WHERE id = ?',
      [paymentMethodId]
    );
    return row || null;
  } catch (error) {
    console.error('Error getting payment method by ID:', error);
    return null;
  }
};

// Create new payment method
export const createPaymentMethod = async (db: SQLiteDatabase, name: string, type: PaymentMethod['type']): Promise<PaymentMethod> => {
  try {
    const id = generateId();

    await db.runAsync(
      'INSERT INTO payment_methods (id, name, type) VALUES (?, ?, ?)',
      [id, name, type]
    );

    return {
      id,
      name,
      type
    };
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

// Update existing payment method
export const updatePaymentMethod = async (db: SQLiteDatabase, paymentMethod: PaymentMethod): Promise<void> => {
  try {
    await db.runAsync(
      'UPDATE payment_methods SET name = ?, type = ? WHERE id = ?',
      [paymentMethod.name, paymentMethod.type, paymentMethod.id]
    );
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Delete payment method
export const deletePaymentMethod = async (db: SQLiteDatabase, paymentMethodId: string): Promise<void> => {
  try {
    // Check if payment method is being used by any expenses
    const expenseCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM expenses WHERE payment_method_id = ?',
      [paymentMethodId]
    );

    if (expenseCount && expenseCount.count > 0) {
      throw new Error(`Cannot delete payment method. It is being used by ${expenseCount.count} expense(s). Please reassign those expenses first.`);
    }

    await db.runAsync('DELETE FROM payment_methods WHERE id = ?', [paymentMethodId]);
    console.log(`Payment method ${paymentMethodId} deleted`);
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

// Check if payment method exists
export const paymentMethodExists = async (db: SQLiteDatabase, paymentMethodId: string): Promise<boolean> => {
  try {
    const paymentMethod = await getPaymentMethodById(db, paymentMethodId);
    return paymentMethod !== null;
  } catch (error) {
    console.error('Error checking if payment method exists:', error);
    return false;
  }
};

// Get payment method usage statistics
export const getPaymentMethodUsage = async (db: SQLiteDatabase, paymentMethodId: string): Promise<{
  totalExpenses: number;
  totalAmount: number;
  lastUsed: string | null;
}> => {
  try {
    const stats = await db.getFirstAsync<{
      count: number;
      total_amount: number;
      last_used: string | null;
    }>(
      `SELECT 
         COUNT(*) as count,
         SUM(amount) as total_amount,
         MAX(date) as last_used
       FROM expenses 
       WHERE payment_method_id = ?`,
      [paymentMethodId]
    );

    return {
      totalExpenses: stats?.count || 0,
      totalAmount: stats?.total_amount || 0,
      lastUsed: stats?.last_used || null
    };
  } catch (error) {
    console.error('Error getting payment method usage:', error);
    return {
      totalExpenses: 0,
      totalAmount: 0,
      lastUsed: null
    };
  }
};

// Get payment methods with usage information
export const getPaymentMethodsWithUsage = async (db: SQLiteDatabase): Promise<(PaymentMethod & {
  totalExpenses: number;
  totalAmount: number;
  lastUsed: string | null;
})[]> => {
  try {
    const paymentMethods = await getPaymentMethods(db);
    const paymentMethodsWithUsage: (PaymentMethod & {
      totalExpenses: number;
      totalAmount: number;
      lastUsed: string | null;
    })[] = [];

    for (const paymentMethod of paymentMethods) {
      const usage = await getPaymentMethodUsage(db, paymentMethod.id);
      paymentMethodsWithUsage.push({
        ...paymentMethod,
        ...usage
      });
    }

    return paymentMethodsWithUsage;
  } catch (error) {
    console.error('Error getting payment methods with usage:', error);
    return [];
  }
};

// Ensure default cash payment method exists (for system integrity)
export const ensureDefaultPaymentMethod = async (db: SQLiteDatabase): Promise<void> => {
  try {
    const exists = await paymentMethodExists(db, 'default-cash');
    if (!exists) {
      await db.runAsync(
        'INSERT INTO payment_methods (id, name, type) VALUES (?, ?, ?)',
        ['default-cash', 'Cash', 'cash']
      );
      console.log('Recreated default cash payment method');
    }
  } catch (error) {
    console.error('Error ensuring default payment method exists:', error);
  }
}; 