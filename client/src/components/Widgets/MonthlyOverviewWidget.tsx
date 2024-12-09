import { Card, CardContent, Grid2 as Grid, Stack, Typography } from "@mui/material";
import {
	BarPlot,
	type BarSeriesType,
	ChartsAxisHighlight,
	ChartsReferenceLine,
	ChartsTooltip,
	ChartsXAxis,
	LinePlot,
	type LineSeriesType,
	ResponsiveChartContainer,
} from "@mui/x-charts";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApiV1CategoryOverviewYearGetCategoriesPerMonthQuery } from "../../services/api/v1";

export const MonthlyOverviewWidget = () => {
	const { t } = useTranslation();
	// TODO: call user to get currency
	const currency = "JPY";

	const now = useMemo(() => DateTime.now(), []);
	const { data: overviewData } = useApiV1CategoryOverviewYearGetCategoriesPerMonthQuery({
		fromDate: now.startOf("year").toUTC().toISO(),
		toDate: now.toUTC().toISO(),
	});
	const budget = overviewData?.budget ?? 0;
	const categoriesData = overviewData?.months ?? {};

	// transform the data into the series array for the bar chart
	const barData: BarSeriesType[] = Object.keys(categoriesData).map((category) => ({
		type: "bar",
		data: categoriesData[category],
		stack: "all",
		label: category,
		layout: "vertical",
	}));

	const lineData: LineSeriesType = {
		// this is needed to ensure the chart resize correctly
		type: "line",
		data: new Array(12).fill(budget),
		label: "Budget",
		color: "transparent",
	};

	// collate data
	const xAxisData = Array.from(Array(12).keys()).map((m) => DateTime.local(now.year, m + 1).toFormat("MMM"));
	const series = [...barData, lineData];
	const budgetLabel = `${currency} ${budget}`;

	const spentAmount = Object.values(categoriesData)
		.flat()
		.reduce((sum, value) => sum + value, 0);
	const savedAmount = budget - spentAmount;
	const savedStr = `${currency} ${savedAmount}`;

	return (
		<Grid size={{ sm: 12, md: 12, lg: 9 }}>
			<Card
				variant="outlined"
				sx={{ width: "100%" }}
			>
				<CardContent>
					<Typography
						component="h2"
						variant="subtitle2"
						gutterBottom
					>
						{t("overview.widget.ytd-overview.title")}
					</Typography>
					<Stack sx={{ justifyContent: "space-between" }}>
						<Typography
							variant="h4"
							component="p"
						>
							{savedStr}
						</Typography>
						<Typography
							variant="caption"
							sx={{ color: "text.secondary" }}
						>
							{t("overview.widget.ytd-overview.amount-saved-this-year")}
						</Typography>
					</Stack>
					<ResponsiveChartContainer
						series={series}
						xAxis={[
							{
								scaleType: "band",
								data: xAxisData,
							},
						]}
						height={250}
						margin={{ left: 0, right: 0, top: 40, bottom: 20 }}
					>
						<BarPlot />
						<LinePlot />
						<ChartsAxisHighlight x="band" />
						<ChartsTooltip />
						<ChartsReferenceLine
							y={budget}
							label={budgetLabel}
							labelAlign="end"
							labelStyle={{ fill: "red" }}
							lineStyle={{ stroke: "red" }}
						/>
						<ChartsXAxis disableTicks />
					</ResponsiveChartContainer>
				</CardContent>
			</Card>
		</Grid>
	);
};
