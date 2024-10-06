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

type CategoryDataType = {
	label: string;
	data: [number]; // only one element for data, same as Current Month Widget
};

type MonthlyDataType = {
	monthNumber: number;
	categories: CategoryDataType[];
};

type ApiData = {
	budget: number;
	months: MonthlyDataType[];
};

export const MonthlyOverviewWidget = () => {
	// call user to get currency
	const currency = "JPY";

	// call API here
	const data = fakeApiData;
	const months = data.months;

	// find all unique categories
	const uniqueCategories = new Set<string>();

	// iterate over month and category to populate the set
	for (const month of months) {
		for (const category of month.categories) {
			uniqueCategories.add(category.label);
		}
	}
	// initialize each category with the zero value for each month (e.g. 12 months, 12 elements in the array)
	const categoriesData = Array.from(uniqueCategories).reduce(
		(acc, category) => {
			acc[category] = Array(12).fill(0); // 12 zeros for 12 months
			return acc;
		},
		{} as Record<string, number[]>,
	);

	for (const month of months) {
		for (const category of month.categories) {
			const monthIndex = month.monthNumber - 1;
			categoriesData[category.label][monthIndex] = category.data[0]; // Assign the value to the correct month
		}
	}

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
		data: months.map(() => data.budget),
		label: "Budget",
		color: "transparent",
	};

	// collate data
	const xAxisData = months.map((m) => DateTime.local(2024, m.monthNumber).toFormat("MMM"));
	const series = [...barData, lineData];
	const budgetLabel = `${currency} ${data.budget}`;

	const savedAmount = months.reduce((totalSaved, month) => {
		const totalExpenses = month.categories.reduce((total, category) => total + category.data[0], 0);

		// only consider it a savings if expense exists
		const savingsForMonth = totalExpenses > 0 ? data.budget - totalExpenses : 0;

		return totalSaved + savingsForMonth;
	}, 0);

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
						YTD Overview
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
							Amount saved this year
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
							y={data.budget}
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

const fakeApiData: ApiData = {
	budget: 250000, // total budget in Yen
	months: [
		{
			monthNumber: 1, // January
			categories: [
				{ label: "Food", data: [30000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [10000] },
				{ label: "Entertainment", data: [5000] },
			],
		},
		{
			monthNumber: 2, // February
			categories: [
				{ label: "Food", data: [32000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [12000] },
				{ label: "Entertainment", data: [4500] },
			],
		},
		{
			monthNumber: 3, // March
			categories: [
				{ label: "Food", data: [31000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [9000] },
				{ label: "Entertainment", data: [5500] },
			],
		},
		{
			monthNumber: 4, // April
			categories: [
				{ label: "Food", data: [29000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [11000] },
				{ label: "Entertainment", data: [6000] },
			],
		},
		{
			monthNumber: 5, // May
			categories: [
				{ label: "Food", data: [34000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [13000] },
				{ label: "Entertainment", data: [7000] },
			],
		},
		{
			monthNumber: 6, // June
			categories: [
				{ label: "Food", data: [32000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [12000] },
				{ label: "Entertainment", data: [4000] },
			],
		},
		{
			monthNumber: 7, // July
			categories: [
				{ label: "Food", data: [33000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [14000] },
				{ label: "Entertainment", data: [4500] },
			],
		},
		{
			monthNumber: 8, // August
			categories: [
				{ label: "Food", data: [30000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [12500] },
				{ label: "Entertainment", data: [5500] },
			],
		},
		{
			monthNumber: 9, // September
			categories: [
				{ label: "Food", data: [31000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [10000] },
				{ label: "Entertainment", data: [4800] },
			],
		},
		{
			monthNumber: 10, // October
			categories: [
				{ label: "Food", data: [30500] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [11500] },
				{ label: "Entertainment", data: [5200] },
			],
		},
		{
			monthNumber: 11, // November
			categories: [
				{ label: "Food", data: [33500] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [13500] },
				{ label: "Entertainment", data: [4800] },
			],
		},
		{
			monthNumber: 12, // December
			categories: [
				{ label: "Food", data: [29000] },
				{ label: "Rent", data: [80000] },
				{ label: "Transportation", data: [14000] },
				{ label: "Entertainment", data: [5100] },
			],
		},
	],
};
