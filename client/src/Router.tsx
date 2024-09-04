import { Navigate, createBrowserRouter } from "react-router-dom";
import { Routes } from "./Routes";
import { AuthLayout } from "./components/layout/AuthLayout";
import { PrivateLayout } from "./components/layout/PrivateLayout/PrivateLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { RootLayout } from "./components/layout/RootLayout";
import { About } from "./pages/About";
import { Categories } from "./pages/Categories";
import { Feedback } from "./pages/Feedback";
import { Home } from "./pages/Home";
import { Overview } from "./pages/Overview";
import { Settings } from "./pages/Settings";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Transactions } from "./pages/Transactions";

export const Router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{
				path: Routes.Root,
				element: <PublicLayout />,
				children: [
					{
						path: Routes.Root,
						element: <Home />,
					},
				],
			},
			{
				path: Routes.Auth,
				element: <AuthLayout />,
				children: [
					{
						path: Routes.Auth,
						element: <Navigate to={Routes.SignIn} />,
					},
					{
						path: Routes.SignIn,
						element: <SignIn />,
					},
					{
						path: Routes.SignUp,
						element: <SignUp />,
					},
				],
			},
			{
				path: Routes.Dashboard,
				element: <PrivateLayout />,
				children: [
					{
						path: Routes.Dashboard,
						element: <Navigate to={Routes.Overview} />,
					},
					{
						path: Routes.Overview,
						element: <Overview />,
					},
					{
						path: Routes.Transactions,
						element: <Transactions />,
					},
					{
						path: Routes.Categories,
						element: <Categories />,
					},
					{
						path: Routes.Settings,
						element: <Settings />,
					},
					{
						path: Routes.About,
						element: <About />,
					},
					{
						path: Routes.Feedback,
						element: <Feedback />,
					},
				],
			},
		],
	},
]);
