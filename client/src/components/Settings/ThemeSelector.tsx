import { Box, Divider, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { toggleMode } from "../../store/themeSlice";

export const ThemeSelector = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  const handleToggleMode = () => {
    dispatch(toggleMode());
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center" }}>
      <Typography variant="h5">{t("settings.theme.title")}</Typography>
      <Divider />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography>{t("settings.theme.dark-mode")}</Typography>
        <Switch
          checked={mode === "dark"}
          onChange={handleToggleMode}
        />
      </Box>
    </Box>
  );
};
