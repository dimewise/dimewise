import { and, desc, eq, getTableColumns, gte, isNull, lte, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import { category, expense, paymentMethod } from '../schema';
import type { ExpenseFull, ExpenseWithDetails } from '../types';

export const getMonthlyExpenseSumByUserId = (userId: string, from: string, to: string) => {
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

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  return query.all() as ExpenseWithDetails[];
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

// Get all expenses for a user (with optional search and category filter)
export const getExpensesByUserId = (userId: string, searchQuery?: string, categoryId?: string) => {
  const whereConditions = [eq(expense.userId, userId), isNull(expense.deletedAt)];

  // Add search condition if provided
  if (searchQuery) {
    whereConditions.push(
      sql`(LOWER(${expense.title}) LIKE LOWER(${`%${searchQuery}%`}) OR LOWER(${expense.description}) LIKE LOWER(${`%${searchQuery}%`}))`,
    );
  }

  // Add category filter if provided
  if (categoryId) {
    whereConditions.push(eq(expense.categoryId, categoryId));
  }

  return db
    .select()
    .from(expense)
    .where(and(...whereConditions))
    .orderBy(desc(expense.incurredAt))
    .all();
};

// Get recent expenses for a user (limited)
export const getRecentExpensesByUserId = (userId: string, limit: number = 10) => {
  return db
    .select()
    .from(expense)
    .where(and(eq(expense.userId, userId), isNull(expense.deletedAt)))
    .orderBy(desc(expense.incurredAt))
    .limit(limit)
    .all();
};

// Add this optimized function for fetching expenses with related data in one query
export const getExpensesWithDetailsInRange = (
  userId: string,
  from: string,
  to: string,
  limit?: number,
) => {
  let query = db
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

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  return query.all();
};

// Optimized function to get expenses with all related data
export const getExpensesWithDetailsByUserId = (
  userId: string,
  limit?: number,
): ExpenseWithDetails[] => {
  let query = db
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
    .where(and(eq(expense.userId, userId), isNull(expense.deletedAt)))
    .orderBy(desc(expense.incurredAt))
    .$dynamic();

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  return query.all();
};

// New optimized function for filtered expense queries
export const getExpensesWithDetailsByUserIdWithFilters = (
  userId: string,
  filters: {
    dateRange?: { from: string; to: string };
    verificationStatus?: 'verified' | 'unverified' | 'all';
    categoryId?: string;
    searchQuery?: string;
  },
  limit?: number,
): ExpenseWithDetails[] => {
  const whereConditions = [eq(expense.userId, userId), isNull(expense.deletedAt)];

  // Add date range filter
  if (filters.dateRange) {
    whereConditions.push(
      gte(expense.incurredAt, filters.dateRange.from),
      lte(expense.incurredAt, filters.dateRange.to),
    );
  }

  // Add verification status filter
  if (filters.verificationStatus && filters.verificationStatus !== 'all') {
    if (filters.verificationStatus === 'verified') {
      whereConditions.push(sql`${expense.verifiedAt} IS NOT NULL`);
    } else {
      whereConditions.push(sql`${expense.verifiedAt} IS NULL`);
    }
  }

  // Add category filter
  if (filters.categoryId) {
    whereConditions.push(eq(expense.categoryId, filters.categoryId));
  }

  // Add search condition
  if (filters.searchQuery) {
    whereConditions.push(
      sql`(LOWER(${expense.title}) LIKE LOWER(${`%${filters.searchQuery}%`}) OR LOWER(${expense.description}) LIKE LOWER(${`%${filters.searchQuery}%`}))`,
    );
  }

  let query = db
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
    .where(and(...whereConditions))
    .orderBy(desc(expense.incurredAt))
    .$dynamic();

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  return query.all();
};
