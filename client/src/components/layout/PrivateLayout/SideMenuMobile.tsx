import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useApiV1UserMeDetailGetMeDetailQuery } from "../../../services/api/v1";
import { MenuContent } from "./MenuContent";

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export const SideMenuMobile = ({ open, toggleDrawer }: SideMenuMobileProps) => {
  const { t } = useTranslation();
  const { data: meDetail, isLoading } = useApiV1UserMeDetailGetMeDetailQuery();

  if (isLoading || !meDetail) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack
        sx={{
          height: "100%",
          width: 250,
        }}
      >
        <Stack
          direction="row"
          sx={{ py: 1, px: 2, gap: 1, alignItems: "center", justifyContent: "start" }}
        >
          <Avatar
            sizes="small"
            alt={meDetail.name ?? "Unnamed User"}
            src={meDetail.avatar_url ?? ""}
            sx={{ width: 24, height: 24 }}
          />
          <Typography
            component="p"
            variant="h6"
          >
            {meDetail.name ?? "Unnamed User"}
          </Typography>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
          >
            {t("common.button.logout")}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};
