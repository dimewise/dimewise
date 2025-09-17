import { useSignUp } from '@clerk/clerk-expo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/splash-icon-light.png';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { FormTextInput } from '@/components/forms/FormTextInput';
import {
  createSignUpSchema,
  createVerificationSchema,
  type signUpData,
  type verificationData,
} from '@/components/forms/schemas/auth';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

export default function SignUpScreen() {
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
        setApiError('Failed to create account or send verification email');
        console.error(JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signUp],
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
          setApiError('Additional verification steps required');
          console.error(JSON.stringify(signUpAttempt, null, 2));
        }
      } catch (err) {
        setApiError('Verification failed: Invalid code or network error');
        console.error(JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signUp, setActive, router],
  );

  return (
    <AuthLayout>
      <View
        style={[sharedStyles.authLinearGradient, { backgroundColor: colors.backgroundDefault }]}
      />
      <SafeAreaView style={sharedStyles.safeArea}>
        <KeyboardAwareScrollView
          bottomOffset={60}
          disableScrollOnKeyboardHide={true}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ position: 'absolute', left: 0, zIndex: 10 }}
            >
              <FontAwesome5
                name="arrow-left"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: '600',
                color: colors.textPrimary,
              }}
            >
              {t('auth_sign_up_create_account')}
            </Text>
          </View>

          <View style={{ flex: 1, width: '100%', gap: 24 }}>
            <Image
              source={Logo}
              contentFit="contain"
              style={{ width: 150, aspectRatio: 1, alignSelf: 'center', marginVertical: 24 }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {['facebook', 'google', 'apple', 'line'].map((name) => (
                <TouchableOpacity
                  key={name}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 8,
                    borderColor: colors.textPrimary,
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome5
                    name={name}
                    size={24}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.textPrimary }} />
              <Text style={{ marginHorizontal: 8, color: colors.textPrimary }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.textPrimary }} />
            </View>

            <View style={{ flex: 1, gap: 8 }}>
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
                animateView
              />

              {!!apiError && <Text style={{ color: colors.error }}>{apiError}</Text>}

              <FormSubmitButton
                loading={loading}
                onPress={handleSubmit(onSignUpPress)}
                title={t('auth_sign_up_create_account')}
              />
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary }}>
                {t('auth_sign_up_already_have_an_account')}&nbsp;
                <Link
                  href="/sign-in"
                  style={{
                    color: colors.secondary,
                    fontWeight: '600',
                    textDecorationLine: 'underline',
                  }}
                >
                  {t('auth_sign_in')}
                </Link>
              </Text>
            </View>

            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={{ color: colors.textPrimary, textAlign: 'center', fontSize: 12 }}>
                <Trans
                  i18nKey="auth_sign_up_agreement"
                  components={{
                    terms: (
                      <Link
                        href="/terms-of-service"
                        style={{
                          color: colors.secondary,
                          fontWeight: '600',
                          textDecorationLine: 'underline',
                        }}
                      />
                    ),
                    privacy: (
                      <Link
                        href="/privacy-policy"
                        style={{
                          color: colors.secondary,
                          fontWeight: '600',
                          textDecorationLine: 'underline',
                        }}
                      />
                    ),
                  }}
                />
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={pendingVerification}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black overlay
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: '80%', // 80% of the screen width
                backgroundColor: colors.backgroundDefault, // your modal background color
                padding: 20,
                borderRadius: 10, // rounded corners
                elevation: 5, // shadow for Android
                shadowColor: '#000', // shadow for iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  marginBottom: 24,
                  color: colors.textPrimary,
                }}
              >
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
              {!!apiError && <Text style={{ color: colors.error }}>{apiError}</Text>}
              <FormSubmitButton
                loading={loading}
                onPress={handleVerifySubmit(onVerifyPress)}
                title={t('common_verify')}
                style={{ marginTop: 24 }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AuthLayout>
  );
}
