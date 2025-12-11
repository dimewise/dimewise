import Octicons from '@expo/vector-icons/Octicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LoadingState } from '@/components/feedback';
import { ExpenseFormModal } from '@/components/modals/ExpenseFormModal';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalHeader } from '@/components/modals/ModalHeader';
import {
  useDeleteExpensesByExpenseIdMutation,
  useGetExpensesByExpenseIdQuery,
  usePostExpensesByExpenseIdVerifyMutation,
} from '@/generated/api/api';
import { useUserLocale } from '@/hooks/useUserLocale';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';

export default function TransactionDetailsModal() {
  const router = useRouter();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { t } = useTranslation();
  const { currency, locale } = useUserLocale();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

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
        <ModalHeader
          title={t('transaction_details_title')}
          onClose={onClose}
        />
        <LoadingState
          fullScreen={false}
          className="flex-1"
        />
      </ModalContainer>
    );
  }

  if (error || !expense) {
    return (
      <ModalContainer>
        <ModalHeader
          title={t('transaction_details_title')}
          onClose={onClose}
        />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-red-500 mb-4">{t('error_generic_message')}</Text>
          <Pressable
            onPress={onClose}
            className="bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-base font-semibold text-white">{t('form_cancel')}</Text>
          </Pressable>
        </View>
      </ModalContainer>
    );
  }

  const isVerified = !!expense.verified_at;
  const isPaymentMethodDeleted = !!expense.payment_method.deleted_at;
  const isCategoryDeleted = !!expense.category.deleted_at;

  const handleVerify = async () => {
    if (isVerified || isVerifying) return;

    try {
      setIsVerifying(true);
      await verifyExpense({ expenseId: expense.id }).unwrap();
    } catch (err) {
      Alert.alert(t('common_error'), t('transaction_verify_error'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEdit = () => {
    setShowExpenseForm(true);
  };

  const handleDelete = () => {
    Alert.alert(
      t('transaction_details_delete_confirm_title'),
      t('transaction_details_delete_confirm'),
      [
        { text: t('form_cancel'), style: 'cancel' },
        {
          text: t('transaction_details_delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteExpense({ expenseId: expense.id }).unwrap();
              onClose();
            } catch (err) {
              Alert.alert(t('common_error'), t('transaction_delete_error'));
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
        onClose={onClose}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Amount & Title */}
        <View className="items-center py-20 px-6">
          <Text className="text-5xl font-bold text-neutral-900 mb-1">
            {formatCurrency(expense.amount, currency, locale)}
          </Text>
          <Text className="text-lg text-neutral-600 text-center mb-2">{expense.title}</Text>
          {isVerified && (
            <View className="bg-emerald-50 px-3 py-1 rounded-full flex-row items-center gap-1.5">
              <Octicons
                name="check-circle-fill"
                size={14}
                color={colors.success}
              />
              <Text className="text-sm font-medium text-emerald-700">
                {t('transaction_details_verified')}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {expense.description && (
          <View className="px-6 mb-4">
            <Text className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
              {t('form_expense_description')}
            </Text>
            <View className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <Text className="text-base text-neutral-700 leading-6">{expense.description}</Text>
            </View>
          </View>
        )}

        {/* Transaction Details Card */}
        <View className="px-6 mb-4">
          <Text className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
            {t('transaction_details_transaction_details')}
          </Text>
          <View className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
            <DetailRow
              label={t('form_expense_date')}
              value={formatDate(expense.incurred_at)}
            />
            <View className="h-px bg-neutral-200 mx-4" />
            <DetailRow
              label={t('transaction_details_time')}
              value={formatTime(expense.incurred_at)}
            />
            <View className="h-px bg-neutral-200 mx-4" />
            <DetailRow
              label={t('form_expense_category')}
              value={expense.category.title}
              isDeleted={isCategoryDeleted}
              deletedLabel={t('common_deleted')}
            />
            <View className="h-px bg-neutral-200 mx-4" />
            <DetailRow
              label={t('form_expense_payment_method')}
              value={expense.payment_method.title}
              isDeleted={isPaymentMethodDeleted}
              deletedLabel={t('common_deleted')}
            />
          </View>
        </View>

        {/* Status Section (if not verified) */}
        {!isVerified && (
          <View className="px-6 mb-4">
            <Text className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
              {t('transaction_details_status')}
            </Text>
            <View className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex-row items-center gap-2">
              <Octicons
                name="alert"
                size={16}
                color={colors.warning}
              />
              <Text className="text-base font-medium text-amber-700">
                {t('transaction_details_unverified')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons Footer */}
      <ModalFooter>
        {/* Verify Button (only if not verified) */}
        {!isVerified && (
          <ActionButton
            onPress={handleVerify}
            icon="check"
            label={isVerifying ? t('transaction_details_verifying') : t('transaction_swipe_verify')}
            variant="success"
            disabled={isVerifying}
            isLoading={isVerifying}
          />
        )}

        {/* Edit Button */}
        <ActionButton
          onPress={handleEdit}
          icon="pencil"
          label={t('transaction_details_edit')}
          variant="default"
          disabled={isDeleting || isVerifying}
        />

        {/* Delete Button */}
        <ActionButton
          onPress={handleDelete}
          icon="trash"
          label={isDeleting ? t('transaction_details_deleting') : t('transaction_details_delete')}
          variant="danger"
          disabled={isDeleting || isVerifying}
          isLoading={isDeleting}
        />
      </ModalFooter>

      {/* Edit Modal */}
      <ExpenseFormModal
        visible={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        expenseId={expense.id}
        onSuccess={() => setShowExpenseForm(false)}
      />
    </ModalContainer>
  );
}

// Detail Row Component
function DetailRow({
  label,
  value,
  isDeleted = false,
  deletedLabel = 'Deleted',
}: {
  label: string;
  value: string;
  isDeleted?: boolean;
  deletedLabel?: string;
}) {
  return (
    <View className="flex-row justify-between items-center px-4 py-3.5">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Text
          className={`text-base font-medium ${isDeleted ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}
        >
          {value}
        </Text>
        {isDeleted && (
          <View className="bg-red-100 px-2 py-0.5 rounded">
            <Text className="text-xs text-red-600 font-medium">{deletedLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// Action Button Component
function ActionButton({
  onPress,
  icon,
  label,
  variant,
  disabled,
  isLoading,
}: {
  onPress: () => void;
  icon: 'check' | 'pencil' | 'trash';
  label: string;
  variant: 'success' | 'default' | 'danger';
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const variantStyles = {
    success: {
      bg: 'bg-emerald-500',
      activeBg: 'active:bg-emerald-600',
      iconColor: '#FFFFFF',
      textColor: 'text-white',
    },
    default: {
      bg: 'bg-neutral-100',
      activeBg: 'active:bg-neutral-200',
      iconColor: colors.neutral[700],
      textColor: 'text-neutral-700',
    },
    danger: {
      bg: 'bg-red-50',
      activeBg: 'active:bg-red-100',
      iconColor: colors.error,
      textColor: 'text-red-600',
    },
  };

  const style = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 items-center justify-center py-3 rounded-xl ${style.bg} ${!disabled && style.activeBg} ${disabled ? 'opacity-50' : ''}`}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={style.iconColor}
        />
      ) : (
        <>
          <Octicons
            name={icon}
            size={20}
            color={style.iconColor}
          />
          <Text className={`text-xs font-medium mt-1 ${style.textColor}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
