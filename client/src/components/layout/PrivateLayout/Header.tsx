import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Stack from "@mui/material/Stack";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { toggleMode } from "../../../store/themeSlice";
import { CustomDatePicker } from "../../Dashboard/CustomDatePicker";
import { NavbarBreadcrumbs } from "../../Dashboard/NavbarBreadcrumbs";
import { Search } from "../../Dashboard/Search";
import { ToggleColorMode } from "../../Home/ToggleMode";
import { MenuButton } from "../../MenuButton";

export const Header = () => {
	const dispatch = useDispatch();
	const mode = useSelector((state: RootState) => state.theme.mode);

	const handleToggleMode = () => {
		dispatch(toggleMode());
	};

	return (
		<Stack
			direction="row"
			sx={{
				display: { xs: "none", md: "flex" },
				width: "100%",
				alignItems: { xs: "flex-start", md: "center" },
				justifyContent: "space-between",
				maxWidth: { sm: "100%", md: "1700px" },
				pt: 1.5,
				px: 3,
			}}
			spacing={2}
		>
			<NavbarBreadcrumbs />
			<Stack
				direction="row"
				sx={{ gap: 1 }}
			>
				<Search />
				<CustomDatePicker />
				<MenuButton
					showBadge
					aria-label="Open notifications"
				>
					<NotificationsRoundedIcon />
				</MenuButton>
				<ToggleColorMode
					mode={mode}
					toggleColorMode={handleToggleMode}
				/>
			</Stack>
		</Stack>
	);
};
