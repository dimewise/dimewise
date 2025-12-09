import { useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import { CategoryFormModal } from '@/components/settings/CategoryFormModal';
import { PaymentMethodFormModal } from '@/components/settings/PaymentMethodFormModal';
import { CurrencySelectorModal } from '@/components/settings/CurrencySelectorModal';
import { LanguageSelectorModal } from '@/components/settings/LanguageSelectorModal';
import { Button, Card } from '@/components/ui';
import { EmptyState, LoadingState } from '@/components/feedback';
import { useCategories, usePaymentMethods } from '@/hooks/api';
import { useModal } from '@/hooks/ui';
import { useUserLocale } from '@/hooks/useUserLocale';
import {
  type Category,
  type PaymentMethod,
  type PaymentMethodType,
  useGetUsersMeQuery,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';
import { logger } from '@/lib/logger';

// Types for modal props
interface CategoryModalData {
  categoryId?: string;
  initialTitle?: string;
  initialAmount?: string;
}

interface PaymentMethodModalData {
  paymentMethodId?: string;
  initialTitle?: string;
  initialMethodType?: PaymentMethodType;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut } = useClerk();
  const { currency, locale } = useUserLocale();

  // API hooks
  const { data: user, refetch: refetchUser } = useGetUsersMeQuery();
  const {
    categories,
    isLoading: categoriesLoading,
    deleteCategory,
    refetch: refetchCategories,
    isDeleting: isDeletingCategory,
  } = useCategories();
  const {
    paymentMethods,
    isLoading: paymentMethodsLoading,
    deletePaymentMethod,
    refetch: refetchPaymentMethods,
    isDeleting: isDeletingPaymentMethod,
  } = usePaymentMethods();

  // Modal states using the new hook
  const currencyModal = useModal();
  const languageModal = useModal();
  const categoryModal = useModal<CategoryModalData>();
  const paymentMethodModal = useModal<PaymentMethodModalData>();

  // Calculate total budget
  const totalBudget = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.amount || 0), 0);
  }, [categories]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchCategories(), refetchPaymentMethods(), refetchUser()]);
  }, [refetchCategories, refetchPaymentMethods, refetchUser]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.replace('/welcome');
    } catch (err) {
      logger.error(err as Error, { context: 'Settings' });
    }
  }, [signOut, router]);

  const handleEditCategory = useCallback(
    (category: Category) => {
      categoryModal.open({
        categoryId: category.id,
        initialTitle: category.title,
        initialAmount: category.amount?.toString(),
      });
    },
    [categoryModal]
  );

  const handleEditPaymentMethod = useCallback(
    (pm: PaymentMethod) => {
      paymentMethodModal.open({
        paymentMethodId: pm.id,
        initialTitle: pm.title,
        initialMethodType: pm.method_type,
      });
    },
    [paymentMethodModal]
  );

  const handleAddCategory = useCallback(() => {
    categoryModal.open({});
  }, [categoryModal]);

  const handleAddPaymentMethod = useCallback(() => {
    paymentMethodModal.open({});
  }, [paymentMethodModal]);

  // Show loading state on initial load
  const isInitialLoading = (categoriesLoading || paymentMethodsLoading) 
    && categories.length === 0 && paymentMethods.length === 0;

  if (!user) return null;

  if (isInitialLoading) {
    return (
      <AppLayout>
        <SafeAreaView className="flex-1 w-full px-6 bg-white" edges={['top']}>
          <View className="w-full py-4">
            <Text className="text-2xl font-semibold text-neutral-900">
              {t('page_title_settings')}
            </Text>
          </View>
          <LoadingState fullScreen={false} className="flex-1" />
        </SafeAreaView>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SafeAreaView className="flex-1 w-full px-6 bg-white" edges={['top']}>
        {/* Header */}
        <View className="w-full py-4">
          <Text className="text-2xl font-semibold text-neutral-900">
            {t('page_title_settings')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        >
          {/* Preferences Section */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
              {t('settings_preferences')}
            </Text>
            <Card padding="none">
              <SettingsRow
                label={t('settings_currency')}
                value={user?.currency}
                onPress={currencyModal.open}
              />
              <View className="h-px bg-neutral-200 mx-4" />
              <SettingsRow
                label={t('settings_language')}
                value={t(`lang_${user?.preferred_language}`)}
                onPress={languageModal.open}
              />
            </Card>
          </View>

          {/* Categories Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-neutral-900">
                  {t('settings_cat_pay_title')}
                </Text>
                {totalBudget > 0 && (
                  <Text className="text-sm text-neutral-500 mt-0.5">
                    {t('settings_total_budget')}: {formatCurrency(totalBudget, currency, locale)}
                  </Text>
                )}
              </View>
              <Button
                title={t('settings_add_category')}
                onPress={handleAddCategory}
                size="sm"
                leftIcon={<Ionicons name="add" size={16} color={colors.text.inverse} />}
              />
            </View>

            {categories.length === 0 ? (
              <Card>
                <EmptyState
                  icon="folder-outline"
                  title={t('categories_empty')}
                  className="py-6"
                />
              </Card>
            ) : (
              <Card padding="none">
                {categories.map((category, index) => (
                  <React.Fragment key={category.id}>
                    {index > 0 && <View className="h-px bg-neutral-200 mx-4" />}
                    <ItemRow
                      title={category.title}
                      subtitle={formatCurrency(category.amount || 0, currency, locale)}
                      onEdit={() => handleEditCategory(category)}
                      onDelete={() => deleteCategory(category)}
                      isDeleting={isDeletingCategory}
                    />
                  </React.Fragment>
                ))}
              </Card>
            )}
          </View>

          {/* Payment Methods Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-neutral-900">
                {t('settings_pay_methods_title')}
              </Text>
              <Button
                title={t('settings_add_payment')}
                onPress={handleAddPaymentMethod}
                size="sm"
                leftIcon={<Ionicons name="add" size={16} color={colors.text.inverse} />}
              />
            </View>

            {paymentMethods.length === 0 ? (
              <Card>
                <EmptyState
                  icon="card-outline"
                  title={t('payment_methods_empty')}
                  className="py-6"
                />
              </Card>
            ) : (
              <Card padding="none">
                {paymentMethods.map((pm, index) => (
                  <React.Fragment key={pm.id}>
                    {index > 0 && <View className="h-px bg-neutral-200 mx-4" />}
                    <ItemRow
                      title={pm.title}
                      subtitle={t(`payment_method_${pm.method_type}`)}
                      onEdit={() => handleEditPaymentMethod(pm)}
                      onDelete={() => deletePaymentMethod(pm)}
                      isDeleting={isDeletingPaymentMethod}
                    />
                  </React.Fragment>
                ))}
              </Card>
            )}
          </View>

          {/* Logout Button */}
          <Button
            title={t('settings_logout')}
            onPress={handleLogout}
            variant="danger"
            fullWidth
            className="mt-4"
          />
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <CurrencySelectorModal
        visible={currencyModal.isVisible}
        onClose={currencyModal.close}
        onSuccess={refetchUser}
      />
      <LanguageSelectorModal
        visible={languageModal.isVisible}
        onClose={languageModal.close}
        onSuccess={refetchUser}
      />
      <CategoryFormModal
        visible={categoryModal.isVisible}
        onClose={categoryModal.close}
        categoryId={categoryModal.data?.categoryId}
        initialTitle={categoryModal.data?.initialTitle}
        initialAmount={categoryModal.data?.initialAmount}
        onSuccess={refetchCategories}
      />
      <PaymentMethodFormModal
        visible={paymentMethodModal.isVisible}
        onClose={paymentMethodModal.close}
        paymentMethodId={paymentMethodModal.data?.paymentMethodId}
        initialTitle={paymentMethodModal.data?.initialTitle}
        initialMethodType={paymentMethodModal.data?.initialMethodType}
        onSuccess={refetchPaymentMethods}
      />
    </AppLayout>
  );
}

// Sub-components
interface SettingsRowProps {
  label: string;
  value?: string;
  onPress: () => void;
}

const SettingsRow = React.memo(function SettingsRow({
  label,
  value,
  onPress,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 active:bg-neutral-50"
    >
      <Text className="text-base text-neutral-900">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-base text-neutral-500">{value}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
      </View>
    </TouchableOpacity>
  );
});

interface ItemRowProps {
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const ItemRow = React.memo(function ItemRow({
  title,
  subtitle,
  onEdit,
  onDelete,
  isDeleting,
}: ItemRowProps) {
  return (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-1">
        <Text className="text-base font-medium text-neutral-900">{title}</Text>
        {subtitle && <Text className="text-sm text-neutral-500 mt-0.5">{subtitle}</Text>}
      </View>
      <View className="flex-row gap-2">
        {isDeleting ? (
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
        ) : (
          <>
            <TouchableOpacity
              onPress={onEdit}
              className="p-2.5 rounded-lg bg-neutral-100 border border-neutral-200 active:bg-neutral-200"
            >
              <Ionicons name="pencil" size={16} color={colors.neutral[600]} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="p-2.5 rounded-lg bg-red-50 border border-red-100 active:bg-red-100"
            >
              <Ionicons name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});
