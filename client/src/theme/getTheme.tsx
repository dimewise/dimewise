import type { } from "@mui/material/themeCssVarsAugmentation";
import type { PaletteMode, ThemeOptions } from "@mui/material";
import { getDesignTokens } from "./themePrimitives";
import {
	inputsCustomizations,
	dataDisplayCustomizations,
	feedbackCustomizations,
	navigationCustomizations,
	surfacesCustomizations,
} from "./customizations";

export const getTheme = (mode: PaletteMode): ThemeOptions => {
	return {
		...getDesignTokens(mode),
		components: {
			...inputsCustomizations,
			...dataDisplayCustomizations,
			...feedbackCustomizations,
			...navigationCustomizations,
			...surfacesCustomizations,
		},
	};
};
