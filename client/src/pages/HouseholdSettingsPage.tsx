import {
	CrownOutlined,
	DeleteOutlined,
	LogoutOutlined,
	ReloadOutlined,
	UserDeleteOutlined,
} from "@ant-design/icons";
import {
	Button,
	Card,
	Divider,
	Flex,
	List,
	Modal,
	message,
	Spin,
	Typography,
} from "antd";
import { Navigate, useNavigate } from "react-router";
import { RoutesEnum } from "@/routes/Routes";
import {
	useDeleteHouseholdMutation,
	useGetMyHouseholdQuery,
	useGetUsersMeQuery,
	useLeaveHouseholdMutation,
	useRegenerateInviteCodeMutation,
	useRemoveHouseholdMemberMutation,
} from "@/store/api/api";

export const HouseholdSettingsPage = () => {
	const navigate = useNavigate();
	const { data: household, isLoading } = useGetMyHouseholdQuery();
	const { data: currentUser } = useGetUsersMeQuery();
	const [regenerateInviteCode, { isLoading: isRegenerating }] =
		useRegenerateInviteCodeMutation();
	const [removeMember] = useRemoveHouseholdMemberMutation();
	const [leaveHousehold] = useLeaveHouseholdMutation();
	const [deleteHousehold] = useDeleteHouseholdMutation();

	if (isLoading) {
		return (
			<Flex justify="center" align="center" style={{ padding: 48 }}>
				<Spin size="large" />
			</Flex>
		);
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	const isOwner = currentUser?.id === household.owner_id;

	const handleRegenerate = async () => {
		try {
			await regenerateInviteCode().unwrap();
			message.success("Invite code regenerated!");
		} catch {
			message.error("Failed to regenerate invite code.");
		}
	};

	const handleRemoveMember = (userId: string, name: string) => {
		Modal.confirm({
			title: "Remove Member",
			content: `Are you sure you want to remove ${name} from the household?`,
			okText: "Remove",
			okType: "danger",
			onOk: async () => {
				try {
					await removeMember({ userId }).unwrap();
					message.success(`${name} has been removed.`);
				} catch {
					message.error("Failed to remove member.");
				}
			},
		});
	};

	const handleLeave = () => {
		Modal.confirm({
			title: "Leave Household",
			content:
				"Are you sure you want to leave this household? You will need a new invite code to rejoin.",
			okText: "Leave",
			okType: "danger",
			onOk: async () => {
				try {
					await leaveHousehold().unwrap();
					message.success("You have left the household.");
					navigate(RoutesEnum.householdSetup);
				} catch {
					message.error("Failed to leave household.");
				}
			},
		});
	};

	const handleDelete = () => {
		Modal.confirm({
			title: "Delete Household",
			content:
				"Are you sure you want to delete this household? This action cannot be undone. All members will be removed.",
			okText: "Delete",
			okType: "danger",
			onOk: async () => {
				try {
					await deleteHousehold().unwrap();
					message.success("Household deleted.");
					navigate(RoutesEnum.householdSetup);
				} catch {
					message.error("Failed to delete household.");
				}
			},
		});
	};

	return (
		<Flex vertical gap={24}>
			<Typography.Title level={3}>Household Settings</Typography.Title>

			{isOwner && (
				<Card title="Invite Code">
					<Flex justify="space-between" align="center">
						<Typography.Text
							style={{
								fontSize: 20,
								fontFamily: "monospace",
								fontWeight: 600,
							}}
						>
							{household.invite_code}
						</Typography.Text>
						<Button
							icon={<ReloadOutlined />}
							loading={isRegenerating}
							onClick={handleRegenerate}
						>
							Regenerate
						</Button>
					</Flex>
					<Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
						Share this code with people you want to invite. Old codes stop
						working after regeneration.
					</Typography.Paragraph>
				</Card>
			)}

			{isOwner && (
				<Card title="Members">
					<List
						dataSource={household.members}
						renderItem={(member) => {
							const isMemberOwner = member.user_id === household.owner_id;
							const displayName = [member.first_name, member.last_name]
								.filter(Boolean)
								.join(" ");

							return (
								<List.Item
									actions={
										!isMemberOwner
											? [
													<Button
														key="remove"
														type="text"
														danger
														icon={<UserDeleteOutlined />}
														onClick={() =>
															handleRemoveMember(
																member.user_id,
																displayName || member.email,
															)
														}
													>
														Remove
													</Button>,
												]
											: undefined
									}
								>
									<List.Item.Meta
										title={
											<Flex gap={8} align="center">
												<span>{displayName || member.email}</span>
												{isMemberOwner && (
													<CrownOutlined
														style={{
															color: "#faad14",
														}}
													/>
												)}
											</Flex>
										}
										description={member.email}
									/>
								</List.Item>
							);
						}}
					/>
				</Card>
			)}

			<Divider />

			<Card title="Danger Zone">
				<Flex vertical gap={16}>
					{!isOwner && (
						<Flex justify="space-between" align="center">
							<div>
								<Typography.Text strong>Leave Household</Typography.Text>
								<br />
								<Typography.Text type="secondary">
									You will need a new invite code to rejoin.
								</Typography.Text>
							</div>
							<Button danger icon={<LogoutOutlined />} onClick={handleLeave}>
								Leave
							</Button>
						</Flex>
					)}
					{isOwner && (
						<Flex justify="space-between" align="center">
							<div>
								<Typography.Text strong>Delete Household</Typography.Text>
								<br />
								<Typography.Text type="secondary">
									Permanently delete the household and remove all members.
								</Typography.Text>
							</div>
							<Button
								danger
								type="primary"
								icon={<DeleteOutlined />}
								onClick={handleDelete}
							>
								Delete
							</Button>
						</Flex>
					)}
				</Flex>
			</Card>
		</Flex>
	);
};
