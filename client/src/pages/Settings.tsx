import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";

export const Settings = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack
        sx={{ justifyContent: "space-between" }}
        direction="row"
      >
        <Typography
          component="h2"
          variant="h6"
          sx={{ mb: 2 }}
        >
          {t("nav.private.transactions")}
        </Typography>
      </Stack>
    </Box>
  );
};






