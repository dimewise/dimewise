import { useSignInWithApple } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Text, TouchableOpacity } from 'react-native';
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
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Only check availability on iOS
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAvailable);
    }
  }, []);

  const handlePress = useCallback(async () => {
    setIsLoading(true);

    try {
      // Use Clerk's native Apple Sign-In hook
      // This handles both sign-in and sign-up automatically
      const { createdSessionId, setActive } = await startAppleAuthenticationFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        logger.info('Apple Sign-In successful (native)', { context: 'AppleSignInButton' });
        onSuccess?.();
        // Navigate to app - layout will handle onboarding redirect if needed
        router.replace('/(app)');
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Handle user cancellation gracefully
      if (
        err.code === 'ERR_REQUEST_CANCELED' ||
        err.code === 'ERR_CANCELED' ||
        err.message?.includes('cancelled') ||
        err.message?.includes('canceled')
      ) {
        logger.debug('Apple Sign-In cancelled by user', { context: 'AppleSignInButton' });
        return;
      }

      logger.error(error instanceof Error ? error : String(error), {
        context: 'AppleSignInButton',
      });
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [startAppleAuthenticationFlow, onSuccess, onError, router]);

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
        'flex-row items-center justify-center w-full py-3.5 px-6 rounded-xl bg-white border border-neutral-300',
        isLoading && 'opacity-70',
        className,
      )}
    >
      {isLoading ? (
        <ActivityIndicator
          color="#000"
          size="small"
        />
      ) : (
        <>
          <Ionicons
            name="logo-apple"
            size={20}
            color="#000"
          />
          <Text className="ml-3 text-base font-semibold text-black">
            {mode === 'sign-in'
              ? t('auth_apple_sign_in', 'Sign in with Apple')
              : t('auth_apple_sign_up', 'Sign up with Apple')}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
});
