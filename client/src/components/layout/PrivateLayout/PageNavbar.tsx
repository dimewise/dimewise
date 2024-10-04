import { Stack, Typography, alpha } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
	title: string;
	secondaryAction?: ReactNode;
	secondaryTitle?: ReactNode;
}

export const PageNavbar = ({ title, secondaryAction, secondaryTitle }: Props) => {
	return (
		<Stack
			sx={(theme) => ({
				position: "sticky",
				top: 0,
				backgroundColor: alpha(theme.palette.background.default, 1),
				py: 2,
				zIndex: 1,
			})}
			gap={2}
			direction="column"
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<Typography
					component="h2"
					variant="h6"
				>
					{title}
				</Typography>
				{secondaryAction && secondaryAction}
			</Stack>
			{secondaryTitle && secondaryTitle}
		</Stack>
	);
};
