import { useTranslation } from "react-i18next";

export const Overview = () => {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("nav.private.overview")}</h1>
		</>
	);
};
