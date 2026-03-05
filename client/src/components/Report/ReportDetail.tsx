import {
	ArrowRight,
	FileText,
	Lock,
	LockOpen,
	PiggyBank,
	Receipt,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SkeletonPage } from "@/components/ui/skeleton";
import type { ReportLineItem, ReportSettlements } from "@/store/api/api";
import {
	useCloseReportMutation,
	useGetReportQuery,
	useReopenReportMutation,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatMonthYear } from "@/utils/date";
import { AnalyticsSection } from "./AnalyticsSection";

type Props = {
	month: number;
	year: number;
	currency: string;
	isOwner: boolean;
	onBack: () => void;
};

export const ReportDetail = ({
	month,
	year,
	currency,
	isOwner,
	onBack,
}: Props) => {
	const { t } = useTranslation();
	const { data: report, isLoading } = useGetReportQuery({ month, year });
	const [closeReport, { isLoading: isClosing }] = useCloseReportMutation();
	const [reopenReport, { isLoading: isReopening }] = useReopenReportMutation();

	const handleClose = async () => {
		try {
			await closeReport({ month, year }).unwrap();
			toast.success(t("reportDetail.reportClosed"));
		} catch {
			toast.error(t("reportDetail.closeFailed"));
		}
	};

	const handleReopen = async () => {
		try {
			await reopenReport({ month, year }).unwrap();
			toast.success(t("reportDetail.reportReopened"));
		} catch {
			toast.error(t("reportDetail.reopenFailed"));
		}
	};

	if (isLoading || !report) {
		return <SkeletonPage />;
	}

	const monthName = formatMonthYear(report.month, report.year);
	const isClosed = !!report.closed_at;

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
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold">{monthName}</h2>
						{isClosed && (
							<Badge variant="success" className="gap-1">
								<Lock className="h-3 w-3" />
								{t("reportDetail.closed")}
							</Badge>
						)}
					</div>
					{isOwner &&
						(isClosed ? (
							<Button
								size="sm"
								variant="outline"
								className="gap-1.5"
								onClick={handleReopen}
								disabled={isReopening}
							>
								<LockOpen className="h-3.5 w-3.5" />
								{t("reportDetail.reopen")}
							</Button>
						) : (
							<Button
								size="sm"
								variant="outline"
								className="gap-1.5"
								onClick={handleClose}
								disabled={isClosing}
							>
								<Lock className="h-3.5 w-3.5" />
								{t("reportDetail.closeMonth")}
							</Button>
						))}
				</div>
				<p className="text-sm text-muted-foreground mt-1">
					{t("reportDetail.expense", { count: report.total_expenses })} &middot;{" "}
					{t("reportDetail.total")}{" "}
					{formatCurrency(report.total_amount, currency)}
				</p>
			</div>

			{/* 1. Analytics */}
			<AnalyticsSection
				currency={currency}
				trends={report.trends}
				month={month}
				year={year}
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
								<div key={cb.category_name} className="space-y-1.5">
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
							<div key={ms.user_id} className="space-y-1.5">
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

			{/* 4. Settlements */}
			{report.settlements && (
				<SettlementsSection
					settlements={report.settlements}
					currency={currency}
				/>
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
								<LineItemRow
									key={li.expense_id}
									item={li}
									currency={currency}
								/>
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

function SettlementsSection({
	settlements,
	currency,
}: {
	settlements: ReportSettlements;
	currency: string;
}) {
	const { t } = useTranslation();
	const [mode, setMode] = useState<"greedy" | "direct">("greedy");

	const transfers = settlements[mode];

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<ArrowRight className="h-4 w-4 text-muted-foreground" />
					{t("reportDetail.settlements")}
				</CardTitle>
				<div className="flex gap-1 mt-2">
					<Button
						size="sm"
						variant={mode === "greedy" ? "default" : "outline"}
						className="h-7 text-xs"
						onClick={() => setMode("greedy")}
					>
						{t("reportDetail.settlementsOptimal")}
					</Button>
					<Button
						size="sm"
						variant={mode === "direct" ? "default" : "outline"}
						className="h-7 text-xs"
						onClick={() => setMode("direct")}
					>
						{t("reportDetail.settlementsDirect")}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{transfers.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("reportDetail.settledUp")}
					</p>
				) : (
					<div className="space-y-2">
						{transfers.map((tr) => (
							<div
								key={`${tr.from_user_id}-${tr.to_user_id}`}
								className="flex items-center justify-between text-sm"
							>
								<div className="flex items-center gap-1.5 min-w-0">
									<span className="truncate font-medium">{tr.from_name}</span>
									<ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
									<span className="truncate font-medium">{tr.to_name}</span>
								</div>
								<span className="font-bold shrink-0 ml-3 text-destructive">
									{formatCurrency(tr.amount, currency)}
								</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

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
							key={split.user_id}
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
