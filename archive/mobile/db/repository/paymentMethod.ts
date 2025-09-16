import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import { paymentMethod } from '../schema';

export const getPaymentMethodsByUserId = (userId: string) => {
  return db
    .select()
    .from(paymentMethod)
    .where(and(eq(paymentMethod.userId, userId), isNull(paymentMethod.deletedAt)))
    .all();
};

export const getPaymentMethodById = (paymentMethodId: string) => {
  return db
    .select()
    .from(paymentMethod)
    .where(and(eq(paymentMethod.id, paymentMethodId), isNull(paymentMethod.deletedAt)))
    .get();
};

export const deletePaymentMethodById = (paymentMethodId: string) => {
  // Soft delete by setting deletedAt timestamp
  return db
    .update(paymentMethod)
    .set({
      deletedAt: new Date().toISOString(),
    })
    .where(and(eq(paymentMethod.id, paymentMethodId), isNull(paymentMethod.deletedAt)))
    .returning()
    .get();
};
