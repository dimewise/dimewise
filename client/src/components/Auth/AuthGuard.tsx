import { useAuth } from "@clerk/clerk-react";
import { Flex, Spin } from "antd";
import { Navigate, Outlet } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

export const AuthGuard = () => {
	const { isSignedIn, isLoaded } = useAuth();

	if (!isLoaded) {
		return (
			<Flex
				justify="center"
				align="center"
				style={{ height: "100vh", width: "100%" }}
			>
				<Spin size="large" />
			</Flex>
		);
	}

	if (!isSignedIn) {
		return <Navigate to={RoutesEnum.login} replace />;
	}

	return <Outlet />;
};
