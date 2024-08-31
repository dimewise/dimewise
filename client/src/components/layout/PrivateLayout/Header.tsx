import Stack from "@mui/material/Stack";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { NavbarBreadcrumbs } from "../../Dashboard/NavbarBreadcrumbs";
import { Search } from "../../Dashboard/Search";
import { CustomDatePicker } from "../../Dashboard/CustomDatePicker";
import { MenuButton } from "../../MenuButton";
import { ToggleColorMode } from "../../Home/ToggleMode";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { toggleMode } from "../../../store/themeSlice";

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
