import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import "./lib/locale/i18n";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { AuthProvider } from "./components/context/AuthContext";
import { type RootState, store } from "./store";
import { initializeTheme } from "./store/themeSlice";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { getTheme } from "./theme/getTheme";

const App = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  const theme = createTheme(getTheme(mode));

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={Router} />
        </ThemeProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
};

export const RootApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);
