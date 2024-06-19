import type {
	AuthError,
	Session,
	SignInWithPasswordCredentials,
	SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { type ReactNode, createContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/supabase";

interface AuthContextType {
	session: Session | null;
	login: (form: SignInWithPasswordCredentials) => Promise<AuthError | null>;
	logout: () => void;
	register: (form: SignUpWithPasswordCredentials) => Promise<AuthError | null>;
}

export const AuthContext = createContext<AuthContextType>({
	session: null,
	login: async () => null,
	logout: () => {},
	register: async () => null,
});

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

	// supabase auth methods
	const login = async (form: SignInWithPasswordCredentials): Promise<AuthError | null> => {
		const { error } = await supabase.auth.signInWithPassword(form);
		return error;
	};
	const logout = () => {
		supabase.auth.signOut();
	};
	const register = async (form: SignUpWithPasswordCredentials): Promise<AuthError | null> => {
		const { error } = await supabase.auth.signUp(form);
		return error;
	};

	const value = { session, login, logout, register };

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
