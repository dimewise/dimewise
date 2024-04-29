import { type User, createClient } from "@supabase/supabase-js";
import { type PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Loading } from "react-daisyui";
import { useNavigate } from "react-router-dom";
import { Paths } from "../routes/routes";
import type { Database } from "../types/types";

export const supabase = createClient<Database>(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

const AuthContext = createContext<{ user: User | null; logout: () => void }>({
	user: null,
	logout: () => {},
});

export const useAuth = () => {
	return useContext(AuthContext);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const [user, setUser] = useState<User | null>();
	const navigate = useNavigate();

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
		});

		const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null);
			if (event === "SIGNED_IN") {
				navigate(Paths.Dashboard);
				// TODO: Add toast context and set her to "Login successfully"
			}
		});
		return () => {
			listener?.subscription.unsubscribe();
		};
	}, [navigate]);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (!error) {
			setUser(null);
		} else {
			console.error("error: ", error);
		}
	};

	return (
		<AuthContext.Provider value={{ user: user ?? null, logout }}>
			{user === undefined ? <Loading /> : children}
		</AuthContext.Provider>
	);
};
