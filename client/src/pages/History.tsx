import { useTranslation } from "react-i18next";

export const History = () => {
	const { t } = useTranslation();
	return (
		<div className="prose">
			<h1>{t("nav.private.history")}</h1>
		</div>
	);
};
