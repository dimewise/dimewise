import { Dialog, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

interface Props {
	title: string;
	open: boolean;
	handleClose: () => void;
}

export const DesktopDialog = ({ title, open, handleClose, children }: PropsWithChildren<Props>) => {
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth
			maxWidth="sm"
			sx={{
				display: { xs: "none", md: "block" },
			}}
		>
			<DialogTitle>
				<Typography
					variant="h4"
					component="h1"
				>
					{title}
				</Typography>
			</DialogTitle>
			<Divider sx={{ border: 1 }} />
			<DialogContent>{children}</DialogContent>
		</Dialog>
	);
};
