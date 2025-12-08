import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/logger';
import { cn } from '@/utils/cn';

interface AppleSignInButtonProps {
  mode?: 'sign-in' | 'sign-up';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const AppleSignInButton = memo(function AppleSignInButton({
  mode = 'sign-in',
  onSuccess,
  onError,
  className,
}: AppleSignInButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Only check availability on iOS
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAvailable);
    }
  }, []);

  const handlePress = useCallback(async () => {
    if (!signIn || !signUp) return;

    setIsLoading(true);

    try {
      // Get Apple credential using native flow
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!appleCredential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Try signing in with Clerk using the Apple ID token
      try {
        const { createdSessionId } = await signIn.create({
          strategy: 'oauth_apple',
          redirectUrl: 'dimewise://oauth-callback',
        });

        if (createdSessionId) {
          await setSignInActive({ session: createdSessionId });
          logger.info('Apple Sign-In successful', { context: 'AppleSignInButton' });
          onSuccess?.();
          router.replace('/(app)/(tabs)');
          return;
        }
      } catch (signInError: any) {
        // If sign-in fails because user doesn't exist, try sign-up
        if (signInError?.errors?.[0]?.code === 'form_identifier_not_found' ||
            signInError?.errors?.[0]?.code === 'external_account_not_found') {
          logger.debug('User not found, attempting sign up', { context: 'AppleSignInButton' });
          
          const { createdSessionId } = await signUp.create({
            strategy: 'oauth_apple',
            redirectUrl: 'dimewise://oauth-callback',
          });

          if (createdSessionId) {
            await setSignUpActive({ session: createdSessionId });
            logger.info('Apple Sign-Up successful', { context: 'AppleSignInButton' });
            onSuccess?.();
            router.replace('/(onboarding)/finish');
            return;
          }
        }
        throw signInError;
      }
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.code === 'ERR_REQUEST_CANCELED') {
        logger.debug('Apple Sign-In cancelled by user', { context: 'AppleSignInButton' });
        return;
      }
      
      logger.error(error, { context: 'AppleSignInButton' });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [signIn, signUp, setSignInActive, setSignUpActive, onSuccess, onError, router]);

  // Don't render on Android or if not available
  if (Platform.OS !== 'ios' || !isAvailable) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.8}
      className={cn(
        'flex-row items-center justify-center w-full py-3.5 px-6 rounded-xl bg-white',
        isLoading && 'opacity-70',
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator color="#000" size="small" />
      ) : (
        <>
          <Ionicons name="logo-apple" size={20} color="#000" />
          <Text className="ml-3 text-base font-semibold text-black">
            {mode === 'sign-in' 
              ? t('auth_apple_sign_in', 'Sign in with Apple')
              : t('auth_apple_sign_up', 'Sign up with Apple')
            }
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
});
