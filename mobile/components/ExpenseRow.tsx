import { DateTime } from 'luxon';
import { Text, View, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Octicons from '@expo/vector-icons/Octicons';
import type { ExpenseWithDetails } from '@/generated/api/api';
import {
  usePostExpensesByExpenseIdVerifyMutation,
  useDeleteExpensesByExpenseIdMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';

type Props = {
  item: ExpenseWithDetails;
};

export const ExpenseRow = ({ item }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { currency, locale } = useUserLocale();
  const [verifyExpense, { isLoading: isVerifying }] = usePostExpensesByExpenseIdVerifyMutation();
  const [deleteExpense] = useDeleteExpensesByExpenseIdMutation();
  const swipeableRef = useRef<any>(null);

  const isVerified = !!item.verified_at;

  const handleVerify = async () => {
    if (isVerified || isVerifying) return;

    try {
      await verifyExpense({ expenseId: item.id }).unwrap();
      // Close the swipe actions after successful verification
      swipeableRef.current?.close();
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
      ],
    );
  };

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      {!isVerified && (
        <Pressable
          style={[styles.actionButton, styles.verifyAction, isVerifying && styles.disabledButton]}
          onPress={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator
              size="small"
              color={colors.backgroundDefault}
            />
          ) : (
            <Octicons
              name="check"
              size={20}
              color={colors.backgroundDefault}
            />
          )}
          <Text style={styles.actionButtonText}>
            {isVerifying ? t('transaction_details_verifying') : t('transaction_swipe_verify')}
          </Text>
        </Pressable>
      )}
      <Pressable
        style={[styles.actionButton, styles.editAction]}
        onPress={handleEdit}
      >
        <Octicons
          name="pencil"
          size={20}
          color={colors.backgroundDefault}
        />
        <Text style={styles.actionButtonText}>{t('transaction_swipe_edit')}</Text>
      </Pressable>
      <Pressable
        style={[styles.actionButton, styles.deleteAction]}
        onPress={handleDelete}
      >
        <Octicons
          name="trash"
          size={20}
          color={colors.backgroundDefault}
        />
        <Text style={styles.actionButtonText}>{t('transaction_swipe_delete')}</Text>
      </Pressable>
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
    >
      <Pressable
        onPress={handleViewDetails}
        style={[styles.container, isVerified && styles.verifiedContainer]}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                {item.title}
              </Text>
              {isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
            </View>
            <Text style={{ fontSize: 12, color: colors.disabled, marginTop: 2 }}>
              {item.category.title} · {item.payment_method.title} ·{' '}
              {DateTime.fromISO(item.incurred_at)
                .setLocale(locale)
                .toLocaleString(DateTime.DATE_MED)}
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
    marginLeft: 8,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minWidth: 65,
    gap: 4,
    borderRadius: 8,
  },
  verifyAction: {
    backgroundColor: colors.success || '#4CAF50',
  },
  editAction: {
    backgroundColor: colors.primary,
  },
  deleteAction: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.backgroundDefault,
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

