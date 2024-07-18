import { useTranslation } from "react-i18next";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Routes } from "../../Routes";
import { MenuIcon } from "../../assets/Icons/MenuIcon";
import { LogoButton } from "../LogoButton";

export const PublicLayout = () => {
	const navigate = useNavigate();

	const handleOnClickLogo = () => {
		navigate(Routes.Root);
	};

	return (
		<div className="drawer drawer-end h-full">
			<input
				id="nav-drawer"
				type="checkbox"
				className="drawer-toggle"
			/>
			<div className="drawer-content flex flex-col justify-start items-center">
				{/* Navbar */}
				<nav className="navbar w-full max-w-7xl h-navbar flex justify-between items-center px-5 flex-none">
					<LogoButton onClick={handleOnClickLogo} />
					<div className="flex-none lg:hidden">
						<label
							htmlFor="nav-drawer"
							aria-label="open sidebar"
							className="btn btn-square btn-ghost"
						>
							<MenuIcon />
						</label>
					</div>
					<div className="flex-none hidden lg:block">
						<ul className="menu menu-horizontal gap-x-3">
							{/* Navbar menu content here */}
							<MenuList />
						</ul>
					</div>
				</nav>
				<main className="flex-1 w-full h-full flex justify-center items-start">
					<Outlet />
				</main>
			</div>
			<nav className="drawer-side">
				<label
					htmlFor="nav-drawer"
					aria-label="close sidebar"
					className="drawer-overlay"
				/>
				<ul className="menu p-4 w-80 min-h-full bg-base-200">
					{/* Sidebar content here */}
					<MenuList />
				</ul>
			</nav>
		</div>
	);
};

const MenuList = () => {
	const { t } = useTranslation();
	return (
		<>
			<li>
				<Link
					to={Routes.Login}
					className="btn btn-secondary btn-ghost"
				>
					{t("nav.public.sign_in")}
				</Link>
			</li>
			<li>
				<Link
					to={Routes.Login}
					className="btn btn-primary"
				>
					{t("nav.public.get_started")}
				</Link>
			</li>
		</>
	);
};
