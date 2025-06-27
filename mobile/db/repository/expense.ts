import {
	and,
	desc,
	eq,
	getTableColumns,
	gte,
	isNull,
	lte,
	sql,
} from "drizzle-orm";
import { db } from "../drizzle";
import { category, Expense, expense, paymentMethod } from "../schema";
import type { ExpenseFull } from "./types";

export const getMonthlyExpenseSumByUserId = (
	userId: string,
	from: string,
	to: string,
) => {
	const result = db
		.select({ sum: sql<number>`SUM(${expense.amount})` })
		.from(expense)
		.where(
			and(
				eq(expense.userId, userId),
				isNull(expense.deletedAt),
				gte(expense.incurredAt, from),
				lte(expense.incurredAt, to),
			),
		)
		.get();
	return result?.sum ?? 0;
};

export const getExpensesInRangeByUserId = (
	userId: string,
	from: string,
	to: string,
	limit?: number,
) => {
	let query = db
		.select()
		.from(expense)
		.where(
			and(
				eq(expense.userId, userId),
				isNull(expense.deletedAt),
				gte(expense.incurredAt, from),
				lte(expense.incurredAt, to),
			),
		)
		.orderBy(desc(expense.incurredAt))
		.$dynamic();

	if (typeof limit === "number") {
		query = query.limit(limit);
	}

	return query.all();
};

export const getExpenseFullById = (expenseId: string): ExpenseFull | null => {
	const result = db
		.select({
			...getTableColumns(expense),
			category: {
				id: category.id,
				name: category.name,
			},
			paymentMethod: {
				id: paymentMethod.id,
				name: paymentMethod.name,
			},
		})
		.from(expense)
		.leftJoin(category, eq(expense.categoryId, category.id))
		.leftJoin(paymentMethod, eq(expense.paymentMethodId, paymentMethod.id))
		.where(eq(expense.id, expenseId))
		.get();

	if (!result) return null;

	return result as ExpenseFull;
};
