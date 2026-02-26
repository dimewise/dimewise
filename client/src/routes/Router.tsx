import { createBrowserRouter } from "react-router";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import { PublicLayout } from "@/components/Layout/PublicLayout";
import { BudgetsPage } from "@/pages/BudgetsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { HouseholdSettingsPage } from "@/pages/HouseholdSettingsPage";
import { HouseholdSetupPage } from "@/pages/HouseholdSetupPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { RoutesEnum } from "./Routes";

export const router = createBrowserRouter([
	{
		path: RoutesEnum.root,
		Component: PublicLayout,
		children: [
			{ index: true, Component: LandingPage },
			{ path: "login/*", Component: LoginPage },
			{ path: "register/*", Component: RegisterPage },
		],
	},
	{
		Component: AuthGuard,
		children: [
			{
				Component: AuthenticatedLayout,
				children: [
					{
						path: RoutesEnum.dashboard,
						Component: DashboardPage,
					},
					{
						path: RoutesEnum.budgets,
						Component: BudgetsPage,
					},
					{
						path: RoutesEnum.expenses,
						Component: ExpensesPage,
					},
					{
						path: RoutesEnum.reports,
						Component: ReportsPage,
					},
					{
						path: RoutesEnum.householdSetup,
						Component: HouseholdSetupPage,
					},
					{
						path: RoutesEnum.householdSettings,
						Component: HouseholdSettingsPage,
					},
				],
			},
		],
	},
	{
		path: "*",
		Component: NotFoundPage,
	},
]);
