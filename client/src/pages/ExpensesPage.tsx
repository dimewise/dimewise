import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Filter, Plus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { ExpenseDetailModal } from "@/components/Expense/ExpenseDetailModal";
import { ExpenseModal } from "@/components/Expense/ExpenseModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SkeletonList, SkeletonPage } from "@/components/ui/skeleton";
import { slideDown } from "@/lib/motion";
import { RoutesEnum } from "@/routes/Routes";
import type { ExpenseWithSplits, HouseholdMember } from "@/store/api/api";
import {
	useDeleteExpenseMutation,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
	useListExpensesQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatMonthYear } from "@/utils/date";

const PAGE_SIZE = 20;

export const ExpensesPage = () => {
	const { t } = useTranslation();
	const {
		data: household,
		isLoading: isHouseholdLoading,
		isError: isHouseholdError,
	} = useGetMyHouseholdQuery(undefined);
	const { data: categories } = useListBudgetCategoriesQuery(undefined, {
		skip: !household,
	});

	const [filters, setFilters] = useState<{
		categoryId?: string;
		paidBy?: string;
		from?: string;
		to?: string;
	}>({});
	const [page, setPage] = useState(1);
	const [showFilters, setShowFilters] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingExpense, setEditingExpense] =
		useState<ExpenseWithSplits | null>(null);
	const [deletingExpense, setDeletingExpense] =
		useState<ExpenseWithSplits | null>(null);
	const [viewingExpense, setViewingExpense] =
		useState<ExpenseWithSplits | null>(null);

	const {
		data: expenseData,
		isLoading: isExpensesLoading,
		isUninitialized: isExpensesUninitialized,
	} = useListExpensesQuery(
		{
			...filters,
			limit: PAGE_SIZE,
			offset: (page - 1) * PAGE_SIZE,
		},
		{ skip: !household },
	);
	const [deleteExpense] = useDeleteExpenseMutation();

	if (isHouseholdLoading) {
		return <SkeletonPage />;
	}

	if (isHouseholdError) {
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

	const totalPages = expenseData ? Math.ceil(expenseData.total / PAGE_SIZE) : 0;
	const hasActiveFilters = Object.values(filters).some(Boolean);

	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">
					{t("expenses.title")}
				</h1>
				<div className="flex items-center gap-2">
					<Button
						variant={showFilters ? "secondary" : "outline"}
						size="sm"
						className="gap-1.5"
						onClick={() => setShowFilters(!showFilters)}
					>
						<Filter className="h-3.5 w-3.5" />
						{t("expenses.filters")}
						{hasActiveFilters && (
							<span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-brand-foreground">
								!
							</span>
						)}
					</Button>
					<Button
						size="sm"
						className="gap-1.5"
						onClick={() => setModalOpen(true)}
					>
						<Plus className="h-4 w-4" />
						{t("expenses.add")}
					</Button>
				</div>
			</div>

			{/* Filters */}
			<AnimatePresence>
				{showFilters && (
					<motion.div
						variants={slideDown}
						initial="initial"
						animate="animate"
						exit="exit"
					>
						<Card>
							<CardContent className="p-4 space-y-3">
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<Label className="text-xs">{t("expenses.category")}</Label>
										<Select
											value={filters.categoryId ?? "all"}
											onValueChange={(v) =>
												setFilters((f) => ({
													...f,
													categoryId: v === "all" ? undefined : v,
												}))
											}
										>
											<SelectTrigger className="h-9 text-sm">
												<SelectValue
													placeholder={t("expenses.allCategories")}
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">
													{t("expenses.allCategories")}
												</SelectItem>
												{categories?.map((c) => (
													<SelectItem key={c.id} value={c.id}>
														{c.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-1.5">
										<Label className="text-xs">{t("expenses.paidBy")}</Label>
										<Select
											value={filters.paidBy ?? "all"}
											onValueChange={(v) =>
												setFilters((f) => ({
													...f,
													paidBy: v === "all" ? undefined : v,
												}))
											}
										>
											<SelectTrigger className="h-9 text-sm">
												<SelectValue placeholder={t("expenses.everyone")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">
													{t("expenses.everyone")}
												</SelectItem>
												{household.members.map((m) => (
													<SelectItem key={m.user_id} value={m.user_id}>
														{getMemberName(m.user_id)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<Label className="text-xs">{t("expenses.from")}</Label>
										<Input
											type="date"
											className="h-9 text-sm"
											value={filters.from?.split("T")[0] ?? ""}
											onChange={(e) =>
												setFilters((f) => ({
													...f,
													from: e.target.value
														? new Date(e.target.value).toISOString()
														: undefined,
												}))
											}
										/>
									</div>
									<div className="space-y-1.5">
										<Label className="text-xs">{t("expenses.to")}</Label>
										<Input
											type="date"
											className="h-9 text-sm"
											value={filters.to?.split("T")[0] ?? ""}
											onChange={(e) =>
												setFilters((f) => ({
													...f,
													to: e.target.value
														? new Date(e.target.value).toISOString()
														: undefined,
												}))
											}
										/>
									</div>
								</div>
								{hasActiveFilters && (
									<Button
										variant="ghost"
										size="sm"
										className="gap-1.5 text-muted-foreground"
										onClick={() => {
											setFilters({});
											setPage(1);
										}}
									>
										<X className="h-3.5 w-3.5" />
										{t("expenses.clearFilters")}
									</Button>
								)}
							</CardContent>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Expense list */}
			{isExpensesLoading || isExpensesUninitialized ? (
				<SkeletonList count={5} />
			) : expenseData && expenseData.expenses.length > 0 ? (
				<>
					<div className="space-y-2">
						{expenseData.expenses.map((expense, index) => {
							const monthKey = expense.incurred_at.slice(0, 7);
							const prevMonthKey =
								index > 0
									? expenseData.expenses[index - 1].incurred_at.slice(0, 7)
									: null;
							const showHeader = monthKey !== prevMonthKey;
							return (
								<div key={expense.id}>
									{showHeader && (
										<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-3 first:pt-0 pb-1">
											{formatMonthYear(
												Number(monthKey.slice(5)),
												Number(monthKey.slice(0, 4)),
											)}
										</p>
									)}
									<Card>
										<button
											type="button"
											className="w-full p-4 text-left"
											onClick={() => setViewingExpense(expense)}
										>
											<div className="flex items-center justify-between">
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2 flex-wrap">
														<h3 className="text-sm font-semibold truncate">
															{expense.title}
														</h3>
														{expense.budget_category_id && (
															<Badge variant="default" className="text-[10px]">
																{categoryMap.get(expense.budget_category_id) ??
																	t("expenses.unknown")}
															</Badge>
														)}
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														{getMemberName(expense.paid_by)} &middot;{" "}
														{formatDate(expense.incurred_at, "MMM d, yyyy")}{" "}
														&middot;{" "}
														{t("expenses.waySplit", {
															count: expense.splits.length,
														})}
													</p>
												</div>
												<p className="text-lg font-bold shrink-0 ml-4">
													{formatCurrency(expense.amount, currency)}
												</p>
											</div>
										</button>
									</Card>
								</div>
							);
						})}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between">
							<p className="text-xs text-muted-foreground">
								{t("expenses.expense", { count: expenseData.total })}
							</p>
							<div className="flex items-center gap-1">
								<Button
									variant="outline"
									size="icon"
									className="h-8 w-8"
									disabled={page <= 1}
									onClick={() => setPage((p) => p - 1)}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="text-xs px-2">
									{page} / {totalPages}
								</span>
								<Button
									variant="outline"
									size="icon"
									className="h-8 w-8"
									disabled={page >= totalPages}
									onClick={() => setPage((p) => p + 1)}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</>
			) : (
				<Card>
					<CardContent>
						<EmptyState
							image="/dimewise-empty.png"
							title={t("expenses.noExpenses")}
							description={t("expenses.noExpensesDescription")}
							action={
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => setModalOpen(true)}
								>
									<Plus className="h-4 w-4" />
									{t("expenses.addExpense")}
								</Button>
							}
						/>
					</CardContent>
				</Card>
			)}

			{/* Expense detail */}
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
					setEditingExpense(exp);
					setModalOpen(true);
				}}
				onDelete={(exp) => {
					setDeletingExpense(exp);
				}}
			/>

			{/* Create/Edit modal */}
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
						<Button variant="outline" onClick={() => setDeletingExpense(null)}>
							{t("common.cancel")}
						</Button>
						<Button variant="danger" onClick={handleDelete}>
							{t("common.delete")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
