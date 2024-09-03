import { useTranslation } from "react-i18next";

export const Feedback = () => {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("nav.private.feedback")}</h1>
		</>
	);
};
