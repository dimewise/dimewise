import type { Expense } from "@/store/api/rtk/server/v1";
import { DateTime } from "luxon";

export const bucketAndSortExpenses = (locale: string, expenses: Expense[]) => {
  // bucket by date
  const buckets: Record<string, Expense[]> = expenses.reduce(
    (acc, expense) => {
      const dateKey = DateTime.fromISO(expense.date)
        .setLocale(locale)
        .toLocaleString(DateTime.DATE_FULL);
      if (dateKey) {
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(expense);
      }
      return acc;
    },
    {} as Record<string, Expense[]>,
  );

  // sort by created at
  for (const date in buckets) {
    buckets[date].sort((a, b) => {
      return (
        DateTime.fromISO(a.created_at).toMillis() -
        DateTime.fromISO(b.created_at).toMillis()
      );
    });
  }

  return buckets;
};
