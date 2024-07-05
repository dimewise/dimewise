import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export const AccountSetting = () => {
	const { logout } = useAuth();
	const { t } = useTranslation();

	const handleLogout = () => {
		logout();
	};

	return (
		<>
			<h3 className="m-0">{t("settings.account.title")}</h3>
			<div className="my-8">
				<button
					type="button"
					className="btn btn-error text-white"
					onClick={handleLogout}
				>
					<ArrowLeftStartOnRectangleIcon className="size-5" />
					{t("nav.private.log_out")}
				</button>
			</div>
		</>
	);
};
