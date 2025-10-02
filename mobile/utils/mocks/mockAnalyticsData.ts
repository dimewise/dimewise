// mocks/mockAnalyticsData.ts

import { DateTime } from 'luxon';
import type {
  CategoryBreakdown,
  ExpenseWithDetails,
  PaymentMethodBreakdown,
} from '@/generated/api/api';

/* ---------- helpers ---------- */
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
const randomCents = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const currency = 'USD' as const;

/* ---------- 1. CategoryBreakdown ---------- */
const CATEGORY_TITLES = [
  'Groceries',
  'Transport',
  'Dining',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Health',
  'Travel',
];

export const fakeCategoryBreakdown = (count = 6): CategoryBreakdown[] =>
  Array.from({ length: count }, () => {
    const budget = randomCents(20_000, 200_000);
    const spent = randomCents(5_000, budget);
    return {
      category_id: uid('cat'),
      category_title: CATEGORY_TITLES[Math.floor(Math.random() * CATEGORY_TITLES.length)],
      budget,
      spent,
      remaining: budget - spent,
      currency,
    };
  });

/* ---------- 2. PaymentMethodBreakdown ---------- */
const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'PayPal', 'Bank Transfer'];

export const fakePaymentMethodBreakdown = (count = 4): PaymentMethodBreakdown[] =>
  Array.from({ length: count }, () => ({
    payment_method_id: uid('pm'),
    payment_method_title: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
    total_spent: randomCents(5_000, 300_000),
    currency,
  }));

/* ---------- 3. ExpenseWithDetails ---------- */
const EXPENSE_TITLES = [
  'Coffee Shop',
  'Grocery Run',
  'Taxi Ride',
  'Netflix',
  'Electric Bill',
  'Dinner Date',
  'Amazon Purchase',
  'Pharmacy',
];

export const fakeRecentTransactions = (count = 10): ExpenseWithDetails[] =>
  Array.from({ length: count }, (_, i) => {
    const amount = randomCents(100, 25_000);
    const incurred = DateTime.now().minus({ days: i }).toISO();
    return {
      id: uid('exp'),
      user_id: uid('usr'),
      category_id: uid('cat'),
      payment_method_id: uid('pm'),
      title: EXPENSE_TITLES[Math.floor(Math.random() * EXPENSE_TITLES.length)],
      description: Math.random() > 0.5 ? 'Quick purchase' : null,
      amount,
      currency,
      incurred_at: incurred,
      verified_at: Math.random() > 0.3 ? DateTime.now().toISO() : null,
      created_at: incurred,
      updated_at: incurred,
      deleted_at: null,
      category: {
        id: uid('cat'),
        user_id: uid('usr'),
        title: CATEGORY_TITLES[Math.floor(Math.random() * CATEGORY_TITLES.length)],
        amount: randomCents(50_000, 200_000),
        currency,
        created_at: incurred,
        updated_at: incurred,
        deleted_at: null,
      },
      payment_method: {
        id: uid('pm'),
        user_id: uid('usr'),
        title: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
        method_type: 'credit_card',
        created_at: incurred,
        updated_at: incurred,
        deleted_at: null,
      },
    };
  });
