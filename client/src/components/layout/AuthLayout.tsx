import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
	return (
		<>
			<main className="flex-1 w-full h-full flex justify-evenly items-start">
				<Outlet />
			</main>
		</>
	);
};
