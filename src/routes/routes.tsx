import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

export const DimewisePaths = {
	Home: "/",
	About: "/about",
	PrivacyPolicy: "/privacy-policy",
	TermsAndConditions: "/terms-and-conditions",
	Dashboard: "/dashboard",
};

// routes declaration
const Home = lazy(() => import("./pages/home/Home").then((module) => ({ default: module.Home })));
const About = lazy(() => import("./pages/about/About").then((module) => ({ default: module.About })));
const PrivacyPolicy = lazy(() =>
	import("./pages/privacy-policy/PrivacyPolicy").then((module) => ({ default: module.PrivacyPolicy })),
);
const TermsAndConditions = lazy(() =>
	import("./pages/terms-and-conditions/TermsAndConditions").then((module) => ({ default: module.TermsAndConditions })),
);
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then((module) => ({ default: module.Dashboard })));

export const DimewiseRoutes: RouteObject[] = [
	{ path: DimewisePaths.Home, element: <Home /> },
	{ path: DimewisePaths.About, element: <About /> },
	{ path: DimewisePaths.PrivacyPolicy, element: <PrivacyPolicy /> },
	{ path: DimewisePaths.TermsAndConditions, element: <TermsAndConditions /> },
	{ path: DimewisePaths.Dashboard, element: <Dashboard /> },
];
