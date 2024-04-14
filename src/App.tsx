import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./common/layout/Layout";
import "./index.css";
import { DimewiseRoutes } from "./routes/routes";

function App() {
	const router = createBrowserRouter([
		{
			element: <Layout />,
			// consider adding error element
			// errorElement: <Page404 />,
			children: DimewiseRoutes,
		},
	]);
	return <RouterProvider router={router} />;
}

export default App;
