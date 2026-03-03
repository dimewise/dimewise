import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { BudgetOverview } from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";

type Props = {
	overview: BudgetOverview;
	currency: string;
};

export const BudgetOverviewCard = ({ overview, currency }: Props) => {
	const { t } = useTranslation();
	const usedPercent =
		overview.total_budget > 0
			? Math.round((overview.total_spent / overview.total_budget) * 100)
			: 0;

	const progressColor =
		usedPercent >= 100
			? "bg-danger"
			: usedPercent >= 80
				? "bg-warning"
				: "bg-success";

	return (
		<Card>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light">
						<Wallet className="h-4 w-4 text-brand" />
					</div>
					<h3 className="font-semibold">{t("budgets.monthlyOverview")}</h3>
				</div>

				{/* Stats row */}
				<div className="grid grid-cols-3 gap-3">
					<div className="rounded-lg bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">
							{t("budgets.budget")}
						</p>
						<p className="text-sm font-bold truncate">
							{formatCurrency(overview.total_budget, currency)}
						</p>
					</div>
					<div className="rounded-lg bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
							{t("budgets.spent")}
							<TrendingDown className="h-3 w-3" />
						</p>
						<p
							className={cn(
								"text-sm font-bold truncate",
								overview.total_spent > overview.total_budget && "text-danger",
							)}
						>
							{formatCurrency(overview.total_spent, currency)}
						</p>
					</div>
					<div className="rounded-lg bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
							{t("budgets.left")}
							<TrendingUp className="h-3 w-3" />
						</p>
						<p
							className={cn(
								"text-sm font-bold truncate",
								overview.remaining < 0 ? "text-danger" : "text-success",
							)}
						>
							{formatCurrency(overview.remaining, currency)}
						</p>
					</div>
				</div>

				{/* Progress bar */}
				<div className="space-y-1.5">
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>{t("budgets.usage")}</span>
						<span className="font-medium">{usedPercent}%</span>
					</div>
					<Progress value={usedPercent} indicatorClassName={progressColor} />
				</div>

				{/* Category breakdown */}
				{overview.categories.length > 0 && (
					<div className="space-y-2.5 pt-1">
						<p className="text-xs font-medium text-muted-foreground">
							{t("budgets.byCategory")}
						</p>
						{overview.categories.map((cat) => {
							const catPercent =
								cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0;
							const catColor =
								catPercent >= 100
									? "bg-danger"
									: catPercent >= 80
										? "bg-warning"
										: "bg-success";
							return (
								<div key={cat.id} className="space-y-1">
									<div className="flex items-center justify-between text-xs">
										<span className="font-medium truncate mr-2">
											{cat.name}
										</span>
										<span className="text-muted-foreground shrink-0">
											{formatCurrency(cat.spent, currency)} /{" "}
											{formatCurrency(cat.budget, currency)}
										</span>
									</div>
									<Progress
										value={catPercent}
										indicatorClassName={catColor}
										className="h-1.5"
									/>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
