import {
	FileBarChart,
	LayoutDashboard,
	PiggyBank,
	Receipt,
	Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { RoutesEnum } from "@/routes/Routes";

const navItems = [
	{
		path: RoutesEnum.dashboard,
		icon: LayoutDashboard,
		labelKey: "nav.dashboard",
	},
	{ path: RoutesEnum.expenses, icon: Receipt, labelKey: "nav.expenses" },
	{ path: RoutesEnum.budgets, icon: PiggyBank, labelKey: "nav.budgets" },
	{ path: RoutesEnum.reports, icon: FileBarChart, labelKey: "nav.reports" },
	{
		path: RoutesEnum.householdSettings,
		icon: Settings,
		labelKey: "nav.settings",
	},
];

export function Sidebar() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
			<div className="flex flex-1 flex-col border-r border-border bg-sidebar">
				{/* Logo */}
				<button
					type="button"
					className="flex items-center px-4 py-3 cursor-pointer"
					onClick={() => navigate(RoutesEnum.dashboard)}
				>
					<img
						src="/dimewise-logo-cropped.png"
						alt="Dimewise"
						className="h-full max-h-"
					/>
				</button>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 px-3 py-4">
					{navItems.map((item) => {
						const isActive =
						location.pathname === item.path ||
						(item.path === RoutesEnum.householdSettings &&
							location.pathname === RoutesEnum.accountSettings);
						return (
							<button
								key={item.path}
								type="button"
								onClick={() => navigate(item.path)}
								className={cn(
									"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
									isActive
										? "bg-brand-light text-brand-dark shadow-sm"
										: "text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground",
								)}
							>
								<item.icon
									className="h-5 w-5"
									strokeWidth={isActive ? 2.5 : 2}
								/>
								{t(item.labelKey)}
							</button>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="px-4 py-4 text-xs text-sidebar-foreground/40">
					{t("sidebar.version")}
				</div>
			</div>
		</aside>
	);
}
