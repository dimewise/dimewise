import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import {
  Appbar,
  Button,
  Dialog,
  FAB,
  IconButton,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryBottomSheet from '../../../components/BottomSheets/CategoryBottomSheet';
import EditCategoryBottomSheet from '../../../components/BottomSheets/EditCategoryBottomSheet';
import { useRefreshKey } from '../../../components/contexts/RefreshKeyContext';
import { useUser } from '../../../components/contexts/UserContext';
import ErrorBoundary, { LoadingErrorFallback } from '../../../components/ErrorBoundary';
import { deleteCategoryById, getCategoriesByUserId } from '../../../db/repository/category';
import type { Category } from '../../../db/schema';
import { formatAmount } from '../../../db/utils';
import { useUserData } from '../../../hooks/useAsyncData';

export default function BudgetCategoriesScreen() {
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showEditCategorySheet, setShowEditCategorySheet] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const theme = useTheme();
  const { t } = useTranslation();
  const { user, userSetting } = useUser();
  const { refreshKeys, triggerRefresh } = useRefreshKey();

  // Load categories using our new hook
  const {
    data: categories,
    loading,
    error,
    refetch,
  } = useUserData((userId) => getCategoriesByUserId(userId), user?.id, [refreshKeys.categories]);

  useFocusEffect(
    useCallback(() => {
      // Close all bottom sheets when navigating to this screen
      setShowCategorySheet(false);
      setShowEditCategorySheet(false);
    }, []),
  );

  const handleCategoryAdded = () => {
    triggerRefresh('categories');
  };

  const handleCategoryUpdated = () => {
    triggerRefresh('categories');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      deleteCategoryById(categoryId);
      triggerRefresh('categories');
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await handleDeleteCategory(itemToDelete.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const showDeleteConfirmation = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setShowDeleteDialog(true);
  };

  // Error fallback
  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={[]}
      >
        <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title={t('categories.title')}
            titleStyle={{ fontWeight: '700' }}
          />
        </Appbar.Header>
        <LoadingErrorFallback onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Budget categories error:', error, errorInfo);
      }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={[]}
      >
        <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title={t('categories.title')}
            titleStyle={{ fontWeight: '700' }}
          />
        </Appbar.Header>

        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        >
          {loading ? (
            <View
              style={{
                padding: 32,
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
            >
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('status.loading')}</Text>
            </View>
          ) : categories && categories.length > 0 ? (
            categories.map((category) => (
              <View
                key={category.id}
                style={{
                  marginVertical: 4,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: '600',
                        marginBottom: 6,
                        color: theme.colors.onSurface,
                      }}
                    >
                      {category.name}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        fontWeight: '500',
                      }}
                    >
                      {t('expenses.budget')}:{' '}
                      {formatAmount(category.budget, userSetting?.currency || 'USD')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <IconButton
                      icon="pencil"
                      size={24}
                      onPress={() => {
                        setEditingCategory(category);
                        setShowEditCategorySheet(true);
                      }}
                      iconColor={theme.colors.primary}
                      style={{ margin: 0 }}
                    />
                    <IconButton
                      icon="delete"
                      size={24}
                      onPress={() => showDeleteConfirmation(category.id, category.name)}
                      iconColor={theme.colors.error}
                      style={{ margin: 0 }}
                    />
                  </View>
                </View>
              </View>
            ))
          ) : (
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
                {t('categories.noCategories')}
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  textAlign: 'center',
                  color: theme.colors.onSurfaceVariant,
                  lineHeight: 24,
                }}
              >
                {t('categories.createFirst')}
              </Text>
            </View>
          )}
        </ScrollView>

        <FAB
          icon="plus"
          label={t('categories.newCategory')}
          onPress={() => setShowCategorySheet(true)}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
        />

        <CategoryBottomSheet
          visible={showCategorySheet}
          onDismiss={() => setShowCategorySheet(false)}
          onCategoryAdded={handleCategoryAdded}
        />

        <EditCategoryBottomSheet
          visible={showEditCategorySheet}
          onDismiss={() => {
            setShowEditCategorySheet(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
          onCategoryUpdated={handleCategoryUpdated}
        />

        <Portal>
          <Dialog
            visible={showDeleteDialog}
            onDismiss={() => setShowDeleteDialog(false)}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
            }}
          >
            <Dialog.Title style={{ color: theme.colors.onSurface }}>
              {t('actions.deleteConfirm')}
            </Dialog.Title>
            <Dialog.Content>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface }}
              >
                {t('actions.deleteConfirmMessage', {
                  name: itemToDelete?.name,
                })}{' '}
                {t('actions.cannotUndo')}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDeleteDialog(false)}>{t('common.cancel')}</Button>
              <Button
                onPress={handleConfirmDelete}
                textColor={theme.colors.error}
              >
                {t('common.delete')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
