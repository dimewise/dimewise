import type { Expense } from "@/store/api/rtk/server/v1";

export const FakerExpense: Expense = {
  id: "exp_001",
  title: "Dinner at Thai Place",
  amount: 45000,
  category: {
    id: "cat_dining",
    name: "Dining Out",
    budget: 200,
  },
  date: "2025-04-21T19:45:00Z",
  description: "Dinner with friends, included drinks and dessert.",
};
