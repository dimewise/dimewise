import type { Session } from "@supabase/supabase-js";
import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface AuthContextType {
  session: Session | null;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
});

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  // NOTE: redirection to login when session is null is handled in PrivateLayout

  const value = { session };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
