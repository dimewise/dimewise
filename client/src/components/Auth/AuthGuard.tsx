import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";
import { FullPageSpinner } from "@/components/ui/spinner";
import { RoutesEnum } from "@/routes/Routes";

export const AuthGuard = () => {
	const { isSignedIn, isLoaded } = useAuth();

	if (!isLoaded) {
		return <FullPageSpinner />;
	}

	if (!isSignedIn) {
		return <Navigate to={RoutesEnum.login} replace />;
	}

	return <Outlet />;
};
