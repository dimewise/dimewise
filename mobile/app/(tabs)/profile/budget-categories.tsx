import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Dialog,
  Portal,
  Appbar,
  FAB,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCategories, SYSTEM_CATEGORIES, formatAmount } from '../../../storage';
import { Category } from '../../../storage';
import { useCurrency, useCurrencyRefresh } from '../../../utils/UserSettingsContext';
import CategoryBottomSheet from '../../../components/CategoryBottomSheet';
import EditCategoryBottomSheet from '../../../components/EditCategoryBottomSheet';

export default function BudgetCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showEditCategorySheet, setShowEditCategorySheet] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const refreshKey = useCurrencyRefresh();

  // Storage hooks
  const categoryOps = useCategories();

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Close all bottom sheets when navigating to this screen
      setShowCategorySheet(false);
      setShowEditCategorySheet(false);
    }, [refreshKey])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const allCategories = await categoryOps.getCategories();

      const userCategories = allCategories.filter(category =>
        category.id !== SYSTEM_CATEGORIES.UNCATEGORIZED
      );

      setCategories(userCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    loadData();
  };

  const handleCategoryUpdated = () => {
    loadData();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (categoryId === SYSTEM_CATEGORIES.UNCATEGORIZED) {
      return;
    }

    try {
      await categoryOps.deleteCategory(categoryId);
      loadData();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('categories.title')} titleStyle={{ fontWeight: '700' }} />
      </Appbar.Header>

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {loading ? (
          <View style={{
            padding: 32,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('status.loading')}</Text>
          </View>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <View key={category.id} style={{
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
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 6, color: theme.colors.onSurface }}>{category.name}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                    {t('expenses.budget')}: {formatAmount(category.budget, currency)}
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
                    style={{
                      margin: 0,
                    }}
                  />
                  <IconButton
                    icon="delete"
                    size={24}
                    onPress={() => showDeleteConfirmation(category.id, category.name)}
                    iconColor={theme.colors.error}
                    style={{
                      margin: 0,
                    }}
                  />
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{
            padding: 48,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16, fontWeight: '600', color: theme.colors.onSurface }}>
              {t('categories.noCategories')}
            </Text>
            <Text variant="bodyMedium" style={{
              textAlign: 'center',
              color: theme.colors.onSurfaceVariant,
              lineHeight: 24,
            }}>
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
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              {t('actions.deleteConfirmMessage', { name: itemToDelete?.name })} {t('actions.cannotUndo')}
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
  );
} 