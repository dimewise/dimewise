import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { SignInProps } from "./types";

export const signIn = createAsyncThunk<Session | null, SignInProps, { rejectValue: Error }>(
	"auth/signIn",
	async ({ email, password }, thunkApi) => {
		const { error, data } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			return thunkApi.rejectWithValue(error);
		}

		return data.session;
	},
);

export const signOut = createAsyncThunk<void, void, { rejectValue: Error }>("auth/signOut", async (_, thunkApi) => {
	const { error } = await supabase.auth.signOut();
	if (error) {
		return thunkApi.rejectWithValue(error);
	}
});
