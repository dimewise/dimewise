import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RoutesEnum } from "@/routes/Routes";
import { useGetReportQuery } from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatMonthYear } from "@/utils/date";

type Props = {
	open: boolean;
	onClose: () => void;
	month: number;
	year: number;
	currency: string;
};

export const ReportSummaryModal = ({
	open,
	onClose,
	month,
	year,
	currency,
}: Props) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { data: report, isLoading } = useGetReportQuery(
		{ month, year },
		{ skip: !open },
	);

	const [settlementMode, setSettlementMode] = useState<"greedy" | "direct">(
		"greedy",
	);

	const monthName = report ? formatMonthYear(report.month, report.year) : "";
	const isClosed = report ? !!report.closed_at : false;

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				{isLoading || !report ? (
					<div className="space-y-4 py-2">
						<Skeleton className="h-6 w-2/3" />
						<Skeleton className="h-4 w-1/3" />
						<Separator />
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
								<div key={i} className="flex items-center justify-between">
									<Skeleton className="h-4 w-1/3" />
									<Skeleton className="h-4 w-16" />
								</div>
							))}
						</div>
						<Separator />
						<div className="space-y-2">
							{Array.from({ length: 2 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
								<div key={i} className="space-y-1.5">
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-1.5 w-full" />
								</div>
							))}
						</div>
					</div>
				) : (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								{monthName}
								{isClosed && (
									<Badge variant="success" className="gap-1">
										<Lock className="h-3 w-3" />
										{t("reportDetail.closed")}
									</Badge>
								)}
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4">
							{/* Total */}
							<div className="text-center py-1">
								<p className="text-2xl font-bold tracking-tight">
									{formatCurrency(report.total_amount, currency)}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{t("reportDetail.expense", {
										count: report.total_expenses,
									})}
								</p>
							</div>

							{/* Settlements */}
							{report.settlements && (
								<>
									<Separator />
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="text-xs font-medium text-muted-foreground">
												{t("reportDetail.settlements")}
											</p>
											<div className="flex gap-1">
												<Button
													size="sm"
													variant={
														settlementMode === "greedy" ? "default" : "outline"
													}
													className="h-6 text-[10px] px-2"
													onClick={() => setSettlementMode("greedy")}
												>
													{t("reportDetail.settlementsOptimal")}
												</Button>
												<Button
													size="sm"
													variant={
														settlementMode === "direct" ? "default" : "outline"
													}
													className="h-6 text-[10px] px-2"
													onClick={() => setSettlementMode("direct")}
												>
													{t("reportDetail.settlementsDirect")}
												</Button>
											</div>
										</div>
										{report.settlements[settlementMode].length === 0 ? (
											<p className="text-sm text-muted-foreground">
												{t("reportDetail.settledUp")}
											</p>
										) : (
											<div className="space-y-1.5">
												{report.settlements[settlementMode].map((tr) => (
													<div
														key={`${tr.from_user_id}-${tr.to_user_id}`}
														className="flex items-center justify-between text-sm"
													>
														<div className="flex items-center gap-1.5 min-w-0">
															<span className="truncate">{tr.from_name}</span>
															<ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
															<span className="truncate">{tr.to_name}</span>
														</div>
														<span className="font-semibold shrink-0 ml-2 text-destructive">
															{formatCurrency(tr.amount, currency)}
														</span>
													</div>
												))}
											</div>
										)}
									</div>
								</>
							)}

							{/* Category breakdown */}
							{report.category_breakdowns.length > 0 && (
								<>
									<Separator />
									<div className="space-y-2">
										<p className="text-xs font-medium text-muted-foreground">
											{t("reportDetail.categoryBreakdown")}
										</p>
										{report.category_breakdowns.map((cb) => {
											const pct =
												cb.budget_amount > 0
													? Math.min(
															Math.round(
																(cb.total_spent / cb.budget_amount) * 100,
															),
															100,
														)
													: cb.total_spent > 0
														? 100
														: 0;
											const isOver = cb.total_spent > cb.budget_amount;
											return (
												<div key={cb.category_name} className="space-y-1.5">
													<div className="flex items-center justify-between">
														<p className="text-sm font-medium">
															{cb.category_name}
														</p>
														<p className="text-xs text-muted-foreground">
															{formatCurrency(cb.total_spent, currency)} /{" "}
															{formatCurrency(cb.budget_amount, currency)}
														</p>
													</div>
													<Progress
														value={pct}
														className="h-1.5"
														indicatorClassName={
															isOver
																? "bg-destructive"
																: pct >= 80
																	? "bg-warning"
																	: "bg-success"
														}
													/>
												</div>
											);
										})}
									</div>
								</>
							)}
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								className="gap-1.5"
								onClick={() => {
									onClose();
									navigate(RoutesEnum.reports, {
										state: { month, year },
									});
								}}
							>
								{t("reportDetail.viewFullReport")}
								<ArrowRight className="h-3.5 w-3.5" />
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
