import Stack from "@mui/material/Stack";
import { NavbarBreadcrumbs } from "../../Dashboard/NavbarBreadcrumbs";

export const Header = () => {
	return (
		<Stack
			direction="row"
			sx={{
				display: { xs: "none", md: "flex" },
				width: "100%",
				alignItems: { xs: "flex-start", md: "center" },
				justifyContent: "space-between",
				maxWidth: { sm: "100%", md: "1700px" },
				pt: 3,
				px: 3,
			}}
			spacing={2}
		>
			<NavbarBreadcrumbs />
		</Stack>
	);
};
