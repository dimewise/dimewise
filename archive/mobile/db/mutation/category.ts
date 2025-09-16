import { and, eq, isNull } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../drizzle';
import type { Category } from '../schema';
import { category } from '../schema';

export const createCategory = (
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
) => {
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

export const updateCategory = (
  categoryId: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
) => {
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
