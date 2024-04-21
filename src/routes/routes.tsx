import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedPage from "../auth/ProtectedPage";

export const Paths = {
	// Base Routes
	Home: "/",
	About: "/about",
	PrivacyPolicy: "/privacy-policy",
	TermsAndConditions: "/terms-and-conditions",
	// Authentication Routes
	Login: "/auth/login",
	Register: "/auth/register",
	// Protected Routes
	Dashboard: "/dashboard",
};

const Home = lazy(() => import("./pages/home/Home").then((m) => ({ default: m.Home })));
const About = lazy(() => import("./pages/about/About").then((m) => ({ default: m.About })));
const PrivacyPolicy = lazy(() =>
	import("./pages/privacy-policy/PrivacyPolicy").then((m) => ({
		default: m.PrivacyPolicy,
	})),
);
const TermsAndConditions = lazy(() =>
	import("./pages/terms-and-conditions/TermsAndConditions").then((m) => ({
		default: m.TermsAndConditions,
	})),
);
const Login = lazy(() => import("./pages/auth/Login").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("./pages/auth/Register").then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));

export const Routes: RouteObject[] = [
	// Routes
	{ path: Paths.Home, element: <Home /> },
	{ path: Paths.About, element: <About /> },
	{ path: Paths.PrivacyPolicy, element: <PrivacyPolicy /> },
	{ path: Paths.TermsAndConditions, element: <TermsAndConditions /> },
	{ path: Paths.Login, element: <Login /> },
	{ path: Paths.Register, element: <Register /> },

	// Protected Routes
	...[{ path: Paths.Dashboard, element: <Dashboard /> }].map((route) => ({
		...route,
		element: <ProtectedPage>{route.element}</ProtectedPage>,
	})),
];
