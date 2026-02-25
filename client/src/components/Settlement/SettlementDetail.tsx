import { ArrowRight, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import type { HouseholdMember } from "@/store/api/api";
import {
	useGetSettlementQuery,
	useMarkTransferPaidMutation,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

type Props = {
	settlementId: string;
	currency: string;
	members: HouseholdMember[];
	onBack: () => void;
};

export const SettlementDetail = ({
	settlementId,
	currency,
	members,
	onBack,
}: Props) => {
	const { data: settlement, isLoading } = useGetSettlementQuery({
		settlementId,
	});
	const [markPaid] = useMarkTransferPaidMutation();

	const getMemberName = (userId: string) => {
		const m = members.find((m) => m.user_id === userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	const handleMarkPaid = async (transferId: string) => {
		try {
			await markPaid({ transferId }).unwrap();
			toast.success("Transfer marked as paid!");
		} catch {
			toast.error("Failed to mark transfer as paid.");
		}
	};

	if (isLoading || !settlement) {
		return <FullPageSpinner />;
	}

	const monthName = new Date(
		settlement.year,
		settlement.month - 1,
	).toLocaleString("default", { month: "long", year: "numeric" });

	const allSettled = settlement.transfers.every((t) => !!t.paid_at);
	const totalAmount = settlement.transfers.reduce(
		(sum, t) => sum + t.amount,
		0,
	);

	return (
		<div className="space-y-5 animate-fade-in">
			{/* Header */}
			<div>
				<button
					type="button"
					onClick={onBack}
					className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 flex items-center gap-1"
				>
					&larr; Back to settlements
				</button>
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">{monthName}</h2>
					{allSettled ? (
						<Badge variant="success">All Settled</Badge>
					) : (
						<Badge variant="warning">Pending</Badge>
					)}
				</div>
				<p className="text-sm text-muted-foreground mt-1">
					{settlement.transfers.length} transfer
					{settlement.transfers.length !== 1 && "s"} &middot; Total:{" "}
					{formatCurrency(totalAmount, currency)}
				</p>
			</div>

			{/* Transfers */}
			{settlement.transfers.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						No transfers needed — everything is balanced!
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{settlement.transfers.map((transfer) => {
						const isPaid = !!transfer.paid_at;
						return (
							<Card
								key={transfer.id}
								className={isPaid ? "opacity-75" : undefined}
							>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										{/* From → To */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 text-sm flex-wrap">
												<span className="font-semibold truncate">
													{getMemberName(transfer.from_user_id)}
												</span>
												<ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
												<span className="font-semibold truncate">
													{getMemberName(transfer.to_user_id)}
												</span>
											</div>
											<p className="text-lg font-bold mt-1">
												{formatCurrency(transfer.amount, currency)}
											</p>
											{isPaid && transfer.paid_at && (
												<p className="text-xs text-success mt-1 flex items-center gap-1">
													<Check className="h-3 w-3" />
													Paid on{" "}
													{format(parseISO(transfer.paid_at), "MMM d, yyyy")}
												</p>
											)}
										</div>

										{/* Action */}
										{!isPaid && (
											<Button
												size="sm"
												variant="outline"
												className="shrink-0 gap-1.5"
												onClick={() => handleMarkPaid(transfer.id)}
											>
												<Check className="h-3.5 w-3.5" />
												Mark Paid
											</Button>
										)}
										{isPaid && (
											<div className="flex items-center gap-1 text-success shrink-0">
												<Check className="h-4 w-4" />
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
};
