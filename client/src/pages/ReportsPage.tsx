import { useUser } from "@clerk/clerk-react";
import { Calendar, CheckCircle, Clock, FileBarChart, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { ReportDetail } from "@/components/Report/ReportDetail";
import { Badge } from "@/components/ui/badge";
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
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonList, SkeletonPage } from "@/components/ui/skeleton";
import { RoutesEnum } from "@/routes/Routes";
import {
	useGenerateReportMutation,
	useGetMyHouseholdQuery,
	useListReportsQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export const ReportsPage = () => {
	const { t } = useTranslation();
	const { user } = useUser();
	const {
		data: household,
		isLoading: isHouseholdLoading,
		isError: isHouseholdError,
	} = useGetMyHouseholdQuery(undefined);
	const { data: reports, isLoading: isReportsLoading } = useListReportsQuery(
		undefined,
		{ skip: !household },
	);
	const [generateReport, { isLoading: isGenerating }] =
		useGenerateReportMutation();

	const now = new Date();
	const [generateOpen, setGenerateOpen] = useState(false);
	const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
	const [genYear, setGenYear] = useState(now.getFullYear());
	const [selectedId, setSelectedId] = useState<string | null>(null);

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
	const isOwner = user?.id === household.owner_id;

	// If viewing a specific report
	if (selectedId) {
		return (
			<ReportDetail
				reportId={selectedId}
				currency={currency}
				isOwner={isOwner}
				onBack={() => setSelectedId(null)}
			/>
		);
	}

	const handleGenerate = async () => {
		try {
			const result = await generateReport({
				generateReportRequest: {
					month: genMonth,
					year: genYear,
				},
			}).unwrap();
			toast.success(t("reports.reportGenerated"));
			setGenerateOpen(false);
			setSelectedId(result.id);
		} catch {
			toast.error(t("reports.generateFailed"));
		}
	};

	return (
		<div className="space-y-5 animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">
					{t("reports.title")}
				</h1>
				<Button
					size="sm"
					className="gap-1.5"
					onClick={() => setGenerateOpen(true)}
				>
					<Plus className="h-4 w-4" />
					{t("reports.generate")}
				</Button>
			</div>

			{/* List */}
			{isReportsLoading ? (
				<SkeletonList count={3} />
			) : reports && reports.length > 0 ? (
				<div className="space-y-2">
					{reports.map((r) => {
						const monthName = new Date(r.year, r.month - 1).toLocaleString(
							"default",
							{ month: "long", year: "numeric" },
						);
						const allSettled =
							r.transfers_total > 0 &&
							r.transfers_settled === r.transfers_total;
						const hasPending =
							r.transfers_total > 0 && r.transfers_settled < r.transfers_total;
						return (
							<Card key={r.id}>
								<CardContent className="p-0">
									<button
										type="button"
										className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-xl"
										onClick={() => setSelectedId(r.id)}
									>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
												<h3 className="text-sm font-semibold">{monthName}</h3>
												{allSettled && (
													<Badge variant="success" className="gap-1">
														<CheckCircle className="h-3 w-3" />
														{t("reports.settled")}
													</Badge>
												)}
												{hasPending && (
													<Badge variant="warning" className="gap-1">
														<Clock className="h-3 w-3" />
														{t("reports.pendingCount", {
															count: r.transfers_total - r.transfers_settled,
														})}
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-3 mt-1 ml-6">
												<p className="text-xs text-muted-foreground">
													{t("reports.expense", {
														count: r.total_expenses,
													})}
												</p>
												<span className="text-xs text-muted-foreground">
													&middot;
												</span>
												<p className="text-xs font-medium">
													{formatCurrency(r.total_amount, currency)}
												</p>
												<span className="text-xs text-muted-foreground">
													&middot;
												</span>
												<p className="text-xs text-muted-foreground">
													{formatDate(r.generated_at, "MMM d, yyyy")}
												</p>
											</div>
										</div>
										<FileBarChart className="h-4 w-4 text-muted-foreground shrink-0" />
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
							image="/dimewise-empty-report.png"
							title={t("reports.noReports")}
							description={t("reports.noReportsDescription")}
							action={
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => setGenerateOpen(true)}
								>
									<Plus className="h-4 w-4" />
									{t("reports.generateReport")}
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
						<DialogTitle>{t("reports.generateReport")}</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						{t("reports.generateDescription")}
					</p>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label>{t("reports.month")}</Label>
							<Input
								type="number"
								min={1}
								max={12}
								value={genMonth}
								onChange={(e) => setGenMonth(Number(e.target.value))}
							/>
						</div>
						<div className="space-y-2">
							<Label>{t("reports.year")}</Label>
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
							{t("common.cancel")}
						</Button>
						<Button onClick={handleGenerate} disabled={isGenerating}>
							{isGenerating ? t("reports.generating") : t("reports.generate")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
