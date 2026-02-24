import {
	DollarOutlined,
	HomeOutlined,
	SettingOutlined,
} from "@ant-design/icons";
import { UserButton } from "@clerk/clerk-react";
import { Flex, Layout, Menu, Typography } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Outlet, useLocation, useNavigate } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

const menuItems = [
	{
		key: RoutesEnum.dashboard,
		icon: <HomeOutlined />,
		label: "Dashboard",
	},
	{
		key: RoutesEnum.budgets,
		icon: <DollarOutlined />,
		label: "Budgets",
	},
	{
		key: RoutesEnum.householdSettings,
		icon: <SettingOutlined />,
		label: "Settings",
	},
];

export const AuthenticatedLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider breakpoint="lg" collapsedWidth="0">
				<Flex
					justify="center"
					align="center"
					style={{ height: 64, padding: "0 16px" }}
				>
					<Typography.Text strong style={{ color: "white", fontSize: 18 }}>
						Dimewise
					</Typography.Text>
				</Flex>
				<Menu
					theme="dark"
					mode="inline"
					selectedKeys={[location.pathname]}
					items={menuItems}
					onClick={({ key }) => navigate(key)}
				/>
			</Sider>
			<Layout>
				<Header
					style={{
						padding: "0 24px",
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "center",
					}}
				>
					<UserButton afterSignOutUrl={RoutesEnum.root} />
				</Header>
				<Content style={{ margin: "24px 16px", padding: 24 }}>
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
};
