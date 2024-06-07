import { RouterProvider } from "react-router-dom";
import { Router } from "./app/Router";
import { AuthProvider } from "./components/context/AuthContext";

export const App = () => {
	return (
		<AuthProvider>
			<RouterProvider router={Router} />
		</AuthProvider>
	);
};
