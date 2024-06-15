import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { signIn, signOut } from "./actions";
import type { AuthState, SetSessionPayload } from "./types";

const initialState: AuthState = {
	session: null,
	loading: false,
	error: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setSession: (state, action: PayloadAction<SetSessionPayload>) => ({
			...state,
			session: action.payload.session,
		}),
	},
	extraReducers: (builder) => {
		// signIn
		builder.addCase(signIn.pending, (state) => ({
			...state,
			loading: true,
		}));
		builder.addCase(signIn.fulfilled, (state, action) => ({
			...state,
			loading: false,
			session: action.payload,
		}));
		builder.addCase(signIn.rejected, (state, action) => ({
			...state,
			loading: false,
			session: null,
			error: action.payload,
		}));

		// signOut
		builder.addCase(signOut.pending, (state) => ({
			...state,
			loading: true,
		}));
		builder.addCase(signOut.fulfilled, (state) => ({
			...state,
			loading: false,
			session: null,
			error: null,
		}));
		builder.addCase(signOut.rejected, (state, action) => ({
			...state,
			loading: false,
			error: action.payload,
		}));
	},
});
