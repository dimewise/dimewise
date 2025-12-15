import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useGetUsersMeQuery } from '@/generated/api/api';
import { syncLanguageWithUser } from '@/utils/localization/i18n';

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetUsersMeQuery(undefined, {
    skip: !isSignedIn,
  });

  // Debug logging for physical device troubleshooting
  useEffect(() => {
    console.log('[AppLayout] Auth state:', { isLoaded, isSignedIn });
    console.log('[AppLayout] User query state:', { isLoading, hasUser: !!user, hasError: !!error });
  }, [isLoaded, isSignedIn, isLoading, user, error]);

  // Sync i18n language with user's preferred language
  useEffect(() => {
    if (user?.preferred_language) {
      syncLanguageWithUser(user.preferred_language);
    }
  }, [user?.preferred_language]);

  // Wait for Clerk to finish loading
  if (!isLoaded) {
    console.log('[AppLayout] Waiting for Clerk to load...');
    return <LoadingScreen />;
  }

  // Handle auth state
  if (!isSignedIn) {
    console.log('[AppLayout] User not signed in, redirecting to welcome');
    return <Redirect href="/welcome" />;
  }

  // Handle loading state
  if (isLoading) {
    console.log('[AppLayout] Loading user data...');
    return <LoadingScreen />;
  }

  // Handle error state
  if (error) {
    // If user is not found in backend (401), redirect to onboarding to create them
    if ('originalStatus' in error && error.originalStatus === 401) {
      console.log('[AppLayout] User not found in backend, redirecting to onboarding');
      return <Redirect href="/(onboarding)/finish" />;
    }

    // Log actual errors
    console.error('[AppLayout] Error loading user data:', error);

    return (
      <View className="flex-1 justify-center items-center bg-neutral-950 p-6">
        <Text className="text-xl font-semibold text-neutral-100 mb-2">
          Failed to load user data
        </Text>
        <Text className="text-sm text-neutral-400 text-center mb-6">
          {error && 'data' in error
            ? String(error.data)
            : 'Network error. Please check your connection.'}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-base font-semibold text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

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
