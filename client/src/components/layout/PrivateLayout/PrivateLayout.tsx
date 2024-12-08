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
          sx={{
            width: "100%",
            height: "100dvh",
            alignItems: "center",
          }}
        >
          <Header />
          <Box
            sx={{
              position: "relative",
              px: 3,
              width: "100%",
              maxWidth: { sm: "100%", md: "1700px" },
              overflowY: "auto",
              pt: { xs: "64px", md: 0 },
            }}
          >
            <Outlet />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
