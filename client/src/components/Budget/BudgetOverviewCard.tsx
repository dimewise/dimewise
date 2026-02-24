import { Card, Col, Progress, Row, Statistic } from "antd";
import type { BudgetOverview } from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

type Props = {
	overview: BudgetOverview;
	currency: string;
};

export const BudgetOverviewCard = ({ overview, currency }: Props) => {
	const usedPercent =
		overview.total_budget > 0
			? Math.round((overview.total_spent / overview.total_budget) * 100)
			: 0;

	const progressStatus =
		usedPercent >= 100 ? "exception" : usedPercent >= 80 ? "normal" : "active";

	return (
		<Card title="Monthly Overview">
			<Row gutter={[24, 16]}>
				<Col xs={24} sm={8}>
					<Statistic
						title="Total Budget"
						value={formatCurrency(overview.total_budget, currency)}
					/>
				</Col>
				<Col xs={24} sm={8}>
					<Statistic
						title="Spent"
						value={formatCurrency(overview.total_spent, currency)}
						valueStyle={
							overview.total_spent > overview.total_budget
								? { color: "#cf1322" }
								: undefined
						}
					/>
				</Col>
				<Col xs={24} sm={8}>
					<Statistic
						title="Remaining"
						value={formatCurrency(overview.remaining, currency)}
						valueStyle={
							overview.remaining < 0
								? { color: "#cf1322" }
								: { color: "#3f8600" }
						}
					/>
				</Col>
			</Row>
			<Progress
				percent={usedPercent}
				status={progressStatus}
				style={{ marginTop: 16 }}
				format={(pct) => `${pct}% used`}
			/>
		</Card>
	);
};
