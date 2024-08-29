import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import "./lib/locale/i18n";
import { AuthProvider } from "./components/context/AuthContext";
import { Provider } from "react-redux";
import { store } from "./store";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

export const App = () => {
	return (
		<Provider store={store}>
			<AuthProvider>
				<RouterProvider router={Router} />
			</AuthProvider>
		</Provider>
	);
};
