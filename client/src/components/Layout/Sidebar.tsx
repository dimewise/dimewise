import {
	FileBarChart,
	LayoutDashboard,
	PiggyBank,
	Receipt,
	Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { RoutesEnum } from "@/routes/Routes";

const navItems = [
	{ path: RoutesEnum.dashboard, icon: LayoutDashboard, label: "Dashboard" },
	{ path: RoutesEnum.expenses, icon: Receipt, label: "Expenses" },
	{ path: RoutesEnum.budgets, icon: PiggyBank, label: "Budgets" },
	{ path: RoutesEnum.reports, icon: FileBarChart, label: "Reports" },
	{ path: RoutesEnum.householdSettings, icon: Settings, label: "Settings" },
];

export function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
			<div className="flex flex-1 flex-col bg-sidebar">
				{/* Logo */}
				<div className="flex h-16 items-center gap-2.5 px-6">
					<img src="/pwa-192x192.png" alt="Dimewise" className="h-8 w-8" />
					<span className="text-lg font-bold text-sidebar-foreground tracking-tight">
						Dimewise
					</span>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 px-3 py-4">
					{navItems.map((item) => {
						const isActive = location.pathname === item.path;
						return (
							<button
								key={item.path}
								type="button"
								onClick={() => navigate(item.path)}
								className={cn(
									"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
									isActive
										? "bg-sidebar-active text-white shadow-sm"
										: "text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground",
								)}
							>
								<item.icon
									className="h-5 w-5"
									strokeWidth={isActive ? 2.5 : 2}
								/>
								{item.label}
							</button>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="px-4 py-4 text-xs text-sidebar-foreground/40">
					Dimewise v1.0
				</div>
			</div>
		</aside>
	);
}
