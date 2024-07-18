import { type RefObject, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccountSetting } from "../components/AccountSetting";
import { CategoriesSetting } from "../components/CategoriesSetting";
import { CategoryFormModal } from "../components/modal/CategoryFormModal";
import { ConfirmLogoutModal } from "../components/modal/ConfirmLogoutModal";
import { DeleteCategoryModal } from "../components/modal/DeleteCategoryModal";

export const Settings = () => {
	const { t } = useTranslation();
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
	const confirmLogoutModalRef = useRef<HTMLDialogElement>(null);
	const categoryFormModalRef = useRef<HTMLDialogElement>(null);
	const deleteCategoryModalRef = useRef<HTMLDialogElement>(null);

	const handleShowModal = (modalRef: RefObject<HTMLDialogElement>) => {
		modalRef.current?.showModal();
	};
	const handleCloseModal = (modalRef: RefObject<HTMLDialogElement>) => {
		modalRef.current?.close();
	};

	const handleShowConfirmLogoutModal = () => handleShowModal(confirmLogoutModalRef);
	const handleCloseConfirmLogoutModal = () => handleCloseModal(confirmLogoutModalRef);

	const handleShowCategoryFormModal = () => handleShowModal(categoryFormModalRef);
	const handleCloseCategoryFormModal = () => handleCloseModal(categoryFormModalRef);

	const handleShowDeleteCategoryModal = () => handleShowModal(deleteCategoryModalRef);
	const handleCloseDeleteCategoryModal = () => handleCloseModal(deleteCategoryModalRef);

	return (
		<>
			<h1>{t("nav.private.settings")}</h1>
			<CategoriesSetting
				handleShowCategoryFormModal={handleShowCategoryFormModal}
				handleShowDeleteCategoryModal={handleShowDeleteCategoryModal}
				setSelectedCategoryId={setSelectedCategoryId}
			/>
			<AccountSetting handleShowConfirmLogoutModal={handleShowConfirmLogoutModal} />
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
				handleClose={handleCloseDeleteCategoryModal}
				selectedCategoryId={selectedCategoryId}
				setSelectedCategoryId={setSelectedCategoryId}
			/>
		</>
	);
};
