import { DialogContent, DialogTitle, Drawer } from "@mui/material";
import type { PropsWithChildren } from "react";

interface Props {
  title: string;
  open: boolean;
  handleClose: () => void;
}

export const MobileDrawer = ({ title, open, handleClose, children }: PropsWithChildren<Props>) => {
  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="bottom"
      sx={{
        display: { md: "none" },
      }}
      PaperProps={{
        style: {
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        },
      }}
    >
      <DialogTitle sx={{ mt: 1 }}>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Drawer>
  );
};
