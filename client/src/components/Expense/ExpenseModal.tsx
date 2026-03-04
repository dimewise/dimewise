import {
	AlertCircle,
	ArrowRight,
	CheckCircle,
	Minus,
	Plus,
	Split,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ErrorBoundary } from "@/components/ui/error-boundary";
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
import { cn } from "@/lib/utils";
import { RoutesEnum } from "@/routes/Routes";
import type {
	BudgetCategory,
	ExpenseWithSplits,
	HouseholdMember,
} from "@/store/api/api";
import {
	useCreateExpenseMutation,
	useUpdateExpenseMutation,
} from "@/store/api/api";
import {
	formatCurrency,
	fromSmallestUnit,
	toSmallestUnit,
} from "@/utils/currency";

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
	const { t } = useTranslation();
	const navigate = useNavigate();

	const isEditing = !!expense;
	const isZeroDecimal = ["JPY", "KRW"].includes(currency.toUpperCase());
	const hasCategories = categories.length > 0;

	const [title, setTitle] = useState("");
	const [amount, setAmount] = useState("");
	const [paidBy, setPaidBy] = useState("");
	const [categoryId, setCategoryId] = useState("none");
	const [notes, setNotes] = useState("");
	const [date, setDate] = useState("");
	const [splits, setSplits] = useState<SplitEntry[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [submitted, setSubmitted] = useState(false);
	const [isCustomSplit, setIsCustomSplit] = useState(false);

	const getMemberName = (userId: string) => {
		const m = members.find((m) => m.user_id === userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	useEffect(() => {
		if (open) {
			setErrors({});
			setSubmitted(false);
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
				setIsCustomSplit(true);
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
				setIsCustomSplit(false);
			}
		}
	}, [open, expense, currency, members]);

	// Auto-split evenly when amount changes and user hasn't customized splits
	useEffect(() => {
		if (isCustomSplit) return;
		const total = Number.parseFloat(amount);
		if (Number.isNaN(total) || total <= 0 || splits.length === 0) return;

		const totalSmallest = toSmallestUnit(total, currency);
		const perPerson = Math.floor(totalSmallest / splits.length);
		const remainder = totalSmallest - perPerson * splits.length;

		setSplits((prev) =>
			prev.map((s, i) => ({
				...s,
				amount: String(
					fromSmallestUnit(perPerson + (i < remainder ? 1 : 0), currency),
				),
			})),
		);
	}, [amount, isCustomSplit, splits.length, currency]);

	const validate = useCallback((): Record<string, string> => {
		const errs: Record<string, string> = {};
		if (!title.trim()) errs.title = t("expenseModal.titleRequired");
		const parsedAmount = Number.parseFloat(amount);
		if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
			errs.amount = t("expenseModal.amountRequired");
		}
		if (!date) errs.date = t("expenseModal.dateRequired");
		if (!paidBy) errs.paidBy = t("expenseModal.paidByRequired");
		if (hasCategories && categoryId === "none") {
			errs.category = t("expenseModal.categoryRequired");
		}
		if (!errs.amount && amount) {
			const amtSmall = toSmallestUnit(parsedAmount, currency);
			const splitSum = splits.reduce(
				(sum, s) =>
					sum + toSmallestUnit(Number.parseFloat(s.amount) || 0, currency),
				0,
			);
			if (splitSum !== amtSmall) {
				errs.splits = t("expenseModal.splitsMismatch", {
					splitTotal: fromSmallestUnit(splitSum, currency),
					expenseTotal: parsedAmount,
				});
			}
		}
		return errs;
	}, [
		title,
		amount,
		date,
		paidBy,
		hasCategories,
		categoryId,
		splits,
		currency,
		t,
	]);

	// Re-validate on field changes after first submission attempt
	useEffect(() => {
		if (submitted) setErrors(validate());
	}, [submitted, validate]);

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
		setIsCustomSplit(false);
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
		if (field === "amount") setIsCustomSplit(true);
		setSplits(
			splits.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);

		const fieldErrors = validate();
		setErrors(fieldErrors);
		if (Object.keys(fieldErrors).length > 0) return;

		const parsedAmount = Number.parseFloat(amount);

		const amountSmallest = toSmallestUnit(parsedAmount, currency);
		const splitsSmallest = splits.map((s) => ({
			user_id: s.user_id,
			amount: toSmallestUnit(Number.parseFloat(s.amount) || 0, currency),
		}));

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
				toast.success(t("expenseModal.expenseUpdated"));
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
				toast.success(t("expenseModal.expenseCreated"));
			}
			onClose();
		} catch {
			toast.error(
				isEditing
					? t("expenseModal.updateFailed")
					: t("expenseModal.createFailed"),
			);
		}
	};

	// Live split total calculation
	const splitSum = splits.reduce(
		(sum, s) =>
			sum + toSmallestUnit(Number.parseFloat(s.amount) || 0, currency),
		0,
	);
	const parsedTotal = Number.parseFloat(amount);
	const totalSmallest =
		!Number.isNaN(parsedTotal) && parsedTotal > 0
			? toSmallestUnit(parsedTotal, currency)
			: 0;
	const splitRemaining = totalSmallest - splitSum;
	const isSplitBalanced = splitRemaining === 0 && totalSmallest > 0;

	const errCls = "border-danger focus-visible:ring-danger";

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<ErrorBoundary
					fallback={({ resetErrorBoundary }) => (
						<div className="flex flex-col items-center gap-3 py-6 text-center">
							<p className="text-sm text-muted-foreground">
								{t("error.title")}
							</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={onClose}>
									{t("common.close")}
								</Button>
								<Button size="sm" onClick={resetErrorBoundary}>
									{t("common.tryAgain")}
								</Button>
							</div>
						</div>
					)}
				>
					<DialogHeader>
						<DialogTitle>
							{isEditing
								? t("expenseModal.editTitle")
								: t("expenseModal.newTitle")}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4" noValidate>
						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="exp-title">
								{t("expenseModal.titleLabel")}{" "}
								<span className="text-danger">*</span>
							</Label>
							<Input
								id="exp-title"
								placeholder={t("expenseModal.titlePlaceholder")}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className={cn(errors.title && errCls)}
							/>
							{errors.title && (
								<p className="text-xs text-danger flex items-center gap-1">
									<AlertCircle className="h-3 w-3" />
									{errors.title}
								</p>
							)}
						</div>

						{/* Amount & Date row */}
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label htmlFor="exp-amount">
									{t("expenseModal.amount", { currency })}{" "}
									<span className="text-danger">*</span>
								</Label>
								<Input
									id="exp-amount"
									type="number"
									min="0"
									step={isZeroDecimal ? "1" : "0.01"}
									placeholder={isZeroDecimal ? "0" : "0.00"}
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className={cn(errors.amount && errCls)}
								/>
								{errors.amount && (
									<p className="text-xs text-danger flex items-center gap-1">
										<AlertCircle className="h-3 w-3" />
										{errors.amount}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="exp-date">
									{t("expenseModal.date")}{" "}
									<span className="text-danger">*</span>
								</Label>
								<Input
									id="exp-date"
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className={cn(errors.date && errCls)}
								/>
								{errors.date && (
									<p className="text-xs text-danger flex items-center gap-1">
										<AlertCircle className="h-3 w-3" />
										{errors.date}
									</p>
								)}
							</div>
						</div>

						{/* Paid By & Category */}
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label>
									{t("expenseModal.paidBy")}{" "}
									<span className="text-danger">*</span>
								</Label>
								<Select value={paidBy} onValueChange={setPaidBy}>
									<SelectTrigger className={cn(errors.paidBy && errCls)}>
										<SelectValue placeholder={t("expenseModal.selectMember")} />
									</SelectTrigger>
									<SelectContent>
										{members.map((m) => (
											<SelectItem key={m.user_id} value={m.user_id}>
												{getMemberName(m.user_id)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.paidBy && (
									<p className="text-xs text-danger flex items-center gap-1">
										<AlertCircle className="h-3 w-3" />
										{errors.paidBy}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									{t("expenseModal.category")}{" "}
									<span className="text-danger">*</span>
								</Label>
								{hasCategories ? (
									<>
										<Select value={categoryId} onValueChange={setCategoryId}>
											<SelectTrigger className={cn(errors.category && errCls)}>
												<SelectValue
													placeholder={t("expenseModal.selectCategory")}
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none" disabled>
													{t("expenseModal.selectACategory")}
												</SelectItem>
												{categories.map((c) => (
													<SelectItem key={c.id} value={c.id}>
														{c.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.category && (
											<p className="text-xs text-danger flex items-center gap-1">
												<AlertCircle className="h-3 w-3" />
												{errors.category}
											</p>
										)}
									</>
								) : (
									<div className="rounded-lg border border-warning/50 bg-warning-light p-2.5 space-y-2">
										<p className="text-xs text-warning font-medium">
											{t("expenseModal.noCategoriesWarning")}
										</p>
										<button
											type="button"
											className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition-colors"
											onClick={() => {
												onClose();
												navigate(RoutesEnum.budgets);
											}}
										>
											{t("expenseModal.goToBudgets")}
											<ArrowRight className="h-3 w-3" />
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Notes */}
						<div className="space-y-2">
							<Label htmlFor="exp-notes">{t("expenseModal.notesLabel")}</Label>
							<Textarea
								id="exp-notes"
								placeholder={t("expenseModal.notesPlaceholder")}
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
									{t("expenseModal.splits")}{" "}
									<span className="text-danger">*</span>
								</Label>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={splitEvenly}
								>
									{t("expenseModal.splitEvenly")}
								</Button>
							</div>

							{/* Live split total indicator */}
							{totalSmallest > 0 && (
								<div
									className={cn(
										"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium",
										isSplitBalanced
											? "bg-success-light text-success"
											: "bg-muted text-muted-foreground",
									)}
								>
									{isSplitBalanced ? (
										<>
											<CheckCircle className="h-3.5 w-3.5 shrink-0" />
											{t("expenseModal.splitsBalanced")}
										</>
									) : (
										<>
											<Split className="h-3.5 w-3.5 shrink-0" />
											{t("expenseModal.splitTotal", {
												splitTotal: formatCurrency(splitSum, currency),
												expenseTotal: formatCurrency(totalSmallest, currency),
												remaining: formatCurrency(
													Math.abs(splitRemaining),
													currency,
												),
											})}
										</>
									)}
								</div>
							)}

							{errors.splits && (
								<div className="rounded-lg border border-danger/30 bg-danger-light p-2.5">
									<p className="text-xs text-danger font-medium flex items-center gap-1">
										<AlertCircle className="h-3 w-3 shrink-0" />
										{errors.splits}
									</p>
								</div>
							)}

							<div className="space-y-2">
								{splits.map((split, index) => (
									<div
										key={split.user_id}
										className={cn(
											"flex items-center gap-2 rounded-lg bg-muted p-2.5",
											errors.splits && "ring-1 ring-danger/30",
										)}
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
									{t("expenseModal.addSplit")}
								</Button>
							)}
						</div>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose}>
								{t("common.cancel")}
							</Button>
							<Button
								type="submit"
								disabled={isCreating || isUpdating || !hasCategories}
							>
								{isCreating || isUpdating
									? t("common.saving")
									: isEditing
										? t("common.save")
										: t("common.create")}
							</Button>
						</DialogFooter>
					</form>
				</ErrorBoundary>
			</DialogContent>
		</Dialog>
	);
};
