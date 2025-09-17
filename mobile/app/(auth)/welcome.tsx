import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/splash-icon-light.png';
import { CoverGradient } from '@/components/CoverGradient';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const navigateToSignIn = () => {
    router.push('/sign-in');
  };

  const navigateToSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <AuthLayout>
      <CoverGradient />
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 88 }}>
          <Image
            source={Logo}
            contentFit="contain"
            style={{ width: '60%', aspectRatio: 1 }}
          />
          <Text style={{ fontSize: 32, fontWeight: 700, color: colors.white }}>
            {t('app_name')}
          </Text>
          <Text style={{ fontSize: 18, color: colors.white }}>{t('auth_catchphrase')}</Text>
        </View>
        <View
          style={{
            width: '100%',
            paddingBottom: 48,
            position: 'absolute',
            bottom: 0,
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={[sharedStyles.buttonContained, { width: '100%' }]}
            onPress={navigateToSignUp}
          >
            <Text style={[sharedStyles.buttonContainedText, { color: colors.white }]}>
              {t('auth_get_started')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[sharedStyles.buttonOutlined, { width: '100%' }]}
            onPress={navigateToSignIn}
          >
            <Text style={sharedStyles.buttonOutlinedText}>{t('auth_already_have_an_account')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AuthLayout>
  );
}
