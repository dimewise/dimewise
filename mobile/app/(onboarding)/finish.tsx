import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@//theme/colors';
import { AppLayout } from '@/components/layouts/AppLayout';
import { CurrencyLanguagePicker } from '@/components/onboarding/CurrencyLanguagePicker';
import {
  type CurrencyType,
  type SupportedLanguage,
  usePostUsersMeMutation,
} from '@/generated/api/api';
import { postMeUserBody } from '@/generated/types/users/users.zod';
import { sharedStyles } from '@/theme/stylesheets';
import { CURRENCIES, LANGUAGES } from '@/utils/constants';

type Form = { currency: CurrencyType; preferred_language: SupportedLanguage };

export default function FinishScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const currencyRef = useRef<BottomSheetModal>(null);
  const languageRef = useRef<BottomSheetModal>(null);
  const [update, { isLoading }] = usePostUsersMeMutation();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(postMeUserBody),
    defaultValues: { currency: 'USD', preferred_language: 'en' },
  });

  const currency = watch('currency');
  const language = watch('preferred_language');

  const onFinish = handleSubmit(async (data) => {
    console.log('formData', data);
    await update({ userCreate: data })
      .then((res) => console.log(res))
      .catch((err) => console.error('error from create', err));

    router.replace('/(app)');
  });

  const openCurrency = () => currencyRef.current?.present();
  const openLanguage = () => languageRef.current?.present();

  return (
    <AppLayout>
      <SafeAreaView
        style={{
          flex: 1,
          width: '100%',
          paddingHorizontal: 24,
          justifyContent: 'center',
          gap: 16,
        }}
        edges={['top']}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 48,
            color: colors.textPrimary,
            textAlign: 'center',
          }}
        >
          {t('finish_title')}
        </Text>

        {/* Currency Field */}
        <View style={{ gap: 8 }}>
          <Text
            style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: colors.textPrimary }}
          >
            {t('finish_currency_label')}
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: colors.disabled }}
          >
            {t('finish_currency_helper')}
          </Text>
          <Pressable
            onPress={openCurrency}
            style={{ backgroundColor: colors.backgroundSurface, padding: 16, borderRadius: 8 }}
          >
            <Text style={{ color: colors.textPrimary }}>{currency}</Text>
          </Pressable>
          {errors.currency && (
            <Text style={{ color: colors.error, fontSize: 12 }}>{errors.currency.message}</Text>
          )}
        </View>

        {/* Language Field */}
        <View style={{ gap: 8 }}>
          <Text
            style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: colors.textPrimary }}
          >
            {t('finish_language_label')}
          </Text>
          <Text style={{ fontSize: 14, color: colors.disabled, marginBottom: 4 }}>
            {t('finish_language_helper')}
          </Text>
          <Text style={{ fontSize: 12, color: colors.warning, marginBottom: 8 }}>
            {t('finish_language_warning')}
          </Text>
          <Pressable
            onPress={openLanguage}
            style={{ backgroundColor: colors.backgroundSurface, padding: 16, borderRadius: 8 }}
          >
            <Text style={{ color: colors.textPrimary }}>
              {language === 'en' ? 'English' : '日本語'}
            </Text>
          </Pressable>
          {errors.preferred_language && (
            <Text style={{ color: colors.error, fontSize: 12 }}>
              {errors.preferred_language.message}
            </Text>
          )}
        </View>

        <Pressable
          onPress={onFinish}
          disabled={isLoading}
          style={{
            marginTop: 8,
            padding: 16,
            backgroundColor: isLoading ? colors.disabled : colors.primary,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row', // keeps spinner + text centred
            justifyContent: 'center',
          }}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.white}
            />
          ) : (
            <Text style={sharedStyles.buttonContainedText}>{t('finish_cta')}</Text>
          )}
        </Pressable>
      </SafeAreaView>

      <CurrencyLanguagePicker
        ref={currencyRef}
        items={CURRENCIES}
        selected={currency}
        onChange={(v) => setValue('currency', v as CurrencyType, { shouldValidate: true })}
        title={t('finish_select_currency')}
      />
      <CurrencyLanguagePicker
        ref={languageRef}
        items={LANGUAGES}
        selected={language}
        onChange={(v) =>
          setValue('preferred_language', v as SupportedLanguage, { shouldValidate: true })
        }
        title={t('finish_select_language')}
      />
    </AppLayout>
  );
}
