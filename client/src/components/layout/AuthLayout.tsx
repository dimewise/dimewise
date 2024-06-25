import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Routes } from "../../Routes";
import { useAuth } from "../../hooks/useAuth";
import { LogoButton } from "../LogoButton";

export const AuthLayout = () => {
	const { session: authSession } = useAuth();
	const navigate = useNavigate();

	// TODO: find a better way to handle automatic re-route
	useEffect(() => {
		if (authSession) {
			return navigate(Routes.Dashboard, { replace: true });
		}
	}, [navigate, authSession]);

	const handleOnClickLogo = () => {
		navigate(Routes.Root);
	};

	return (
		<main className="flex-1 w-full h-full flex justify-evenly items-start">
			<div className="flex flex-col items-center justify-start w-full h-full">
				<nav className="navbar w-full max-w-7xl h-navbar flex justify-between items-center px-5 flex-none fixed top-0 left-0">
					<LogoButton onClick={handleOnClickLogo} />
				</nav>
				<div className="w-full flex-1 flex flex-col items-center justify-center">
					<Outlet />
				</div>
			</div>
			<div className="w-full h-full bg-primary hidden lg:flex" />
		</main>
	);
};
