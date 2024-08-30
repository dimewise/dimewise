import { Link, Outlet } from "react-router-dom";
import { Routes } from "../../Routes";
import { Box, Button, IconButton } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { ToggleColorMode } from "../Home/ToggleMode";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { toggleMode } from "../../store/themeSlice";

export const AuthLayout = () => {
	const dispatch = useDispatch();
	const mode = useSelector((state: RootState) => state.theme.mode);

	const handleToggleMode = () => {
		dispatch(toggleMode());
	};

	return (
		<>
			<Box
				sx={{
					position: "absolute",
					top: 0,
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					p: 2,
				}}
			>
				<Button
					variant="text"
					size="small"
					aria-label="Back to templates"
					startIcon={<ArrowBackRoundedIcon />}
					component={Link}
					to={Routes.Root}
					sx={{ display: { xs: "none", sm: "flex" } }}
				>
					Back to home
				</Button>
				<IconButton
					size="small"
					aria-label="Back to templates"
					component={Link}
					to={Routes.Root}
					sx={{ display: { xs: "auto", sm: "none" } }}
				>
					<ArrowBackRoundedIcon />
				</IconButton>
				<ToggleColorMode
					mode={mode}
					toggleColorMode={handleToggleMode}
				/>
			</Box>
			<Outlet />
		</>
	);
};
