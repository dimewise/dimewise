import { persistor, store } from "@/store/store";
import { theme } from "@/style/theme";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { CalendarProvider } from "react-native-calendars";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // TODO: figure out custom font inserts for react native paper
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
        <GestureHandlerRootView>
          <CalendarProvider
            date={DateTime.now().toFormat("yyyy-MM-dd")}
            showTodayButton
            theme={{
              todayButtonTextColor: theme.colors.primary,
            }}
          >
            <SafeAreaProvider>
              <PaperProvider theme={theme}>
                <Slot />
                <StatusBar style="auto" />
              </PaperProvider>
            </SafeAreaProvider>
          </CalendarProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
