import Octicons from '@expo/vector-icons/Octicons';
import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { ExpenseFormModal } from '@/components/modals/ExpenseFormModal';
import type { ExpenseWithDetails } from '@/generated/api/api';
import {
  useDeleteExpensesByExpenseIdMutation,
  usePostExpensesByExpenseIdVerifyMutation,
} from '@/generated/api/api';
import { useUserLocale } from '@/hooks/useUserLocale';
import { logger } from '@/lib/logger';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';

interface ExpenseRowProps {
  item: ExpenseWithDetails;
  onUpdate?: () => void;
}

interface SwipeActionButtonProps {
  onPress: () => void;
  icon: React.ComponentProps<typeof Octicons>['name'];
  label: string;
  variant: 'verify' | 'edit' | 'delete';
  disabled?: boolean;
  isLoading?: boolean;
}

// Memoized swipe action button
const SwipeActionButton = memo<SwipeActionButtonProps>(
  ({ onPress, icon, label, variant, disabled = false, isLoading = false }) => {
    const variantStyles = {
      verify: 'bg-emerald-500',
      edit: 'bg-primary-500',
      delete: 'bg-red-500',
    };

    return (
      <Pressable
        className={`px-2.5 py-3 items-center justify-center min-w-[65px] gap-1 rounded-lg ${variantStyles[variant]} ${disabled ? 'opacity-60' : ''}`}
        onPress={onPress}
        disabled={disabled}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.background}
          />
        ) : (
          <Octicons
            name={icon}
            size={20}
            color={colors.background}
          />
        )}
        <Text className="text-white text-[11px] font-semibold text-center">{label}</Text>
      </Pressable>
    );
  },
);

SwipeActionButton.displayName = 'SwipeActionButton';

// Main ExpenseRow component
export const ExpenseRow = memo<ExpenseRowProps>(({ item, onUpdate }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { currency, locale } = useUserLocale();
  const [verifyExpense, { isLoading: isVerifying }] = usePostExpensesByExpenseIdVerifyMutation();
  const [deleteExpense] = useDeleteExpensesByExpenseIdMutation();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const isVerified = !!item.verified_at;

  const closeSwipeable = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const handleVerify = useCallback(async () => {
    if (isVerified || isVerifying) return;

    try {
      await verifyExpense({ expenseId: item.id }).unwrap();
      closeSwipeable();
      onUpdate?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Error verifying expense: ${errorMessage}`);
      Alert.alert(t('common_error'), t('transaction_verify_error'));
    }
  }, [isVerified, isVerifying, verifyExpense, item.id, closeSwipeable, onUpdate, t]);

  const handleEdit = useCallback(() => {
    setShowExpenseForm(true);
    closeSwipeable();
  }, [closeSwipeable]);

  const handleViewDetails = useCallback(() => {
    router.push(`/modals/transaction-details?expenseId=${item.id}`);
  }, [router, item.id]);

  const handleDelete = useCallback(() => {
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
              onUpdate?.();
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              logger.error(`Error deleting expense: ${errorMessage}`);
              Alert.alert(t('common_error'), t('transaction_delete_error'));
            }
          },
        },
      ],
    );
  }, [deleteExpense, item.id, onUpdate, t]);

  const handleFormClose = useCallback(() => {
    setShowExpenseForm(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    onUpdate?.();
  }, [onUpdate]);

  // Format date for display
  const formattedDate = DateTime.fromISO(item.incurred_at)
    .setLocale(locale)
    .toLocaleString(DateTime.DATE_MED);

  // Check if payment method or category is deleted
  const isPaymentMethodDeleted = !!item.payment_method.deleted_at;
  const isCategoryDeleted = !!item.category.deleted_at;

  const renderRightActions = useCallback(
    () => (
      <View className="flex-row items-center ml-2 gap-2">
        {!isVerified && (
          <SwipeActionButton
            onPress={handleVerify}
            icon="check"
            label={isVerifying ? t('transaction_details_verifying') : t('transaction_swipe_verify')}
            variant="verify"
            disabled={isVerifying}
            isLoading={isVerifying}
          />
        )}
        <SwipeActionButton
          onPress={handleEdit}
          icon="pencil"
          label={t('transaction_swipe_edit')}
          variant="edit"
        />
        <SwipeActionButton
          onPress={handleDelete}
          icon="trash"
          label={t('transaction_swipe_delete')}
          variant="delete"
        />
      </View>
    ),
    [isVerified, isVerifying, handleVerify, handleEdit, handleDelete, t],
  );

  return (
    <>
      <ReanimatedSwipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
      >
        <Pressable
          onPress={handleViewDetails}
          className={`bg-white rounded-xl p-4 border border-neutral-200 ${isVerified ? 'border-l-4 border-l-emerald-500' : ''}`}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-[15px] font-semibold text-neutral-900">{item.title}</Text>
                {isVerified && <Text className="text-xs text-emerald-500 font-bold">✓</Text>}
              </View>
              <Text className="text-xs text-neutral-500 mt-0.5">
                <Text className={isCategoryDeleted ? 'line-through text-neutral-400' : ''}>
                  {item.category.title}
                </Text>
                {' · '}
                <Text className={isPaymentMethodDeleted ? 'line-through text-neutral-400' : ''}>
                  {item.payment_method.title}
                </Text>
                {' · '}
                {formattedDate}
              </Text>
            </View>
            <Text className="text-[15px] font-semibold text-neutral-900 tabular-nums">
              {formatCurrency(item.amount, currency, locale)}
            </Text>
          </View>
        </Pressable>
      </ReanimatedSwipeable>
      <ExpenseFormModal
        visible={showExpenseForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        expenseId={item.id}
      />
    </>
  );
});

ExpenseRow.displayName = 'ExpenseRow';
