import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import type { Category, CategoryCreate, CategoryUpdate } from '@/generated/api/api';
import {
  useDeleteCategoriesByCategoryIdMutation,
  useGetCategoriesQuery,
  usePostCategoriesMutation,
  usePutCategoriesByCategoryIdMutation,
} from '@/generated/api/api';
import { logger } from '@/lib/logger';

interface UseCategoriesOptions {
  onMutationSuccess?: () => void;
  onMutationError?: (error: Error) => void;
}

export function useCategories(options?: UseCategoriesOptions) {
  const { t } = useTranslation();

  // Queries - pass empty object to avoid undefined error
  const { data: categories = [], isLoading, error, refetch } = useGetCategoriesQuery({});

  // Mutations
  const [createCategoryMutation, createState] = usePostCategoriesMutation();
  const [updateCategoryMutation, updateState] = usePutCategoriesByCategoryIdMutation();
  const [deleteCategoryMutation, deleteState] = useDeleteCategoriesByCategoryIdMutation();

  // Create
  const createCategory = useCallback(
    async (payload: CategoryCreate) => {
      try {
        const result = await createCategoryMutation({
          categoryCreate: payload,
        }).unwrap();
        logger.info('Category created', {
          context: 'useCategories',
          data: { title: payload.title },
        });
        options?.onMutationSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create category');
        logger.error(error, { context: 'useCategories' });
        options?.onMutationError?.(error);
        throw error;
      }
    },
    [createCategoryMutation, options],
  );

  // Update
  const updateCategory = useCallback(
    async (id: string, payload: CategoryUpdate) => {
      try {
        const result = await updateCategoryMutation({
          categoryId: id,
          categoryUpdate: payload,
        }).unwrap();
        logger.info('Category updated', {
          context: 'useCategories',
          data: { id },
        });
        options?.onMutationSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update category');
        logger.error(error, { context: 'useCategories' });
        options?.onMutationError?.(error);
        throw error;
      }
    },
    [updateCategoryMutation, options],
  );

  // Delete with confirmation
  const deleteCategory = useCallback(
    (category: Category) => {
      Alert.alert(
        t('settings.categories.deleteTitle', 'Delete Category'),
        t('settings.categories.deleteMessage', {
          defaultValue: 'Are you sure you want to delete "{{name}}"?',
          name: category.title,
        }),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.delete', 'Delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteCategoryMutation({
                  categoryId: category.id,
                }).unwrap();
                logger.info('Category deleted', {
                  context: 'useCategories',
                  data: { id: category.id },
                });
                options?.onMutationSuccess?.();
              } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to delete category');
                logger.error(error, { context: 'useCategories' });
                options?.onMutationError?.(error);
              }
            },
          },
        ],
      );
    },
    [deleteCategoryMutation, options, t],
  );

  return {
    // Data
    categories,
    isLoading,
    error,

    // Actions
    createCategory,
    updateCategory,
    deleteCategory,
    refetch,

    // Mutation states
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    isMutating: createState.isLoading || updateState.isLoading || deleteState.isLoading,
  };
}
