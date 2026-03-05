import { Calendar, ChevronRight, Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router";
import { ReportDetail } from "@/components/Report/ReportDetail";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { SkeletonList, SkeletonPage } from "@/components/ui/skeleton";
import { Touchable } from "@/components/ui/touchable";
import { RoutesEnum } from "@/routes/Routes";
import {
	useGetMyHouseholdQuery,
	useGetUsersMeQuery,
	useListReportsQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";
import { formatMonthYear } from "@/utils/date";

type SelectedReport = { month: number; year: number };

export const ReportsPage = () => {
	const { t } = useTranslation();
	const { data: currentUser } = useGetUsersMeQuery();
	const {
		data: household,
		isLoading: isHouseholdLoading,
		isError: isHouseholdError,
	} = useGetMyHouseholdQuery(undefined);
	const {
		data: reports,
		isLoading: isReportsLoading,
		isUninitialized: isReportsUninitialized,
		refetch: refetchReports,
	} = useListReportsQuery(undefined, { skip: !household });

	const location = useLocation();
	const navState = location.state as { month?: number; year?: number } | null;
	const [selected, setSelected] = useState<SelectedReport | null>(
		navState?.month && navState?.year
			? { month: navState.month, year: navState.year }
			: null,
	);

	useEffect(() => {
		if (selected) {
			window.scrollTo(0, 0);
		}
	}, [selected]);

	const handleRefresh = useCallback(
		() => Promise.all([refetchReports()]),
		[refetchReports],
	);

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
	const isOwner = currentUser?.id === household.owner_id;

	// If viewing a specific report
	if (selected) {
		return (
			<ReportDetail
				month={selected.month}
				year={selected.year}
				currency={currency}
				isOwner={isOwner}
				onBack={() => setSelected(null)}
			/>
		);
	}

	return (
		<PullToRefresh onRefresh={handleRefresh}>
			<div className="space-y-5">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold tracking-tight">
						{t("reports.title")}
					</h1>
				</div>

				{/* List */}
				{isReportsLoading || isReportsUninitialized ? (
					<SkeletonList count={3} />
				) : reports && reports.length > 0 ? (
					<AnimatedList className="space-y-2">
						{reports.map((r, i) => {
							const monthName = formatMonthYear(r.month, r.year);
							const isClosed = !!r.closed_at;
							const key = `${r.month}-${r.year}`;
							return (
								<AnimatedListItem
									key={key}
									itemKey={key}
									index={i}
									enableLayout
								>
									<Card>
										<CardContent className="p-0">
											<Touchable
												className="w-full p-4 flex items-center gap-3 text-left rounded-xl"
												onClick={() =>
													setSelected({ month: r.month, year: r.year })
												}
											>
												<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
													<Calendar className="h-4 w-4 text-muted-foreground" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<h3 className="text-sm font-semibold">
															{monthName}
														</h3>
														{isClosed && (
															<Badge variant="success" className="gap-1">
																<Lock className="h-3 w-3" />
																{t("reports.closed")}
															</Badge>
														)}
													</div>
													<p className="text-xs text-muted-foreground mt-0.5">
														{t("reports.expense", {
															count: r.total_expenses,
														})}{" "}
														&middot; {formatCurrency(r.total_amount, currency)}
													</p>
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
											</Touchable>
										</CardContent>
									</Card>
								</AnimatedListItem>
							);
						})}
					</AnimatedList>
				) : (
					<Card>
						<CardContent>
							<EmptyState
								image="/dimewise-empty-report.png"
								title={t("reports.noReports")}
								description={t("reports.noReportsDescription")}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		</PullToRefresh>
	);
};
