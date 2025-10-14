import { useClerk } from '@clerk/clerk-expo';
import Octicons from '@expo/vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import {
  type CurrencyType,
  type SupportedLanguage,
  useGetCategoriesQuery,
  useGetPaymentMethodsQuery,
  useGetUsersMeQuery,
  usePutUsersMeMutation,
  useDeleteCategoriesByCategoryIdMutation,
  useDeletePaymentMethodsByPaymentMethodIdMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { CURRENCIES } from '@/utils/constants';
import { formatCurrency } from '@/utils/localization/currencies';
import { useUserLocale } from '@/hooks/useUserLocale';

type RootStackParamList = { Login: undefined };

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut } = useClerk();
  const { data: cats } = useGetCategoriesQuery({ includeDeleted: false });
  const { data: pms } = useGetPaymentMethodsQuery({ includeDeleted: false });
  const { data: user } = useGetUsersMeQuery();
  const { currency, locale } = useUserLocale();

  // Calculate total monthly budget
  const totalBudget = useMemo(() => {
    if (!cats) return 0;
    return cats.reduce((sum, cat) => sum + (cat.amount || 0), 0);
  }, [cats]);

  const [updateUser] = usePutUsersMeMutation();
  const [deleteCategory] = useDeleteCategoriesByCategoryIdMutation();
  const [deletePaymentMethod] = useDeletePaymentMethodsByPaymentMethodIdMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingPaymentMethodId, setDeletingPaymentMethodId] = useState<string | null>(null);
  const [deletedCategoryId, setDeletedCategoryId] = useState<string | null>(null);
  const [deletedPaymentMethodId, setDeletedPaymentMethodId] = useState<string | null>(null);


  // Clear deleted states when items are no longer in the data
  useEffect(() => {
    if (deletedCategoryId && cats && !cats.find(cat => cat.id === deletedCategoryId)) {
      setDeletedCategoryId(null);
      setDeletingCategoryId(null);
    }
  }, [deletedCategoryId, cats]);

  useEffect(() => {
    if (deletedPaymentMethodId && pms && !pms.find(pm => pm.id === deletedPaymentMethodId)) {
      setDeletedPaymentMethodId(null);
      setDeletingPaymentMethodId(null);
    }
  }, [deletedPaymentMethodId, pms]);

  const onSelectCurrency = () => {
    router.push('/(app)/modals/currency-selector');
  };

  const onSelectLanguage = () => {
    router.push('/(app)/modals/language-selector');
  };

  const onEditCategory = (categoryId: string, title: string, amount: number) => {
    router.push({
      pathname: '/(app)/modals/category-form',
      params: { id: categoryId, title, amount: amount.toString() },
    });
  };

  const onEditPaymentMethod = (paymentMethodId: string, title: string, method_type: string) => {
    router.push({
      pathname: '/(app)/modals/payment-method-form',
      params: { id: paymentMethodId, title, method_type },
    });
  };

  const onAddCategory = () => {
    router.push('/(app)/modals/category-form');
  };

  const onAddPaymentMethod = () => {
    router.push('/(app)/modals/payment-method-form');
  };

  const onDeleteCategory = (categoryId: string, title: string) => {
    Alert.alert(
      t('settings_delete_confirm_title'),
      t('settings_delete_category_confirm'),
      [
        { text: t('settings_delete_confirm_cancel'), style: 'cancel' },
        {
          text: t('settings_delete_confirm_delete'),
          style: 'destructive',
          onPress: async () => {
            setDeletingCategoryId(categoryId);
            try {
              await deleteCategory({ categoryId }).unwrap();
              setDeletedCategoryId(categoryId);
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category. Please try again.');
              setDeletingCategoryId(null);
            }
          },
        },
      ]
    );
  };

  const onDeletePaymentMethod = (paymentMethodId: string, title: string) => {
    Alert.alert(
      t('settings_delete_confirm_title'),
      t('settings_delete_payment_method_confirm'),
      [
        { text: t('settings_delete_confirm_cancel'), style: 'cancel' },
        {
          text: t('settings_delete_confirm_delete'),
          style: 'destructive',
          onPress: async () => {
            setDeletingPaymentMethodId(paymentMethodId);
            try {
              await deletePaymentMethod({ paymentMethodId }).unwrap();
              setDeletedPaymentMethodId(paymentMethodId);
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method. Please try again.');
              setDeletingPaymentMethodId(null);
            }
          },
        },
      ]
    );
  };
  const onLogout = async () => {
    try {
      await signOut();
      router.replace('/welcome');
    } catch (err) {
      throw new Error(JSON.stringify(err, null, 2));
    }
  };

  const sections = useMemo(
    () => [
      {
        title: t('settings_cat_pay_title'),
        data: cats ?? [],
        action: onAddCategory,
        type: 'categories' as const,
      },
      {
        title: t('settings_pay_methods_title'),
        data: pms ?? [],
        action: onAddPaymentMethod,
        type: 'payment_methods' as const,
      },
    ],
    [cats, pms, t],
  );

  const currencyRow = (
    <Pressable
      onPress={onSelectCurrency}
      style={styles.row}
    >
      <Text style={styles.rowLabel}>{t('settings_currency')}</Text>
      <Text style={styles.rowValue}>{user?.currency}</Text>
    </Pressable>
  );

  const languageRow = (
    <Pressable
      onPress={onSelectLanguage}
      style={styles.row}
    >
      <Text style={styles.rowLabel}>{t('settings_language')}</Text>
      <Text style={styles.rowValue}>{t(`lang_${user?.preferred_language}`)}</Text>
    </Pressable>
  );

  if (!user) return null; // or a spinner

  return (
    <AppLayout>
      <SafeAreaView
        style={{ flex: 1, width: '100%', paddingHorizontal: 24 }}
        edges={['top']}
      >
        <View style={{ width: '100%', paddingVertical: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary }}>
            {t('page_title_settings')}
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
          <View style={styles.section}>
            {currencyRow}
            {languageRow}
          </View>

          {sections.map((sec) => (
            <View
              key={sec.title}
              style={{ marginBottom: 24 }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
                    {sec.title}
                  </Text>
                  {sec.type === 'categories' && totalBudget > 0 && (
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
                      {t('settings_total_budget')}: {formatCurrency(totalBudget, currency, locale)}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={sec.action}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: pressed ? `${colors.primary}20` : colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  })}
                >
                  <Octicons
                    name="plus"
                    size={16}
                    color={colors.backgroundDefault}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{ fontSize: 14, fontWeight: '600', color: colors.backgroundDefault }}
                  >
                    {sec.type === 'categories' ? t('settings_add_category') : t('settings_add_payment')}
                  </Text>
                </Pressable>
              </View>

              {/*  empty or list  */}
              {sec.data.length === 0 ? (
                <View
                  style={{
                    backgroundColor: colors.backgroundSurface,
                    borderRadius: 8,
                    padding: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.disabled }}>
                    {sec.type === 'categories'
                      ? t('categories_empty')
                      : t('payment_methods_empty')}
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {sec.data.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        backgroundColor: colors.backgroundSurface,
                        borderRadius: 8,
                        padding: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '500' }}>
                          {item.title}
                        </Text>
                        {sec.type === 'categories' && 'amount' in item && (
                          <Text style={{ color: colors.disabled, fontSize: 12, marginTop: 2 }}>
                            {formatCurrency(item.amount, currency, locale)}
                          </Text>
                        )}
                        {sec.type === 'payment_methods' && 'method_type' in item && (
                          <Text style={{ color: colors.disabled, fontSize: 12, marginTop: 2 }}>
                            {t(`payment_method_${item.method_type}`)}
                          </Text>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {(sec.type === 'categories' && (deletingCategoryId === item.id || deletedCategoryId === item.id)) ||
                         (sec.type === 'payment_methods' && (deletingPaymentMethodId === item.id || deletedPaymentMethodId === item.id)) ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.loadingText}>Deleting...</Text>
                          </View>
                        ) : (
                          <>
                            <Pressable
                              onPress={() => {
                                if (sec.type === 'categories' && 'amount' in item) {
                                  onEditCategory(item.id, item.title, item.amount);
                                } else if (sec.type === 'payment_methods' && 'method_type' in item) {
                                  onEditPaymentMethod(item.id, item.title, item.method_type);
                                }
                              }}
                              style={styles.actionButton}
                            >
                              <Text style={styles.actionButtonText}>{t('settings_edit')}</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                if (sec.type === 'categories') {
                                  onDeleteCategory(item.id, item.title);
                                } else {
                                  onDeletePaymentMethod(item.id, item.title);
                                }
                              }}
                              style={[styles.actionButton, styles.deleteButton]}
                            >
                              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                                {t('settings_delete')}
                              </Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* 4.  Log Out */}
          <Pressable
            onPress={onLogout}
            style={{
              backgroundColor: `${colors.error}20`,
              borderRadius: 8,
              padding: 12,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ color: colors.error, fontWeight: '600' }}>{t('settings_logout')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginVertical: 16 },
  scroll: { paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSurface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  rowLabel: { fontSize: 16, color: colors.textPrimary },
  rowValue: { fontSize: 16, color: colors.textSecondary },
  logout: { backgroundColor: `${colors.error}20`, marginTop: 16 },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: colors.backgroundDefault,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: `${colors.error}20`,
  },
  deleteButtonText: {
    color: colors.error,
  },
  loadingButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
