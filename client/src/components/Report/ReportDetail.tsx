import {
	ArrowRight,
	Check,
	ChevronDown,
	ChevronUp,
	FileText,
	PiggyBank,
	Receipt,
	Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FullPageSpinner } from "@/components/ui/spinner";
import type { ReportLineItem } from "@/store/api/api";
import {
	useGetReportQuery,
	useMarkReportTransferPaidMutation,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

type Props = {
	reportId: string;
	currency: string;
	onBack: () => void;
};

export const ReportDetail = ({ reportId, currency, onBack }: Props) => {
	const { data: report, isLoading } = useGetReportQuery({ reportId });
	const [markPaid] = useMarkReportTransferPaidMutation();
	const [expandedItem, setExpandedItem] = useState<string | null>(null);

	const handleMarkPaid = async (transferId: string) => {
		try {
			await markPaid({ transferId }).unwrap();
			toast.success("Transfer marked as paid!");
		} catch {
			toast.error("Failed to mark transfer as paid.");
		}
	};

	if (isLoading || !report) {
		return <FullPageSpinner />;
	}

	const monthName = new Date(report.year, report.month - 1).toLocaleString(
		"default",
		{ month: "long", year: "numeric" },
	);

	const allSettled = report.transfers.every((t) => !!t.paid_at);

	return (
		<div className="space-y-5 animate-fade-in">
			{/* Header */}
			<div>
				<button
					type="button"
					onClick={onBack}
					className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 flex items-center gap-1"
				>
					&larr; Back to reports
				</button>
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">{monthName}</h2>
					{report.transfers.length > 0 &&
						(allSettled ? (
							<Badge variant="success">All Settled</Badge>
						) : (
							<Badge variant="warning">Pending</Badge>
						))}
				</div>
				<p className="text-sm text-muted-foreground mt-1">
					{report.total_expenses} expense
					{report.total_expenses !== 1 && "s"} &middot; Total:{" "}
					{formatCurrency(report.total_amount, currency)} &middot; Generated{" "}
					{format(new Date(report.generated_at), "MMM d, yyyy")}
				</p>
			</div>

			{/* Member Summaries */}
			{report.member_summaries.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<Users className="h-4 w-4 text-muted-foreground" />
							Member Breakdown
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{report.member_summaries.map((ms) => {
							const isPositive = ms.net_balance > 0;
							const isZero = ms.net_balance === 0;
							return (
								<div key={ms.id} className="space-y-1.5">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium">{ms.member_name}</p>
										<span
											className={`text-sm font-bold ${
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
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span>Paid: {formatCurrency(ms.total_paid, currency)}</span>
										<span>Owed: {formatCurrency(ms.total_owed, currency)}</span>
									</div>
									<Separator />
								</div>
							);
						})}
					</CardContent>
				</Card>
			)}

			{/* Category Breakdown */}
			{report.category_breakdowns.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<PiggyBank className="h-4 w-4 text-muted-foreground" />
							Category Breakdown
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

			{/* Expense Log */}
			{report.line_items.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<Receipt className="h-4 w-4 text-muted-foreground" />
							Expense Log ({report.line_items.length})
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-0 divide-y divide-border">
						{report.line_items.map((li) => (
							<LineItemRow
								key={li.id}
								item={li}
								currency={currency}
								expanded={expandedItem === li.id}
								onToggle={() =>
									setExpandedItem(expandedItem === li.id ? null : li.id)
								}
							/>
						))}
					</CardContent>
				</Card>
			)}

			{/* Transfers */}
			{report.transfers.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<ArrowRight className="h-4 w-4 text-muted-foreground" />
							Transfers
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
													Paid on{" "}
													{format(parseISO(transfer.paid_at), "MMM d, yyyy")}
												</p>
											)}
										</div>

										{!isPaid && (
											<Button
												size="sm"
												variant="outline"
												className="shrink-0 gap-1.5"
												onClick={() => handleMarkPaid(transfer.id)}
											>
												<Check className="h-3.5 w-3.5" />
												Mark Paid
											</Button>
										)}
										{isPaid && (
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
						No transfers needed — everything is balanced!
					</CardContent>
				</Card>
			)}
		</div>
	);
};

// Sub-component for expandable line items
function LineItemRow({
	item,
	currency,
	expanded,
	onToggle,
}: {
	item: ReportLineItem;
	currency: string;
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="py-3 first:pt-0 last:pb-0">
			<button
				type="button"
				className="w-full flex items-center justify-between text-left"
				onClick={onToggle}
			>
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
						{format(parseISO(item.incurred_at), "MMM d, yyyy")}
					</p>
				</div>
				<div className="flex items-center gap-2 shrink-0 ml-3">
					<p className="text-sm font-bold">
						{formatCurrency(item.amount, currency)}
					</p>
					{expanded ? (
						<ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
					) : (
						<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
					)}
				</div>
			</button>

			{expanded && (
				<div className="mt-2 ml-1 space-y-2 animate-fade-in">
					{/* Notes */}
					{item.notes && (
						<div className="flex items-start gap-2 bg-muted rounded-lg p-2.5">
							<FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
							<p className="text-xs text-muted-foreground">{item.notes}</p>
						</div>
					)}

					{/* Splits */}
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">
							Split breakdown
						</p>
						{item.splits.map((split) => (
							<div
								key={split.id}
								className="flex items-center justify-between text-xs"
							>
								<span className="text-muted-foreground">
									{split.member_name}
								</span>
								<span className="font-medium">
									{formatCurrency(split.amount, currency)}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
