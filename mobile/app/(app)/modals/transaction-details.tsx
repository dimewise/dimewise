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
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import Octicons from '@expo/vector-icons/Octicons';
import {
  useGetExpensesByExpenseIdQuery,
  usePostExpensesByExpenseIdVerifyMutation,
  useDeleteExpensesByExpenseIdMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useUserLocale } from '@/hooks/useUserLocale';
import { formatCurrency } from '@/utils/localization/currencies';
import { ExpenseFormModal } from '@/components/modals/ExpenseFormModal';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalHeader } from '@/components/modals/ModalHeader';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalButton } from '@/components/modals/ModalButton';

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
      <ModalContainer>
        <ModalHeader title={t('transaction_details_title')} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('form_loading')}</Text>
        </View>
      </ModalContainer>
    );
  }

  if (error || !expense) {
    return (
      <ModalContainer>
        <ModalHeader title={t('transaction_details_title')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load transaction details</Text>
          <Pressable
            onPress={onClose}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Close</Text>
          </Pressable>
        </View>
      </ModalContainer>
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

  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const handleEdit = () => {
    setShowExpenseForm(true);
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
    <ModalContainer>
      <ModalHeader
        title={t('transaction_details_title')}
        rightAction={
          <Pressable onPress={handleEdit} style={styles.editIconButton}>
            <Octicons
              name="pencil"
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        }
      />

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

      <ModalFooter>
        <ModalButton
          onPress={handleDelete}
          variant="error"
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
            t('transaction_details_delete')
          )}
        </ModalButton>
        <ModalButton
          onPress={handleEdit}
          variant="primary"
          disabled={isDeleting}
        >
          {t('transaction_details_edit')}
        </ModalButton>
      </ModalFooter>

      <ExpenseFormModal
        visible={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        expenseId={expense.id}
        onSuccess={() => {
          // The expense query will refetch automatically
          setShowExpenseForm(false);
        }}
      />
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  editIconButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.disabled,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - spacing.xs,
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
    padding: spacing.lg + spacing.sm,
    gap: spacing.lg + spacing.sm,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md - spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: colors.success || '#4CAF50',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  verifiedBadgeText: {
    color: colors.backgroundDefault,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    gap: spacing.md - spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 8,
    padding: spacing.md - spacing.xs,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
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
    padding: spacing.md,
    borderRadius: 8,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.sm,
  },
  verifyingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
  deletingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deletingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundDefault,
  },
});
