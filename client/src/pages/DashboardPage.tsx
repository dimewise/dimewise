import {
	ArrowRightOutlined,
	CalendarOutlined,
	DollarOutlined,
	ShoppingCartOutlined,
	SwapOutlined,
} from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Empty,
	Flex,
	List,
	Row,
	Spin,
	Statistic,
	Typography,
} from "antd";
import { DateTime } from "luxon";
import { Navigate, useNavigate } from "react-router";
import { BudgetOverviewCard } from "@/components/Budget/BudgetOverviewCard";
import { RoutesEnum } from "@/routes/Routes";
import type { HouseholdMember } from "@/store/api/api";
import {
	useGetBudgetOverviewQuery,
	useGetMyHouseholdQuery,
	useListExpensesQuery,
	useListSettlementsQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

export const DashboardPage = () => {
	const navigate = useNavigate();
	const { data: household, isLoading, error } = useGetMyHouseholdQuery();
	const { data: overview } = useGetBudgetOverviewQuery(undefined, {
		skip: !household,
	});
	const { data: expenseData } = useListExpensesQuery(
		{ limit: 5, offset: 0 },
		{ skip: !household },
	);
	const { data: settlements } = useListSettlementsQuery(undefined, {
		skip: !household,
	});

	if (isLoading) {
		return (
			<Flex justify="center" align="center" style={{ padding: 48 }}>
				<Spin size="large" />
			</Flex>
		);
	}

	// 404 means user has no household — redirect to setup
	if (error && "status" in error && error.status === 404) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	const currency = household.currency;
	const memberMap = new Map<string, HouseholdMember>();
	for (const m of household.members) {
		memberMap.set(m.user_id, m);
	}

	const getMemberName = (userId: string) => {
		const m = memberMap.get(userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	return (
		<Flex vertical gap={24}>
			<Typography.Title level={3} style={{ margin: 0 }}>
				Dashboard
			</Typography.Title>

			{/* Quick stats */}
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Household"
							value={household.name}
							prefix={<CalendarOutlined />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Members"
							value={household.members.length}
							prefix={<SwapOutlined />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Currency"
							value={household.currency}
							prefix={<DollarOutlined />}
						/>
					</Card>
				</Col>
			</Row>

			{/* Budget overview */}
			{overview && (
				<BudgetOverviewCard overview={overview} currency={currency} />
			)}

			<Row gutter={[16, 16]}>
				{/* Recent expenses */}
				<Col xs={24} lg={14}>
					<Card
						title={
							<Flex align="center" gap={8}>
								<ShoppingCartOutlined />
								<span>Recent Expenses</span>
							</Flex>
						}
						extra={
							<Button type="link" onClick={() => navigate(RoutesEnum.expenses)}>
								View All <ArrowRightOutlined />
							</Button>
						}
					>
						{expenseData && expenseData.expenses.length > 0 ? (
							<List
								dataSource={expenseData.expenses}
								renderItem={(expense) => (
									<List.Item>
										<List.Item.Meta
											title={expense.title}
											description={`${getMemberName(expense.paid_by)} · ${DateTime.fromISO(expense.incurred_at).toLocaleString(DateTime.DATE_MED)}`}
										/>
										<Typography.Text strong>
											{formatCurrency(expense.amount, currency)}
										</Typography.Text>
									</List.Item>
								)}
							/>
						) : (
							<Empty
								description="No expenses yet"
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						)}
					</Card>
				</Col>

				{/* Settlement status */}
				<Col xs={24} lg={10}>
					<Card
						title={
							<Flex align="center" gap={8}>
								<SwapOutlined />
								<span>Recent Settlements</span>
							</Flex>
						}
						extra={
							<Button
								type="link"
								onClick={() => navigate(RoutesEnum.settlements)}
							>
								View All <ArrowRightOutlined />
							</Button>
						}
					>
						{settlements && settlements.length > 0 ? (
							<List
								dataSource={settlements.slice(0, 3)}
								renderItem={(s) => {
									const dt = DateTime.fromObject({
										month: s.month,
										year: s.year,
									});
									return (
										<List.Item>
											<List.Item.Meta
												avatar={<CalendarOutlined style={{ fontSize: 20 }} />}
												title={dt.toFormat("MMMM yyyy")}
												description={`Generated ${DateTime.fromISO(s.generated_at).toLocaleString(DateTime.DATE_MED)}`}
											/>
										</List.Item>
									);
								}}
							/>
						) : (
							<Empty
								description="No settlements yet"
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						)}
					</Card>
				</Col>
			</Row>
		</Flex>
	);
};
