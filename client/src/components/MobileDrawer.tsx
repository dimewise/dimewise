import { DialogContent, DialogTitle, Drawer } from "@mui/material";
import type { PropsWithChildren } from "react";

interface Props {
	title: string;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const MobileDrawer = ({ title, open, setOpen, children }: PropsWithChildren<Props>) => {
	const handleCloseDrawer = () => {
		setOpen(false);
	};

	return (
		<Drawer
			open={open}
			onClose={handleCloseDrawer}
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
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{children}</DialogContent>
		</Drawer>
	);
};
