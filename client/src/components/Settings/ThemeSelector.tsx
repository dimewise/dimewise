import { Box, Divider, Switch, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { toggleMode } from "../../store/themeSlice";

export const ThemeSelector = () => {
	const dispatch = useDispatch();
	const mode = useSelector((state: RootState) => state.theme.mode);

	const handleToggleMode = () => {
		dispatch(toggleMode());
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center" }}>
			<Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>Theme</Typography>
			<Divider />
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
				<Typography>Dark Mode</Typography>
				<Switch
					checked={mode === "dark"}
					onChange={handleToggleMode}
				/>
			</Box>
		</Box>
	);
};
