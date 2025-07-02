import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategoriesByUserId } from '../db/repository/category';
import { getExpensesInRangeByUserId } from '../db/repository/expense';
import type { CategoryWithSpending } from '../db/repository/types';
import { getMonthRange } from '../utils/datetime';
import { useRefreshKey } from '../components/contexts/RefreshKeyContext';
import { useUser } from '../components/contexts/UserContext';

export function useCategoriesBreakdown(): {
  categories: CategoryWithSpending[];
  loading: boolean;
  error: string | null;
} {
  const { t } = useTranslation();
  const { user } = useUser();
  const { refreshKeys } = useRefreshKey();

  const result = useMemo(() => {
    if (!user?.id) {
      return { categories: [], loading: false, error: null };
    }

    try {
      // Fetch categories (excluding deleted)
      const categories = getCategoriesByUserId(user.id);

      // Fetch this month's expenses (excluding deleted)
      const { from, to } = getMonthRange(new Date());
      const expenses = getExpensesInRangeByUserId(user.id, from, to);

      // Group expenses by categoryId
      const categoryTotals: Record<string, number> = {};
      let uncategorizedTotal = 0;

      expenses.forEach((exp) => {
        if (exp.categoryId) {
          categoryTotals[exp.categoryId] = (categoryTotals[exp.categoryId] || 0) + exp.amount;
        } else {
          uncategorizedTotal += exp.amount;
        }
      });

      // Shape the data
      const result: CategoryWithSpending[] = categories.map((cat) => {
        const spent = categoryTotals[cat.id] || 0;
        const percentage = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
        return {
          id: cat.id,
          name: cat.name,
          budget: cat.budget,
          spent,
          percentage,
        } as CategoryWithSpending;
      });

      // Add "Uncategorized" if needed
      if (uncategorizedTotal > 0) {
        result.push({
          id: "uncategorized",
          name: t("common.unknown"),
          budget: 0,
          spent: uncategorizedTotal,
          percentage: 0,
        } as CategoryWithSpending);
      }

      return { categories: result, loading: false, error: null };
    } catch (error) {
      console.error('Error fetching categories breakdown data:', error);
      return {
        categories: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load categories'
      };
    }
  }, [user?.id, refreshKeys.categories, refreshKeys.expenses, t]);

  return result;
} 