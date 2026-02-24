import { Button, Flex, Typography } from "antd";
import { useNavigate } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

export const LandingPage = () => {
	const navigate = useNavigate();

	return (
		<Flex
			vertical
			justify="center"
			align="center"
			gap={24}
			style={{ minHeight: "calc(100vh - 128px)", textAlign: "center" }}
		>
			<Typography.Title>Split expenses, not friendships.</Typography.Title>
			<Typography.Paragraph
				style={{ fontSize: 18, maxWidth: 600, color: "#666" }}
			>
				Dimewise makes household budgeting simple. Track shared expenses, split
				costs fairly, and settle up at the end of each month — all in one place.
			</Typography.Paragraph>
			<Flex gap={16}>
				<Button
					type="primary"
					size="large"
					onClick={() => navigate(RoutesEnum.register)}
				>
					Get Started
				</Button>
				<Button size="large" onClick={() => navigate(RoutesEnum.login)}>
					Sign In
				</Button>
			</Flex>
		</Flex>
	);
};
