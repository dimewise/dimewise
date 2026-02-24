import {
	Button,
	Card,
	Divider,
	Flex,
	Form,
	Input,
	message,
	Select,
	Typography,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { RoutesEnum } from "@/routes/Routes";
import {
	useCreateHouseholdMutation,
	useJoinHouseholdMutation,
} from "@/store/api/api";

const currencyOptions = [
	{ value: "USD", label: "USD — US Dollar" },
	{ value: "EUR", label: "EUR — Euro" },
	{ value: "GBP", label: "GBP — British Pound" },
	{ value: "CAD", label: "CAD — Canadian Dollar" },
	{ value: "AUD", label: "AUD — Australian Dollar" },
	{ value: "SGD", label: "SGD — Singapore Dollar" },
	{ value: "HKD", label: "HKD — Hong Kong Dollar" },
	{ value: "NZD", label: "NZD — New Zealand Dollar" },
	{ value: "CHF", label: "CHF — Swiss Franc" },
	{ value: "JPY", label: "JPY — Japanese Yen" },
	{ value: "KRW", label: "KRW — South Korean Won" },
];

type Mode = "choose" | "create" | "join";

export const HouseholdSetupPage = () => {
	const [mode, setMode] = useState<Mode>("choose");
	const navigate = useNavigate();
	const [createHousehold, { isLoading: isCreating }] =
		useCreateHouseholdMutation();
	const [joinHousehold, { isLoading: isJoining }] = useJoinHouseholdMutation();

	const handleCreate = async (values: { name: string; currency: string }) => {
		console.log("creating");
		try {
			await createHousehold({
				createHouseholdRequest: {
					name: values.name,
					currency: values.currency as "USD",
				},
			}).unwrap();
			message.success("Household created!");
			navigate(RoutesEnum.dashboard);
		} catch {
			message.error("Failed to create household. Please try again.");
		}
	};

	const handleJoin = async (values: { invite_code: string }) => {
		try {
			await joinHousehold({
				joinHouseholdRequest: { invite_code: values.invite_code },
			}).unwrap();
			message.success("Joined household!");
			navigate(RoutesEnum.dashboard);
		} catch {
			message.error(
				"Invalid invite code or you already belong to a household.",
			);
		}
	};

	if (mode === "choose") {
		return (
			<Flex justify="center" align="center" style={{ minHeight: "60vh" }}>
				<Card style={{ maxWidth: 480, width: "100%" }}>
					<Typography.Title level={3} style={{ textAlign: "center" }}>
						Welcome to Dimewise!
					</Typography.Title>
					<Typography.Paragraph style={{ textAlign: "center" }}>
						Get started by creating a new household or joining an existing one
						with an invite code.
					</Typography.Paragraph>
					<Flex vertical gap={12}>
						<Button
							type="primary"
							size="large"
							block
							onClick={() => setMode("create")}
						>
							Create a Household
						</Button>
						<Button size="large" block onClick={() => setMode("join")}>
							Join with Invite Code
						</Button>
					</Flex>
				</Card>
			</Flex>
		);
	}

	if (mode === "create") {
		return (
			<Flex justify="center" align="center" style={{ minHeight: "60vh" }}>
				<Card
					title="Create a Household"
					style={{ maxWidth: 480, width: "100%" }}
					extra={
						<Button type="link" onClick={() => setMode("choose")}>
							Back
						</Button>
					}
				>
					<Form layout="vertical" onFinish={handleCreate}>
						<Form.Item
							label="Household Name"
							name="name"
							rules={[
								{
									required: true,
									message: "Please enter a name",
								},
								{
									min: 1,
									max: 100,
									message: "Name must be between 1 and 100 characters",
								},
							]}
						>
							<Input placeholder="e.g. The Smith Family" />
						</Form.Item>
						<Form.Item
							label="Currency"
							name="currency"
							rules={[
								{
									required: true,
									message: "Please select a currency",
								},
							]}
						>
							<Select
								options={currencyOptions}
								placeholder="Select currency"
								showSearch
								filterOption={(input, option) =>
									(option?.label ?? "")
										.toLowerCase()
										.includes(input.toLowerCase())
								}
							/>
						</Form.Item>
						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								loading={isCreating}
								block
							>
								Create
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Flex>
		);
	}

	return (
		<Flex justify="center" align="center" style={{ minHeight: "60vh" }}>
			<Card
				title="Join a Household"
				style={{ maxWidth: 480, width: "100%" }}
				extra={
					<Button type="link" onClick={() => setMode("choose")}>
						Back
					</Button>
				}
			>
				<Form layout="vertical" onFinish={handleJoin}>
					<Form.Item
						label="Invite Code"
						name="invite_code"
						rules={[
							{
								required: true,
								message: "Please enter the invite code",
							},
						]}
					>
						<Input placeholder="e.g. A1B2C3D4" />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" loading={isJoining} block>
							Join
						</Button>
					</Form.Item>
				</Form>
				<Divider />
				<Typography.Paragraph type="secondary">
					Ask your household owner for the invite code to join.
				</Typography.Paragraph>
			</Card>
		</Flex>
	);
};
