import type { Category, Expense, PaymentMethod } from '../schema';

export interface CategoryWithSpending extends Category {
  spent: number;
  percentage: number;
}

export interface ExpenseFull extends Expense {
  category: Pick<Category, 'id' | 'name'> | null;
  paymentMethod: Pick<PaymentMethod, 'id' | 'name'> | null;
}

export interface ExpenseWithDetails extends Expense {
  category: Pick<Category, 'id' | 'name'> | null;
  paymentMethod: Pick<PaymentMethod, 'id' | 'name'> | null;
}
