import { Dialog, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

interface Props {
	title: string;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const DesktopDialog = ({ title, open, setOpen, children }: PropsWithChildren<Props>) => {
	const handleCloseDialog = () => {
		setOpen(false);
	};
	return (
		<Dialog
			open={open}
			onClose={handleCloseDialog}
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
