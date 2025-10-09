import { Redirect, Stack } from 'expo-router';
import { useGetUsersMeQuery } from '@/generated/api/api';

export default function OnboardingLayout() {
  const { data: user } = useGetUsersMeQuery();
  if (user?.currency && user?.preferred_language) {
    // user already finished – jump to app
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="finish" />
    </Stack>
  );
}
