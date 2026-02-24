import { Button, Flex, Layout, Typography } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

export const PublicLayout = () => {
	const navigate = useNavigate();

	return (
		<Layout>
			<Header
				style={{
					position: "sticky",
					top: 0,
					zIndex: 1,
					width: "100%",
					display: "flex",
					alignItems: "center",
				}}
			>
				<Flex justify="space-between" style={{ width: "100%" }}>
					<Typography.Text
						style={{
							color: "white",
							fontWeight: "bold",
							fontSize: 20,
							cursor: "pointer",
						}}
						onClick={() => navigate(RoutesEnum.root)}
					>
						Dimewise
					</Typography.Text>
					<Flex gap={8}>
						<Button
							type="text"
							style={{ color: "white" }}
							onClick={() => navigate(RoutesEnum.login)}
						>
							Login
						</Button>
						<Button
							type="primary"
							onClick={() => navigate(RoutesEnum.register)}
						>
							Register
						</Button>
					</Flex>
				</Flex>
			</Header>
			<Content style={{ padding: "0 48px" }}>
				<Outlet />
			</Content>
		</Layout>
	);
};
