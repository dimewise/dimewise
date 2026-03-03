import { createBrowserRouter } from "react-router";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import { PublicLayout } from "@/components/Layout/PublicLayout";
import { AccountSettingsPage } from "@/pages/AccountSettingsPage";
import { BudgetsPage } from "@/pages/BudgetsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { HouseholdSettingsPage } from "@/pages/HouseholdSettingsPage";
import { HouseholdSetupPage } from "@/pages/HouseholdSetupPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { TermsOfServicePage } from "@/pages/TermsOfServicePage";
import { RoutesEnum } from "./Routes";

export const router = createBrowserRouter([
	{
		path: RoutesEnum.root,
		Component: PublicLayout,
		children: [
			{ index: true, Component: LandingPage },
			{ path: "login/*", Component: LoginPage },
			{ path: "register/*", Component: RegisterPage },
			{ path: "privacy", Component: PrivacyPolicyPage },
			{ path: "terms", Component: TermsOfServicePage },
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
					{
						path: RoutesEnum.accountSettings,
						Component: AccountSettingsPage,
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
