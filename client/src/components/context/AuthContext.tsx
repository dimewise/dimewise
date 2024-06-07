import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

export interface FakedUser {
	user: string | null;
	signin: () => void;
	signout: () => void;
}

const initialContext: FakedUser = {
	user: null,
	signin: async () => {},
	signout: async () => {},
};

const AuthContext = createContext<FakedUser>(initialContext);

export const useAuth = (): FakedUser => {
	return useContext(AuthContext);
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<string | null>(null);

	const signin = async () => {
		console.log("Signing in...");
		await new Promise((r) => setTimeout(r, 500));
		setUser("username");
		console.log("Signin complete");
	};

	const signout = async () => {
		await new Promise((r) => setTimeout(r, 500));
		setUser(null);
	};

	const value = useMemo(() => ({ user, signin, signout }), [user, signin, signout]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
