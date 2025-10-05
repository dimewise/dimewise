import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import '../utils/localization/i18n';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <ClerkProvider tokenCache={tokenCache}>
              <StatusBar
                barStyle={'light-content'}
                translucent
              />
              <Slot />
            </ClerkProvider>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
