import '../global.css';
import { initSentry, routingInstrumentation, withSentryErrorBoundary } from '@/lib/sentry';

initSentry();

if (__DEV__) {
  require('../ReactotronConfig');
}

import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot, useNavigationContainerRef } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import '../utils/localization/i18n';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default withSentryErrorBoundary(function RootLayout() {
  if (!publishableKey) {
    throw new Error(
      'Missing publishable key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    );
  }

  const ref = useNavigationContainerRef();
  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

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
});

