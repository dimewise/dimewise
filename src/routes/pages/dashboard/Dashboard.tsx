import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export const Dashboard = (): ReactElement => {
	const { t } = useTranslation();
	return <div>{t("welcome")}</div>;
};
