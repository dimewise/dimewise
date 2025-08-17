import { and, eq, isNull } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../drizzle';
import type { PaymentMethod } from '../schema';
import { paymentMethod } from '../schema';

export const createPaymentMethod = (
  paymentMethodData: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
) => {
  const id = Crypto.randomUUID();
  return db
    .insert(paymentMethod)
    .values({
      id,
      ...paymentMethodData,
    })
    .returning()
    .get();
};

export const updatePaymentMethod = (
  paymentMethodId: string,
  updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
) => {
  return db
    .update(paymentMethod)
    .set(updates)
    .where(and(eq(paymentMethod.id, paymentMethodId), isNull(paymentMethod.deletedAt)))
    .returning()
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
