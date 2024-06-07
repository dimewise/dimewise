import { Outlet } from "react-router-dom";

export const PrivateLayout = () => {
	return (
		<div className="bg-green-500">
			<Outlet />
		</div>
	);
};
