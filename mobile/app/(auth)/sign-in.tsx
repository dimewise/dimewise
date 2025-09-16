import { useSignIn } from '@clerk/clerk-expo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import Logo from '@/assets/icons/splash-icon-light.png';
import { CoverGradient } from '@/components/CoverGradient';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

const signInSchema = z.object({
  emailAddress: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/\d/, 'Password must include a number'),
});

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
    resolver: zodResolver(signInSchema),
  });

  const onSignInPress = useCallback(
    async (data) => {
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
      <CoverGradient />
      <View
        style={[sharedStyles.authLinearGradient, { backgroundColor: colors.backgroundDefault }]}
      />
      <SafeAreaView style={sharedStyles.safeArea}>
        {/* Header with back button and title */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <TouchableOpacity
            onPress={() => router.push('/welcome')}
            style={{ position: 'absolute', left: 0 }}
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
            {t('auth_login_welcome_back')}
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
              {t('auth_login_or')}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.textPrimary }} />
          </View>

          {/* Email/password sign-in form */}
          <View style={{ flex: 1, gap: 16 }}>
            {/* Email Input */}
            <Controller
              control={control}
              name="emailAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>
                    {t('common_email_address')}
                  </Text>
                  <TextInput
                    style={[sharedStyles.input, errors.emailAddress && sharedStyles.inputError]}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder={t('common_email_address_prompt')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!loading}
                  />
                  {errors.emailAddress && (
                    <Text style={{ color: colors.error }}>{errors.emailAddress.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>
                    {t('common_password')}
                  </Text>
                  <TextInput
                    style={[sharedStyles.input, errors.password && sharedStyles.inputError]}
                    placeholder={t('common_password_prompt')}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!loading}
                  />
                  {errors.password && (
                    <Text style={{ color: colors.error }}>{errors.password.message}</Text>
                  )}
                </View>
              )}
            />

            {/* API error */}
            {!!apiError && <Text style={{ color: colors.error }}>{apiError}</Text>}

            {/* Submit button */}
            <TouchableOpacity
              style={[
                sharedStyles.buttonContained,
                { width: '100%' },
                loading && { backgroundColor: colors.disabled },
              ]}
              onPress={handleSubmit(onSignInPress)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={sharedStyles.buttonContainedText}>{t('common_continue')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom link */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.textPrimary }}>
              {t('auth_login_no_account')}&nbsp;
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
      </SafeAreaView>
    </AuthLayout>
  );
}
