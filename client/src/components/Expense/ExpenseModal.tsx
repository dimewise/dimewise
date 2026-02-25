import { Minus, Plus, Split } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
	BudgetCategory,
	ExpenseWithSplits,
	HouseholdMember,
} from "@/store/api/api";
import {
	useCreateExpenseMutation,
	useUpdateExpenseMutation,
} from "@/store/api/api";
import { fromSmallestUnit, toSmallestUnit } from "@/utils/currency";

type Props = {
	open: boolean;
	onClose: () => void;
	currency: string;
	members: HouseholdMember[];
	categories: BudgetCategory[];
	expense?: ExpenseWithSplits | null;
};

type SplitEntry = {
	user_id: string;
	amount: string;
};

export const ExpenseModal = ({
	open,
	onClose,
	currency,
	members,
	categories,
	expense,
}: Props) => {
	const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
	const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

	const isEditing = !!expense;
	const isZeroDecimal = ["JPY", "KRW"].includes(currency.toUpperCase());

	const [title, setTitle] = useState("");
	const [amount, setAmount] = useState("");
	const [paidBy, setPaidBy] = useState("");
	const [categoryId, setCategoryId] = useState("none");
	const [notes, setNotes] = useState("");
	const [date, setDate] = useState("");
	const [splits, setSplits] = useState<SplitEntry[]>([]);

	const getMemberName = (userId: string) => {
		const m = members.find((m) => m.user_id === userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	useEffect(() => {
		if (open) {
			if (expense) {
				setTitle(expense.title);
				setAmount(String(fromSmallestUnit(expense.amount, currency)));
				setPaidBy(expense.paid_by);
				setCategoryId(expense.budget_category_id ?? "none");
				setNotes(expense.notes ?? "");
				setDate(expense.incurred_at.split("T")[0] ?? "");
				setSplits(
					expense.splits.map((s) => ({
						user_id: s.user_id,
						amount: String(fromSmallestUnit(s.amount, currency)),
					})),
				);
			} else {
				setTitle("");
				setAmount("");
				setPaidBy(members[0]?.user_id ?? "");
				setCategoryId("none");
				setNotes("");
				setDate(new Date().toISOString().split("T")[0] ?? "");
				setSplits(
					members.map((m) => ({
						user_id: m.user_id,
						amount: "0",
					})),
				);
			}
		}
	}, [open, expense, currency, members]);

	const splitEvenly = () => {
		const total = Number.parseFloat(amount);
		if (Number.isNaN(total) || total <= 0 || splits.length === 0) return;

		const totalSmallest = toSmallestUnit(total, currency);
		const perPerson = Math.floor(totalSmallest / splits.length);
		const remainder = totalSmallest - perPerson * splits.length;

		setSplits(
			splits.map((s, i) => ({
				...s,
				amount: String(
					fromSmallestUnit(perPerson + (i < remainder ? 1 : 0), currency),
				),
			})),
		);
	};

	const addSplit = () => {
		const usedIds = new Set(splits.map((s) => s.user_id));
		const available = members.find((m) => !usedIds.has(m.user_id));
		if (available) {
			setSplits([...splits, { user_id: available.user_id, amount: "0" }]);
		}
	};

	const removeSplit = (index: number) => {
		if (splits.length <= 1) return;
		setSplits(splits.filter((_, i) => i !== index));
	};

	const updateSplit = (
		index: number,
		field: keyof SplitEntry,
		value: string,
	) => {
		setSplits(
			splits.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const parsedAmount = Number.parseFloat(amount);
		if (!title.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
			toast.error("Please fill in all required fields.");
			return;
		}

		const amountSmallest = toSmallestUnit(parsedAmount, currency);
		const splitsSmallest = splits.map((s) => ({
			user_id: s.user_id,
			amount: toSmallestUnit(Number.parseFloat(s.amount) || 0, currency),
		}));

		const splitsSum = splitsSmallest.reduce((sum, s) => sum + s.amount, 0);
		if (splitsSum !== amountSmallest) {
			toast.error(
				`Splits must add up to the total amount. Sum: ${fromSmallestUnit(splitsSum, currency)}, expected: ${parsedAmount}`,
			);
			return;
		}

		const dateISO = new Date(`${date}T12:00:00`).toISOString();

		try {
			if (isEditing && expense) {
				await updateExpense({
					expenseId: expense.id,
					updateExpenseRequest: {
						title: title.trim(),
						amount: amountSmallest,
						paid_by: paidBy,
						budget_category_id: categoryId === "none" ? undefined : categoryId,
						notes: notes.trim() || undefined,
						incurred_at: dateISO,
						splits: splitsSmallest,
					},
				}).unwrap();
				toast.success("Expense updated!");
			} else {
				await createExpense({
					createExpenseRequest: {
						title: title.trim(),
						amount: amountSmallest,
						paid_by: paidBy,
						budget_category_id: categoryId === "none" ? undefined : categoryId,
						notes: notes.trim() || undefined,
						incurred_at: dateISO,
						splits: splitsSmallest,
					},
				}).unwrap();
				toast.success("Expense created!");
			}
			onClose();
		} catch {
			toast.error(
				isEditing ? "Failed to update expense." : "Failed to create expense.",
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Expense" : "New Expense"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="exp-title">Title</Label>
						<Input
							id="exp-title"
							placeholder="e.g. Groceries at Trader Joe's"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					{/* Amount & Date row */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label htmlFor="exp-amount">Amount ({currency})</Label>
							<Input
								id="exp-amount"
								type="number"
								min="0"
								step={isZeroDecimal ? "1" : "0.01"}
								placeholder={isZeroDecimal ? "0" : "0.00"}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="exp-date">Date</Label>
							<Input
								id="exp-date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>
					</div>

					{/* Paid By & Category */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label>Paid By</Label>
							<Select value={paidBy} onValueChange={setPaidBy}>
								<SelectTrigger>
									<SelectValue placeholder="Select member" />
								</SelectTrigger>
								<SelectContent>
									{members.map((m) => (
										<SelectItem key={m.user_id} value={m.user_id}>
											{getMemberName(m.user_id)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Category</Label>
							<Select value={categoryId} onValueChange={setCategoryId}>
								<SelectTrigger>
									<SelectValue placeholder="No category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No category</SelectItem>
									{categories.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="exp-notes">Notes (optional)</Label>
						<Textarea
							id="exp-notes"
							placeholder="Optional notes..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={2}
						/>
					</div>

					{/* Splits */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="flex items-center gap-1.5">
								<Split className="h-3.5 w-3.5" />
								Splits
							</Label>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={splitEvenly}
							>
								Split Evenly
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Splits must add up to the total amount.
						</p>

						<div className="space-y-2">
							{splits.map((split, index) => (
								<div
									key={split.user_id}
									className="flex items-center gap-2 rounded-xl bg-muted p-2.5"
								>
									<Select
										value={split.user_id}
										onValueChange={(v) => updateSplit(index, "user_id", v)}
									>
										<SelectTrigger className="min-w-0 flex-1 bg-surface h-9 [&>span]:truncate">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{members.map((m) => (
												<SelectItem key={m.user_id} value={m.user_id}>
													{getMemberName(m.user_id)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										type="number"
										min="0"
										step={isZeroDecimal ? "1" : "0.01"}
										placeholder="0"
										value={split.amount}
										onChange={(e) =>
											updateSplit(index, "amount", e.target.value)
										}
										className="w-24 h-9 text-right bg-surface"
									/>
									{splits.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-danger hover:text-danger shrink-0"
											onClick={() => removeSplit(index)}
										>
											<Minus className="h-3.5 w-3.5" />
										</Button>
									)}
								</div>
							))}
						</div>

						{splits.length < members.length && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="w-full gap-1.5"
								onClick={addSplit}
							>
								<Plus className="h-3.5 w-3.5" />
								Add Split
							</Button>
						)}
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
