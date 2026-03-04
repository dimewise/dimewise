import { ArrowRight, Check } from "lucide-react";
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
	reportId: string;
	currency: string;
};

export const ReportSummaryModal = ({
	open,
	onClose,
	reportId,
	currency,
}: Props) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { data: report, isLoading } = useGetReportQuery(
		{ reportId },
		{ skip: !open },
	);

	const monthName = report ? formatMonthYear(report.month, report.year) : "";
	const allSettled = report
		? report.transfers.every((tr) => !!tr.paid_at)
		: false;

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
								{report.transfers.length > 0 &&
									(allSettled ? (
										<Badge variant="success">
											{t("reportDetail.allSettled")}
										</Badge>
									) : (
										<Badge variant="warning">{t("reportDetail.pending")}</Badge>
									))}
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

							{/* Member breakdown */}
							{report.member_summaries.length > 0 && (
								<>
									<Separator />
									<div className="space-y-2">
										<p className="text-xs font-medium text-muted-foreground">
											{t("reportDetail.memberBreakdown")}
										</p>
										{report.member_summaries.map((ms) => {
											const isPositive = ms.net_balance > 0;
											const isZero = ms.net_balance === 0;
											return (
												<div
													key={ms.id}
													className="flex items-center justify-between text-sm"
												>
													<span>{ms.member_name}</span>
													<span
														className={`font-semibold ${
															isZero
																? "text-muted-foreground"
																: isPositive
																	? "text-success"
																	: "text-destructive"
														}`}
													>
														{isPositive ? "+" : ""}
														{formatCurrency(ms.net_balance, currency)}
													</span>
												</div>
											);
										})}
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
												<div key={cb.id} className="space-y-1.5">
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

							{/* Transfers */}
							{report.transfers.length > 0 && (
								<>
									<Separator />
									<div className="space-y-2">
										<p className="text-xs font-medium text-muted-foreground">
											{t("reportDetail.transfers")}
										</p>
										{report.transfers.map((transfer) => {
											const isPaid = !!transfer.paid_at;
											return (
												<div
													key={transfer.id}
													className={`flex items-center justify-between text-sm rounded-lg bg-muted px-3 py-2 ${isPaid ? "opacity-60" : ""}`}
												>
													<div className="flex items-center gap-2 min-w-0">
														<span className="truncate">
															{transfer.from_name}
														</span>
														<ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
														<span className="truncate">{transfer.to_name}</span>
													</div>
													<div className="flex items-center gap-1.5 shrink-0 ml-2">
														<span className="font-semibold">
															{formatCurrency(transfer.amount, currency)}
														</span>
														{isPaid && (
															<Check className="h-3.5 w-3.5 text-success" />
														)}
													</div>
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
									navigate(RoutesEnum.reports);
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
