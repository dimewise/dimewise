import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/home/index.tsx";
import Dashboard from "./pages/dashboard/index.tsx";
import History from "./pages/history/index.tsx";
import Settings from "./pages/settings/index.tsx";
import Wishlist from "./pages/wishlist/index.tsx";
import { Auth0Provider } from "@auth0/auth0-react";
import { ProtectedRoutes } from "./pages/components/ProtectedRoutes/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <HomePage />
    ),
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/dashboard",
        element: (
          <Dashboard />
        ),
      },
      {
        path: "/settings",
        element: (
          <Settings />
        ),
      },
      {
        path: "/history",
        element: (
          <History />
        ),
      },
      {
        path: "/wishlist",
        element: (
          <Wishlist />
        )
      }

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
    >
      <RouterProvider router={router} />
    </Auth0Provider>
  </React.StrictMode>
);
