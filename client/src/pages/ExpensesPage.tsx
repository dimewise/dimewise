import {
	ChevronLeft,
	ChevronRight,
	Edit2,
	Filter,
	Plus,
	Receipt,
	Trash2,
	X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FullPageSpinner } from "@/components/ui/spinner";
import { RoutesEnum } from "@/routes/Routes";
import type { ExpenseWithSplits, HouseholdMember } from "@/store/api/api";
import {
	useDeleteExpenseMutation,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
	useListExpensesQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

const PAGE_SIZE = 20;

export const ExpensesPage = () => {
	const { data: household, isLoading: isHouseholdLoading } =
		useGetMyHouseholdQuery();
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

	const { data: expenseData, isLoading: isExpensesLoading } =
		useListExpensesQuery(
			{
				...filters,
				limit: PAGE_SIZE,
				offset: (page - 1) * PAGE_SIZE,
			},
			{ skip: !household },
		);
	const [deleteExpense] = useDeleteExpenseMutation();

	if (isHouseholdLoading) {
		return <FullPageSpinner />;
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
			toast.success("Expense deleted.");
			setDeletingExpense(null);
		} catch {
			toast.error("Failed to delete expense.");
		}
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditingExpense(null);
	};

	const totalPages = expenseData ? Math.ceil(expenseData.total / PAGE_SIZE) : 0;
	const hasActiveFilters = Object.values(filters).some(Boolean);

	return (
		<div className="space-y-5 animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
				<div className="flex items-center gap-2">
					<Button
						variant={showFilters ? "secondary" : "outline"}
						size="sm"
						className="gap-1.5"
						onClick={() => setShowFilters(!showFilters)}
					>
						<Filter className="h-3.5 w-3.5" />
						Filters
						{hasActiveFilters && (
							<span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">
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
						Add
					</Button>
				</div>
			</div>

			{/* Filters */}
			{showFilters && (
				<Card className="animate-slide-down">
					<CardContent className="p-4 space-y-3">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs">Category</Label>
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
										<SelectValue placeholder="All categories" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All categories</SelectItem>
										{categories?.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{c.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Paid By</Label>
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
										<SelectValue placeholder="Everyone" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Everyone</SelectItem>
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
								<Label className="text-xs">From</Label>
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
								<Label className="text-xs">To</Label>
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
								Clear filters
							</Button>
						)}
					</CardContent>
				</Card>
			)}

			{/* Expense list */}
			{isExpensesLoading ? (
				<FullPageSpinner />
			) : expenseData && expenseData.expenses.length > 0 ? (
				<>
					<div className="space-y-2">
						{expenseData.expenses.map((expense) => (
							<Card key={expense.id}>
								<CardContent className="p-4">
									<div className="flex items-start justify-between">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2 flex-wrap">
												<h3 className="text-sm font-semibold truncate">
													{expense.title}
												</h3>
												{expense.budget_category_id && (
													<Badge variant="default" className="text-[10px]">
														{categoryMap.get(expense.budget_category_id) ??
															"Unknown"}
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												{getMemberName(expense.paid_by)} &middot;{" "}
												{format(parseISO(expense.incurred_at), "MMM d, yyyy")}{" "}
												&middot; {expense.splits.length}-way split
											</p>
										</div>
										<div className="flex items-center gap-1 shrink-0 ml-3">
											<p className="text-sm font-bold mr-1">
												{formatCurrency(expense.amount, currency)}
											</p>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7"
												onClick={() => {
													setEditingExpense(expense);
													setModalOpen(true);
												}}
											>
												<Edit2 className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-danger hover:text-danger"
												onClick={() => setDeletingExpense(expense)}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between">
							<p className="text-xs text-muted-foreground">
								{expenseData.total} expense{expenseData.total !== 1 && "s"}
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
							icon={<Receipt className="h-6 w-6" />}
							title="No expenses yet"
							description="Add your first expense to start tracking spending."
							action={
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => setModalOpen(true)}
								>
									<Plus className="h-4 w-4" />
									Add Expense
								</Button>
							}
						/>
					</CardContent>
				</Card>
			)}

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
						<DialogTitle>Delete Expense</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &ldquo;{deletingExpense?.title}
							&rdquo;?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeletingExpense(null)}>
							Cancel
						</Button>
						<Button variant="danger" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
