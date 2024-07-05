import { useTranslation } from "react-i18next";
import { AccountSetting } from "../components/AccountSetting";
import { CategoriesSetting } from "../components/CategoriesSetting";

export const Settings = () => {
	const { t } = useTranslation();

	return (
		<>
			<h1>{t("nav.private.settings")}</h1>
			<CategoriesSetting />
			<AccountSetting />
		</>
	);
};
