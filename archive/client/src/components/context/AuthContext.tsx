import type {
  AuthError,
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User,
} from "@supabase/supabase-js";
import { type ReactNode, createContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/supabase";
import type { UserCreate } from "../../services/api/v1";
import type { Currencies } from "../../types/currency";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (form: SignInWithPasswordCredentials) => Promise<AuthError | null>;
  logout: () => void;
  register: (
    form: SignUpWithPasswordCredentials,
    defaultCurrency: Currencies,
  ) => Promise<{ userCreate: UserCreate; error: AuthError | null } | null>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  login: async () => null,
  logout: () => {},
  register: async () => null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setAuthData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    setAuthData();

    return () => subscription.unsubscribe();
  }, []);

  // supabase auth methods
  const login = async (form: SignInWithPasswordCredentials): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signInWithPassword(form);
    return error;
  };
  const logout = () => {
    supabase.auth.signOut();
  };
  const register = async (
    form: SignUpWithPasswordCredentials,
    defaultCurrency: Currencies,
  ): Promise<{ userCreate: UserCreate; error: AuthError | null } | null> => {
    const { data, error } = await supabase.auth.signUp(form);
    return {
      userCreate: { id: data.user?.id ?? "", email: data.user?.email ?? "", default_currency: defaultCurrency },
      error,
    };
  };

  const value = { user, session, login, logout, register };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
