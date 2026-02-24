import {
	ArrowLeftOutlined,
	ArrowRightOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";
import {
	Button,
	Card,
	Flex,
	List,
	Modal,
	message,
	Spin,
	Tag,
	Typography,
} from "antd";
import dayjs from "dayjs";
import type { HouseholdMember } from "@/store/api/api";
import {
	useGetSettlementQuery,
	useMarkTransferPaidMutation,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

type Props = {
	settlementId: string;
	currency: string;
	members: HouseholdMember[];
	onBack: () => void;
};

export const SettlementDetail = ({
	settlementId,
	currency,
	members,
	onBack,
}: Props) => {
	const { data: settlement, isLoading } = useGetSettlementQuery({
		settlementId,
	});
	const [markPaid, { isLoading: isMarking }] = useMarkTransferPaidMutation();

	const memberMap = new Map<string, HouseholdMember>();
	for (const m of members) {
		memberMap.set(m.user_id, m);
	}

	const getMemberName = (userId: string) => {
		const m = memberMap.get(userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	const handleMarkPaid = (transferId: string) => {
		Modal.confirm({
			title: "Mark as Paid",
			content: "Confirm this transfer has been completed?",
			okText: "Yes, mark paid",
			onOk: async () => {
				try {
					await markPaid({ transferId }).unwrap();
					message.success("Transfer marked as paid!");
				} catch {
					message.error("Failed to mark transfer as paid.");
				}
			},
		});
	};

	if (isLoading) {
		return (
			<Flex justify="center" align="center" style={{ padding: 48 }}>
				<Spin size="large" />
			</Flex>
		);
	}

	if (!settlement) {
		return (
			<Flex vertical gap={16}>
				<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
					Back
				</Button>
				<Typography.Text type="danger">Settlement not found.</Typography.Text>
			</Flex>
		);
	}

	const monthLabel = dayjs()
		.month(settlement.month - 1)
		.year(settlement.year)
		.format("MMMM YYYY");

	const allPaid =
		settlement.transfers.length > 0 &&
		settlement.transfers.every((t) => t.paid_at);

	return (
		<Flex vertical gap={24}>
			<Flex align="center" gap={16}>
				<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
					Back
				</Button>
				<Typography.Title level={3} style={{ margin: 0 }}>
					Settlement — {monthLabel}
				</Typography.Title>
				{allPaid && (
					<Tag icon={<CheckCircleOutlined />} color="success">
						All Settled
					</Tag>
				)}
			</Flex>

			<Card>
				{settlement.transfers.length === 0 ? (
					<Typography.Text type="secondary">
						No transfers needed — everyone is even!
					</Typography.Text>
				) : (
					<List
						dataSource={settlement.transfers}
						renderItem={(transfer) => {
							const isPaid = !!transfer.paid_at;

							return (
								<List.Item
									actions={
										!isPaid
											? [
													<Button
														key="pay"
														type="primary"
														size="small"
														icon={<CheckCircleOutlined />}
														onClick={() => handleMarkPaid(transfer.id)}
														loading={isMarking}
													>
														Mark Paid
													</Button>,
												]
											: undefined
									}
								>
									<List.Item.Meta
										title={
											<Flex align="center" gap={8}>
												<Typography.Text strong>
													{getMemberName(transfer.from_user_id)}
												</Typography.Text>
												<ArrowRightOutlined />
												<Typography.Text strong>
													{getMemberName(transfer.to_user_id)}
												</Typography.Text>
												<Typography.Text
													style={{ marginLeft: 8, fontSize: 16 }}
												>
													{formatCurrency(transfer.amount, currency)}
												</Typography.Text>
											</Flex>
										}
										description={
											isPaid ? (
												<Tag icon={<CheckCircleOutlined />} color="success">
													Paid {dayjs(transfer.paid_at).format("MMM D, YYYY")}
												</Tag>
											) : (
												<Tag color="warning">Pending</Tag>
											)
										}
									/>
								</List.Item>
							);
						}}
					/>
				)}
			</Card>
		</Flex>
	);
};
