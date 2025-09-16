import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRefreshKey } from '../components/contexts/RefreshKeyContext';
import { useUser } from '../components/contexts/UserContext';
import { getExpensesInRangeByUserId } from '../db/repository/expense';
import { getPaymentMethodsByUserId } from '../db/repository/paymentMethod';
import type { PaymentMethodWithSpending } from '../db/types';
import { getMonthRangeByMonthYear } from '../utils/datetime';

export function usePaymentMethodsBreakdown(
  selectedMonth: number,
  selectedYear: number,
): {
  paymentMethods: PaymentMethodWithSpending[];
  loading: boolean;
  error: string | null;
} {
  const { t } = useTranslation();
  const { user } = useUser();
  const { refreshKeys } = useRefreshKey();

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKeys are intentionally used to trigger re-fetching
  const result = useMemo(() => {
    if (!user?.id) {
      return { paymentMethods: [], loading: false, error: null };
    }

    try {
      // Fetch payment methods (excluding deleted)
      const paymentMethods = getPaymentMethodsByUserId(user.id);

      // Fetch selected month's expenses (excluding deleted)
      const { from, to } = getMonthRangeByMonthYear(selectedMonth, selectedYear);
      const expenses = getExpensesInRangeByUserId(user.id, from, to);

      // Group expenses by paymentMethodId
      const paymentMethodTotals: Record<string, { spent: number; count: number }> = {};
      let uncategorizedTotal = 0;
      let uncategorizedCount = 0;

      expenses.forEach((exp) => {
        if (exp.paymentMethodId) {
          if (!paymentMethodTotals[exp.paymentMethodId]) {
            paymentMethodTotals[exp.paymentMethodId] = { spent: 0, count: 0 };
          }
          paymentMethodTotals[exp.paymentMethodId].spent += exp.amount;
          paymentMethodTotals[exp.paymentMethodId].count += 1;
        } else {
          uncategorizedTotal += exp.amount;
          uncategorizedCount += 1;
        }
      });

      // Shape the data
      const result: PaymentMethodWithSpending[] = paymentMethods.map((pm) => {
        const data = paymentMethodTotals[pm.id] || { spent: 0, count: 0 };
        return {
          id: pm.id,
          userId: pm.userId,
          name: pm.name,
          type: pm.type,
          deletedAt: pm.deletedAt,
          createdAt: pm.createdAt,
          updatedAt: pm.updatedAt,
          spent: data.spent,
          transactionCount: data.count,
        } as PaymentMethodWithSpending;
      });

      // Add "No Payment Method" if needed
      if (uncategorizedTotal > 0) {
        result.push({
          id: 'no-payment-method',
          userId: user.id,
          name: t('paymentMethods.noPaymentMethod'),
          type: 'other',
          deletedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          spent: uncategorizedTotal,
          transactionCount: uncategorizedCount,
        } as PaymentMethodWithSpending);
      }

      return { paymentMethods: result, loading: false, error: null };
    } catch (error) {
      console.error('Error fetching payment methods breakdown data:', error);
      return {
        paymentMethods: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load payment methods',
      };
    }
  }, [user?.id, t, selectedMonth, selectedYear, refreshKeys.expenses, refreshKeys.paymentMethods]);

  return result;
}
