import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ReportTrends } from "@/store/api/api";
import { CategoryDeltaList } from "./CategoryDeltaList";
import { MemberContributionChart } from "./MemberContributionChart";
import { SpendTrendChart } from "./SpendTrendChart";

type Props = {
	currency: string;
	trends: ReportTrends;
	month: number;
	year: number;
};

export const AnalyticsSection = ({ currency, trends, month, year }: Props) => {
	const { t } = useTranslation();

	if (!trends || trends.months.length < 2) {
		return (
			<Card>
				<CardContent className="py-6 text-center text-sm text-muted-foreground">
					{t("reportDetail.noTrendData")}
				</CardContent>
			</Card>
		);
	}

	// Check if there's previous year data for the trend chart
	const hasPrevYearData = trends.member_trends.some((m) =>
		m.data.some((p) => p.year === year - 1),
	);

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<BarChart3 className="h-4 w-4 text-muted-foreground" />
					{t("reportDetail.analytics")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Chart 1: Member contributions + total */}
				{trends.member_trends.length > 0 && (
					<div>
						<p className="text-xs font-medium text-muted-foreground mb-2">
							{t("reportDetail.memberContributions")}
						</p>
						<MemberContributionChart
							data={trends.member_trends}
							currency={currency}
							month={month}
							year={year}
						/>
					</div>
				)}

				{/* Chart 2: Year-over-year trend with baseline + forecast */}
				{hasPrevYearData && (
					<>
						<Separator />
						<div>
							<p className="text-xs font-medium text-muted-foreground mb-1">
								{t("reportDetail.spendTrend")}
							</p>
							<p className="text-[11px] text-muted-foreground/70 mb-2">
								{t("reportDetail.spendTrendSubtitle")}
							</p>
							<SpendTrendChart
								data={trends.member_trends}
								currency={currency}
								month={month}
								year={year}
							/>
						</div>
					</>
				)}

				{/* Category Deltas */}
				{trends.category_trends.length > 0 && (
					<>
						<Separator />
						<div>
							<p className="text-xs font-medium text-muted-foreground mb-2">
								{t("reportDetail.categoryDeltas")}
							</p>
							<CategoryDeltaList
								data={trends.category_trends}
								currency={currency}
							/>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};
