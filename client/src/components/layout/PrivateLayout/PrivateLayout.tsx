import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Routes } from "../../../Routes";
import { useAuth } from "../../../hooks/useAuth";
import { alpha, Box, Stack } from "@mui/material";
import { SideMenu } from "./DashboardSideMenu";
import { AppNavbar } from "./DashboardNavbar";
import { Header } from "./Header";

export const PrivateLayout = () => {
	const { user } = useAuth();
	const location = useLocation();

	if (!user) {
		return (
			<Navigate
				to={Routes.SignIn}
				state={{
					from: location,
				}}
				replace
			/>
		);
	}

	return (
		<Box sx={{ display: "flex" }}>
			<SideMenu />
			<AppNavbar />
			<Box
				component="main"
				sx={(theme) => ({
					flexGrow: 1,
					backgroundColor: alpha(theme.palette.background.default, 1),
					overflow: "auto",
				})}
			>
				<Stack
					spacing={2}
					sx={{
						alignItems: "center",
						mx: 3,
						pb: 10,
						mt: { xs: 8, md: 0 },
					}}
				>
					<Header />
					<Outlet />
				</Stack>
			</Box>
		</Box>
	);
};
