import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
	handleClose: () => void;
	selectedCategoryId: string | null;
	setSelectedCategoryId: (id: string | null) => void;
}

export const DeleteCategoryModal = forwardRef<HTMLDialogElement, Props>(
	({ handleClose, selectedCategoryId, setSelectedCategoryId }, ref) => {
		const { t } = useTranslation();

		const handleCloseModal = () => {
			if (selectedCategoryId) {
				setSelectedCategoryId(null);
			}
			handleClose();
		};

		const handleDeleteCategory = () => {};

		return (
			<dialog
				className="modal modal-bottom lg:modal-middle"
				ref={ref}
			>
				<div className="modal-box">
					<h3 className="font-bold text-lg">{t("settings.categories.delete.title")}</h3>
					<p className="py-4">{t("settings.categories.delete.description")}</p>
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
								onClick={handleDeleteCategory}
							>
								{t("common.button.delete")}
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
						onClick={handleCloseModal}
					>
						{t("common.button.close")}
					</button>
				</form>
			</dialog>
		);
	},
);
