import { useTranslation } from "react-i18next";
import type { CategoryFull } from "../hooks/useFaker";

interface Props {
	category: CategoryFull;
}

export const CategoryWidget = ({ category }: Props) => {
	const { t } = useTranslation();
	const currency = "JPY";
	const remainingBudget = category.budget - category.expense;
	const remainder = Math.abs(remainingBudget);
	const prefix = remainingBudget < 0 ? "-" : "";

	const remainderText = t("overview.category_widget.remainder_budget", {
		prefix: prefix,
		currency: currency,
		remainder: remainder,
	});

	const percentageLeft = (remainingBudget / category.budget) * 100;
	let remainderColorCode: string;
	if (percentageLeft < 30) {
		remainderColorCode = "bg-error";
	} else if (percentageLeft >= 30 && percentageLeft <= 80) {
		remainderColorCode = "bg-warning";
	} else {
		remainderColorCode = "bg-success";
	}

	return (
		<div className="card w-full">
			<div className="card-body p-0 gap-4">
				<div className="flex items-center justify-between">
					<p className="text-sm font-bold mr-2 my-0">{category.name}</p>
					<p className="text-sm text-end truncate my-0">{remainderText}</p>
				</div>
				<progress
					className={`progress ${remainderColorCode}`}
					value={category.expense}
					max={category.budget}
				/>
			</div>
		</div>
	);
};
