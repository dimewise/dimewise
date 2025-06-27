import { and, eq, isNull } from "drizzle-orm";
import { db } from "../drizzle";
import { category } from "../schema";

export const getCategoriesByUserId = (userId: string) => {
	return db
		.select()
		.from(category)
		.where(and(eq(category.userId, userId), isNull(category.deletedAt)))
		.all();
};

export const getCategoriesBudgetSumByUserId = (userId: string) => {
	const categories = getCategoriesByUserId(userId);
	return categories.reduce((sum, cat) => sum + (cat.budget ?? 0), 0);
};
