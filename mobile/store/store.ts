import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import { apiV1 } from "./api/rtk/server/v1";
import { sessionReducer } from "./slice/session.slice";

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
};

const sessionPersistedReducer = persistReducer(persistConfig, sessionReducer);

export const store = configureStore({
  reducer: {
    [apiV1.reducerPath]: apiV1.reducer,
    session: sessionPersistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiV1.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
