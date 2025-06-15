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
import { CurrencyProvider } from '../utils/CurrencyContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const { LightTheme, DarkTheme: NavigationDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});

// Custom DimeWise Finance Theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary: Trust-worthy blue for main actions
    primary: '#1B5E20', // Deep forest green for financial growth
    primaryContainer: '#C8E6C9', // Light green container
    // Secondary: Professional blue for secondary actions  
    secondary: '#1565C0', // Professional blue
    secondaryContainer: '#E3F2FD', // Light blue container
    // Tertiary: Warning amber for budget alerts
    tertiary: '#E65100', // Warning orange for over-budget
    tertiaryContainer: '#FFE0B2', // Light orange container
    // Surfaces
    surface: '#FAFAFA', // Clean light surface
    surfaceVariant: '#F5F5F5', // Slightly darker surface
    background: '#FFFFFF', // Pure white background
    // Error colors for over-budget scenarios
    error: '#D32F2F', // Strong red for errors/over-budget
    errorContainer: '#FFEBEE', // Light red container
    // Success green for positive financial states
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1B5E20',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#0D47A1',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#BF360C',
    onSurface: '#212121',
    onSurfaceVariant: '#424242',
    onBackground: '#212121',
    onError: '#FFFFFF',
    onErrorContainer: '#B71C1C',
    outline: '#BDBDBD',
    outlineVariant: '#E0E0E0',
    inverseSurface: '#303030',
    inverseOnSurface: '#F5F5F5',
    inversePrimary: '#81C784',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#1B5E20',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary: Softer green for dark mode
    primary: '#81C784', // Light green for dark mode
    primaryContainer: '#2E7D32', // Darker green container
    // Secondary: Calming blue for dark mode
    secondary: '#64B5F6', // Light blue for dark mode  
    secondaryContainer: '#1976D2', // Darker blue container
    // Tertiary: Softer warning for dark mode
    tertiary: '#FFB74D', // Softer orange for dark mode
    tertiaryContainer: '#F57C00', // Darker orange container
    // Dark surfaces
    surface: '#1E1E1E', // Dark surface
    surfaceVariant: '#2D2D2D', // Darker variant
    background: '#121212', // Material dark background
    // Error colors
    error: '#FF5252', // Softer red for dark mode
    errorContainer: '#B71C1C', // Dark red container
    // On colors for dark theme
    onPrimary: '#1B5E20',
    onPrimaryContainer: '#C8E6C9',
    onSecondary: '#0D47A1',
    onSecondaryContainer: '#E3F2FD',
    onTertiary: '#BF360C',
    onTertiaryContainer: '#FFE0B2',
    onSurface: '#E0E0E0',
    onSurfaceVariant: '#BDBDBD',
    onBackground: '#E0E0E0',
    onError: '#FFEBEE',
    onErrorContainer: '#FFCDD2',
    outline: '#616161',
    outlineVariant: '#424242',
    inverseSurface: '#E0E0E0',
    inverseOnSurface: '#212121',
    inversePrimary: '#1B5E20',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#81C784',
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
              <CurrencyProvider>
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
              </CurrencyProvider>
            </DatabaseProvider>
          </ThemeProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
} 