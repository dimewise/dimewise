import { createSlice } from "@reduxjs/toolkit";
import { IsThemeOptions, type ThemeState } from "./type.ts";

const THEME_SLICE_NAME = "theme";
const THEME_STORAGE_KEY = "themeMode";

const initialState: ThemeState = {
	mode: "light",
};

const themeSlice = createSlice({
	name: THEME_SLICE_NAME,
	initialState,
	reducers: {
		setMode(state, action) {
			state.mode = action.payload;
			localStorage.setItem(THEME_STORAGE_KEY, action.payload);
		},
		toggleMode(state) {
			const newMode = state.mode === "dark" ? "light" : "dark";
			state.mode = newMode;
			localStorage.setItem(THEME_STORAGE_KEY, newMode);
		},
		initializeTheme(state) {
			const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
			if (savedMode && IsThemeOptions(savedMode)) {
				state.mode = savedMode;
			} else {
				const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
				state.mode = systemPrefersDark ? "dark" : "light";
			}
		},
	},
});

export const { setMode, toggleMode, initializeTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
