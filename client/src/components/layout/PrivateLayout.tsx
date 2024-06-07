import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Routes } from "../../app/Routes";
import type { RootState } from "../../store/store";

export const PrivateLayout = () => {
	const user = useSelector((state: RootState) => state.user);
	const location = useLocation();

	if (!user) {
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
