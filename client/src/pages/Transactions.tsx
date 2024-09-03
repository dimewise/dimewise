import { useTranslation } from "react-i18next";

export const Transactions = () => {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("nav.private.transactions")}</h1>
		</>
	);
};
