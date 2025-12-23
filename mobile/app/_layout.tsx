import '../global.css';

// TODO: Uncomment when Sentry is configured
// import { initSentry, withSentryErrorBoundary } from '@/lib/sentry';
// initSentry();

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

// TODO: Uncomment when Sentry is configured
// function RootLayout() {

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error(
      'Missing publishable key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Provider store={store}>
        <KeyboardProvider>
          <ClerkProvider
            tokenCache={tokenCache}
            publishableKey={publishableKey}
          >
            <StatusBar
              barStyle={'dark-content'}
              translucent
              backgroundColor="transparent"
            />
            <Slot />
          </ClerkProvider>
        </KeyboardProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

// TODO: Uncomment when Sentry is configured
// export default withSentryErrorBoundary(RootLayout);
