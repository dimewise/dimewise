import { useCallback } from "react";
import { useDispatch } from "react-redux";
import * as auth from "../store/auth/actions";
import type { AppDispatch } from "../store/store";

export const useAuth = () => {
	const dispatch = useDispatch<AppDispatch>();

	const signIn = useCallback(
		async (email: string, password: string) => {
			await dispatch(auth.signIn({ email, password }));
		},
		[dispatch],
	);

	const signOut = useCallback(async () => {
		await dispatch(auth.signOut());
	}, [dispatch]);

	return {
		signIn,
		signOut,
	};
};
