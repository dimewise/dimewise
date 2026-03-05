import { useTranslation } from "react-i18next";
import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
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

const MEMBER_COLORS = [
	"oklch(0.585 0.233 277.117)", // brand purple
	"oklch(0.627 0.194 149.214)", // success green
	"oklch(0.769 0.188 70.08)", // warning amber
	"oklch(0.577 0.245 27.325)", // danger red
	"oklch(0.65 0.2 200)", // teal
	"oklch(0.6 0.2 330)", // pink
];

const TOTAL_COLOR = "oklch(0.55 0.24 277)";

export const MemberContributionChart = ({
	data,
	currency,
	month,
	year,
}: Props) => {
	const { t } = useTranslation();

	if (data.length === 0) return null;

	const memberNames = data.map((m) => m.member_name);

	// Build chart data: current year only, up to report month
	const monthsMap = new Map<number, Record<string, number | string>>();

	for (const member of data) {
		for (const point of member.data) {
			if (point.year !== year) continue;
			const existing = monthsMap.get(point.month);
			const value = fromSmallestUnit(point.total_paid, currency);
			if (existing) {
				existing[member.member_name] = value;
			} else {
				monthsMap.set(point.month, {
					month: point.month,
					label: t(`months.${point.month}`).slice(0, 3),
					[member.member_name]: value,
				});
			}
		}
	}

	const chartData: Record<string, number | string>[] = [];
	for (let m = 1; m <= month; m++) {
		const entry = monthsMap.get(m);
		if (!entry) continue;
		let total = 0;
		for (const name of memberNames) {
			total += (entry[name] as number) || 0;
		}
		chartData.push({ ...entry, _total: total });
	}

	const formatValue = (value: number) => formatDisplayAmount(value, currency);

	return (
		<ResponsiveContainer width="100%" height={200}>
			<ComposedChart data={chartData}>
				<defs>
					<linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={TOTAL_COLOR} stopOpacity={0.15} />
						<stop offset="100%" stopColor={TOTAL_COLOR} stopOpacity={0.01} />
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
				<Tooltip formatter={(value: number) => formatValue(value)} />
				<Legend wrapperStyle={{ fontSize: 12 }} />

				{data.map((member, i) => (
					<Bar
						key={member.user_id}
						dataKey={member.member_name}
						fill={MEMBER_COLORS[i % MEMBER_COLORS.length]}
						radius={[3, 3, 0, 0]}
						barSize={data.length > 4 ? 12 : 20}
					/>
				))}

				<Area
					type="monotone"
					dataKey="_total"
					name={t("reportDetail.ledgerTotal")}
					stroke={TOTAL_COLOR}
					strokeWidth={2}
					fill="url(#totalGradient)"
					dot={{ r: 3, fill: TOTAL_COLOR }}
					activeDot={{ r: 5 }}
				/>
			</ComposedChart>
		</ResponsiveContainer>
	);
};
