import { Navigate, createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout";
import { PrivateLayout } from "./components/layout/PrivateLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { RootLayout } from "./components/layout/RootLayout";
import { Routes } from "./Routes";
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/Login";
import { Dashboard } from "./pages/private/Dashboard";

export const Router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: Routes.Root,
        element: <PublicLayout />,
        children: [
          {
            path: Routes.Root,
            element: <Home />,
          },
        ],
      },
      {
        path: Routes.Auth,
        element: <AuthLayout />,
        children: [
          {
            path: Routes.Auth,
            element: <Navigate to={Routes.Login} />,
          },
          {
            path: Routes.Login,
            element: <Login />,
          },
        ],
      },
      {
        path: Routes.Dashboard,
        element: <PrivateLayout />,
        children: [
          {
            path: Routes.Dashboard,
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
]);
