import { useSignIn } from '@clerk/clerk-expo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/splash-icon-light.png';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { FormTextInput } from '@/components/forms/FormTextInput';
import { createSignInSchema, type signInData } from '@/components/forms/schemas/auth';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

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
          setApiError('Additional steps are required for sign-in.');
          console.error(JSON.stringify(signInAttempt, null, 2));
        }
      } catch (err) {
        setApiError('Sign-in failed: Invalid credentials or network error');
        console.error(JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signIn, setActive, router],
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
              {t('auth_sign_in_welcome_back')}
            </Text>
          </View>

          <View style={{ flex: 1, width: '100%', gap: 24 }}>
            <Image
              source={Logo}
              contentFit="contain"
              style={{ width: 150, aspectRatio: 1, alignSelf: 'center', marginVertical: 24 }}
            />
            {/* SNS login buttons */}
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

            {/* OR separator */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.textPrimary }} />
              <Text style={{ marginHorizontal: 8, color: colors.textPrimary }}>
                {t('common_or')}
              </Text>
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
                animateView
                t={t}
              />

              {/* API error */}
              {!!apiError && <Text style={{ color: colors.error }}>{apiError}</Text>}

              <FormSubmitButton
                loading={loading}
                onPress={handleSubmit(onSignInPress)}
                title={t('common_continue')}
              />
            </View>

            {/* Bottom link */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary }}>
                {t('auth_sign_in_no_account')}&nbsp;
                <Link
                  href="/sign-up"
                  style={{
                    color: colors.secondary,
                    fontWeight: '600',
                    textDecorationLine: 'underline',
                  }}
                >
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
