import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';
import { useGetUsersMeQuery } from '@/generated/api/api';
import { syncLanguageWithUser } from '@/utils/localization/i18n';

export default function RootLayout() {
  const { isSignedIn } = useAuth();
  const { data: user, isLoading } = useGetUsersMeQuery(undefined, { skip: !isSignedIn });

  // Sync i18n language with user's preferred language
  useEffect(() => {
    if (user?.preferred_language) {
      syncLanguageWithUser(user.preferred_language);
    }
  }, [user?.preferred_language]);

  if (!isSignedIn) return <Redirect href="/welcome" />;
  if (isLoading) return null; // or a spinner

  // if user is first time, set to onboard
  if (!user?.currency || !user?.preferred_language) {
    return <Redirect href="/(onboarding)/finish" />;
  }

  // return to app on success
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="modals/transaction-details"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
