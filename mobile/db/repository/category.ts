import { and, eq, isNull } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { db } from "../drizzle";
import { category } from "../schema";
import type { Category } from "../schema";

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

export const getCategoryById = (categoryId: string) => {
	return db
		.select()
		.from(category)
		.where(and(eq(category.id, categoryId), isNull(category.deletedAt)))
		.get();
};

export const createCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
	const id = Crypto.randomUUID();
	return db
		.insert(category)
		.values({
			id,
			...categoryData,
		})
		.returning()
		.get();
};

export const updateCategory = (categoryId: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) => {
	return db
		.update(category)
		.set(updates)
		.where(and(eq(category.id, categoryId), isNull(category.deletedAt)))
		.returning()
		.get();
};

export const deleteCategoryById = (categoryId: string) => {
	// Soft delete by setting deletedAt timestamp
	return db
		.update(category)
		.set({
			deletedAt: new Date().toISOString(),
		})
		.where(and(eq(category.id, categoryId), isNull(category.deletedAt)))
		.returning()
		.get();
};
