import type { Expense } from "@/store/api/rtk/server/v1";
import { DateTime } from "luxon";
import type { MarkedDates } from "react-native-calendars/src/types";

export type AgendaExpense = {
  title: string;
  data: Expense[];
};

export const getAgendaItemsFromTransactions = (expenses: Expense[]) => {
  const buckets: Record<string, Expense[]> = expenses.reduce(
    (acc, expense) => {
      if (!acc[expense.date]) {
        acc[expense.date] = [];
      }
      acc[expense.date].push(expense);
      return acc;
    },
    {} as Record<string, Expense[]>,
  );

  const agendaItems = Object.entries(buckets)
    .map(([date, expenseList]) => ({
      title: date, // The title will be in ISO format (YYYY-MM-DD)
      data: expenseList.sort(
        (a, b) =>
          DateTime.fromISO(a.created_at).toMillis() -
          DateTime.fromISO(b.created_at).toMillis(),
      ),
    }))
    .sort(
      (a, b) =>
        DateTime.fromISO(a.title).toMillis() -
        DateTime.fromISO(b.title).toMillis(),
    );

  return agendaItems;
};

// refer to package example
// https://github.com/wix/react-native-calendars/blob/master/example/src/mocks/agendaItems.ts#L120
export const getMarkedDatesFromAgendaItems = (items: AgendaExpense[]) => {
  const marked: MarkedDates = {};

  items.forEach((item) => {
    if (item.data && item.data.length > 0) {
      marked[item.title] = { marked: true };
    } else {
      marked[item.title] = { disabled: true };
    }
  });
  return marked;
};
