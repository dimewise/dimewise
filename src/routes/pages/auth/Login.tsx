import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { FC, ReactElement } from "react";
import { supabase } from "../../../auth/AuthProvider";

export const Login: FC = (): ReactElement => {
	// TODO: Not be able to come here if signed in?
	return (
		<Auth
			supabaseClient={supabase}
			appearance={{ theme: ThemeSupa }}
			providers={[]} // TODO: Add providers
		/>
	);
};
