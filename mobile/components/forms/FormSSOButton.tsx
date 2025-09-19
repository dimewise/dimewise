import { useSSO } from '@clerk/clerk-expo';
import type { OAuthStrategy } from '@clerk/types';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import type { SocialAuthType } from '@/utils/constants';

interface Props {
  social: SocialAuthType;
  action: 'signin' | 'signup';
}
export const FormSSOButton = ({ social, action }: Props) => {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const authStrategy = `oauth_${social}` as OAuthStrategy;
  const [isLoading, setIsLoading] = useState(false);

  const onPress = useCallback(async () => {
    try {
      setIsLoading(true);
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: authStrategy,
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      // If sign in was successful, set the active session
      if (createdSessionId && setActive) {
        setActive({
          session: createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/custom-flows/overview#session-tasks
              console.log(session?.currentTask);
              return;
            }

            router.push('/');
          },
        });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [router, startSSOFlow, authStrategy]);

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        borderColor: colors.textPrimary,
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <FontAwesome5
          name={social}
          size={24}
          color={colors.textPrimary}
        />
      )}
    </TouchableOpacity>
  );
};
