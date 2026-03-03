import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGetUsersMeQuery } from "@/store/api/api";

/**
 * Syncs the i18n language with the authenticated user's stored language preference.
 * Should be used once at the top level of the authenticated layout.
 */
export function useLanguageSync() {
	const { i18n } = useTranslation();
	const { data: user } = useGetUsersMeQuery();

	useEffect(() => {
		if (user?.language && user.language !== i18n.language) {
			i18n.changeLanguage(user.language);
		}
	}, [user?.language, i18n]);
}
