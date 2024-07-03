import {
	ArrowLeftStartOnRectangleIcon,
	CalendarDaysIcon,
	Cog6ToothIcon,
	PlusIcon,
	RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Link, Navigate, Outlet, useLocation, useMatch } from "react-router-dom";
import { Routes } from "../../Routes";
import { useAuth } from "../../hooks/useAuth";
import { LogoButton } from "../LogoButton";

export const PrivateLayout = () => {
	const { user, logout } = useAuth();
	const location = useLocation();

	if (!user) {
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
						<LogoButton />
						<MenuList />
						<div className="divider" />
						<AccountMenuList handleLogout={handleLogout} />
					</ul>
				</div>
				<MobileNav />
			</div>
		</div>
	);
};

const MenuList = () => {
	const { t } = useTranslation();
	return (
		<>
			<li>
				<Link
					to={Routes.Overview}
					className={`w-full ${useMatch(Routes.Overview) ? "active" : ""}`}
				>
					<RectangleGroupIcon className="size-5" />
					{t("nav.private.overview")}
				</Link>
			</li>
			<li>
				<Link
					to={Routes.History}
					className={`w-full ${useMatch(Routes.History) ? "active" : ""}`}
				>
					<CalendarDaysIcon className="size-5" />
					{t("nav.private.history")}
				</Link>
			</li>
		</>
	);
};

interface AccountMenuListProps {
	handleLogout: () => void;
}
const AccountMenuList = ({ handleLogout }: AccountMenuListProps) => {
	const { t } = useTranslation();
	return (
		<>
			<li>
				<Link
					to={Routes.Settings}
					className={`w-full ${useMatch(Routes.Settings) ? "active" : ""}`}
				>
					<Cog6ToothIcon className="size-5" />
					{t("nav.private.settings")}
				</Link>
			</li>
			<li>
				<button
					type="button"
					onClick={handleLogout}
				>
					<ArrowLeftStartOnRectangleIcon className="size-5" />
					Logout
				</button>
			</li>
		</>
	);
};

const MobileNav = () => {
	const { t } = useTranslation();
	return (
		<div className="btm-nav lg:hidden">
			<Link
				type="button"
				to={Routes.Overview}
			>
				<RectangleGroupIcon className="size-5" />
				<span className="btm-nav-label">{t("nav.private.overview")}</span>
			</Link>
			<Link
				type="button"
				to={Routes.History}
			>
				<CalendarDaysIcon className="size-5" />
				<span className="btm-nav-label">{t("nav.private.history")}</span>
			</Link>
			<button type="button">
				<PlusIcon className="size-5" />
				<span className="btm-nav-label">{t("nav.private.add")}</span>
			</button>
			<Link
				type="button"
				to={Routes.Settings}
			>
				<Cog6ToothIcon className="size-5" />
				<span className="btm-nav-label">{t("nav.private.settings")}</span>
			</Link>
		</div>
	);
};
