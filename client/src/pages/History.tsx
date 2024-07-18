import { useTranslation } from "react-i18next";

export const History = () => {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("nav.private.history")}</h1>
		</>
	);
};
