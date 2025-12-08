import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/splash-icon-dark.png';
import { AppleSignInButton } from '@/components/forms/AppleSignInButton';
import { GoogleSignInButton, LineSignInButton } from '@/components/forms/SocialSignInButton';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button, Divider } from '@/components/ui';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const navigateToSignIn = useCallback(() => {
    router.push('/sign-in');
  }, [router]);

  const navigateToSignUp = useCallback(() => {
    router.push('/sign-up');
  }, [router]);

  return (
    <AuthLayout>
      <View className="absolute inset-0 bg-white" />
      <SafeAreaView className="flex-1 px-6">
        {/* Logo and branding */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={Logo}
            contentFit="contain"
            style={{ width: '40%', aspectRatio: 1 }}
          />
          <Text className="text-4xl font-light text-neutral-900 mt-6 tracking-tight">
            {t('app_name')}
          </Text>
          <Text className="text-base text-neutral-500 mt-2 text-center">
            {t('auth_catchphrase')}
          </Text>
        </View>

        {/* Auth buttons */}
        <View className="w-full pb-12 gap-3">
          {/* Social Sign In Options */}
          {Platform.OS === 'ios' && <AppleSignInButton mode="sign-up" />}
          <GoogleSignInButton mode="sign-up" />
          <LineSignInButton mode="sign-up" />

          <Divider label={t('common_or', 'or')} />

          <Button
            title={t('auth_get_started')}
            onPress={navigateToSignUp}
            variant="primary"
            size="lg"
            fullWidth
          />

          <Button
            title={t('auth_already_have_an_account')}
            onPress={navigateToSignIn}
            variant="ghost"
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </AuthLayout>
  );
}
