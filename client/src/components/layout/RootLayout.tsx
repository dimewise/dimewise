import { Outlet } from "react-router-dom";

export const RootLayout = () => {
	return (
		<div className="w-full h-dvh flex flex-col justify-start items-center">
			<Outlet />
		</div>
	);
};
