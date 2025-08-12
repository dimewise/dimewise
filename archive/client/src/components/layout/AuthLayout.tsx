import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Button, IconButton, Stack, styled } from "@mui/material";
import MuiCard from "@mui/material/Card";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { Routes } from "../../Routes";
import type { RootState } from "../../store";
import { toggleMode } from "../../store/themeSlice";
import { ToggleColorMode } from "../Home/ToggleMode";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow: "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow: "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const AuthContainer = styled(Stack)(({ theme }) => ({
  height: "100%",
  backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
  ...theme.applyStyles("dark", {
    backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
}));

export const AuthLayout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  const handleToggleMode = () => {
    dispatch(toggleMode());
  };

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Button
          variant="text"
          size="small"
          aria-label="Back to templates"
          startIcon={<ArrowBackRoundedIcon />}
          component={Link}
          to={Routes.Root}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          {t("common.button.back-to-home")}
        </Button>
        <IconButton
          size="small"
          aria-label="Back to templates"
          component={Link}
          to={Routes.Root}
          sx={{ display: { xs: "auto", sm: "none" } }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <ToggleColorMode
          mode={mode}
          toggleColorMode={handleToggleMode}
        />
      </Box>
      <AuthContainer>
        <Stack
          sx={{
            justifyContent: "center",
            height: "100dvh",
          }}
        >
          <Card variant="outlined">
            <Outlet />
          </Card>
        </Stack>
      </AuthContainer>
    </>
  );
};
