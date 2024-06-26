import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Routes } from "../../Routes";

export const PrivateLayout = () => {
	const { user, logout } = useAuth();
	const location = useLocation();

	if (!user) {
		console.log("here");
		return (
			<Navigate
				to={Routes.Login}
				state={{
					from: location,
				}}
				replace
			/>
		);
	}

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="flex h-full w-full">
			<div className="drawer lg:drawer-open">
				<input
					id="my-drawer-2"
					type="checkbox"
					className="drawer-toggle"
				/>
				<div className="drawer-content flex flex-col items-center justify-center">
					{/* Page content here */}
					<label
						htmlFor="my-drawer-2"
						className="btn btn-primary drawer-button lg:hidden"
					>
						Open drawer
					</label>
					<main>
						<Outlet />
					</main>
				</div>
				<div className="drawer-side">
					<label
						htmlFor="my-drawer-2"
						aria-label="close sidebar"
						className="drawer-overlay"
					/>
					<ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
						{/* Sidebar content here */}
						<MenuList />
						<div className="divider" />
						<AccountMenuList handleLogout={handleLogout} />
					</ul>
				</div>
			</div>
		</div>
	);
};

const MenuList = () => {
	return (
		<>
			<li>
				<a href="/">Dashboard</a>
			</li>
			<li>
				<a href="/">Budget</a>
			</li>
		</>
	);
};

interface AccountMenuListProps {
	handleLogout: () => void;
}
const AccountMenuList = ({ handleLogout }: AccountMenuListProps) => {
	return (
		<>
			<li>
				<a href="/">Account Settings</a>
			</li>
			<li>
				<button
					type="button"
					onClick={handleLogout}
				>
					Logout
				</button>
			</li>
		</>
	);
};
