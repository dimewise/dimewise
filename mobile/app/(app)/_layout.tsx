import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useGetUsersMeQuery } from '@/generated/api/api';

export default function RootLayout() {
  const { isSignedIn } = useAuth();
  const { data: user, isLoading } = useGetUsersMeQuery(undefined, { skip: !isSignedIn });

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
    </Stack>
  );
}
