import { and, eq, isNull } from "drizzle-orm";
import { db } from "../drizzle";
import { paymentMethod } from "../schema";

export const getPaymentMethodsByUserId = (userId: string) => {
	return db
		.select()
		.from(paymentMethod)
		.where(
			and(eq(paymentMethod.userId, userId), isNull(paymentMethod.deletedAt)),
		)
		.all();
};
