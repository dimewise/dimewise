import { CopyOutlined, CrownOutlined, UserOutlined } from "@ant-design/icons";
import {
	Avatar,
	Card,
	Col,
	Flex,
	List,
	message,
	Row,
	Tag,
	Tooltip,
	Typography,
} from "antd";
import type { HouseholdWithMembers } from "@/store/api/api";
import { useGetUsersMeQuery } from "@/store/api/api";

type Props = {
	household: HouseholdWithMembers;
};

export const HouseholdDashboard = ({ household }: Props) => {
	const { data: currentUser } = useGetUsersMeQuery();
	const isOwner = currentUser?.id === household.owner_id;

	const copyInviteCode = () => {
		navigator.clipboard.writeText(household.invite_code);
		message.success("Invite code copied to clipboard!");
	};

	return (
		<Flex vertical gap={24}>
			<Typography.Title level={3}>{household.name}</Typography.Title>

			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8}>
					<Card>
						<Card.Meta
							title="Currency"
							description={
								<Typography.Text style={{ fontSize: 24, fontWeight: 600 }}>
									{household.currency}
								</Typography.Text>
							}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8}>
					<Card>
						<Card.Meta
							title="Members"
							description={
								<Typography.Text style={{ fontSize: 24, fontWeight: 600 }}>
									{household.members.length}
								</Typography.Text>
							}
						/>
					</Card>
				</Col>
				{isOwner && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<Card.Meta
								title="Invite Code"
								description={
									<Tooltip title="Click to copy">
										<Typography.Text
											copyable={{
												icon: <CopyOutlined />,
												onCopy: copyInviteCode,
											}}
											style={{
												fontSize: 24,
												fontWeight: 600,
												fontFamily: "monospace",
											}}
										>
											{household.invite_code}
										</Typography.Text>
									</Tooltip>
								}
							/>
						</Card>
					</Col>
				)}
			</Row>

			<Card title="Members">
				<List
					dataSource={household.members}
					renderItem={(member) => {
						const isMemberOwner = member.user_id === household.owner_id;
						const displayName = [member.first_name, member.last_name]
							.filter(Boolean)
							.join(" ");

						return (
							<List.Item>
								<List.Item.Meta
									avatar={
										member.avatar_url ? (
											<Avatar src={member.avatar_url} />
										) : (
											<Avatar icon={<UserOutlined />} />
										)
									}
									title={
										<Flex gap={8} align="center">
											<span>{displayName || member.email}</span>
											{isMemberOwner && (
												<Tag icon={<CrownOutlined />} color="gold">
													Owner
												</Tag>
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
		</Flex>
	);
};
