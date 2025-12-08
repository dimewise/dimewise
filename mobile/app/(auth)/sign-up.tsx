import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/splash-icon-light.png';
import { AppleSignInButton } from '@/components/forms/AppleSignInButton';
import { FormTextInput } from '@/components/forms/FormTextInput';
import {
  createSignUpSchema,
  createVerificationSchema,
  type signUpData,
  type verificationData,
} from '@/components/forms/schemas/auth';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button, Card, Divider } from '@/components/ui';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { colors } from '@/theme/colors';
import { logger } from '@/lib/logger';

// handle any pending authentication session
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  useWarmUpBrowser();

  const { isLoaded, signUp, setActive } = useSignUp();
  const { t } = useTranslation();
  const router = useRouter();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form for email and password
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSignUpSchema(t)),
  });

  // Form for verification code
  const {
    control: codeControl,
    handleSubmit: handleVerifySubmit,
    formState: { errors: codeErrors },
  } = useForm({
    resolver: zodResolver(createVerificationSchema(t)),
  });

  // Sign-up submission handler
  const onSignUpPress = useCallback(
    async (data: signUpData) => {
      setApiError('');
      if (!isLoaded || loading) return;

      setLoading(true);
      try {
        await signUp.create({
          emailAddress: data.emailAddress,
          password: data.password,
        });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } catch (err) {
        setApiError(t('auth.error.create_account', 'Failed to create account or send verification email'));
        logger.error(err as Error, { context: 'SignUp' });
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signUp, t],
  );

  // Verification code submission handler
  const onVerifyPress = useCallback(
    async (data: verificationData) => {
      setApiError('');
      if (!isLoaded || loading) return;

      setLoading(true);
      try {
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code: data.code,
        });
        if (signUpAttempt.status === 'complete') {
          await setActive({ session: signUpAttempt.createdSessionId });
          router.replace('/');
        } else {
          setApiError(t('auth.error.additional_verification', 'Additional verification steps required'));
          logger.warn('Sign-up requires additional verification', {
            context: 'SignUp',
            data: { status: signUpAttempt.status },
          });
        }
      } catch (err) {
        setApiError(t('auth.error.verification_failed', 'Verification failed: Invalid code or network error'));
        logger.error(err as Error, { context: 'SignUp' });
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signUp, setActive, router, t],
  );

  return (
    <AuthLayout>
      <View className="absolute inset-0 bg-background" />
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
            <Text className="flex-1 text-center text-2xl font-semibold text-zinc-50">
              {t('auth_sign_up_create_account')}
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 w-full gap-6 mt-4">
            <Image
              source={Logo}
              contentFit="contain"
              style={{ width: 120, aspectRatio: 1, alignSelf: 'center', marginVertical: 16 }}
            />

            {/* Apple Sign In */}
            <AppleSignInButton mode="sign-up" />

            <Divider label={t('common_or', 'or')} />

            {/* Email & Password Form */}
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

              {!!apiError && (
                <Text className="text-error text-sm">{apiError}</Text>
              )}

              <Button
                title={t('auth_sign_up_create_account')}
                onPress={handleSubmit(onSignUpPress)}
                loading={loading}
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2"
              />
            </View>

            {/* Sign in link */}
            <View className="items-center mt-2">
              <Text className="text-zinc-400">
                {t('auth_sign_up_already_have_an_account')}{' '}
                <Link href="/sign-in" className="text-primary-500 font-semibold underline">
                  {t('auth_sign_in')}
                </Link>
              </Text>
            </View>

            {/* Terms and privacy */}
            <View className="items-center mt-4">
              <Text className="text-zinc-500 text-center text-xs leading-5">
                <Trans
                  i18nKey="auth_sign_up_agreement"
                  components={{
                    terms: (
                      <Link
                        href="/terms-of-service"
                        className="text-primary-500 font-semibold underline"
                      />
                    ),
                    privacy: (
                      <Link
                        href="/privacy-policy"
                        className="text-primary-500 font-semibold underline"
                      />
                    ),
                  }}
                />
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Verification Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={pendingVerification}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <Card className="w-full" padding="lg">
              <Text className="text-2xl font-semibold text-zinc-50 mb-6">
                {t('auth_sign_up_verify_your_email')}
              </Text>
              <FormTextInput
                control={codeControl}
                name="code"
                labelKey="common_verification_code"
                placeholderKey="common_verification_code_prompt"
                loading={loading}
                errors={codeErrors}
                colors={colors}
                t={t}
              />
              {!!apiError && (
                <Text className="text-error text-sm mt-2">{apiError}</Text>
              )}
              <Button
                title={t('common_verify')}
                onPress={handleVerifySubmit(onVerifyPress)}
                loading={loading}
                variant="primary"
                size="lg"
                fullWidth
                className="mt-6"
              />
            </Card>
          </View>
        </Modal>
      </SafeAreaView>
    </AuthLayout>
  );
}
