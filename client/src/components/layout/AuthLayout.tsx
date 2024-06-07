import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
	return (
		<div className="bg-red-400">
			<Outlet />
		</div>
	);
};
