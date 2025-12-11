import * as AppleAuthentication from 'expo-apple-authentication';
import { logger } from '@/lib/logger';

export interface AppleAuthResult {
  identityToken: string;
  user: string;
  email: string | null;
  fullName: {
    givenName: string | null;
    familyName: string | null;
  } | null;
}

/**
 * Check if Apple Sign-In is available on this device
 */
export const isAppleSignInAvailable = async (): Promise<boolean> => {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    logger.error(error as Error, {
      context: 'AppleAuth',
      data: { method: 'isAvailable' },
    });
    return false;
  }
};

/**
 * Initiate Apple Sign-In flow
 */
export const signInWithApple = async (): Promise<AppleAuthResult | null> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    logger.info('Apple Sign-In successful', {
      context: 'AppleAuth',
      data: { user: credential.user },
    });

    return {
      identityToken: credential.identityToken,
      user: credential.user,
      email: credential.email,
      fullName: credential.fullName
        ? {
            givenName: credential.fullName.givenName,
            familyName: credential.fullName.familyName,
          }
        : null,
    };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'ERR_REQUEST_CANCELED') {
      logger.info('Apple Sign-In cancelled by user', { context: 'AppleAuth' });
      return null;
    }

    logger.error(error instanceof Error ? error : String(error), {
      context: 'AppleAuth',
      data: { code: err.code },
    });
    throw error;
  }
};
