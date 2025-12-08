import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useGetPaymentMethodsQuery,
  usePostPaymentMethodsMutation,
  usePutPaymentMethodsByPaymentMethodIdMutation,
  useDeletePaymentMethodsByPaymentMethodIdMutation,
} from '@/generated/api/api';
import type {
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodUpdate,
} from '@/generated/api/api';
import { logger } from '@/lib/logger';

interface UsePaymentMethodsOptions {
  onMutationSuccess?: () => void;
  onMutationError?: (error: Error) => void;
}

export function usePaymentMethods(options?: UsePaymentMethodsOptions) {
  const { t } = useTranslation();

  // Queries
  const {
    data: paymentMethods = [],
    isLoading,
    error,
    refetch,
  } = useGetPaymentMethodsQuery();

  // Mutations
  const [createPaymentMethodMutation, createState] =
    usePostPaymentMethodsMutation();
  const [updatePaymentMethodMutation, updateState] =
    usePutPaymentMethodsByPaymentMethodIdMutation();
  const [deletePaymentMethodMutation, deleteState] =
    useDeletePaymentMethodsByPaymentMethodIdMutation();

  // Create
  const createPaymentMethod = useCallback(
    async (payload: PaymentMethodCreate) => {
      try {
        const result = await createPaymentMethodMutation({
          paymentMethodCreate: payload,
        }).unwrap();
        logger.info('Payment method created', {
          context: 'usePaymentMethods',
          data: { name: payload.name },
        });
        options?.onMutationSuccess?.();
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to create payment method');
        logger.error(error, { context: 'usePaymentMethods' });
        options?.onMutationError?.(error);
        throw error;
      }
    },
    [createPaymentMethodMutation, options]
  );

  // Update
  const updatePaymentMethod = useCallback(
    async (id: string, payload: PaymentMethodUpdate) => {
      try {
        const result = await updatePaymentMethodMutation({
          paymentMethodId: id,
          paymentMethodUpdate: payload,
        }).unwrap();
        logger.info('Payment method updated', {
          context: 'usePaymentMethods',
          data: { id },
        });
        options?.onMutationSuccess?.();
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to update payment method');
        logger.error(error, { context: 'usePaymentMethods' });
        options?.onMutationError?.(error);
        throw error;
      }
    },
    [updatePaymentMethodMutation, options]
  );

  // Delete with confirmation
  const deletePaymentMethod = useCallback(
    (paymentMethod: PaymentMethod) => {
      Alert.alert(
        t('settings.paymentMethods.deleteTitle', 'Delete Payment Method'),
        t('settings.paymentMethods.deleteMessage', {
          defaultValue: 'Are you sure you want to delete "{{name}}"?',
          name: paymentMethod.name,
        }),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.delete', 'Delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePaymentMethodMutation({
                  paymentMethodId: paymentMethod.id,
                }).unwrap();
                logger.info('Payment method deleted', {
                  context: 'usePaymentMethods',
                  data: { id: paymentMethod.id },
                });
                options?.onMutationSuccess?.();
              } catch (err) {
                const error =
                  err instanceof Error
                    ? err
                    : new Error('Failed to delete payment method');
                logger.error(error, { context: 'usePaymentMethods' });
                options?.onMutationError?.(error);
              }
            },
          },
        ]
      );
    },
    [deletePaymentMethodMutation, options, t]
  );

  return {
    // Data
    paymentMethods,
    isLoading,
    error,

    // Actions
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refetch,

    // Mutation states
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    isMutating:
      createState.isLoading || updateState.isLoading || deleteState.isLoading,
  };
}
