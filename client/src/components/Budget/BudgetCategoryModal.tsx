import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BudgetCategory } from "@/store/api/api";
import {
	useCreateBudgetCategoryMutation,
	useUpdateBudgetCategoryMutation,
} from "@/store/api/api";
import { fromSmallestUnit, toSmallestUnit } from "@/utils/currency";

type Props = {
	open: boolean;
	onClose: () => void;
	currency: string;
	category?: BudgetCategory | null;
};

export const BudgetCategoryModal = ({
	open,
	onClose,
	currency,
	category,
}: Props) => {
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const [createCategory, { isLoading: isCreating }] =
		useCreateBudgetCategoryMutation();
	const [updateCategory, { isLoading: isUpdating }] =
		useUpdateBudgetCategoryMutation();

	const isEditing = !!category;
	const isZeroDecimal = ["JPY", "KRW"].includes(currency.toUpperCase());

	useEffect(() => {
		if (open) {
			if (category) {
				setName(category.name);
				setAmount(String(fromSmallestUnit(category.amount, currency)));
			} else {
				setName("");
				setAmount("");
			}
		}
	}, [open, category, currency]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsedAmount = Number.parseFloat(amount);
		if (!name.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

		const amountInSmallestUnit = toSmallestUnit(parsedAmount, currency);

		try {
			if (isEditing && category) {
				await updateCategory({
					budgetId: category.id,
					updateBudgetCategoryRequest: {
						name: name.trim(),
						amount: amountInSmallestUnit,
					},
				}).unwrap();
				toast.success("Category updated!");
			} else {
				await createCategory({
					createBudgetCategoryRequest: {
						name: name.trim(),
						amount: amountInSmallestUnit,
					},
				}).unwrap();
				toast.success("Category created!");
			}
			onClose();
		} catch {
			toast.error(
				isEditing ? "Failed to update category." : "Failed to create category.",
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Budget Category" : "New Budget Category"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="cat-name">Category Name</Label>
						<Input
							id="cat-name"
							placeholder="e.g. Groceries, Rent, Utilities"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="cat-amount">Monthly Budget ({currency})</Label>
						<Input
							id="cat-amount"
							type="number"
							min="0"
							step={isZeroDecimal ? "1" : "0.01"}
							placeholder={isZeroDecimal ? "0" : "0.00"}
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							required
						/>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isCreating || isUpdating}>
							{isCreating || isUpdating
								? "Saving..."
								: isEditing
									? "Save"
									: "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
