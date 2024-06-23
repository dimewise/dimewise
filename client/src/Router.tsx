import { Navigate, createBrowserRouter } from "react-router-dom";
import { Routes } from "./Routes";
import { AuthLayout } from "./components/layout/AuthLayout";
import { PrivateLayout } from "./components/layout/PrivateLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { RootLayout } from "./components/layout/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";

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
						element: <Navigate to={Routes.Login} />,
					},
					{
						path: Routes.Login,
						element: <Login />,
					},
					{
						path: Routes.SignUp,
						element: <SignUp />,
					},
					{
						path: Routes.ForgotPassword,
						element: <ForgotPassword />,
					},
				],
			},
			{
				path: Routes.Dashboard,
				element: <PrivateLayout />,
				children: [
					{
						path: Routes.Dashboard,
						element: <Dashboard />,
					},
				],
			},
		],
	},
]);
