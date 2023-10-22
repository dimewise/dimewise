import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/home/index.tsx";
import Dashboard from "./pages/dashboard/index.tsx";
import AuthWrapper from "./components/AuthWrapper/index.tsx";
import History from "./pages/history/index.tsx";
import Settings from "./pages/settings/index.tsx";
import Statistics from "./pages/statistics/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthWrapper>
        <HomePage />
      </AuthWrapper>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthWrapper>
        <Dashboard />
      </AuthWrapper>
    ),
  },
  {
    path: "/settings",
    element: (
      <AuthWrapper>
        <Settings />
      </AuthWrapper>
    ),
  },
  {
    path: "/history",
    element: (
      <AuthWrapper>
        <History />
      </AuthWrapper>
    ),
  },
  {
    path: "/statistics",
    element: (
      <AuthWrapper>
        <Statistics />
      </AuthWrapper>
    )
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
