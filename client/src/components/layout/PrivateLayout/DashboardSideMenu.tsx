import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { DimewiseIcon } from "../../../assets/icons/DimewiseIcon";
import { useApiV1UserMeDetailGetMeDetailQuery } from "../../../services/api/v1";
import type { RootState } from "../../../store";
import { MenuContent } from "./MenuContent";
import { OptionsMenu } from "./OptionsMenu";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export const DashboardSideMenu = () => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const { data: meDetail, isLoading } = useApiV1UserMeDetailGetMeDetailQuery();

  if (isLoading || !meDetail) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
        <DimewiseIcon
          mode={mode}
          height={30}
          width={drawerWidth}
        />
      </Box>
      <MenuContent />
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sizes="small"
          alt={meDetail.name ?? "Unnamed User"}
          src={meDetail.avatar_url ?? ""}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            {meDetail.name ?? "Unnamed User"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary" }}
          >
            {meDetail.email}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
};
