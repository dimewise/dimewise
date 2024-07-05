import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { CategoryInfo } from "../types/category";
import { useTranslation } from "react-i18next";

export const CategoriesSetting = () => {
	const { t } = useTranslation();
	const categories: CategoryInfo[] = [
		{
			id: "1c6a176b-9ce3-470c-9642-93eddb09dd3f",
			name: "Groceries",
			budget: 15000,
		},
		{
			id: "82b7484d-63f0-464f-ab9d-f4d370946f01",
			name: "Shopping",
			budget: 10000,
		},
		{
			id: "a1714200-bf84-4e82-80f5-6770e904cbaa",
			name: "Hobbies",
			budget: 15000,
		},
	];

	const currency = "JPY";
	const totalBudget = categories.reduce((t, c) => t + c.budget, 0);
	return (
		<>
			<div className="flex items-center justify-between">
				<h3 className="m-0">{t("settings.categories.title")}</h3>
				<button
					type="button"
					className="btn btn-primary btn-sm text-white"
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
									<button type="button">
										<PencilSquareIcon className="size-5" />
									</button>
									<button type="button">
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
