import {
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from "@/store/api/supabase-auth";
import { useAppDispatch } from "@/store/store";
import type {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { useCallback } from "react";
import type { GenericResponse } from "./types";

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const loginWithPassword = useCallback(
    async (
      form: SignInWithPasswordCredentials,
    ): Promise<GenericResponse<AuthTokenResponsePassword, AuthError>> => {
      try {
        const res = await dispatch(signInWithPassword(form)).unwrap();
        return { data: res as AuthTokenResponsePassword, error: null };
      } catch (err) {
        return { data: null, error: err as AuthError };
      }
    },
    [dispatch],
  );

  const register = useCallback(
    async (
      form: SignUpWithPasswordCredentials,
    ): Promise<GenericResponse<AuthResponse, AuthError>> => {
      try {
        const res = await dispatch(signUpWithPassword(form)).unwrap();
        return { data: res as AuthResponse, error: null };
      } catch (err) {
        return { data: null, error: err as AuthError };
      }
    },
    [dispatch],
  );

  const logout = useCallback(async (): Promise<
    GenericResponse<null, AuthError>
  > => {
    try {
      // res here should be null on success
      const res = await dispatch(signOut()).unwrap();
      return { data: res, error: null };
    } catch (err) {
      return { data: null, error: err as AuthError };
    }
  }, [dispatch]);

  return {
    loginWithPassword,
    register,
    logout,
  };
};
