import { Flex, Spin } from "antd";
import { Navigate } from "react-router";
import { HouseholdDashboard } from "@/components/Household/HouseholdDashboard";
import { RoutesEnum } from "@/routes/Routes";
import { useGetMyHouseholdQuery } from "@/store/api/api";

export const DashboardPage = () => {
	const { data: household, isLoading, error } = useGetMyHouseholdQuery();

	if (isLoading) {
		return (
			<Flex justify="center" align="center" style={{ padding: 48 }}>
				<Spin size="large" />
			</Flex>
		);
	}

	// 404 means user has no household — redirect to setup
	if (error && "status" in error && error.status === 404) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	return <HouseholdDashboard household={household} />;
};
