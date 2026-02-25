import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
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
					<h3 className="font-semibold">Monthly Overview</h3>
				</div>

				{/* Stats row */}
				<div className="grid grid-cols-3 gap-3">
					<div className="rounded-xl bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">Budget</p>
						<p className="text-sm font-bold truncate">
							{formatCurrency(overview.total_budget, currency)}
						</p>
					</div>
					<div className="rounded-xl bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
							Spent
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
					<div className="rounded-xl bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
							Left
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
						<span>Usage</span>
						<span className="font-medium">{usedPercent}%</span>
					</div>
					<Progress value={usedPercent} indicatorClassName={progressColor} />
				</div>
			</CardContent>
		</Card>
	);
};
