import { useState } from "react";
import {
	ArrowRight,
	Calendar,
	DollarSign,
	Receipt,
	Scale,
	Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Navigate, useNavigate } from "react-router";
import { BudgetOverviewCard } from "@/components/Budget/BudgetOverviewCard";
import { ExpenseDetailModal } from "@/components/Expense/ExpenseDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner } from "@/components/ui/spinner";
import { RoutesEnum } from "@/routes/Routes";
import type { ExpenseWithSplits, HouseholdMember } from "@/store/api/api";
import {
	useGetBudgetOverviewQuery,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
	useListExpensesQuery,
	useListSettlementsQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

const MONTH_NAMES = [
	"",
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const DashboardPage = () => {
	const navigate = useNavigate();
	const { data: household, isLoading, error } = useGetMyHouseholdQuery();
	const { data: overview } = useGetBudgetOverviewQuery(undefined, {
		skip: !household,
	});
	const { data: expenseData } = useListExpensesQuery(
		{ limit: 5, offset: 0 },
		{ skip: !household },
	);
	const { data: settlements } = useListSettlementsQuery(undefined, {
		skip: !household,
	});
	const { data: categories } = useListBudgetCategoriesQuery(undefined, {
		skip: !household,
	});

	const [viewingExpense, setViewingExpense] =
		useState<ExpenseWithSplits | null>(null);

	if (isLoading) {
		return <FullPageSpinner />;
	}

	if (error && "status" in error && error.status === 404) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
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
				<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-sm text-muted-foreground mt-0.5">{household.name}</p>
			</div>

			{/* Quick stats */}
			<div className="grid grid-cols-3 gap-3">
				<Card>
					<CardContent className="p-3 flex flex-col items-center text-center">
						<Users className="h-5 w-5 text-brand mb-1.5" />
						<p className="text-lg font-bold">{household.members.length}</p>
						<p className="text-xs text-muted-foreground">Members</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-3 flex flex-col items-center text-center">
						<DollarSign className="h-5 w-5 text-success mb-1.5" />
						<p className="text-lg font-bold">{household.currency}</p>
						<p className="text-xs text-muted-foreground">Currency</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-3 flex flex-col items-center text-center">
						<Scale className="h-5 w-5 text-warning mb-1.5" />
						<p className="text-lg font-bold">{settlements?.length ?? 0}</p>
						<p className="text-xs text-muted-foreground">Settlements</p>
					</CardContent>
				</Card>
			</div>

			{/* Budget overview */}
			{overview && (
				<BudgetOverviewCard overview={overview} currency={currency} />
			)}

			{/* Recent expenses */}
			<Card>
				<CardHeader className="flex-row items-center justify-between pb-0">
					<CardTitle className="flex items-center gap-2 text-base">
						<Receipt className="h-4 w-4 text-muted-foreground" />
						Recent Expenses
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="text-brand gap-1"
						onClick={() => navigate(RoutesEnum.expenses)}
					>
						View All
						<ArrowRight className="h-3.5 w-3.5" />
					</Button>
				</CardHeader>
				<CardContent>
					{expenseData && expenseData.expenses.length > 0 ? (
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
											{format(parseISO(expense.incurred_at), "MMM d")}
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
							icon={<Receipt className="h-6 w-6" />}
							title="No expenses yet"
							description="Start by adding your first expense."
							className="py-6"
						/>
					)}
				</CardContent>
			</Card>

			{/* Recent settlements */}
			<Card>
				<CardHeader className="flex-row items-center justify-between pb-0">
					<CardTitle className="flex items-center gap-2 text-base">
						<Scale className="h-4 w-4 text-muted-foreground" />
						Recent Settlements
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="text-brand gap-1"
						onClick={() => navigate(RoutesEnum.settlements)}
					>
						View All
						<ArrowRight className="h-3.5 w-3.5" />
					</Button>
				</CardHeader>
				<CardContent>
					{settlements && settlements.length > 0 ? (
						<div className="divide-y divide-border">
							{settlements.slice(0, 3).map((s) => (
								<div
									key={s.id}
									className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
								>
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
										<Calendar className="h-4 w-4 text-muted-foreground" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium">
											{MONTH_NAMES[s.month]} {s.year}
										</p>
										<p className="text-xs text-muted-foreground">
											Generated{" "}
											{format(parseISO(s.generated_at), "MMM d, yyyy")}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<EmptyState
							icon={<Scale className="h-6 w-6" />}
							title="No settlements yet"
							description="Generate one for a completed month."
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
