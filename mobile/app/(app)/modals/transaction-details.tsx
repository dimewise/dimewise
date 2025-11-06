import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  useGetExpensesByExpenseIdQuery,
  usePostExpensesByExpenseIdVerifyMutation,
  useDeleteExpensesByExpenseIdMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { useUserLocale } from '@/hooks/useUserLocale';
import { formatCurrency } from '@/utils/localization/currencies';

export default function TransactionDetailsModal() {
  const router = useRouter();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch expense data
  const {
    data: expense,
    isLoading,
    error,
  } = useGetExpensesByExpenseIdQuery({ expenseId: expenseId! }, { skip: !expenseId });

  const [verifyExpense] = usePostExpensesByExpenseIdVerifyMutation();
  const [deleteExpense] = useDeleteExpensesByExpenseIdMutation();

  const onClose = () => {
    router.back();
  };

  if (!expenseId) {
    return null;
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'bottom']}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('transaction_details_title')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('form_loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !expense) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'bottom']}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('transaction_details_title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load transaction details</Text>
          <Pressable
            onPress={onClose}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isVerified = !!expense.verified_at;

  const handleVerify = async () => {
    if (isVerified || isVerifying) return;

    try {
      setIsVerifying(true);
      await verifyExpense({ expenseId: expense.id }).unwrap();
    } catch (error) {
      console.error('Error verifying expense:', error);
      Alert.alert('Error', 'Failed to verify expense. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEdit = () => {
    router.push(`/modals/expense-form?expenseId=${expense.id}`);
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
              setIsDeleting(true);
              await deleteExpense({ expenseId: expense.id }).unwrap();
              onClose();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    return DateTime.fromISO(dateString).setLocale(locale).toLocaleString(DateTime.DATE_MED);
  };

  const formatTime = (dateString: string) => {
    return DateTime.fromISO(dateString).setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('transaction_details_title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsContainer}>
          {/* Amount - Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroAmount}>
              {formatCurrency(expense.amount, currency, locale)}
            </Text>
            <Text style={styles.heroTitle}>{expense.title}</Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ {t('transaction_details_verified')}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {expense.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('form_expense_description')}</Text>
              <View style={styles.infoCard}>
                <Text style={styles.descriptionText}>{expense.description}</Text>
              </View>
            </View>
          )}

          {/* Transaction Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('transaction_details_transaction_details')}</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('form_expense_date')}</Text>
                <Text style={styles.infoValue}>{formatDate(expense.incurred_at)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('transaction_details_time')}</Text>
                <Text style={styles.infoValue}>{formatTime(expense.incurred_at)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('form_expense_category')}</Text>
                <Text style={styles.infoValue}>{expense.category.title}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('form_expense_payment_method')}</Text>
                <Text style={styles.infoValue}>{expense.payment_method.title}</Text>
              </View>
            </View>
          </View>

          {/* Verification Status */}
          {!isVerified && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('transaction_details_status')}</Text>
              <View style={styles.statusCard}>
                <Text style={styles.statusText}>{t('transaction_details_unverified')}</Text>
                {isVerifying ? (
                  <View style={styles.verifyingContainer}>
                    <ActivityIndicator
                      size="small"
                      color={colors.backgroundDefault}
                    />
                    <Text style={styles.verifyingText}>{t('transaction_details_verifying')}</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={handleVerify}
                    style={styles.verifyButtonInline}
                  >
                    <Text style={styles.verifyButtonInlineText}>
                      {t('transaction_details_mark_verified')}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleDelete}
          style={[styles.deleteButton]}
          disabled={isVerifying || isDeleting}
        >
          {isDeleting ? (
            <View style={styles.deletingContainer}>
              <ActivityIndicator
                size="small"
                color={colors.backgroundDefault}
              />
              <Text style={styles.deletingText}>{t('transaction_details_deleting')}</Text>
            </View>
          ) : (
            <Text style={styles.deleteButtonText}>{t('transaction_details_delete')}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleEdit}
          style={[styles.actionButton, styles.editButton]}
          disabled={isDeleting}
        >
          <Text style={styles.actionButtonText}>{t('transaction_details_edit')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDefault,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSurface,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.disabled,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 24,
    gap: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.backgroundSurface,
    borderRadius: 16,
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: colors.success || '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadgeText: {
    color: colors.backgroundDefault,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.disabled,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
    flex: 1,
  },
  statusCard: {
    backgroundColor: colors.backgroundSurface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: colors.disabled,
    fontWeight: '500',
  },
  verifyButtonInline: {
    backgroundColor: colors.success || '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verifyButtonInlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success || '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  verifyingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  deletingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deletingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
});
