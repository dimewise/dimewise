import type { Session } from "@supabase/supabase-js";

export type AuthState = {
	session: Session | null;
	loading: boolean;
	error: Error | null | undefined;
};

export type SetSessionPayload = {
	session: Session | null;
};

export type SignInProps = {
	email: string;
	password: string;
};
