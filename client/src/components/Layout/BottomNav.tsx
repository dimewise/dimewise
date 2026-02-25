import {
	LayoutDashboard,
	PiggyBank,
	Receipt,
	FileBarChart,
	Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { RoutesEnum } from "@/routes/Routes";

const navItems = [
	{ path: RoutesEnum.dashboard, icon: LayoutDashboard, label: "Home" },
	{ path: RoutesEnum.expenses, icon: Receipt, label: "Expenses" },
	{ path: RoutesEnum.budgets, icon: PiggyBank, label: "Budgets" },
	{ path: RoutesEnum.reports, icon: FileBarChart, label: "Reports" },
	{ path: RoutesEnum.householdSettings, icon: Settings, label: "Settings" },
];

export function BottomNav() {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
			<div className="mx-auto flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
				{navItems.map((item) => {
					const isActive = location.pathname === item.path;
					return (
						<button
							key={item.path}
							type="button"
							onClick={() => navigate(item.path)}
							className={cn(
								"flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium transition-colors min-w-[56px]",
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
							<span>{item.label}</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
