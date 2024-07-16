import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useFaker } from "../hooks/useFaker";

interface Props {
	handleShowCategoryFormModal: () => void;
	handleShowDeleteCategoryModal: () => void;
	setSelectedCategoryId: (id: string | null) => void;
}
export const CategoriesSetting = ({
	handleShowCategoryFormModal,
	handleShowDeleteCategoryModal,
	setSelectedCategoryId,
}: Props) => {
	const { t } = useTranslation();

	// TODO: add actual category list api call
	const { categories } = useFaker();

	const currency = "JPY";
	const totalBudget = categories.reduce((t, c) => t + c.budget, 0);

	const handleEditCategory = (id: string) => {
		setSelectedCategoryId(id);
		handleShowCategoryFormModal();
	};

	const handleDeleteCategory = (id: string) => {
		setSelectedCategoryId(id);
		handleShowDeleteCategoryModal();
	};

	return (
		<>
			<div className="flex items-center justify-between">
				<h3 className="m-0">{t("settings.categories.title")}</h3>
				<button
					type="button"
					className="btn btn-primary btn-sm text-white"
					onClick={handleShowCategoryFormModal}
				>
					<PlusIcon className="size-5" />
					{t("settings.categories.action.create")}
				</button>
			</div>
			<div className="w-full">
				<table className="table">
					{/* head */}
					<thead>
						<tr>
							<th className="w-full">{t("settings.categories.table.name")}</th>
							<th className="w-fit">{t("settings.categories.table.budget")}</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{categories.map((c) => (
							<tr key={c.id}>
								<td>{c.name}</td>
								<td className="text-right w-fit text-nowrap">{`${currency} ${c.budget}`}</td>
								<td className="flex items-center justify-end gap-5">
									<button
										type="button"
										onClick={() => handleEditCategory(c.id)}
									>
										<PencilSquareIcon className="size-5" />
									</button>
									<button
										type="button"
										onClick={() => handleDeleteCategory(c.id)}
									>
										<TrashIcon className="size-5" />
									</button>
								</td>
							</tr>
						))}
						<tr>
							<td className="text-right">{t("settings.categories.table.total-monthly-budget")}</td>
							<td className="text-right w-fit text-nowrap">{`${currency} ${totalBudget}`}</td>
							<td />
						</tr>
					</tbody>
				</table>
			</div>
		</>
	);
};
