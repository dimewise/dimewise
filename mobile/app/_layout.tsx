import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ClerkProvider tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider>
    </Provider>
  );
}
