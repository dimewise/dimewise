import { CalendarOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	DatePicker,
	Empty,
	Flex,
	List,
	Modal,
	message,
	Spin,
	Typography,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";
import { Navigate } from "react-router";
import { SettlementDetail } from "@/components/Settlement/SettlementDetail";
import { RoutesEnum } from "@/routes/Routes";
import type { Settlement } from "@/store/api/api";
import {
	useGenerateSettlementMutation,
	useGetMyHouseholdQuery,
	useListSettlementsQuery,
} from "@/store/api/api";

export const SettlementsPage = () => {
	const { data: household, isLoading: isHouseholdLoading } =
		useGetMyHouseholdQuery();
	const { data: settlements, isLoading: isSettlementsLoading } =
		useListSettlementsQuery(undefined, { skip: !household });
	const [generateSettlement, { isLoading: isGenerating }] =
		useGenerateSettlementMutation();

	const [generateModalOpen, setGenerateModalOpen] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
	const [detailId, setDetailId] = useState<string | null>(null);

	if (isHouseholdLoading) {
		return (
			<Flex justify="center" align="center" style={{ padding: 48 }}>
				<Spin size="large" />
			</Flex>
		);
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	const currency = household.currency;

	const handleGenerate = async () => {
		try {
			const result = await generateSettlement({
				generateSettlementRequest: {
					month: selectedMonth.month() + 1,
					year: selectedMonth.year(),
				},
			}).unwrap();
			message.success("Settlement generated!");
			setGenerateModalOpen(false);
			setDetailId(result.id);
		} catch {
			message.error(
				"Failed to generate settlement. It may already exist for this month.",
			);
		}
	};

	const monthLabel = (s: Settlement) => {
		const dt = dayjs()
			.month(s.month - 1)
			.year(s.year);
		return dt.format("MMMM YYYY");
	};

	if (detailId) {
		return (
			<SettlementDetail
				settlementId={detailId}
				currency={currency}
				members={household.members}
				onBack={() => setDetailId(null)}
			/>
		);
	}

	return (
		<Flex vertical gap={24}>
			<Flex justify="space-between" align="center">
				<Typography.Title level={3} style={{ margin: 0 }}>
					Settlements
				</Typography.Title>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setGenerateModalOpen(true)}
				>
					Generate Settlement
				</Button>
			</Flex>

			<Card>
				{isSettlementsLoading ? (
					<Flex justify="center" style={{ padding: 48 }}>
						<Spin />
					</Flex>
				) : settlements && settlements.length > 0 ? (
					<List
						dataSource={settlements}
						renderItem={(s) => (
							<List.Item
								actions={[
									<Button
										key="view"
										type="link"
										icon={<EyeOutlined />}
										onClick={() => setDetailId(s.id)}
									>
										View
									</Button>,
								]}
							>
								<List.Item.Meta
									avatar={<CalendarOutlined style={{ fontSize: 24 }} />}
									title={monthLabel(s)}
									description={`Generated ${dayjs(s.generated_at).format("MMM D, YYYY h:mm A")}`}
								/>
							</List.Item>
						)}
					/>
				) : (
					<Empty description="No settlements yet. Generate one for a completed month!" />
				)}
			</Card>

			<Modal
				open={generateModalOpen}
				title="Generate Monthly Settlement"
				okText="Generate"
				onOk={handleGenerate}
				onCancel={() => setGenerateModalOpen(false)}
				confirmLoading={isGenerating}
			>
				<Typography.Paragraph>
					Select a month to calculate who owes whom based on that month's
					expenses and splits.
				</Typography.Paragraph>
				<DatePicker
					picker="month"
					value={selectedMonth}
					onChange={(val) => val && setSelectedMonth(val)}
					style={{ width: "100%" }}
					disabledDate={(current) => current?.isAfter(dayjs())}
				/>
			</Modal>
		</Flex>
	);
};
