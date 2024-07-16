import { useRef, useState } from "react";
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

	const handleShowConfirmLogoutModal = () => {
		if (confirmLogoutModalRef.current) {
			confirmLogoutModalRef.current.showModal();
		}
	};

	const handleCloseConfirmLogoutModal = () => {
		if (confirmLogoutModalRef.current) {
			confirmLogoutModalRef.current.close();
		}
	};

	const handleShowCategoryFormModal = () => {
		if (categoryFormModalRef.current) {
			categoryFormModalRef.current.showModal();
		}
	};

	const handleCloseCategoryFormModal = () => {
		if (categoryFormModalRef.current) {
			categoryFormModalRef.current.close();
		}
	};

	const handleShowDeleteCategoryModal = () => {
		if (deleteCategoryModalRef.current) {
			deleteCategoryModalRef.current.showModal();
		}
	};

	const handleCloseDeleteCategoryModal = () => {
		if (deleteCategoryModalRef.current) {
			deleteCategoryModalRef.current.close();
		}
	};

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
