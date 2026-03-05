import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CategoryTrend } from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

type Props = {
	data: CategoryTrend[];
	currency: string;
};

export const CategoryDeltaList = ({ data, currency }: Props) => {
	const { t } = useTranslation();

	const deltas = data
		.map((cat) => {
			if (cat.data.length < 2) return null;
			const prev = cat.data[cat.data.length - 2];
			const curr = cat.data[cat.data.length - 1];
			const diff = curr.total_spent - prev.total_spent;
			return { name: cat.category_name, diff };
		})
		.filter((d): d is { name: string; diff: number } => d !== null);

	if (deltas.length === 0) return null;

	return (
		<div className="space-y-1.5">
			{deltas.map((d) => {
				const isUp = d.diff > 0;
				const isDown = d.diff < 0;
				return (
					<div
						key={d.name}
						className="flex items-center justify-between text-sm"
					>
						<span className="text-muted-foreground">{d.name}</span>
						<span
							className={`flex items-center gap-1 font-medium ${
								isUp
									? "text-destructive"
									: isDown
										? "text-success"
										: "text-muted-foreground"
							}`}
						>
							{isUp ? (
								<TrendingUp className="h-3.5 w-3.5" />
							) : isDown ? (
								<TrendingDown className="h-3.5 w-3.5" />
							) : (
								<Minus className="h-3.5 w-3.5" />
							)}
							{isUp ? "+" : ""}
							{formatCurrency(d.diff, currency)} {t("reportDetail.vsLastMonth")}
						</span>
					</div>
				);
			})}
		</div>
	);
};
