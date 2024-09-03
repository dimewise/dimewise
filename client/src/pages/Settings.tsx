import { type RefObject, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoryFormModal } from "../components/modal/CategoryFormModal";
import { ConfirmLogoutModal } from "../components/modal/ConfirmLogoutModal";
import { DeleteCategoryModal } from "../components/modal/DeleteCategoryModal";

export const Settings = () => {
	const { t } = useTranslation();
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
	const confirmLogoutModalRef = useRef<HTMLDialogElement>(null);
	const categoryFormModalRef = useRef<HTMLDialogElement>(null);
	const deleteCategoryModalRef = useRef<HTMLDialogElement>(null);

	const handleCloseModal = (modalRef: RefObject<HTMLDialogElement>) => {
		modalRef.current?.close();
	};

	const handleCloseConfirmLogoutModal = () => handleCloseModal(confirmLogoutModalRef);

	const handleCloseCategoryFormModal = () => handleCloseModal(categoryFormModalRef);

	return (
		<>
			<h1 className="sticky top-0 bg-white z-10 py-2">{t("nav.private.settings")}</h1>
			<CategoryFormModal
				ref={categoryFormModalRef}
				handleClose={handleCloseCategoryFormModal}
				selectedCategoryId={selectedCategoryId}
				setSelectedCategoryId={setSelectedCategoryId}
			/>
			<ConfirmLogoutModal
				ref={confirmLogoutModalRef}
				handleClose={handleCloseConfirmLogoutModal}
			/>
			<DeleteCategoryModal
				ref={deleteCategoryModalRef}
				handleClose={() => {}}
				selectedCategoryId={selectedCategoryId}
				setSelectedCategoryId={setSelectedCategoryId}
			/>
		</>
	);
};
