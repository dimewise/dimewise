import React, { memo, useCallback, useState } from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { logger } from '@/lib/logger';
import { cn } from '@/utils/cn';

// Warm up browser for faster OAuth
WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = 
  | 'oauth_google'
  | 'oauth_facebook'
  | 'oauth_twitter'
  | 'oauth_line'
  | 'oauth_apple'
  | 'oauth_github';

interface ProviderConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

const PROVIDER_CONFIG: Record<SocialProvider, ProviderConfig> = {
  oauth_google: {
    name: 'Google',
    icon: 'logo-google',
    bgColor: 'bg-white border border-neutral-300',
    textColor: 'text-gray-800',
    iconColor: '#4285F4',
  },
  oauth_facebook: {
    name: 'Facebook',
    icon: 'logo-facebook',
    bgColor: 'bg-[#1877F2]',
    textColor: 'text-white',
    iconColor: '#FFFFFF',
  },
  oauth_twitter: {
    name: 'X',
    icon: 'logo-twitter',
    bgColor: 'bg-black',
    textColor: 'text-white',
    iconColor: '#FFFFFF',
  },
  oauth_line: {
    name: 'LINE',
    icon: 'chatbubble',
    bgColor: 'bg-[#00B900]',
    textColor: 'text-white',
    iconColor: '#FFFFFF',
  },
  oauth_apple: {
    name: 'Apple',
    icon: 'logo-apple',
    bgColor: 'bg-white border border-neutral-300',
    textColor: 'text-black',
    iconColor: '#000000',
  },
  oauth_github: {
    name: 'GitHub',
    icon: 'logo-github',
    bgColor: 'bg-[#24292F]',
    textColor: 'text-white',
    iconColor: '#FFFFFF',
  },
};

interface SocialSignInButtonProps {
  provider: SocialProvider;
  mode?: 'sign-in' | 'sign-up';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const SocialSignInButton = memo(function SocialSignInButton({
  provider,
  mode = 'sign-in',
  onSuccess,
  onError,
  className,
}: SocialSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { t } = useTranslation();
  
  const config = PROVIDER_CONFIG[provider];

  const handlePress = useCallback(async () => {
    setIsLoading(true);

    try {
      // Create the OAuth redirect URL
      const redirectUrl = Linking.createURL('/oauth-callback');

      // Start the SSO flow
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: provider,
        redirectUrl,
      });

      // If we have a session, set it active
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        logger.info(`${config.name} Sign-In successful`, { context: 'SocialSignInButton' });
        onSuccess?.();
        
        // Navigate based on whether it's a new user or existing
        if (signUp?.createdSessionId) {
          router.replace('/(onboarding)/finish');
        } else {
          router.replace('/(app)/(tabs)');
        }
        return;
      }

      // Handle external account verification if needed
      if (signUp?.verifications?.externalAccount?.status === 'unverified') {
        logger.debug('External account needs verification', { context: 'SocialSignInButton' });
      }

    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.code === 'ERR_REQUEST_CANCELED' || 
          error.message?.includes('cancelled') ||
          error.message?.includes('canceled')) {
        logger.debug(`${config.name} Sign-In cancelled by user`, { context: 'SocialSignInButton' });
        return;
      }
      
      logger.error(error, { context: 'SocialSignInButton', data: { provider } });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [provider, startSSOFlow, config.name, onSuccess, onError, router]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.8}
      className={cn(
        'flex-row items-center justify-center w-full py-3.5 px-6 rounded-xl',
        config.bgColor,
        isLoading && 'opacity-70',
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={config.iconColor} size="small" />
      ) : (
        <>
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
          <Text className={cn('ml-3 text-base font-semibold', config.textColor)}>
            {mode === 'sign-in'
              ? t('auth_social_sign_in', { provider: config.name, defaultValue: `Sign in with ${config.name}` })
              : t('auth_social_sign_up', { provider: config.name, defaultValue: `Sign up with ${config.name}` })
            }
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
});

// Convenience components for each provider
export const GoogleSignInButton = memo((props: Omit<SocialSignInButtonProps, 'provider'>) => (
  <SocialSignInButton provider="oauth_google" {...props} />
));

export const FacebookSignInButton = memo((props: Omit<SocialSignInButtonProps, 'provider'>) => (
  <SocialSignInButton provider="oauth_facebook" {...props} />
));

export const TwitterSignInButton = memo((props: Omit<SocialSignInButtonProps, 'provider'>) => (
  <SocialSignInButton provider="oauth_twitter" {...props} />
));

export const LineSignInButton = memo((props: Omit<SocialSignInButtonProps, 'provider'>) => (
  <SocialSignInButton provider="oauth_line" {...props} />
));

export const GitHubSignInButton = memo((props: Omit<SocialSignInButtonProps, 'provider'>) => (
  <SocialSignInButton provider="oauth_github" {...props} />
));
