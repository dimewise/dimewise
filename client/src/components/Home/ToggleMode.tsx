import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import type { PaletteMode } from "@mui/material/styles";

import ModeNightRoundedIcon from "@mui/icons-material/ModeNightRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";

interface ToggleColorModeProps extends IconButtonProps {
	mode: PaletteMode;
	toggleColorMode: () => void;
}

export const ToggleColorMode = ({ mode, toggleColorMode, ...props }: ToggleColorModeProps) => {
	return (
		<IconButton
			onClick={toggleColorMode}
			color="primary"
			aria-label="Theme toggle button"
			size="small"
			{...props}
		>
			{mode === "dark" ? <WbSunnyRoundedIcon fontSize="small" /> : <ModeNightRoundedIcon fontSize="small" />}
		</IconButton>
	);
};
