import { eq } from 'drizzle-orm';
import { db } from '../drizzle';
import { type Expense, expense, type NewExpense } from '../schema';

export const verifyExpenseById = async (expenseId: string) => {
  return db
    .update(expense)
    .set({ verifiedAt: new Date().toISOString() })
    .where(eq(expense.id, expenseId))
    .run();
};

export const unverifyExpenseById = async (expenseId: string) => {
  return db.update(expense).set({ verifiedAt: null }).where(eq(expense.id, expenseId)).run();
};

export const softDeleteExpenseById = (expenseId: string) => {
  return db
    .update(expense)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(expense.id, expenseId))
    .run();
};

export const createExpense = async (newExpense: NewExpense) => {
  return db.insert(expense).values(newExpense).run();
};

export const updateExpenseById = async (updatedExpense: Expense) => {
  return db
    .update(expense)
    .set({
      title: updatedExpense.title,
      description: updatedExpense.description,
      amount: updatedExpense.amount,
      categoryId: updatedExpense.categoryId,
      paymentMethodId: updatedExpense.paymentMethodId,
      incurredAt: updatedExpense.incurredAt,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(expense.id, updatedExpense.id))
    .run();
};
