import { Box, Stack, alpha } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Routes } from "../../../Routes";
import { useAuth } from "../../../hooks/useAuth";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSideMenu } from "./DashboardSideMenu";
import { Header } from "./Header";

export const PrivateLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={Routes.SignIn}
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <DashboardSideMenu />
      <DashboardNavbar />
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          backgroundColor: alpha(theme.palette.background.default, 1),
          overflow: "auto",
        })}
      >
        <Stack
          spacing={2}
          sx={{
            width: "100%",
            height: "100dvh",
            alignItems: "center",
          }}
        >
          <Header />
          <Outlet />
        </Stack>
      </Box>
    </Box>
  );
};
