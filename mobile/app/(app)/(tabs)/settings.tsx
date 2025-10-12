import { useClerk } from '@clerk/clerk-expo';
import Octicons from '@expo/vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocales } from 'expo-localization';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import { SingleSelectPicker, type SingleSelectPickerRef } from '@/components/SingleSelectPicker';
import {
  CreateCategorySheet,
  type CreateCategorySheetRef,
} from '@/components/settings/CreateCategorySheet';
import {
  type CategoryCreate,
  type CurrencyType,
  type PaymentMethodCreate,
  type SupportedLanguage,
  useGetCategoriesQuery,
  useGetPaymentMethodsQuery,
  useGetUsersMeQuery,
  usePostCategoriesMutation,
  usePostPaymentMethodsMutation,
  usePutUsersMeMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { CURRENCIES } from '@/utils/constants';
import { formatCurrency } from '@/utils/localization/currencies';

type RootStackParamList = { Login: undefined };

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut } = useClerk();
  const { data: cats } = useGetCategoriesQuery({ includeDeleted: false });
  const { data: pms } = useGetPaymentMethodsQuery({ includeDeleted: false });
  const { data: user } = useGetUsersMeQuery();

  const [updateUser] = usePutUsersMeMutation();
  const [createCategory] = usePostCategoriesMutation();
  const [createPaymentMethod] = usePostPaymentMethodsMutation();
  const [isLoading, setIsLoading] = useState(false);
  const locales = useLocales();
  const primary = locales[0];

  const currencyPickerRef = useRef<SingleSelectPickerRef>(null);
  const languagePickerRef = useRef<SingleSelectPickerRef>(null);
  const categorySheetRef = useRef<CreateCategorySheetRef>(null);
  const paymentSheetRef = useRef<CreateCategorySheetRef>(null);

  const onChangeCurrency = (c: CurrencyType) => {
    setIsLoading(true);
    if (!user) return;
    updateUser({ userUpdate: { currency: c, preferred_language: user.preferred_language } }).then(
      () => setIsLoading(false),
    );
  };
  const onChangeLanguage = (l: SupportedLanguage) => {
    setIsLoading(true);
    if (!user) return;
    updateUser({ userUpdate: { currency: user.currency, preferred_language: l } }).then(() =>
      setIsLoading(false),
    );
  };
  const onCreateCategory = async (body: CategoryCreate) => {
    setIsLoading(true);
    await createCategory({ categoryCreate: body })
      .unwrap()
      .then(() => setIsLoading(false));
  };
  const onCreatePaymentMethod = async (body: PaymentMethodCreate) => {
    setIsLoading(true);
    await createPaymentMethod({ paymentMethodCreate: body })
      .unwrap()
      .then(() => setIsLoading(false));
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
        title: 'Categories & Budgets',
        data: cats ?? [],
        action: () => categorySheetRef.current?.open(),
      },
      {
        title: 'Payment Methods',
        data: pms ?? [],
        action: () => categorySheetRef.current?.open(),
      },
    ],
    [cats, pms],
  );

  const currencyRow = (
    <Pressable
      onPress={() => currencyPickerRef.current?.open()}
      style={styles.row}
    >
      <Text style={styles.rowLabel}>{t('settings_currency')}</Text>
      <Text style={styles.rowValue}>{user?.currency}</Text>
    </Pressable>
  );

  const languageRow = (
    <Pressable
      onPress={() => languagePickerRef.current?.open()}
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
            Settings
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
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
                  {sec.title}
                </Text>
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
                    Add
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
                    {sec.title.includes('Categories')
                      ? 'No categories yet'
                      : 'No payment methods yet'}
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
                      <Text style={{ color: colors.textPrimary }}>{item.title}</Text>
                      {sec.title.includes('Categories') && (
                        <Text style={{ color: colors.disabled, fontSize: 12 }}>
                          {formatCurrency(item.amount, item.currency, primary.languageTag)}
                        </Text>
                      )}
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
            <Text style={{ color: colors.error, fontWeight: '600' }}>Log out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <SingleSelectPicker
        ref={currencyPickerRef}
        items={CURRENCIES.map((c) => ({ label: c, value: c }))}
        selected={user?.currency ?? 'USD'}
        onChange={onChangeCurrency}
        title={t('settings_select_currency')}
        loading={isLoading}
      />
      <SingleSelectPicker
        ref={languagePickerRef}
        items={[
          { label: t('lang_en'), value: 'en' },
          { label: t('lang_ja'), value: 'ja' },
        ]}
        selected={user?.preferred_language ?? 'en'}
        onChange={onChangeLanguage}
        title={t('settings_select_language')}
        loading={isLoading}
      />
      <CreateCategorySheet
        ref={categorySheetRef}
        onSubmit={onCreateCategory}
      />
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
});
