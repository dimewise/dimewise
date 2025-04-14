import { persistor, store } from "@/store/store";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#263455", // dark blue (logo stroke)
    secondary: "#00ef98", // green (logo background)
    background: "#FAFAFA", // soft off-white background
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "NotoSansJP-Black": require("../assets/fonts/NotoSansJP-Black.otf"),
    "NotoSansJP-Bold": require("../assets/fonts/NotoSansJP-Bold.otf"),
    "NotoSansJP-Light": require("../assets/fonts/NotoSansJP-Light.otf"),
    "NotoSansJP-Medium": require("../assets/fonts/NotoSansJP-Medium.otf"),
    "NotoSansJP-Regular": require("../assets/fonts/NotoSansJP-Regular.otf"),
    "NotoSansJP-Thin": require("../assets/fonts/NotoSansJP-Thin.otf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <SafeAreaProvider>
          <PaperProvider>
            <Slot />
            <StatusBar style="auto" />
          </PaperProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
