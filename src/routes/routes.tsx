import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

export const DimewisePaths = {
	// Base Routes
	Home: "/",
	About: "/about",
	PrivacyPolicy: "/privacy-policy",
	TermsAndConditions: "/terms-and-conditions",
	// Authentication Routes
	Login: "/auth/login",
	Register: "/auth/register",
	// Authenticated Routes
	Dashboard: "/dashboard",
};

const Home = lazy(() => import("./pages/home/Home").then((m) => ({ default: m.Home })));
const About = lazy(() => import("./pages/about/About").then((m) => ({ default: m.About })));
const PrivacyPolicy = lazy(() =>
	import("./pages/privacy-policy/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })),
);
const TermsAndConditions = lazy(() =>
	import("./pages/terms-and-conditions/TermsAndConditions").then((m) => ({ default: m.TermsAndConditions })),
);
const Login = lazy(() => import("./pages/auth/Login").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("./pages/auth/Register").then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));

export const DimewiseRoutes: RouteObject[] = [
	{ path: DimewisePaths.Home, element: <Home /> },
	{ path: DimewisePaths.About, element: <About /> },
	{ path: DimewisePaths.PrivacyPolicy, element: <PrivacyPolicy /> },
	{ path: DimewisePaths.TermsAndConditions, element: <TermsAndConditions /> },
	{ path: DimewisePaths.Login, element: <Login /> },
	{ path: DimewisePaths.Register, element: <Register /> },
	{ path: DimewisePaths.Dashboard, element: <Dashboard /> },
];
