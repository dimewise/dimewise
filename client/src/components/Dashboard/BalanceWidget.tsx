import { ArrowDownRight, ArrowUpRight, CheckCircle, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetMyBalancesQuery } from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

type Props = {
	currency: string;
};

export const BalanceWidget = ({ currency }: Props) => {
	const { t } = useTranslation();
	const now = new Date();
	const { data, isLoading, isUninitialized } = useGetMyBalancesQuery({
		month: now.getMonth() + 1,
		year: now.getFullYear(),
	});

	if (isLoading || isUninitialized) {
		return (
			<Card>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<Skeleton className="h-5 w-32" />
					</div>
					<Skeleton className="h-8 w-24" />
					<div className="space-y-2">
						<Skeleton className="h-10 w-full rounded-lg" />
						<Skeleton className="h-10 w-full rounded-lg" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data) return null;

	const isSettled = data.net_balance === 0 && data.balances.length === 0;
	const isPositive = data.net_balance > 0;

	return (
		<Card>
			<CardContent className="space-y-3">
				{/* Header */}
				<div className="flex items-center gap-2">
					<div
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-lg",
							isSettled
								? "bg-success-light"
								: isPositive
									? "bg-success-light"
									: "bg-danger/10",
						)}
					>
						<Scale
							className={cn(
								"h-4 w-4",
								isSettled
									? "text-success"
									: isPositive
										? "text-success"
										: "text-danger",
							)}
						/>
					</div>
					<h3 className="font-semibold">{t("balance.title")}</h3>
				</div>

				{isSettled ? (
					<div className="flex items-center gap-2 rounded-lg bg-success-light px-3 py-2.5">
						<CheckCircle className="h-4 w-4 text-success shrink-0" />
						<p className="text-sm font-medium text-success">
							{t("balance.allSettled")}
						</p>
					</div>
				) : (
					<>
						{/* Net balance */}
						<p
							className={cn(
								"text-xl font-bold",
								isPositive ? "text-success" : "text-danger",
							)}
						>
							{isPositive ? "+" : ""}
							{formatCurrency(data.net_balance, currency)}
						</p>

						{/* Per-member balances */}
						<div className="space-y-1.5">
							{data.balances.map((b) => {
								const owesYou = b.amount > 0;
								return (
									<div
										key={b.user_id}
										className={cn(
											"flex items-center justify-between rounded-lg px-3 py-2.5",
											owesYou ? "bg-success-light" : "bg-danger/10",
										)}
									>
										<div className="flex items-center gap-2 min-w-0">
											{owesYou ? (
												<ArrowDownRight className="h-3.5 w-3.5 text-success shrink-0" />
											) : (
												<ArrowUpRight className="h-3.5 w-3.5 text-danger shrink-0" />
											)}
											<span className="text-sm truncate">
												{owesYou
													? t("balance.owesYou", { name: b.member_name })
													: t("balance.youOwe", { name: b.member_name })}
											</span>
										</div>
										<span
											className={cn(
												"text-sm font-semibold shrink-0 ml-2",
												owesYou ? "text-success" : "text-danger",
											)}
										>
											{formatCurrency(Math.abs(b.amount), currency)}
										</span>
									</div>
								);
							})}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};
