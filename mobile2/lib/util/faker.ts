import type { CategoryFull, Expense } from "@/store/api/rtk/server/v1";
import type { AgendaExpense } from "./expense";

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
  created_at: "2025-04-21T19:45:00Z",
};

export const FakerCategoryFull: CategoryFull = {
  budget: 500,
  id: "groceries-001",
  name: "Groceries",
  spent: 275,
};

export const FakerAgendaExpenses: AgendaExpense[] = [
  {
    title: "2025-04-20", // Date in ISO format (YYYY-MM-DD)
    data: [
      {
        amount: 50.0,
        category: { name: "Food", id: "1", budget: 5000 },
        created_at: "2025-04-22T08:30:00Z",
        date: "2025-04-22",
        description: "Breakfast at cafe",
        id: "exp1",
        title: "Breakfast",
      },
      {
        amount: 30.0,
        category: { name: "Transportation", id: "2", budget: 5000 },
        created_at: "2025-04-22T12:15:00Z",
        date: "2025-04-22",
        description: "Bus fare",
        id: "exp2",
        title: "Bus ride",
      },
    ],
  },
  {
    title: "2025-04-21", // Date in ISO format (YYYY-MM-DD)
    data: [
      {
        amount: 50.0,
        category: { name: "Food", id: "1", budget: 5000 },
        created_at: "2025-04-22T08:30:00Z",
        date: "2025-04-22",
        description: "Breakfast at cafe",
        id: "exp1",
        title: "Breakfast",
      },
      {
        amount: 30.0,
        category: { name: "Transportation", id: "2", budget: 5000 },
        created_at: "2025-04-22T12:15:00Z",
        date: "2025-04-22",
        description: "Bus fare",
        id: "exp2",
        title: "Bus ride",
      },
    ],
  },
  {
    title: "2025-04-22", // Date in ISO format (YYYY-MM-DD)
    data: [
      {
        amount: 50.0,
        category: { name: "Food", id: "1", budget: 5000 },
        created_at: "2025-04-22T08:30:00Z",
        date: "2025-04-22",
        description: "Breakfast at cafe",
        id: "exp1",
        title: "Breakfast",
      },
      {
        amount: 30.0,
        category: { name: "Transportation", id: "2", budget: 5000 },
        created_at: "2025-04-22T12:15:00Z",
        date: "2025-04-22",
        description: "Bus fare",
        id: "exp2",
        title: "Bus ride",
      },
    ],
  },
  {
    title: "2025-04-23", // Date in ISO format (YYYY-MM-DD)
    data: [
      {
        amount: 120.0,
        category: { name: "Entertainment", id: "3", budget: 5000 },
        created_at: "2025-04-23T19:45:00Z",
        date: "2025-04-23",
        description: "Movie ticket",
        id: "exp3",
        title: "Movie night",
      },
      {
        amount: 25.0,
        category: { name: "Food", id: "1", budget: 5000 },
        created_at: "2025-04-23T14:00:00Z",
        date: "2025-04-23",
        description: "Lunch with friends",
        id: "exp4",
        title: "Lunch",
      },
      {
        amount: 45.0,
        category: { name: "Transportation", id: "2", budget: 5000 },
        created_at: "2025-04-23T07:30:00Z",
        date: "2025-04-23",
        description: "Taxi ride",
        id: "exp5",
        title: "Taxi",
      },
    ],
  },
  {
    title: "2025-04-24", // Date in ISO format (YYYY-MM-DD)
    data: [
      {
        amount: 60.0,
        category: { name: "Food", id: "1", budget: 5000 },
        created_at: "2025-04-24T08:00:00Z",
        date: "2025-04-24",
        description: "Breakfast at diner",
        id: "exp6",
        title: "Breakfast",
      },
      {
        amount: 10.0,
        category: { name: "Miscellaneous", id: "4", budget: 5000 },
        created_at: "2025-04-24T13:30:00Z",
        date: "2025-04-24",
        description: "Parking",
        id: "exp7",
        title: "Parking fee",
      },
    ],
  },
  {
    title: "2025-04-29", // Date in ISO format (YYYY-MM-DD)
    data: [
      {
        amount: 60.0,
        category: { name: "Food", id: "1", budget: 5000 },
        created_at: "2025-04-24T08:00:00Z",
        date: "2025-04-24",
        description: "Breakfast at diner",
        id: "exp6",
        title: "Breakfast",
      },
      {
        amount: 10.0,
        category: { name: "Miscellaneous", id: "4", budget: 5000 },
        created_at: "2025-04-24T13:30:00Z",
        date: "2025-04-24",
        description: "Parking",
        id: "exp7",
        title: "Parking fee",
      },
    ],
  },
];
