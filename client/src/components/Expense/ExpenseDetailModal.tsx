import { Calendar, Edit2, Split, Trash2, User, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ExpenseWithSplits, HouseholdMember } from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

type Props = {
	open: boolean;
	onClose: () => void;
	expense: ExpenseWithSplits | null;
	currency: string;
	members: HouseholdMember[];
	categoryName?: string;
	onEdit: (expense: ExpenseWithSplits) => void;
	onDelete: (expense: ExpenseWithSplits) => void;
};

export const ExpenseDetailModal = ({
	open,
	onClose,
	expense,
	currency,
	members,
	categoryName,
	onEdit,
	onDelete,
}: Props) => {
	if (!expense) return null;

	const getMemberName = (userId: string) => {
		const m = members.find((m) => m.user_id === userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{expense.title}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Amount */}
					<div className="text-center py-2">
						<p className="text-3xl font-bold tracking-tight">
							{formatCurrency(expense.amount, currency)}
						</p>
						{categoryName && (
							<Badge variant="default" className="mt-2">
								{categoryName}
							</Badge>
						)}
					</div>

					<Separator />

					{/* Details grid */}
					<div className="space-y-3">
						<div className="flex items-center gap-3 text-sm">
							<User className="h-4 w-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Paid by</span>
							<span className="ml-auto font-medium">
								{getMemberName(expense.paid_by)}
							</span>
						</div>
						<div className="flex items-center gap-3 text-sm">
							<Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Date</span>
							<span className="ml-auto font-medium">
								{format(parseISO(expense.incurred_at), "MMMM d, yyyy")}
							</span>
						</div>
						<div className="flex items-center gap-3 text-sm">
							<Split className="h-4 w-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Split</span>
							<span className="ml-auto font-medium">
								{expense.splits.length}-way
							</span>
						</div>
					</div>

					{/* Notes */}
					{expense.notes && (
						<>
							<Separator />
							<div className="space-y-1.5">
								<p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
									<FileText className="h-3.5 w-3.5" />
									Notes
								</p>
								<p className="text-sm leading-relaxed bg-muted rounded-lg p-3">
									{expense.notes}
								</p>
							</div>
						</>
					)}

					{/* Splits breakdown */}
					<Separator />
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground">
							Split Breakdown
						</p>
						<div className="space-y-1.5">
							{expense.splits.map((split) => (
								<div
									key={split.id}
									className="flex items-center justify-between text-sm rounded-lg bg-muted px-3 py-2"
								>
									<span>{getMemberName(split.user_id)}</span>
									<span className="font-semibold">
										{formatCurrency(split.amount, currency)}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<DialogFooter className="flex-row justify-between sm:justify-between">
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5 text-danger hover:text-danger border-danger/30 hover:bg-danger/10"
						onClick={() => {
							onClose();
							onDelete(expense);
						}}
					>
						<Trash2 className="h-3.5 w-3.5" />
						Delete
					</Button>
					<Button
						size="sm"
						className="gap-1.5"
						onClick={() => {
							onClose();
							onEdit(expense);
						}}
					>
						<Edit2 className="h-3.5 w-3.5" />
						Edit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
