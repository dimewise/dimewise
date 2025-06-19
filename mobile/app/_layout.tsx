import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DefaultTheme, DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import providers
import { DatabaseProvider } from '../storage/provider';
import { UserSettingsProvider } from '../utils/UserSettingsContext';

// Import i18n configuration (this initializes i18n)
import '../utils/i18n';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const { LightTheme, DarkTheme: NavigationDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});

// Custom DimeWise Finance Theme - Pure Monochrome
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary: Pure black for maximum contrast
    primary: '#000000', // Pure black
    primaryContainer: '#F5F5F5', // Light gray container
    // Secondary: Medium gray (no blue hints)
    secondary: '#6B7280', // Pure medium gray
    secondaryContainer: '#E5E7EB', // Light gray container
    // Tertiary: Only for critical alerts
    tertiary: '#DC2626', // Clean red for errors only
    tertiaryContainer: '#FEF2F2', // Very light red container
    // Surfaces - Pure monochrome
    surface: '#FFFFFF', // Pure white
    surfaceVariant: '#FAFAFA', // Barely-there gray
    background: '#FFFFFF', // Pure white background
    // Error colors - Minimal red
    error: '#DC2626', // Clean red
    errorContainer: '#FEF2F2', // Light red container
    // Text colors - Pure monochrome hierarchy
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#000000',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#374151',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#DC2626',
    onSurface: '#111827', // Near black
    onSurfaceVariant: '#6B7280', // Medium gray
    onBackground: '#111827',
    onError: '#FFFFFF',
    onErrorContainer: '#DC2626',
    outline: '#E5E7EB', // Very light gray border
    outlineVariant: '#F3F4F6', // Even lighter gray border
    inverseSurface: '#111827',
    inverseOnSurface: '#F9FAFB',
    inversePrimary: '#9CA3AF', // Light gray
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#000000',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary: Soft white for dark mode
    primary: '#F5F5F5', // Pure light gray
    primaryContainer: '#2D2D2D', // Pure dark gray container
    // Secondary: Pure neutral grays
    secondary: '#9E9E9E', // Pure medium gray
    secondaryContainer: '#424242', // Pure dark gray
    // Tertiary: Only for critical alerts
    tertiary: '#E53E3E', // Pure red for dark mode
    tertiaryContainer: '#7F1D1D', // Dark red container
    // Dark surfaces - Pure neutral grays (no blue undertones)
    surface: '#1A1A1A', // Pure dark gray (not blue-tinted)
    surfaceVariant: '#2D2D2D', // Slightly lighter pure gray
    background: '#121212', // Pure dark background (Material Design standard)
    // Error colors
    error: '#E53E3E', // Pure red
    errorContainer: '#7F1D1D', // Dark red container
    // Text colors - Pure monochrome
    onPrimary: '#121212', // Dark text on light primary
    onPrimaryContainer: '#E0E0E0', // Light gray text
    onSecondary: '#121212', // Dark text on light secondary
    onSecondaryContainer: '#E0E0E0', // Light gray text
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#FEF2F2',
    onSurface: '#E0E0E0', // Pure light gray (no blue tint)
    onSurfaceVariant: '#9E9E9E', // Pure medium gray
    onBackground: '#E0E0E0', // Pure light gray
    onError: '#FEF2F2',
    onErrorContainer: '#FECACA',
    outline: '#424242', // Pure gray borders
    outlineVariant: '#2D2D2D', // Darker pure gray
    inverseSurface: '#F5F5F5',
    inverseOnSurface: '#121212',
    inversePrimary: '#121212',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#F5F5F5',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const navigationTheme = colorScheme === 'dark' ? NavigationDarkTheme : LightTheme;

  const [loaded] = useFonts({
    // Add any custom fonts here
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <DatabaseProvider>
              <UserSettingsProvider>
                <BottomSheetModalProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                    }}
                  />
                  <StatusBar
                    style={colorScheme === 'dark' ? 'light' : 'dark'}
                    translucent={true}
                    backgroundColor={paperTheme.colors.surface}
                  />
                </BottomSheetModalProvider>
              </UserSettingsProvider>
            </DatabaseProvider>
          </ThemeProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
} 