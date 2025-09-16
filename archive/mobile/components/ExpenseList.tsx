import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { getCategoriesByUserId } from '../db/repository/category';
import { getPaymentMethodsByUserId } from '../db/repository/paymentMethod';
import type { Category, Expense, PaymentMethod } from '../db/schema';
import { useRefreshKey } from './contexts/RefreshKeyContext';
import { useUser } from './contexts/UserContext';
import ExpenseListItem from './ExpenseListItem';

interface Props {
  expenses: Expense[];
  hideDescription?: boolean;
  onPress: (expense: Expense) => void;
}

const ExpenseList: React.FC<Props> = ({ expenses, hideDescription = false, onPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useUser();
  const { refreshKeys } = useRefreshKey();

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKeys are intentionally used to trigger re-fetching
  useEffect(() => {
    if (!user?.id) return;

    try {
      // Fetch categories and payment methods for the user using repository functions
      const cats = getCategoriesByUserId(user.id);
      const pms = getPaymentMethodsByUserId(user.id);

      setCategories(cats);
      setPaymentMethods(pms);
    } catch (error) {
      console.error('Error fetching categories and payment methods:', error);
      setCategories([]);
      setPaymentMethods([]);
    }
  }, [user?.id, refreshKeys.categories, refreshKeys.paymentMethods]);

  if (expenses.length === 0) {
    return (
      <View
        style={{
          padding: 48,
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <Text
          variant="titleLarge"
          style={{
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}
        >
          {t('expenses.noExpenses')}
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
            lineHeight: 24,
          }}
        >
          {t('expenses.startTracking')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: 16 }}>
      {expenses.map((expense) => {
        const categoryObj = categories.find((c) => c.id === expense.categoryId);
        const paymentMethodObj = paymentMethods.find((p) => p.id === expense.paymentMethodId);
        return (
          <ExpenseListItem
            key={expense.id}
            expense={expense}
            category={categoryObj}
            paymentMethod={paymentMethodObj}
            hideDescription={hideDescription}
            onPress={() => onPress(expense)}
          />
        );
      })}
    </View>
  );
};

export { ExpenseList };
export default ExpenseList;
