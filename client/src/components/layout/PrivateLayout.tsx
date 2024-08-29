import { useTranslation } from "react-i18next";
import { Link, Navigate, Outlet, useLocation, useMatch } from "react-router-dom";
import { Routes } from "../../Routes";
import { useAuth } from "../../hooks/useAuth";
import { LogoButton } from "../LogoButton";

export const PrivateLayout = () => {
	const { user } = useAuth();
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

	return (
		<div className="flex w-full">
			<div className="drawer h-screen lg:drawer-open">
				<input
					id="my-drawer-2"
					type="checkbox"
					className="drawer-toggle"
				/>
				<div className="drawer-content flex flex-col items-center justify-center">
					<main className="h-full w-full flex align-center justify-center p-10">
						<div className="prose w-full max-w-5xl h-full flex flex-col pb-10 lg:pb-0">
							<Outlet />
						</div>
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
						<AccountMenuList />
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
					{t("nav.private.overview")}
				</Link>
			</li>
			<li>
				<Link
					to={Routes.History}
					className={`w-full ${useMatch(Routes.History) ? "active" : ""}`}
				>
					{t("nav.private.history")}
				</Link>
			</li>
		</>
	);
};

const AccountMenuList = () => {
	const { t } = useTranslation();
	return (
		<>
			<li>
				<Link
					to={Routes.Settings}
					className={`w-full ${useMatch(Routes.Settings) ? "active" : ""}`}
				>
					{t("nav.private.settings")}
				</Link>
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
				className={useMatch(Routes.Overview) ? "active" : ""}
				to={Routes.Overview}
			>
				<span className="btm-nav-label">{t("nav.private.overview")}</span>
			</Link>
			<Link
				type="button"
				className={useMatch(Routes.History) ? "active" : ""}
				to={Routes.History}
			>
				<span className="btm-nav-label">{t("nav.private.history")}</span>
			</Link>
			<button type="button">
				<span className="btm-nav-label">{t("nav.private.add")}</span>
			</button>
			<Link
				type="button"
				className={useMatch(Routes.Settings) ? "active" : ""}
				to={Routes.Settings}
			>
				<span className="btm-nav-label">{t("nav.private.settings")}</span>
			</Link>
		</div>
	);
};
