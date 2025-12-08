import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { isAppleSignInAvailable } from '@/lib/auth/apple';
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

  useEffect(() => {
    // Only check availability on iOS
    if (Platform.OS === 'ios') {
      isAppleSignInAvailable().then(setIsAvailable);
    }
  }, []);

  const handlePress = useCallback(async () => {
    if (!signIn || !signUp) return;

    setIsLoading(true);

    try {
      // Start the Apple OAuth flow with Clerk
      const { createdSessionId, setActive } = await signIn.create({
        strategy: 'oauth_apple',
      });

      if (createdSessionId) {
        await setSignInActive({ session: createdSessionId });
        logger.info('Apple Sign-In successful via Clerk', {
          context: 'AppleSignInButton',
        });
        onSuccess?.();
        router.replace('/(app)/(tabs)');
      }
    } catch (signInError: any) {
      logger.debug('Sign in failed, attempting sign up', {
        context: 'AppleSignInButton',
        data: { code: signInError?.errors?.[0]?.code },
      });

      // If user doesn't exist, try signing up
      if (signInError?.errors?.[0]?.code === 'form_identifier_not_found') {
        try {
          const { createdSessionId } = await signUp.create({
            strategy: 'oauth_apple',
          });

          if (createdSessionId) {
            await setSignUpActive({ session: createdSessionId });
            logger.info('Apple Sign-Up successful via Clerk', {
              context: 'AppleSignInButton',
            });
            onSuccess?.();
            router.replace('/(onboarding)/finish');
          }
        } catch (signUpError: any) {
          logger.error(signUpError, { context: 'AppleSignInButton' });
          onError?.(signUpError);
        }
      } else {
        logger.error(signInError, { context: 'AppleSignInButton' });
        onError?.(signInError);
      }
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
            {mode === 'sign-in' ? 'Sign in with Apple' : 'Sign up with Apple'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
});
