import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
	message: string;
	type: ToastType;
	open: boolean;
}

const initialState: ToastState = {
	message: "",
	type: "success",
	open: false,
};

const toastSlice = createSlice({
	name: "toast",
	initialState,
	reducers: {
		showToast: (state, action: PayloadAction<{ message: string; type: ToastType }>) => {
			state.message = action.payload.message;
			state.type = action.payload.type;
			state.open = true;
		},
		hideToast: (state) => {
			state.open = false;
		},
	},
});

export const { showToast, hideToast } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
