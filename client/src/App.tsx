import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import { AuthProvider } from "./components/context/AuthContext";

export const App = () => {
	return (
		<AuthProvider>
			<RouterProvider router={Router} />
		</AuthProvider>
	);
};
