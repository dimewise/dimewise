import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";
import { signInWithPassword, signOut } from "../api/supabase-auth";

interface SessionInterface {
  session: Session | null;
  loading: boolean;
}

const initialState: SessionInterface = {
  session: null,
  loading: false,
};

type SetSessionPayload = {
  session: Session | null;
};

// Slice for auth state management
const sessionSlice = createSlice({
  name: "session",
  initialState: initialState,
  reducers: {
    setSession: (state, action: PayloadAction<SetSessionPayload>) => ({
      ...state,
      session: action.payload.session,
    }),
  },
  extraReducers: (builder) => {
    // sign in with password
    builder.addCase(signInWithPassword.pending, (state) => ({
      ...state,
      loading: true,
    }));
    builder.addCase(signInWithPassword.fulfilled, (state, action) => ({
      ...state,
      loading: false,
      session: action.payload.data.session,
    }));
    builder.addCase(signInWithPassword.rejected, (state) => ({
      ...state,
      loading: false,
      session: null,
    }));

    // TODO: add socials login

    // sign out
    builder.addCase(signOut.pending, (state) => ({
      ...state,
      loading: true,
    }));
    builder.addCase(signOut.fulfilled, (state) => ({
      ...state,
      loading: false,
      session: null,
    }));
    builder.addCase(signOut.rejected, (state) => ({
      ...state,
      loading: false,
    }));
  },
});

export const sessionName = sessionSlice.name;
export const sessionReducer = sessionSlice.reducer;
