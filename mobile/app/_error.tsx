import type { ErrorBoundaryProps } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { SUPPORT_MAIL } from '@/utils/constants';

export default function ErrorPage({ error, retry }: ErrorBoundaryProps) {
  console.error('An unexpected error occured', error);

  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundDefault,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
      }}
    >
      {/* Icon placeholder (unicode lightning bolt) */}
      <Text style={{ fontSize: 64, marginBottom: 16, color: colors.error, fontWeight: 800 }}>
        !
      </Text>

      <Text
        style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.error,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        {t('error_title')}
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 22,
        }}
      >
        {t('error_support').split(SUPPORT_MAIL)[0]}
        <Text
          style={{ color: colors.primaryLight, textDecorationLine: 'underline' }}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_MAIL}`)}
        >
          {SUPPORT_MAIL}
        </Text>
        {t('error_support').split(SUPPORT_MAIL)[1]}
      </Text>

      <Pressable
        onPress={retry}
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.primaryDark : colors.primary,
          paddingHorizontal: 28,
          paddingVertical: 12,
          borderRadius: 24,
          shadowColor: colors.primaryLight,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 5,
        })}
      >
        <Text
          style={{
            color: colors.primaryTextOn,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Try again
        </Text>
      </Pressable>
    </View>
  );
}
