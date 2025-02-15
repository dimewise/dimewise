import {
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from "@/store/api/supabase-auth";
import { useAppDispatch } from "@/store/store";
import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { useCallback } from "react";

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const loginWithPassword = useCallback(
    async (form: SignInWithPasswordCredentials) => {
      await dispatch(signInWithPassword(form));
    },
    [dispatch],
  );

  const register = useCallback(
    async (form: SignUpWithPasswordCredentials) => {
      await dispatch(signUpWithPassword(form));
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await dispatch(signOut());
  }, [dispatch]);

  return {
    loginWithPassword,
    register,
    logout,
  };
};
