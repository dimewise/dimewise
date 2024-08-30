import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import "./lib/locale/i18n";
import { AuthProvider } from "./components/context/AuthContext";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, type RootState } from "./store";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect } from "react";
import { initializeTheme } from "./store/themeSlice";
import { CssBaseline } from "@mui/material";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import { getTheme } from "./theme/getTheme";

const App = () => {
	const dispatch = useDispatch();
	const mode = useSelector((state: RootState) => state.theme.mode);

	useEffect(() => {
		dispatch(initializeTheme());
	}, [dispatch]);

	const theme = createTheme(getTheme(mode));

	return (
		<AuthProvider>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<RouterProvider router={Router} />
			</ThemeProvider>
		</AuthProvider>
	);
};

export const RootApp = () => (
	<Provider store={store}>
		<App />
	</Provider>
);
