import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
	return (
		<div>
			<nav className="navbar w-full max-w-7xl h-navbar flex justify-between items-center px-5 flex-none">
				<h1 className="font-black text-2xl">
					Dimewise<span className="text-primary">.</span>
				</h1>
			</nav>
			<main className="flex-1 w-full h-full flex justify-center items-start">
				<Outlet />
			</main>
		</div>
	);
};
