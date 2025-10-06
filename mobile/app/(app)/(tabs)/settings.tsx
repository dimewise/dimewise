import Octicons from '@expo/vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocales } from 'expo-localization';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import {
  type CurrencyType,
  type SupportedLanguage,
  type User,
  useGetCategoriesQuery,
  useGetPaymentMethodsQuery,
  useGetUsersMeQuery,
  usePostUsersMeMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/localization/currencies';

type RootStackParamList = { Login: undefined };

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: cats } = useGetCategoriesQuery({ includeDeleted: false });
  const { data: pms } = useGetPaymentMethodsQuery({ includeDeleted: false });
  const { data } = useGetUsersMeQuery();
  const [updateUser] = usePostUsersMeMutation();
  const locales = useLocales();
  const primary = locales[0];

  const openAddCategorySheet = () => {};
  const openAddPaymentMethodSheet = () => {};

  /* ---------- handlers ---------- */
  const onChangeCurrency = (c: CurrencyType) => {
    if (!user) return;
    updateUser({ userCreate: { currency: c, preferred_language: user.preferred_language } });
  };

  const onChangeLanguage = (l: SupportedLanguage) => {
    if (!user) return;
    updateUser({ userCreate: { currency: user.currency, preferred_language: l } });
  };

  const onLogout = () => {
    /* clear tokens / reset nav stack */
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  /* ---------- sections ---------- */
  const sections = useMemo(
    () => [
      { title: 'Categories & Budgets', data: cats ?? [] },
      { title: 'Payment Methods', data: pms ?? [] },
    ],
    [cats, pms],
  );

  /* ---------- loading ---------- */
  // if (!user) return null; // or a spinner
  const user: User = { currency: 'JPY', preferred_language: 'ja' };

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
          {/* 1.  Categories & Payment Methods */}
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
                  onPress={() =>
                    sec.title.includes('Categories')
                      ? openAddCategorySheet()
                      : openAddPaymentMethodSheet()
                  }
                >
                  <Octicons
                    name="plus-circle"
                    size={24}
                    color={colors.primary}
                  />
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

          {/* 2.  Default Currency */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 8,
                color: colors.textPrimary,
              }}
            >
              Default Currency
            </Text>
            <View style={{ gap: 8 }}>
              {(['USD', 'EUR', 'JPY'] as CurrencyType[]).map((c) => (
                <Pressable
                  key={c}
                  onPress={() => onChangeCurrency(c)}
                  style={{
                    backgroundColor: colors.backgroundSurface,
                    borderRadius: 8,
                    padding: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.textPrimary }}>{c}</Text>
                  {user.currency === c && (
                    <Octicons
                      name="check"
                      size={16}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* 3.  Default Language */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 8,
                color: colors.textPrimary,
              }}
            >
              Default Language
            </Text>
            <View style={{ gap: 8 }}>
              {[
                { code: 'en' as const, label: 'English' },
                { code: 'ja' as const, label: '日本語' },
              ].map((l) => (
                <Pressable
                  key={l.code}
                  onPress={() => onChangeLanguage(l.code)}
                  style={{
                    backgroundColor: colors.backgroundSurface,
                    borderRadius: 8,
                    padding: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.textPrimary }}>{l.label}</Text>
                  {user.preferred_language === l.code && (
                    <Octicons
                      name="check"
                      size={16}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* 4.  Log Out */}
          <Pressable
            onPress={onLogout}
            style={{
              backgroundColor: colors.error + '20',
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
    </AppLayout>
  );
}
