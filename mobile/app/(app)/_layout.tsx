import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useGetUsersMeQuery } from '@/generated/api/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/theme/colors';
import { syncLanguageWithUser } from '@/utils/localization/i18n';

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: user, isLoading, error, refetch } = useGetUsersMeQuery(undefined, {
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
    console.error('[AppLayout] Error loading user data:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Failed to load user data</Text>
        <Text style={styles.errorMessage}>
          {error && 'data' in error
            ? String(error.data)
            : 'Network error. Please check your connection.'}
        </Text>
        <Pressable
          onPress={() => refetch()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
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

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDefault,
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryTextOn,
  },
});
