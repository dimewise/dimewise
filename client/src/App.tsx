import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import "./lib/locale/i18n";
import { AuthProvider } from "./components/context/AuthContext";
import { Provider } from "react-redux";
import { store } from "./store";

export const App = () => {
	return (
		<Provider store={store}>
			<AuthProvider>
				<RouterProvider router={Router} />
			</AuthProvider>
		</Provider>
	);
};
