import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Routes } from "../../app/Routes";

export const PrivateLayout = () => {
	const auth = useAuth();
	const location = useLocation();

	if (!auth.user) {
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
