import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

interface Props {
	handleShowConfirmLogoutModal: () => void;
}
export const AccountSetting = ({ handleShowConfirmLogoutModal }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<h3 className="m-0">{t("settings.account.title")}</h3>
			<div className="my-8">
				<button
					type="button"
					className="btn btn-error text-white"
					onClick={handleShowConfirmLogoutModal}
				>
					<ArrowLeftStartOnRectangleIcon className="size-5" />
					{t("nav.private.log_out")}
				</button>
			</div>
		</>
	);
};
