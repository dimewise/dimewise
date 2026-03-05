import {
	ArrowRight,
	Check,
	FileText,
	PiggyBank,
	Receipt,
	Undo2,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SkeletonPage } from "@/components/ui/skeleton";
import type { ReportLineItem } from "@/store/api/api";
import {
	useGetReportQuery,
	useMarkReportTransferPaidMutation,
	useUnmarkReportTransferPaidMutation,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatMonthYear } from "@/utils/date";
import { AnalyticsSection } from "./AnalyticsSection";

type Props = {
	reportId: string;
	currency: string;
	isOwner: boolean;
	onBack: () => void;
};

export const ReportDetail = ({
	reportId,
	currency,
	isOwner,
	onBack,
}: Props) => {
	const { t } = useTranslation();
	const { data: report, isLoading } = useGetReportQuery({ reportId });
	const [markPaid] = useMarkReportTransferPaidMutation();
	const [unmarkPaid] = useUnmarkReportTransferPaidMutation();

	const handleMarkPaid = async (transferId: string) => {
		try {
			await markPaid({ transferId }).unwrap();
			toast.success(t("reportDetail.transferPaid"));
		} catch {
			toast.error(t("reportDetail.transferPaidFailed"));
		}
	};

	const handleUnmarkPaid = async (transferId: string) => {
		try {
			await unmarkPaid({ transferId }).unwrap();
			toast.success(t("reportDetail.transferUnpaid"));
		} catch {
			toast.error(t("reportDetail.transferUnpaidFailed"));
		}
	};

	if (isLoading || !report) {
		return <SkeletonPage />;
	}

	const monthName = formatMonthYear(report.month, report.year);

	const allSettled = report.transfers.every((t) => !!t.paid_at);

	return (
		<div className="space-y-5">
			{/* Header */}
			<div>
				<button
					type="button"
					onClick={onBack}
					className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 flex items-center gap-1"
				>
					{t("reportDetail.backToReports")}
				</button>
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">{monthName}</h2>
					{report.transfers.length > 0 &&
						(allSettled ? (
							<Badge variant="success">{t("reportDetail.allSettled")}</Badge>
						) : (
							<Badge variant="warning">{t("reportDetail.pending")}</Badge>
						))}
				</div>
				<p className="text-sm text-muted-foreground mt-1">
					{t("reportDetail.expense", { count: report.total_expenses })} &middot;{" "}
					{t("reportDetail.total")}{" "}
					{formatCurrency(report.total_amount, currency)} &middot;{" "}
					{t("reportDetail.generated")}{" "}
					{formatDate(report.generated_at, "MMM d, yyyy")}
				</p>
			</div>

			{/* 1. Analytics */}
			<AnalyticsSection
				currency={currency}
				month={report.month}
				year={report.year}
			/>

			{/* 2. Category Subtotals */}
			{report.category_breakdowns.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<PiggyBank className="h-4 w-4 text-muted-foreground" />
							{t("reportDetail.categorySubtotals")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{report.category_breakdowns.map((cb) => {
							const pct =
								cb.budget_amount > 0
									? Math.min(
											Math.round((cb.total_spent / cb.budget_amount) * 100),
											100,
										)
									: cb.total_spent > 0
										? 100
										: 0;
							const isOver = cb.total_spent > cb.budget_amount;
							return (
								<div key={cb.id} className="space-y-1.5">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium">{cb.category_name}</p>
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
					</CardContent>
				</Card>
			)}

			{/* 3. Account Summary */}
			{report.member_summaries.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<Users className="h-4 w-4 text-muted-foreground" />
							{t("reportDetail.accountSummary")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{report.member_summaries.map((ms) => (
							<div key={ms.id} className="space-y-1.5">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">{ms.member_name}</p>
								</div>
								<div className="flex items-center gap-4 text-xs">
									<span className="text-muted-foreground">
										{t("reportDetail.totalPaid")}{" "}
										<span className="font-medium text-foreground">
											{formatCurrency(ms.total_paid, currency)}
										</span>
									</span>
									<span className="text-muted-foreground">
										{t("reportDetail.fairShare")}{" "}
										<span className="font-medium text-foreground">
											{formatCurrency(ms.total_owed, currency)}
										</span>
									</span>
								</div>
								{ms.net_balance !== 0 && (
									<p className="text-[11px] text-muted-foreground">
										{t("reportDetail.netPosition")}{" "}
										{ms.net_balance > 0 ? "+" : ""}
										{formatCurrency(ms.net_balance, currency)}
									</p>
								)}
								<Separator />
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* 4. Suggested Settlements */}
			{report.transfers.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<ArrowRight className="h-4 w-4 text-muted-foreground" />
							{t("reportDetail.suggestedSettlements")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{report.transfers.map((transfer) => {
							const isPaid = !!transfer.paid_at;
							return (
								<div
									key={transfer.id}
									className={`space-y-2 ${isPaid ? "opacity-60" : ""}`}
								>
									<div className="flex items-center gap-3">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 text-sm flex-wrap">
												<span className="font-semibold truncate">
													{transfer.from_name}
												</span>
												<ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
												<span className="font-semibold truncate">
													{transfer.to_name}
												</span>
											</div>
											<p className="text-lg font-bold mt-0.5">
												{formatCurrency(transfer.amount, currency)}
											</p>
											{isPaid && transfer.paid_at && (
												<p className="text-xs text-success mt-0.5 flex items-center gap-1">
													<Check className="h-3 w-3" />
													{t("reportDetail.paidOn", {
														date: formatDate(transfer.paid_at, "MMM d, yyyy"),
													})}
												</p>
											)}
										</div>

										{isOwner && !isPaid && (
											<Button
												size="sm"
												variant="outline"
												className="shrink-0 gap-1.5"
												onClick={() => handleMarkPaid(transfer.id)}
											>
												<Check className="h-3.5 w-3.5" />
												{t("reportDetail.markPaid")}
											</Button>
										)}
										{isOwner && isPaid && (
											<Button
												size="sm"
												variant="ghost"
												className="shrink-0 gap-1.5 text-muted-foreground"
												onClick={() => handleUnmarkPaid(transfer.id)}
											>
												<Undo2 className="h-3.5 w-3.5" />
												{t("reportDetail.undo")}
											</Button>
										)}
										{!isOwner && isPaid && (
											<div className="flex items-center gap-1 text-success shrink-0">
												<Check className="h-4 w-4" />
											</div>
										)}
									</div>
									<Separator />
								</div>
							);
						})}
					</CardContent>
				</Card>
			)}

			{/* No transfers needed */}
			{report.transfers.length === 0 && (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						{t("reportDetail.noTransfers")}
					</CardContent>
				</Card>
			)}

			{/* 5. Ledger */}
			{report.line_items.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<Receipt className="h-4 w-4 text-muted-foreground" />
							{t("reportDetail.ledger", {
								count: report.line_items.length,
							})}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="divide-y divide-border">
							{report.line_items.map((li) => (
								<LineItemRow key={li.id} item={li} currency={currency} />
							))}
						</div>
						<Separator className="my-3" />
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold">
								{t("reportDetail.ledgerTotal")}
							</p>
							<p className="text-sm font-bold">
								{formatCurrency(report.total_amount, currency)}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

// Sub-component for always-visible line items with inline splits
function LineItemRow({
	item,
	currency,
}: {
	item: ReportLineItem;
	currency: string;
}) {
	return (
		<div className="py-3 first:pt-0 last:pb-0">
			<div className="flex items-start justify-between">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2 flex-wrap">
						<p className="text-sm font-medium truncate">{item.expense_title}</p>
						{item.category_name && (
							<Badge variant="default" className="text-[10px]">
								{item.category_name}
							</Badge>
						)}
					</div>
					<p className="text-xs text-muted-foreground mt-0.5">
						{item.paid_by_name} &middot;{" "}
						{formatDate(item.incurred_at, "MMM d, yyyy")}
					</p>
				</div>
				<p className="text-sm font-bold shrink-0 ml-3">
					{formatCurrency(item.amount, currency)}
				</p>
			</div>

			{/* Notes */}
			{item.notes && (
				<div className="flex items-start gap-2 bg-muted rounded-lg p-2 mt-2">
					<FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
					<p className="text-xs text-muted-foreground">{item.notes}</p>
				</div>
			)}

			{/* Splits — always visible */}
			{item.splits.length > 1 && (
				<div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
					{item.splits.map((split) => (
						<div
							key={split.id}
							className="flex items-center justify-between text-[11px] text-muted-foreground"
						>
							<span className="truncate">{split.member_name}</span>
							<span className="font-medium ml-1">
								{formatCurrency(split.amount, currency)}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
