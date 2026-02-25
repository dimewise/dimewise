import { ArrowRightLeft, Calendar, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { SettlementDetail } from "@/components/Settlement/SettlementDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FullPageSpinner } from "@/components/ui/spinner";
import { RoutesEnum } from "@/routes/Routes";
import {
	useGenerateSettlementMutation,
	useGetMyHouseholdQuery,
	useListSettlementsQuery,
} from "@/store/api/api";

export const SettlementsPage = () => {
	const { data: household, isLoading: isHouseholdLoading } =
		useGetMyHouseholdQuery();
	const { data: settlements, isLoading: isSettlementsLoading } =
		useListSettlementsQuery(undefined, { skip: !household });
	const [generateSettlement, { isLoading: isGenerating }] =
		useGenerateSettlementMutation();

	const now = new Date();
	const [generateOpen, setGenerateOpen] = useState(false);
	const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
	const [genYear, setGenYear] = useState(now.getFullYear());
	const [selectedId, setSelectedId] = useState<string | null>(null);

	if (isHouseholdLoading) {
		return <FullPageSpinner />;
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	const currency = household.currency;

	// If viewing a specific settlement
	if (selectedId) {
		return (
			<SettlementDetail
				settlementId={selectedId}
				currency={currency}
				members={household.members}
				onBack={() => setSelectedId(null)}
			/>
		);
	}

	const handleGenerate = async () => {
		try {
			const result = await generateSettlement({
				generateSettlementRequest: {
					month: genMonth,
					year: genYear,
				},
			}).unwrap();
			toast.success("Settlement generated!");
			setGenerateOpen(false);
			setSelectedId(result.id);
		} catch {
			toast.error("Failed to generate settlement.");
		}
	};

	return (
		<div className="space-y-5 animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">Settlements</h1>
				<Button
					size="sm"
					className="gap-1.5"
					onClick={() => setGenerateOpen(true)}
				>
					<Plus className="h-4 w-4" />
					Generate
				</Button>
			</div>

			{/* List */}
			{isSettlementsLoading ? (
				<FullPageSpinner />
			) : settlements && settlements.length > 0 ? (
				<div className="space-y-2">
					{settlements.map((s) => {
						const monthName = new Date(s.year, s.month - 1).toLocaleString(
							"default",
							{ month: "long", year: "numeric" },
						);
						return (
							<Card key={s.id}>
								<CardContent className="p-0">
									<button
										type="button"
										className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-2xl"
										onClick={() => setSelectedId(s.id)}
									>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
												<h3 className="text-sm font-semibold">{monthName}</h3>
											</div>
											<p className="text-xs text-muted-foreground mt-1 ml-6">
												Generated{" "}
												{format(new Date(s.generated_at), "MMM d, yyyy")}
											</p>
										</div>
										<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
									</button>
								</CardContent>
							</Card>
						);
					})}
				</div>
			) : (
				<Card>
					<CardContent>
						<EmptyState
							icon={<ArrowRightLeft className="h-6 w-6" />}
							title="No settlements yet"
							description="Generate a settlement to balance out expenses among household members."
							action={
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => setGenerateOpen(true)}
								>
									<Plus className="h-4 w-4" />
									Generate Settlement
								</Button>
							}
						/>
					</CardContent>
				</Card>
			)}

			{/* Generate dialog */}
			<Dialog
				open={generateOpen}
				onOpenChange={(v) => !v && setGenerateOpen(false)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Generate Settlement</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						Choose the month and year to generate a settlement for. This will
						calculate who owes whom based on that month&apos;s expenses.
					</p>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label>Month</Label>
							<Input
								type="number"
								min={1}
								max={12}
								value={genMonth}
								onChange={(e) => setGenMonth(Number(e.target.value))}
							/>
						</div>
						<div className="space-y-2">
							<Label>Year</Label>
							<Input
								type="number"
								min={2020}
								max={2099}
								value={genYear}
								onChange={(e) => setGenYear(Number(e.target.value))}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setGenerateOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleGenerate} disabled={isGenerating}>
							{isGenerating ? "Generating..." : "Generate"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
