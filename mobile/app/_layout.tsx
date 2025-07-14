import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect, useMemo } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DATABASE_NAME, db, seedInitialData } from '../db/drizzle';
import migrations from '../db/generated/migrations/migrations';
import '../utils/i18n';
import { RefreshKeyProvider } from '../components/contexts/RefreshKeyContext';
import { UserProvider } from '../components/contexts/UserContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { darkTheme, lightTheme } from '../utils/theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  // database
  const { success, error } = useMigrations(db, migrations);

  // theme/colorscheme
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // Add fonts
  });
  const paperTheme = useMemo(
    () => (colorScheme === 'dark' ? darkTheme : lightTheme),
    [colorScheme],
  );

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Seed initial data only once after successful migrations
  useEffect(() => {
    if (success) {
      console.log('Seeding initial data...');
      seedInitialData(db);
      console.log('Initial data seeding completed.');
    }
  }, [success]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Database migration failed</Text>
        <Text>{String(error.message)}</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Root error boundary caught:', error, errorInfo);
        // You can add crash reporting here (Sentry, Crashlytics, etc.)
      }}
    >
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
        >
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <PaperProvider theme={paperTheme}>
                <BottomSheetModalProvider>
                  <UserProvider>
                    <RefreshKeyProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                      <StatusBar
                        style={colorScheme === 'dark' ? 'light' : 'dark'}
                        translucent
                        backgroundColor={paperTheme.colors.surface}
                      />
                    </RefreshKeyProvider>
                  </UserProvider>
                </BottomSheetModalProvider>
              </PaperProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </SQLiteProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
