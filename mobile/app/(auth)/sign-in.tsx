import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/splash-icon-light.png';
import { AppleSignInButton } from '@/components/forms/AppleSignInButton';
import { GoogleSignInButton, LineSignInButton } from '@/components/forms/SocialSignInButton';
import { FormTextInput } from '@/components/forms/FormTextInput';
import { createSignInSchema, type signInData } from '@/components/forms/schemas/auth';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button, Divider } from '@/components/ui';
import { colors } from '@/theme/colors';
import { logger } from '@/lib/logger';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSignInSchema(t)),
  });

  const onSignInPress = useCallback(
    async (data: signInData) => {
      setApiError('');
      if (!isLoaded || loading) return;

      setLoading(true);
      try {
        const signInAttempt = await signIn.create({
          identifier: data.emailAddress,
          password: data.password,
        });
        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });
          router.replace('/');
        } else {
          setApiError(t('auth.error.additional_steps', 'Additional steps are required for sign-in.'));
          logger.warn('Sign-in requires additional steps', {
            context: 'SignIn',
            data: { status: signInAttempt.status },
          });
        }
      } catch (err) {
        setApiError(t('auth.error.invalid_credentials', 'Sign-in failed: Invalid credentials or network error'));
        logger.error(err as Error, { context: 'SignIn' });
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signIn, setActive, router, t],
  );

  return (
    <AuthLayout>
      <View className="absolute inset-0 bg-white" />
      <SafeAreaView className="flex-1 px-6">
        <KeyboardAwareScrollView
          bottomOffset={60}
          disableScrollOnKeyboardHide={true}
          style={{ flex: 1, width: '100%' }}
        >
          {/* Header */}
          <View className="flex-row items-center relative py-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-0 z-10 p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-2xl font-semibold text-neutral-900">
              {t('auth_sign_in_welcome_back')}
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 w-full gap-6 mt-4">
            <Image
              source={Logo}
              contentFit="contain"
              style={{ width: 100, aspectRatio: 1, alignSelf: 'center', marginVertical: 16 }}
            />

            {/* Social Sign In Options */}
            <View className="gap-3">
              {Platform.OS === 'ios' && <AppleSignInButton mode="sign-in" />}
              <GoogleSignInButton mode="sign-in" />
              <LineSignInButton mode="sign-in" />
            </View>

            <Divider label={t('common_or', 'or')} />

            {/* Email/Password Form */}
            <View className="gap-4">
              <FormTextInput
                control={control}
                name="emailAddress"
                labelKey="common_email_address"
                placeholderKey="common_email_address_prompt"
                keyboardType="email-address"
                autoCapitalize="none"
                loading={loading}
                errors={errors}
                colors={colors}
                t={t}
              />
              <FormTextInput
                control={control}
                name="password"
                labelKey="common_password"
                placeholderKey="common_password_prompt"
                secureTextEntry={true}
                loading={loading}
                errors={errors}
                colors={colors}
                t={t}
              />

              {/* API error */}
              {!!apiError && (
                <Text className="text-error text-sm">{apiError}</Text>
              )}

              <Button
                title={t('common_continue')}
                onPress={handleSubmit(onSignInPress)}
                loading={loading}
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2"
              />
            </View>

            {/* Sign up link */}
            <View className="items-center mt-4">
              <Text className="text-neutral-500">
                {t('auth_sign_in_no_account')}{' '}
                <Link href="/sign-up" className="text-neutral-900 font-semibold underline">
                  {t('auth_sign_up')}
                </Link>
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </AuthLayout>
  );
}
