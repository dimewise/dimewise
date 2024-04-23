import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { Layout } from "./common/layout/Layout";
import "./i18n";
import "./index.css";
import { Routes } from "./routes/routes";

function App() {
	const router = createBrowserRouter([
		{
			element: (
				<AuthProvider>
					<Layout />
				</AuthProvider>
			),
			// consider adding error element
			// errorElement: <Page404 />,
			children: Routes,
		},
	]);
	return <RouterProvider router={router} />;
}

export default App;
