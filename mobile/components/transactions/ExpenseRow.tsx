import { DateTime } from 'luxon';
import { Text, View, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { ExpenseWithDetails } from '@/generated/api/api';
import { 
  usePostExpensesByExpenseIdVerifyMutation,
  useDeleteExpensesByExpenseIdMutation 
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';

type Props = { 
  item: ExpenseWithDetails;
  onPress?: (item: ExpenseWithDetails) => void;
};

export const ExpenseRow = ({ item, onPress }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { currency, locale } = useUserLocale();
  const [verifyExpense] = usePostExpensesByExpenseIdVerifyMutation();
  const [deleteExpense] = useDeleteExpensesByExpenseIdMutation();

  const isVerified = !!item.verified_at;

  const handleVerify = async () => {
    if (isVerified) return;
    
    try {
      await verifyExpense({ expenseId: item.id }).unwrap();
    } catch (error) {
      console.error('Error verifying expense:', error);
      Alert.alert('Error', 'Failed to verify expense. Please try again.');
    }
  };

  const handleEdit = () => {
    router.push(`/modals/expense-form?expenseId=${item.id}`);
  };

  const handleViewDetails = () => {
    router.push(`/modals/transaction-details?expenseId=${item.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      t('transaction_details_delete_confirm_title'),
      t('transaction_details_delete_confirm'),
      [
        {
          text: t('form_cancel'),
          style: 'cancel',
        },
        {
          text: t('transaction_details_delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense({ expenseId: item.id }).unwrap();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <Pressable style={[styles.actionButton, styles.verifyAction]} onPress={handleVerify}>
        <Text style={styles.actionButtonText}>{t('transaction_swipe_verify')}</Text>
      </Pressable>
      <Pressable style={[styles.actionButton, styles.editAction]} onPress={handleEdit}>
        <Text style={styles.actionButtonText}>{t('transaction_swipe_edit')}</Text>
      </Pressable>
      <Pressable style={[styles.actionButton, styles.deleteAction]} onPress={handleDelete}>
        <Text style={styles.actionButtonText}>{t('transaction_swipe_delete')}</Text>
      </Pressable>
    </View>
  );

  return (
    <ReanimatedSwipeable renderRightActions={renderRightActions}>
      <Pressable
        onPress={handleViewDetails}
        style={[
          styles.container,
          isVerified && styles.verifiedContainer
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                {item.title}
              </Text>
              {isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
            </View>
            <Text style={{ fontSize: 12, color: colors.disabled, marginTop: 2 }}>
              {item.category.title} · {item.payment_method.title} ·{' '}
              {DateTime.fromISO(item.incurred_at).setLocale(locale).toLocaleString(DateTime.DATE_MED)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.textPrimary,
            }}
          >
            {formatCurrency(item.amount, currency, locale)}
          </Text>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSurface,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
  },
  verifiedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success || '#4CAF50',
  },
  verifiedBadge: {
    fontSize: 12,
    color: colors.success || '#4CAF50',
    fontWeight: '700' as const,
  },
  rightActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minWidth: 80,
  },
  verifyAction: {
    backgroundColor: colors.success || '#4CAF50',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  editAction: {
    backgroundColor: colors.primary,
  },
  deleteAction: {
    backgroundColor: colors.error,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  actionButtonText: {
    color: colors.backgroundDefault,
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
