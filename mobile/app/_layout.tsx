import '../global.css';

import { initSentry, withSentryErrorBoundary } from '@/lib/sentry';

// Initialize Sentry early
initSentry();

if (__DEV__) {
  require('../ReactotronConfig');
}

import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import '../utils/localization/i18n';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <KeyboardProvider>
          <ClerkProvider tokenCache={tokenCache}>
            <StatusBar
              barStyle={'light-content'}
              translucent
            />
            <Slot />
          </ClerkProvider>
        </KeyboardProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

// Wrap with Sentry error boundary for crash reporting
export default withSentryErrorBoundary(RootLayout);
