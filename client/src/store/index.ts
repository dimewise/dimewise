import { configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { apiV1 } from "../services/api/v1";
import { themeReducer } from "./themeSlice";

export const store = configureStore({
	reducer: {
		[apiV1.reducerPath]: apiV1.reducer,
		theme: themeReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiV1.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
