import { useTranslation } from "react-i18next";

export const Overview = () => {
	const { t } = useTranslation();
	return (
		<div className="prose">
			<h1>{t("nav.private.overview")}</h1>
		</div>
	);
};
