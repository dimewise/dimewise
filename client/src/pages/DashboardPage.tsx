import {
	ArrowRight,
	Calendar,
	DollarSign,
	FileBarChart,
	Receipt,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router";
import { BudgetOverviewCard } from "@/components/Budget/BudgetOverviewCard";
import { BalanceWidget } from "@/components/Dashboard/BalanceWidget";
import { ExpenseDetailModal } from "@/components/Expense/ExpenseDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton, SkeletonDashboard } from "@/components/ui/skeleton";
import { RoutesEnum } from "@/routes/Routes";
import type { ExpenseWithSplits, HouseholdMember } from "@/store/api/api";
import {
	useGetBudgetOverviewQuery,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
	useListExpensesQuery,
	useListReportsQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

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
	} = useListExpensesQuery({ limit: 5, offset: 0 }, { skip: !household });
	const {
		data: reports,
		isLoading: isReportsLoading,
		isUninitialized: isReportsUninitialized,
	} = useListReportsQuery(undefined, { skip: !household });
	const { data: categories } = useListBudgetCategoriesQuery(undefined, {
		skip: !household,
	});

	const [viewingExpense, setViewingExpense] =
		useState<ExpenseWithSplits | null>(null);

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

	return (
		<div className="space-y-5 animate-fade-in">
			{/* Greeting */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					{t("dashboard.title")}
				</h1>
				<p className="text-sm text-muted-foreground mt-0.5">{household.name}</p>
			</div>

			{/* Quick stats */}
			<div className="grid grid-cols-3 gap-3">
				<Card>
					<CardContent className="p-3 flex flex-col items-center text-center">
						<Users className="h-5 w-5 text-brand mb-1.5" />
						<p className="text-lg font-bold">{household.members.length}</p>
						<p className="text-xs text-muted-foreground">
							{t("dashboard.members")}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-3 flex flex-col items-center text-center">
						<DollarSign className="h-5 w-5 text-success mb-1.5" />
						<p className="text-lg font-bold">{household.currency}</p>
						<p className="text-xs text-muted-foreground">
							{t("dashboard.currency")}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-3 flex flex-col items-center text-center">
						<FileBarChart className="h-5 w-5 text-warning mb-1.5" />
						<p className="text-lg font-bold">{reports?.length ?? 0}</p>
						<p className="text-xs text-muted-foreground">
							{t("dashboard.reports")}
						</p>
					</CardContent>
				</Card>
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
						<Receipt className="h-4 w-4 text-muted-foreground" />
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
						<div className="divide-y divide-border">
							{expenseData.expenses.map((expense) => (
								<button
									key={expense.id}
									type="button"
									className="flex items-center justify-between py-3 first:pt-0 last:pb-0 w-full text-left"
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
								</button>
							))}
						</div>
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
						<FileBarChart className="h-4 w-4 text-muted-foreground" />
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
						<div className="divide-y divide-border">
							{reports.slice(0, 3).map((r) => (
								<div
									key={r.id}
									className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
								>
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
										<Calendar className="h-4 w-4 text-muted-foreground" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium">
											{t(`months.${r.month}`)} {r.year}
										</p>
										<p className="text-xs text-muted-foreground">
											{t("dashboard.expense", {
												count: r.total_expenses,
											})}{" "}
											&middot; {formatCurrency(r.total_amount, currency)}
										</p>
									</div>
								</div>
							))}
						</div>
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
				onEdit={() => {
					setViewingExpense(null);
					navigate(RoutesEnum.expenses);
				}}
				onDelete={() => {
					setViewingExpense(null);
					navigate(RoutesEnum.expenses);
				}}
			/>
		</div>
	);
};
