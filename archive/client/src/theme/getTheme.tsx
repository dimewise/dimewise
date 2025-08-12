import type { PaletteMode, ThemeOptions } from "@mui/material";
import type {} from "@mui/material/themeCssVarsAugmentation";
import {
  dataDisplayCustomizations,
  feedbackCustomizations,
  navigationCustomizations,
  surfacesCustomizations,
} from "./customizations";
import { getDesignTokens } from "./themePrimitives";

export const getTheme = (mode: PaletteMode): ThemeOptions => {
  return {
    ...getDesignTokens(mode),
    components: {
      // ...dataDisplayCustomizations,
      // ...feedbackCustomizations,
      // ...navigationCustomizations,
      // ...surfacesCustomizations,
    },
  };
};
