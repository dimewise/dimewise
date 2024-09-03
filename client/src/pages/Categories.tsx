import { useTranslation } from "react-i18next";

export const Categories = () => {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("nav.private.categories")}</h1>
		</>
	);
};
