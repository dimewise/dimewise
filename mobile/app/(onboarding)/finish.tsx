import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@//theme/colors';
import { AppLayout } from '@/components/layouts/AppLayout';
import { CurrencyPickerModal } from '@/components/onboarding/CurrencyPickerModal';
import { LanguagePickerModal } from '@/components/onboarding/LanguagePickerModal';
import {
  type CurrencyType,
  type SupportedLanguage,
  usePostUsersMeMutation,
} from '@/generated/api/api';
import { postMeUserBody } from '@/generated/types/users/users.zod';

type Form = { currency: CurrencyType; preferred_language: SupportedLanguage };

export default function FinishScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
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

  const openCurrency = () => setShowCurrencyPicker(true);
  const openLanguage = () => setShowLanguagePicker(true);

  return (
    <AppLayout>
      <SafeAreaView
        className="flex-1 w-full px-6 justify-center gap-4"
        edges={['top']}
      >
        <Text className="text-2xl font-bold mb-12 text-neutral-900 text-center">
          {t('finish_title')}
        </Text>

        {/* Currency Field */}
        <View className="gap-2">
          <Text className="text-base font-semibold mb-1 text-neutral-900">
            {t('finish_currency_label')}
          </Text>
          <Text className="text-sm font-medium mb-1 text-neutral-500">
            {t('finish_currency_helper')}
          </Text>
          <Pressable
            onPress={openCurrency}
            className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 active:bg-neutral-100"
          >
            <Text className="text-neutral-900">{currency}</Text>
          </Pressable>
          {errors.currency && (
            <Text className="text-red-500 text-xs">{errors.currency.message}</Text>
          )}
        </View>

        {/* Language Field */}
        <View className="gap-2">
          <Text className="text-base font-semibold mb-1 text-neutral-900">
            {t('finish_language_label')}
          </Text>
          <Text className="text-sm text-neutral-500 mb-1">
            {t('finish_language_helper')}
          </Text>
          <Text className="text-xs text-amber-600 mb-2">
            {t('finish_language_warning')}
          </Text>
          <Pressable
            onPress={openLanguage}
            className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 active:bg-neutral-100"
          >
            <Text className="text-neutral-900">
              {language === 'en' ? 'English' : '日本語'}
            </Text>
          </Pressable>
          {errors.preferred_language && (
            <Text className="text-red-500 text-xs">
              {errors.preferred_language.message}
            </Text>
          )}
        </View>

        <Pressable
          onPress={onFinish}
          disabled={isLoading}
          className={`mt-2 p-4 rounded-xl items-center flex-row justify-center ${isLoading ? 'bg-neutral-300' : 'bg-primary-500 active:bg-primary-600'}`}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.neutral[0]}
            />
          ) : (
            <Text className="text-base font-semibold text-white">{t('finish_cta')}</Text>
          )}
        </Pressable>
      </SafeAreaView>

      <CurrencyPickerModal
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        selected={currency}
        onChange={(v) => setValue('currency', v as CurrencyType, { shouldValidate: true })}
      />
      <LanguagePickerModal
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        selected={language}
        onChange={(v) =>
          setValue('preferred_language', v as SupportedLanguage, { shouldValidate: true })
        }
      />
    </AppLayout>
  );
}
