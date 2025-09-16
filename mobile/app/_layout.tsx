import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import '../utils/localization/i18n';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ClerkProvider tokenCache={tokenCache}>
        <StatusBar
          barStyle={'light-content'}
          translucent
        />
        <Slot />
      </ClerkProvider>
    </Provider>
  );
}
