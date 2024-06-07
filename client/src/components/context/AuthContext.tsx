import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

interface AuthContextType {
	user: string | null;
	signin: (user: string, callback: VoidFunction) => void;
	signout: (callback: VoidFunction) => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	signin: () => {},
	signout: () => {},
});

export const useAuth = (): AuthContextType => {
	return useContext(AuthContext);
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<string | null>(null);

	const signin = (newUser: string, callback: VoidFunction) => {
		return FakeAuthProvider.signin(() => {
			setUser(newUser);
			callback();
		});
	};

	const signout = (callback: VoidFunction) => {
		return FakeAuthProvider.signout(() => {
			setUser(null);
			callback();
		});
	};

	const value = useMemo(() => ({ user, signin, signout }), [user, signin, signout]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * This represents some generic auth provider API, like Firebase.
 */
export const FakeAuthProvider = {
	isAuthenticated: false,
	signin(callback: VoidFunction) {
		FakeAuthProvider.isAuthenticated = true;
		setTimeout(callback, 100); // fake async
	},
	signout(callback: VoidFunction) {
		FakeAuthProvider.isAuthenticated = false;
		setTimeout(callback, 100);
	},
};
