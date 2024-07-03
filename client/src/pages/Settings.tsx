import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

interface CategoryInfo {
	id: string;
	name: string;
	budget: number; // note that although this is a whole number, it is also used to represent decimal points in different currencies
}

export const Settings = () => {
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
		<div className="prose w-full max-w-5xl">
			<h1>{t("nav.private.settings")}</h1>
			<h3>Categories</h3>
			<div className="w-full">
				<table className="table">
					{/* head */}
					<thead>
						<tr>
							<th className="w-full">Name</th>
							<th className="w-fit">Budget</th>
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
							<td className="text-right">Total Monthly Budget</td>
							<td className="text-right w-fit text-nowrap">{`${currency} ${totalBudget}`}</td>
							<td />
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};
