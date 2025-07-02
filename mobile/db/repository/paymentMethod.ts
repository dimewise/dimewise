import { and, eq, isNull } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { db } from "../drizzle";
import { paymentMethod } from "../schema";
import type { PaymentMethod } from "../schema";

export const getPaymentMethodsByUserId = (userId: string) => {
	return db
		.select()
		.from(paymentMethod)
		.where(
			and(eq(paymentMethod.userId, userId), isNull(paymentMethod.deletedAt)),
		)
		.all();
};

export const getPaymentMethodById = (paymentMethodId: string) => {
	return db
		.select()
		.from(paymentMethod)
		.where(and(eq(paymentMethod.id, paymentMethodId), isNull(paymentMethod.deletedAt)))
		.get();
};

export const createPaymentMethod = (paymentMethodData: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
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

export const updatePaymentMethod = (paymentMethodId: string, updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) => {
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
