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
	{ path: RoutesEnum.dashboard, icon: LayoutDashboard, labelKey: "nav.home" },
	{ path: RoutesEnum.expenses, icon: Receipt, labelKey: "nav.expenses" },
	{ path: RoutesEnum.budgets, icon: PiggyBank, labelKey: "nav.budgets" },
	{ path: RoutesEnum.reports, icon: FileBarChart, labelKey: "nav.reports" },
	{
		path: RoutesEnum.householdSettings,
		icon: Settings,
		labelKey: "nav.settings",
	},
];

export function BottomNav() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
			<div className="mx-auto flex items-center justify-around pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom)]">
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
								"flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium transition-colors min-w-[56px] cursor-pointer",
								isActive
									? "text-brand"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<item.icon
								className={cn(
									"h-5 w-5 transition-all",
									isActive && "scale-110",
								)}
								strokeWidth={isActive ? 2.5 : 2}
							/>
							<span>{t(item.labelKey)}</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
