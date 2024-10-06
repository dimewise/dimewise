import { Card, CardContent, Grid2 as Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";

type DataType = {
	label: string;
	data: [number]; // only one element for data
};
const fakeCategoryData: DataType[] = [
	{ label: "Entertainment", data: [3500] }, // 3,500 JPY
	{ label: "Food", data: [8200] }, // 8,200 JPY
	{ label: "Housing", data: [45000] }, // 45,000 JPY
	{ label: "Transportation", data: [1200] }, // 1,200 JPY
	{ label: "Utilities", data: [7600] }, // 7,600 JPY
];

type ApiData = {
	categories: DataType[];
	budget: number;
};

const fakeApiData: ApiData = {
	categories: fakeCategoryData,
	budget: 100000,
};

export const CurrentMonthWidget = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

	const data: ApiData = fakeApiData;
	const currency = "JPY";

	const totalSpent = data.categories.reduce((sum, category) => sum + category.data[0], 0);

	// construct bar series information
	const categoryBarSeries = data.categories.map((c) => ({ ...c, stack: "total" }));
	const remainderBarSeries = {
		label: "Remainder",
		data: [data.budget - totalSpent],
		stack: "total",
		color: "grey",
	};
	const barSeries = remainderBarSeries.data[0] < 0 ? categoryBarSeries : [...categoryBarSeries, remainderBarSeries];

	// construct pie series information
	const categoryPieSeries = data.categories.map((c) => ({
		value: c.data[0],
		label: c.label,
	}));
	const remainderPieSeries = {
		label: "Remainder",
		value: data.budget - totalSpent,
	};
	const pieSeries = remainderPieSeries.value < 0 ? categoryPieSeries : [...categoryPieSeries, remainderPieSeries];

	// construct spent and budget value with currency
	const spentStr = `${currency} ${totalSpent}`;
	const budgetStr = `${currency} ${data.budget}`;

	return (
		<Grid size={{ xs: 12, sm: 12, lg: 3 }}>
			<Card
				variant="outlined"
				sx={{ height: "100%", flexGrow: 1 }}
			>
				<CardContent>
					<Typography
						component="h2"
						variant="subtitle2"
						gutterBottom
					>
						Summary
					</Typography>
					<Stack
						direction="row"
						sx={{ alignItems: "center", mb: 2 }}
						gap={1}
					>
						<Typography
							component="span"
							variant="h4"
						>
							{spentStr}
						</Typography>
						/
						<Typography
							component="span"
							variant="caption"
						>
							{budgetStr}
						</Typography>
					</Stack>
					<BarChart
						sx={{ display: { sm: "block", lg: "none" } }}
						height={isMobile ? 80 : 0}
						yAxis={[{ data: ["Budget Breakdown"], scaleType: "band" }]}
						leftAxis={null}
						bottomAxis={null}
						slotProps={{ legend: { hidden: true } }}
						margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
						layout="horizontal"
						series={barSeries}
					/>
					<PieChart
						sx={{ display: { sm: "none", lg: "block" } }}
						height={isMobile ? 0 : 250}
						margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
						series={[
							{
								data: pieSeries,
								innerRadius: 40,
								cornerRadius: 5,
								paddingAngle: 5,
							},
						]}
						slotProps={{ legend: { hidden: true } }}
					/>
				</CardContent>
			</Card>
		</Grid>
	);
};
