import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AuthError, Session } from "@supabase/supabase-js";
import { signInWithPassword, signOut } from "../api/supabase-auth";

interface SessionInterface {
  session: Session | null;
  loading: boolean;
  error: AuthError | null | undefined;
}

const initialState: SessionInterface = {
  session: null,
  loading: false,
  error: null,
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
    builder.addCase(signInWithPassword.rejected, (state, action) => ({
      ...state,
      loading: false,
      session: null,
      error: action.payload,
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
      error: null,
    }));
    builder.addCase(signOut.rejected, (state, action) => ({
      ...state,
      loading: false,
      error: action.payload,
    }));
  },
});

export const sessionName = sessionSlice.name;
export const sessionReducer = sessionSlice.reducer;
