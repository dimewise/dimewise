import { persistor, store } from "@/store/store";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <Slot />
      </PersistGate>
    </Provider>
  );
}
