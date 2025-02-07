import { supabase } from "@/lib/supabase";
import { AuthError, AuthResponse, Provider, Session, SignInWithOAuthCredentials, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

export interface SessionContextInterface {
  session: Session | null
  signInWithPassword: (form: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (form: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

export const SessionContext = createContext<SessionContextInterface>({
  session: null,
  signInWithPassword: async () => ({ error: null }),
  signInWithOAuth: async () => ({ error: null }),
  signUpWithPassword: async () => ({
    data: {
      user: null,
      session: null,
    },
    error: null
  }),
  signOut: async () => ({ error: null }),
})

export const useSession = () => {
  const value = useContext(SessionContext)
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider/>')
    }
  }

  return value;
}

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // fetches initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // listen for auth state changes on supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe();
    }
  }, [])

  /*
    * Authentication functions with supabase
    */
  const signInWithPassword = async (form: SignInWithPasswordCredentials) => {
    const { error } = await supabase.auth.signInWithPassword(form)

    return { error }
  }

  const signInWithOAuth = async (provider: Provider) => {
    const opts: SignInWithOAuthCredentials = {
      provider: provider,
      options: {
        redirectTo: "", // TODO: figure out what this is supposed to be
      }
    }
    const { error } = await supabase.auth.signInWithOAuth(opts)

    return { error }
  }

  const signUpWithPassword = async (form: SignUpWithPasswordCredentials) => {
    const res = await supabase.auth.signUp(form);

    return res;
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setSession(null);

    return { error };
  }

  const contextValue: SessionContextInterface = {
    session,
    signInWithPassword,
    signInWithOAuth,
    signUpWithPassword,
    signOut,
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}
