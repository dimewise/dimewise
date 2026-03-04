import { ArrowRight, Calendar, FileBarChart, Receipt } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { BudgetOverviewCard } from "@/components/Budget/BudgetOverviewCard";
import { BalanceWidget } from "@/components/Dashboard/BalanceWidget";
import { ExpenseDetailModal } from "@/components/Expense/ExpenseDetailModal";
import { ExpenseModal } from "@/components/Expense/ExpenseModal";
import { ReportSummaryModal } from "@/components/Report/ReportSummaryModal";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { Skeleton, SkeletonDashboard } from "@/components/ui/skeleton";
import { Touchable } from "@/components/ui/touchable";
import { RoutesEnum } from "@/routes/Routes";
import type { ExpenseWithSplits, HouseholdMember } from "@/store/api/api";
import {
	useDeleteExpenseMutation,
	useGetBudgetOverviewQuery,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
	useListExpensesQuery,
	useListReportsQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatMonthYear } from "@/utils/date";

export const DashboardPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const {
		data: household,
		isLoading,
		error,
	} = useGetMyHouseholdQuery(undefined);
	const { data: overview } = useGetBudgetOverviewQuery(undefined, {
		skip: !household,
	});
	const {
		data: expenseData,
		isLoading: isExpensesLoading,
		isUninitialized: isExpensesUninitialized,
		refetch: refetchExpenses,
	} = useListExpensesQuery({ limit: 5, offset: 0 }, { skip: !household });
	const {
		data: reports,
		isLoading: isReportsLoading,
		isUninitialized: isReportsUninitialized,
		refetch: refetchReports,
	} = useListReportsQuery(undefined, { skip: !household });
	const { data: categories } = useListBudgetCategoriesQuery(undefined, {
		skip: !household,
	});
	const [deleteExpense] = useDeleteExpenseMutation();

	const [viewingExpense, setViewingExpense] =
		useState<ExpenseWithSplits | null>(null);
	const [editingExpense, setEditingExpense] =
		useState<ExpenseWithSplits | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [deletingExpense, setDeletingExpense] =
		useState<ExpenseWithSplits | null>(null);
	const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

	const handleRefresh = useCallback(
		() => Promise.all([refetchExpenses(), refetchReports()]),
		[refetchExpenses, refetchReports],
	);

	if (isLoading) {
		return <SkeletonDashboard />;
	}

	if (error && "status" in error && error.status === 404) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	if (error) {
		return <ErrorState onRetry={() => window.location.reload()} />;
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	const currency = household.currency;
	const memberMap = new Map<string, HouseholdMember>();
	for (const m of household.members) {
		memberMap.set(m.user_id, m);
	}

	const categoryMap = new Map<string, string>();
	if (categories) {
		for (const c of categories) {
			categoryMap.set(c.id, c.name);
		}
	}

	const getMemberName = (userId: string) => {
		const m = memberMap.get(userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	const handleDelete = async () => {
		if (!deletingExpense) return;
		try {
			await deleteExpense({ expenseId: deletingExpense.id }).unwrap();
			toast.success(t("expenses.expenseDeleted"));
			setDeletingExpense(null);
		} catch {
			toast.error(t("expenses.deleteFailed"));
		}
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditingExpense(null);
	};

	return (
		<PullToRefresh onRefresh={handleRefresh}>
			<div className="space-y-5">
				{/* Greeting */}
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.title")}
					</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						{household.name}
					</p>
				</div>

				{/* Balance widget */}
				<BalanceWidget currency={currency} />

				{/* Budget overview */}
				{overview && (
					<BudgetOverviewCard overview={overview} currency={currency} />
				)}

				{/* Recent expenses */}
				<Card>
					<CardHeader className="flex-row items-center justify-between pb-0">
						<CardTitle className="flex items-center gap-2 text-base">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light">
								<Receipt className="h-4 w-4 text-brand" />
							</div>
							{t("dashboard.recentExpenses")}
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							className="text-brand gap-1"
							onClick={() => navigate(RoutesEnum.expenses)}
						>
							{t("dashboard.viewAll")}
							<ArrowRight className="h-3.5 w-3.5" />
						</Button>
					</CardHeader>
					<CardContent>
						{isExpensesLoading || isExpensesUninitialized ? (
							<div className="space-y-3 py-1">
								{Array.from({ length: 3 }).map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
									<div key={i} className="flex items-center justify-between">
										<div className="space-y-1.5 flex-1">
											<Skeleton className="h-4 w-2/3" />
											<Skeleton className="h-3 w-1/3" />
										</div>
										<Skeleton className="h-4 w-16" />
									</div>
								))}
							</div>
						) : expenseData && expenseData.expenses.length > 0 ? (
							<AnimatedList className="divide-y divide-border">
								{expenseData.expenses.map((expense, i) => (
									<AnimatedListItem
										key={expense.id}
										itemKey={expense.id}
										index={i}
										className="py-3 first:pt-0 last:pb-0"
									>
										<Touchable
											className="flex items-center justify-between w-full text-left"
											onClick={() => setViewingExpense(expense)}
										>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium truncate">
													{expense.title}
												</p>
												<p className="text-xs text-muted-foreground">
													{getMemberName(expense.paid_by)} &middot;{" "}
													{formatDate(expense.incurred_at, "MMM d")}
												</p>
											</div>
											<p className="text-sm font-semibold ml-3 shrink-0">
												{formatCurrency(expense.amount, currency)}
											</p>
										</Touchable>
									</AnimatedListItem>
								))}
							</AnimatedList>
						) : (
							<EmptyState
								image="/dimewise-empty.png"
								title={t("dashboard.noExpenses")}
								description={t("dashboard.noExpensesDescription")}
								className="py-6"
							/>
						)}
					</CardContent>
				</Card>

				{/* Recent reports */}
				<Card>
					<CardHeader className="flex-row items-center justify-between pb-0">
						<CardTitle className="flex items-center gap-2 text-base">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-light">
								<FileBarChart className="h-4 w-4 text-warning" />
							</div>
							{t("dashboard.recentReports")}
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							className="text-brand gap-1"
							onClick={() => navigate(RoutesEnum.reports)}
						>
							{t("dashboard.viewAll")}
							<ArrowRight className="h-3.5 w-3.5" />
						</Button>
					</CardHeader>
					<CardContent>
						{isReportsLoading || isReportsUninitialized ? (
							<div className="space-y-3 py-1">
								{Array.from({ length: 3 }).map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
									<div key={i} className="flex items-center gap-3">
										<Skeleton className="h-9 w-9 rounded-lg shrink-0" />
										<div className="space-y-1.5 flex-1">
											<Skeleton className="h-4 w-1/2" />
											<Skeleton className="h-3 w-1/3" />
										</div>
									</div>
								))}
							</div>
						) : reports && reports.length > 0 ? (
							<AnimatedList className="divide-y divide-border">
								{reports.slice(0, 3).map((r, i) => (
									<AnimatedListItem
										key={r.id}
										itemKey={r.id}
										index={i}
										className="py-3 first:pt-0 last:pb-0"
									>
										<Touchable
											className="flex items-center gap-3 w-full text-left"
											onClick={() => setSelectedReportId(r.id)}
										>
											<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
												<Calendar className="h-4 w-4 text-muted-foreground" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium">
													{formatMonthYear(r.month, r.year)}
												</p>
												<p className="text-xs text-muted-foreground">
													{t("dashboard.expense", {
														count: r.total_expenses,
													})}{" "}
													&middot; {formatCurrency(r.total_amount, currency)}
												</p>
											</div>
										</Touchable>
									</AnimatedListItem>
								))}
							</AnimatedList>
						) : (
							<EmptyState
								image="/dimewise-empty-report.png"
								title={t("dashboard.noReports")}
								description={t("dashboard.noReportsDescription")}
								className="py-6"
							/>
						)}
					</CardContent>
				</Card>

				{/* Expense detail modal */}
				<ExpenseDetailModal
					open={!!viewingExpense}
					onClose={() => setViewingExpense(null)}
					expense={viewingExpense}
					currency={currency}
					members={household.members}
					categoryName={
						viewingExpense?.budget_category_id
							? categoryMap.get(viewingExpense.budget_category_id)
							: undefined
					}
					onEdit={(exp) => {
						setViewingExpense(null);
						setEditingExpense(exp);
						setModalOpen(true);
					}}
					onDelete={(exp) => {
						setViewingExpense(null);
						setDeletingExpense(exp);
					}}
				/>

				{/* Edit expense modal */}
				<ExpenseModal
					open={modalOpen}
					onClose={handleCloseModal}
					currency={currency}
					members={household.members}
					categories={categories ?? []}
					expense={editingExpense}
				/>

				{/* Delete confirmation */}
				<Dialog
					open={!!deletingExpense}
					onOpenChange={(v) => !v && setDeletingExpense(null)}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("expenses.deleteExpense")}</DialogTitle>
							<DialogDescription>
								{t("expenses.deleteExpenseConfirm", {
									title: deletingExpense?.title,
								})}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setDeletingExpense(null)}
							>
								{t("common.cancel")}
							</Button>
							<Button variant="danger" onClick={handleDelete}>
								{t("common.delete")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Report summary modal */}
				{selectedReportId && (
					<ReportSummaryModal
						open={!!selectedReportId}
						onClose={() => setSelectedReportId(null)}
						reportId={selectedReportId}
						currency={currency}
					/>
				)}
			</div>
		</PullToRefresh>
	);
};
