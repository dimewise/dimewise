import { useTranslation } from "react-i18next";
import { CategoriesSetting } from "../components/CategoriesSetting";
import { AccountSetting } from "../components/AccountSetting";

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
