import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "../../types/auth";
import type { User } from "../../types/user";

const initialState: AuthState = {
	user: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login(state, action: PayloadAction<User>) {
			state.user = action.payload;
		},
		logout(state) {
			state.user = null;
		},
	},
});

export const { login, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
