import { Dialog, DialogContent, DialogTitle } from "@mui/material";
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
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{children}</DialogContent>
		</Dialog>
	);
};
