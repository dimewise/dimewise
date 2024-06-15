import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Routes } from "../../Routes";
import { useAuth } from "../../hooks/useAuth";

export const PrivateLayout = () => {
	const { session: authSession } = useAuth();
	const location = useLocation();

	if (!authSession) {
		return (
			<Navigate
				to={Routes.Login}
				state={{ from: location }}
				replace
			/>
		);
	}
	return (
		<div className="bg-green-500">
			<Outlet />
		</div>
	);
};
