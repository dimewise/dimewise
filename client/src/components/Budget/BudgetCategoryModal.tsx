import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
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
				toast.success(t("budgetModal.categoryUpdated"));
			} else {
				await createCategory({
					createBudgetCategoryRequest: {
						name: name.trim(),
						amount: amountInSmallestUnit,
					},
				}).unwrap();
				toast.success(t("budgetModal.categoryCreated"));
			}
			onClose();
		} catch {
			toast.error(
				isEditing
					? t("budgetModal.updateFailed")
					: t("budgetModal.createFailed"),
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? t("budgetModal.editTitle") : t("budgetModal.newTitle")}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="cat-name">{t("budgetModal.categoryName")}</Label>
						<Input
							id="cat-name"
							placeholder={t("budgetModal.categoryNamePlaceholder")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="cat-amount">
							{t("budgetModal.monthlyBudget", { currency })}
						</Label>
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
							{t("common.cancel")}
						</Button>
						<Button type="submit" disabled={isCreating || isUpdating}>
							{isCreating || isUpdating
								? t("common.saving")
								: isEditing
									? t("common.save")
									: t("common.create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
