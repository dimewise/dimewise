import { supabase } from "@/lib/supabase";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  OAuthResponse,
  Provider,
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";

/*
 * Supabase API calls for Authentication
 */

export const signInWithPassword = createAsyncThunk<
  AuthTokenResponsePassword,
  SignInWithPasswordCredentials,
  { rejectValue: AuthError | null }
>("auth/signInWithPassword", async (form, { rejectWithValue }) => {
  try {
    const res = await supabase.auth.signInWithPassword(form);
    if (res.error) throw res.error;
    return res;
  } catch (error) {
    return rejectWithValue(error as AuthError);
  }
});

export const signInWithOAuth = createAsyncThunk<
  OAuthResponse,
  Provider,
  { rejectValue: AuthError | null }
>("auth/signInWithOAuth", async (provider, { rejectWithValue }) => {
  try {
    const opts: SignInWithOAuthCredentials = {
      provider,
      options: { redirectTo: "" },
    };
    const res = await supabase.auth.signInWithOAuth(opts);
    if (res.error) throw res.error;
    return res;
  } catch (error) {
    return rejectWithValue(error as AuthError);
  }
});

export const signUpWithPassword = createAsyncThunk<
  AuthResponse,
  SignUpWithPasswordCredentials,
  { rejectValue: AuthError | null }
>("auth/signUpWithPassword", async (form, { rejectWithValue }) => {
  try {
    const res = await supabase.auth.signUp(form);
    if (res.error) throw res.error;
    return res;
  } catch (error) {
    return rejectWithValue(error as AuthError);
  }
});

export const signOut = createAsyncThunk<
  null,
  void,
  { rejectValue: AuthError | null }
>("auth/signOut", async (_, { rejectWithValue }) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return null;
  } catch (error) {
    return rejectWithValue(error as AuthError);
  }
});
