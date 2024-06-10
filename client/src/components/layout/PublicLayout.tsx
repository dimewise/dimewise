import { Link, Outlet } from "react-router-dom";
import { Routes } from "../../app/Routes";
import { MenuIcon } from "../../assets/Icons/MenuIcon";

export const PublicLayout = () => {
	return (
		<>
			<div className="drawer drawer-end h-full">
				<input
					id="nav-drawer"
					type="checkbox"
					className="drawer-toggle"
				/>
				<div className="drawer-content flex flex-col justify-start items-center">
					{/* Navbar */}
					<nav className="navbar w-full max-w-7xl h-navbar flex justify-between items-center px-5 flex-none">
						<h1 className="font-black text-2xl">
							Dimewise<span className="text-primary">.</span>
						</h1>
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
		</>
	);
};

const MenuList = () => {
	return (
		<>
			<li>
				<Link
					to={Routes.Login}
					className="btn btn-secondary btn-ghost"
				>
					Sign In
				</Link>
			</li>
			<li>
				<Link
					to={Routes.Login}
					className="btn btn-primary"
				>
					Start budget
				</Link>
			</li>
		</>
	);
};
