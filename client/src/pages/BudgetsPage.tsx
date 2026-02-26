import { Edit2, PiggyBank, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { BudgetCategoryModal } from "@/components/Budget/BudgetCategoryModal";
import { BudgetOverviewCard } from "@/components/Budget/BudgetOverviewCard";
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
import { Progress } from "@/components/ui/progress";
import { SkeletonList, SkeletonPage } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RoutesEnum } from "@/routes/Routes";
import type { BudgetCategory } from "@/store/api/api";
import {
	useDeleteBudgetCategoryMutation,
	useGetBudgetOverviewQuery,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

export const BudgetsPage = () => {
	const {
		data: household,
		isLoading: isHouseholdLoading,
		isError: isHouseholdError,
	} = useGetMyHouseholdQuery();
	const { data: categories, isLoading: isCategoriesLoading } =
		useListBudgetCategoriesQuery(undefined, { skip: !household });
	const { data: overview } = useGetBudgetOverviewQuery(undefined, {
		skip: !household,
	});
	const [deleteCategory] = useDeleteBudgetCategoryMutation();

	const [modalOpen, setModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
		null,
	);
	const [deletingCategory, setDeletingCategory] =
		useState<BudgetCategory | null>(null);

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

	const spentByCategory = new Map<string, number>();
	if (overview) {
		for (const cat of overview.categories) {
			spentByCategory.set(cat.id, cat.spent);
		}
	}

	const handleEdit = (category: BudgetCategory) => {
		setEditingCategory(category);
		setModalOpen(true);
	};

	const handleDelete = async () => {
		if (!deletingCategory) return;
		try {
			await deleteCategory({ budgetId: deletingCategory.id }).unwrap();
			toast.success(`"${deletingCategory.name}" deleted.`);
			setDeletingCategory(null);
		} catch {
			toast.error("Failed to delete category.");
		}
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditingCategory(null);
	};

	return (
		<div className="space-y-5 animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
				<Button
					size="sm"
					className="gap-1.5"
					onClick={() => setModalOpen(true)}
				>
					<Plus className="h-4 w-4" />
					Add Category
				</Button>
			</div>

			{/* Overview */}
			{overview && (
				<BudgetOverviewCard overview={overview} currency={currency} />
			)}

			{/* Category list */}
			{isCategoriesLoading ? (
				<SkeletonList count={3} />
			) : categories && categories.length > 0 ? (
				<div className="space-y-3">
					{categories.map((cat) => {
						const spent = spentByCategory.get(cat.id) ?? 0;
						const pct =
							cat.amount > 0 ? Math.round((spent / cat.amount) * 100) : 0;
						const progressColor =
							pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-brand";

						return (
							<Card key={cat.id}>
								<CardContent className="p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<h3 className="text-sm font-semibold truncate">
													{cat.name}
												</h3>
												{pct >= 100 && (
													<Badge variant="danger" className="shrink-0">
														Over budget
													</Badge>
												)}
												{pct >= 80 && pct < 100 && (
													<Badge variant="warning" className="shrink-0">
														Almost there
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground mt-0.5">
												{formatCurrency(spent, currency)} of{" "}
												{formatCurrency(cat.amount, currency)}
											</p>
										</div>
										<div className="flex items-center gap-1 shrink-0 ml-2">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => handleEdit(cat)}
											>
												<Edit2 className="h-3.5 w-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className={cn("h-8 w-8 text-danger hover:text-danger")}
												onClick={() => setDeletingCategory(cat)}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
									</div>
									<div className="space-y-1">
										<Progress value={pct} indicatorClassName={progressColor} />
										<p className="text-xs text-muted-foreground text-right">
											{pct}%
										</p>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			) : (
				<Card>
					<CardContent>
						<EmptyState
							icon={<PiggyBank className="h-6 w-6" />}
							title="No budget categories yet"
							description="Create your first category to start tracking spending."
							action={
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => setModalOpen(true)}
								>
									<Plus className="h-4 w-4" />
									Add Category
								</Button>
							}
						/>
					</CardContent>
				</Card>
			)}

			{/* Create/Edit modal */}
			<BudgetCategoryModal
				open={modalOpen}
				onClose={handleCloseModal}
				currency={currency}
				category={editingCategory}
			/>

			{/* Delete confirmation */}
			<Dialog
				open={!!deletingCategory}
				onOpenChange={(v) => !v && setDeletingCategory(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Category</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &ldquo;{deletingCategory?.name}
							&rdquo;? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeletingCategory(null)}>
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
