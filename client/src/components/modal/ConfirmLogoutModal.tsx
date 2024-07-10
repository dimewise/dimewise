import { forwardRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

interface Props {
	handleClose: () => void;
}

export const ConfirmLogoutModal = forwardRef<HTMLDialogElement, Props>(({ handleClose }, ref) => {
	const { logout } = useAuth();
	const { t } = useTranslation();

	const handleLogout = () => {
		logout();
	};

	return (
		<dialog
			className="modal modal-bottom lg:modal-middle"
			ref={ref}
		>
			<div className="modal-box">
				<h3 className="font-bold text-lg">{t("settings.account.logout.title")}</h3>
				<p className="py-4">{t("settings.account.logout.description")}</p>
				<div className="modal-action">
					<form
						method="dialog"
						className="flex flex-row items-center gap-3"
					>
						<button
							type="button"
							className="btn"
							onClick={handleClose}
						>
							{t("common.button.cancel")}
						</button>
						<button
							type="button"
							className="btn btn-error text-white"
							onClick={handleLogout}
						>
							{t("nav.private.log_out")}
						</button>
					</form>
				</div>
			</div>
			<form
				method="dialog"
				className="modal-backdrop"
			>
				<button
					type="button"
					onClick={handleClose}
				>
					{t("common.button.close")}
				</button>
			</form>
		</dialog>
	);
});
