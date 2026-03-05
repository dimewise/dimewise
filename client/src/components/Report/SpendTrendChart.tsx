import { useTranslation } from "react-i18next";
import {
	Area,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { MemberTrend } from "@/store/api/api";
import { formatDisplayAmount, fromSmallestUnit } from "@/utils/currency";

type Props = {
	data: MemberTrend[];
	currency: string;
	month: number;
	year: number;
};

const CURRENT_COLOR = "oklch(0.55 0.24 277)";
const BASELINE_COLOR = "oklch(0.6 0.05 260)";
const FORECAST_COLOR = "oklch(0.55 0.24 277)";

export const SpendTrendChart = ({ data, currency, month, year }: Props) => {
	const { t } = useTranslation();

	if (data.length === 0) return null;

	const prevYear = year - 1;

	// Separate totals by year
	const currentYearTotals = new Map<number, number>();
	const prevYearTotals = new Map<number, number>();

	for (const member of data) {
		for (const point of member.data) {
			const value = fromSmallestUnit(point.total_paid, currency);
			if (point.year === year) {
				const existing = currentYearTotals.get(point.month) || 0;
				currentYearTotals.set(point.month, existing + value);
			} else if (point.year === prevYear) {
				const existing = prevYearTotals.get(point.month) || 0;
				prevYearTotals.set(point.month, existing + value);
			}
		}
	}

	// Compute growth rate from overlapping months
	let currentOverlap = 0;
	let baselineOverlap = 0;
	for (let m = 1; m <= month; m++) {
		const curr = currentYearTotals.get(m);
		const prev = prevYearTotals.get(m);
		if (curr !== undefined && prev !== undefined) {
			currentOverlap += curr;
			baselineOverlap += prev;
		}
	}
	const growthRate = baselineOverlap > 0 ? currentOverlap / baselineOverlap : 0;

	// Build chart data Jan–Dec
	const chartData: Record<string, number | string | undefined>[] = [];

	for (let m = 1; m <= 12; m++) {
		const label = t(`months.${m}`).slice(0, 3);
		const row: Record<string, number | string | undefined> = {
			month: m,
			label,
		};

		// Current year actual (up to report month)
		if (m <= month) {
			const val = currentYearTotals.get(m);
			if (val !== undefined) {
				row._current = val;
			}
		}

		// Baseline: previous year
		const baselineVal = prevYearTotals.get(m);
		if (baselineVal !== undefined) {
			row._baseline = baselineVal;
		}

		// Forecast: growth rate applied to last year (report month onward)
		if (m >= month && growthRate > 0) {
			const lastYearVal = prevYearTotals.get(m);
			if (lastYearVal !== undefined) {
				row._forecast = Math.round(lastYearVal * growthRate * 100) / 100;
			}
		}

		chartData.push(row);
	}

	// Connect forecast to last actual data point
	const currentMonthIdx = chartData.findIndex((d) => d.month === month);
	if (
		currentMonthIdx >= 0 &&
		chartData[currentMonthIdx]._current !== undefined
	) {
		chartData[currentMonthIdx]._forecast = chartData[currentMonthIdx]._current;
	}

	const formatValue = (value: number) => formatDisplayAmount(value, currency);

	return (
		<ResponsiveContainer width="100%" height={200}>
			<ComposedChart data={chartData}>
				<defs>
					<linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={CURRENT_COLOR} stopOpacity={0.15} />
						<stop offset="100%" stopColor={CURRENT_COLOR} stopOpacity={0.01} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
				<XAxis
					dataKey="label"
					tick={{ fontSize: 11 }}
					tickLine={false}
					axisLine={false}
				/>
				<YAxis
					tick={{ fontSize: 11 }}
					tickLine={false}
					axisLine={false}
					width={50}
				/>
				<Tooltip formatter={(value) => formatValue(Number(value))} />
				<Legend wrapperStyle={{ fontSize: 12 }} />

				{/* Current year actual spend */}
				<Area
					type="monotone"
					dataKey="_current"
					name={`${year}`}
					stroke={CURRENT_COLOR}
					strokeWidth={2}
					fill="url(#currentGradient)"
					dot={{ r: 3, fill: CURRENT_COLOR }}
					activeDot={{ r: 5 }}
					connectNulls={false}
				/>

				{/* Previous year baseline */}
				<Line
					type="monotone"
					dataKey="_baseline"
					name={`${prevYear} ${t("reportDetail.baseline")}`}
					stroke={BASELINE_COLOR}
					strokeWidth={1.5}
					strokeDasharray="6 3"
					dot={false}
					connectNulls
				/>

				{/* Forecast */}
				{month < 12 && growthRate > 0 && (
					<Line
						type="monotone"
						dataKey="_forecast"
						name={t("reportDetail.forecast")}
						stroke={FORECAST_COLOR}
						strokeWidth={1.5}
						strokeDasharray="3 3"
						dot={false}
						connectNulls
					/>
				)}
			</ComposedChart>
		</ResponsiveContainer>
	);
};
