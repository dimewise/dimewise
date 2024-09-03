export enum Routes {
	Catcher = "*",

	// auth
	Auth = "/auth",
	SignIn = "/auth/sign-in",
	SignUp = "/auth/sign-up",

	// public
	Root = "/",

	// private
	Dashboard = "/dashboard",
	Overview = "/dashboard/overview",
	Transactions = "/dashboard/history",
	Categories = "/dashboard/categories",
	Settings = "/dashboard/settings",
	About = "/dashboard/about",
	Feedback = "/dashboard/feedback",
}
